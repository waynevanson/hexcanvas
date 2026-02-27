import { createElementSize } from "@solid-primitives/resize-observer";
import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { Canvas, Controls } from "./components";
import { type CellNode, createChar, createNodes } from "./hooks";
import { createEffectRaf } from "./hooks/createEffectRaf";
import { useFont } from "./hooks/useFont";
import { linearly, type SolidEvent } from "./utils";

export interface AppStore {
	fontSize: number;
	gap: number;
}

export function App() {
	const [state, stateSet] = createStore({
		container: undefined as undefined | HTMLDivElement,
		canvas: undefined as undefined | HTMLCanvasElement,
		hovering: undefined as undefined | { rowIndex: number; colIndex: number },
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

		derived.context.font = `${local.fontSize}px ${derived.fontFamily}`;

		// partition selected render last
		const selected = [] as Array<CellNode>;
		for (let y = 0; y < char.yCountFloat; y++) {
			const cells = nodes.value()[y];

			for (const cell of cells.slice(0, char.xCountFloor)) {
				if (cell.selected) {
					selected.push(cell);
				} else {
					derived.context.fillStyle = "green";
					derived.context.fillText(cell.letter, cell.x, cell.y);
				}
			}
		}

		for (const cell of selected) {
			derived.context.fillStyle = "lightgreen";
			derived.context.fillText(cell.letter, cell.x, cell.y);
		}
	});

	function findNodeIndicies(event: { x: number; y: number }) {
		const xBoundMax = char.xCountFloor * char.xBox;
		const yBoundMax = char.yCountFloor * char.yBox;

		// out of bounds
		if (event.x > xBoundMax || event.y > yBoundMax) {
			return;
		}

		const xScale = linearly(
			{ min: 0, max: xBoundMax },
			{ min: 0, max: char.xCountFloor },
		);

		const yScale = linearly(
			{ min: 0, max: yBoundMax },
			{ min: 0, max: char.yCountFloor },
		);

		const colIndex = Math.floor(xScale(event.x));
		const rowIndex = Math.floor(yScale(event.y));

		return { colIndex, rowIndex };
	}

	// todo: fix the math on this, something isn't right
	function handleOnClick(event: SolidEvent<MouseEvent, HTMLCanvasElement>) {
		const found = findNodeIndicies(event);

		if (found === undefined) {
			return;
		}

		nodes.setSelectNode(found, (a) => !a);
	}

	function handleOnMouseOver(event: SolidEvent<MouseEvent, HTMLCanvasElement>) {
		const found = findNodeIndicies(event);

		if (found === undefined) {
			return;
		}

		// highlight
	}

	return (
		<div>
			<Canvas
				refCanvas={(ref) => stateSet("canvas", ref)}
				refContainer={(ref) => stateSet("container", ref)}
				size={derived.size}
				onClick={handleOnClick}
				onMouseOver={handleOnMouseOver}
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
