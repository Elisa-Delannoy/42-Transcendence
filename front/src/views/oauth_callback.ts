import { navigateTo } from "../router";
import { showToast } from "./show_toast";

export async function initOAuthCallback() {
  try {
    const res = await fetch("/api/auth/status", {
      credentials: "include",
    });
    if (!res.ok) {
      navigateTo("/login");
      return;
    }
    const data = await res.json();
    // console.log('data', data);
    if (data.twofa) {
      navigateTo("/twofa");
    } else {
      navigateTo("/home");
      // console.log('data firstTimeLogin', data.firstTimeLogin);
      if (data.firstTimeLogin)
        showToast("Welcome! If this is your first login, please change your default password << google >> ", "success", 3000);
    }
  } catch (err: any) {
    showToast(err, "error", 3000, "Google account");
  }
}
