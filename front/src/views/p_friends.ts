import { IMyFriends } from "../../../back/DB/friend";
import { friends } from "../../../back/server";
import { displayStatus, genericFetch, loadHeader, navigateTo } from "../router";
import { IUsers } from "../../../back/DB/users";
import { request } from "http";
import { stat } from "fs";
import { IFriendsAndNot } from "../../../back/routes/friends/friends";
import { linearBuckets } from "prom-client";

export function FriendsView(): string {
	loadHeader();
	return (document.getElementById("friendshtml") as HTMLTemplateElement).innerHTML;
}

export async function initFriends() {
	try {
		const allInfo: IFriendsAndNot = await genericFetch("/api/private/friend", {
			method: "POST",
		});
		const acceptedFriends = allInfo.allMyFriends.filter(f => f.friendship_status === "accepted");
		const pendingFriends = allInfo.allMyFriends.filter(f => f.friendship_status === "pending");
		const playedWithNotF = allInfo.playedWith;
		doSearch(allInfo.allMyFriends);
		myFriends(acceptedFriends);
		pendingFr(pendingFriends);
		youMayKnow(playedWithNotF);
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

			const status = document.createElement("span") as HTMLImageElement;
			status.className ="absolute w-4 h-4 rounded-full border-2 border-white";
			displayStatus(friend, status);
			const li = document.createElement("li");
			li.className = "flex items-center gap-3";
			const span = document.createElement("span");
			span.textContent = friend.pseudo + " friend since: " + friend.friendship_date;
			const img = document.createElement("img");
			img.src =  friend.avatar;
			img.alt = `${friend.pseudo}'s avatar`;
			img.width = 64;
			const button: HTMLButtonElement = toDeleteFriend(friend.id);
			li.appendChild(img);
			li.appendChild(status);
			li.appendChild(span);
			li.appendChild(button);
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

function doSearch(myfriends: IMyFriends[]) {
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
				const template = document.getElementById("list-search") as HTMLTemplateElement;
				const clone = template.content.cloneNode(true) as DocumentFragment;
				const avatar = clone.getElementById("avatar") as HTMLImageElement;
				const pseudo = clone.getElementById("pseudo") as HTMLParagraphElement;
				pseudo.textContent = member.pseudo;
  				avatar.src =  member.avatar;
				avatar.alt = `${member.pseudo}'s avatar`;
				const isFriend = myfriends.some(f => f.id === member.user_id);
				if (!isFriend) 
					toAddFriend(member.user_id, clone);
				else
					toDeleteFriend(member.user_id, clone);
				listedMember.appendChild(clone);
			})
		}
	}
	catch (error) {
		console.log(error);
	}
}

function toAddFriend(id: number, li: DocumentFragment)
{
	const button = li.getElementById("addordelete") as HTMLButtonElement;
	button.textContent = "Add friend";
	button.classList.add("hover:bg-amber-600");
	button.addEventListener("click", async () => {
		try {
			await genericFetch("/api/private/friend/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ friendID: id })
			});
			button.textContent = "pending";
			button.disabled = true;
			navigateTo("/friends");
		}
		catch (err) {
			console.log(err);
			button.disabled = false;
		}
	})
}

function toAcceptFriend(friend: IMyFriends): HTMLButtonElement {
	const button = document.createElement("button") as HTMLButtonElement;
	if (friend.asked_by !== friend.id) {
		// button.textContent = "Pending invitation";
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
			navigateTo("/friends");
		}
		catch (err) {
			console.log(err);
			button.disabled = false;
		}
	})
	return button;
}

function toDeleteFriend(id: number, li: DocumentFragment) {
	const button = li.getElementById("addordelete") as HTMLButtonElement;
	button.textContent = "Delete";
	button.classList.add("hover:bg-amber-800");
	button.addEventListener("click", async () => {
		try {
			await genericFetch("/api/private/friend/delete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ friendID: id })
			});
			button.textContent = "deleted";
			button.disabled = true;
			navigateTo("/friends");
		}
		catch (err) {
			console.log(err);
			button.disabled = false;
		}
	})
}

function pendingFr(pendingFriends: IMyFriends[]) {
	const divNoPending = document.getElementById("no-pending") as HTMLElement;
	const divPending = document.getElementById("pending") as HTMLElement;
	if (pendingFriends.length === 0) {
		divNoPending.textContent = "No pending friends";
		divPending.classList.add("hidden");
		divNoPending.classList.remove("hidden");
	}
	else {
		divPending.classList.remove("hidden");
		divNoPending.classList.add("hidden");
		const ul = divPending.querySelector("ul");
		pendingFriends.forEach(async (friend: IMyFriends) => {
			const li = document.createElement("li");
			li.textContent = friend.pseudo + ", requested since: " + friend.friendship_date;
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
}

function youMayKnow(opponent: {id: number, pseudo: string, avatar: string}[]) {
	const divNoOpponent = document.getElementById("no-opponent") as HTMLElement;
	const divOpponent = document.getElementById("opponent") as HTMLElement;
	if (opponent.length === 0) {
		divOpponent.classList.add("hidden");
		divNoOpponent.classList.remove("hidden");
	}
	else {
		divOpponent.classList.remove("hidden");
		divNoOpponent.classList.add("hidden");
		const ul = divOpponent.querySelector("ul");
		opponent.forEach(async (players: {id: number, pseudo: string, avatar: string}) => {
			const li = document.createElement("li");
			li.textContent = players.pseudo;
			const img = document.createElement("img");
			img.src =  players.avatar;
			img.alt = `${players.pseudo}'s avatar`;
			img.width = 64;
			const button = toAddFriend(players.id);
			li.appendChild(img);
			li.appendChild(button);
			ul?.appendChild(li);
		});
	}
}
