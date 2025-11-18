export function isLoggedIn(): boolean {
  return localStorage.getItem("token") !== null;
}

export function logout() {
  localStorage.removeItem("token");
}