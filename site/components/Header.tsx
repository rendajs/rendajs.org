import { NavigationButton } from "./NavigationButton.tsx";
import { DangerousSvg } from "./DangerousSvg.tsx";
import { getStaticFileText } from "../util/getStaticFile.ts";

const githubSvg = await getStaticFileText("github.svg");
const hamburgerSvg = await getStaticFileText("hamburger.svg");

function HamburgerToggle() {
	return (
		<button id="hamburgerToggle">
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
						<img class="logo" src="/static/renda.svg" alt="Renda logo"></img>
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
