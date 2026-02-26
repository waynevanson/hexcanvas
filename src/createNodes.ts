import { type Accessor, createEffect, createSignal, on } from "solid-js";
import type { AppStore } from "./app";
import type { Chars } from "./createChar";
import { createCells, createRandomHexCode } from "./utils";

export interface CellNode {
	x: number;
	y: number;
	selected: boolean;
	letter: string;
}

function calculateCoordinate(options: {
	index: number;
	size: number;
	offset: number;
	gap: number;
}) {
	return options.index * (options.size + options.gap) + options.offset;
}

function calculateCoordinates(options: {
	xIndex: number;
	xSize: number;
	xOffset: number;
	yIndex: number;
	ySize: number;
	yOffset: number;
	gap: number;
}) {
	return {
		x: calculateCoordinate({
			gap: options.gap,
			index: options.xIndex,
			offset: options.xOffset,
			size: options.xSize,
		}),
		y: calculateCoordinate({
			gap: options.gap,
			index: options.yIndex,
			offset: options.yOffset,
			size: options.ySize,
		}),
	};
}

function resize(
	nodes: Array<Array<CellNode>>,
	options: {
		xSize: number;
		xOffset: number;
		ySize: number;
		yOffset: number;
		gap: number;
	},
): Array<Array<CellNode>> {
	const colsCurr = nodes.at(0)?.length ?? 0;
	const rowsCurr = nodes.length;

	return createCells(
		{ x: colsCurr, y: rowsCurr },
		({ x: xIndex, y: yIndex }) => {
			const current = nodes[yIndex][xIndex];

			return {
				...current,
				...calculateCoordinates({
					...options,
					xIndex,
					yIndex,
				}),
			};
		},
	);
}

function extendColumns(
	nodes: Array<Array<CellNode>>,
	options: {
		colsTarget: number;
		colsCurr: number;
		rowsCurr: number;
		xSize: number;
		xOffset: number;
		ySize: number;
		yOffset: number;
		gap: number;
	},
) {
	const colsMiss = options.colsTarget - options.colsCurr;

	const extras = createCells(
		{ x: colsMiss, y: options.rowsCurr },
		({ x, y: yIndex }) =>
			Object.assign(
				{ letter: createRandomHexCode(), selected: false },
				calculateCoordinates({
					...options,
					xIndex: x + options.colsCurr,
					yIndex,
				}),
			),
	);

	extras.forEach((cols, rowIndex) => {
		nodes[rowIndex].push(...cols);
	});
}

function extendRows(
	nodes: Array<Array<CellNode>>,
	options: {
		colsTarget: number;
		colsCurr: number;
		rowsTarget: number;
		rowsCurr: number;
		xSize: number;
		xOffset: number;
		ySize: number;
		yOffset: number;
		gap: number;
	},
) {
	const rowsMiss = options.rowsTarget - options.rowsCurr;

	const extras = createCells(
		{ x: options.colsTarget, y: rowsMiss },
		({ x: xIndex, y }) =>
			Object.assign(
				{ letter: createRandomHexCode(), selected: false },
				calculateCoordinates({
					...options,
					xIndex,
					yIndex: y + options.rowsCurr,
				}),
			),
	);

	nodes.push(...extras);
}

function update(
	nodes_: Array<Array<CellNode>>,
	options: {
		xSize: number;
		xOffset: number;
		ySize: number;
		yOffset: number;
		colsTarget: number;
		rowsTarget: number;
		gap: number;
	},
) {
	const colsCurr = nodes_.at(0)?.length ?? 0;
	const rowsCurr = nodes_.length;

	const options_ = {
		...options,
		rowsCurr,
		colsCurr,
	};

	// resize existing nodes
	const nodes = resize(nodes_, options);

	if (options.colsTarget > colsCurr) {
		extendColumns(nodes, options_);
	}

	if (options.rowsTarget > rowsCurr) {
		extendRows(nodes, options_);
	}

	return nodes;
}

// todo: update node positions when range changes
export function createNodes(store: AppStore, char: Accessor<Chars | null>) {
	const [nodes, nodesSet] = createSignal<Array<Array<CellNode>>>([]);

	// Update only when the store gets bigger in terms of number of items.
	// It's gross but it's getting the job done efficiently.
	createEffect(
		on([char, () => store.gap], ([char, gap]) => {
			if (char === null) {
				return;
			}

			const options = {
				gap,
				colsTarget: char.x.count.floor,
				rowsTarget: char.y.count.floor,
				xOffset: char.x.offset,
				yOffset: char.y.offset,
				xSize: char.x.size,
				ySize: char.y.size,
			};

			nodesSet((nodes) => update(nodes, options));
		}),
	);

	// yuckies
	function setSelectNode(
		indicies: { rowIndex: number; colIndex: number },
		selected: boolean,
	) {
		nodesSet((nodes_) => {
			const nodes = nodes_.concat();
			const cols = nodes[indicies.rowIndex].slice();
			nodes[indicies.rowIndex] = cols;

			const cell = { ...cols[indicies.colIndex], selected };
			cols[indicies.colIndex] = cell;

			return nodes;
		});
	}

	return { value: nodes, setSelectNode };
}
