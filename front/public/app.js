var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// front/src/views/home.ts
function HomeView() {
  return document.getElementById("homehtml").innerHTML;
}
async function initHome() {
  const res = await fetch("/api/checkLogin", { method: "GET", credentials: "include" });
  console.log(res.ok);
  if (res.ok) {
    navigateTo("/homelogin");
  }
}
var init_home = __esm({
  "front/src/views/home.ts"() {
    "use strict";
    init_router();
  }
});

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
    const success = await login(username, password, form);
    if (success)
      navigateTo("/homelogin");
  });
}
async function login(username, password, form) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });
    const result = await res.json();
    const usernameInput = form.querySelector("input[name='username']");
    const passwordInput = form.querySelector("input[name='password']");
    const usernameMsg = document.getElementById("username-loginmsg");
    const passwordMsg = document.getElementById("password-loginmsg");
    [usernameMsg, passwordMsg].forEach((p) => p.textContent = "");
    [usernameInput, passwordInput].forEach((p) => p.classList.remove("error"));
    if (res.ok == true)
      return true;
    else {
      if (result.field === "password") {
        console.log("test1");
        passwordInput.classList.add("error");
        passwordMsg.textContent = result.error;
      }
      if (result.field === "username") {
        usernameInput.classList.add("error");
        usernameMsg.textContent = result.error;
      }
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
}
var init_login = __esm({
  "front/src/views/login.ts"() {
    "use strict";
    init_router();
  }
});

// front/src/views/dashboard.ts
function DashboardView() {
  return document.getElementById("dashboardhtml").innerHTML;
}
var init_dashboard = __esm({
  "front/src/views/dashboard.ts"() {
    "use strict";
  }
});

// front/src/views/register.ts
function RegisterView() {
  return document.getElementById("registerhtml").innerHTML;
}
function initRegister() {
  const form = document.getElementById("register-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirm: formData.get("confirm-password")
    };
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.ok == true)
        navigateTo("/registerok");
      else {
        const usernameInput = form.querySelector("input[name='username']");
        const passwordInput = form.querySelector("input[name='password']");
        const emailInput = form.querySelector("input[name='email']");
        const confirmInput = form.querySelector("input[name='confirm-password']");
        const usernameMsg = document.getElementById("username-message");
        const emailMsg = document.getElementById("email-message");
        const passwordMsg = document.getElementById("password-message");
        const confirmMsg = document.getElementById("confirm-password-message");
        [usernameMsg, emailMsg, passwordMsg, confirmMsg].forEach((p) => p.textContent = "");
        [usernameInput, emailInput, passwordInput, confirmInput].forEach((p) => p.classList.remove("error"));
        if (result.field === "confirm") {
          confirmInput.classList.add("error");
          confirmMsg.textContent = result.message;
        }
        if (result.field === "password") {
          passwordInput.classList.add("error");
          passwordMsg.textContent = result.message;
        }
        if (result.field === "username") {
          usernameInput.classList.add("error");
          usernameMsg.textContent = result.message;
        }
        if (result.field === "email") {
          emailInput.classList.add("error");
          emailMsg.textContent = result.message;
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
}
function RegisterValidView() {
  return document.getElementById("registerok").innerHTML;
}
var init_register = __esm({
  "front/src/views/register.ts"() {
    "use strict";
    init_router();
  }
});

// front/src/views/p_game.ts
function GameView() {
  return document.getElementById("gamehtml").innerHTML;
}
function initGame() {
  const createGameButton = document.getElementById("create-game");
  createGameButton?.addEventListener("click", async () => {
    await genericFetch2("/api/private/game/create", {
      method: "POST"
    });
  });
  const gameListButton = document.getElementById("display-game-list");
  gameListButton?.addEventListener("click", async () => {
    loadGames();
  });
  const tournamentButton = document.getElementById("start-tournament");
  tournamentButton?.addEventListener("click", async () => {
    const { tournamentId } = await genericFetch2("/api/private/tournament/create", {
      method: "POST"
    });
    navigateTo(`/tournament/${tournamentId}`);
  });
}
async function loadGames() {
  const { games } = await genericFetch2("/api/private/game/list");
  renderGameList(games);
}
function renderGameList(games) {
  const container = document.getElementById("game-list");
  if (!container) return;
  if (games.length === 0) {
    container.innerHTML = "<p>Aucune partie disponible.</p>";
    return;
  }
  container.innerHTML = games.map((game) => `
	<div class="game-item">
		<p>Game #${game.id}</p>
		<p>Player1 : ${game.playerId1}</p>
		<p>Player2 : ${game.playerId2}</p>
		<p>Status : ${game.state}</p>
		<button data-game-id="${game.id}" class="join-game-btn">Rejoindre</button>
	</div>
	`).join("");
  document.querySelectorAll(".join-game-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.gameId;
      try {
        const res = await genericFetch2("/api/private/game/join", {
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
      navigateTo(`/quickgame/${id}`);
    });
  });
}
var GameInstance;
var init_p_game = __esm({
  "front/src/views/p_game.ts"() {
    "use strict";
    init_router();
    GameInstance = class {
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
      async start() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        try {
          const res = await genericFetch2("/api/private/game/update/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.gameID,
              status: "playing"
            })
          });
          console.log("Saved data:", res);
        } catch (err) {
          console.error("Error saving game:", err);
        }
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
  }
});

