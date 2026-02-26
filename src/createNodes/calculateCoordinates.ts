function calculateCoordinate(options: {
	index: number;
	size: number;
	offset: number;
	gap: number;
}) {
	return options.index * (options.size + options.gap) + options.offset;
}

export function calculateCoordinates(options: {
	xIndex: number;
	xSize: number;
	xOffset: number;
	yIndex: number;
	ySize: number;
	yOffset: number;
	gap: number;
}) {
	return {
		x: calculateCoordinate({
			gap: options.gap,
			index: options.xIndex,
			offset: options.xOffset,
			size: options.xSize,
		}),
		y: calculateCoordinate({
			gap: options.gap,
			index: options.yIndex,
			offset: options.yOffset,
			size: options.ySize,
		}),
	};
}
