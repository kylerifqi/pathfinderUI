export function setID(title: string, id: string) {
	const panelElm = document.evaluate(`//div[text()="${title}"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.parentElement;
	if (panelElm != null) panelElm.id = id;
}

export function getPanelElement(id: string): HTMLDivElement {
	const panelElm = document.querySelector(`#${id}.qs_main`);
	if (panelElm == null) throw new Error('Panel Element Not Found!');
	return panelElm as HTMLDivElement;
}

export function setTitle(id: string, newTitle: string) {
	const panelTitleBar: HTMLDivElement = getPanelElement(id);
	(panelTitleBar.children[0] as HTMLDivElement).innerText = newTitle;
}

export function setRangeTitleValue(title: string, newValue: string) {
	const valueElm = document.evaluate(`//b[text()="${title}:"]`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue?.parentElement;
	(valueElm as HTMLDivElement).innerHTML = `<b>${title}:</b> ${newValue}`;
}

export * as QuickSettingsLib from './QuickSettingsLib';
