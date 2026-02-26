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

			function createNode(indicies: { x: number; y: number }): CellNode {
				return {
					x: indicies.x * (char.x.size + gap) + char.x.offset,
					y: indicies.y * (char.y.size + gap) + char.y.offset + char.y.size,
					selected: false,
					letter: createRandomHexCode(),
				};
			}

			nodesSet((nodes_) => {
				const colsCurr = nodes_.at(0)?.length ?? 0;
				const rowsCurr = nodes_.length;

				// resize existing nodes
				const nodes = createCells({ x: colsCurr, y: rowsCurr }, (props) => {
					const current = nodes_[props.y][props.x];
					return Object.assign(createNode(props), {
						selected: current.selected,
						letter: current.letter,
					});
				});

				// add extra columns or rows when required.

				const colsTarget = char.x.count.floor;
				const rowsTarget = char.y.count.floor;

				// add columns
				if (colsTarget > colsCurr) {
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
					const rowsMiss = rowsTarget - rowsCurr;

					const extras = createCells(
						{ x: colsTarget, y: rowsMiss },
						({ x, y }) => createNode({ x, y: y + rowsCurr }),
					);

					nodes.push(...extras);
				}

				// use same reference if there's no change
				return nodes;
			});
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
