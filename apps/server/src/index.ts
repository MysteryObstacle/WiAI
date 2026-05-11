import { createServer } from "node:http";
import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import express from "express";
import { getPort } from "./config";
import { WiaiRoom } from "./rooms/WiaiRoom";

const app = express();
const httpServer = createServer(app);
const gameServer = new Server({
  transport: new WebSocketTransport({
    server: httpServer
  })
});

app.get("/", (_request, response) => {
  response.json({ ok: true, service: "wiai-server" });
});

gameServer.define("wiai", WiaiRoom);

const port = getPort();
gameServer.listen(port);
console.log(`WiAI Colyseus server listening on ws://localhost:${port}`);
