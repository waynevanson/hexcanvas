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

	const char = createChar(store, sizeNullable);

	const nodes = createNodes(store, char);

	// todo: make it pretty
	createEffectRaf(
		on(
			[
				context,
				nodes.value,
				fontFamily,
				() => store.fontSize,
				char.xCountFloor,
				char.yCountFloor,
				size,
			],
			([context, nodes, fontFamily, fontSize, xCountFloor, yCountFloor]) => {
				if (context === null || fontFamily === null || char === null) {
					return;
				}

				context.reset();

				context.font = `${fontSize}px ${fontFamily}`;

				nodes.slice(0, yCountFloor).forEach((cells) => {
					cells.slice(0, xCountFloor).forEach((cell) => {
						context.fillStyle = cell.selected ? "green" : "lightgreen";
						context.fillText(cell.letter, cell.x, cell.y);
					});
				});
			},
		),
	);

	// todo: fix the math on this, something isn't right
	// looks like it's using the whole canvas hieght,
	// or the offset is off
	function handleOnClick(
		event: MouseEvent & {
			currentTarget: HTMLCanvasElement;
			target: Element;
		},
	) {
		const w = char.xCountFloor() * char.xBox();
		const h = char.yCountFloor() * char.yBox();

		// out of bounds
		if (event.x > w || event.y > h) {
			return;
		}

		// percentage from in bounds area
		const percW = event.x / w;
		const percH = event.y / h;

		// percentage of array
		const percw = percW * char.xCountFloor();
		const perch = percH * char.yCountFloor();
		const colIndex = Math.floor(percw);
		const rowIndex = Math.floor(perch);

		const node = nodes.value().at(rowIndex)?.at(colIndex);

		if (!node) {
			throw new Error("Should find a node bro");
		}

		nodes.setSelectNode({ colIndex, rowIndex }, true);
	}

	return (
		<div>
			<Canvas
				refCanvas={refCanvasSet}
				refContainer={refContainerSet}
				size={sizeNullable}
				onClick={handleOnClick}
			/>
			<Controls
				fontSize={store.fontSize}
				gap={store.gap}
				onInputFontSize={(event) =>
					storeSet("fontSize", event.target.valueAsNumber)
				}
				onInputGap={(event) => storeSet("gap", event.target.valueAsNumber)}
				onClickClear={nodes.clearAllNodes}
			/>
		</div>
	);
}
