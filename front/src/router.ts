import { HomeView } from "./views/home";
import { LoginView, initLogin } from "./views/login";
import { DashboardView } from "./views/dashboard";
import { RegisterView, initRegister } from "./views/register";
import { HomeLoginView, initHomePage} from "./views/p_homelogin";
import { ProfilView} from "./views/p_profil";
import { GameView, initGame} from "./views/p_game";
import { QuickGameView, initQuickGame} from "./views/p_quickgame";
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
  { path: "/quickgame/:id", view: QuickGameView, init: initQuickGame},
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

function matchRoute(pathname: string) {
	for (const r of routes)
	{
		if (r.path.includes(":")) {
			const base = r.path.split("/:")[0];
			if (pathname.startsWith(base + "/")) {
				const id = pathname.substring(base.length + 1);
				return { route: r, params: { id } };
			}
		}
		if (r.path === pathname) {
			return { route: r, params: {} };
		}
	}
	return null;
}

export function router() {
	const match = matchRoute(location.pathname);
  if (!match) {
	document.querySelector("#app")!.innerHTML = "<h1>404 Not Found</h1>";
	return;
  }
  const { route, params } = match;
  if (route.view)
  	document.querySelector("#app")!.innerHTML = route.view(params);
  route.init?.(params);
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
