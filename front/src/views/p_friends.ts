import { IMyFriend } from "../../../back/DB/friend";
import { friends } from "../../../back/server";
import { genericFetch, loadHeader } from "../router";
import { IUsers } from "../../../back/DB/users";

export function FriendsView(): string {
	loadHeader();
	return (document.getElementById("friendshtml") as HTMLTemplateElement).innerHTML;
}

export async function initFriends() {
	doSearch();
	myFriends();
}

async function myFriends() {
	try {
		const myfriends = await genericFetch("/api/private/friend", {
			method: "POST",
		});

		const divNoFriend = document.getElementById("no-friend") as HTMLElement;
		const divFriend = document.getElementById("friends") as HTMLElement;
		const divPending = document.getElementById("pending") as HTMLElement;

		if (myfriends.length === 0) {
			divNoFriend.textContent = "No friends yet";
			divFriend.classList.add("hidden");
			divNoFriend.classList.remove("hidden");
		}
		else {
			divFriend.classList.remove("hidden");
			divNoFriend.classList.add("hidden");
			const ul = divFriend.querySelector("ul");
			myfriends.forEach(async (friend: IMyFriend) => {
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
		const ul = divPending.querySelector("ul");
		myfriends.forEach(async (friend: IMyFriend) => {
				if (friend.friendship_status === "pending") {
					const li = document.createElement("li");
					li.textContent = "Pseudo: " + friend.pseudo + ", invitation: " + friend.friendship_status;
					const img = document.createElement("img");
					img.src =  friend.avatar;
					img.alt = `${friend.pseudo}'s avatar`;
					img.width = 64;
					li.appendChild(img);
					ul?.appendChild(li);
				}
			});
	}
	catch (err) {
		console.log(err);
	}
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
	let timeout: ReturnType<typeof setTimeout>;
	return (...args: Parameters<T>): void => {
		clearTimeout(timeout);
		timeout = setTimeout(() => { fn(...args) }, delay);
	};
}

function doSearch() {
	const input = (document.getElementById("searchInput") as HTMLInputElement | null);
	if (!input)
		return;
	const debouncedSearch = debounce(search, 300);
	input.addEventListener("input", () => {
		const memberSearched = input.value.trim();
		debouncedSearch(memberSearched);
	});
}

async function search(memberSearched: string) {
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
				const button = toAddFriend(member.user_id);
				li.appendChild(img);
				li.appendChild(span);
				li.appendChild(button);
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
		try {
			await genericFetch("/api/private/friend/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ friendID: id })
			});
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

async function pending() {
	try {
		const myfriends = await genericFetch("/api/private/friend/pending", {
			method: "GET",
		});

		myfriends.forEach(async (friend: IMyFriend) => {
			const li = document.createElement("li");
      		li.textContent = "Pseudo: " + friend.pseudo + ", status: " + friend.webStatus + ", invitation: " + friend.friendship_status + ", friend since: " + friend.friendship_date;
			const img = document.createElement("img");
  			img.src =  friend.avatar;
			img.alt = `${friend.pseudo}'s avatar`;
  			img.width = 64;
  			li.appendChild(img)
		});
	}
	catch (err) {
		console.log(err);
	}
}

