;import { login } from "../auth";
import { navigateTo, updateNav} from "../router";

export function LoginView(): string {
  return (document.getElementById("loginhtml") as HTMLFormElement).innerHTML;
}

export function toLogin()
{
	const form = document.getElementById("login-form") as HTMLFormElement;
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const username = (document.getElementById("username") as HTMLInputElement).value;
		const password = (document.getElementById("password") as HTMLInputElement).value;

	const success = await login(username, password)
   	if (success)
	{
		updateNav()
		navigateTo("/homelogin");
	}
    else
    	alert("Identifiants incorrects");
    });
}

