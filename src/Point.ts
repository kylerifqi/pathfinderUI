import p5 from 'p5';

export default class Point {
	// Initialize Variables
	p: p5;
	pos: p5.Vector;
	solid: boolean;

	// Position in grid
	i: number;
	j: number;

	// Width
	w: number;

	// Row Column
	r: number;
	c: number;

	gCost: number;
	hCost: number;
	fCost: number;

	neighbours: Point[] = [];
	parent: Point | null = null;
	visited = false;

	diagonal = false;

	constructor(p: p5, i: number, j: number, w: number, r: number, c: number, d: boolean) {
		// Set Variables
		this.p = p;
		this.pos = p.createVector(w * i, w * j);
		this.solid = false;

		this.i = i;
		this.j = j;
		this.w = w;

		this.r = r;
		this.c = c;

		this.diagonal = d;

		this.gCost = 0;
		this.hCost = 0;
		this.fCost = 0;
	}

	getNeighbours(grid: Point[][], rows: number, cols: number) {
		const atRight = this.i < cols - 1;
		const atBottom = this.j < rows - 1;
		const atLeft = this.i > 0;
		const atTop = this.j > 0;

		// If Diagonal, get diag neighbours
		if (this.diagonal) {
			if (atTop && atRight) this.neighbours.push(grid[this.i + 1][this.j - 1]);
			if (atRight && atBottom) this.neighbours.push(grid[this.i + 1][this.j + 1]);
			if (atBottom && atLeft) this.neighbours.push(grid[this.i - 1][this.j + 1]);
			if (atLeft && atTop) this.neighbours.push(grid[this.i - 1][this.j - 1]);
		}

		// Get 4 Surrounding Neighbours
		if (atTop) this.neighbours.push(grid[this.i][this.j - 1]);
		if (atRight) this.neighbours.push(grid[this.i + 1][this.j]);
		if (atBottom) this.neighbours.push(grid[this.i][this.j + 1]);
		if (atLeft) this.neighbours.push(grid[this.i - 1][this.j]);
	}

	draw(clr: p5.Color, sizeMult = 1) {
		// Draw Point
		this.p.push();
		const size = (this.w + 0.75) * sizeMult;

		this.p.rectMode(this.p.CENTER);
		this.p.fill(clr);
		this.p.noStroke();
		this.p.rect(this.pos.x + this.w / 2, this.pos.y + this.w / 2, size);
		this.p.pop();
	}
}