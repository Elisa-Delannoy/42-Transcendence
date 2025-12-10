import { IMyFriend } from "../../../back/DB/friend";
import { friends } from "../../../back/server";
import { genericFetch, loadHeader } from "../router";
import { IUsers } from "../../../back/DB/users";

export function FriendsView(): string {
	loadHeader();
	return (document.getElementById("friendshtml") as HTMLTemplateElement).innerHTML;
}



export async function initFriends() {
	try {
		const myfriends = await genericFetch("/api/private/friend", {
			method: "POST",
		});

		const divNoFriend = document.getElementById("no-friend") as HTMLElement;
		const divFriend = document.getElementById("friends") as HTMLElement;

    	if (myfriends.length === 0) {
			divNoFriend.textContent = "No friends yet";
			divFriend.classList.add("hidden");
			divNoFriend.classList.remove("hidden");
		}
    	else {
			divFriend.classList.remove("hidden");
			divNoFriend.classList.add("hidden");
			const ul = divFriend.querySelector("ul");
			const prepareInfo = myfriends.map(async (friend: IMyFriend) => {
				const avatarBin = await loadAvatar(friend.id);
      			const li = document.createElement("li");
      			li.textContent = "Pseudo: " + friend.pseudo + ", status: " + friend.webStatus + ", invitation: " + friend.friendship_status + ", friend since: " + friend.friendship_date;
				const img = document.createElement("img");
  				img.src =  URL.createObjectURL(avatarBin)
				img.alt = `${friend.pseudo}'s avatar`;
  				img.width = 64;
  				li.appendChild(img)
				return li;
    		});
			const allInfo = await Promise.all(prepareInfo);
			allInfo.forEach(li => ul?.appendChild(li));
  		}
  		search();
	}
	catch (err) {
		console.log(err);
	}
}

async function search() {
	const input = (document.getElementById("searchInput") as HTMLInputElement | null);
	const listedMember = (document.getElementById("members") as HTMLUListElement | null);
	if (!input || ! listedMember)
		return;
	input.addEventListener("input", async() => {
		const memberSearched = input.value.trim();
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
					li.textContent = member.pseudo;
					listedMember.appendChild(li);
				})
			}
		}
		catch (error) {
			console.log(error);
		}
	});
}

export async function loadAvatar(id: number) {
	const res = await fetch("api/private/member/avatar", {
		method: "POST",
		credentials: "include", 
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ memberID: id })

	})
	const avatarBin = await res.blob();
	return avatarBin;
}