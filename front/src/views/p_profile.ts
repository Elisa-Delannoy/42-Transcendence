import { genericFetch, getPseudoHeader, loadHeader, navigateTo } from "../router";

export function ProfileView(): string {
	loadHeader();
	return (document.getElementById("profilehtml") as HTMLTemplateElement).innerHTML;
}

export async function initProfile() {
  const profile = await genericFetch("/api/private/profile", {
	method: "POST",
	});
			
	const avatar = document.getElementById("profile-avatar") as HTMLImageElement;
	avatar.src = profile.avatar + "?ts=" + Date.now();
	(document.getElementById("profile-pseudo") as HTMLElement).textContent = profile.pseudo;
	(document.getElementById("profile-email") as HTMLElement).textContent = profile.email;
	const select = document.getElementById("profile-status") as HTMLSelectElement;
	if (select) {
		select.value = profile.status;
		select.addEventListener("change", async (e) => {
			const status = (e.target as HTMLSelectElement).value;
			await genericFetch('/api/private/updateinfo/status', {
	 			method: 'POST',
	  			headers: { 'Content-Type': 'application/json' },
	  			body: JSON.stringify({ status })
			});
			console.log("Status changed :", status);
  		});
	}
  (document.getElementById("profile-money") as HTMLElement).textContent = profile.money;
  (document.getElementById("profile-elo") as HTMLElement).textContent = profile.elo;

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
		twofaStatusText.textContent = "2FA Enabled";
		twofaDisableBtn.classList.remove("hidden");
	} else {
		twofaStatusText.textContent = "2FA Disabled";
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
			alert("Failed to setup 2FA.");
		}
	});

	// --- Verify the 6-digit code ---
	verifyBtn.addEventListener("click", async () => {
		const code = verifyInput.value.trim();
		if (code.length !== 6) {
			alert("Please enter a valid 6-digit code.");
			return;
		}

		try {
			await genericFetch("/api/private/2fa/enable", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ code })
			});

			alert("2FA Enabled!");

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
			alert("Invalid code, please try again.");
		}
	});

	// --- Disable 2FA ---
	twofaDisableBtn.addEventListener("click", async () => {
		try {
			await genericFetch("/api/private/2fa/disable", { method: "POST" });

			alert("2FA Disabled!");

			twofaDisableBtn.classList.add("hidden");
			twofaEnableBtn.classList.remove("hidden");
			twofaStatusText.textContent = "2FA Disabled";

			twofaQr.classList.add("hidden");
			verifyContainer.classList.add("hidden");
			verifyInput.value = "";

		} catch (err) {
			console.error(err);
			alert("Failed to disable 2FA.");
		}
	});  
}
