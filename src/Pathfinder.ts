import p5 from 'p5';

import AStar from './Algorithms/AStar';
import BaseAlgorithm from './Algorithms/BaseAlgorithm';
import DFS from './Algorithms/DFS';
import Dijkstra from './Algorithms/Dijkstra';
import OpenSimplexNoiseMaze from './Generators/OpenSimplexNoiseMaze';
import RandomizedDepthFirstMaze from './Generators/RandomizedDepthFirstMaze';
import { Generators, PanelControlButtons, Statuses } from './helper/Constants';
import { DropDownSelection } from './lib/modifiedQuicksettings';
import Point from './Point';

export default class Pathfinder {
	p: p5;
	algorithm: BaseAlgorithm;

	grid: Point[][] = [];
	path: Point[] = [];
	latestGrid: Generators = 0;
	gridLines = true;

	rows: number;
	cols: number;
	cellSize: number;
	minCells = 35;

	pathfinderSpeed = 1;
	pathSpeed = 1;

	width: number;
	height: number;

	startDrag = false;
	endDrag = false;
	regDrag = false;
	mouseCell: Point | null = null;

	curStatus: Statuses = Statuses.ready;

	updateStatus: ((status: string) => void) | null = null;
	newTooltip: ((text: string, x: number, y: number) => void) | null = null;

	constructor(p: p5) {
		this.p = p;

		this.rows = this.minCells;
		this.cols = this.minCells;

		if (p.width > p.height) {
			this.cellSize = p.height / this.minCells;
			this.cols = Math.ceil(p.width / this.cellSize);
		}
		else {
			this.cellSize = p.width / this.minCells;
			this.rows = Math.ceil(p.height / this.cellSize);
		}

		this.width = this.cols * this.cellSize;
		this.height = this.rows * this.cellSize;

		this.algorithm = new AStar();
		this.algorithm.paused = true;

		this.generateGrid();
	}

	generateGrid = (index = 0, allowDiagonal = false) => {
		if (!this.algorithm.paused && (!this.algorithm.finished || !this.algorithm.pathFinished)) return this.tooltip(PanelControlButtons.grid, 'Pathfinder is Running!');

		this.latestGrid = index;

		this.grid = new Array(this.cols);

		for (let i = 0; i < this.cols; i++) {
			this.grid[i] = [];
			for (let j = 0; j < this.rows; j++) {
				this.grid[i][j] = new Point(this.p, i, j, this.p.height / this.rows, this.rows, this.cols, allowDiagonal);
				// this.grid[i][j].solid = Math.random() < 0.4;
			}
		}

		for (let i = 0; i < this.grid.length; i++) {
			for (let j = 0; j < this.grid[i].length; j++) {
				this.grid[i][j].getNeighbours(this.grid, this.rows, this.cols);
			}
		}

		let startPoint: Point;
		let endPoint: Point | null = null;

		switch (index) {
			case Generators.depthFirst: {
				[this.grid, startPoint, endPoint] = RandomizedDepthFirstMaze(this.grid);
				break;
			}
			case Generators.openSimplexNoise: {
				[this.grid, startPoint, endPoint] = OpenSimplexNoiseMaze(this.grid);
				break;
			}
			default: {
				startPoint = this.grid[Math.floor(this.cols * 0.1)][Math.round(this.rows / 2)];
				endPoint = this.grid[Math.floor(this.cols * 0.9)][Math.round(this.rows / 2)];
				break;
			}
		}

		this.algorithm.setStartEnd(startPoint, endPoint);
		this.restart(true);
	};

	changeAlgorithm = (ev: DropDownSelection<any>) => {
		const newAlgorithm: string = ev.value;
		this.restart(true);

		const oldStart = this.algorithm.start;
		const oldEnd = this.algorithm.end;

		switch (newAlgorithm) {
			case 'A*': {
				this.algorithm = new AStar();
				break;
			}
			case 'Dijkstra\'s Algorithm': {
				this.algorithm = new Dijkstra();
				break;
			}
			case 'Depth-First Search': {
				this.algorithm = new DFS();
				break;
			}
		}

		this.algorithm.paused = true;
		if (oldStart != null && oldEnd != null) this.algorithm.setStartEnd(oldStart, oldEnd);

		// this.generateGrid(this.latestGrid);
	};

	mouseAction = (mouseButton: number, i: number, j: number) => {
		if ((!this.algorithm.paused && !this.algorithm.finished) || (this.curStatus !== Statuses.ready && !this.algorithm.finished)) return;

		const cell = this.grid[i][j];

		if (!this.startDrag && !this.endDrag && !this.regDrag && mouseButton === 1) {
			this.regDrag = cell !== this.algorithm.start && cell !== this.algorithm.end;
			this.startDrag = cell === this.algorithm.start;
			this.endDrag = cell === this.algorithm.end;
		}
		this.mouseCell = cell;

		if (mouseButton === 0) {
			if (this.startDrag) this.startDrag = false;
			if (this.endDrag) this.endDrag = false;
			if (this.regDrag) this.regDrag = false;
			return;
		}

		if (this.algorithm.finished || this.startDrag || this.endDrag) return;

		if (mouseButton === 1) {
			if (cell === this.algorithm.start || cell === this.algorithm.end) return;
			cell.solid = true;
		} else if (mouseButton === 2) {
			cell.solid = false;
		}
	};

