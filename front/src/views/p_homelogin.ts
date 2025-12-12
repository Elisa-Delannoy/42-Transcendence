import { genericFetch, getPseudoHeader, loadHeader } from "../router";


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

btn.addEventListener("click", () => {
    const targetY = target.getBoundingClientRect().top + window.scrollY;
    smoothScrollTo(targetY, 1000);
});

}


