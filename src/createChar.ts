import type { NullableSize } from "@solid-primitives/resize-observer";
import { createMemo } from "solid-js";
import type { AppStore } from "./app";

// todo: is not using null for size derivations safe?
export function createChar(store: AppStore, size: NullableSize) {
	const _ = undefined,
		xSize = createMemo(() => store.fontSize * 0.43),
		xBox = createMemo(() => xSize() + store.gap / 2),
		xOffset = createMemo(() => -store.fontSize * 0.08),
		xCountFloat = createMemo(
			() => (size.width ?? 0 + store.gap) / (xSize() + store.gap),
		),
		xCountFloor = createMemo(() => Math.floor(xCountFloat())),
		ySize = createMemo(() => store.fontSize * 0.74),
		yBox = createMemo(() => ySize() + store.gap / 2),
		yOffset = createMemo(() => -store.fontSize * 0.01),
		yCountFloat = createMemo(
			() => (size.height ?? 0 + store.gap) / (ySize() + store.gap),
		),
		yCountFloor = createMemo(() => Math.floor(yCountFloat()));

	return {
		xSize,
		xBox,
		xOffset,
		xCountFloat,
		xCountFloor,
		ySize,
		yBox,
		yOffset,
		yCountFloat,
		yCountFloor,
	};
}
