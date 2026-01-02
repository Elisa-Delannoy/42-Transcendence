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
	const container = document.getElementById("friend-list") as HTMLDivElement;
	if (!container)
		return;
	if (acceptedFriends.length === 0) {
		container.innerHTML = `<p class="text-xl italic text-center text-amber-800">No friend yet</p>`;
		return;
	}
	acceptedFriends.forEach(async (friend: IMyFriends) => {
		const template = document.getElementById("myfriends") as HTMLTemplateElement;
		const item = document.createElement("div") as HTMLDivElement;
		item.classList.add("dash");
		const clone = template.content.cloneNode(true) as DocumentFragment;
		const avatar = clone.getElementById("avatar") as HTMLImageElement;
		const pseudo = clone.getElementById("pseudo") as HTMLParagraphElement;
		const date = clone.getElementById("date-friendship") as HTMLParagraphElement;
		const status = clone.getElementById("f_status") as HTMLImageElement;
		pseudo.textContent = friend.pseudo;
  		avatar.src =  friend.avatar;
		avatar.alt = `${friend.pseudo}'s avatar`;
		date.textContent = "friend since " + new Date(friend.friendship_date).toLocaleDateString();		
		displayStatus(friend, status);
		toDeleteFriend(friend.id, clone);
		item.appendChild(clone);
		container.appendChild(item);
	});
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

function toAcceptFriend(friend: IMyFriends,li: DocumentFragment ) {
	const button = li.getElementById("addordelete") as HTMLButtonElement;
	if (friend.asked_by !== friend.id) {
		// button.textContent = "Delete invitation";
		toDeleteFriend(friend.id, li);
		return button;
	}
	button.textContent = "Accept invitation";
	button.classList.add("hover:bg-amber-800");
	// button.className = "px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600";
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

	const container = document.getElementById("pending-list") as HTMLDivElement;
	if (!container)
		return;
	if (pendingFriends.length === 0) {
		container.innerHTML = `<p class="text-xl italic text-center text-amber-800">No pending invitation</p>`;
		return;
	}
	pendingFriends.forEach(async (friend: IMyFriends) => {
		const template = document.getElementById("myfriends") as HTMLTemplateElement;
		const item = document.createElement("div") as HTMLDivElement;
		item.classList.add("dash");
		const clone = template.content.cloneNode(true) as DocumentFragment;
		const avatar = clone.getElementById("avatar") as HTMLImageElement;
		const pseudo = clone.getElementById("pseudo") as HTMLParagraphElement;
		const date = clone.getElementById("date-friendship") as HTMLParagraphElement;
		pseudo.textContent = friend.pseudo;
  		avatar.src =  friend.avatar;
		avatar.alt = `${friend.pseudo}'s avatar`;
		date.textContent = "Pending since " + new Date(friend.friendship_date).toLocaleDateString();		
		toAcceptFriend(friend, clone);
		item.appendChild(clone);
		container.appendChild(item);
	});
}

function youMayKnow(opponent: {id: number, pseudo: string, avatar: string}[]) {
	const divNoOpponent = document.getElementById("no-opponent") as HTMLElement;
	const divOpponent = document.getElementById("opponent") as HTMLElement;
	if (opponent.length === 0) {
		divNoOpponent.classList.remove("hidden");
		return;
	}
	const container = document.getElementById("opponent-list") as HTMLDivElement;
	opponent.forEach(async (user: {id: number, pseudo: string, avatar: string}) => {
		const template = document.getElementById("myfriends") as HTMLTemplateElement;
		const item = document.createElement("div") as HTMLDivElement;
		item.classList.add("dash");
		const clone = template.content.cloneNode(true) as DocumentFragment;
		const avatar = clone.getElementById("avatar") as HTMLImageElement;
		const pseudo = clone.getElementById("pseudo") as HTMLParagraphElement;
		// const date = clone.getElementById("date-friendship") as HTMLParagraphElement;
		// const status = clone.getElementById("f_status") as HTMLImageElement;
		pseudo.textContent = user.pseudo;
  		avatar.src =  user.avatar;
		avatar.alt = `${user.pseudo}'s avatar`;
		// date.textContent = "friend since " + new Date(friend.friendship_date).toLocaleDateString();		
		// displayStatus(friend, status);
		toAddFriend(user.id, clone);
		item.appendChild(clone);
		container.appendChild(item);
	});
}
