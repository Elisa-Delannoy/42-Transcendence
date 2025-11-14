// src/views/home.ts
function HomeView() {
  return document.getElementById("homehtml").innerHTML;
}

// src/auth.ts
async function login(username, password) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const result = await res.json();
    if (res.ok) {
      localStorage.setItem("token", "OK");
      return true;
    } else
      return false;
  } catch (err) {
    console.error("Erreur serveur:", err);
    return false;
  }
}
function isLoggedIn() {
  return localStorage.getItem("token") !== null;
}
function logout() {
  localStorage.removeItem("token");
}

// src/views/login.ts
function LoginView() {
  return document.getElementById("loginhtml").innerHTML;
}
function toLogin() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const success = await login(username, password);
    if (success) {
      updateNav();
      navigateTo("/homelogin");
    } else
      alert("Identifiants incorrects");
  });
}

// src/views/dashboard.ts
function DashboardView() {
  setTimeout(() => {
    const btn = document.getElementById("logout-btn");
    btn.addEventListener("click", () => {
      logout();
      navigateTo("/login");
    });
  }, 0);
  return document.getElementById("dashboardhtml").innerHTML;
}

// src/views/register.ts
function RegisterView() {
  return document.getElementById("registerhtml").innerHTML;
}
function initRegister() {
  const form = document.getElementById("register-form");
  const message = document.getElementById("register-message");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password")
    };
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      message.textContent = result.message;
    } catch (err) {
      message.textContent = "Erreur serveur...";
      console.error(err);
    }
  });
}

// src/views/p_homelogin.ts
function HomeLoginView() {
  return document.getElementById("homeloginhtml").innerHTML;
}

// src/views/p_profil.ts
function ProfilView() {
  return document.getElementById("profilhtml").innerHTML;
}

// src/views/p_game.ts
function GameView() {
  return document.getElementById("gamehtml").innerHTML;
}

// src/views/p_tournament.ts
function TournamentView() {
  return document.getElementById("tournamenthtml").innerHTML;
}

// src/router.ts
var routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init: toLogin },
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister },
  { path: "/homelogin", view: HomeLoginView },
  { path: "/profil", view: ProfilView },
  { path: "/game", view: GameView },
  { path: "/tournament", view: TournamentView }
];
function navigateTo(url) {
  history.pushState(null, "", url);
  router();
}
function updateNav() {
  const publicNav = document.getElementById("public-nav");
  const privateNav = document.getElementById("private-nav");
  if (isLoggedIn()) {
    publicNav.style.display = "none";
    privateNav.style.display = "block";
    const button = document.getElementById("butlogout");
    button.addEventListener("click", () => {
      logout();
      updateNav();
      navigateTo("/");
    });
  } else {
    publicNav.style.display = "block";
    privateNav.style.display = "none";
  }
}
function router() {
  const match = routes.find((r) => r.path === location.pathname);
  if (!match) {
    document.querySelector("#app").innerHTML = "<h1>404 Not Found</h1>";
    return;
  }
  if (match.path === "/dashboard" && !isLoggedIn()) {
    return navigateTo("/login");
  }
  document.querySelector("#app").innerHTML = match.view();
  match.init?.();
  updateNav();
}
function initRouter() {
  document.body.addEventListener("click", (e) => {
    const target = e.target;
    if (target.matches("[data-link]")) {
      e.preventDefault();
      navigateTo(target.getAttribute("href"));
    }
  });
  window.addEventListener("popstate", router);
  localStorage.removeItem("token");
  router();
}

// src/main.ts
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
