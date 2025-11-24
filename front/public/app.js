// front/src/views/home.ts
function HomeView() {
  return document.getElementById("homehtml").innerHTML;
}

// front/src/views/login.ts
function LoginView() {
  return document.getElementById("loginhtml").innerHTML;
}
function initLogin() {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const success = await login(username, password);
    if (success)
      navigateTo("/homelogin");
    else
      alert("Identifiants incorrects");
  });
}
async function login(username, password) {
  try {
    const res = await genericFetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });
    const result = await res.json();
    if (res.ok)
      return true;
    else
      return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

// front/src/views/dashboard.ts
function DashboardView() {
  return document.getElementById("dashboardhtml").innerHTML;
}

// front/src/views/register.ts
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

// front/src/views/p_game.ts
function GameView() {
  return document.getElementById("gamehtml").innerHTML;
}
function initGame() {
  const button = document.getElementById("start-quickgame");
  button?.addEventListener("click", async () => {
    const res = await fetch("/api/private/game/create", {
      method: "POST"
    });
    const { gameId } = await res.json();
    navigateTo(`/quickgame/${gameId}`);
  });
}

// front/src/views/p_quickgame.ts
function QuickGameView(params) {
  return document.getElementById("quickgamehtml").innerHTML;
}
function initQuickGame(params) {
  console.log("Game ID =", params?.id);
  const gameID = params?.id;
  console.log("gameID quickgame : ", gameID, " type = ", typeof gameID);
  setupGame(gameID);
}
function setupGame(gameID) {
  let isPlaying;
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const canvasHeight = canvas.height;
  const canvasWidth = canvas.width;
  let audioCtx;
  const paddleHeight = 60;
  const paddleWidth = 10;
  let paddleCenter;
  const game = {
    player1: {
      y: canvasHeight / 2 - paddleHeight / 2,
      movingUp: false,
      movingDown: false,
      speed: 5,
      score: 0,
      attraction: -2
    },
    player2: {
      y: canvasHeight / 2 - paddleHeight / 2,
      movingUp: false,
      movingDown: false,
      speed: 5,
      score: 0,
      attraction: 2
    },
    ball: {
      x: canvas.width / 2,
      y: canvas.height / 2,
      r: 5,
      speed: {
        maxX: 25,
        maxY: 1.6,
        minY: -1.6,
        x: 2,
        y: 2
      }
    }
  };
  let scoreMax = 4;
  let winner;
  let winnerId;
  let loserId;
  let anim;
  let randomValue;
  let increaseSpeed = -1.1;
  const maxAngle = Math.PI / 4;
  let startTime;
  let elapsedTime;
  function startTimer() {
    startTime = Date.now();
  }
  function stopTimer() {
    elapsedTime = Math.floor((Date.now() - startTime) / 1e3);
    console.log("Duration of the game : ", elapsedTime, "s.");
  }
  function playSound(frequency, duration) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration / 1e3);
  }
  function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fillRect(0, game.player1.y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, game.player2.y, paddleWidth, paddleHeight);
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "40px Verdana";
    ctx.textAlign = "center";
    ctx.fillText(`${game.player1.score}`, canvasWidth / 4 * 1.75, 50);
    ctx.fillText(`${game.player2.score}`, canvasWidth / 4 * 2.25, 50);
  }
  function movePlayer(player) {
    if (player.movingUp && player.y > 0)
      player.y -= player.speed;
    if (player.movingDown && player.y + paddleHeight < canvasHeight)
      player.y += player.speed;
  }
  function moveBall() {
    if (game.ball.y > canvas.height || game.ball.y < 0) {
      playSound(500, 60);
      game.ball.speed.y *= -1;
    }
    if (game.ball.x > canvas.width - paddleWidth / 2)
      collide(game.player2, game.player1);
    else if (game.ball.x < paddleWidth / 2)
      collide(game.player1, game.player2);
    game.ball.x += game.ball.speed.x;
    game.ball.y += game.ball.speed.y;
  }
  function resetPos() {
    game.player1.y = canvas.height / 2 - paddleHeight / 2;
    game.player2.y = canvas.height / 2 - paddleHeight / 2;
    game.ball.x = canvas.width / 2;
    game.ball.y = canvas.height / 2;
    randomValue = Math.random() * (game.ball.speed.maxY - game.ball.speed.minY) + game.ball.speed.minY;
    game.ball.speed.y = randomValue;
  }
  function resetGame() {
    resetPos();
    game.player1.score = 0;
    game.player2.score = 0;
    draw();
  }
  function increaseBallSpeed() {
    let sign;
    if (game.ball.speed.x * increaseSpeed < 0)
      sign = -1;
    else
      sign = 1;
    if (Math.abs(game.ball.speed.x * increaseSpeed) > game.ball.speed.maxX)
      game.ball.speed.x = game.ball.speed.maxX * sign;
    else
      game.ball.speed.x *= increaseSpeed;
    console.log(game.ball.speed.x);
  }
  function modifyBallAngle(player) {
    paddleCenter = player.y + paddleHeight / 2;
    let hitPos = game.ball.y - paddleCenter;
    let normalized = hitPos / (paddleHeight / 2);
    let bounceAngle = normalized * maxAngle;
    let speed = Math.sqrt(game.ball.speed.x ** 2 + game.ball.speed.y ** 2);
    game.ball.speed.y = speed * Math.sin(bounceAngle);
  }
  function collide(player, otherPlayer) {
    if (game.ball.y < player.y || game.ball.y > player.y + paddleHeight) {
      playSound(300, 300);
      resetPos();
      otherPlayer.score++;
      game.ball.speed.x = player.attraction;
      if (otherPlayer.score == scoreMax)
        isPlaying = false;
    } else {
      playSound(700, 80);
      modifyBallAngle(player);
      increaseBallSpeed();
    }
  }
  function moveAll() {
    movePlayer(game.player1);
    movePlayer(game.player2);
    moveBall();
  }
  function stop() {
    cancelAnimationFrame(anim);
    resetGame();
  }
  function displayWinner() {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    if (game.player1.score > game.player2.score) {
      winner = "Player 1 Wins!";
      winnerId = 1;
      loserId = 2;
      sendGameResult(winnerId, loserId, game.player1.score, game.player2.score, elapsedTime, gameID);
    } else {
      winner = "Player 2 Wins!";
      winnerId = 2;
      loserId = 1;
      sendGameResult(winnerId, loserId, game.player2.score, game.player1.score, elapsedTime, gameID);
    }
    ctx.fillText(winner, canvasWidth / 2, canvasHeight / 2);
  }
  function play() {
    if (!isPlaying) {
      stopTimer();
      displayWinner();
      return;
    }
    moveAll();
    draw();
    anim = requestAnimationFrame(play);
  }
  draw();
  document.addEventListener("keydown", (e) => {
    if (e.key === "w" || e.key === "W") game.player1.movingUp = true;
    if (e.key === "s" || e.key === "S") game.player1.movingDown = true;
    if (e.key === "o" || e.key === "O") game.player2.movingUp = true;
    if (e.key === "l" || e.key === "L") game.player2.movingDown = true;
  });
  document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "W") game.player1.movingUp = false;
    if (e.key === "s" || e.key === "S") game.player1.movingDown = false;
    if (e.key === "o" || e.key === "O") game.player2.movingUp = false;
    if (e.key === "l" || e.key === "L") game.player2.movingDown = false;
  });
  document.querySelector("#start-game")?.addEventListener("click", () => {
    audioCtx = new window.AudioContext();
    randomValue = Math.random() < 0.5 ? -2 : 2;
    game.ball.speed.x = randomValue;
    resetGame();
    isPlaying = true;
    startTimer();
    play();
  });
  document.querySelector("#stop-game")?.addEventListener("click", () => {
    isPlaying = false;
    stop();
  });
  async function sendGameResult(winnerId2, loserId2, winnerScore, loserScore, duration, id) {
    const res = await fetch("/api/private/game/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        winner_id: winnerId2,
        loser_id: loserId2,
        winner_score: winnerScore,
        loser_score: loserScore,
        duration_game: duration,
        id
      })
    });
    try {
      const data = await res.json();
      console.log("Saved data : ", data);
    } catch (err) {
      console.error("Error parsing JSON : ", err);
    }
  }
}

