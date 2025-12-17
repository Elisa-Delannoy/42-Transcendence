import { format } from "path";
import { navigateTo, genericFetch, loadHeader } from "../router";

export function UpdateUsernameView(): string {
	loadHeader();
	return (document.getElementById("update-username-html") as HTMLTemplateElement).innerHTML;
}

export async function initUpdateUsername() {
  // get pseudo and avatar
  const profile = await genericFetch("/api/private/profile", {
	  method: "POST",
	});
	const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	avatar.src = profile.avatar + "?ts=" + Date.now();
	(document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;


  // form change username
  const formUsername = document.getElementById("change-username-form") as HTMLFormElement;
  formUsername.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUsername = formUsername["new-username"].value;
    const password = formUsername["password"].value;

    try {
      const response = await genericFetch("/api/private/updateinfo/username", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ newUsername, password })
      });

      alert("Username updated successfully to <<  " + response.pseudo + "  >>");
      navigateTo("/profile");

    } catch (err: any) {
      alert(err.message);
    }
  });
}