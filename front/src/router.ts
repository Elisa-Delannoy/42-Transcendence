import { HomeView } from "./views/home";
import { LoginView, initLogin } from "./views/login";
import { DashboardView } from "./views/dashboard";
import { RegisterView, initRegister } from "./views/register";
import { HomeLoginView, initHomePage} from "./views/p_homelogin";
import { ProfilView} from "./views/p_profil";
import { GameView, initGame} from "./views/p_game";
import { TournamentView} from "./views/p_tournament";
import { initLogout } from "./views/logout";

const routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init:initLogin},
  { path: "/logout", init: initLogout},
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/homelogin", view: HomeLoginView, init: initHomePage},
  { path: "/profil", view: ProfilView},
  { path: "/game", view: GameView, init: initGame},
  { path: "/tournament", view: TournamentView}
];

export function navigateTo(url: string) {
  history.pushState(null, "", url);
  router();
}

export async function genericFetch(url: string, options: RequestInit = {}) {
	const res = await fetch(url, {
		...options,
		credentials: "include"
	});
	if (res.status === 401) {
		navigateTo("/login");
		throw new Error("Unauthorized");
	}
	if (!res.ok){
		throw new Error(`Error: ${res.status}`);
	}
	return res;
}

export function router() {
  const match = routes.find((r) => r.path === location.pathname);
	console.log(match);
  if (!match) {
	document.querySelector("#app")!.innerHTML = "<h1>404 Not Found</h1>";
	return;
  }
  if (match.view)
  	document.querySelector("#app")!.innerHTML = match.view();
  match.init?.();
  if (match.path == "/game")
  {
    const script = document.createElement("script");
    script.src = "/src/game/game.js";
    script.defer = true;
    document.body.appendChild(script);
  }
}

export function initRouter() {
  document.body.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest("[data-link]") as HTMLElement | null;
    if (link) {
      e.preventDefault();
      const url = (link as HTMLAnchorElement).getAttribute("href");
      if (url) {
        navigateTo(url);
      }
    }
  });
  window.addEventListener("popstate", router);
  router();
}
