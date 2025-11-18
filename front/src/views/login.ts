import { navigateTo, updateNav} from "../router";

export function LoginView(): string {
  return (document.getElementById("loginhtml") as HTMLFormElement).innerHTML;
}

export function initLogin()
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

export async function login(username: string, password: string): Promise<boolean> {

try {
	  const res = await fetch("/api/login", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({username, password}),
		credentials: "include"
	  });
	  const result = await res.json();
	  if (res.ok)
	  {
		localStorage.setItem("token", "OK");
		return true;
	  }
	  else
		return false;
	} catch (err) {
	  console.error("Erreur serveur:", err);
	  return false;     
  }
}


