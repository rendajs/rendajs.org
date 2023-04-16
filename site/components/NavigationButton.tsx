import type { JSX } from "$preact";
import { getStaticFileText } from "../util/getStaticFile.ts";
import { isRelativeUrl } from "../util/isRelativeUrl.ts";
import { DangerousSvg } from "./DangerousSvg.tsx";

const externalArrowSvg = await getStaticFileText("externalArrow.svg");

export function NavigationButton({ href, classes, children, ariaLabel, showArrow }: {
	href: string;
	classes?: string;
	children: JSX.Element | string;
	ariaLabel?: string;
	showArrow?: boolean;
}) {
	const attributes: { [key: string]: string } = {};
	if (!isRelativeUrl(href)) {
		attributes.target = "_blank";
		attributes.rel = "noopener noreferrer";
		if (showArrow !== false) {
			children = (
				<>
					{children}
					<DangerousSvg classes="external-arrow" svg={externalArrowSvg} />
				</>
			);
		}
	}
	return <a href={href} {...attributes} class={classes} aria-label={ariaLabel}>{children}</a>;
}
