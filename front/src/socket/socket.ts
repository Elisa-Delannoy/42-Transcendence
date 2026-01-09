import { io, Socket } from "socket.io-client";

export let globalSocket: Socket | null = null;

export function initSocket() {
    const token = localStorage.getItem("token");
    if (!token)
        return;
    console.log(new Date().toISOString(), "dans init socket, token socket=", token,"URL socket =", window.location.origin);
    globalSocket = io(window.location.origin, {
        transports: ["websocket"],
        query: { token }
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