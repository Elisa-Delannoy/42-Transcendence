import { HomeView } from "./views/home";
import { LoginView, initLogin} from "./views/login";
import { DashboardView } from "./views/dashboard";
import { isLoggedIn, logout } from "./auth";
import { RegisterView, initRegister } from "./views/register";
import { HomeLoginView} from "./views/p_homelogin";
import { ProfilView} from "./views/p_profil";
import { GameView, initGame} from "./views/p_game";
import { QuickGameView, initQuickGame} from "./views/p_quickgame";
import { TournamentView} from "./views/p_tournament";

const routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init:initLogin},
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/homelogin", view: HomeLoginView},
  { path: "/profil", view: ProfilView},
  { path: "/game", view: GameView, init: initGame},
  { path: "/quickgame/:id", view: QuickGameView, init: initQuickGame},
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

function matchRoute(pathname: string) {
	for (const r of routes) {
		// Route dynamique : /game/:id
		if (r.path.includes(":")) {
			const base = r.path.split("/:")[0]; // "/game"
			if (pathname.startsWith(base + "/")) {
				const id = pathname.substring(base.length + 1); // récupère "12" par ex.
				return { route: r, params: { id } };
			}
		}

		// Route statique
		if (r.path === pathname) {
			return { route: r, params: {} };
		}
	}

	return null;
}


export function router() {
//   const match = routes.find((r) => r.path === location.pathname);
	const match = matchRoute(location.pathname);

  if (!match) {
	document.querySelector("#app")!.innerHTML = "<h1>404 Not Found</h1>";
	return;
  }
  const { route, params } = match;
  document.querySelector("#app")!.innerHTML = route.view(params);
  route.init?.(params);
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

