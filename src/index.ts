import p5 from 'p5';
import QuickSettings, { QuickSettingsPanel } from './lib/modifiedQuicksettings';

import { QuickSettingsLib } from './helper/QuickSettingsLib';
import Pathfinder from './Pathfinder';

const s = (p: p5) => {
	let pathfinder: Pathfinder;
	let canvas: p5.Renderer;

	let controlPanel: QuickSettingsPanel;
	let gridPanel: QuickSettingsPanel;

	let infoOpened = false;

	const upArrow = '▲';
	const downArrow = '▼';

	const tooltips: HTMLSpanElement[] = [];
	const newTooltip = (text: string, x: number, y: number) => {
		let tooltipContainer = document.querySelector('#tooltipContainer');

		if (tooltipContainer == null) {
			tooltipContainer = document.createElement('div') as HTMLDivElement;
			tooltipContainer.id = 'tooltipContainer';
			document.body.appendChild(tooltipContainer);
		}

		const tooltip = document.createElement('span') as HTMLSpanElement;

		tooltip.className = 'tooltiptext';
		tooltip.innerText = text;
		tooltipContainer.appendChild(tooltip);

		const tooltipRect = tooltip.getBoundingClientRect();

		tooltip.style.left = `${x - tooltipRect.width - 5}px`;
		tooltip.style.top = `${y - tooltipRect.height / 2}px`;
		tooltip.style.opacity = '5';

		tooltips.push(tooltip);
	};

	p.setup = () => {
		canvas = p.createCanvas(innerWidth, innerHeight);
		canvas.position(0, 0);

		canvas.elt.addEventListener('contextmenu', rightClick);

		pathfinder = new Pathfinder(p);

		QuickSettings.useExtStyleSheet();

		controlPanel = QuickSettings.create(innerWidth - 220, 20, 'Pathfinder Control Panel') //eslint-disable-line
			.addDropDown('Pathfinder:', [
				'A*',
				'Dijkstra\'s Algorithm',
				'Depth-First Search'
			], pathfinder.changeAlgorithm)
			.addRange('Pathfinder Speed', 0, 12, 2, 1, (value) => {
				const speedMap = ['0.5', '0.25'];
				QuickSettingsLib.setRangeTitleValue('Pathfinder Speed', value === 12 ? '∞' : `${value < 2 ? speedMap[Math.abs(value - 1)] : (value - 1).toString()}x`);
				pathfinder.pathfinderSpeed = value - 1;
			})
			.addRange('Path Speed', 0, 12, 2, 1, (value) => {
				const speedMap = ['0.5', '0.25'];
				QuickSettingsLib.setRangeTitleValue('Path Speed', value === 12 ? '∞' : `${value < 2 ? speedMap[Math.abs(value - 1)] : (value - 1).toString()}x`);
				pathfinder.pathSpeed = value - 1;
			})
			.addButton('Start / Resume Pathfinding', pathfinder.start)
			.addButton('Stop / Pause Pathfinding', pathfinder.stop)
			.addButton('Restart Pathfinder', pathfinder.restart)
			.addButton('Quick Complete', pathfinder.completeLoop)
			.addHTML('Dropdown', `<button id="showmore_btn">${upArrow}</button>`)
			.addTextArea('Pathfinder Info', 'Path Length: 10\nNodes Expanded: 15\nYo mama: lol')
			.disableControl('Pathfinder Info')
			.hideControl('Pathfinder Info');

		document.getElementById('showmore_btn')!.onclick = (ev) => { // eslint-disable-line
			const elm = ev.target as HTMLButtonElement;

			if (elm.innerHTML === upArrow) {
				elm.innerHTML = downArrow;
				infoOpened = true;
				controlPanel.showControl('Pathfinder Info');
			} else {
				elm.innerHTML = upArrow;
				infoOpened = false;
				controlPanel.hideControl('Pathfinder Info');
			}
		};

		QuickSettingsLib.setRangeTitleValue('Pathfinder Speed', '1x');
		QuickSettingsLib.setRangeTitleValue('Path Speed', '1x');

		QuickSettingsLib.setID('Pathfinder Control Panel', 'mainPanel');
		QuickSettingsLib.setTitle('mainPanel', 'Pathfinder Control Panel\n( Status: Ready )');

		gridPanel = QuickSettings.create(innerWidth - 440, 20, 'Grid Control Panel')
			.addDropDown('Grid Generator Type:', [
				'Blank',
				'Depth-First Maze',
				'OpenSimplexNoise'
			])
			.addButton('Generate Grid', () => pathfinder.generateGrid(gridPanel.getValue('Grid Generator Type:').index, gridPanel.getValue('Allow Diagonal (New Grid)')))
			.addBoolean('Allow Diagonal (New Grid)', false)
			.addBoolean('Show Grid Lines', pathfinder.gridLines, pathfinder.toggleGridLines)
			.addHTML('Mouse Controls', `<div class="qs_label"><b>Mouse Controls:</b></div><div class="mouseControls">
				<b>Left Click/Drag -</b> Create Solid</br>
				<b>Right Click/Drag -</b> Remove Solid</br>
				<b>Drag End/Start -</b> Move Cell
			</div>`);

		pathfinder.updateStatus = (status: string) => QuickSettingsLib.setTitle('mainPanel', `Pathfinder Control Panel\n( Status: ${status} )`);
		pathfinder.newTooltip = newTooltip;
	};

	const mouseClick = (mouseButton: number) => {
		const i = Math.floor(p.mouseX / pathfinder.cellSize);
		const j = Math.floor(p.mouseY / pathfinder.cellSize);

		if (i < 0 || i > pathfinder.cols - 1 || j < 0 || j > pathfinder.rows - 1) return;

		pathfinder.mouseAction(mouseButton, i, j);
	};

	const rightClick = (ev: PointerEvent) => {
		mouseClick(2);
		ev.preventDefault();
	};
	// p.mouseReleased = () => { if (pathfinder.regDrag) pathfinder.regDrag = false; };
	p.mouseReleased = () => { mouseClick(0); };
	p.mousePressed = () => mouseClick(1);
	p.mouseDragged = (ev: MouseEvent) => mouseClick(ev.buttons);

	p.windowResized = () => {
		p.resizeCanvas(innerWidth, innerHeight);
		canvas.position(0, 0);

		Array.from(document.getElementsByClassName('qs_main')).forEach(e => {
			const elm = e as HTMLDivElement;
			const { x, width: w } = elm.getBoundingClientRect();
			const padding = 20;
			if (x + w > innerWidth) elm.style.left = `${innerWidth - (w + padding)}px`;
		});

		pathfinder.stop(true);
		pathfinder.restart(true);

		pathfinder.rows = pathfinder.minCells;
		pathfinder.cols = pathfinder.minCells;

		if (p.width > p.height) {
			pathfinder.cellSize = p.height / pathfinder.minCells;
			pathfinder.cols = Math.ceil(p.width / pathfinder.cellSize);
		}
		else {
			pathfinder.cellSize = p.width / pathfinder.minCells;
			pathfinder.rows = Math.ceil(p.height / pathfinder.cellSize);
		}

		pathfinder.width = pathfinder.cols * pathfinder.cellSize;
		pathfinder.height = pathfinder.rows * pathfinder.cellSize;

		pathfinder.generateGrid(pathfinder.latestGrid);
	};

	const update = () => {
		pathfinder.update();

		if (infoOpened) {
			const infoElm = (document.evaluate('//b[text()="Pathfinder Info"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.parentElement?.parentElement?.children[1] as HTMLTextAreaElement);
			if (infoElm == null) return;

			infoElm.rows = 9;

			const pathLength = pathfinder.path.length;
			const expanded = pathfinder.algorithm.openSet.length + pathfinder.algorithm.closedSet.length;

			infoElm.value = `Path Length: ${pathLength < 2 ? 'N/A' : pathLength - 2}\n`
				+ `Nodes Expanded: ${expanded < 2 ? 'N/A' : expanded - 1}\n`
				+ `Rows, Columns: ${pathfinder.rows}, ${pathfinder.cols}\n`
				+ `Current Grid Type: ${[
					'Blank',
					'Depth-First Maze',
					'OpenSimplexNoise'
				][pathfinder.latestGrid]}\n`
				+ '\n'
				+ `Frame Count: ${p.frameCount}\n`
				+ `Frame Rate: ${p.frameRate().toFixed(0)}\n`
				+ `Screen Width: ${innerWidth}\n`
				+ `Screen Height: ${innerHeight}`
				+ '\n';

			infoElm.style.height = `${infoElm.scrollHeight}px`;
		}

		for (const tooltip of tooltips) {
			const opacity = +tooltip.style.opacity;
			tooltip.style.opacity = (opacity - 0.05).toString();

			if (opacity < 0) tooltip.remove();
		}
	};

	p.draw = () => {
		update();
		p.background(155);

		pathfinder.draw();
	};
};

new p5(s);