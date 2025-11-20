import { navigateTo } from "../router";

export const initLogout = async() => {
	await fetch("/api/logout", {
		method: "GET",
		credentials: "include"
		});
	navigateTo("/login");
}