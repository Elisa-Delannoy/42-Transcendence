import { getHistoryStack, navigateTo, saveHistoryStack } from "../router";

export function TermsOfServiceView(): string
{
	return (document.getElementById("terms-of-service") as HTMLFormElement).innerHTML;
}

export function goBackSkippingTerms() {
    let stack = getHistoryStack(); // Récupère ton historique perso
    let target = null;

    // On parcourt le stack à l'envers pour trouver la dernière page "valide"
    for (let i = stack.length - 2; i >= 0; i--) {
        const path = stack[i];
        if (path !== "/termsofservice" && path !== "/privacypolicy") {
            target = path;
            stack = stack.slice(0, i + 1); // On coupe l'historique jusqu'à cette page
            break;
        }
    }

    if (target) {
        saveHistoryStack(stack);
        navigateTo(target);
    } else {
        // Pas de page valide trouvée, on peut rediriger ailleurs
        navigateTo("/register");
        saveHistoryStack([target!]); // reset stack si nécessaire
    }
}

export function InitTermsOfService()
{
	const btn = document.getElementById("go-back") as HTMLButtonElement;
	btn.addEventListener("click", () => {
    goBackSkippingTerms();
       
});

}

