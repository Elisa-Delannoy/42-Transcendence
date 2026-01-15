import { format } from "path";
import { navigateTo, genericFetch, loadHeader } from "../router";
import { showToast } from "./show_toast";

export function Update2faView(): string {
	 	return (document.getElementById("update-2fa-html") as HTMLTemplateElement).innerHTML;
}

export async function initUpdate2fa() {
  // get pseudo and avatar
  const profile = await genericFetch("/api/private/profile", {
	  method: "POST",
	});
	const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	avatar.src = profile.avatar + "?ts=" + Date.now();
	(document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;


  // form update 2FA
  // 2FA management logic
	const twofaStatusText = document.getElementById("twofa-status")!;
	const twofaEnableBtn = document.getElementById("twofa-enable-btn")!;
	const twofaDisableBtn = document.getElementById("twofa-disable-btn")!;
	const twofaQr = document.getElementById("twofa-qr") as HTMLImageElement;
	const verifyContainer = document.getElementById("twofa-verify-container")!;
	const verifyInput = document.getElementById("twofa-code-input") as HTMLInputElement;
	const verifyBtn = document.getElementById("twofa-verify-btn")!;

	// Hide everything
	twofaEnableBtn.classList.add("hidden");
	twofaDisableBtn.classList.add("hidden");
	twofaQr.classList.add("hidden");
	verifyContainer.classList.add("hidden");

	// Set state
	if (profile.twofa_enabled) {
		twofaStatusText.textContent = "Enabled";
		twofaDisableBtn.classList.remove("hidden");
	} else {
		twofaStatusText.textContent = "Disabled";
		twofaEnableBtn.classList.remove("hidden");
	}

	// --- Enable 2FA ---
	twofaEnableBtn.addEventListener("click", async () => {
		try {
			const res = await genericFetch("/api/private/2fa/setup", { method: "POST" });

			// Show QR
			twofaQr.src = res.qr;
			twofaQr.classList.remove("hidden");

			// Show verify input + button
			verifyContainer.classList.remove("hidden");

		} catch (err) {
			console.error(err);
			showToast(err, "error", 2000, "Failed to setup 2FA:");
		}
	});

	// --- Verify the 6-digit code ---
	verifyBtn.addEventListener("click", async () => {
		const code = verifyInput.value.trim();
		if (code.length !== 6) {
			showToast("Please enter a valid 6-digit code.", "warning", 3000);
			return;
		}

		try {
			await genericFetch("/api/private/2fa/enable", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code })
			});

			showToast("2FA Enabled!", "success", 3000);

			// Update UI
			twofaEnableBtn.classList.add("hidden");
			twofaDisableBtn.classList.remove("hidden");
			twofaStatusText.textContent = "2FA Enabled";

			// Hide QR + input
			twofaQr.classList.add("hidden");
			verifyContainer.classList.add("hidden");
			verifyInput.value = "";

		} catch (err) {
			console.error(err);
			showToast(err, "error", 3000, "Invalid code, please try again.");
		}
	});

	// --- Disable 2FA ---
	twofaDisableBtn.addEventListener("click", async () => {
		try {
			await genericFetch("/api/private/2fa/disable", { method: "PUT" });

			showToast("2FA Disabled!", "success", 3000);

			twofaDisableBtn.classList.add("hidden");
			twofaEnableBtn.classList.remove("hidden");
			twofaStatusText.textContent = "2FA Disabled";

			twofaQr.classList.add("hidden");
			verifyContainer.classList.add("hidden");
			verifyInput.value = "";

		} catch (err) {
			console.error(err);
			showToast(err, "error", 3000, "Failed to disable 2FA:");
		}
	});

}