import { createElementSize } from "@solid-primitives/resize-observer";
import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { Canvas, Controls } from "./components";
import { createChar, createNodes } from "./hooks";
import { createEffectRaf } from "./hooks/createEffectRaf";
import { useFont } from "./hooks/useFont";

export interface AppStore {
	fontSize: number;
	gap: number;
}

export function App() {
	const [state, stateSet] = createStore({
		container: undefined as undefined | HTMLDivElement,
		canvas: undefined as undefined | HTMLCanvasElement,
	});

	const fontFamily = useFont(
		"JetBrains Mono",
		"/webfonts/JetBrainsMono-Regular.woff2",
	);

	const size = createElementSize(() => state.container);

	const [derived] = createStore({
		get context() {
			return state.canvas?.getContext("2d") ?? null;
		},
		get size() {
			return size;
		},
		get fontFamily() {
			return fontFamily();
		},
	});

	const [local, localSet] = makePersisted(
		createStore<AppStore>({ fontSize: 100, gap: 2 }),
		{ name: "nodesstore", storage: window.localStorage },
	);

	const [char] = createChar(local, derived.size);

	const nodes = createNodes(local, char);

	// todo: make it pretty
	createEffectRaf(() => {
		if (derived.context === null || derived.fontFamily === null) {
			return;
		}

		derived.context.reset();

		// testing bounds

		derived.context.font = `${local.fontSize}px ${derived.fontFamily}`;

		for (const cells of nodes.value().slice(0, char.yCountFloor)) {
			for (const cell of cells.slice(0, char.xCountFloor)) {
				derived.context.fillStyle = cell.selected ? "green" : "lightgreen";
				derived.context.fillText(cell.letter, cell.x, cell.y);
			}
		}
	});

	// todo: fix the math on this, something isn't right
	function handleOnClick(
		event: MouseEvent & {
			currentTarget: HTMLCanvasElement;
			target: Element;
		},
	) {
		// todo: check if box is the correct size
		const xBound = char.xCountFloor * char.xBox;
		const yBound = char.yCountFloor * char.yBox;

		// out of bounds
		if (event.x > xBound || event.y > yBound) {
			return;
		}

		// percentage from in bounds area
		const xBoundPerc = event.x / xBound;
		const yBoundPerc = event.y / yBound;

		// percentage of array
		const percw = xBoundPerc * char.xCountFloor;
		const perch = yBoundPerc * char.yCountFloor;

		// to integer
		const colIndex = Math.round(percw);
		const rowIndex = Math.round(perch);

		const node = nodes.value().at(rowIndex)?.at(colIndex);

		if (!node) {
			throw new Error("Should find a node bro");
		}

		nodes.setSelectNode({ colIndex, rowIndex }, (a) => !a);
	}

	return (
		<div>
			<Canvas
				refCanvas={(ref) => stateSet("canvas", ref)}
				refContainer={(ref) => stateSet("container", ref)}
				size={derived.size}
				onClick={handleOnClick}
			/>
			<Controls
				fontSize={local.fontSize}
				gap={local.gap}
				onInputFontSize={(event) =>
					localSet("fontSize", event.target.valueAsNumber)
				}
				onInputGap={(event) => localSet("gap", event.target.valueAsNumber)}
				onClickClear={nodes.clearAllNodes}
			/>
		</div>
	);
}
