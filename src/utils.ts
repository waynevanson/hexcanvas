import { type Accessor, createMemo } from "solid-js";

export function createNonNullable<T extends Record<string, unknown>>(
	accessors: { [P in keyof T]: Accessor<T[P]> },
): Accessor<{ [P in keyof T]: NonNullable<T[P]> } | null> {
	return createMemo(() => {
		const result = {} as { [P in keyof T]: T[P] };

		// register them all
		for (const property in accessors) {
			result[property] = accessors[property]();
		}

		for (const key in result) {
			if (result[key] == null) {
				return null;
			}
		}

		return result as never;
	});
}

export function createCells<T>(
	size: { x: number; y: number },
	createCell: (indicies: { x: number; y: number }) => T,
): Array<Array<T>> {
	return Array.from({ length: size.y }, (_, y) =>
		Array.from({ length: size.x }, (_, x) => createCell({ x, y })),
	);
}

// todo: seed?
export function createRandomHexCode() {
	const ss = "012345789ABCDEF";
	return ss[Math.floor(Math.random() * ss.length)] ?? "5";
}

export type SolidEvent<E extends Event, T extends HTMLElement> = E & {
	currentTarget: T;
	target: T;
};

export interface Bound {
	min: number;
	max: number;
}

export function linearly(from: Bound, to: Bound) {
	const fromDiff = from.max - from.min;
	const toDiff = to.max - to.min;

	return (value: number) => ((value - from.min) / fromDiff) * toDiff + to.min;
}
