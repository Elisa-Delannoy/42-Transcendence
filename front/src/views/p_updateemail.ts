import { format } from "path";
import { navigateTo, genericFetch, loadHeader } from "../router";

export function UpdateEmailView(): string {
	 	return (document.getElementById("update-email-html") as HTMLTemplateElement).innerHTML;
}

export async function initUpdateEmail() {
  // get pseudo and avatar
  const profile = await genericFetch("/api/private/profile", {
	  method: "POST",
	});
	const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	avatar.src = profile.avatar + "?ts=" + Date.now();
	(document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;


  // form change email
  const formEmail = document.getElementById("change-email-form") as HTMLFormElement;
  formEmail.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newEmail = formEmail["new-email"].value;
    const password = formEmail["password"].value;

    try {
      console.log('here');
      const response = await genericFetch("/api/private/updateinfo/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ newEmail, password })
      });

      alert("Username updated successfully to <<  " + response.email + "  >>");
      navigateTo("/profile");

    } catch (err: any) {
      alert(err.message);
    }
  });
}
