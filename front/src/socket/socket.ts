import { io, Socket } from "socket.io-client";

export let globalSocket: Socket | null = null;

console.log(new Date().toISOString(), "socket.ts chargé (importé)");

export function initSocket() {
    const token = document.cookie.split("; ").find(row => row.startsWith("token="))?.split("=")[1];
    console.log(new Date().toISOString(), "dans init socket, token socket=", token);
    globalSocket = io(window.location.host, {
        transports: ["websocket"],
        auth: { token }
    });
    console.log(new Date().toISOString(), "globalsocket s ocket=", globalSocket);
}