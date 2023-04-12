import type { Plugin } from "npm:unified@10.1.2";
import type { Content, Paragraph, PhrasingContent, Root } from "npm:@types/mdast@3.0.11";
import type { Node, Parent } from "npm:@types/unist@2.0.6";
import type { map as mapSignature } from "npm:unist-util-map@3.1.3";

const noteTypes = ["note"];

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

function createNoteNode(noteType: string, children: PhrasingContent[] = []) {
	const node: Parent = {
		type: "wrapper",
		children,
		data: {
			hName: "div",
			hProperties: {
				class: noteType,
			},
		},
	};
	return node;
}

export const remarkNotesPlugin: Plugin<[], Root, Root> = function () {
	return (tree) => {
		// Find all paragraphs that start with a note type, i.e:
		// NOTE: This is a note
		tree = map(tree, (node) => {
			if (node.type != "paragraph") return node;
			if (node.children.length < 1) return node;
			const castNode = node as Paragraph;

			const [child, ...siblings] = castNode.children;
			if (!("value" in child)) return node;
			for (const noteType of noteTypes) {
				const searchString = noteType.toUpperCase() + ": ";
				if (child.value.startsWith(searchString)) {
					const newValue = child.value.slice(searchString.length);
					const newChild = {
						type: child.type,
						value: newValue,
					};
					return createNoteNode(noteType, [newChild, ...siblings]) as Content;
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
							if (textNode.value == noteType.toUpperCase() + ":") {
								depth++;
								addNode = false;
								if (depth == 1) {
									currentNoteNode = createNoteNode(noteType);
									newChildren.push(currentNoteNode);
								}
							} else if (textNode.value == "END " + noteType.toUpperCase()) {
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
