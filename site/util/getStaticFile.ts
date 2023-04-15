import * as path from "$std/path/mod.ts";

/**
 * Resolves path relative to the 'static' directory and returns the text content of the file.
 */
export async function getStaticFileText(filePath: string) {
	const staticPath = path.resolve(path.dirname(path.fromFileUrl(import.meta.url)), "../static", filePath);
	return await Deno.readTextFile(staticPath);
}
