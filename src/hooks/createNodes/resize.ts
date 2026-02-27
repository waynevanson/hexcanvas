import { createCells } from "../../utils";
import type { CellNode } from ".";
import { calculateCoordinates } from "./calculateCoordinates";

export function resize(
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
