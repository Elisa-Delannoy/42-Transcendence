import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/register";
import { GameInfo } from "./DB/gameinfo";
import fastifyCookie from "@fastify/cookie";
import { tokenOK } from "./middleware/jwt";
import { createGame, joinGame, getGameType, isCreator } from "./routes/game/serverGame";
import fs from "fs";
import { Tournament } from './DB/tournament';
import { Server } from "socket.io";
import multipart from "@fastify/multipart"
import FastifyHttpsAlwaysPlugin, { HttpsAlwaysOptions } from "fastify-https-always";
import * as tournamentService from "./routes/tournament/tournament.service";
import { getProfile } from "./routes/profile/profile";
import { getUpdateUsername, getUpdateEmail, getUploadAvatar, getUpdatePassword, getUpdateStatus, deleteUser } from "./routes/profile/getUpdate";
import { logout } from "./routes/logout/logout";
import { Friends } from "./DB/friend";
import { allMyFriendsAndOpponent, searchUser, addFriend, acceptFriend, deleteFriend, notification } from "./routes/friends/friends";
import fastifyMetrics from "fastify-metrics";
import { dashboardInfo } from "./routes/dashboard/dashboard";
import { checkTwoFA, disableTwoFA, enableTwoFA, setupTwoFA } from "./routes/twofa/twofa";
import { createTournament, getTournamentGameType, tournaments_map } from "./routes/tournament/serverTournament";
import { oauthStatus } from "./routes/login/oauth.status";
import { registerGoogle, callbackGoogle } from "./routes/login/oauth.google";
import { createWebSocket } from "./middleware/socket";
import { leaderboardInfo } from "./routes/leaderboard/leaderboard";
import { Chat } from "./DB/chat";
import { Achievements } from "./DB/achievements";
import { UserStats } from "./DB/users_stats";
import { UserAchievements } from "./DB/users_achievements";
import { getAchivementInfo } from "./routes/achievements/achievementInfo";
import { getEndGameInfo } from "./routes/endgame/endgame";
import { newInputDB } from "./DB/input";
import { getUsersByIdsHandler } from "./routes/profile/byIds";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const friends = new Friends(db);
export const gameInfo = new GameInfo(db);
export const tournamentDB = new Tournament(db);
export const tournament = new Tournament(db);
export const generalChat = new Chat(db);
export const achievements = new Achievements(db);
export const users_stats = new UserStats(db);
export const users_achivements = new UserAchievements(db);

const fastify = Fastify({
	logger: false,
	https:
	{
		key: fs.readFileSync("server.key"),
		cert: fs.readFileSync("server.cert"),
	},
	trustProxy: true
});

fastify.register(fastifyMetrics, {
	endpoint: "/metrics",
	defaultMetrics: {
	enabled: true,
	}
});

const httpsAlwaysOpts: HttpsAlwaysOptions = {
	productionOnly: false,
	redirect:       false,
	httpsPort:      3000
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
		fileSize: 6 * 1024 * 1024,
		files: 1,
	}
})

fastify.register(async function (instance) {

  instance.register(fastifyStatic, {
	root: join(__dirname, "uploads"),
	prefix: "/files/",
	index: false,
	});
});

fastify.addHook("onRequest", async(request: FastifyRequest, reply: FastifyReply) => {
	const user = await tokenOK(request, reply);
	request.user = user;
})

fastify.get("/api/checkLogged", async (request, reply) => {
	if (!request.user || request.user.user_id === null)
		return reply.send({ loggedIn: false, error: request.user?.error });
	const toNotify: boolean = await notification(request, reply);
	reply.send({ loggedIn: true, notif:toNotify, user: {id: request.user.user_id, pseudo: request.user.pseudo, avatar: request.user.avatar, status: request.user.status, xp: request.user.xp, lvl: request.user.lvl }});
});

fastify.get("/api/auth/status", async (request: FastifyRequest, reply: FastifyReply) => {
	return oauthStatus(request, reply);
});

fastify.get("/api/oauth/google", async (request: FastifyRequest, reply: FastifyReply) => {
	return await registerGoogle(request, reply);
});

fastify.get("/api/oauth/google/callback", async (request: FastifyRequest, reply: FastifyReply) => {
	return await callbackGoogle(request, reply);
});

fastify.post("/api/register", async (request, reply) => {
  const { username, email, password, confirm } = request.body as { username: string, password: string, email: string, confirm: string};
  await manageRegister(username, email, password, confirm, reply);
});

fastify.post("/api/login", async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, password } = request.body as { username: string, password: string };
  await manageLogin(username, password, reply);
});

fastify.post("/api/private/2fa/setup", async (request: FastifyRequest, reply: FastifyReply) => {
	return await setupTwoFA(request, reply);
});

fastify.put("/api/private/2fa/enable", async (request: FastifyRequest, reply: FastifyReply) => {
	return await enableTwoFA(request, reply);
});

fastify.put("/api/private/2fa/disable", async (request: FastifyRequest, reply: FastifyReply) => {
	return await disableTwoFA(request, reply);
});

fastify.get("/api/private/profile", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getProfile(fastify, request, reply);
});

fastify.put("/api/private/updateinfo/status", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateStatus(request, reply);
});

fastify.put("/api/private/updateinfo/username", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateUsername(fastify, request, reply);
})

fastify.put("/api/private/updateinfo/email", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateEmail(fastify, request, reply);
})

fastify.put("/api/private/updateinfo/password", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdatePassword(fastify, request, reply);
})

fastify.post("/api/private/updateinfo/uploads", async (request, reply) => {
	await getUploadAvatar(request, reply);
});

