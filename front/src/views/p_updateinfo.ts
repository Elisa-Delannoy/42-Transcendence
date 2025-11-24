import { navigateTo, genericFetch } from "../router";

export function UpdateInfoView(): string {
  return (document.getElementById("updateinfohtml") as HTMLTemplateElement).innerHTML;
}

export async function initUpdateInfo() {
	const res = await genericFetch("/api/private/updateinfo", {
    method: "POST"
  });

  if (!res.ok) {
    console.error("Cannot load profile");
    return;
  }

  const profil = await res.json();
  (document.getElementById("profil-username") as HTMLElement).textContent = profil.pseudo;

  // HANDLE CHANGE USERNAME
  const formUsername = document.getElementById("change-username-form") as HTMLFormElement;
  formUsername.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUsername = formUsername["new-username"].value;
    const password = formUsername["password"].value;

    const response = await genericFetch("/api/private/changeusername", {
      method: "POST",
      headers: { "Content-Type": "application/json", },
      body: JSON.stringify({ newUsername, password })
    });
    console.log('client initupdate: body', response.body);

    if (!response.ok)
      return alert("Error changing usename");
    alert("Username is updated successfully!");
    navigateTo("/homelogin");
  });

  // HANDLE CHANGE EMAIL
  // const formEmail = document.getElementById("change-email-form") as HTMLFormElement;
  // formEmail.addEventListener("submit", async (e) => {
  //   e.preventDefault();

  //   const newEmail = formEmail["new-email"].value;
  //   const password = formEmail["password"].value;

  //   const response = await genericFetch("/api/private/change-email", {
  //     method: "POST",
  //     credentials: "include",
  //     body: JSON.stringify({ newEmail, password })
  //   });

  //   if (!response.ok)
  //     return alert("Error changing email");
  //   alert("Email is updated successfully!");
  // });

  // // HANDLE CHANGE PASSWORD
  // const formPassword = document.getElementById("change-password-form") as HTMLFormElement;
  // formPassword.addEventListener("submit", async (e) => {
  //   e.preventDefault();

  //   const oldPw = formPassword["old-password"].value;
  //   const newPw = formPassword["new-password"].value;
  //   const confirmPw = formPassword["confirm-new-password"].value;

  //   if (newPw !== confirmPw) {
  //     alert("New password and confirmation do not match!");
  //     return ;
  //   }

  //   const response = await genericFetch("/api/private/change-password", {
  //     method: "POST",
  //     credentials: "include",
  //     body: JSON.stringify({ oldPw, newPw })
  //   });

  //   if (!response.ok)
  //     return alert("Error changing password!");
  //   alert("Password is updated successfully! Please re-log in!");
  // });

}

