import { ReactiveMap } from "@solid-primitives/map";
import { createElementSize } from "@solid-primitives/resize-observer";
import equals from "fast-deep-equal";
import { createMemo, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import { createEffectRaf } from "./createEffectRaf";
import { useFont } from "./useFont";
import { createNonNullable } from "./utils";

const FONT_ENDPOINT = "/public/webfonts/JetBrainsMono-Regular.woff2";

const rand = () => {
	const ss = "012345789ABCDEF";
	return ss[Math.floor(Math.random() * ss.length)] ?? "5";
};

const gap = 2;

export function App() {
	const [store, storeSet] = createStore({ fontSize: 100, gap: 2 });

	const [containerRef, containerRefSet] = createSignal<
		HTMLDivElement | undefined
	>(undefined);

	const [canvasRef, canvasRefSet] = createSignal<HTMLCanvasElement | undefined>(
		undefined,
	);

	const sized = createElementSize(containerRef);
	// memoization doesn't work here?
	const size = () =>
		sized.height === null || sized.height === null ? null : sized;

	const merged = createNonNullable({
		context: createMemo(() => canvasRef()?.getContext("2d")),
		font: useFont("JetBrains Mono", FONT_ENDPOINT),
		size,
	});

	const char_ = createMemo(() => {
		const value = merged();

		if (value == null || !value.font.ready) {
			return null;
		}

		const char = {
			x: {
				size: store.fontSize * 0.43,
				get box() {
					return char.x.size + gap / 2;
				},
				offset: -store.fontSize * 0.08,
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
				size: store.fontSize * 0.74,
				get box() {
					return char.y.size + gap / 2;
				},
				offset: -store.fontSize * 0.01,
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

		return char;
	});

	const nodes = createMemo(
		() => {
			const char = char_();

			if (char == null) {
				return [];
			}

			const nodes: Array<Array<{ x: number; y: number }>> = Array.from(
				{ length: char.y.count.floor },
				(_, y) =>
					Array.from({ length: char.x.count.floor }, (_, x) => ({
						x: x * (char.x.size + gap) + char.x.offset,
						y: y * (char.y.size + gap) + char.y.offset + char.y.size,
					})),
			);

			return nodes;
		},
		null,
		{ equals },
	);

	// x, y. use a normal object for serialization
	const highlighted = new ReactiveMap<number, Set<number>>();

	createEffectRaf(() => {
		const value = merged();

		nodes().forEach((rows, y) => {
			rows.forEach((_, x) => {
				highlighted.get(y)?.has(x);
			});
		});

		if (value == null || !value.font.ready) {
			return;
		}

		value.context.reset();

		value.context.font = `${store.fontSize}px ${value.font.family}`;

		nodes().forEach((rows, y) => {
			rows.forEach((node, x) => {
				value.context.fillStyle = highlighted.get(y)?.has(x)
					? "green"
					: "lightgreen";
				value.context.fillText(rand(), node.x, node.y);
			});
		});
	});

	return (
		<div>
			<div
				ref={containerRefSet}
				style={{ "aspect-ratio": `${260 / 460}`, overflow: "hidden" }}
			>
				<canvas
					ref={canvasRefSet}
					height={sized.height ?? 0}
					width={sized.width ?? 0}
					onClick={(event) => {
						const sized = size();

						if (sized == null) {
							return;
						}

						const char = char_();

						if (char == null) {
							return;
						}

						const w = char.x.count.floor * char.x.box;
						const h = char.y.count.floor * char.y.box;

						// out of bounds
						if (event.x > w || event.y > h) {
							return;
						}

						// percentage from in bounds area
						const percW = event.x / w;
						const percH = event.y / h;

						// percentage of array
						const percw = percW * char.x.count.floor;
						const perch = percH * char.y.count.floor;

						const iW = Math.floor(percw);
						const iH = Math.floor(perch);

						const node = nodes().at(iH)?.at(iW);

						if (!node) {
							throw new Error("Should find a node bro");
						}

						const ir = new Set(highlighted.get(iH));
						ir.add(iW);

						highlighted.set(iH, ir);

						// find target node based on mouse x,y
						// get percentage of width,height
					}}
				/>
			</div>
			<div>
				<button
					type="button"
					onClick={() => {
						highlighted.clear();
					}}
				>
					Clear
				</button>
				<div>
					<label>
						<span>Font size</span>
						<input
							type="range"
							min={1}
							max={300}
							value={store.fontSize}
							onInput={(event) =>
								storeSet("fontSize", event.target.valueAsNumber)
							}
						/>
					</label>
				</div>
			</div>
		</div>
	);
}
