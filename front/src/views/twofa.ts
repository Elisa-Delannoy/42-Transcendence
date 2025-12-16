import { METHODS } from "http";
import { genericFetch, navigateTo } from "../router";
import { Result } from "ethers";


export function towfaView()
{
	return (document.getElementById("twofahtml") as HTMLTemplateElement).innerHTML;
}

export async function initTowfa()
{
	const form = document.getElementById("twofa-form") as HTMLFormElement;
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const code = (document.getElementById("twofa-code") as HTMLInputElement).value
		const res = await fetch("/api/twofa", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ code }),
			credentials: "include"});
		if (res.ok === false)
		{
			const error = document.getElementById("twofa-msg") as HTMLParagraphElement;
			error.textContent = "";
			error.textContent = (await res.json()).error;
			return;
		}
		navigateTo("/home")
	});
}