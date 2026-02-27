import { makePersisted } from "@solid-primitives/storage";
import { createEffect, createSignal } from "solid-js";
import type { AppStore } from "../../app";
import { updateNodes } from "./updateNodes";

export interface CellNode {
	x: number;
	y: number;
	selected: boolean;
	letter: string;
}

export function createNodes(
	store: AppStore,
	char: {
		readonly xCountFloor: number;
		readonly xOffset: number;
		readonly xSize: number;
		readonly yCountFloor: number;
		readonly ySize: number;
		readonly yOffset: number;
	},
) {
	const [nodes, nodesSet] = makePersisted(
		createSignal<Array<Array<CellNode>>>([]),
		{ storage: window.localStorage, name: "fatty_nodes" },
	);

	// Update only when the store gets bigger in terms of number of items.
	// It's gross but it's getting the job done efficiently.
	createEffect(() => {
		const options = {
			gap: store.gap,
			colsTarget: char.xCountFloor,
			rowsTarget: char.yCountFloor,
			xOffset: char.xOffset,
			yOffset: char.yOffset,
			xSize: char.xSize,
			ySize: char.ySize,
		};

		nodesSet((nodes) => updateNodes(nodes, options));
	});

	// yuckies
	function setSelectNode(
		indicies: { rowIndex: number; colIndex: number },
		selected: (boolean: boolean) => boolean,
	) {
		nodesSet((nodes_) => {
			const nodes = nodes_.concat();
			const cols = nodes[indicies.rowIndex].slice();
			nodes[indicies.rowIndex] = cols;

			const cell = { ...cols[indicies.colIndex] };
			cell.selected = selected(cell.selected);
			cols[indicies.colIndex] = cell;

			return nodes;
		});
	}

	// todo: fix
	function clearAllNodes() {
		nodesSet([]);
	}

	return { value: nodes, setSelectNode, clearAllNodes };
}
