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


  // toggle logic
  const usernameBtn = document.getElementById("toggle-username")
  const deleteBtn = document.getElementById("toggle-delete")

  const usernameSection = document.getElementById("update-username-section")
  const deleteSection = document.getElementById("delete-user-section")

  const showUsernameSection = () => {
    usernameBtn?.classList.add('hidden')
    deleteBtn?.classList.remove('hidden')
    usernameSection?.classList.remove('hidden')
    deleteSection?.classList.add('hidden')
  }

  const showDeleteSection = () => {
    usernameBtn?.classList.remove('hidden')
    deleteBtn?.classList.add('hidden')
    deleteSection?.classList.remove('hidden')
    usernameSection?.classList.add('hidden')
  }
  
  deleteBtn?.addEventListener('click', showDeleteSection)
  usernameBtn?.addEventListener('click', showUsernameSection)

  await updateUsername()
  await deleteUser()
}

async function updateUsername() {
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

async function deleteUser() {
  const formDelete = document.getElementById("delete-user-form") as HTMLFormElement;
  formDelete.addEventListener("submit", async (e) => {
    e.preventDefault();

    const confirmUser = formDelete["confirm-username"].value;
    const password = formDelete["password"].value;

    try {
      await genericFetch("/api/private/updateinfo/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ confirmUser, password })
      });

      alert("Account deleted successfully!");
      navigateTo("/logout");

    } catch (err: any) {
      alert(err.message);
    }
  })
}
