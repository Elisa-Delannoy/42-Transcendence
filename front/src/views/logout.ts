import { navigateTo } from "../router";
import { hideChat } from "./p_chat";

export const initLogout = async() => {
	await fetch("/api/logout", {
		method: "GET",
		credentials: "include"
		});
	hideChat();
	navigateTo("/login");
}