export interface TableOfContentsIndex {
	title: string;
	destination?: string;
	children?: (TableOfContentsIndex)[];
}

interface TableOfContentsOptions {
	index: TableOfContentsIndex;
	activePath?: string;
}

export function TableOfContents(options: TableOfContentsOptions) {
	if (!options.index.children) return <nav></nav>;
	return (
		<nav class="table-of-contents">
			<ul>
				{getChildren(options)}
			</ul>
		</nav>
	);
}

function TableOfContentsItem(options: TableOfContentsOptions) {
	const children = [];
	if (options.index.destination) {
		const active = options.index.destination == options.activePath;
		children.push(
			<a href={options.index.destination} class={active ? "active" : ""}>{options.index.title}</a>,
		);
	} else {
		children.push(options.index.title);
	}
	if (options.index.children) {
		children.push(
			<ul>
				{getChildren(options)}
			</ul>,
		);
	}
	return <li>{children}</li>;
}

function getChildren(options: TableOfContentsOptions) {
	if (!options.index.children) return [];
	return options.index.children.map((child) => {
		return <TableOfContentsItem index={child} activePath={options.activePath} />;
	});
}
