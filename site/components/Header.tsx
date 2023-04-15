import type { JSX } from "$preact";
import { DangerousSvg } from "./DangerousSvg.tsx";
import { getStaticFileText } from "../util/getStaticFile.ts";
import { isRelativeUrl } from "../util/isRelativeUrl.ts";

const rendaSvg = await getStaticFileText("renda.svg");
const githubSvg = await getStaticFileText("github.svg");
const externalArrowSvg = await getStaticFileText("externalArrow.svg");

function HeaderLink({ href, classes, children, ariaLabel, showArrow }: {
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
			children = <>{children} <DangerousSvg classes="external-arrow" svg={externalArrowSvg} /></>;
		}
	}
	return <a href={href} {...attributes} class={classes} aria-label={ariaLabel}>{children}</a>;
}

export function Header() {
	return (
		<header>
			<div class="header-content">
				<HeaderLink href="/" ariaLabel="Renda Home" classes="home-link">
					<>
						<DangerousSvg svg={rendaSvg} />
						Renda
					</>
				</HeaderLink>
				<nav>
					<HeaderLink href="https://renda.studio">Studio</HeaderLink>
					<HeaderLink href="/manual">Manual</HeaderLink>
					<HeaderLink href="https://github.com/rendajs" ariaLabel="GitHub" showArrow={false}>
						<DangerousSvg classes="github" svg={githubSvg} />
					</HeaderLink>
				</nav>
			</div>
		</header>
	);
}
