import { serve } from "$std/http/server.ts";
import { renderToString } from "npm:preact-render-to-string@6.0.2";

const port = parseInt(Deno.env.get("PORT") || "0", 10);

const page = (
	<div>
		<p>As you can see this page is very much under construction.</p>
		<p>
			Why don't you head over to <a href="https://renda.studio/">renda.studio</a> or <a href="https://github.com/rendajs">Renda on GitHub</a>.
		</p>
	</div>
);

serve(() => {
	return new Response(renderToString(page), {
		headers: {
			"content-type": "text/html; charset=utf-8",
		},
	});
}, {
	port,
});
