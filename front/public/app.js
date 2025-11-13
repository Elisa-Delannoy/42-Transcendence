// src/views/home.ts
function HomeView() {
  return document.getElementById("homehtml").innerHTML;
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
  return document.getElementById("loginhtml").innerHTML;
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

// src/router.ts
var routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView },
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister }
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
  match.init?.();
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
