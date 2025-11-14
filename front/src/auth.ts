export async function login(username: string, password: string): Promise<boolean> {

try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({username, password}),
      });
      const result = await res.json();
      if (res.ok)
      {
        localStorage.setItem("token", "OK");
        return true;
      }
      else
        return false;
    } catch (err) {
      console.error("Erreur serveur:", err);
      return false;     
  }
}

export function isLoggedIn(): boolean {
  return localStorage.getItem("token") !== null;
}

export function logout() {
  localStorage.removeItem("token");
}

