import { navigateTo, genericFetch} from "../router";

export function LoginView(): string {
	return (document.getElementById("loginhtml") as HTMLFormElement).innerHTML;
}

export async function initLogin()
{
	const res = await fetch("/api/checkLogin", { method: "GET", credentials: "include"});
	if (res.ok)
	{
		navigateTo("/home");
	}
	const form = document.getElementById("login-form") as HTMLFormElement;
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const username = (document.getElementById("username") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;
	
	const success = await login(username, password, form)
   	if (success)
		navigateTo("/home");
    });
}

export async function login(username: string, password: string, form: HTMLFormElement): Promise<boolean> {
try {
	const res = await fetch("/api/login", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({username, password}),
	credentials: "include"
	});
	const result = await res.json();

	const usernameInput = form.querySelector("input[name='username']") as HTMLInputElement;
	const passwordInput = form.querySelector("input[name='password']") as HTMLInputElement;

	const usernameMsg = document.getElementById("username-loginmsg") as HTMLParagraphElement;
	const passwordMsg = document.getElementById("password-loginmsg") as HTMLParagraphElement;

	[usernameMsg, passwordMsg].forEach(p => p!.textContent = "");
	[usernameInput, passwordInput].forEach(p => p!.classList.remove("error"));

	if (res.ok == true)
		return true;
	else
	{
		if (result.field === "password")
		{
			console.log("test1"); 
			passwordInput.classList.add("error");
			passwordMsg.textContent = result.error;
		}
		if (result.field === "username")
		{
			usernameInput.classList.add("error");
			usernameMsg.textContent = result.error;
		}
		return false;
	}
	} 
	catch (err) 
	{
		console.error(err);
		return false;     
	}
}

// export async function isLoggedIn(): Promise<boolean> {
// 	const res = await fetch("/api/isLoggedIn", { credentials: "include" });
// 	const result = await res.json()
// 	return result.logged;
// }