fastify.delete("/api/private/updateinfo/delete", async (request, reply) => {
	await deleteUser(fastify, request, reply);
});

fastify.get("/api/private/friend", async (request: FastifyRequest, reply: FastifyReply) => {
	await allMyFriendsAndOpponent(request, reply);
})

fastify.post("/api/private/friend/add", async(request: FastifyRequest, reply: FastifyReply) => {
	await addFriend(request, reply);
})

fastify.post("/api/private/friend/accept", async(request: FastifyRequest, reply: FastifyReply) => {
	await acceptFriend(request, reply);
})

fastify.delete("/api/private/friend/delete", async (request: FastifyRequest, reply: FastifyReply) => {
	await deleteFriend(request, reply)
})

fastify.post("/api/private/friend/search", async( request: FastifyRequest, reply: FastifyReply) => {
	await searchUser(request, reply);
})

fastify.post("/api/private/game/onlinegame", async (request, reply) => {
	const { localMode, type } = request.body as { localMode: boolean, type: "Local" | "AI" | "Online" | "Tournament" };
	const playerId = request.user?.user_id as any;
	let gameId: number;
	const res = isCreator(playerId);
	if (res == 0)
		gameId = createGame(Number(playerId), localMode, type, { vsAI: false });
	else
		gameId = res;

	reply.send({ gameId });
});

fastify.post("/api/private/game/create", async (request, reply) => {
	const { localMode, type } = request.body as { localMode: boolean, type: "Local" | "AI" | "Online" | "Tournament" };
	const playerId = request.user?.user_id as any;
	const { vsAI } = request.body as { vsAI: boolean };
	let gameId: number;
	if (vsAI) {
		gameId = createGame(Number(playerId), localMode, type, { vsAI: true });
	} else {
		gameId = createGame(Number(playerId), localMode, type, { vsAI: false });
	}
	reply.send({ gameId });
});

fastify.post("/api/private/game/join", async (request, reply) => {
	const { gameId } = request.body as any;
	const playerId = request.user?.user_id as any;
	const id = Number(gameId);
	const res = joinGame(Number(playerId), id);
	reply.send({ res });
});

fastify.post("/api/private/game/type", async (request, reply) => {
	const { gameId, tournamentId } = request.body as { gameId: number, tournamentId: number };
	let type;
	if (tournamentId)
		type = getTournamentGameType(Number(tournamentId), Number(gameId));
	else
		type = getGameType(Number(gameId));
	reply.send({ type });
});

fastify.post("/api/private/tournament/create", async (request, reply) => {
	const playerId = request.user?.user_id as any;
	let tournamentId: number;

	tournamentId = createTournament(playerId);
	if (tournamentId == -2)
	{
		for (const tournament of tournaments_map.values()) {
			if (tournament.idPlayers.includes(playerId))
			{
				tournamentId = tournament.id;
				break;
			}
		}
	}
	reply.send({ tournamentId });
});

fastify.post("/api/private/users/by-ids", getUsersByIdsHandler);

fastify.get("/api/private/tournament/all", (req, reply) => {
	return tournamentService.getAllTournamentsDetailed(req, reply);
});

fastify.get("/api/logout", async (request, reply) => {
	return await logout(request, reply);
})

fastify.get("/api/private/dashboard", async (request, reply) => {
	await dashboardInfo(request, reply);
});

fastify.get("/api/private/leaderboard", async (request, reply) => {
	await leaderboardInfo(request, reply);
});

fastify.get("/api/private/achievement", async (request, reply) => {
	await getAchivementInfo(request, reply);
});

fastify.get("/api/private/endgame", async (request, reply) => {
	await getEndGameInfo(request, reply);
});

fastify.post("/api/twofa", async (request, reply) => {
	const { code } = request.body as { code: number};
	await checkTwoFA(request, reply, code);
});

fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("index.html");
})

const io = new Server(fastify.server, {
	cors: { origin: "*", credentials: true}
	});
createWebSocket(io);

function blockchainUpload() {
	(async () => {
	  try {
		await tournamentService.uploadPendingTournaments();
	  } catch (err) {
		console.error(
		  "Initial uploadPendingTournaments failed, server will still start",
		  err
		);
	  }
	})();
  
	setInterval(async () => {
	  try {
		await tournamentService.uploadPendingTournaments();
	  } catch (err) {
		console.error("uploadPendingTournaments failed", err);
	  }
	}, 60_000);
}

async function lunchDB()
{
	await users.deleteUserTable();
	await users.createUserTable();
	await users.CreateUserIA();
	await users.CreateUserGuest();

	
	await generalChat.deleteChatTableAndTrigger();
	await generalChat.createChatTableAndTrigger();

	await friends.deleteFriendTable();
	await friends.createFriendTable();
	
	await gameInfo.deleteGameInfoTable();
	await gameInfo.createGameInfoTable();
	
	await tournamentDB.deleteTournamentTables();
	await tournamentDB.createTournamentTable();
	await tournamentDB.createTournamentResultTable();
	
	await achievements.deleteTable();
	await achievements.createAchievementsTable();
	await achievements.setupAchievements();
	
	await users_stats.deleteTable();
	await users_stats.createUserStatsTable();
	
	await users_achivements.deleteTable();
	await users_achivements.createUserAchievementsTable();
}

const start = async () => {
	const PORT = 3000
	try {
		await fastify.listen({ port: PORT, host: "0.0.0.0" });
		console.log(`Server running on port ${PORT}`);
		await db.connect();
		await lunchDB();
		await newInputDB();
		blockchainUpload();
	} catch (err) {
		console.log(err);
		fastify.log.error(err);
		process.exit(1);
	}
};

start();