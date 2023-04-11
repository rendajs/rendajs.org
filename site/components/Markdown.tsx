import { micromark } from "npm:micromark@3.1.0";
import { gfmAutolinkLiteral, gfmAutolinkLiteralHtml } from "npm:micromark-extension-gfm-autolink-literal@1.0.3";

export function Markdown({
	markdown,
}: {
	markdown: string;
}) {
	const html = micromark(markdown, {
		extensions: [gfmAutolinkLiteral],
		htmlExtensions: [gfmAutolinkLiteralHtml],
	});
	return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
