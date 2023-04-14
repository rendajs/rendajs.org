import type { JSX } from "$preact";
import { isValidElement } from "$preact";
import { serve, Status } from "$std/http/mod.ts";
import { renderToString } from "npm:preact-render-to-string@6.0.2";
import renderToStringPretty from "npm:preact-render-to-string@6.0.2/jsx";
import { Header } from "./site/components/Header.tsx";
import { landingPage } from "./site/routes/landingPage.tsx";
import { staticHandler } from "./site/routes/static.ts";
import { manual, setRepositoryDir } from "./site/routes/manual.tsx";
import { notFoundHandler } from "./site/routes/404.tsx";
import * as path from "$std/path/mod.ts";
import { setCwd } from "https://deno.land/x/chdir_anywhere@v0.0.2/mod.js";
setCwd();

const port = parseInt(Deno.env.get("PORT") || "0", 10);
const pretty = Deno.env.get("PRETTY") === "true";

const manualRepositoryDir = path.resolve(Deno.env.get("MANUAL_REPOSITORY_DIR") || "../manual");
setRepositoryDir(manualRepositoryDir);

export interface RouteResult {
	redirect?: string;
	page?: JSX.Element;
	status?: Status;
	cssUrls?: string[];
	pageTitle?: string;
}
export type RouteHandlerResult = JSX.Element | null | RouteResult | Response;

export interface RouteHandler {
	pattern: URLPattern;
	handler: (request: Request, patternResult: URLPatternResult) => RouteHandlerResult | Promise<RouteHandlerResult>;
}

const handlers: Set<RouteHandler> = new Set();
handlers.add(landingPage);
handlers.add(staticHandler);
handlers.add(manual);

serve(async (request) => {
	let page = null;
	const cssUrls = [
		"main.css",
	];
	let pageTitle = "Renda";
	for (const handler of handlers) {
		const result = handler.pattern.exec(request.url);
		if (result) {
			page = await handler.handler(request, result);
			break;
		}
	}
	if (!page) {
		page = notFoundHandler();
	}
	if (page instanceof Response) {
		return page;
	}
	let status = Status.OK;
	if (!isValidElement(page)) {
		const result = page as RouteResult;
		if (result.redirect) {
			return new Response(null, {
				status: Status.Found,
				headers: {
					location: result.redirect,
				},
			});
		}
		if (result.status) {
			status = result.status;
		}
		if (result.pageTitle) {
			pageTitle = result.pageTitle;
		}
		cssUrls.push(...result.cssUrls || []);
		page = result.page;
	}
	if (!page) {
		throw new Error("Assertion failed, no page was returned from handler.");
	}
	const renderFunction = pretty ? renderToStringPretty : renderToString;
	const rendered = renderFunction(
		<html lang="en">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>{pageTitle}</title>
				{cssUrls.map((url) => {
					return <link rel="stylesheet" href={`/static/${url}`} type="text/css" />;
				})}
			</head>
			<body>
				<Header />
				{page}
			</body>
		</html>,
	);

	return new Response("<!DOCTYPE html>" + rendered, {
		status,
		headers: {
			"content-type": "text/html; charset=utf-8",
		},
	});
}, {
	port,
});
