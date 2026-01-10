import { View, init } from "./views/home";
import { LoginView, initLogin } from "./views/login";
import { DashboardView, initDashboard } from "./views/p_dashboard";
import { RegisterValidView, RegisterView, initRegister } from "./views/register";
import { GameOnlineView, GameOnlineinit} from "./views/p_gameonline";
import { GameLocalView, GameLocalinit} from "./views/p_gamelocal";
import { PongMatchView, initPongMatch, stopGame} from "./views/p_pongmatch";
import { homeView, initHomePage } from "./views/p_homelogin";
import { ProfileView, initProfile} from "./views/p_profile";
import { BracketsView, initBrackets, stopTournament} from "./views/p_brackets";
import { TournamentView} from "./views/p_tournament";
import { initLogout } from "./views/logout";
import { fromTwos } from "ethers";
import { Statement } from "sqlite3";
import { FriendsView, initFriends } from "./views/p_friends";
import { ErrorView, initError } from "./views/error";
import { request } from "http";
import { userInfo } from "os";
import { initTowfa, towfaView } from "./views/twofa";
import { UpdateEmailView, initUpdateEmail } from "./views/p_updateemail";
import { UpdateUsernameView, initUpdateUsername } from "./views/p_updateusername";
import { UpdatePasswordView, initUpdatePassword } from "./views/p_updatepassword";
import { UpdateAvatarView, initUpdateAvatar } from "./views/p_updateavatar";
import { Update2faView, initUpdate2fa } from "./views/p_update2fa";
import { initOAuthCallback } from "./views/oauth_callback";
import { InitTermsOfService, TermsOfServiceView } from "./views/terms_of_service";
import { InitPrivacyPolicy, PriavacyPolicyView } from "./views/privacypolicy";
import { PseudoHeaderResponse } from "../../back/routes/login/login";

const routes = [
  { path: "/", view: View, init: init},
  { path: "/login", view: LoginView, init: initLogin},
  { path: "/twofa", view: towfaView, init: initTowfa},
  { path: "/logout", init: initLogout},
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/registerok", view: RegisterValidView},
  { path: "/termsofservice", view: TermsOfServiceView, init: InitTermsOfService},
  { path: "/privacypolicy", view: PriavacyPolicyView, init: InitPrivacyPolicy},
  { path: "/home", view: homeView, init: initHomePage},
  { path: "/dashboard", view: DashboardView, init: initDashboard },
  { path: "/friends", view: FriendsView, init: initFriends },
  { path: "/profile", view: ProfileView, init: initProfile},
  { path: "/updateemail", view: UpdateEmailView, init: initUpdateEmail },
  { path: "/updateusername", view: UpdateUsernameView, init: initUpdateUsername },
  { path: "/updatepassword", view: UpdatePasswordView, init: initUpdatePassword },
  { path: "/updateavatar", view: UpdateAvatarView, init: initUpdateAvatar },
  { path: "/update2fa", view:Update2faView, init:initUpdate2fa },
  { path: "/gameonline", view: GameOnlineView, init: GameOnlineinit},
  { path: "/gamelocal", view: GameLocalView, init: GameLocalinit},
  { path: "/pongmatch/:id", view: PongMatchView, init: initPongMatch, cleanup: stopGame },
  { path: "/tournament", view: TournamentView},
  { path: "/brackets/:id", view: BracketsView, init: initBrackets, cleanup: stopTournament},
  { path: "/error", view: ErrorView, init:initError},
  { path: "/oauth/callback", init: initOAuthCallback },
];

let currentRoute: any = null;
let currentPath: string

export function navigateTo(url: string) {
	const state = { from: window.location.pathname };
	history.pushState(state, "", url);
	currentPath = url;
	window.scrollTo(0, 0);
	router();
}

export async function genericFetch(url: string, options: RequestInit = {})
{
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

	// const response = await fetch('/header.html');
	// const html = await response.text();
	// const container = document.getElementById('header-container');
	// if (container) {
	// 	container.innerHTML = html;	
	// 	getPseudoHeader();
	// }
	// const logged = await isLogged();
	const token = localStorage.getItem("token");
	let isLogged: boolean;
	let result: PseudoHeaderResponse | null = null;
    if (!token)
		isLogged = false;
	else {
		isLogged = true;
		result = await getPseudoHeader();
	}
	const container = document.getElementById("header-container");
	container!.innerHTML = "";
	const templateID = isLogged ? "headerconnect" : "headernotconnect";
	const template = document.getElementById(templateID) as HTMLTemplateElement
	const clone = template.content.cloneNode(true);
	container!.appendChild(clone);
	if (isLogged && result)
		displayPseudoHeader(result);
}

export async function getPseudoHeader(): Promise <PseudoHeaderResponse> {
	try {
		console.log("dans header");
		const res = await fetch("/api/private/getpseudoAvStatus", {
			method: "POST",
			credentials: "include",
		})
		console.log("res", res);
		const result = await res.json();
		console.log("result", result);
		//if (!res.ok)
		if (!result.logged)
			return { pseudo: "", avatar: "", web_status: "", notif: false }
		//const result = await res.json();
		return {logged: true, ...result};
	} catch(err) {
		console.log("errror", err);
		return {  pseudo: "", avatar: "", web_status: "", notif: false }
	}
}

export function displayPseudoHeader(result: PseudoHeaderResponse) {
	document.getElementById("pseudo-header")!.textContent = result.pseudo;
	const avatar = document.getElementById("header-avatar") as HTMLImageElement;
	const status = document.getElementById("status") as HTMLImageElement;
	avatar.src = result.avatar + "?ts" + Date.now();
	displayStatus(result, status);
	const notification = document.getElementById("notification") as HTMLImageElement;
	notification.classList.add("hidden");
	if (result.notif === true)
		notification.classList.remove("hidden");
	return true;
}

export function displayStatus(info: any, status: HTMLImageElement): void {
	switch (info.web_status)
	{
		case "online": status.classList.add("bg-green-500");
			break;
		case "busy": status.classList.add("bg-red-500");
			break;
		case "offline": status.classList.add("bg-gray-900");
	}
	status.title = info.web_status;
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
	document.querySelector("#header-container")!.innerHTML
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

export function popState() {
	const path = window.location.pathname;
	const publicPath = ["/", "/login", "/register", "/logout"];
	const toIsPrivate = !publicPath.includes(path);
	const fromIsPrivate = !publicPath.includes(currentPath);
	if (!history.state.from && fromIsPrivate)
	{
		history.replaceState({ from: "/home" }, "", "/home");
		currentPath = "/home";
		navigateTo("/logout");
	}
	else if (!history.state.from && !fromIsPrivate)
    {
		history.replaceState({ from: "/" }, "", "/");
		currentPath = "/";
	}
	else if (!toIsPrivate && fromIsPrivate)
	{
		history.replaceState( { from: "/home" }, "", "/home");
		currentPath = "/home";
	}
	else
		currentPath = path;
	router();
}
