import { navigateTo, genericFetch } from "../router";

export function UpdateInfoView(): string {
  return (document.getElementById("updateinfohtml") as HTMLTemplateElement).innerHTML;
}

export async function initUpdateInfo() {
	const profil = await genericFetch("/api/private/updateinfo", {
    method: "POST"
  });

  (document.getElementById("profile-username") as HTMLElement).textContent = profil.pseudo;

  // HANDLE CHANGE USERNAME
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
      navigateTo("/homelogin");

    } catch (err: any) {
      alert(err.message);
    }
  });

  // HANDLE CHANGE EMAIL
  const formEmail = document.getElementById("change-email-form") as HTMLFormElement;
  formEmail.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newEmail = formEmail["new-email"].value;
    const password = formEmail["password"].value;

    try {
      const response = await genericFetch("/api/private/updateinfo/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ newEmail, password })
      });

      alert("Username updated successfully to <<  " + response.email + "  >>");
      navigateTo("/homelogin");

    } catch (err: any) {
      alert(err.message);
    }
  });

  // // HANDLE CHANGE PASSWORD
  // const formPassword = document.getElementById("change-password-form") as HTMLFormElement;
  // formPassword.addEventListener("submit", async (e) => {
  //   e.preventDefault();

  //   const oldPw = formPassword["old-password"].value;
  //   const newPw = formPassword["new-password"].value;
  //   const confirm = formPassword["confirm-new-password"].value;

  //   if (newPw !== confirm) {
  //     alert("New password and confirmation do not match!");
  //     return ;
  //   }

  //   try {
  //     const response = await genericFetch("/api/private/updateinfo/password", {
  //       method: "POST",
  //       credentials: "include",
  //       body: JSON.stringify({ newPw, oldPw })
  //     });

  //     if (!response.ok)
  //       return alert("Error changing password!");
  //     alert("Password is updated successfully! Please re-log in!");

  //   } catch (err: any) {

  //   }
  // });

}

