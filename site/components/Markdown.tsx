import { markdownToHtml, MarkdownToHtmlOptions } from "../util/markdown.ts";

export function Markdown(options: MarkdownToHtmlOptions) {
	const html = markdownToHtml(options);
	return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
}
