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

  return `
    <h1>Connexion</h1>
    <form id="login-form">
      <input id="username" placeholder="username" required />
      <input id="password" type="password" placeholder="password" required />
      <button>Se connecter</button>
    </form>
  `;
}
