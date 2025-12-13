import { navigateTo} from "../router";

let require2FA = false;

export function LoginView(): string {
	return (document.getElementById("loginhtml") as HTMLFormElement).innerHTML;
}

export async function initLogin()
{
	const res = await fetch("/api/checkLogin", { method: "GET", credentials: "include"});
	if (res.ok)
	{
		navigateTo("/home");
		return;
	}
	const form = document.getElementById("login-form") as HTMLFormElement;
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const username = (document.getElementById("username") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;
		const code = (document.getElementById("twofa-code") as HTMLInputElement)?.value;
	const success = await login(username, password, code, form)
   	if (success)
		navigateTo("/home");
    });
}

export async function login(username: string, password: string, code: string | undefined, form: HTMLFormElement): Promise<boolean> {
	try {
		clearLoginErrors(form);
		
		const twofaBox = document.getElementById("twofa-box")!;
		const twofaMsg = document.getElementById("twofa-msg")!;

		twofaMsg.textContent = "";
		if (require2FA && !code) {
			twofaMsg.textContent = "No 2FA code submitted.";
			return false;
		}

		const res = await fetch("/api/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({username, password, code}),
		credentials: "include"
		});
		const result = await res.json();
		if (result.require2FA === true) {
			require2FA = true;
			twofaBox.classList.remove("hidden");
			twofaMsg.textContent = "Please input 2FA code.";
			return false;
		}
		if (!res.ok) {
			if (result.field === "username") {
				document.getElementById("username-loginmsg")!.textContent = result.error;
			}
			if (result.field === "password") {
				document.getElementById("password-loginmsg")!.textContent = result.error;
			}
			if (result.field === "2fa") {
				twofaMsg.textContent = result.error;
			}
			return false;
		}
		return true;
	} catch (err) {
		console.error(err);
		return false;     
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


// export async function isLoggedIn(): Promise<boolean> {
// 	const res = await fetch("/api/isLoggedIn", { credentials: "include" });
// 	const result = await res.json()
// 	return result.logged;
// }


