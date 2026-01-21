import { navigateTo } from "../router";
import { hideChat } from "./p_chat";
import { showToast } from "./show_toast";

export const initLogout = async() => {
	try {
		const res = await fetch("/api/logout", {
			method: "GET",
			credentials: "include"
		});
		const data = await res.json();

		if (!res.ok) 
			throw new Error(data?.error || "Logout failed");
		hideChat();
		navigateTo("/login")
	} catch (err: any) {
		showToast(err.message, "error", 0, "Logout error");
	}
}