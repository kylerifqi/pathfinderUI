import AStar from '../Algorithms/AStar';
import { Statuses } from '../helper/Constants';
import OpenSimplexNoise from '../lib/OpenSimplexNoise';
import Point from '../Point';

export default function OpenSimplexNoiseMaze(grid: Point[][]) {
	const offset = 0.25;
	const tolerance = 0; // -1 -> 1

	const pathfinder = new AStar();
	let curStatus = Statuses.ready;
	let passable = false;

	const startPoint = grid[0][0];
	const endPoint = grid[grid.length - 1][grid[1].length - 1];

	while (!passable) {
		const noise = new OpenSimplexNoise(Date.now());
		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				grid[i][j].solid = noise.noise2D(i * offset, j * offset) > tolerance;
			}
		}

		pathfinder.setStartEnd(startPoint, endPoint);
		pathfinder.openSet = [];
		if (pathfinder.start) pathfinder.openSet.push(pathfinder.start);
		pathfinder.closedSet = [];
		pathfinder.pathFinished = false;
		pathfinder.finished = false;

		curStatus = Statuses.ready;
		while (!pathfinder.finished && curStatus !== Statuses.failed) curStatus = pathfinder.step();

		// console.log([
		// 	'complete',
		// 	'failed',
		// 	'continue',
		// 	'ready'
		// ][curStatus]);

		if (curStatus === 0) passable = true;
	}

	return [grid, startPoint, endPoint] as [Point[][], Point, Point];
}