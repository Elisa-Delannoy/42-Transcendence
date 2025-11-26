import { genericFetch, navigateTo } from "../router";

export function ProfilView(): string {
  return (document.getElementById("profilhtml") as HTMLTemplateElement).innerHTML;
}

export async function initProfil() {

  const profil = await genericFetch("/api/private/profil", {
    method: "POST",
  });

  (document.getElementById("profil-id") as HTMLElement).textContent = profil.user_id;
  (document.getElementById("profil-pseudo") as HTMLElement).textContent = profil.pseudo;
  (document.getElementById("profil-email") as HTMLElement).textContent = profil.email;
  (document.getElementById("profil-status") as HTMLElement).textContent = profil.status;
  (document.getElementById("profil-creation") as HTMLElement).textContent = profil.creation_date;
  (document.getElementById("profil-modification") as HTMLElement).textContent = profil.modification_date;
  (document.getElementById("profil-money") as HTMLElement).textContent = profil.money;
  (document.getElementById("profil-elo") as HTMLElement).textContent = profil.elo;

  async function uploadAvatar(avatar: File) {
    const form = new FormData();
    form.append("avatar", avatar);
    const result =  await genericFetch("/api/private/uploads", {
      method: "POST",
      body: form,
      credentials: "include"
    });
    console.log("uplaod success ok : ", result);
    navigateTo("/profil");
  }

}
