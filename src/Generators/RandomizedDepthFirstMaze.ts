import Point from '../Point';

export default function RandomizedDepthFirstMaze(grid: Point[][]) {
	const maze = grid;

	let cols = grid.length;
	let rows = grid[0].length;

	if (cols % 2 === 0) cols -= 1;
	if (rows % 2 === 0) rows -= 1;

	const stack: Point[] = [];

	for (let i = 0; i < 2; i++) {
		for (let j = 0; j < cols; j++) grid[j][i * (rows - 1)].solid = true;
		for (let j = 0; j < rows; j++) grid[i * (cols - 1)][j].solid = true;
	}

	if (grid.length % 2 === 0) for (let j = 0; j < rows; j++) grid[cols][j].solid = true;
	if (grid[0].length % 2 === 0) for (let j = 0; j < cols; j++) grid[j][rows].solid = true;

	for (let i = 0; i < cols / 2; i++) {
		for (let j = 0; j < rows; j++) {
			grid[i * 2][j].solid = true;
		}
	}

	for (let i = 0; i < cols; i++) {
		for (let j = 0; j < rows / 2; j++) {
			grid[i][j * 2].solid = true;
		}
	}

	grid[1][1].visited = true;
	stack.push(grid[1][1]);

	while (stack.length > 0) {
		const cell = stack.pop();
		if (cell == null) break;

		const neighbours = getNeighbours(grid, rows, cols, cell.i, cell.j);
		if (neighbours.length > 0) {
			stack.push(cell);
			const newCell = neighbours[Math.floor(Math.random() * neighbours.length)];

			grid[cell.i + (newCell.i - cell.i) / 2][cell.j + (newCell.j - cell.j) / 2].solid = false;

			newCell.visited = true;
			stack.push(newCell);
		}
	}

	for (const _ of grid) for (const c of _) c.visited = false;

	return [maze, maze[1][1], maze[cols - 2][rows - 2]] as [Point[][], Point, Point];
}

function getNeighbours(grid: Point[][], rows: number, cols: number, i: number, j: number) {
	const neighbours = [];

	if (i < cols - 2) neighbours.push(grid[i + 2][j]);
	if (i > 1) neighbours.push(grid[i - 2][j]);
	if (j < rows - 2) neighbours.push(grid[i][j + 2]);
	if (j > 1) neighbours.push(grid[i][j - 2]);

	return neighbours.filter(x => !x.visited);
}