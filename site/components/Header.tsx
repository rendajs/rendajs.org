import { NavigationButton } from "./NavigationButton.tsx";
import { DangerousSvg } from "./DangerousSvg.tsx";
import { getStaticFileText } from "../util/getStaticFile.ts";

const githubSvg = await getStaticFileText("github.svg");

export function Header() {
	return (
		<header>
			<div class="header-content">
				<NavigationButton href="/" ariaLabel="Renda Home" classes="home-link">
					<>
						<img class="logo" src="/static/renda.svg" alt="Renda logo"></img> Renda
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
