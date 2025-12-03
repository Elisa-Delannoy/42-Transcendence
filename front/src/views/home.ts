import { navigateTo } from "../router";

export function HomeView(): string {
  return (document.getElementById("homehtml") as HTMLTemplateElement).innerHTML;
}

export async function initHome()
{
	const res = await fetch("/api/checkLogin", { method: "GET", credentials: "include"});
	if (res.ok)
	{
		navigateTo("/homelogin");
	}
}