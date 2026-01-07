import { loadHeader, navigateTo } from "../router";

export function View(): string {
	loadHeader();
  return (document.getElementById("html") as HTMLTemplateElement).innerHTML;
}

export async function init()
{
	const res = await fetch("/api/checkLogin", { method: "GET", credentials: "include"});
	if (res.ok)
	{
		navigateTo("/home");
	}
}