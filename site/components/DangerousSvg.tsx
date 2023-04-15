export function DangerousSvg({ svg }: { svg: string }) {
	return <span dangerouslySetInnerHTML={{ __html: svg }}></span>;
}
