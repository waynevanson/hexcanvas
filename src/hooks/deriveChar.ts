import type { NullableSize } from "@solid-primitives/resize-observer";
import { createStore } from "solid-js/store";
import type { AppStore } from "../app";

// todo: is not using null for size derivations safe?
// todo: use getters
export function createChar(store: AppStore, size: NullableSize) {
	return createStore({
		get xSize() {
			return store.fontSize * 0.43;
		},
		get xBox() {
			return this.xSize + store.gap;
		},
		get xOffset() {
			return -store.fontSize * 0.08 + store.gap / 2;
		},
		get xCountFloat() {
			return (size.width ?? 0 + store.gap) / (this.xSize + store.gap);
		},
		get xCountFloor() {
			return Math.floor(this.xCountFloat);
		},
		get ySize() {
			return store.fontSize * 0.74;
		},
		get yBox() {
			return this.ySize + store.gap;
		},
		get yOffset() {
			return -store.fontSize * 0.01 + this.ySize + store.gap / 2;
		},
		get yCountFloat() {
			return (size.height ?? 0 + store.gap) / (this.ySize + store.gap);
		},
		get yCountFloor() {
			return Math.floor(this.yCountFloat);
		},
	});
}
