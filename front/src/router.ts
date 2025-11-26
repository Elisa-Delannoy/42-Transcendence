import { HomeView } from "./views/home";
import { LoginView, initLogin } from "./views/login";
import { DashboardView } from "./views/dashboard";
import { RegisterValidView, RegisterView, initRegister } from "./views/register";
import { GameView, initGame} from "./views/p_game";
import { QuickGameView, initQuickGame, stopGame} from "./views/p_quickgame";
import { HomeLoginView, initHomePage } from "./views/p_homelogin";
import { ProfileView, initProfile} from "./views/p_profile";
import { UpdateInfoView, initUpdateInfo } from "./views/p_updateinfo";
import { TournamentView} from "./views/p_tournament";
import { initLogout } from "./views/logout";

const routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init:initLogin},
  { path: "/logout", init: initLogout},
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/registerok", view: RegisterValidView},
  { path: "/homelogin", view: HomeLoginView, init: initHomePage},
  { path: "/game", view: GameView, init: initGame},
  { path: "/quickgame/:id", view: QuickGameView, init: initQuickGame, cleanup: stopGame },
  { path: "/profile", view: ProfileView, init: initProfile},
  { path: "/updateinfo", view: UpdateInfoView, init: initUpdateInfo},
  { path: "/tournament", view: TournamentView},
  { path: "/changeusername" }
];

let currentRoute: any = null;

export function navigateTo(url: string) {
	const state = { previous: window.location.pathname};
	history.pushState(state, "", url);
  router();
}

export async function genericFetch(url: string, options: RequestInit = {}) {
	const res = await fetch(url, {
	...options,
	credentials: "include"
})
	const result = await res.json();
	if (res.status === 401) {
		if (result.error === "TokenExpiredError")
			alert("Session expired, please login")
		navigateTo("/logout");
		throw new Error(result.error);
}
	if (!res.ok){
		throw new Error(result.error);
}
	return result;
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
	//clean route who got cleanup function (game)
	if (currentRoute?.cleanup)
	{
		if (typeof currentRoute.cleanup === "function")
			currentRoute.cleanup();
	}
	const match = matchRoute(location.pathname);

	if (!match) {
		document.querySelector("#app")!.innerHTML = "<h1>404 Not Found</h1>";
		return;
	}

	const { route, params } = match;

	if (route.view)
		document.querySelector("#app")!.innerHTML = route.view(params);

	route.init?.(params);
	currentRoute = route;
	// if (!currentRoute.cleanup) {
	// 	currentRoute.cleanup = () => {};}
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
  window.addEventListener("popstate", (event) => {
	const path = window.location.pathname;
	const previous = event.state?.previous;
	const public_path = ["/", "/login", "/register"];
	const is_private = !public_path.includes(path)
	if (is_private && previous && public_path.includes(previous))
		history.replaceState( { previous: "/homelogin" }, "", "/homelogin");
	router();
	});
  router();
}
