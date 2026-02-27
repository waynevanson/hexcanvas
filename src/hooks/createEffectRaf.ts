import { createEffect, onCleanup } from "solid-js";

export function createEffectRaf(fn: () => void) {
	let rafId: number;
	let isQueued = false;

	createEffect(() => {
		// Track dependencies automatically by calling them inside the effect
		// but outside the rAF logic if you want the rAF to trigger on change.
		fn();

		if (!isQueued) {
			isQueued = true;
			rafId = requestAnimationFrame(() => {
				fn();
				isQueued = false;
			});
		}

		onCleanup(() => cancelAnimationFrame(rafId));
	});
}
