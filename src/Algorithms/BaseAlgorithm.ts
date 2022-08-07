import { Statuses } from '../helper/Constants';
import Point from '../Point';

export default class BaseAlgorithm {
	// Initialize Variables
	openSet: Point[] = [];
	closedSet: Point[] = [];

	start: Point | null = null;
	end: Point | null = null;
	current: Point | null = null;

	pathFinished = false;
	finished = false;
	paused = false;

	setStartEnd(start: Point, end: Point) {
		this.start = start;
		this.end = end;
		this.start.solid = false;
		this.end.solid = false;

		// Push Start Point To Openset
		this.openSet.push(this.start);
		this.start.visited = true;
	}

	getPath() {
		if (this.end == null) throw new Error('End Point is not defined.');

		const path: Point[] = [this.end];

		while (true) {
			const pathStatus = this.pathStep(path);
			if (pathStatus == null) break;
		}

		return path;
	}

	pathStep(path: Point[]) {
		const cell = path[path.length - 1];

		if (cell === this.start) return null;
		if (cell == null) throw new Error('Cell not found!');

		if (cell.parent) path.push(cell.parent);
		else return null;

		return true;
	}

	step(): Statuses {
		return Statuses.ready;
	}
}