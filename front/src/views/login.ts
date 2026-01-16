import { loadHeader, navigateTo} from "../router";
import { showToast } from "./show_toast";

export function LoginView(): string {
	return (document.getElementById("loginhtml") as HTMLFormElement).innerHTML;
}

export async function initLogin()
{
	const form = document.getElementById("login-form") as HTMLFormElement;
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const username = (document.getElementById("username") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;
		const success = await login(username, password, form)
   		if (success == 2)
			navigateTo("/twofa");
		if (success == 1) {
			navigateTo("/home");
		}
    });

	// check if not localhost => hidden google login button
	const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
	if (!isLocalhost)
		document.getElementById("div-google-login")?.classList.add("hidden")

	// Google OAuth
	const googleBtn = document.getElementById("google-login-btn");
	googleBtn?.addEventListener("click", () => {
		window.location.href = "/api/oauth/google";
		});
	const params = new URLSearchParams(window.location.search);
	const error = params.get("error");

	if (error === "account_inactive") {
		showToast("This account has been deleted and can no longer be used!", "error", 3000, "Deleted user");
	}
}

export async function login(username: string, password: string, form: HTMLFormElement): Promise<number> {
	try {
		clearLoginErrors(form);

		const res = await fetch("/api/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({username, password}),
		credentials: "include"
		});
		const result = await res.json();
		if (!result.ok) {
			if (result.field === "username") {
				document.getElementById("username-loginmsg")!.textContent = result.error;
			}
			if (result.field === "password") {
				document.getElementById("password-loginmsg")!.textContent = result.error;
			}
			return 0;
		}
		if (result.ok && result.twofa === true)
			return 2;
		return 1;
	} catch (err) {
		showToast("Network error, please try again later", "error", 2000);
		return 0; 
	}
}

function clearLoginErrors(form: HTMLFormElement) {
    const usernameInput = form.querySelector("input[name='username']") as HTMLInputElement;
    const passwordInput = form.querySelector("input[name='password']") as HTMLInputElement;

    const usernameMsg = document.getElementById("username-loginmsg") as HTMLParagraphElement;
    const passwordMsg = document.getElementById("password-loginmsg") as HTMLParagraphElement;

    [usernameMsg, passwordMsg].forEach(p => p.textContent = "");
    [usernameInput, passwordInput].forEach(p => p.classList.remove("error"));
}
