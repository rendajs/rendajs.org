import { getStaticFileText } from "../util/getStaticFile.ts";
import { DangerousSvg } from "./DangerousSvg.tsx";

const leftArrowSvg = await getStaticFileText("leftArrow.svg");
const rightArrowSvg = await getStaticFileText("rightArrow.svg");

export function NavigationArrow({ direction }: { direction: "left" | "right" }) {
	const left = direction == "left";
	const classes = "navigation-arrow " + (left ? "left" : "right");
	const svg = left ? leftArrowSvg : rightArrowSvg;
	return <DangerousSvg {...{ classes, svg }} />;
}
