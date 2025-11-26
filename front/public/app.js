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
  });
}
async function login(username, password) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });
    const result = await res.json();
    if (res.ok)
      return true;
    else {
      alert(result.error);
      return false;
    }
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
  const quickGameButton = document.getElementById("start-quickgame");
  quickGameButton?.addEventListener("click", async () => {
    const { gameId } = await genericFetch2("/api/private/game/create", {
      method: "POST"
    });
    navigateTo(`/quickgame/${gameId}`);
  });
  const tournamentButton = document.getElementById("start-tournament");
  tournamentButton?.addEventListener("click", async () => {
    const { tournamentId } = await genericFetch2("/api/private/tournament/create", {
      method: "POST"
    });
    navigateTo(`/tournament/${tournamentId}`);
  });
}
var GameInstance = class {
  constructor(gameID) {
    this.isPlaying = false;
    this.anim = 0;
    this.maxScore = 4;
    this.increaseSpeed = -1.1;
    this.maxAngle = Math.PI / 4;
    this.startTime = 0;
    this.elapsedTime = 0;
    // Game state
    this.game = {
      player1: {
        y: 0,
        movingUp: false,
        movingDown: false,
        speed: 5,
        score: 0,
        attraction: -2
      },
      player2: {
        y: 0,
        movingUp: false,
        movingDown: false,
        speed: 5,
        score: 0,
        attraction: 2
      },
      ball: {
        x: 0,
        y: 0,
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
    this.keydownHandler = (e) => this.onKeyDown(e);
    this.keyupHandler = (e) => this.onKeyUp(e);
    /** ============================================================
     ** GAME LOOP
     *============================================================ */
    this.play = () => {
      if (!this.isPlaying) {
        this.stopBtn.disabled = true;
        this.startBtn.disabled = true;
        this.stopTimer();
        this.displayWinner();
        return;
      }
      this.moveAll();
      this.draw();
      this.anim = requestAnimationFrame(this.play);
    };
    this.gameID = gameID;
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.startBtn = document.querySelector("#start-game");
    this.stopBtn = document.querySelector("#stop-game");
    this.initPositions();
    this.draw();
    this.attachEvents();
  }
  getId() {
    return this.gameID;
  }
  /** ============================================================
   ** INIT
   *============================================================ */
  initPositions() {
    this.game.player1.y = this.canvas.height / 2 - 30;
    this.game.player2.y = this.canvas.height / 2 - 30;
    this.game.ball.x = this.canvas.width / 2;
    this.game.ball.y = this.canvas.height / 2;
  }
  attachEvents() {
    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);
    this.startBtn.addEventListener("click", () => this.start());
    this.stopBtn.addEventListener("click", () => this.stop());
  }
  /** ============================================================
   ** START / STOP
   *============================================================ */
  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;
    this.audioCtx = new AudioContext();
    this.randomizeBall();
    this.resetGame();
    this.startTimer();
    this.play();
  }
  stop() {
    this.isPlaying = false;
    cancelAnimationFrame(this.anim);
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.resetGame();
  }
  destroy() {
    this.stop();
    cancelAnimationFrame(this.anim);
    document.removeEventListener("keydown", this.keydownHandler);
    document.removeEventListener("keyup", this.keyupHandler);
    console.log("Game destroyed and listeners removed");
  }
  /** ============================================================
   ** TIMER
   *============================================================ */
  startTimer() {
    this.startTime = Date.now();
  }
  stopTimer() {
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1e3);
  }
  /** ============================================================
   ** CONTROLS
   *============================================================ */
  onKeyDown(e) {
    if (e.key === "w" || e.key === "W") this.game.player1.movingUp = true;
    if (e.key === "s" || e.key === "S") this.game.player1.movingDown = true;
    if (e.key === "o" || e.key === "O") this.game.player2.movingUp = true;
    if (e.key === "l" || e.key === "L") this.game.player2.movingDown = true;
  }
  onKeyUp(e) {
    if (e.key === "w" || e.key === "W") this.game.player1.movingUp = false;
    if (e.key === "s" || e.key === "S") this.game.player1.movingDown = false;
    if (e.key === "o" || e.key === "O") this.game.player2.movingUp = false;
    if (e.key === "l" || e.key === "L") this.game.player2.movingDown = false;
  }
  /** ============================================================
   ** GAME LOGIC
   *============================================================ */
  moveAll() {
    this.movePlayer(this.game.player1);
    this.movePlayer(this.game.player2);
    this.moveBall();
  }
  movePlayer(player) {
    if (player.movingUp && player.y > 0) player.y -= player.speed;
    if (player.movingDown && player.y + 60 < this.canvas.height) player.y += player.speed;
  }
  moveBall() {
    const ball = this.game.ball;
    if (ball.y > this.canvas.height || ball.y < 0) {
      this.playSound(500, 60);
      ball.speed.y *= -1;
    }
    if (ball.x > this.canvas.width - 5)
      this.collide(this.game.player2, this.game.player1);
    else if (ball.x < 5)
      this.collide(this.game.player1, this.game.player2);
    ball.x += ball.speed.x;
    ball.y += ball.speed.y;
  }
  collide(player, otherPlayer) {
    const ball = this.game.ball;
    if (ball.y < player.y || ball.y > player.y + 60) {
      this.playSound(300, 300);
      this.resetPos();
      otherPlayer.score++;
      ball.speed.x = player.attraction;
      if (otherPlayer.score === this.maxScore) this.isPlaying = false;
    } else {
      this.playSound(700, 80);
      this.modifyBallAngle(player);
      this.increaseBallSpeed();
    }
  }
  /** ============================================================
   ** UTILS FUNCTIONS
   *============================================================ */
  randomizeBall() {
    this.game.ball.speed.x = Math.random() < 0.5 ? -2 : 2;
  }
  resetPos() {
    this.game.player1.y = this.canvas.height / 2 - 30;
    this.game.player2.y = this.canvas.height / 2 - 30;
    this.game.ball.x = this.canvas.width / 2;
    this.game.ball.y = this.canvas.height / 2;
    const b = this.game.ball;
    b.speed.y = Math.random() * (b.speed.maxY - b.speed.minY) + b.speed.minY;
  }
  resetGame() {
    this.resetPos();
    this.game.player1.score = 0;
    this.game.player2.score = 0;
    this.draw();
  }
  increaseBallSpeed() {
    const b = this.game.ball;
    const sign = b.speed.x * this.increaseSpeed < 0 ? -1 : 1;
    if (Math.abs(b.speed.x * this.increaseSpeed) > b.speed.maxX)
      b.speed.x = b.speed.maxX * sign;
    else
      b.speed.x *= this.increaseSpeed;
  }
  modifyBallAngle(player) {
    const paddleCenter = player.y + 30;
    let hitPos = this.game.ball.y - paddleCenter;
    const normalized = hitPos / 30;
    const bounceAngle = normalized * this.maxAngle;
    const speed = Math.sqrt(
      this.game.ball.speed.x ** 2 + this.game.ball.speed.y ** 2
    );
    this.game.ball.speed.y = speed * Math.sin(bounceAngle);
  }
  playSound(freq, duration) {
    const o = this.audioCtx.createOscillator();
    const g = this.audioCtx.createGain();
    o.connect(g);
    g.connect(this.audioCtx.destination);
    o.type = "square";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
    o.start();
    o.stop(this.audioCtx.currentTime + duration / 1e3);
  }
  /** ============================================================
   ** DRAW
   *============================================================ */
  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(this.canvas.width / 2, 0);
    ctx.lineTo(this.canvas.width / 2, this.canvas.height);
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fillRect(0, this.game.player1.y, 10, 60);
    ctx.fillRect(
      this.canvas.width - 10,
      this.game.player2.y,
      10,
      60
    );
    ctx.beginPath();
    ctx.arc(this.game.ball.x, this.game.ball.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = "40px Verdana";
    ctx.textAlign = "center";
    ctx.fillText(`${this.game.player1.score}`, this.canvas.width * 0.43, 50);
    ctx.fillText(`${this.game.player2.score}`, this.canvas.width * 0.57, 50);
  }
  /** ============================================================
   ** ENDGAME
   *============================================================ */
  displayWinner() {
    const ctx = this.ctx;
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.textAlign = "center";
    let winnerId, loserId, winnerText;
    if (this.game.player1.score > this.game.player2.score) {
      winnerText = "Player 1 Wins!";
      winnerId = 1;
      loserId = 2;
    } else {
      winnerText = "Player 2 Wins!";
      winnerId = 2;
      loserId = 1;
    }
    ctx.fillText(winnerText, this.canvas.width / 2, this.canvas.height / 2);
    this.sendGameResult(
      winnerId,
      loserId,
      this.game.player1.score,
      this.game.player2.score,
      this.elapsedTime,
      this.gameID
    );
  }
  /** ============================================================
   ** API
   *============================================================ */
  async sendGameResult(winnerId, loserId, winnerScore, loserScore, duration, id) {
    try {
      const res = await genericFetch2("/api/private/game/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winner_id: winnerId,
          loser_id: loserId,
          winner_score: winnerScore,
          loser_score: loserScore,
          duration_game: duration,
          id
        })
      });
      console.log("Saved data:", res);
    } catch (err) {
      console.error("Error saving game:", err);
    }
  }
};

