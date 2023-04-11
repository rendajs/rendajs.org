import type { RouteHandler } from "../../main.tsx";

export const landingPage: RouteHandler = {
	pattern: new URLPattern({
		pathname: "/",
	}),
	handler() {
		return <div>Welcome!</div>;
	},
};
