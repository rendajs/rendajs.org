export function DangerousSvg({
	svg,
	classes,
}: {
	svg: string;
	classes?: string;
}) {
	return <span class={classes} dangerouslySetInnerHTML={{ __html: svg }}></span>;
}
