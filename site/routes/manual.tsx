import type { JSX } from "$preact";
import type { RouteHandler, RouteHandlerResult, RouteResult } from "../../main.tsx";
import { Markdown } from "../components/Markdown.tsx";
import * as path from "$std/path/mod.ts";
import * as yaml from "$std/yaml/mod.ts";
import { isRelativeUrl } from "../util/isRelativeUrl.ts";
import { TableOfContents, TableOfContentsIndex } from "../components/TableOfContents.tsx";
import { getMarkdownData } from "../util/markdown.ts";
import { NavigationButton } from "../components/NavigationButton.tsx";
import { NavigationArrow } from "../components/NavigationArrow.tsx";
import { findNextDestination, findPreviousDestination } from "../util/tableOfContents/navigation.ts";

interface ManualIndex {
	title?: string;
	mainPage?: string;
	pages?: string[];
}

const INDEX_FILENAME = "index.yml";

let manualContentDir: string | null = null;
export function setRepositoryDir(dir: string) {
	manualContentDir = path.resolve(dir, "manual/en");
}

function getContentDir() {
	if (manualContentDir === null) {
		throw new Error("Manual content directory not set");
	}
	return manualContentDir;
}

/**
 * Takes the absolute path to a file and converts it to a `/manual` url
 * that the user would have to visit in order to view this file.
 */
function resolveManualPathToUrl(absoluteMarkdownPath: string) {
	let relative = path.relative(getContentDir(), absoluteMarkdownPath);
	if (relative.endsWith(".md")) {
		relative = relative.slice(0, -3);
	}
	return `/manual/${relative}`;
}

interface ResolveDirOrFileResult {
	/**
	 * The file that should be displayed to the user when visiting the path.
	 * If a directory is provided and its index contains a main page, this will point to the main page.
	 * Otherwise this will not be set.
	 */
	displayPath?: string;
	/**
	 * If a directory is provided and its index contains no main page, this will be the path to the first page.
	 * The user should be redirected to this path.
	 */
	redirectPath?: string;
	/**
	 * If the path points to a directory with an index.yml file, this will be the path to that directory.
	 */
	dirPath?: string;
}

/**
 * Resolves paths from a `/manual` url or from links inside markdown files to a destination file.
 * If the path is a directory, it will resolve to either the main page or the first page.
 * If the path is already a file, it will resolve to that file.
 * Returns null if no file or directory is found.
 */
async function resolveManualPath(basePath: string, relativePath: string): Promise<ResolveDirOrFileResult | null> {
	const resolved = path.resolve(basePath, relativePath);
	let statResult;
	try {
		statResult = await Deno.stat(resolved);
	} catch (e) {
		if (e instanceof Deno.errors.NotFound) {
			let resolvedWithExtension = resolved;
			if (!resolvedWithExtension.endsWith(".md")) {
				resolvedWithExtension += ".md";
			}
			return {
				displayPath: resolvedWithExtension,
			};
		} else {
			throw e;
		}
	}
	if (statResult.isDirectory) {
		const indexPath = path.resolve(resolved, INDEX_FILENAME);
		let index;
		try {
			index = await Deno.readTextFile(indexPath);
		} catch (e) {
			if (e instanceof Deno.errors.NotFound) {
				return null;
			}
			throw e;
		}
		const indexData = yaml.parse(index) as ManualIndex;
		if (indexData.mainPage) {
			const result = await resolveManualPath(resolved, indexData.mainPage);
			if (result && result.displayPath) {
				return {
					dirPath: resolved,
					displayPath: result.displayPath,
				};
			}
			return null;
		} else if (indexData.pages) {
			const firstPage = indexData.pages[0];
			if (!firstPage) {
				return null;
			}
			const result = await resolveManualPath(resolved, firstPage);
			if (result && result.displayPath) {
				return {
					dirPath: resolved,
					redirectPath: result.dirPath || result.displayPath,
				};
			}
			return null;
		} else {
			return null;
		}
	}
	return {
		displayPath: resolved,
	};
}

async function getIndexPageData(absoluteIndexPath: string, relativeMarkdownPath: string) {
	const dirname = path.dirname(absoluteIndexPath);
	const resolveResult = await resolveManualPath(dirname, relativeMarkdownPath);
	let title = "";
	let destination: string | null = null;
	if (resolveResult?.displayPath) {
		let markdown;
		try {
			markdown = await Deno.readTextFile(resolveResult.displayPath);
		} catch {
			title = "NOT FOUND";
		}
		if (markdown) {
			title = getMarkdownData(markdown).title;
			destination = resolveManualPathToUrl(resolveResult.displayPath);
		}
	}
	return {
		resolveResult,
		title,
		destination,
	};
}

