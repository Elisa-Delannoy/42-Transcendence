import { container } from "googleapis/build/src/apis/container";
import { chatNetwork, dataChat } from "../chat/chatNetwork";
import { socketTokenOk } from "../../../back/middleware/jwt";

export const chatnet: chatNetwork = new chatNetwork();

export async function displayChat() {	
	const template = document.getElementById("chat-template") as HTMLTemplateElement;
	const clone = template.content.cloneNode(true);
	document.getElementById("chat-container")!.appendChild(clone);

	const chatBar = document.getElementById("chat-bar");
	const chatWindow = document.getElementById("chat-window");
	const chatBox = document.getElementById("chat-box");
	const form = document.getElementById("chat-form") as HTMLFormElement;
	const input = document.getElementById("chat-input") as HTMLInputElement;

	chatBar!.addEventListener("click", () => {
		chatWindow!.classList.toggle("hidden");
		if (!chatWindow?.classList.contains("hidden")) {
			chatBar!.classList = "dark:bg-amber-800 dark:text-amber-100 bg-amber-100 hover:bg-amber-800 text-amber-100 px-4 py-2 rounded-lg shadow cursor-pointer w-32 text-center";
			setTimeout(() => {
				chatBox!.scrollTop = chatBox!.scrollHeight;
			}, 0);
		}
	});

	const container = document.getElementById("message-list") as HTMLDivElement;
	chatnet.receiveHistory((messages) => {
		messages.forEach(msg => addMessageGeneral(msg, chatBox!, container));
	});

	chatnet.receiveMessage((data) => {
			addMessageGeneral(data, chatBox!, container);
			chatBox!.scrollTop = chatBox!.scrollHeight;
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

function addMessageGeneral(data: dataChat, box: HTMLElement, container: HTMLDivElement) {
	let template: HTMLTemplateElement;
if (data.me === undefined)
		data.me = (data.id === chatnet.getsocketUserID())
	if (data.me)
		template = document.getElementById("my-chat-message") as HTMLTemplateElement;
	else
		template = document.getElementById("chat-message") as HTMLTemplateElement;
	const item = document.createElement("div") as HTMLDivElement;
	const clone = template.content.cloneNode(true) as DocumentFragment;
	const pseudo = clone.getElementById("chat_pseudo") as HTMLSpanElement;
	const date = clone.getElementById("chat_date") as HTMLSpanElement;
	const message = clone.getElementById("message") as HTMLDivElement;
	pseudo.textContent = data.pseudo;
	date.textContent = selectDate(data.date);
	message.innerHTML = data.message;
	item.appendChild(clone);
	box!.appendChild(item);
	box!.scrollTop = box!.scrollHeight;
	clone.appendChild(container);
}

function selectDate(date: string): string {
	const theDate = new Date(date).toLocaleDateString();
	const now = new Date().toLocaleDateString();
	const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString();

	if (theDate === now)
		return "today, " + new Date(date).toLocaleTimeString();
	if (theDate === yesterday)
		return "yesterday, " + new Date(date).toLocaleTimeString();
	return new Date(date).toLocaleString();
}

function displayError(message: string, input: HTMLInputElement) {
	const oldPlaceholder = input.placeholder;
	input.style.border = "2px solid red";
	input.placeholder = message;

	setTimeout(() => {
		input.classList.remove("input-error");
		input.placeholder = oldPlaceholder;
		input.style.border = "";
	}, 1500);
}

export function hideChat() {
	const container = document.getElementById("chat-container");
	if (container)
		container.innerHTML = "";
	chatnet?.disconnect();
}