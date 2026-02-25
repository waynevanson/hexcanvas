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
