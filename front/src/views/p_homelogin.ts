import { genericFetch, getPseudoHeader, loadHeader } from "../router";


export function homeView(): string {
	loadHeader();
	return (document.getElementById("homehtml") as HTMLTemplateElement).innerHTML;
}

export async function initHomePage() {
}


