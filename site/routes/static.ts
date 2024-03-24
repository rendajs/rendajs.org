import type { RouteHandler } from "../../main.tsx";
import { serveDir } from "$std/http/file_server.ts";

const staticRoot = new URL("../static", import.meta.url).pathname;

export const staticHandler: RouteHandler = {
	pattern: new URLPattern({ pathname: "/static/*" }),
	async handler(request) {
		const response = await serveDir(request, {
			quiet: true,
			fsRoot: staticRoot,
			urlRoot: "static/",
		});
		const contentType = response.headers.get("Content-Type");
		// For now we'll only cache svg requests since we might want to make changes to .js and .css files.
		// In production, css and js files are inlined in the html, so these resources aren't requested anyway.
		if (contentType?.startsWith("image/svg")) {
			const thirtyDays = 60 * 60 * 24 * 30;
			response.headers.set("Cache-Control", `public, max-age=${thirtyDays}, stale-while-revalidate=${thirtyDays}`);
		}
		return response;
	},
};
