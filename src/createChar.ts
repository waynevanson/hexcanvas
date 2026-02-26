import type { Size } from "@solid-primitives/resize-observer";
import { type Accessor, createMemo, on } from "solid-js";
import type { AppStore } from "./app";
import type { Contexts } from "./canvas";

export interface Chars {
	x: {
		size: number;
		readonly box: number;
		offset: number;
		count: {
			readonly float: number;
			readonly floor: number;
		};
	};
	y: {
		size: number;
		readonly box: number;
		offset: number;
		count: {
			readonly float: number;
			readonly floor: number;
		};
	};
}

// At least I'm having fun, ya know?
export function createChar(
	store: AppStore,
	size: Accessor<Size | null>,
): Accessor<Chars | null> {
	return createMemo(
		on(size, (size) => {
			if (size === null) {
				return null;
			}

			const char = {
				x: {
					size: store.fontSize * 0.43,
					get box() {
						return char.x.size + store.gap / 2;
					},
					offset: -store.fontSize * 0.08,
					count: {
						get float() {
							return (size.width + store.gap) / (char.x.size + store.gap);
						},
						get floor() {
							return Math.floor(this.float);
						},
					},
				},
				y: {
					size: store.fontSize * 0.74,
					get box() {
						return char.y.size + store.gap / 2;
					},
					offset: -store.fontSize * 0.01,
					count: {
						get float() {
							return (size.height + store.gap) / (char.y.size + store.gap);
						},
						get floor() {
							return Math.floor(this.float);
						},
					},
				},
			};

			return char;
		}),
	);
}
