import { navigateTo, genericFetch } from "../router";
import { showToast } from "./show_toast";

export function UpdateEmailView(): string {
	 	return (document.getElementById("update-email-html") as HTMLTemplateElement).innerHTML;
}

export async function initUpdateEmail() {
	try {
		// get pseudo and avatar
		const profile = await genericFetch("/api/private/profile", {
			method: "GET",
		});
		const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
		avatar.src = profile.avatar + "?ts=" + Date.now();
		(document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;

		// form change email
		const formEmail = document.getElementById("change-email-form") as HTMLFormElement;
		formEmail.addEventListener("submit", async (e) => {
			try {
				e.preventDefault();
	
				const newEmail = formEmail["new-email"].value;
				const password = formEmail["password"].value;
	
				const response = await genericFetch("/api/private/updateinfo/email", {
					method: "PUT",
					headers: { "Content-Type": "application/json", },
					body: JSON.stringify({ newEmail, password })
				});
				navigateTo("/profile");
				showToast(`Email updated successfully to << ${response.email} >>`, "success", 2000);
			} catch(err) {
				showToast(err, "error", 3000, "Update email");
			}
	});
	} catch (err: any) {
	}
}
