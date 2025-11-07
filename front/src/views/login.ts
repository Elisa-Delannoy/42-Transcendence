import { login } from "../auth.ts";
import { navigateTo } from "../router.ts";

export function LoginView(): string {
  setTimeout(() => {
    const form = document.getElementById("login-form") as HTMLFormElement;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = (document.getElementById("username") as HTMLInputElement).value;
      const password = (document.getElementById("password") as HTMLInputElement).value;

      if (login(username, password)) {
        navigateTo("/dashboard");
      } else {
        alert("Identifiants incorrects");
      }
    });
  }, 0);
  return (document.getElementById("test") as HTMLTemplateElement).innerHTML;
}
