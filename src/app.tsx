import { createElementSize } from "@solid-primitives/resize-observer";
import { makePersisted } from "@solid-primitives/storage";
import { createStore } from "solid-js/store";
import { Canvas, Controls } from "./components";
import { createChar, createNodes } from "./hooks";
import { createEffectRaf } from "./hooks/createEffectRaf";
import { useFont } from "./hooks/useFont";
import { linearly } from "./utils";

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
