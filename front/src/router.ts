import { HomeView } from "./views/home";
import { LoginView, toLogin} from "./views/login";
import { DashboardView } from "./views/dashboard";
import { isLoggedIn, logout } from "./auth";
import { RegisterView, initRegister } from "./views/register";
import { HomeLoginView} from "./views/p_homelogin";
import { ProfilView} from "./views/p_profil";
import { GameView} from "./views/p_game";
import { TournamentView} from "./views/p_tournament";

const routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init:toLogin},
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/homelogin", view: HomeLoginView},
  { path: "/profil", view: ProfilView},
  { path: "/game", view: GameView },
  { path: "/tournament", view: TournamentView}
];

export function navigateTo(url: string) {
  history.pushState(null, "", url);
  router();
}

export function updateNav() {
	const publicNav = document.getElementById("public-nav")!;
	const privateNav = document.getElementById("private-nav")!;

	if (isLoggedIn()) {
	  publicNav.style.display = "none";
	  privateNav.style.display = "block";
	const button = document.getElementById("butlogout")!;
	  button.addEventListener("click", () => {
	  logout();
	updateNav();
	  navigateTo("/");
	  });
	}	else {
  	publicNav.style.display = "block";
	  privateNav.style.display = "none";
	}
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
  updateNav();
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
  localStorage.removeItem("token") /*a enlever quand logout ok*/
  router();
}

