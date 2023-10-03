const http = require("http");
const express = require( "express");
const WebSocket = require( "ws");
const PORT = 3000

const app = express();

const server = http.createServer(app);

const webSocketServer = new WebSocket.Server({ server });

const dispatchEvent = (message, ws) => {
    const json = JSON.parse(message);
    switch (json.event) {
        case "chat-message": webSocketServer.clients.forEach(client => client.send(message));
        default: ws.send((new Error("Wrong query")).message);
    }
}

webSocketServer.on('connection', ws => {
    ws.on('message', m => dispatchEvent(m, ws));
    ws.on("error", e => ws.send(e));

    ws.send('Hi there, I am a WebSocket server');
});

server.listen(PORT, () => console.log(`Server started ${PORT}`))



