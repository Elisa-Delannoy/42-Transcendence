// src/views/home.ts
function HomeView() {
  return `
    <h1>Bienvenue \u{1F44B}</h1>
    <p>C'est la page d'accueil.</p>
  `;
}

// src/auth.ts
function login(username, password) {
  if (username === "admin" && password === "42") {
    localStorage.setItem("token", "OK");
    return true;
  }
  return false;
}
function isLoggedIn() {
  return localStorage.getItem("token") !== null;
}
function logout() {
  localStorage.removeItem("token");
}

// src/views/login.ts
function LoginView() {
  setTimeout(() => {
    const form = document.getElementById("login-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      if (login(username, password)) {
        navigateTo("/dashboard");
      } else {
        alert("Identifiants incorrects");
      }
    });
  }, 0);
  return `
    <h1>Connexion</h1>
    <form id="login-form">
      <input id="username" placeholder="username" required />
      <input id="password" type="password" placeholder="password" required />
      <button>Se connecter</button>
    </form>
  `;
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
  return `
    <h1>Dashboard \u{1F3AE}</h1>
    <button id="logout-btn">Se d\xE9connecter</button>
  `;
}

// src/router.ts
var routes = [
  {
    path: "/",
    view: HomeView
  },
  {
    path: "/login",
    view: LoginView
  },
  {
    path: "/dashboard",
    view: DashboardView
  }
];
function navigateTo(url) {
  history.pushState(null, "", url);
  router();
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
  router();
}

// src/main.ts
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
