import type { Plugin } from "npm:unified@10.1.2";
import type { Content, Root } from "npm:@types/mdast@3.0.11";
import { visit } from "npm:unist-util-visit@4.1.2";
import find from "npm:unist-util-find@1.0.2";
import { unified } from "npm:unified@10.1.2";
import remarkParse from "npm:remark-parse@10.0.1";
import remarkStringify from "npm:remark-stringify@10.0.2";
import remarkRehype from "npm:remark-rehype@10.1.0";
import rehypeStringify from "npm:rehype-stringify@9.0.3";
import { assert } from "$std/testing/asserts.ts";

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
	.use(remarkRewriteUrls) // rewrite urls
	.use(remarkRehype) // convert mdast to html ast (hast)
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

const remarkFilterFirstHeader: Plugin<[], Root, Root> = function () {
	return (tree) => {
		const node = find(tree, (node: Content) => node.type == "heading" && node.depth == 1);
		const newRoot: Root = {
			type: "root",
			children: node?.children || [],
		};
		return newRoot;
	};
};

const getTitleProcessor = unified()
	.use(remarkParse)
	.use(remarkFilterFirstHeader)
	.use(remarkStringify);

export function getTitle(markdown: string) {
	return getTitleProcessor.processSync(markdown).toString();
}
