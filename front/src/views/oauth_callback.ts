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
      // console.log('data firstTimeLogin', data.firstTimeLogin);
      if (data.firstTimeLogin)
      {
        navigateTo("/setggpass");
        showToast("Welcome! If this is your first login, please create a password for your account! 🎉", "success", 3000);
      }
      else
        navigateTo("/home");
    }
  } catch (err: any) {
    showToast(err, "error", 3000, "Google account");
  }
}
