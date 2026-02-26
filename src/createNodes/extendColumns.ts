import { createCells } from "../utils";
import type { CellNode } from ".";
import { calculateCoordinatesDefaults } from "./calculateCoordinatesDefault";

export function extendColumns(
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
			calculateCoordinatesDefaults({
				...options,
				xIndex: x + options.colsCurr,
				yIndex,
			}),
	);

	extras.forEach((cols, rowIndex) => {
		nodes[rowIndex].push(...cols);
	});
}
