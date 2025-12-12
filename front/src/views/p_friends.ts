import { IMyFriends } from "../../../back/DB/friend";
import { friends } from "../../../back/server";
import { genericFetch, loadHeader } from "../router";
import { IUsers } from "../../../back/DB/users";
import { request } from "http";

export function FriendsView(): string {
	loadHeader();
	return (document.getElementById("friendshtml") as HTMLTemplateElement).innerHTML;
}

export async function initFriends() {
	try {
		const myfriends: IMyFriends[] = await genericFetch("/api/private/friend", {
			method: "POST",
		});

		const acceptedFriends = myfriends.filter( f => f.friendship_status === "accepted");
		const pendingFriends = myfriends.filter( f => f.friendship_status === "pending");

		doSearch(acceptedFriends, pendingFriends, myfriends);
		myFriends(acceptedFriends);
		pendingFr(pendingFriends);
	}
	catch (err) {
		console.log(err);
	}
}

async function myFriends(acceptedFriends: IMyFriends[]) {
	const divNoFriend = document.getElementById("no-friend") as HTMLElement;
	const divFriend = document.getElementById("friends") as HTMLElement;
	if (acceptedFriends.length === 0) {
		divNoFriend.textContent = "No friends yet";
		divFriend.classList.add("hidden");
		divNoFriend.classList.remove("hidden");
	}
	else {
		divFriend.classList.remove("hidden");
		divNoFriend.classList.add("hidden");
		const ul = divFriend.querySelector("ul");
		acceptedFriends.forEach(async (friend: IMyFriends) => {
			const li = document.createElement("li");
			li.textContent = "Pseudo: " + friend.pseudo + ", status: " + friend.webStatus + ", invitation: " + friend.friendship_status + ", friend since: " + friend.friendship_date;
			const img = document.createElement("img");
			img.src =  friend.avatar;
			img.alt = `${friend.pseudo}'s avatar`;
			img.width = 64;
			li.appendChild(img);
			ul?.appendChild(li);
		});
	}
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>): void => {
		clearTimeout(timeout);
		timeout = setTimeout(() => { fn(...args) }, delay);
	};
}

function doSearch(acceptedFriends: IMyFriends[], pendingFriends: IMyFriends[], myfriends: IMyFriends[]) {
	const input = (document.getElementById("searchInput") as HTMLInputElement | null);
	if (!input)
		return;
	const debouncedSearch = debounce(search, 300);
	input.addEventListener("input", () => {
		const memberSearched = input.value.trim();
		debouncedSearch(memberSearched, myfriends);
	});
}

async function search(memberSearched: string, myfriends: IMyFriends[]) {
	const listedMember = (document.getElementById("members") as HTMLUListElement | null);
	if (!listedMember)
		return;
	if (memberSearched === "") {
		listedMember.innerHTML = "";
		return;
	}
	try {
		const existedMember = await genericFetch("/api/private/friend/search", {
			method: "POST",
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ member: memberSearched })
		});
		listedMember.innerHTML = "";
		if (existedMember.length === 0)	
			listedMember.innerHTML = "<li>No result</li>";
		else {
			existedMember.forEach((member: IUsers) => {
				const li = document.createElement("li");
				li.className = "flex items-center gap-3 p-2 justify-center";
				const img = document.createElement("img");
				const span = document.createElement("span");
				span.textContent = member.pseudo;
  				img.src =  member.avatar;
				img.alt = `${member.pseudo}'s avatar`;
				img.className = "w-8 h-8 rounded-full object-cover";
				const isFriend = myfriends.some(f => f.id === member.user_id);
				li.appendChild(img);
				li.appendChild(span);
				if (!isFriend) {
					const button = toAddFriend(member.user_id);
					li.appendChild(button);
				}
				listedMember.appendChild(li);
				
			})
		}
	}
	catch (error) {
		console.log(error);
	}
}

function toAddFriend(id: number): HTMLButtonElement {
	const button = document.createElement("button") as HTMLButtonElement;
	button.textContent = "Add friend";
	button.className = "px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600";

	button.addEventListener("click", async () => {
		console.log("before add");
		try {
			await genericFetch("/api/private/friend/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ friendID: id })
			});
			console.log("after add", );
			button.textContent = "pending";
			button.disabled = true;
		}
		catch (err) {
			console.log(err);
			button.disabled = false;
		}
	})
	return button;
}

function toAcceptFriend(friend: IMyFriends): HTMLButtonElement {
	const button = document.createElement("button") as HTMLButtonElement;
	if (friend.asked_by !== friend.id) {
		button.textContent = "Pending invitation";
		button.disabled = true
		return button;
	}
	button.textContent = "Accept invitation";
	button.className = "px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600";
	button.addEventListener("click", async () => {
		try {
			await genericFetch("/api/private/friend/accept", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ friendID: friend.id })
			});
			button.textContent = "Accepted";
			button.disabled = true;
		}
		catch (err) {
			console.log(err);
			button.disabled = false;
		}
	})
	return button;
}

function pendingFr(pendingFriends: IMyFriends[]) {
	const divPending = document.getElementById("pending") as HTMLElement;
	const ul = divPending.querySelector("ul");
	pendingFriends.forEach(async (friend: IMyFriends) => {
		const li = document.createElement("li");
		li.textContent = "Pseudo: " + friend.pseudo + ", requested since: " + friend.friendship_date;
		const img = document.createElement("img");
		img.src =  friend.avatar;
		img.alt = `${friend.pseudo}'s avatar`;
		img.width = 64;
		const button = toAcceptFriend(friend);
		li.appendChild(img);
		li.appendChild(button);
		ul?.appendChild(li);
	});
}

