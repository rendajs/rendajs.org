import type { RouteResult } from "../../main.tsx";

export function notFoundHandler(): RouteResult {
	return {
		status: 404,
		page: <h1>404</h1>,
	};
}
