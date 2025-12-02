import { loadHeader } from "../router";

export function DashboardView(): string {
	loadHeader();
	return (document.getElementById("dashboardhtml") as HTMLTemplateElement).innerHTML;
}
