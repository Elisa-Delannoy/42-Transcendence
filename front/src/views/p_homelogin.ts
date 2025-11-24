import { resourceLimits } from "worker_threads";
import { genericFetch} from "../router";

export function HomeLoginView(): string {
  return (document.getElementById("homeloginhtml") as HTMLTemplateElement).innerHTML;
}
export async function initHomePage() {
  try {
	const result = await genericFetch("/api/private/homelogin", {
		method: "POST",
		credentials: "include"
	});
	document.querySelector("#pseudo")!.textContent = result.pseudo;
	} catch (err) {
		// console.error(err);
	}
}
