import { displayStatus, LogStatusAndInfo } from "../router";

export interface headerResponse {
	pseudo: string;
	avatar: string;
	web_status: string;
	xp: number;
	lvl: number;
}

function initSwitch()
{
	const root = document.documentElement;
	const switchInput = document.getElementById('theme-switch') as HTMLInputElement;
	if ( localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches))
	{
		root.classList.add('dark');
		switchInput.checked = true;
	}
	switchInput.addEventListener('change', () => {
		if (switchInput.checked)
		{
			root.classList.add('dark');
			localStorage.theme = 'dark';
		}
		else
		{
			root.classList.remove('dark');
			localStorage.theme = 'light';
		}
	});
}

export async function loadHeader(auth: LogStatusAndInfo) {
	const container = document.getElementById("header-container");
	container!.innerHTML = "";
	const templateID = auth.logged ? "headerconnect" : "headernotconnect";
	const template = document.getElementById(templateID) as HTMLTemplateElement
	const clone = template.content.cloneNode(true);
	container!.appendChild(clone);
	
	if (auth.logged)
	{
		displayPseudoHeader(auth.user!, auth!.notif);
		initSwitch();
	}
}

export function displayPseudoHeader(result: headerResponse, notif: boolean)
{
	document.getElementById("pseudo-header")!.textContent = result.pseudo;
	const avatar = document.getElementById("header-avatar") as HTMLImageElement;
	const status = document.getElementById("status") as HTMLImageElement;
	avatar.src = result.avatar + "?ts" + Date.now();
	displayStatus(result, status);
	const notification = document.getElementById("notification") as HTMLImageElement;
	notification.classList.add("hidden");
	if (notif === true)
		notification.classList.remove("hidden");
	setTimeout(() => {
		const bar = document.getElementById("progress-xp") as HTMLDivElement;
		const progress = (result.xp / 20000) * 100;
		bar.style.width = `${progress}%`;
	}, 50);
	
	(document.getElementById("lvl-header") as HTMLSpanElement).textContent = result.lvl.toString();
}