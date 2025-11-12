import { HomeView } from "./views/home";
import { LoginView } from "./views/login";
import { DashboardView } from "./views/dashboard";
import { isLoggedIn } from "./auth";
import { RegisterView, initRegister } from "./views/register";

const routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView },
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister}
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
  match.init?.();
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
