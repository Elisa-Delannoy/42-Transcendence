export function DashboardView(): string {
  return (document.getElementById("dashboardhtml") as HTMLTemplateElement).innerHTML;
}
