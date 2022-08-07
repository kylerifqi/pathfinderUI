import { Statuses } from '../helper/Constants';

import BaseAlgorithm from './BaseAlgorithm';

export default class DFS extends BaseAlgorithm {
	step() {
		// Check If OpenSet Is Empty
		if (this.openSet.length > 0) {
			this.current = this.openSet.pop() || null;

			if (this.current == null) throw new Error('Current is undefined!');

			if (this.closedSet.includes(this.current)) return Statuses.continue;
			this.closedSet.push(this.current);
			this.current.visited = true;

			// Check If Completed
			if (this.current === this.end) {
				this.finished = true;
				return Statuses.complete;
			}

			// Get All Neighbours
			for (let i = 0; i < this.current.neighbours.length; i++) {
				const n = this.current.neighbours[i];

				// If Solid Or Is Already Closed Then Skip
				if (n.solid || n.visited === true) continue;

				n.parent = this.current;

				this.openSet.push(n);
				// n.visited = true;
				// this.closedSet.push(n);
			}
		} else {
			// No Solution Was Found
			this.finished = true;
			return Statuses.failed;
		}

		return Statuses.continue;
	}
}