// front/src/views/p_homelogin.ts
function HomeLoginView() {
  return document.getElementById("homeloginhtml").innerHTML;
}
async function initHomePage() {
  try {
    const res = await genericFetch("/api/private/homelogin", {
      method: "POST",
      credentials: "include"
    });
    const result = await res.json();
    document.querySelector("#pseudo").textContent = result.pseudo;
  } catch (err) {
    console.error(err);
  }
}

// front/src/views/p_profil.ts
function ProfilView() {
  return document.getElementById("profilhtml").innerHTML;
}
async function initProfil() {
  const res = await genericFetch("/api/private/profil", {
    method: "POST",
    credentials: "include"
  });
  if (!res.ok) {
    console.error("Cannot load profile");
    return;
  }
  const profil = await res.json();
  document.getElementById("profil-id").textContent = profil.user_id;
  document.getElementById("profil-pseudo").textContent = profil.pseudo;
  document.getElementById("profil-email").textContent = profil.email;
  document.getElementById("profil-status").textContent = profil.status;
  document.getElementById("profil-creation").textContent = profil.creation_date;
  document.getElementById("profil-modification").textContent = profil.modification_date;
  document.getElementById("profil-money").textContent = profil.money;
  document.getElementById("profil-elo").textContent = profil.elo;
}

