import { createMemo, createResource } from "solid-js";

export function useFont(fontFamily: string, endpoint: string) {
	const [fonts] = createResource(async () => {
		const fontFace = new FontFace(fontFamily, `url("${endpoint}")`);
		document.fonts.add(fontFace);
		return await fontFace.load();
	});

	return createMemo(() => (fonts.state === "ready" ? fontFamily : null));
}
