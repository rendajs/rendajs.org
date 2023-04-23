import type { Plugin, Transformer } from "npm:unified@10.1.2";
import type { Content, Root } from "npm:@types/mdast@3.0.11";
import { visit } from "npm:unist-util-visit@4.1.2";
import find from "npm:unist-util-find@1.0.2";
import { unified } from "npm:unified@10.1.2";
import gfm from "npm:remark-gfm@3.0.1";
import remarkParse from "npm:remark-parse@10.0.1";
import remarkStringify from "npm:remark-stringify@10.0.2";
import rehypeSlug from "npm:rehype-slug@5.1.0";
import rehypeAutolinkHeadings from "npm:rehype-autolink-headings@6.1.1";
import remarkRehype from "npm:remark-rehype@10.1.0";
import rehypeStringify from "npm:rehype-stringify@9.0.3";
import { toString as mdastToString } from "npm:mdast-util-to-string@3.2.0";
import rehypeHighlight from "https://cdn.jsdelivr.net/npm/rehype-highlight@6.0.0/+esm";
import { remarkNotesPlugin } from "./remarkNotesPlugin.ts";
import { assert } from "$std/testing/asserts.ts";

const castRehypeHighlight = rehypeHighlight as unknown as () => Transformer<Root, Root>;

let currentRewriteUrlHook = (url: string) => url;

const remarkRewriteUrls: Plugin<[], Root, Root> = function () {
	return (tree) => {
		visit(tree, ["link", "image", "definition"], (node) => {
			assert(node.type === "link" || node.type === "image" || node.type === "definition");
			node.url = currentRewriteUrlHook(node.url);
		});
	};
};

const mdProcessor = unified()
	.use(remarkParse) // parse markdown into an ast (mdast)
	.use(gfm) // GitHub flavored markdown is required for hints
	.use(remarkRewriteUrls) // rewrite urls
	.use(remarkNotesPlugin) // add support for hints
	.use(remarkRehype) // convert mdast to html ast (hast)
	.use(rehypeSlug) // add ids to headings
	.use(rehypeAutolinkHeadings, { // add clickable anchors to headings
		properties: {
			class: ["heading-link"],
		},
		content() {
			return [
				{
					type: "text",
					value: "#",
				},
			];
		},
	})
	.use(castRehypeHighlight) // highlight code blocks
	.use(rehypeStringify); // convert hast to html string

export interface MarkdownToHtmlOptions {
	markdown: string;
	rewriteUrlHook?: (url: string) => string;
}

export function markdownToHtml({
	markdown,
	rewriteUrlHook = (url) => url,
}: MarkdownToHtmlOptions) {
	currentRewriteUrlHook = rewriteUrlHook;
	return mdProcessor.processSync(markdown).toString();
}

/**
 * Plugin that extracts data from a markdown file such as the first heading, and the first paragraph.
 */
const remarkExtractData: Plugin<[], Root, Root> = function () {
	return (tree, file) => {
		const firstHeading = find(tree, (node: Content) => node.type == "heading" && node.depth == 1);
		const firstParagraph = find(tree, (node: Content) => node.type == "paragraph");
		file.data.firstHeading = mdastToString(firstHeading);
		file.data.firstParagraph = mdastToString(firstParagraph).replaceAll("\n", " ");
	};
};

const getTitleProcessor = unified()
	.use(remarkParse)
	.use(remarkExtractData)
	.use(remarkStringify);

export function getMarkdownData(markdown: string) {
	const data = getTitleProcessor.processSync(markdown).data;
	return {
		title: data.firstHeading as string,
		text: data.firstParagraph as string,
	};
}
