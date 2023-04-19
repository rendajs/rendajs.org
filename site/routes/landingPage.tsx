import type { RouteHandler } from "../../main.tsx";
import { NavigationArrow } from "../components/NavigationArrow.tsx";
import { NavigationButton } from "../components/NavigationButton.tsx";

export const landingPage: RouteHandler = {
	pattern: new URLPattern({
		pathname: "/",
	}),
	handler() {
		return {
			cssUrls: ["landingPage.css"],
			page: (
				<div class="landing-page">
					<main>
						<img src="/static/renda.svg" alt="Renda logo" />
						<div class="actions">
							<NavigationButton classes="navigation-button main-button" href="https://renda.studio">Launch Studio</NavigationButton>
							<NavigationButton classes="navigation-button" href="/manual">
								<>
									Get Started <NavigationArrow direction="right" />
								</>
							</NavigationButton>
						</div>
					</main>
				</div>
			),
		};
	},
};
