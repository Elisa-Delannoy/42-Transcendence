import { genericFetch } from "../router";

export function ProfileView(): string {
  return (document.getElementById("profilehtml") as HTMLTemplateElement).innerHTML;
}

export async function initProfile() {

  const profile = await genericFetch("/api/private/profile", {
    method: "POST",
  });

  (document.getElementById("profile-id") as HTMLElement).textContent = profile.user_id;
  (document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;
  (document.getElementById("profile-email") as HTMLElement).textContent = profile.email;
  (document.getElementById("profile-status") as HTMLElement).textContent = profile.status;
  (document.getElementById("profile-creation") as HTMLElement).textContent = profile.creation_date;
  (document.getElementById("profile-modification") as HTMLElement).textContent = profile.modification_date;
  (document.getElementById("profile-money") as HTMLElement).textContent = profile.money;
  (document.getElementById("profile-elo") as HTMLElement).textContent = profile.elo;
}
