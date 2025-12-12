import { genericFetch, getPseudoHeader, loadHeader } from "../router";
import { IMyFriends } from "../../../back/DB/friend";
import { AsyncLocalStorage } from "async_hooks";

export function homeView(): string {
	loadHeader();
	return (document.getElementById("homehtml") as HTMLTemplateElement).innerHTML;
}

function smoothScrollTo(targetY: number, duration: number) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function animation(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const ease = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, startY + distance * ease);

        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

export async function initHomePage() {
	const btn = document.getElementById("scroll-button")!;
	const target = document.getElementById("gamepage")!;
        const myfriends: IMyFriends[] = await genericFetch("/api/private/friend", {
                method: "POST",
            });
            // const acceptedFriends = myfriends.filter(f => f.friendship_status === "accepted");
            const pendingFriends = myfriends.filter(f => f.friendship_status === "pending");

btn.addEventListener("click", () => {
    const targetY = target.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(targetY, 1000);
});

}


