import { navigateTo, genericFetch, loadHeader } from "../router";

export function BracketsView(): string {
	loadHeader();
	return (document.getElementById("bracketshtml") as HTMLTemplateElement).innerHTML;
}

export function initBrackets() {

}