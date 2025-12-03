import { genericFetch, getPseudoHeader, loadHeader } from "../router";


export function HomeLoginView(): string {
	loadHeader();
	return (document.getElementById("homeloginhtml") as HTMLTemplateElement).innerHTML;
}

export async function initHomePage() {
}


