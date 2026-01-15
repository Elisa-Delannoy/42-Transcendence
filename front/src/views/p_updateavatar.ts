import { format } from "path";
import { navigateTo, genericFetch, loadHeader } from "../router";
import { showToast } from "./show_toast";

export function UpdateAvatarView(): string {
	 	return (document.getElementById("update-avatar-html") as HTMLTemplateElement).innerHTML;
}

export async function initUpdateAvatar() {
  // get pseudo and avatar
  const profile = await genericFetch("/api/private/profile", {
	  method: "POST",
	});
	const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	avatar.src = profile.avatar + "?ts=" + Date.now();
	(document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;


  // form change avatar
  const formAvatar = document.getElementById("upload_avatar") as HTMLFormElement;
  if (formAvatar instanceof HTMLFormElement) {
    formAvatar.addEventListener("submit", async (e: SubmitEvent) => {
    e.preventDefault();
    const avatarInput = formAvatar.querySelector<HTMLInputElement>('input[name="avatar"]');
    const avatarFile  = avatarInput?.files?.[0];
    if (!avatarFile || avatarFile.size === 0 || !avatarFile.name)
    {
      showToast("Please upload an avatar", "warning", 3000);
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
    showToast("Avatar uploaded successfully", "success", 2000);
    setTimeout(() => navigateTo("/profile"), 2100);
    } catch (err) {
      showToast(err, "error", 3000, "Upload avatar:");
      console.error(err);
	  }
}
