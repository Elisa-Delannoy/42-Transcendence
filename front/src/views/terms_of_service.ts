import { getHistoryStack, navigateTo, saveHistoryStack } from "../router";

export function TermsOfServiceView(): string
{
	return (document.getElementById("terms-of-service") as HTMLFormElement).innerHTML;
}

export function goBackSkippingTerms() {
    let stack = getHistoryStack();
    let target = null;

    for (let i = stack.length - 2; i >= 0; i--)
	{
        const path = stack[i];
        if (path !== "/termsofservice" && path !== "/privacypolicy")
		{
            target = path;
            stack = stack.slice(0, i + 1); 
            break;
        }
    }
    if (target)
	{
        saveHistoryStack(stack);
        navigateTo(target);
    }
	else
	{
        navigateTo("/register");
        saveHistoryStack([target!]);
    }
}

export function InitTermsOfService()
{
	(document.getElementById("header") as HTMLElement).classList.add("hidden");
	const btn = document.getElementById("go-back") as HTMLButtonElement;
	btn.addEventListener("click", () => {
    goBackSkippingTerms();
       
});

}

