import { isRelativeUrl } from "../util/isRelativeUrl.ts";

function HeaderLink({ href, text }: {
	href: string;
	text: string;
}) {
	const attributes: { [key: string]: string } = {};
	if (!isRelativeUrl(href)) {
		attributes.target = "_blank";
		attributes.rel = "noopener noreferrer";
	}
	return <a href={href} {...attributes}>{text}</a>;
}

export function Header() {
	return (
		<header>
			<HeaderLink href="/" text="Home" />
			<HeaderLink href="/manual" text="Manual" />
			<HeaderLink href="https://renda.studio" text="Studio" />
			<HeaderLink href="https://github.com/rendajs" text="GitHub" />
		</header>
	);
}
