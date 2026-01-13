import { navigateTo } from "../router";
import { chatnet } from "./p_chat";

export const initLogout = async() => {
	await fetch("/api/logout", {
		method: "GET",
		credentials: "include"
		});
	chatnet.disconnect();
	navigateTo("/login");
}