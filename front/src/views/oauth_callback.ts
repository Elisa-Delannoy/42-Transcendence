import { navigateTo } from "../router";

export async function initOAuthCallback() {
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
      navigateTo("/home");
    }
  }
