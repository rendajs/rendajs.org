import { NavigationButton } from "./NavigationButton.tsx";
import { DangerousSvg } from "./DangerousSvg.tsx";
import { getStaticFileText } from "../util/getStaticFile.ts";
import { Logo } from "./Logo.tsx";

const githubSvg = await getStaticFileText("github.svg");
const hamburgerSvg = await getStaticFileText("hamburger.svg");

function HamburgerToggle() {
	return (
		<button id="hamburgerToggle" type="button" title="Toggle table of contents">
			<DangerousSvg svg={hamburgerSvg} />
		</button>
	);
}

export function Header({ showHamburger = false }) {
	const divClassNames = ["header-content"];
	if (showHamburger) divClassNames.push("has-hamburger");
	return (
		<header>
			<div className={divClassNames.join(" ")}>
				{showHamburger && <HamburgerToggle />}
				<NavigationButton href="/" ariaLabel="Renda Home" classes="home-link">
					<>
						<Logo />
						<span>Renda</span>
					</>
				</NavigationButton>
				<nav>
					<NavigationButton href="https://renda.studio">Studio</NavigationButton>
					<NavigationButton href="/manual">Manual</NavigationButton>
					<NavigationButton href="https://github.com/rendajs" ariaLabel="GitHub" showArrow={false}>
						<DangerousSvg classes="github" svg={githubSvg} />
					</NavigationButton>
				</nav>
			</div>
		</header>
	);
}
