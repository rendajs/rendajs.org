import type { TableOfContentsIndex } from "../../../../../site/components/TableOfContents.tsx";
import { assertEquals } from "$std/testing/asserts.ts";
import { findNextDestination } from "../../../../../site/util/tableOfContents/navigation.ts";

function nextDestinationTest(testName: string, index: TableOfContentsIndex, current: string, expectedNext: string | null) {
	Deno.test({
		name: testName,
		fn() {
			const result = findNextDestination(index, current);
			assertEquals(result, expectedNext);
		},
	});
}

nextDestinationTest(
	"current destination not found",
	{
		title: "A",
	},
	"current",
	null,
);

nextDestinationTest(
	"no next destination",
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
	null,
);

nextDestinationTest(
	"next sibling",
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
			{
				title: "D",
				destination: "next",
			},
		],
	},
	"current",
	"next",
);

nextDestinationTest(
	"next parent",
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
			{
				title: "D",
				destination: "next",
			},
		],
	},
	"current",
	"next",
);
nextDestinationTest(
	"next child of parent",
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
			{
				title: "D",
				children: [
					{
						title: "E",
						destination: "next",
					},
				],
			},
		],
	},
	"current",
	"next",
);

nextDestinationTest(
	"next child of child of parent",
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
			{
				title: "D",
				children: [
					{
						title: "E",
						children: [
							{
								title: "F",
								destination: "next",
							},
						],
					},
				],
			},
		],
	},
	"current",
	"next",
);
