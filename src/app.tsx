import {
	createElementSize,
	type Size,
} from "@solid-primitives/resize-observer";
import { createMemo, createSignal, on } from "solid-js";
import { createStore } from "solid-js/store";
import { Canvas } from "./canvas";
import { Controls } from "./controls";
import { createChar } from "./createChar";
import { createEffectRaf } from "./createEffectRaf";
import { createNodes } from "./createNodes";
import { useFont } from "./useFont";

export interface AppStore {
	fontSize: number;
	gap: number;
}

export function App() {
	const [refContainer, refContainerSet] = createSignal<
		HTMLDivElement | undefined
	>(undefined);

	const [refCanvas, refCanvasSet] = createSignal<HTMLCanvasElement | undefined>(
		undefined,
	);

	const sizeNullable = createElementSize(refContainer);
	const size = (): Size | null =>
		sizeNullable.height === null || sizeNullable.width === null
			? null
			: sizeNullable;

	const context = createMemo(() => refCanvas()?.getContext("2d") ?? null);

	const fontFamily = useFont(
		"JetBrains Mono",
		"/webfonts/JetBrainsMono-Regular.woff2",
	);

	const [store, storeSet] = createStore<AppStore>({ fontSize: 100, gap: 2 });

	const char = createChar(store, size);

	const nodes = createNodes(store, char);

	createEffectRaf(
		on(
			[context, nodes.value, fontFamily, () => store.fontSize, char, size],
			([context, nodes, fontFamily, fontSize, char]) => {
				if (context === null || fontFamily === null || char === null) {
					return;
				}

				context.reset();

				context.font = `${fontSize}px ${fontFamily}`;

				nodes.slice(0, char.y.count.floor).forEach((cells) => {
					cells.slice(0, char.x.count.floor).forEach((cell) => {
						context.fillStyle = cell.selected ? "green" : "lightgreen";
						context.fillText(cell.letter, cell.x, cell.y);
					});
				});
			},
		),
	);

	// function handleOnClick(
	// 	event: MouseEvent & {
	// 		currentTarget: HTMLCanvasElement;
	// 		target: Element;
	// 	},
	// ) {
	// 	const w = char.x.count.floor * char.x.box;
	// 	const h = char.y.count.floor * char.y.box;

	// 	// out of bounds
	// 	if (event.x > w || event.y > h) {
	// 		return;
	// 	}

	// 	// percentage from in bounds area
	// 	const percW = event.x / w;
	// 	const percH = event.y / h;

	// 	// percentage of array
	// 	const percw = percW * char.x.count.floor;
	// 	const perch = percH * char.y.count.floor;

	// 	const iW = Math.floor(percw);
	// 	const iH = Math.floor(perch);

	// 	const node = nodes.value().at(iH)?.at(iW);

	// 	if (!node) {
	// 		throw new Error("Should find a node bro");
	// 	}

	// 	const ir = new Set(highlighted.get(iH));
	// 	ir.add(iW);

	// 	highlighted.set(iH, ir);

	// 	// find target node based on mouse x,y
	// 	// get percentage of width,height
	// }

	return (
		<div>
			<Canvas
				refCanvas={refCanvasSet}
				refContainer={refContainerSet}
				size={sizeNullable}
			/>
			<Controls
				fontSize={store.fontSize}
				gap={store.gap}
				onInputFontSize={(event) =>
					storeSet("fontSize", event.target.valueAsNumber)
				}
				onInputGap={(event) => storeSet("gap", event.target.valueAsNumber)}
				onClickClear={() => {}}
			/>
		</div>
	);
}
