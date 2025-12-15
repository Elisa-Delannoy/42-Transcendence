import { format } from "path";
import { navigateTo, genericFetch, loadHeader } from "../router";

export function UpdateInfoView(): string {
	loadHeader();
	return (document.getElementById("updateinfohtml") as HTMLTemplateElement).innerHTML;
}

// get pseudo and avatar
export async function initUpdateInfo() {
	const profile = await genericFetch("/api/private/profile", {
	  method: "POST",
	});
			
	const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	avatar.src = profile.avatar + "?ts=" + Date.now();
	(document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;

  // HANDLE CHANGE USERNAME, EMAIL, PASSWORD
  await initUpdateUsername();
  // await initUpdateEmail();
  // await initUpdatePassword();
  
  // await initAvatar();
}

async function initUpdateUsername() {
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
      navigateTo("/home");

    } catch (err: any) {
      alert(err.message);
    }
  });
}

async function initUpdateEmail() {
  console.log('inside UpdateEmail');
  const formEmail = document.getElementById("change-email-form") as HTMLFormElement;
  formEmail.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formEmail);
    const newEmail = formData.get("new-email") as string;
    const password = formData.get("password") as string;
    // const newEmail = formEmail["new-email"].value;
    // const password = formEmail["password"].value;
    console.log('newEmail', newEmail)

    try {
      const response = await genericFetch("/api/private/updateinfo/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ newEmail, password })
      });

      alert("Username updated successfully to <<  " + response.email + "  >>");
      navigateTo("/home");

    } catch (err: any) {
      alert(err.message);
    }
  });
}

async function initUpdatePassword() {
  const formPassword = document.getElementById("change-password-form") as HTMLFormElement;
  formPassword.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPw = formPassword["old-password"].value;
    const newPw = formPassword["new-password"].value;
    const confirm = formPassword["confirm-new-password"].value;

    // if (newPw !== confirm) {
    //   alert("New password and confirmation do not match!");
    //   return ;
    // }

    try {
      const response = await genericFetch("/api/private/updateinfo/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ oldPw, newPw, confirm })
      });

      alert("Password is updated successfully! Please re-log in!");
      navigateTo("/logout");

    } catch (err: any) {
      alert(err.message);
    }
  });
}

  async function initAvatar() {
    const formAvatar = document.getElementById("upload_avatar") as HTMLFormElement;
    if (formAvatar instanceof HTMLFormElement) {
      formAvatar.addEventListener("submit", async (e: SubmitEvent) => {
      e.preventDefault();
      const avatarInput = formAvatar.querySelector<HTMLInputElement>('input[name="avatar"]');
      const avatarFile  = avatarInput?.files?.[0];
      if (!avatarFile || avatarFile.size === 0 || !avatarFile.name)
      {
        alert ("Please upload an avatar");
        return;
      }     
      await uploadAvatar(avatarFile);
      // const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
      // if (avatar) {
      //   avatar.src = "/api/private/avatar?ts=" + Date.now();
      // }
    });
    }
  }
  
   async function uploadAvatar(avatar: File) {
    const form = new FormData();
    form.append("avatar", avatar);
    try {
      const result =  await genericFetch("/api/private/updateinfo/uploads", {
        method: "POST",
        body: form,
        credentials: "include"
      });
      console.log("uplaod success ok : ", result);
      navigateTo("/profile");
      } catch (err) {
          alert(err);
		      console.error(err);
	    }
  }
 