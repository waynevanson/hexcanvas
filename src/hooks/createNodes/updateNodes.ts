import type { CellNode } from ".";
import { extendColumns } from "./extendColumns";
import { extendRows } from "./extendRows";
import { resize } from "./resize";

export function updateNodes(
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

	const nodes = resize(nodes_, options);

	const options_ = {
		...options,
		rowsCurr,
		colsCurr,
	};

	if (options.colsTarget > colsCurr) {
		extendColumns(nodes, options_);
	}

	if (options.rowsTarget > rowsCurr) {
		extendRows(nodes, options_);
	}

	return nodes;
}
