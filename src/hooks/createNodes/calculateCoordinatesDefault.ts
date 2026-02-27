import { createRandomHexCode } from "../../utils";
import { calculateCoordinates } from "./calculateCoordinates";

export function calculateCoordinatesDefaults(options: {
	xIndex: number;
	xSize: number;
	xOffset: number;
	yIndex: number;
	ySize: number;
	yOffset: number;
	gap: number;
}) {
	return {
		...calculateCoordinates(options),
		letter: createRandomHexCode(),
		selected: false,
	};
}
