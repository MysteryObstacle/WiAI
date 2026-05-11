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
try {
  await gameServer.listen(port);
  console.log(`WiAI Colyseus server listening on ws://localhost:${port}`);
} catch (error) {
  console.error(error);
  if (error && typeof error === "object" && "code" in error && error.code === "EADDRINUSE") {
    console.error(
      `Port ${port} is already in use. Close the other WiAI server (or any app on that port), or set PORT to a free port.`
    );
  }
  process.exit(1);
}
