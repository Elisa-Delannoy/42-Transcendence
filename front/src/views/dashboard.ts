import { logout } from "../auth";
import { navigateTo } from "../router";

export function DashboardView(): string {
  setTimeout(() => {
    const btn = document.getElementById("logout-btn")!;
    btn.addEventListener("click", () => {
      logout();
      navigateTo("/login");
    });
  }, 0);

  return (document.getElementById("dashboardhtml") as HTMLTemplateElement).innerHTML;
}
