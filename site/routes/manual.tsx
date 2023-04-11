import type { RouteHandler } from "../../main.tsx";
import { Markdown } from "../components/Markdown.tsx";
import * as path from "$std/path/mod.ts";
import * as yaml from "$std/yaml/mod.ts";

interface ManualIndex {
	mainPage?: string;
	pages: string[];
}

const manualRepositoryDir = path.resolve(Deno.env.get("MANUAL_REPOSITORY_DIR") || "../manual");
const manualContentDir = path.resolve(manualRepositoryDir, "manual/en");

/**
 * Resolves paths from a `/manual` url or from links inside markdown files to an absolute path on disk.
 * @param basePath The path to the current markdown file to resolve from.
 * @param manualPath The path to resolve to.
 */
function resolveManualUrlToPath(basePath: string, manualPath: string, {
	appendMd = true,
} = {}) {
	let resolved = path.resolve(basePath, manualPath);
	if (appendMd && !resolved.endsWith(".md")) {
		resolved += ".md";
	}
	return resolved;
}

/**
 * Takes the absolute path to a file and converts it to a `/manual` url
 * that the user would have to visit in order to view this file.
 */
function resolveManualPathToUrl(absoluteMarkdownPath: string) {
	let relative = path.relative(manualContentDir, absoluteMarkdownPath);
	if (relative.endsWith(".md")) {
		relative = relative.slice(0, -3);
	}
	return `/manual/${relative}`;
}

export const manual: RouteHandler = {
	pattern: new URLPattern({
		pathname: "/manual/:path*",
	}),
	async handler(request, patternResult) {
		const urlPath = patternResult.pathname.groups.path;
		let markdownPath = resolveManualUrlToPath(manualContentDir, urlPath);
		const potentialDirPath = resolveManualUrlToPath(manualContentDir, urlPath, { appendMd: false });
		let statResult;
		try {
			statResult = await Deno.stat(potentialDirPath);
		} catch (e) {
			if (e instanceof Deno.errors.NotFound) {
				// If it doesn't exist it likely is not a directory and .md needs to be added.
			} else {
				throw e;
			}
		}
		if (statResult && statResult.isDirectory) {
			const indexPath = path.resolve(potentialDirPath, "index.yml");
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
				markdownPath = resolveManualUrlToPath(potentialDirPath, indexData.mainPage);
			} else {
				const firstPage = indexData.pages[0];
				if (!firstPage) {
					return null;
				}
				const redirectAbsolutePath = resolveManualUrlToPath(potentialDirPath, firstPage);
				const redirectUrl = resolveManualPathToUrl(redirectAbsolutePath);
				return {
					redirect: redirectUrl,
				};
			}
		}
		let markdown;
		try {
			markdown = await Deno.readTextFile(markdownPath);
		} catch (e) {
			if (e instanceof Deno.errors.NotFound) {
				return null;
			}
			throw e;
		}

		return (
			<main>
				<Markdown markdown={markdown} />
			</main>
		);
	},
};
