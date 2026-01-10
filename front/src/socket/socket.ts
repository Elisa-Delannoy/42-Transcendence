import { io, Socket } from "socket.io-client";

export let globalSocket: Socket | null = null;

export function initSocket() {
    globalSocket = io(window.location.origin, {
        transports: ["websocket"],
        withCredentials: true,
    });
    globalSocket.on("connect_error", (err) => {
    console.log("CONNECT ERROR:", err.message);
});

    console.log("Socket attempting connection...");
    globalSocket.on("connect", () => console.log("CONNECTED!"));
    globalSocket.on("connect_error", (err) => console.log("CONNECT ERROR:", err));
    globalSocket.on("error", (err) => console.log("ERROR:", err));


    console.log(new Date().toISOString(), "globalsocket s ocket=", globalSocket);
    setTimeout(() => {
    console.log("Final socket state:", globalSocket);
}, 500);
}