import { genericFetch, getPseudoHeader, loadHeader, navigateTo } from "../router";

export function ProfileView(): string {
	loadHeader();
	return (document.getElementById("profilehtml") as HTMLTemplateElement).innerHTML;
}

export async function initProfile() {
  const profile = await genericFetch("/api/private/profile", {
	method: "POST",
	});
			
	const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	avatar.src = profile.avatar + "?ts=" + Date.now();
	(document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;
	(document.getElementById("profile-email") as HTMLElement).textContent = profile.email;
	const select = document.getElementById("profile-status") as HTMLSelectElement;
	if (select) {
		select.value = profile.status;
		select.addEventListener("change", async (e) => {
			const status = (e.target as HTMLSelectElement).value;
			await genericFetch('/api/private/updateinfo/status', {
	 			method: 'POST',
	  			headers: { 'Content-Type': 'application/json' },
	  			body: JSON.stringify({ status })
			});
			console.log("Status changed :", status);
  		});
	}
  (document.getElementById("profile-money") as HTMLElement).textContent = profile.money;
  (document.getElementById("profile-elo") as HTMLElement).textContent = profile.elo;
}
