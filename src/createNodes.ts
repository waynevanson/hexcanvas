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

export function createNodes(store: AppStore, char: Accessor<Chars | null>) {
	const [nodes, nodesSet] = createSignal<Array<Array<CellNode>>>([]);

	// Update only when the store gets bigger in terms of number of items.
	createEffect(
		on(char, (char) => {
			if (char === null) {
				return;
			}

			function createNode(indicies: { x: number; y: number }): CellNode {
				return {
					x: indicies.x * (char.x.size + store.gap) + char.x.offset,
					y:
						indicies.y * (char.y.size + store.gap) +
						char.y.offset +
						char.y.size,
					selected: false,
					letter: createRandomHexCode(),
				};
			}

			nodesSet((nodes_) => {
				const nodes = nodes_.concat();

				let updated = false;

				const colsCurr = nodes.at(0)?.length ?? 0;
				const rowsCurr = nodes.length;
				const colsTarget = char.x.count.floor;
				const rowsTarget = char.y.count.floor;

				// add columns
				if (colsTarget > colsCurr) {
					updated = true;

					const colsMiss = colsTarget - colsCurr;

					const extras = createCells({ x: colsMiss, y: rowsCurr }, (coord) =>
						createNode({
							x: coord.x + colsCurr,
							y: coord.y,
						}),
					);

					extras.forEach((cols, rowIndex) => {
						nodes[rowIndex].push(...cols);
					});
				}

				// add rows
				if (rowsTarget > rowsCurr) {
					updated = true;
					const rowsMiss = rowsTarget - rowsCurr;

					const extras = createCells(
						{ x: colsTarget, y: rowsMiss },
						({ x, y }) => createNode({ x, y: y + rowsCurr }),
					);

					nodes.push(...extras);
				}

				// use new reference
				if (updated) {
					return nodes;
				}

				// use same reference if there's no change
				return nodes_;
			});
		}),
	);

	function setSelectNode(node: { x: number; y: number }) {}

	return { value: nodes, setSelectNode };
}
