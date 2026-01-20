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
    if (data.twofa) {
      navigateTo("/twofa");
    } else {
      if (data.firstTimeLogin)
      {
        navigateTo("/setggpass");
        showToast("Welcome! If this is your first login, please create a password for your account! 🎉", "warning");
      }
      else
        navigateTo("/home");
    }
  } catch (err: any) {
    showToast(err, "error", 3000, "Google account");
  }
}
