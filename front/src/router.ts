import { View, init } from "./views/home";
import { LoginView, initLogin } from "./views/login";
import { DashboardView, initDashboard } from "./views/p_dashboard";
import { RegisterValidView, RegisterView, initRegister } from "./views/register";
import { GameOnlineView, GameOnlineinit} from "./views/p_gameonline";
import { GameLocalView, GameLocalinit} from "./views/p_gamelocal";
import { PongMatchView, initPongMatch, stopGame} from "./views/p_pongmatch";
import { homeView, initHomePage } from "./views/p_homelogin";
import { ProfileView, initProfile} from "./views/p_profile";
import { UpdateInfoView, initUpdateInfo } from "./views/p_updateinfo";
import { TournamentView} from "./views/p_tournament";
import { initLogout } from "./views/logout";
import { fromTwos } from "ethers";
import { Statement } from "sqlite3";
import { FriendsView, initFriends } from "./views/p_friends";
import { ErrorView, initError } from "./views/error";
import { request } from "http";
import { userInfo } from "os";

const routes = [
  { path: "/", view: View, init: init},
  { path: "/login", view: LoginView, init:initLogin},
  { path: "/logout", init: initLogout},
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/registerok", view: RegisterValidView},
  { path: "/home", view: homeView, init: initHomePage},
  { path: "/dashboard", view: DashboardView, init: initDashboard },
  { path: "/friends", view: FriendsView, init: initFriends },
  { path: "/profile", view: ProfileView, init: initProfile},
  { path: "/updateinfo", view: UpdateInfoView, init: initUpdateInfo},
  { path: "/gameonline", view: GameOnlineView, init: GameOnlineinit},
  { path: "/gamelocal", view: GameLocalView, init: GameLocalinit},
  { path: "/pongmatch/:id", view: PongMatchView, init: initPongMatch, cleanup: stopGame },
  { path: "/tournament", view: TournamentView},
  { path: "/error", view: ErrorView, init:initError},

];

let currentRoute: any = null;
let currentPath: string

export function navigateTo(url: string) {
	const state = { from: window.location.pathname };
	history.pushState(state, "", url);
	currentPath = url;
	router();
	// const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	// if (avatar) 
	// 	avatar.src = "/api/private/avatar?ts=" + Date.now();
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
		throw new Error(result.error || result.message || "Unknown error");
}
	if (!res.ok){
		throw new Error(result.error || result.message || "Unknown error");
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

export async function loadHeader() {
	const response = await fetch('/header.html');
	const html = await response.text();
	const container = document.getElementById('header-container');
	if (container) container.innerHTML = html;
	getPseudoHeader();
}

export async function getPseudoHeader()
{
  try {
	const result = await genericFetch("/api/private/getpseudoAv", {
		method: "POST",
		credentials: "include"
	});
	
	document.getElementById("pseudo-header")!.textContent = result.pseudo;
	const avatar = document.getElementById("header-avatar") as HTMLImageElement;
	avatar.src = result.avatar + "?ts" + Date.now();
	} catch (err) {
		console.error(err);
	}
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
		navigateTo("/error");
		return;
		}

	const { route, params } = match;
	if (route.view)
		document.querySelector("#app")!.innerHTML = route.view(params);
	route.init?.(params);
	currentRoute = route;
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
  	// history.replaceState({ from: "/" }, "", "/");
	currentPath = window.location.pathname;
  	window.addEventListener("popstate", (event) => {	
		popState();
	});
  router();
}

function popState() {
	const path = window.location.pathname;
	const publicPath = ["/", "/login", "/register", "/logout"];
	const toIsPrivate = !publicPath.includes(path);
	const fromIsPrivate = !publicPath.includes(currentPath);
	if (!history.state.from && fromIsPrivate)
	{
		history.replaceState({ from: "/homelogin" }, "", "/homelogin");
		currentPath = "/homelogin";
		navigateTo("/logout");
	}
	else if (!history.state.from && !fromIsPrivate)
    {
		history.replaceState({ from: "/" }, "", "/");
		currentPath = "/";
	}
	else if (!toIsPrivate && fromIsPrivate)
	{
		history.replaceState( { from: "/homelogin" }, "", "/homelogin");
		currentPath = "/homelogin";
	}
	else
		currentPath = path;
	router();
}
