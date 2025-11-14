import { isLoggedIn, logout } from "../auth";
import { navigateTo } from "../router";

export function HomeLoginView(): string {
  return (document.getElementById("homeloginhtml") as HTMLTemplateElement).innerHTML;
}

