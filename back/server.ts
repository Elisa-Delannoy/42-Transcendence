import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/register";
import { GameInfo } from "./DB/gameinfo";
import fastifyCookie from "@fastify/cookie";
import { tokenOK } from "./middleware/jwt";
import { CookieSerializeOptions } from "fastify-cookie";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import bcrypt from "bcryptjs";
import { games_map, createGame, joinGame, getPlayersId, endGame, updateGamePos, updateGameStatus, displayGameList, Game } from "./routes/game/game";
import fs from "fs";
import { Tournament } from './DB/tournament';
import { uploadPendingTournaments } from "./routes/tournament/tournament.service";
import * as avalancheService from "./blockchain/avalanche.service";
import { Server } from "socket.io";
import multipart from "@fastify/multipart"
import FastifyHttpsAlwaysPlugin, { HttpsAlwaysOptions } from "fastify-https-always";
import * as tournamentService from "./routes/tournament/tournament.service";
import { getProfile, displayAvatar } from "./routes/profile/profile";
import { getUpdateInfo, getUpdateUsername, getUpdateEmail, getUploadAvatar, getUpdatePassword, getUpdateStatus } from "./routes/profile/getUpdate";
import { logout } from "./routes/logout/logout";
import { request } from "http";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const gameInfo = new GameInfo(db);
export const tournament = new Tournament(db);


const fastify = Fastify({
	logger: false,
	https:
	{
		key: fs.readFileSync("server.key"),
		cert: fs.readFileSync("server.cert"),
	},
	trustProxy: true
});

const httpsAlwaysOpts: HttpsAlwaysOptions = {
  productionOnly: false,
  redirect:       false,
  httpsPort:      8443
}

fastify.register(fastifyStatic, {
  root: join(process.cwd(), "front"),
  prefix: "/",
});

fastify.register(fastifyCookie, {
  parseOptions: {}
})

fastify.register(FastifyHttpsAlwaysPlugin, httpsAlwaysOpts)

fastify.register(multipart, {
	limits:{
		fileSize: 2 * 1024 * 1024,
		files: 1,
	}
})

fastify.addHook("onRequest", async(request: FastifyRequest, reply: FastifyReply) => {
	if (request.url.startsWith("/api/private")) {
		const user = await tokenOK(request, reply);
		if (user !== null)
			request.user = user;
	}
})

// fastify.get("/api/isLoggedIn", async (request: FastifyRequest, reply: FastifyReply) => {
// 	const user = await tokenOK(request, reply);
// 	if (user !== null)
// 		return { logged: true };
// 	return { logged: false };
// })

// fastify.get("/", async (request, reply) => {
//   return reply.sendFile("index.html");
// });

fastify.get("/api/checkLogin", async (request, reply) => {
	return tokenOK(request, reply);
});

fastify.post("/api/register", async (request, reply) => {
  const { username, email, password, confirm } = request.body as { username: string, password: string, email: string, confirm: string};
  await manageRegister(username, email, password, confirm, reply);
});

fastify.post("/api/login", async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, password } = request.body as { username: string, password: string};
  await manageLogin(username, password, reply);
});

fastify.post("/api/private/getpseudo", async (request: FastifyRequest, reply: FastifyReply) => {
	return { pseudo: request.user?.pseudo }
});

fastify.post("/api/private/profile", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getProfile(fastify, request, reply);
});

fastify.post("/api/private/updateinfo/status", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateStatus(request, reply);
});

fastify.post("/api/private/updateinfo", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateInfo(fastify, request, reply);
});

fastify.post("/api/private/updateinfo/username", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateUsername(fastify, request, reply);
})

fastify.post("/api/private/updateinfo/email", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateEmail(fastify, request, reply);
})

fastify.post("/api/private/updateinfo/password", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdatePassword(fastify, request, reply);
})

fastify.post("/api/private/updateinfo/uploads", async (request, reply) => {
	return await getUploadAvatar(request, reply);
});

fastify.get("/api/private/avatar", async (request: FastifyRequest, reply: FastifyReply) => {
	return await displayAvatar(request, reply);
});

fastify.post("/api/private/game/create", async (request, reply) => {
	const playerId = request.user?.user_id as any;
	const gameId = createGame(playerId);
	reply.send({ gameId });
});

fastify.post("/api/private/game/join", async (request, reply) => {
	const { gameId } = request.body as any;
	const playerId = request.user?.user_id as any;
	const id = Number(gameId);
	joinGame(playerId, id);
	reply.send({ message: "Player joined game" });
});

fastify.post("/api/private/game/start", async (request, reply) => {
	const { gameId } = request.body as any;

	const playersId = getPlayersId(gameId);
	return { playersId };
});


fastify.get("/api/private/game/list", async (request, reply) => {
	const list = await displayGameList();
	return { games: list };
})

fastify.post("/api/private/game/update/pos", async (request, reply) => {
	const { gameId, ballPos, paddlePos } = request.body as any;
	updateGamePos(gameId, ballPos, paddlePos );
	return { ok: true };
});

fastify.post("/api/private/game/update/status", async (request, reply) => {
	const { id, status } = request.body as any;
	const gameid = Number(id);
	updateGameStatus(gameid, status);
	return { message: "Game status updated!" };
});

fastify.post("/api/private/game/end", async (request, reply) => {
	const { winner_id, loser_id, winner_score, loser_score, duration_game, id } = request.body as any;

	await endGame(winner_id, loser_id, winner_score, loser_score, duration_game, id, gameInfo);
	return { message: "Game saved!" };
});


