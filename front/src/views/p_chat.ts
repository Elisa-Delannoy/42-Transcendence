import { chatNetwork, dataChat } from "../chat/chatNetwork";

export const chatnet: chatNetwork = new chatNetwork();
export let firstLogin = false;

export async function displayChat() {	
	const template = document.getElementById("chat-template") as HTMLTemplateElement;
	const clone = template.content.cloneNode(true) as DocumentFragment;
	
	const chatWindow = clone.querySelector(".chat-window") as HTMLElement;
	const chatBox = clone.querySelector(".chat-box") as HTMLElement;
	const form = clone.querySelector(".chat-form") as HTMLFormElement;
	const input = clone.querySelector(".chat-input") as HTMLInputElement;
	const chatBar = clone.querySelector(".chat-bar") as HTMLElement;
	
	document.getElementById("chat-container")!.appendChild(clone);
	// const chatBar = document.getElementById("chat-bar") as HTMLElement;
	// const chatWindow = document.getElementById("chat-window");

	chatBar.addEventListener("click", () => {
	    chatWindow.classList.toggle("hidden");
	
	    if (!chatWindow.classList.contains("hidden")) {
	        setTimeout(() => {
	            chatBox.scrollTop = chatBox.scrollHeight;
	        }, 0);
	    }
	});


	// const form = document.getElementById("chat-form");
	// const input = document.getElementById("chat-input") as HTMLInputElement;
	
	chatnet.receiveHistory((messages) => {
		messages.forEach(msg => addMessageGeneral(msg, chatBox));

		// const chatWindow = document.getElementById("chat-window"); 
		// const chatBox = document.getElementById("chat-box");
		// chatWindow!.classList.remove("hidden");

		// const chatBox = document.getElementById("chat-box");
		setTimeout(() => {
			chatBox!.scrollTop = chatBox!.scrollHeight;
		}, 0);
		// requestAnimationFrame(() => {
		// 	chatBox!.scrollTop = chatBox!.scrollHeight;
		// });
	});

	chatnet.receiveMessage((data) => {
			addMessageGeneral(data, chatBox);
			chatBox.scrollTop = chatBox.scrollHeight;
		})
	
		chatnet.receiveError((error) => {
			displayError(error.error, input);
		})

	form!.addEventListener("submit", (e) => {
		e.preventDefault();

		chatnet.sendMessage(input.value);
		input.value = "";
	});
}

function addMessageGeneral(data: dataChat, box: HTMLElement) {
	// const box = document.getElementById("chat-box");

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

function displayError(message: string, input: HTMLInputElement) {
	// const input = document.getElementById("chat-input") as HTMLInputElement;
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