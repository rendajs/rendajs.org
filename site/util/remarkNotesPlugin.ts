import type { Plugin } from "npm:unified@10.1.2";
import type { Content, Paragraph, PhrasingContent, Root, Strong, Text } from "npm:@types/mdast@3.0.11";
import type { Node, Parent } from "npm:@types/unist@2.0.6";
import type { map as mapSignature } from "npm:unist-util-map@3.1.3";

interface NoteTypeConfig {
	/** The token that is search for in the markdown to identify the note type. */
	token: string;
	/** The class that is added to the <aside> tag. */
	class: string;
	/** Bold text node that will be added to the start of the node. */
	prefixText: string;
}

const noteTypes: NoteTypeConfig[] = [
	{
		prefixText: "Note:",
		class: "note",
		token: "NOTE",
	},
	{
		prefixText: "Warning!",
		class: "warning",
		token: "WARNING",
	},
];

// github.com/syntax-tree/unist-util-map but with child replacement
const map = ((tree, iteratee) => {
	const castIteratee = iteratee as unknown as (node: Node, index: number | null, parent: Node | null) => Node;
	function preorder(node: Node, index: number | null, parent: Node | null): Node {
		const newNode = castIteratee(node, index, parent) as Parent;

		if ("children" in newNode) {
			newNode.children = newNode.children.map((child, index) => {
				return preorder(child, index, node);
			});
		}

		return newNode;
	}

	return preorder(tree, null, null) as Root;
}) as typeof mapSignature;

function createNoteNode(classProperty: string, children: PhrasingContent[] = []) {
	const node: Parent = {
		type: "wrapper",
		children,
		data: {
			hName: "aside",
			hProperties: {
				class: classProperty,
			},
		},
	};
	return node;
}

function insertNoteText(prefixText: string, node: Node) {
	if (!("children" in node)) return;
	if (!Array.isArray(node.children)) return;
	const strongChild: Strong = {
		type: "strong",
		children: [
			{
				type: "text",
				value: prefixText,
			},
		],
	};
	const spaceChild: Text = {
		type: "text",
		value: " ",
	};
	node.children.unshift(strongChild, spaceChild);
}

export const remarkNotesPlugin: Plugin<[], Root, Root> = function () {
	return (tree) => {
		console.log(tree);
		// Find all paragraphs that start with a note type, i.e:
		// NOTE: This is a note
		tree = map(tree, (node) => {
			if (node.type != "paragraph") return node;
			if (node.children.length < 1) return node;
			const castNode = node as Paragraph;

			const [child, ...siblings] = castNode.children;
			if (!("value" in child)) return node;
			for (const noteType of noteTypes) {
				const searchString = noteType.token + ": ";
				if (child.value.startsWith(searchString)) {
					const newValue = child.value.slice(searchString.length);
					const newChild = {
						type: child.type,
						value: newValue,
					};
					const noteNode = createNoteNode(noteType.class, [newChild, ...siblings]);
					insertNoteText(noteType.prefixText, noteNode);
					return noteNode as Content;
				}
			}

			return node;
		});

		// Find all paragraphs that are wrapped around note types, i.e:
		// NOTE:
		//
		// Paragraph
		//
		// Other paragraph
		//
		// END NOTE
		tree = map(tree, (node) => {
			if (!("children" in node)) return node;

			for (const noteType of noteTypes) {
				const newChildren: Node[] = [];
				let depth = 0;
				let currentNoteNode: Parent | null = null;
				for (const child of node.children) {
					let addNode = true;
					if (child.type == "paragraph") {
						const textNode = child.children[0];
						if ("value" in textNode) {
							if (textNode.value == noteType.token + ":") {
								depth++;
								addNode = false;
								if (depth == 1) {
									currentNoteNode = createNoteNode(noteType.class);
									newChildren.push(currentNoteNode);
								}
							} else if (textNode.value == "END " + noteType.token) {
								depth--;
								addNode = false;
								if (depth == 0) {
									currentNoteNode = null;
								}
							}
						}
					}
					if (addNode) {
						if (currentNoteNode) {
							if (currentNoteNode.children.length == 0) {
								insertNoteText(noteType.prefixText, child);
							}
							currentNoteNode.children.push(child);
						} else {
							newChildren.push(child);
						}
					}
				}
				node.children = newChildren as Content[];
			}
			return node;
		});
		return tree;
	};
};
