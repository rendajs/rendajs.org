import type { JSX } from "$preact";
import { DangerousSvg } from "./DangerousSvg.tsx";
import { getStaticFileText } from "../util/getStaticFile.ts";
import { isRelativeUrl } from "../util/isRelativeUrl.ts";

const rendaSvg = await getStaticFileText("renda.svg");
const githubSvg = await getStaticFileText("github.svg");

function HeaderLink({ href, classes, children, ariaLabel }: {
	href: string;
	classes?: string;
	children: JSX.Element | string;
	ariaLabel?: string;
}) {
	const attributes: { [key: string]: string } = {};
	if (!isRelativeUrl(href)) {
		attributes.target = "_blank";
		attributes.rel = "noopener noreferrer";
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
					<HeaderLink href="/manual">Manual</HeaderLink>
					<HeaderLink href="https://renda.studio">Studio</HeaderLink>
					<HeaderLink href="https://github.com/rendajs" ariaLabel="GitHub">
						<DangerousSvg svg={githubSvg} />
					</HeaderLink>
				</nav>
			</div>
		</header>
	);
}