// front/src/views/p_updateinfo.ts
function UpdateInfoView() {
  return document.getElementById("updateinfohtml").innerHTML;
}
async function initUpdateInfo() {
  const res = await genericFetch("/api/private/updateinfo", {
    method: "POST"
  });
  if (!res.ok) {
    console.error("Cannot load profile");
    return;
  }
  const profil = await res.json();
  document.getElementById("profil-username").textContent = profil.pseudo;
  const formUsername = document.getElementById("change-username-form");
  formUsername.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = formUsername["new-username"].value;
    const password = formUsername["password"].value;
    const response = await genericFetch("/api/private/changeusername", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newUsername, password })
    });
    console.log("client initupdate: body", response.body);
    if (!response.ok)
      return alert("Error changing usename");
    alert("Username is updated successfully!");
    navigateTo("/homelogin");
  });
}

// front/src/views/p_tournament.ts
function TournamentView() {
  return document.getElementById("tournamenthtml").innerHTML;
}

// front/src/views/logout.ts
var initLogout = async () => {
  await fetch("/api/logout", {
    method: "GET",
    credentials: "include"
  });
  navigateTo("/login");
};

// front/src/router.ts
var routes = [
  { path: "/", view: HomeView },
  { path: "/login", view: LoginView, init: initLogin },
  { path: "/logout", init: initLogout },
  { path: "/dashboard", view: DashboardView },
  { path: "/register", view: RegisterView, init: initRegister },
  { path: "/homelogin", view: HomeLoginView, init: initHomePage },
  { path: "/game", view: GameView, init: initGame },
  { path: "/quickgame/:id", view: QuickGameView, init: initQuickGame },
  { path: "/profil", view: ProfilView, init: initProfil },
  { path: "/updateinfo", view: UpdateInfoView, init: initUpdateInfo },
  { path: "/tournament", view: TournamentView },
  { path: "/changeusername" }
];
function navigateTo(url) {
  history.pushState(null, "", url);
  router();
}
async function genericFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include"
  });
  if (res.status === 401) {
    navigateTo("/login");
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(`Error: ${res.status}`);
  }
  return res;
}
function matchRoute(pathname) {
  for (const r of routes) {
    if (r.path.includes(":")) {
      const base = r.path.split("/:")[0];
      if (pathname.startsWith(base + "/")) {
        const id = pathname.substring(base.length + 1);
        return { route: r, params: { id } };
      }
    }
    if (r.path === pathname) {
      return { route: r, params: {} };
    }
  }
  return null;
}
function router() {
  const match = matchRoute(location.pathname);
  if (!match) {
    document.querySelector("#app").innerHTML = "<h1>404 Not Found</h1>";
    return;
  }
  const { route, params } = match;
  if (route.view)
    document.querySelector("#app").innerHTML = route.view(params);
  route.init?.(params);
}
function initRouter() {
  document.body.addEventListener("click", (e) => {
    const target = e.target;
    const link = target.closest("[data-link]");
    if (link) {
      e.preventDefault();
      const url = link.getAttribute("href");
      if (url) {
        navigateTo(url);
      }
    }
  });
  window.addEventListener("popstate", router);
  router();
}

// front/src/main.ts
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
