import { navigateTo } from "../router";
import { showToast } from "./show_toast";

export async function initOAuthCallback() {
  try {
    const res = await fetch("/api/auth/status", {
      credentials: "include",
    });

    const data = await res.json();
    if (data.ok === false || !res.ok ) {
      navigateTo("/login");
      return;
    }
    if (data.twofa) {
      navigateTo("/twofa");
    } else {
      if (data.firstTimeLogin)
      {
        navigateTo("/setggpass");
        showToast("Welcome! This is your first login, please create a password for your account! 🎉", "warning", 10000);
      }
      else
        navigateTo("/home");
    }
  } catch (err: any) {
    showToast(err, "error", 3000, "Google account");
  }
}
