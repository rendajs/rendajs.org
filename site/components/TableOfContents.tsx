export interface TableOfContentsIndex {
	title: string;
	destination?: string;
	children?: (TableOfContentsIndex)[];
}

interface TableOfContentsOptions {
	index: TableOfContentsIndex;
}

export function TableOfContents({ index }: TableOfContentsOptions) {
	if (!index.children) return <nav></nav>;
	return (
		<nav class="table-of-contents">
			<ul>
				{getChildren(index.children)}
			</ul>
		</nav>
	);
}

function TableOfContentsItem({ index }: TableOfContentsOptions) {
	const children = [];
	if (index.destination) {
		children.push(
			<a href={index.destination}>{index.title}</a>,
		);
	} else {
		children.push(index.title);
	}
	if (index.children) {
		children.push(
			<ul>
				{getChildren(index.children)}
			</ul>,
		);
	}
	return <li>{children}</li>;
}

function getChildren(children: TableOfContentsIndex[]) {
	return children.map((child) => {
		return <TableOfContentsItem index={child} />;
	});
}
