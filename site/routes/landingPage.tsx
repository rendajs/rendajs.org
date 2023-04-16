import type { RouteHandler } from "../../main.tsx";
import { DangerousSvg } from "../components/DangerousSvg.tsx";
import { NavigationButton } from "../components/NavigationButton.tsx";
import { getStaticFileText } from "../util/getStaticFile.ts";

const rightArrowSvg = await getStaticFileText("rightArrow.svg");

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
						<img src="/static/renda.svg" />
						<div class="actions">
							<NavigationButton classes="main-button" href="https://renda.studio">Launch Studio</NavigationButton>
							<NavigationButton href="/manual">
								<>
									Get Started <DangerousSvg classes="right-arrow" svg={rightArrowSvg} />
								</>
							</NavigationButton>
						</div>
					</main>
				</div>
			),
		};
	},
};