fastify.post("/api/private/tournament/add", (req, reply) => {
	return tournamentService.updateTournament(req, reply);
	});
	  
fastify.get("/api/private/tournament/all", (req, reply) => {
	return tournamentService.getAllTournamentsDetailed(req, reply);
});

fastify.get("/api/logout", async (request, reply) => {
	return await logout(request, reply);
})

function setupSocket(io: Server) {
	io.on("connection", (socket) => {
	console.log("Client connecté", socket.id);

	socket.on("joinGame", (gameId: string) => {

		const game = games_map.get(Number(gameId));
		if (!game) return;


		socket.join(`game-${gameId}`);

		// --- INITIALISATION POUR SOCKET.IO ---
		if (!game.sockets) {
			game.sockets = {
				player1: null,
				player2: null
			};
		}

		// Assignation automatique
		let role: "player1" | "player2";

		if (game.sockets.player1 === null) {
			game.sockets.player1 = socket.id;
			role = "player1";
			console.log("Player1 connected !");
		} 
		else if (game.sockets.player2 === null && game.sockets.player1 !== socket.id) {
			game.sockets.player2 = socket.id;
			role = "player2";
			console.log("Player2 connected !");
		}
		else if (game.sockets.player1 === socket.id || game.sockets.player2 === socket.id) {
			// Le joueur est déjà assigné, rien à faire
			role = game.sockets.player1 === socket.id ? "player1" : "player2";
			console.log("Player reconnected as", role);
		}
		else {
			// La game est déjà pleine
			socket.emit("gameFull");
			return;
		}
		
		if(game.sockets.player1 !== null && game.sockets.player2 !== null)
		{
			console.log("2 players");
			io.to(`game-${gameId}`).emit("startGame");
		}

		socket.on("disconnect", () => {
			if (game.sockets.player1 === socket.id) game.sockets.player1 = null;
			if (game.sockets.player2 === socket.id) game.sockets.player2 = null;
		});

		socket.emit("assignRole", role);

		// Envoi de l’état actuel
		socket.emit("gameState", {
			player1: { y: game.paddlePos.player1 },
			player2: { y: game.paddlePos.player2 },
			ball: game.ballPos
		});
		});

		socket.on("paddleMove", ({ gameId, player, y }: { 
			gameId: string, 
			player: "player1" | "player2", 
			y: number 
		}) => {
			const game = games_map.get(Number(gameId));
			if (!game) return;

			if (player !== "player1" && player !== "player2") return;

			game.paddlePos[player] = y;

			socket.to(`game-${gameId}`).emit("paddleMove", { player, y });
		});

		socket.on("ballMove", ({ gameId, y, x }: { 
			gameId: string, 
			y: number,
			x: number
		}) => {
			const game = games_map.get(Number(gameId));
			if (!game) return;

			game.ballPos.x = x;
			game.ballPos.y = y;

			socket.to(`game-${gameId}`).emit("ballMove", { x, y });
		});
	});

	const interval = setInterval(() => {
		for (const [gameId, game] of games_map.entries()) {
			game.ballPos.x += 1.2;
			game.ballPos.y += 1.2;

			// Envoie état de la balle à tous les joueurs
			io.to(`game-${gameId}`).emit("ballUpdate", game.ballPos);
		}
	}, 16);

	
	// Détecte Ctrl+C
	// process.on("SIGINT", async () => {
	// 	console.log("Fermeture du serveur…");
	
	// 	try {
	// 	// 1) Fermer Socket.io
	// 	await new Promise<void>((resolve) => {
	// 		io.close(() => {
	// 			console.log("✔️ Socket.io fermé");
	// 			resolve();
	// 		});
	// 	});

	// 	// 2) Fermer Fastify
	// 	await fastify.close();
	// 	console.log("✔️ Fastify fermé");

	// 	// 3) Fermer le serveur HTTP brut
	// 	// (très important sinon Node peut rester bloqué)
	// 	const server = fastify.server;
	// 	await new Promise<void>((resolve) => {
	// 		server.close(() => {
	// 			console.log("✔️ Serveur fermé");
	// 			resolve();
	// 		});
	// 	});

	// 	// 4) Nettoyer tout interval encore actif
	// 	clearInterval(interval);
	// 	console.log("✔️ Intervalles nettoyés");

	// } catch (err) {
	// 	console.error("Erreur pendant la fermeture:", err);
	// }
	// });
}

const io = new Server(fastify.server, {
			cors: { origin: "*" }
		});
setupSocket(io);

fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
	if (request.url.startsWith("/api"))
		return reply.code(404).send({ error: "Not found" });
	return reply.sendFile("index.html");
})


const start = async () => {
	const PORT = 3000
	try {
		await fastify.listen({ port: PORT, host: "0.0.0.0" });
		console.log(`Server running on port ${PORT}`);
		await db.connect();
		// await users.deleteUserTable();
		await gameInfo.deleteGameInfoTable();
		await users.createUserTable();
		await gameInfo.createGameInfoTable();
		await tournament.createTournamentTable();
		await users.CreateUserIA();
		// const hashedPassword = await bcrypt.hash("42", 12);
		// users.addUser("42", "42", hashedPassword);
	} catch (err) {
		console.log(err);
		fastify.log.error(err);
		process.exit(1);
	}
};

start();