// front/src/views/p_quickgame.ts
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
    currentGame.destroy();
    currentGame = null;
    try {
      const res = await genericFetch2("/api/private/game/update/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: "error"
        })
      });
      console.log("Saved data:", res);
    } catch (err) {
      console.error("Error saving game:", err);
    }
  }
}
var currentGame;
var init_p_quickgame = __esm({
  "front/src/views/p_quickgame.ts"() {
    "use strict";
    init_p_game();
    init_router();
    currentGame = null;
  }
});

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
    console.error(err);
  }
}
var init_p_homelogin = __esm({
  "front/src/views/p_homelogin.ts"() {
    "use strict";
    init_router();
  }
});

// front/src/views/p_profile.ts
function ProfileView() {
  return document.getElementById("profilehtml").innerHTML;
}
async function initProfile() {
  const profile = await genericFetch2("/api/private/profile", {
    method: "POST"
  });
  let status = "online";
  if (profile.status === 0)
    status = "offline";
  document.getElementById("profile-id").textContent = profile.user_id;
  document.getElementById("profile-pseudo").textContent = profile.pseudo;
  document.getElementById("profile-email").textContent = profile.email;
  document.getElementById("profile-status").textContent = status;
  document.getElementById("profile-creation").textContent = profile.creation_date;
  document.getElementById("profile-modification").textContent = profile.modification_date;
  document.getElementById("profile-money").textContent = profile.money;
  document.getElementById("profile-elo").textContent = profile.elo;
}
var init_p_profile = __esm({
  "front/src/views/p_profile.ts"() {
    "use strict";
    init_router();
  }
});

