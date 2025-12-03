import { friends } from "../../../back/server";
import { genericFetch, loadHeader } from "../router";

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
    		myfriends.forEach((friend: number) => {
      			const li = document.createElement("li");
      			li.textContent = friend.toString();
				ul?.appendChild(li);
    });
  }
	}
	catch (err) {
		console.log(err);
	}
}
