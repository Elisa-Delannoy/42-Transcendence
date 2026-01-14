import { navigateTo, popState } from "../router";

export function TermsOfServiceView(): string
{
	return (document.getElementById("terms-of-service") as HTMLFormElement).innerHTML;
}

export function InitTermsOfService()
{
	const btn = document.getElementById("go-back") as HTMLButtonElement;
	btn.addEventListener("click", () => {		
		if (window.history.length > 1) {
            window.history.back()
        } else {
            navigateTo("/register");
        }
	})
}