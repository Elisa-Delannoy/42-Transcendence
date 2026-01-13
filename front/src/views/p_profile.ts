import { IUsers } from "../../../back/DB/users";
import { genericFetch, getPseudoHeader, loadHeader, navigateTo } from "../router";

export function ProfileView(): string {
	 	return (document.getElementById("profilehtml") as HTMLTemplateElement).innerHTML;
}

export async function initProfile() {
  const profile: IUsers = await genericFetch("/api/private/profile", {
	method: "POST",
	});
			
	const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	avatar.src = profile.avatar + "?ts=" + Date.now();
	(document.getElementById("profile-pseudo") as HTMLParagraphElement).textContent = profile.pseudo;
	(document.getElementById("profile-email") as HTMLParagraphElement).textContent = profile.email;
	const select = document.getElementById("profile-status") as HTMLSelectElement;
	if (select) {
		select.value = profile.status;
		select.addEventListener("change", async (e) => {
			const status = (e.target as HTMLSelectElement).value;
			await genericFetch('/api/private/updateinfo/status', {
	 			method: 'PUT',
	  			headers: { 'Content-Type': 'application/json' },
	  			body: JSON.stringify({ status })
			});
			console.log("Status changed :", status);
  		});
	}
  (document.getElementById("profile-money") as HTMLParagraphElement).textContent = profile.money.toString();
  (document.getElementById("profile-elo") as HTMLParagraphElement).textContent = profile.elo.toString();


	const twofaStatusText = document.getElementById("twofa-status") as HTMLParagraphElement;
	if (profile.twofa_enabled === 1)
		twofaStatusText.textContent = "Enable";
	else
		twofaStatusText.textContent = "Disable";

}
