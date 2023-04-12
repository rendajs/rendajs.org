import type { RouteHandler } from "../../main.tsx";
import { serveDir } from "$std/http/file_server.ts";

const staticRoot = new URL("../static", import.meta.url).pathname;
console.log(staticRoot);

export const staticHandler: RouteHandler = {
	pattern: new URLPattern({ pathname: "/static/*" }),
	async handler(request) {
		return await serveDir(request, {
			quiet: true,
			fsRoot: staticRoot,
			urlRoot: "static/",
		});
	},
};
