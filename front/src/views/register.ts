import { register } from "module";
import { navigateTo } from "../router";
import { loadHeader } from "../router";
import { showToast } from "./show_toast";

export function RegisterView(): string {
	 	return (document.getElementById("registerhtml") as HTMLTemplateElement).innerHTML;
}

export async function initRegister() {
	const form = document.getElementById("register-form") as HTMLFormElement;

	form.addEventListener("submit", async (e) => 
	{
		e.preventDefault();

		const formData = new FormData(form);
		const data = {
			username: formData.get("username"),
			email: formData.get("email"),
			password: formData.get("password"),
			confirm: formData.get("confirm-password"),
	};

	try {
			const res = await fetch("/api/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});
			const result = await res.json();
			if (result.ok == true)
				navigateTo("/registerok")
			else
			{
				const usernameInput = form.querySelector("input[name='username']") as HTMLInputElement;
				const passwordInput = form.querySelector("input[name='password']") as HTMLInputElement;
				const emailInput = form.querySelector("input[name='email']") as HTMLInputElement;
				const confirmInput = form.querySelector("input[name='confirm-password']") as HTMLInputElement;

				const usernameMsg = document.getElementById("username-message") as HTMLParagraphElement;
				const emailMsg = document.getElementById("email-message") as HTMLParagraphElement;
				const passwordMsg = document.getElementById("password-message") as HTMLParagraphElement;
				const confirmMsg = document.getElementById("confirm-password-message") as HTMLParagraphElement;

				[usernameMsg, emailMsg, passwordMsg, confirmMsg].forEach(p => p!.textContent = "");
				[usernameInput, emailInput, passwordInput, confirmInput].forEach(p => p!.classList.remove("error"));


				if (result.field === "confirm")
				{
					confirmInput.classList.add("error");
					confirmMsg.textContent = result.message;
				}
				if (result.field === "password")
				{
					passwordInput.classList.add("error");
					passwordMsg.textContent = result.message;
				}
				if (result.field === "username")
				{
					usernameInput.classList.add("error");
					usernameMsg.textContent = result.message;
				}
				if (result.field === "email")
				{
					emailInput.classList.add("error");
					emailMsg.textContent = result.message;
				}
			}
		} 
		catch (err) 
		{
			console.error(err);
			showToast(err, "error", 3000, "Registration failed:");
		}
	});
}

export function RegisterValidView(): string {
	return (document.getElementById("registerok") as HTMLTemplateElement).innerHTML;
}