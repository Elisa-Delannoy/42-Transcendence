// front/game/GameNetwork.ts
import { io, Socket } from "socket.io-client";
import { GameInstance } from "./gameInstance";

/**
 * Types du state envoyé par le serveur
 */
export interface ServerGameState {
  ball?: { x: number; y: number; };
  paddles?: { player1?: number; player2?: number; };
  score?: { player1?: number; player2?: number; };
  // pas de status ici (status géré et stocké côté back)
}

interface PaddleMoveData {
  gameId: number;
  player: "player1" | "player2";
  y: number;
}

export class GameNetwork {
  private socket: Socket;
  private game: GameInstance;
  private gameId: number;
  private lastSend = 0;

  constructor(serverUrl: string, game: GameInstance, gameId: number) {
    this.socket = io(serverUrl, {
      autoConnect: true,
      transports: ["websocket"],
      secure: true,
      rejectUnauthorized: false
    });
    this.game = game;
    this.gameId = gameId;

    this.registerListeners();
  }

  private registerListeners() {
    this.socket.on("connect", () => {
      console.log("[WS] connected:", this.socket.id);
      // demander à rejoindre la room côté serveur
      this.socket.emit("joinGame", this.gameId);
    });

    // Le serveur envoie des états partiels/mini (ball, paddles, score)
    this.socket.on("gameState", (state: ServerGameState) => {
      // applique proprement l'état sans écraser la classe
      this.game.applyServerState(state);
    });

    this.socket.on("assignRole", (role: "player1" | "player2") => {
      console.log("My role:", role);
    });

    // update ciblé pour les paddles (back répand à la room)
    this.socket.on("paddleMove", (data: { player: "player1" | "player2"; y: number }) => {
      // Réutiliser applyServerState pour garder la logique centralisée
      const paddles = data.player === "player1" ? { player1: data.y } : { player2: data.y };
      this.game.applyServerState({ paddles });
    });

    // update ciblé pour la balle
    this.socket.on("ballUpdate", (pos: { x: number; y: number }) => {
      this.game.applyServerState({ ball: { x: pos.x, y: pos.y } });
    });

    // network events — on ne touche pas au game.status côté front
    this.socket.on("disconnect", (reason?: string) => {
      console.warn("[WS] disconnected", reason);
      // si tu veux afficher un message UI, expose un event ou callback depuis GameInstance
    });

    this.socket.on("connect_error", (err: any) => {
      console.error("[WS] connect_error", err);
      // idem: remontée au UI si besoin
    });
  }

  /**
   * Envoie un mouvement de paddle au serveur.
   * On throttle pour éviter spam.
   */
  public sendPaddleMove(player: "player1" | "player2", y: number) {
    const now = performance.now();
    if (now - this.lastSend < 33) return; // ~30 updates/s
    this.lastSend = now;

    const payload: PaddleMoveData = {
      gameId: this.gameId,
      player,
      y
    };
    this.socket.emit("paddleMove", payload);
  }

  public disconnect() {
    this.socket.disconnect();
  }
}
