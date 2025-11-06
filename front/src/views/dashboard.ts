import { logout } from "../auth.ts";
import { navigateTo } from "../router.ts";

export function DashboardView(): string {
  setTimeout(() => {
    const btn = document.getElementById("logout-btn")!;
    btn.addEventListener("click", () => {
      logout();
      navigateTo("/login");
    });
  }, 0);

  return `
    <h1>Dashboard 🎮</h1>
    <button id="logout-btn">Se déconnecter</button>
  `;
}
