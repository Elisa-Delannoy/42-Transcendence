import { navigateTo, popState } from "../router";

export function PriavacyPolicyView(): string
{
    return (document.getElementById("privacy-policy") as HTMLFormElement).innerHTML;
}

export function InitPrivacyPolicy()
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
