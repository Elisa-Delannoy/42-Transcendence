import { genericFetch } from "../router";

export function ProfilView(): string {
  return (document.getElementById("profilhtml") as HTMLTemplateElement).innerHTML;
}

export async function initProfil() {

  const res = await genericFetch("/api/private/profil", {
    method: "POST",
    credentials: "include"
  });

  if (!res.ok) {
    console.error("Cannot load profile");
    return;
  }

  const profil = await res.json();

  (document.getElementById("profil-id") as HTMLElement).textContent = profil.user_id;
  (document.getElementById("profil-pseudo") as HTMLElement).textContent = profil.pseudo;
  (document.getElementById("profil-email") as HTMLElement).textContent = profil.email;
  (document.getElementById("profil-status") as HTMLElement).textContent = profil.status;
  (document.getElementById("profil-creation") as HTMLElement).textContent = profil.creation_date;
  (document.getElementById("profil-modification") as HTMLElement).textContent = profil.modification_date;
  (document.getElementById("profil-money") as HTMLElement).textContent = profil.money;
  (document.getElementById("profil-elo") as HTMLElement).textContent = profil.elo;
}
