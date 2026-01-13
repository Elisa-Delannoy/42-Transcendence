import { chatNetwork, dataChat } from "../chat/chatNetwork";

export const chatnet: chatNetwork = new chatNetwork();
export let firstLogin = false;

export async function displayChat() {	
	const template = document.getElementById("chat-template") as HTMLTemplateElement;
	const clone = template.content.cloneNode(true);
	document.getElementById("chat-container")!.appendChild(clone);

	const chatBar = document.getElementById("chat-bar");
	const chatWindow = document.getElementById("chat-window");

	chatBar!.addEventListener("click", () => {
		chatWindow!.classList.toggle("hidden");
		chatWindow!.classList.toggle("flex");
	});

	const form = document.getElementById("chat-form");
	const input = document.getElementById("chat-input") as HTMLInputElement;
	
	chatnet.receiveHistory((messages) => {
		messages.forEach(msg => addMessageGeneral(msg));
	});

	chatnet.receiveMessage((data) => {
			addMessageGeneral(data);
		})
	
		chatnet.receiveError((error) => {
			displayError(error.error);
		})

	form!.addEventListener("submit", (e) => {
		e.preventDefault();

		chatnet.sendMessage(input.value);
		input.value = "";
	});
}

function addMessageGeneral(data: dataChat) {
	const box = document.getElementById("chat-box");

	const div = document.createElement("div");
	div.className = "bg-amber-100/90 p-2 rounded-lg break-words max-w-full";

	div.innerHTML = `
		<div class="flex items-center justify-between">
			<span class="font-semibold text-amber-950">${data.pseudo}</span>
			<span class="text-xs text-gray-800">${new Date(data.date).toLocaleTimeString()}</span>
		</div>
		<div class="text-amber-900">${data.message}</div>
	`;

	box!.appendChild(div);
	box!.scrollTop = box!.scrollHeight;
}

function displayError(message: string) {
	const input = document.getElementById("chat-input") as HTMLInputElement;
	const oldPlaceholder = input.placeholder;
	input.style.border = "2px solid red";
	// input.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
	input.placeholder = message;

	setTimeout(() => {
		input.classList.remove("input-error");
		input.placeholder = oldPlaceholder;
		input.style.border = "";
	}, 1500);
}



export function setFirstLogin(value: boolean) {
	console.log("dans setfirslogin", value);
	firstLogin = value;
}

export function hideChat() {
	const container = document.getElementById("chat-container");
	if (container)
		container.innerHTML = "";
	firstLogin = false;
	console.log("dans hidechat", firstLogin);
	chatnet.disconnect();
}