	tooltip(button: PanelControlButtons, text: string) {
		let targetElm: HTMLSpanElement | null = null;

		switch (button) {
			case PanelControlButtons.start: {
				targetElm = document.evaluate('//input[@value="Start / Resume Pathfinding"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement;
				break;
			}
			case PanelControlButtons.stop: {
				targetElm = document.evaluate('//input[@value="Stop / Pause Pathfinding"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement;
				break;
			}
			case PanelControlButtons.restart: {
				targetElm = document.evaluate('//input[@value="Restart Pathfinder"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement;
				break;
			}
			case PanelControlButtons.quick: {
				targetElm = document.evaluate('//input[@value="Quick Complete"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement;
				break;
			}
			case PanelControlButtons.grid: {
				targetElm = document.evaluate('//input[@value="Generate Grid"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLInputElement;
				break;
			}
		}

		if (targetElm == null) return;

		const rect = targetElm.getBoundingClientRect();

		const x = rect.left;
		const y = rect.top + rect.height / 2;

		this.newTooltip?.(text, x, y);
	}

	toggleGridLines = (val: boolean) => { this.gridLines = val; };

	completeLoop = () => {
		if (this.algorithm.pathFinished) return this.tooltip(PanelControlButtons.quick, 'Pathfinder Finished, Please Restart!');
		this.algorithm.paused = false;

		while (!this.algorithm.finished && this.curStatus !== Statuses.failed) this.step();

		if (this.curStatus !== Statuses.failed) this.path = this.algorithm.getPath();
	};

	start = () => {
		if (this.algorithm.finished && this.algorithm.pathFinished) return this.tooltip(PanelControlButtons.start, 'Already Completed, Please Restart!');
		if (!this.algorithm.paused) return this.tooltip(PanelControlButtons.start, 'Already Running!');
		this.algorithm.paused = false;
		if (this.algorithm.end == null) throw new Error('End Point is not defined.');
		if (!this.algorithm.finished && !this.algorithm.pathFinished) this.path = [this.algorithm.end];
		if (this.updateStatus) this.updateStatus('Running');
	};

	stop = (bypass = false) => {
		if (!bypass && this.algorithm.closedSet.length < 1) return this.tooltip(PanelControlButtons.stop, 'Already Ready to Run!');
		if (!bypass && this.algorithm.finished && this.algorithm.pathFinished) return this.tooltip(PanelControlButtons.stop, 'Already Stopped, Please Restart!');
		if (!bypass && this.algorithm.paused) return this.tooltip(PanelControlButtons.stop, 'Already Paused!');
		this.algorithm.paused = true;
		if (this.updateStatus) this.updateStatus('Paused');
	};

	restart = (bypass = false) => {
		if (!bypass && this.algorithm.closedSet.length < 1) return this.tooltip(PanelControlButtons.restart, 'Already Ready to Run!');
		if ((!this.algorithm.paused && (!this.algorithm.finished || !this.algorithm.pathFinished)) || !this.algorithm.start) return this.tooltip(PanelControlButtons.restart, 'Already Running!');
		this.algorithm.openSet = [];
		this.algorithm.openSet.push(this.algorithm.start);
		this.algorithm.closedSet = [];
		this.path = [];
		this.algorithm.pathFinished = false;
		this.algorithm.finished = false;
		this.algorithm.paused = true;
		this.curStatus = Statuses.ready;
		for (const _ of this.grid) for (const c of _) c.visited = false;
		if (this.updateStatus) this.updateStatus('Ready');
	};

	step() {
		// Update this.algorithm
		this.curStatus = this.algorithm.step();

		// Check If Completed Or Failed
		if (this.curStatus === Statuses.complete) {
			if (this.updateStatus) this.updateStatus('Successful');
		} else if (this.curStatus === Statuses.failed) {
			if (this.updateStatus) this.updateStatus('Failed');
		}
	}

	pathStep() {
		if (this.curStatus !== Statuses.failed && this.algorithm.pathStep(this.path) == null) this.algorithm.pathFinished = true;
	}

	update() {
		// If Not Finished Or Paused, Continue Pathfinding

		if (!this.regDrag) {
			if (this.startDrag) {
				if (this.mouseCell === this.algorithm.end || this.mouseCell === this.algorithm.start || this.mouseCell?.solid) return;
				this.algorithm.start = this.mouseCell;

				if (!this.algorithm.paused || this.curStatus === Statuses.ready) {
					const t = this.algorithm.finished;
					this.restart(true);
					if (t) {
						this.completeLoop();
					}
				}
			} else if (this.endDrag) {
				if (this.mouseCell === this.algorithm.end || this.mouseCell === this.algorithm.start || this.mouseCell?.solid) return;
				this.algorithm.end = this.mouseCell;
				if (this.algorithm.finished) {
					this.restart();
					this.completeLoop();
				}
			}
		}

		if (this.pathfinderSpeed === 11) while (!this.algorithm.paused && !this.algorithm.finished) this.step();
		else if (this.pathfinderSpeed < 1) {
			if (this.p.frameCount % [0, 4, 2][Math.abs(this.pathfinderSpeed - 1)]) if (!this.algorithm.paused && !this.algorithm.finished) this.step();
		} else for (let i = 0; i < this.pathfinderSpeed + 1; i++) if (!this.algorithm.paused && !this.algorithm.finished) this.step();

		if (this.pathSpeed === 11) while (!this.algorithm.paused && this.algorithm.finished && !this.algorithm.pathFinished) this.pathStep();
		else if (this.pathSpeed < 1) {
			if (this.p.frameCount % [0, 4, 2][Math.abs(this.pathSpeed - 1)]) if (!this.algorithm.paused && this.algorithm.finished && !this.algorithm.pathFinished) this.pathStep();
		} else for (let i = 0; i < this.pathSpeed + 1; i++) if (!this.algorithm.paused && this.algorithm.finished && !this.algorithm.pathFinished) this.pathStep();
	}

	draw() {
		if (this.gridLines) {
			for (let i = 0; i < this.cols + 1; i++) {
				const x = i * this.cellSize;
				this.p.stroke('gray');
				this.p.line(x, 0, x, this.rows * this.cellSize);
			}
			for (let i = 0; i < this.rows + 1; i++) {
				const y = i * this.cellSize;
				this.p.stroke('gray');
				this.p.line(0, y, this.cols * this.cellSize, y);
			}
		}

		// Draw Open Points
		for (let i = 0; i < this.algorithm.openSet.length; i++) {
			const cell = this.algorithm.openSet[i];
			if (!this.algorithm.closedSet.includes(cell)) cell.draw(this.p.color(0, 255, 0));
		}

		// Draw Closed Points
		for (let i = 0; i < this.algorithm.closedSet.length; i++) {
			const cell = this.algorithm.closedSet[i];
			if (!this.path.includes(cell)) cell.draw(this.p.color(255, 0, 0));
		}

		// Draw Path
		if (this.curStatus !== Statuses.failed) {
			const path = this.path;
			for (let i = 1; i < path.length - 1; i++) {
				const cell = path[i];
				cell.draw(this.p.color(0, 0, 255));
				const deltaX = path[i - 1].i - cell.i;
				const deltaY = path[i - 1].j - cell.j;
				const rad = Math.atan2(deltaY, deltaX) + Math.PI / 2;
				const w = cell.w / 6;
				const cellW = cell.w;
				const cellX = (cell.i * cellW) + cellW / 2;
				const cellY = (cell.j * cellW) + cellW / 2;
				this.p.push();
				this.p.fill(130, 175, 255);
				this.p.stroke(130, 175, 255);
				this.p.strokeWeight(1);
				this.p.strokeJoin(this.p.ROUND);
				this.p.strokeWeight(3);
				if (cell !== this.algorithm.end?.parent) this.p.line(cellX, cellY, (path[i - 1].i * cellW) + cellW / 2, (path[i - 1].j * cellW) + cellW / 2);
				this.p.translate(cell.pos.x + this.cellSize / 2, cell.pos.y + this.cellSize / 2);
				this.p.rotate(rad);
				this.p.triangle(0, -w, -w, w, w, w);
				this.p.pop();
				this.p.strokeWeight(1);
			}
		}

		// Draw Solid
		for (let i = 0; i < this.cols; i++) {
			for (let j = 0; j < this.rows; j++) {
				const cell = this.grid[i][j];
				if (cell.solid) cell.draw(this.p.color(55), this.mouseCell === cell && this.regDrag && this.curStatus === Statuses.ready ? 1.3 : 1);
				// if (point.visited) point.draw(this.p.color(255, 0, 0));
			}
		}

		// Draw Start And End
		this.algorithm.start?.draw(this.p.color(255, 255, 0), this.startDrag ? 1.5 : 1);
		this.algorithm.end?.draw(this.p.color(0, 255, 255), this.endDrag ? 1.5 : 1);
		// this.algorithm.current?.draw(this.p.color(0, 0, 255));

		// Draw Grid Lines
		// if (this.gridLines) {
		// 	for (let i = 0; i < this.cols + 1; i++) {
		// 		const x = i * this.cellSize;
		// 		this.p.stroke('black');
		// 		this.p.line(x, 0, x, this.rows * this.cellSize);
		// 	}
		// 	for (let i = 0; i < this.rows + 1; i++) {
		// 		const y = i * this.cellSize;
		// 		this.p.stroke('black');
		// 		this.p.line(0, y, this.cols * this.cellSize, y);
		// 	}
		// }
	}
}