// front/src/views/p_quickgame.ts
var currentGame = null;
function QuickGameView(params) {
  return document.getElementById("quickgamehtml").innerHTML;
}
function initQuickGame(params) {
  const gameID = params?.id;
  if (currentGame) {
    currentGame.destroy();
    currentGame = null;
  }
  currentGame = new GameInstance(gameID);
}
async function stopGame() {
  if (currentGame) {
    const id = currentGame.getId();
    console.log("id qg : ", id);
    currentGame.destroy();
    currentGame = null;
    try {
      const res = await genericFetch2("/api/private/game/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id
        })
      });
      console.log("Saved data:", res);
    } catch (err) {
      console.error("Error saving game:", err);
    }
  }
}

// front/src/views/p_homelogin.ts
function HomeLoginView() {
  return document.getElementById("homeloginhtml").innerHTML;
}
async function initHomePage() {
  try {
    const result = await genericFetch2("/api/private/homelogin", {
      method: "POST",
      credentials: "include"
    });
    document.querySelector("#pseudo").textContent = result.pseudo;
  } catch (err) {
  }
}

// front/src/views/p_profil.ts
function ProfilView() {
  return document.getElementById("profilhtml").innerHTML;
}
async function initProfil() {
  const res = await genericFetch2("/api/private/profil", {
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
  const res = await genericFetch2("/api/private/updateinfo", {
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
    const response = await genericFetch2("/api/private/changeusername", {
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
  const html = document.getElementById("tournamenthtml").innerHTML;
  setTimeout(() => initTournamentPage(), 0);
  return html;
}
function generateRandomRanking() {
  const ranking = [];
  while (ranking.length < 8) {
    const randomId = Math.floor(Math.random() * 16) + 1;
    if (!ranking.includes(randomId)) {
      ranking.push(randomId);
    }
  }
  return ranking;
}
function initTournamentPage() {
  const createBtn = document.getElementById("create-test");
  const showBtn = document.getElementById("show-onchain");
  const backBtn = document.getElementById("back-to-home");
  createBtn?.addEventListener("click", async () => {
    await testTournamentDB();
  });
  showBtn?.addEventListener("click", async () => {
    await showDBOnChain();
  });
  backBtn?.addEventListener("click", () => {
    navigateTo("/homelogin");
  });
}
async function testTournamentDB() {
  const testRanking = generateRandomRanking();
  try {
    const res = await fetch("/api/private/tournament/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ranking: testRanking })
    });
    const data = await res.json();
    const dbPanel = document.getElementById("db-panel");
    if (dbPanel) {
      dbPanel.innerHTML = `
        <div class="p-2 border-b">
          <p class="text-green-700 font-bold">\u2705 Tournament Created!</p>
          <p><strong>Ranking:</strong> ${testRanking.join(", ")}</p>
          <p class="text-gray-600 text-sm">(Now stored in database)</p>
        </div>
      `;
    }
    console.log("Tournament response:", data);
  } catch (err) {
    console.error("Error creating tournament:", err);
  }
}
async function showDBOnChain() {
  try {
    const res = await fetch("/api/private/tournament/all");
    const data = await res.json();
    const dbPanel = document.getElementById("db-panel");
    const chainPanel = document.getElementById("chain-panel");
    if (!dbPanel || !chainPanel) return;
    dbPanel.innerHTML = data.map((t) => `
      <div class="p-2 border-b">
        <p><strong>ID:</strong> ${t.tournamentId}</p>
        <p><strong>Ranking:</strong> ${t.ranking.join(", ")}</p>
        <p><strong>On Chain:</strong>
          <span class="${t.onChain ? "text-green-600" : "text-red-600"}">
            ${t.onChain ? "\u2705 YES" : "\u274C NO"}
          </span>
        </p>
      </div>
    `).join("");
    chainPanel.innerHTML = data.map((t) => `
      <div class="p-2 border-b">
        <p><strong>ID:</strong> ${t.tournamentId}</p>
        ${t.onChain ? `<p><strong>Blockchain Ranking:</strong> ${t.blockchainRanking.join(", ")}</p>` : `<p class="text-red-600"><strong>Not On Chain \u274C</strong></p>`}
      </div>
    `).join("");
  } catch (err) {
    console.error("Error loading DB/Blockchain comparison:", err);
  }
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
  { path: "/quickgame/:id", view: QuickGameView, init: initQuickGame, cleanup: stopGame },
  { path: "/profil", view: ProfilView, init: initProfil },
  { path: "/updateinfo", view: UpdateInfoView, init: initUpdateInfo },
  { path: "/tournament", view: TournamentView },
  { path: "/changeusername" }
];
var currentRoute = null;
function navigateTo(url) {
  const state = { previous: window.location.pathname };
  history.pushState(state, "", url);
  router();
}
async function genericFetch2(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    credentials: "include"
  });
  const result = await res.json();
  if (res.status === 401) {
    if (result.error === "TokenExpiredError")
      alert("Session expired, please login");
    navigateTo("/logout");
    throw new Error(result.error);
  }
  if (!res.ok) {
    throw new Error(result.error);
  }
  return result;
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
  if (currentRoute?.cleanup) {
    if (typeof currentRoute.cleanup === "function")
      currentRoute.cleanup();
  }
  const match = matchRoute(location.pathname);
  if (!match) {
    document.querySelector("#app").innerHTML = "<h1>404 Not Found</h1>";
    return;
  }
  const { route, params } = match;
  if (route.view)
    document.querySelector("#app").innerHTML = route.view(params);
  route.init?.(params);
  currentRoute = route;
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
  window.addEventListener("popstate", (event) => {
    const path = window.location.pathname;
    const previous = event.state?.previous;
    const public_path = ["/", "/login", "/register"];
    const is_private = !public_path.includes(path);
    if (is_private && previous && public_path.includes(previous))
      history.replaceState({ previous: "/homelogin" }, "", "/homelogin");
    router();
  });
  router();
}

// front/src/main.ts
document.addEventListener("DOMContentLoaded", () => {
  initRouter();
});
