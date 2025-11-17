// front/src/game/game.ts
var isPlaying;
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var canvasHeight = canvas.height;
var canvasWidth = canvas.width;
var audioCtx;
var paddleHeight = 60;
var paddleWidth = 10;
var paddleCenter;
var game = {
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
var scoreMax = 4;
var winner;
var winnerId;
var loserId;
var anim;
var randomValue;
var increaseSpeed = -1.1;
var maxAngle = Math.PI / 4;
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
    sendGameResult(winnerId, loserId, game.player1.score, game.player2.score);
  } else {
    winner = "Player 2 Wins!";
    winnerId = 2;
    loserId = 1;
    sendGameResult(winnerId, loserId, game.player2.score, game.player1.score);
  }
  ctx.fillText(winner, canvasWidth / 2, canvasHeight / 2);
}
function play() {
  if (!isPlaying) {
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
  play();
});
document.querySelector("#stop-game")?.addEventListener("click", () => {
  isPlaying = false;
  stop();
});
async function sendGameResult(winnerId2, loserId2, winnerScore, loserScore) {
  const res = await fetch("/api/game/end", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      winner_id: winnerId2,
      loser_id: loserId2,
      winner_score: winnerScore,
      loser_score: loserScore
    })
  });
  try {
    const data = await res.json();
    console.log("Saved data : ", data);
  } catch (err) {
    console.error("Error parsing JSON : ", err);
  }
}
