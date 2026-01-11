import { loadHeader, navigateTo} from "../router";


export function LoginView(): string {
	return (document.getElementById("loginhtml") as HTMLFormElement).innerHTML;
}

export async function initLogin()
{
	// const res = await fetch("/api/checkLogin", { method: "GET", credentials: "include"});
	// if (res.ok)
	// {
	// 	navigateTo("/home");
	// 	return;
	// }
	// const res = await fetch("/api/checkLogin", { method: "GET", credentials: "include"});
	// const data = await res.json();

    // if (data.loggedIn) {
    //     navigateTo("/home");
	// 	return;
    // }
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

	// Google OAuth
	const googleBtn = document.getElementById("google-login-btn");
	googleBtn?.addEventListener("click", () => {
		window.location.href = "/api/oauth/google";
	});
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
		localStorage.setItem("token", result.token);
		/*ajouter localstorage pour que cela fonctionne*/
		if (result.ok && result.twofa === true)
			return 2;
		return 1;
	} catch (err) {
		// console.error(err);
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
