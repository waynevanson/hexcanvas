import type { SolidEvent } from "./utils";

export interface ControlsProps {
	gap: number;
	onInputGap(event: SolidEvent<InputEvent, HTMLInputElement>): void;

	fontSize: number;
	onInputFontSize(event: SolidEvent<InputEvent, HTMLInputElement>): void;

	onClickClear(): void;
}

export function Controls(props: ControlsProps) {
	return (
		<div>
			<button type="button" onClick={props.onClickClear}>
				Clear
			</button>

			<div>
				<label>
					<span>Font size</span>
					<input
						type="range"
						min={1}
						max={300}
						value={props.fontSize}
						onInput={props.onInputFontSize}
					/>
				</label>
			</div>

			<div>
				<label>
					<span>Gap</span>
					<input
						type="range"
						min={-30}
						max={30}
						value={props.gap}
						onInput={props.onInputGap}
					/>
				</label>
			</div>
		</div>
	);
}
