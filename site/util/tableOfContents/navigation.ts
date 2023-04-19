import type { TableOfContentsIndex } from "../../components/TableOfContents.tsx";

/**
 * Returns an array of parent nodes, starting from the root node and ending at the destination.
 * Returns null when no destination was found.
 */
function findParentChain(index: TableOfContentsIndex, currentDestination: string): TableOfContentsIndex[] | null {
	if (index.destination === currentDestination) {
		return [index];
	}
	if (index.children) {
		for (const child of index.children) {
			const result = findParentChain(child, currentDestination);
			if (result) {
				return [index, ...result];
			}
		}
	}
	return null;
}

/**
 * Recurses down the tree and finds the first item that has a destination.
 */
function findFirstChildDestination(index: TableOfContentsIndex): string | null {
	if (index.destination) return index.destination;
	if (index.children) {
		const firstChild = index.children.at(0);
		if (firstChild) {
			return findFirstChildDestination(firstChild);
		}
	}
	return null;
}

/**
 * Finds the destination that should be used for the 'next page' button.
 */
export function findNextDestination(index: TableOfContentsIndex, currentDestination: string): string | null {
	const parentChain = findParentChain(index, currentDestination);
	if (!parentChain || parentChain.length == 0) return null;

	// If the current destination has children, use the first child
	const currentDestinationNode = parentChain.at(-1);
	if (currentDestinationNode?.children) {
		const firstChild = currentDestinationNode.children.at(0);
		if (firstChild?.destination) {
			return firstChild.destination;
		}
	}

	let parentIndex = parentChain.length;
	while (true) {
		parentIndex--;
		if (parentIndex <= 0) break;
		const child = parentChain[parentIndex];
		const parent = parentChain[parentIndex - 1];
		const siblings = parent.children;
		if (!siblings) continue;
		const nextPageSiblingIndex = siblings.indexOf(child) + 1;
		if (nextPageSiblingIndex >= siblings.length) continue;
		const nextPageSibling = siblings[nextPageSiblingIndex];
		return findFirstChildDestination(nextPageSibling);
	}

	return null;
}

/**
 * Recurses down the tree and finds the last item that has a destination.
 */
function findLastChildDestination(index: TableOfContentsIndex): string | null {
	if (index.children) {
		const lastChild = index.children.at(-1);
		if (lastChild) {
			return findLastChildDestination(lastChild);
		}
	}
	if (index.destination) return index.destination;
	return null;
}

/**
 * Finds the destination that should be used for the 'previous page' button.
 */
export function findPreviousDestination(index: TableOfContentsIndex, currentDestination: string): string | null {
	const parentChain = findParentChain(index, currentDestination);
	if (!parentChain || parentChain.length == 0) return null;

	let parentIndex = parentChain.length;
	while (true) {
		parentIndex--;
		if (parentIndex <= 0) break;
		const child = parentChain[parentIndex];
		const parent = parentChain[parentIndex - 1];
		const siblings = parent.children;
		if (!siblings) continue;
		const previousPageSiblingIndex = siblings.indexOf(child) - 1;
		if (previousPageSiblingIndex < 0) {
			if (parent.destination) return parent.destination;
			continue;
		}
		const previousPageSibling = siblings[previousPageSiblingIndex];
		return findLastChildDestination(previousPageSibling);
	}

	return null;
}
