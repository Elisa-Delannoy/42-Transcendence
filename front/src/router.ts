import { HomeView } from "./views/home.ts";
import { LoginView } from "./views/login.ts";
import { DashboardView } from "./views/dashboard.ts";
import { isLoggedIn } from "./auth.ts";

const routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView },
  { path: "/dashboard", view: DashboardView },
];

export function navigateTo(url: string) {
  history.pushState(null, "", url);
  router();
}

export function router() {
  const match = routes.find((r) => r.path === location.pathname);

  if (!match) {
    document.querySelector("#app")!.innerHTML = "<h1>404 Not Found</h1>";
    return;
  }

  // Protection : dashboard → login si non connecté
  if (match.path === "/dashboard" && !isLoggedIn()) {
    return navigateTo("/login");
  }

  document.querySelector("#app")!.innerHTML = match.view();
}

export function initRouter() {
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(target.getAttribute("href")!);
    }
  });

  window.addEventListener("popstate", router);
  router();
}