// front/src/views/p_updateinfo.ts
function UpdateInfoView() {
  return document.getElementById("updateinfohtml").innerHTML;
}
async function initUpdateInfo() {
  const profil = await genericFetch2("/api/private/updateinfo", {
    method: "POST"
  });
  document.getElementById("profile-username").textContent = profil.pseudo;
  await initUpdateUsername();
  await initUpdateEmail();
  await initUpdatePassword();
  await initAvatar();
}
async function initUpdateUsername() {
  const formUsername = document.getElementById("change-username-form");
  formUsername.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = formUsername["new-username"].value;
    const password = formUsername["password"].value;
    try {
      const response = await genericFetch2("/api/private/updateinfo/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername, password })
      });
      alert("Username updated successfully to <<  " + response.pseudo + "  >>");
      navigateTo("/homelogin");
    } catch (err) {
      alert(err.message);
    }
  });
}
async function initUpdateEmail() {
  const formEmail = document.getElementById("change-email-form");
  formEmail.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newEmail = formEmail["new-email"].value;
    const password = formEmail["password"].value;
    try {
      const response = await genericFetch2("/api/private/updateinfo/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password })
      });
      alert("Username updated successfully to <<  " + response.email + "  >>");
      navigateTo("/homelogin");
    } catch (err) {
      alert(err.message);
    }
  });
}
async function initUpdatePassword() {
  const formPassword = document.getElementById("change-password-form");
  formPassword.addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldPw = formPassword["old-password"].value;
    const newPw = formPassword["new-password"].value;
    const confirm = formPassword["confirm-new-password"].value;
    try {
      const response = await genericFetch2("/api/private/updateinfo/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPw, newPw, confirm })
      });
      alert("Password is updated successfully! Please re-log in!");
      navigateTo("/logout");
    } catch (err) {
      alert(err.message);
    }
  });
}
async function initAvatar() {
  const formAvatar = document.getElementById("upload_avatar");
  if (formAvatar instanceof HTMLFormElement) {
    formAvatar.addEventListener("submit", async (e) => {
      e.preventDefault();
      const avatarInput = formAvatar.querySelector('input[name="avatar"]');
      const avatarFile = avatarInput?.files?.[0];
      if (!avatarFile || avatarFile.size === 0 || !avatarFile.name) {
        alert("Please upload an avatar");
        return;
      }
      await uploadAvatar(avatarFile);
    });
  }
}
async function uploadAvatar(avatar) {
  const form = new FormData();
  form.append("avatar", avatar);
  try {
    const result = await genericFetch2("/api/private/updateinfo/uploads", {
      method: "POST",
      body: form,
      credentials: "include"
    });
    console.log("uplaod success ok : ", result);
    navigateTo("/profile");
  } catch (err) {
    console.error(err);
  }
}
var init_p_updateinfo = __esm({
  "front/src/views/p_updateinfo.ts"() {
    "use strict";
    init_router();
  }
});

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
    const data = await genericFetch2("/api/private/tournament/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ranking: testRanking })
    });
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
    const data = await genericFetch2("/api/private/tournament/all");
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
var init_p_tournament = __esm({
  "front/src/views/p_tournament.ts"() {
    "use strict";
    init_router();
  }
});

// front/src/views/logout.ts
var initLogout;
var init_logout = __esm({
  "front/src/views/logout.ts"() {
    "use strict";
    init_router();
    initLogout = async () => {
      await fetch("/api/logout", {
        method: "GET",
        credentials: "include"
      });
      navigateTo("/login");
    };
  }
});

// front/src/router.ts
function navigateTo(url) {
  const state = { previous: window.location.pathname };
  history.pushState(state, "", url);
  router();
  const avatar = document.getElementById("profile-avatar");
  if (avatar)
    avatar.src = "/api/private/avatar?ts=" + Date.now();
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
    throw new Error(result.error || result.message || "Unknown error");
  }
  if (!res.ok) {
    throw new Error(result.error || result.message || "Unknown error");
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
var routes, currentRoute;
var init_router = __esm({
  "front/src/router.ts"() {
    "use strict";
    init_home();
    init_login();
    init_dashboard();
    init_register();
    init_p_game();
    init_p_quickgame();
    init_p_homelogin();
    init_p_profile();
    init_p_updateinfo();
    init_p_tournament();
    init_logout();
    routes = [
      { path: "/", view: HomeView, init: initHome },
      { path: "/login", view: LoginView, init: initLogin },
      { path: "/logout", init: initLogout },
      { path: "/dashboard", view: DashboardView },
      { path: "/register", view: RegisterView, init: initRegister },
      { path: "/registerok", view: RegisterValidView },
      { path: "/homelogin", view: HomeLoginView, init: initHomePage },
      { path: "/game", view: GameView, init: initGame },
      { path: "/quickgame/:id", view: QuickGameView, init: initQuickGame, cleanup: stopGame },
      { path: "/profile", view: ProfileView, init: initProfile },
      { path: "/updateinfo", view: UpdateInfoView, init: initUpdateInfo },
      { path: "/tournament", view: TournamentView }
    ];
    currentRoute = null;
  }
});

// front/src/main.ts
var require_main = __commonJS({
  "front/src/main.ts"() {
    init_router();
    document.addEventListener("DOMContentLoaded", () => {
      initRouter();
    });
  }
});
export default require_main();
