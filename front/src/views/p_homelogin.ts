import { genericFetch, getPseudoHeader, loadHeader } from "../router";
import { IMyFriends } from "../../../back/DB/friend";
import { AsyncLocalStorage } from "async_hooks";
import { navigateTo } from "../router";

export function homeView(): string {
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
    const res = await fetch("/api/checkLogin", {
        credentials: "include"
      });
      const data = await res.json();   
      if (!data.loggedIn) {
        navigateTo("/login");
        return;
    }
    const { initSocket } = await import("../socket/socket");
    initSocket();
	const btn = document.getElementById("scroll-button") as HTMLButtonElement;
	const target = document.getElementById("gamepage") as HTMLImageElement;
    btn.addEventListener("click", () => {
        const targetY = target.getBoundingClientRect().top + window.scrollY;
        smoothScrollTo(targetY, 1000);
    });
}
