import { createCells } from "../../utils";
import type { CellNode } from ".";
import { calculateCoordinatesDefaults } from "./calculateCoordinatesDefault";

export function extendRows(
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
			calculateCoordinatesDefaults({
				...options,
				xIndex,
				yIndex: y + options.rowsCurr,
			}),
	);

	nodes.push(...extras);
}
