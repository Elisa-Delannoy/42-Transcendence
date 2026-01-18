import { View, init } from "./views/home";
import { LoginView, initLogin } from "./views/login";
import { DashboardView, initDashboard } from "./views/p_dashboard";
import { RegisterView, initRegister } from "./views/register";
import { GameOnlineView, GameOnlineinit} from "./views/p_gameonline";
import { GameLocalView, GameLocalinit} from "./views/p_gamelocal";
import { PongMatchView, initPongMatch, stopGame} from "./views/p_pongmatch";
import { homeView, initHomePage } from "./views/p_homelogin";
import { ProfileView, initProfile} from "./views/p_profile";
import { BracketsView, initBrackets, stopTournament} from "./views/p_brackets";
import { TournamentView} from "./views/p_tournament";
import { initLogout } from "./views/logout";
import { FriendsView, initFriends } from "./views/p_friends";
import { ErrorView, initError } from "./views/error";
import { initTowfa, towfaView } from "./views/twofa";
import { UpdateEmailView, initUpdateEmail } from "./views/p_updateemail";
import { UpdateUsernameView, initUpdateUsername } from "./views/p_updateusername";
import { UpdatePasswordView, initUpdatePassword } from "./views/p_updatepassword";
import { SetGGPasswordView, initSetGGPassword } from "./views/p_updatepassgg";
import { UpdateAvatarView, initUpdateAvatar } from "./views/p_updateavatar";
import { Update2faView, initUpdate2fa } from "./views/p_update2fa";
import { initOAuthCallback } from "./views/oauth_callback";
import { InitTermsOfService, TermsOfServiceView } from "./views/terms_of_service";
import { InitPrivacyPolicy, PriavacyPolicyView } from "./views/privacypolicy";
import { InitLeaderboard, LeaderboardView } from "./views/p_leaderboard";
import { chatnet, displayChat } from "./views/p_chat";
import { showToast } from "./views/show_toast";
import { achievementsView, initAchievement } from "./views/p_achievement";
import { endGameView, InitEndGame } from "./views/p_endgame";

const routes = [
  { path: "/", view: View, init: init},
  { path: "/login", view: LoginView, init: initLogin},
  { path: "/twofa", view: towfaView, init: initTowfa},
  { path: "/logout", init: initLogout},
  { path: "/register", view: RegisterView, init: initRegister},
  { path: "/termsofservice", view: TermsOfServiceView, init: InitTermsOfService},
  { path: "/privacypolicy", view: PriavacyPolicyView, init: InitPrivacyPolicy},
  { path: "/home", view: homeView, init: initHomePage},
  { path: "/dashboard", view: DashboardView, init: initDashboard },
  { path: "/friends", view: FriendsView, init: initFriends },
  { path: "/profile", view: ProfileView, init: initProfile},
  { path: "/updateemail", view: UpdateEmailView, init: initUpdateEmail },
  { path: "/updateusername", view: UpdateUsernameView, init: initUpdateUsername },
  { path: "/updatepassword", view: UpdatePasswordView, init: initUpdatePassword },
  { path: "/setggpass", view: SetGGPasswordView, init: initSetGGPassword },
  { path: "/updateavatar", view: UpdateAvatarView, init: initUpdateAvatar },
  { path: "/update2fa", view:Update2faView, init:initUpdate2fa },
  { path: "/leaderboard", view: LeaderboardView, init: InitLeaderboard},
  { path: "/achievement", view: achievementsView, init: initAchievement},
  { path: "/gameonline", view: GameOnlineView, init: GameOnlineinit},
  { path: "/gamelocal", view: GameLocalView, init: GameLocalinit},
  { path: "/pongmatch/:id", view: PongMatchView, init: initPongMatch, cleanup: stopGame },
  { path: "/endgame", view: endGameView, init: InitEndGame},
  { path: "/tournament", view: TournamentView},
  { path: "/brackets/:id", view: BracketsView, init: initBrackets, cleanup: stopTournament},
  { path: "/error", view: ErrorView, init:initError},
  { path: "/oauth/callback", init: initOAuthCallback },
];

const publicPath = ["/", "/login", "/register", "/logout", "/registerok", "/oauth/callback", "/twofa"];

let currentRoute: any = null;
let currentPath: string;

export interface headerResponse {
	pseudo: string;
	avatar: string;
	web_status: string;
	xp: number;
	lvl: number;
}

export type LogStatusAndInfo = { 
	status: "logged" | "expired" | "not_logged" | "error";
	logged: boolean;
	notif: boolean;
	user: headerResponse | null;
}

let isReloaded = false;
const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
if (nav && nav.type === "reload")
	isReloaded = true;

const HISTORY_KEY = "historyStack";

function getHistoryStack(): string[] {
	return JSON.parse(sessionStorage.getItem(HISTORY_KEY) ?? "[]");
}

function saveHistoryStack(stack: string[]) {
	sessionStorage.setItem(HISTORY_KEY, JSON.stringify(stack));
}

