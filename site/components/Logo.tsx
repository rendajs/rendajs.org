export function Logo() {
	return (
		<picture>
			<source srcset="/static/renda-circle.svg" media="(prefers-color-scheme: light)" />
			<img src="/static/renda.svg" alt="Renda logo" />
		</picture>
	);
}
