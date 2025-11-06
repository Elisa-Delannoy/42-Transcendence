export function login(username: string, password: string): boolean {
  // Fake login pour l'exemple
  if (username === "admin" && password === "42") {
    localStorage.setItem("token", "OK");
    return true;
  }
  return false;
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("token") !== null;
}

export function logout() {
  localStorage.removeItem("token");
}
