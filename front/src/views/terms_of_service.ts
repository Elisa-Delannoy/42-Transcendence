import { navigateTo, popState } from "../router";

export function TermsOfServiceView(): string
{
	return (document.getElementById("terms-of-service") as HTMLFormElement).innerHTML;
}

export function InitTermsOfService()
{
	const btn = document.getElementById("go-back") as HTMLButtonElement;
	btn.addEventListener("click", () => {
		navigateTo("/register");
	})
}