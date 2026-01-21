import { navigateTo, genericFetch } from "../router";
import { showToast } from "./show_toast";

export function SetGGPasswordView(): string {
	 	return (document.getElementById("set-gg-password-html") as HTMLTemplateElement).innerHTML;
}

export async function initSetGGPassword() {
	(document.getElementById("header") as HTMLElement).classList.add("hidden");
  // form change password
  const formPassword = document.getElementById("set-gg-password-form") as HTMLFormElement;
  formPassword.addEventListener("submit", async (e) => {
    e.preventDefault();

    const oldPw = "google";
    const newPw = formPassword["new-password"].value;
    const confirm = formPassword["confirm-new-password"].value;

    try {
      const response = await genericFetch("/api/private/updateinfo/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ oldPw, newPw, confirm })
      });
      navigateTo("/logout");
      showToast("Password is updated successfully! Please re-log in!", "success", 2000);

    } catch (err: any) {
      showToast(err.message, "error", 3000, "Update password");
    }
  });
}