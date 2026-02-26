import type { Size } from "@solid-primitives/resize-observer";
import equals from "fast-deep-equal";
import { type Accessor, createMemo, on } from "solid-js";
import type { AppStore } from "./app";

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
		on(
			[size, () => store.fontSize, () => store.gap],
			([size, fontSize, gap]) => {
				if (size === null) {
					return null;
				}

				const char = {
					x: {
						size: fontSize * 0.43,
						get box() {
							return char.x.size + gap / 2;
						},
						offset: -fontSize * 0.08,
						count: {
							get float() {
								return (size.width + gap) / (char.x.size + gap);
							},
							get floor() {
								return Math.floor(this.float);
							},
						},
					},
					y: {
						size: fontSize * 0.74,
						get box() {
							return char.y.size + gap / 2;
						},
						offset: -fontSize * 0.01,
						count: {
							get float() {
								return (size.height + gap) / (char.y.size + gap);
							},
							get floor() {
								return Math.floor(this.float);
							},
						},
					},
				};

				return char;
			},
		),
	);
}
