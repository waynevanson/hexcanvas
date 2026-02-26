import { createRAF } from "@solid-primitives/raf";
import { createElementSize } from "@solid-primitives/resize-observer";
import { createTrigger, createTriggerCache } from "@solid-primitives/trigger";
import equals from "fast-deep-equal";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	type EffectFunction,
	type EffectOptions,
	onCleanup,
} from "solid-js";
import { createEffectRaf } from "./createEffectRaf";
import { useFont } from "./useFont";
import { createNonNullable } from "./utils";

const FONT_ENDPOINT = "/public/webfonts/JetBrainsMono-Regular.woff2";

const rand = () => {
	const ss = "012345789ABCDEF";
	return ss[Math.floor(Math.random() * ss.length)] ?? "5";
};

const fontSize = 100;

export function App() {
	const [containerRef, containerRefSet] = createSignal<
		HTMLDivElement | undefined
	>(undefined);

	const [canvasRef, canvasRefSet] = createSignal<HTMLCanvasElement | undefined>(
		undefined,
	);

	const size = createElementSize(containerRef);

	const context = createMemo(() => canvasRef()?.getContext("2d"));
	const font = useFont("JetBrains Mono", FONT_ENDPOINT);
	const merged = createNonNullable({
		context,
		font,
		size: () => (size.height === null || size.height === null ? null : size),
	});

	const nodes = createMemo(
		() => {
			const value = merged();

			if (value == null || !value.font.ready) {
				return;
			}

			const gap = 2;

			const char = {
				x: {
					size: fontSize * 0.43,
					get box() {
						return char.x.size + gap / 2;
					},
					offset: -fontSize * 0.08,
					count: {
						get float() {
							return (value.size.width + gap) / (char.x.size + gap);
						},
						get floor() {
							return Math.floor(this.float);
						},
					},
					get margin() {
						return ((this.count.float - this.count.floor) * this.size) / 2;
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
							return (value.size.height + gap) / (char.y.size + gap);
						},
						get floor() {
							return Math.floor(this.float);
						},
					},
					get margin() {
						return ((this.count.float - this.count.floor) * this.size) / 2;
					},
				},
			};

			const nodes: Array<{ x: number; y: number }> = [];

			for (let y = 0; y < char.y.count.floor; y++) {
				for (let x = 0; x < char.x.count.floor; x++) {
					const node = {
						x: x * (char.x.size + gap) + char.x.offset,
						y: y * (char.y.size + gap) + char.y.offset + char.y.size,
					};
					nodes.push(node);
				}
			}

			return nodes;
		},
		null,
		{ equals },
	);

	createEffectRaf(() => {
		const value = merged();

		if (value == null || !value.font.ready) {
			return;
		}

		value.context.reset();

		value.context.font = `${fontSize}px ${value.font.family}`;
		value.context.fillStyle = "green";

		for (const node of nodes() ?? []) {
			value.context.fillText(rand(), node.x, node.y);
		}
	});

	return (
		<div
			ref={containerRefSet}
			style={{ "aspect-ratio": `${260 / 460}`, overflow: "hidden" }}
		>
			<canvas
				ref={canvasRefSet}
				height={size.height ?? 0}
				width={size.width ?? 0}
			/>
		</div>
	);
}
