import { format } from "path";
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
  await initUpdateUsername();

  // const formUsername = document.getElementById("change-username-form") as HTMLFormElement;
  // formUsername.addEventListener("submit", async (e) => {
  //   e.preventDefault();

  //   const newUsername = formUsername["new-username"].value;
  //   const password = formUsername["password"].value;

  //   try {
  //     const response = await genericFetch("/api/private/updateinfo/username", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", },
  //       body: JSON.stringify({ newUsername, password })
  //     });

  //     alert("Username updated successfully to <<  " + response.pseudo + "  >>");
  //     navigateTo("/homelogin");

  //   } catch (err: any) {
  //     alert(err.message);
  //   }
  // });

    // HANDLE CHANGE EMAIL
  await initUpdateEmail();
  // const formEmail = document.getElementById("change-email-form") as HTMLFormElement;
  // formEmail.addEventListener("submit", async (e) => {
  //   e.preventDefault();

  //   const newEmail = formEmail["new-email"].value;
  //   const password = formEmail["password"].value;

  //   try {
  //     const response = await genericFetch("/api/private/updateinfo/email", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json", },
  //       body: JSON.stringify({ newEmail, password })
  //     });

  //     alert("Username updated successfully to <<  " + response.email + "  >>");
  //     navigateTo("/homelogin");

  //   } catch (err: any) {
  //     alert(err.message);
  //   }
  // });

  // // HANDLE CHANGE PASSWORD
  await initUpdatePassword();
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


  await initAvatar();
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
      navigateTo("/homelogin");

    } catch (err: any) {
      alert(err.message);
    }
  });
}

async function initUpdateEmail() {
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
		      console.error(err);
	    }
  }
 