import type { TableOfContentsIndex } from "../../../../../site/components/TableOfContents.tsx";
import { assertEquals } from "$std/testing/asserts.ts";
import { findPreviousDestination } from "../../../../../site/util/tableOfContents/navigation.ts";

function previousDestinationTest(testName: string, index: TableOfContentsIndex, current: string, expectedNext: string | null) {
	Deno.test({
		name: testName,
		fn() {
			const result = findPreviousDestination(index, current);
			assertEquals(result, expectedNext);
		},
	});
}

previousDestinationTest(
	"first page",
	{
		title: "A",
		children: [
			{
				title: "B",
				destination: "first",
			},
			{
				title: "C",
				destination: "next",
			},
		],
	},
	"first",
	null,
);

previousDestinationTest(
	"current destination not found",
	{
		title: "A",
		children: [
			{
				title: "B",
				destination: "first",
			},
			{
				title: "C",
				destination: "next",
			},
		],
	},
	"non existent",
	null,
);

previousDestinationTest(
	"current destination not found",
	{
		title: "A",
		children: [
			{
				title: "B",
				destination: "first",
			},
			{
				title: "C",
				destination: "next",
			},
		],
	},
	"non existent",
	null,
);

previousDestinationTest(
	"previous sibling",
	{
		title: "A",
		children: [
			{
				title: "B",
				destination: "previous",
			},
			{
				title: "C",
				destination: "current",
			},
		],
	},
	"current",
	"previous",
);

previousDestinationTest(
	"first child, parent has a destination",
	{
		title: "A",
		children: [
			{
				title: "B",
				destination: "parent",
				children: [
					{
						title: "C",
						destination: "current",
					},
				],
			},
		],
	},
	"current",
	"parent",
);

previousDestinationTest(
	"first child, parent has no destination, previous parent has no children",
	{
		title: "A",
		children: [
			{
				title: "B",
				destination: "previous parent",
			},
			{
				title: "C",
				children: [
					{
						title: "D",
						destination: "current",
					},
				],
			},
		],
	},
	"current",
	"previous parent",
);

previousDestinationTest(
	"first child, parent has no destination, previous parent has children",
	{
		title: "A",
		children: [
			{
				title: "B",
				destination: "previous parent",
				children: [
					{
						title: "C",
						destination: "first child",
					},
					{
						title: "D",
						destination: "second child",
					},
				],
			},
			{
				title: "E",
				children: [
					{
						title: "F",
						destination: "current",
					},
				],
			},
		],
	},
	"current",
	"second child",
);
