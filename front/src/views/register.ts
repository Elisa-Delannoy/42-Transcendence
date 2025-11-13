import { register } from "module";

export function RegisterView(): string {
  return (document.getElementById("registerhtml") as HTMLFormElement).innerHTML;
}

export function initRegister() {
  const form = document.getElementById("register-form") as HTMLFormElement;
  const message = document.getElementById("register-message") as HTMLElement;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      message.textContent = result.message;
    } catch (err) {
      message.textContent = "Erreur serveur...";
      console.error(err);
    }
  });
}