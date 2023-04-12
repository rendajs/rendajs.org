import type { Plugin } from "npm:unified@10.1.2";
import type { Root } from "npm:@types/mdast@3.0.11";
import { visit } from "npm:unist-util-visit@4.1.2";
import { unified } from "npm:unified@10.1.2";
import remarkParse from "npm:remark-parse@10.0.1";
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

export function Markdown({
	markdown,
	rewriteUrlHook = (url) => url,
}: {
	markdown: string;
	rewriteUrlHook?: (url: string) => string;
}) {
	currentRewriteUrlHook = rewriteUrlHook;
	const html = mdProcessor.processSync(markdown).toString();
	return <div dangerouslySetInnerHTML={{ __html: html }}></div>;
}
