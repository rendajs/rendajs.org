export function isRelativeUrl(urlString: string) {
	try {
		new URL(urlString);
	} catch {
		return true;
	}
	return false;
}