export function navigateTo(url: string) {
	const state = { from: window.location.pathname };
	history.pushState(state, "", url);
	currentPath = url;

	const stack = getHistoryStack();
	stack.push(currentPath);
	if (stack.length > 10) {
		stack.shift();
	}
	saveHistoryStack(stack);

	window.scrollTo(0, 0);
	router().catch(err => console.error("Router error:", err));;
}

export function getPreviousPath() {
	const stack = getHistoryStack();
	return stack[stack.length - 1] ?? null;
}

export function getBeforePreviousPath() {
	const stack = getHistoryStack();
	return stack[stack.length - 2] ?? null;
}

export function setBeforePreviousPath(path: string) {
	const stack = getHistoryStack();
	stack[stack.length - 2] = path;
}

export async function checkLogStatus(): Promise<LogStatusAndInfo> {
	try	{	
		const res = await fetch("/api/checkLogged", {
			credentials: "include"
		})
		const result = await res.json();
 		if (result.error || !res.ok) {
			if (result.error === "TokenExpiredError")
				return { status: "expired", logged: false, notif: result.notif, user: null };
			return { status: "error", logged: false, notif: result.notif, user: null }			
		}
		if (result.loggedIn === true)
			return { status: "logged", logged: true, notif: result.notif, user: { pseudo: result.user.pseudo, avatar: result.user.avatar, web_status: result.user.status, xp: result.user.xp, lvl: result.user.lvl } };
		return { status: "not_logged", logged: false, notif: result.notif, user: null };
	} catch {
		return { status: "error", logged: false, notif: false, user: null };
	}
}

export async function genericFetch(url: string, options: RequestInit = {})
{
	const res = await fetch(url, {
		...options,
		credentials: "include"
	})
	const result = await res.json();
	if (result.error) {
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

function initSwitch()
{
	const root = document.documentElement;
	const switchInput = document.getElementById('theme-switch') as HTMLInputElement;
	if ( localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches))
	{
		root.classList.add('dark');
		switchInput.checked = true;
	}
	switchInput.addEventListener('change', () => {
		if (switchInput.checked)
		{
			root.classList.add('dark');
			localStorage.theme = 'dark';
		}
		else
		{
			root.classList.remove('dark');
			localStorage.theme = 'light';
		}
	});
}

export async function loadHeader(auth: LogStatusAndInfo) {
	const container = document.getElementById("header-container");
	container!.innerHTML = "";
	const templateID = auth.logged ? "headerconnect" : "headernotconnect";
	const template = document.getElementById(templateID) as HTMLTemplateElement
	const clone = template.content.cloneNode(true);
	container!.appendChild(clone);
	if (auth.logged)
	{
		displayPseudoHeader(auth.user!, auth!.notif);
		initSwitch();
	}
}

export function displayPseudoHeader(result: headerResponse, notif: boolean)
{
	document.getElementById("pseudo-header")!.textContent = result.pseudo;
	const avatar = document.getElementById("header-avatar") as HTMLImageElement;
	const status = document.getElementById("status") as HTMLImageElement;
	avatar.src = result.avatar + "?ts" + Date.now();
	displayStatus(result, status);
	const notification = document.getElementById("notification") as HTMLImageElement;
	notification.classList.add("hidden");
	if (notif === true)
		notification.classList.remove("hidden");
	setTimeout(() => {
		const bar = document.getElementById("progress-xp") as HTMLDivElement;
		const progress = (result.xp / 20000) * 100;
		bar.style.width = `${progress}%`;
	}, 50);
	
	(document.getElementById("lvl-header") as HTMLSpanElement).textContent = result.lvl.toString();
}

export function displayStatus(info: any, status: HTMLSpanElement): void {
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

export async function router() {
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
	if (location.pathname !== "/logout") {
		const auth: LogStatusAndInfo = await checkLogStatus();
		if (auth.status === "expired" || auth.status === "error") {
			if (auth.status === "expired") {
				showToast("Session expired. Please log in again.", "warning", 2000);
				setTimeout(() => navigateTo("/logout"), 300);
				return;
			}	  
			if (auth.status === "error") {
				showToast("Authentication error. Please log in again.", "error", 2000);
				setTimeout(() => navigateTo("/logout"), 300);
				return;
			}
		}
		if ((isReloaded || (window.location.pathname === "/home" && (!history.state || (publicPath.includes(history.state.from)))))) {
			chatnet.connect( () => {
				chatnet.toKnowUserID();
				displayChat()
			});
			auth.user!.web_status = "online";
			isReloaded = false;
		}
		loadHeader(auth);
		if (publicPath.includes(location.pathname) && auth.logged)
			navigateTo("/home");
		if (!publicPath.includes(location.pathname) && !auth.logged && location.pathname !== "/termsofservice" && location.pathname !== "/privacypolicy")
			navigateTo("/");
	}

	const { route, params } = match;
	document.querySelector("#header-container")!.innerHTML
	if (route.view)
		document.querySelector("#app")!.innerHTML = route.view(params);
	route.init?.(params);
	currentRoute = route;
}

export async function initRouter() {
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
	currentPath = window.location.pathname;
	window.addEventListener("popstate", async () => {	
		await popState();
	});
	await router();
}

export async function popState() {
	const path = window.location.pathname;
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
	await router();
}
