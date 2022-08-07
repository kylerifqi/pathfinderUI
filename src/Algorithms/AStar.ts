import { Statuses } from '../helper/Constants';
import Point from '../Point';
import BaseAlgorithm from './BaseAlgorithm';

export default class AStar extends BaseAlgorithm {
	heuristic(point: Point, goal: Point) {
		const d = Math.abs(point.i - goal.i) + Math.abs(point.j - goal.j);
		return 0.5 * d;
	}

	step() {
		// Check If OpenSet Is Empty
		if (this.openSet.length > 0) {
			// Get Point With Lowest F-Cost
			let lowest = 0;
			for (let i = 0; i < this.openSet.length; i++) {
				if (this.openSet[i].fCost < this.openSet[lowest].fCost) {
					lowest = i;
				}
			}
			// Set Lowest As Current
			this.current = this.openSet[lowest];

			// Remove Current From Open And Move To Closed
			this.openSet.splice(lowest, 1);
			this.closedSet.push(this.current);

			// Check If Completed
			if (this.current === this.end) {
				this.finished = true;
				return Statuses.complete;
			}

			// Get All Neighbours F Costs
			for (let i = 0; i < this.current.neighbours.length; i++) {
				const n = this.current.neighbours[i];

				// If Solid Or Is Already Closed Then Skip
				if (n.solid || this.closedSet.includes(n)) continue;
				const newG = this.heuristic(n, this.current);

				// If Already Checked But Better Path is Found Then Update Point
				let newPath = false;
				if (this.openSet.includes(n)) {
					if (newG < n.gCost) {
						n.gCost = newG;
						newPath = true;
					}
				} else {
					n.gCost = newG;
					this.openSet.push(n);
					newPath = true;
				}

				if (newPath && this.end) {
					n.hCost = this.heuristic(n, this.end);
					n.fCost = n.gCost + n.hCost;
					n.parent = this.current;
				}
			}
		} else {
			// No Solution Was Found
			this.finished = true;
			return Statuses.failed;
		}

		return Statuses.continue;
	}
}