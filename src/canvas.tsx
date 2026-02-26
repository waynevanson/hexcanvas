import type { NullableSize } from "@solid-primitives/resize-observer";
import { type ComponentProps, splitProps } from "solid-js";

export interface CanvasProps
	extends Omit<ComponentProps<"canvas">, "ref" | "height" | "width"> {
	size: NullableSize;
	refContainer(element: HTMLDivElement): void;
	refCanvas(element: HTMLCanvasElement): void;
}

export function Canvas(props: CanvasProps) {
	const [scope, rest] = splitProps(props, [
		"refCanvas",
		"refContainer",
		"size",
	]);

	return (
		<div
			ref={scope.refContainer}
			style={{
				"aspect-ratio": `${260 / 460}`,
				overflow: "hidden",
				"max-width": "40rem",
			}}
		>
			<canvas
				{...rest}
				ref={scope.refCanvas}
				height={scope.size.height ?? 0}
				width={scope.size.width ?? 0}
			/>
		</div>
	);
}
