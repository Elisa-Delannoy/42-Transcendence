
import { goBackSkippingTerms } from "./terms_of_service";

export function PriavacyPolicyView(): string
{
    return (document.getElementById("privacy-policy") as HTMLFormElement).innerHTML;
}

export function InitPrivacyPolicy()
{
    const btn = document.getElementById("go-back") as HTMLButtonElement;
    btn.addEventListener("click", () => {
		goBackSkippingTerms();
    })
}
