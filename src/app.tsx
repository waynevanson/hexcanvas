import { createRAF } from "@solid-primitives/raf";
import { createElementSize } from "@solid-primitives/resize-observer";
import { createMemo, createSignal } from "solid-js";
import { useFont } from "./useFont";
import { createNonNullable } from "./utils";

const FONT_ENDPOINT = "/public/webfonts/JetBrainsMono-Regular.woff2";

export function App() {
	const [containerRef, containerRefSet] = createSignal<
		HTMLDivElement | undefined
	>(undefined);

	const [canvasRef, canvasRefSet] = createSignal<HTMLCanvasElement | undefined>(
		undefined,
	);

	const size = createElementSize(containerRef);

	const context = createMemo(() => canvasRef()?.getContext("2d"));
	const font = useFont("JetBrains Mono", FONT_ENDPOINT);
	const merged = createNonNullable({
		context,
		font,
		size: () => (size.height === null || size.height === null ? null : size),
	});

	// todo: only run when reactive or itself returns true
	// to save redrawing
	const [_running, start] = createRAF((timestamp) => {
		const value = merged();

		if (value == null || !value.font.ready) {
			return;
		}

		value.context.reset();

		const fontSize = 100;
		const charXSize = fontSize * 0.43;
		const charYSize = fontSize * 0.74;
		const charXOffset = -fontSize * 0.08;
		const charYOffset = -fontSize * 0.01;
		const gap = 2;
		const clickableWidth = charXSize + gap / 2;
		const clickableHeight = charYSize + gap / 2;

		const totalCols = (value.size.width + gap) / (charXSize + gap);
		const totalRows = (value.size.height + gap) / (charYSize + gap);

		const xMargin = ((totalCols - Math.floor(totalCols)) * charXSize) / 2;
		const yMargin = ((totalRows - Math.floor(totalRows)) * charYSize) / 2;

		const nodes = [];

		for (let y = 0; y < Math.floor(totalRows); y++) {
			for (let x = 0; x < Math.floor(totalCols); x++) {
				// const i = x + y * totalRows;
				const node = {
					x: x * (charXSize + gap) + charXOffset,
					y: y * (charYSize + gap) + charYOffset + charYSize,
				};
				nodes.push(node);
			}
		}

		value.context.font = `${fontSize}px ${value.font.family}`;

		for (const node of nodes) {
			value.context.fillText("0", node.x, node.y);
		}
	});

	start();

	return (
		<div
			ref={containerRefSet}
			style={{ "aspect-ratio": `${260 / 460}`, overflow: "hidden" }}
		>
			<canvas
				ref={canvasRefSet}
				height={size.height ?? 0}
				width={size.width ?? 0}
			/>
		</div>
	);
}
