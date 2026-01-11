import { loadHeader, navigateTo } from "../router";

export function View(): string {
  return (document.getElementById("html") as HTMLTemplateElement).innerHTML;
}

export async function init()
{
	// const res = await fetch("/api/checkLogin", { method: "GET", credentials: "include"});
	// const data = await res.json();

    // if (data.loggedIn) {
    //     navigateTo("/home");
    // }
	// if (res.ok)
	// {
	// 	navigateTo("/home");
	// }
}