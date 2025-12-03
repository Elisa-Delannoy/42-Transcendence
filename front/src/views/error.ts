import { navigateTo } from "../router";

export function ErrorView() {
	return (document.getElementById("errorhtml") as HTMLTemplateElement).innerHTML;
}

export function initError() {
}