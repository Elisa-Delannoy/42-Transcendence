let isPlaying: boolean;

/**========================================================================
 *!                                  INTERFACES
 *========================================================================**/

interface Player {
	y: number;
	movingUp: boolean;
	movingDown: boolean;
	speed: number;
	score: number;
	attraction: number;
}

interface Ball {
	x: number;
	y: number;
	r: number;
	speed: {
		maxX: number,
		maxY: number,
		minY: number,
		x: number;
		y: number;
	}
}

interface Game {
	player1: Player;
	player2: Player;
	ball: Ball;
}

/**========================================================================
 *!                                  VARIABLES
 *========================================================================**/

//Canvas
const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const canvasHeight = canvas.height;
const canvasWidth = canvas.width;

//Sound
let audioCtx: AudioContext;

//Paddles
const paddleHeight = 60;
const paddleWidth = 10;
let paddleCenter: number;

//game
const game: Game = {

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

//others
let scoreMax: number = 11;
let winner: string;
let anim: number;
let randomValue: number;
let increaseSpeed: number = -1.1;
const maxAngle: number = Math.PI / 4;

/**========================================================================
 *!                                  FUNCTIONS
 *========================================================================**/

function playSound(frequency: number, duration: number) {
	const oscillator = audioCtx.createOscillator();
	const gainNode = audioCtx.createGain();

	oscillator.connect(gainNode);
	gainNode.connect(audioCtx.destination);

	oscillator.type = "square";
	oscillator.frequency.value = frequency;

	gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
	oscillator.start();
	oscillator.stop(audioCtx.currentTime + duration / 1000);
}

function draw() {
	//field
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvasWidth, canvasHeight);

	//middle line
	ctx.strokeStyle = 'white';
	ctx.beginPath();
	ctx.moveTo(canvas.width / 2, 0);
	ctx.lineTo(canvas.width / 2, canvas.height);
	ctx.stroke();

	//players
	ctx.fillStyle = 'white';
	ctx.fillRect(0, game.player1.y, paddleWidth, paddleHeight);
	ctx.fillRect(canvas.width - paddleWidth, game.player2.y, paddleWidth, paddleHeight);

	//ball
	ctx.beginPath();
	ctx.fillStyle = 'white';
	ctx.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2, false);
	ctx.fill();

	//score
	ctx.fillStyle = 'white';
	ctx.font = "40px Verdana";
	ctx.textAlign = "center";
	ctx.fillText(`${game.player1.score}`, (canvasWidth / 4) * 1.75, 50);
	ctx.fillText(`${game.player2.score}`, (canvasWidth / 4) * 2.25, 50);
}

function movePlayer(player: Player) {
	if (player.movingUp && player.y > 0)
		player.y -= player.speed;

	if (player.movingDown && player.y + paddleHeight < canvasHeight)
		player.y += player.speed;
}

function moveBall() {
	//rebounds on top and bottom
	if (game.ball.y > canvas.height || game.ball.y < 0)
	{
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
	let sign: number;

	if ((game.ball.speed.x * increaseSpeed) < 0)
		sign = -1;
	else
		sign = 1;

	//check if ball is faster than maxSpeed 
	if (Math.abs(game.ball.speed.x * increaseSpeed) > game.ball.speed.maxX)
		game.ball.speed.x = game.ball.speed.maxX * sign;
	else
		game.ball.speed.x *= increaseSpeed;

	console.log(game.ball.speed.x);
}

function modifyBallAngle(player: Player) {
	paddleCenter = player.y + paddleHeight / 2;
	let hitPos = game.ball.y - paddleCenter;

	// -1 on top, +1 on bottom
	let normalized = hitPos / (paddleHeight / 2);

	// calculate new angle
	let bounceAngle = normalized * maxAngle;

	// add speed with angle
	let speed = Math.sqrt(game.ball.speed.x ** 2 + game.ball.speed.y ** 2);
	game.ball.speed.y = speed * Math.sin(bounceAngle);
}

function collide(player: Player, otherPlayer: Player) {
	//player missed the ball
	if (game.ball.y < player.y || game.ball.y > player.y + paddleHeight)
	{
		playSound(300, 300);
		resetPos();
		otherPlayer.score++;
		//send ball to loser
		game.ball.speed.x = player.attraction;
		//stop game if max score is reached
		if (otherPlayer.score == scoreMax)
			isPlaying = false;
	}
	//player touched the ball
	else
	{
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

	winner = game.player1.score > game.player2.score ? "Player 1 Wins!" : "Player 2 Wins!";
	ctx.fillText(winner, canvasWidth / 2, canvasHeight / 2);
}

function play() {
	if (!isPlaying)
	{
		displayWinner();
		return;
	}
	moveAll();
	draw();
	anim = requestAnimationFrame(play);
}

draw();

/**========================================================================
 *!                                  EVENTS
 *========================================================================**/

document.addEventListener("keydown", (e) => {
	if (e.key === "w" || e.key === "W") game.player1.movingUp = true;
	if (e.key === "s" || e.key === "S") game.player1.movingDown = true;
	if (e.key === "o" || e.key === "O") game.player2.movingUp = true;
	if (e.key === "l" || e.key === "L") game.player2.movingDown = true;
})

document.addEventListener("keyup", (e) => {
	if (e.key === "w" || e.key === "W") game.player1.movingUp = false;
	if (e.key === "s" || e.key === "S") game.player1.movingDown = false;
	if (e.key === "o" || e.key === "O") game.player2.movingUp = false;
	if (e.key === "l" || e.key === "L") game.player2.movingDown = false;
})

document.querySelector('#start-game')?.addEventListener('click', () => {
	audioCtx = new(window.AudioContext);
	randomValue = Math.random() < 0.5 ? -2 : 2;
	game.ball.speed.x = randomValue;
	resetGame();
	isPlaying = true;
	play();
});

document.querySelector('#stop-game')?.addEventListener('click', () => {
	isPlaying = false;
	stop();
});