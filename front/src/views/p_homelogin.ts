import { genericFetch} from "../router";

export function HomeLoginView(): string {
  return (document.getElementById("homeloginhtml") as HTMLTemplateElement).innerHTML;
}
export async function initHomePage() {
  try {
	const res = await genericFetch("/api/private/homelogin", {
		method: "POST",
		credentials: "include"
	});
	// if (!res.ok)
	// 	throw new Error("Unauthorized");
	const result = await res.json();
	document.querySelector("#pseudo")!.textContent = result.pseudo;
	} catch (err) {
		console.error(err);
	}
}