async function buildIndex(absoluteIndexPath: string) {
	const indexText = await Deno.readTextFile(absoluteIndexPath);
	const indexData = yaml.parse(indexText) as ManualIndex;
	const tableOfContentsIndex: TableOfContentsIndex = {
		title: "",
	};
	if (indexData.title) {
		tableOfContentsIndex.title = indexData.title;
	}
	if (indexData.mainPage) {
		const { title, destination } = await getIndexPageData(absoluteIndexPath, indexData.mainPage);
		tableOfContentsIndex.title = title;
		if (destination) {
			const dirname = path.dirname(absoluteIndexPath);
			const dirDestination = resolveManualPathToUrl(dirname);
			tableOfContentsIndex.destination = dirDestination;
		}
	}
	if (indexData.pages) {
		const children: TableOfContentsIndex[] = [];
		tableOfContentsIndex.children = children;
		for (const page of indexData.pages) {
			const { resolveResult, title, destination } = await getIndexPageData(absoluteIndexPath, page);
			const result = resolveResult;
			let child: TableOfContentsIndex | null = null;
			if (result) {
				if (result.dirPath) {
					const indexPath = path.resolve(result.dirPath, INDEX_FILENAME);
					child = await buildIndex(indexPath);
				} else {
					child = {
						title,
					};
					if (destination) child.destination = destination;
				}
			}
			if (child) children.push(child);
		}
	}
	return tableOfContentsIndex;
}

export const manual: RouteHandler = {
	pattern: new URLPattern({
		pathname: "/manual/:path*",
	}),
	async handler(request, patternResult) {
		const urlPath = patternResult.pathname.groups.path;
		const resolveData = await resolveManualPath(getContentDir(), urlPath);
		const index = await buildIndex(path.resolve(getContentDir(), INDEX_FILENAME));

		if (!resolveData) return getNotFound(index);
		if (resolveData.redirectPath) {
			return {
				redirect: resolveManualPathToUrl(resolveData.redirectPath),
			};
		}
		if (!resolveData.displayPath) return getNotFound(index);
		const displayPath = resolveData.displayPath;

		let markdown;
		try {
			markdown = await Deno.readTextFile(displayPath);
		} catch (e) {
			if (e instanceof Deno.errors.NotFound) {
				return getNotFound(index);
			}
			throw e;
		}

		function rewriteUrlHook(url: string) {
			if (url.startsWith("#") || !isRelativeUrl(url)) return url;
			const dirname = path.dirname(displayPath);
			const linkPath = path.resolve(dirname, url);
			return resolveManualPathToUrl(linkPath);
		}

		let pageTitle = "Renda Manual";
		const markdownData = getMarkdownData(markdown);
		if (markdownData.title) pageTitle = markdownData.title + " - " + pageTitle;

		const activePath = "/manual/" + urlPath;
		const previousPage = findPreviousDestination(index, activePath);
		const nextPage = findNextDestination(index, activePath);

		const result = manualHandlerResult(
			<ManualPage index={index} activePath={activePath}>
				<Markdown markdown={markdown} rewriteUrlHook={rewriteUrlHook} />
				<footer>
					<div class="page-button">
						{previousPage &&
							(
								<NavigationButton classes="navigation-button" href={previousPage}>
									<>
										<NavigationArrow direction="left" /> Previous
									</>
								</NavigationButton>
							)}
					</div>
					<div class="page-button">
						{nextPage && (
							<NavigationButton classes="navigation-button" href={nextPage}>
								<>
									Next <NavigationArrow direction="right" />
								</>
							</NavigationButton>
						)}
					</div>
				</footer>
			</ManualPage>,
		);
		result.pageTitle = pageTitle;
		result.pageDescription = markdownData.text;
		return result;
	},
};

function getNotFound(index: TableOfContentsIndex): RouteHandlerResult {
	const result = manualHandlerResult(
		<ManualPage index={index}>
			<h1>404 - Not Found</h1>
		</ManualPage>,
	);
	result.status = 404;
	result.pageTitle = "Renda Manual - 404";
	return result;
}

function manualHandlerResult(page: JSX.Element): RouteResult {
	// TODO: Remove highlighting.css when not needed to shave of 1kb
	return {
		cssUrls: ["manual.css", "highlighting.css"],
		jsUrls: ["manual.js"],
		showHamburger: true,
		page,
	};
}

function ManualPage({ index, children, activePath }: {
	index: TableOfContentsIndex;
	children: JSX.Element | JSX.Element[];
	activePath?: string;
}) {
	return (
		<div class="manual-page">
			<TableOfContents index={index} activePath={activePath} />
			<div class="table-of-contents-backdrop" />
			<main>
				{children}
			</main>
		</div>
	);
}
