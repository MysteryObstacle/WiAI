import { Client } from "colyseus.js";

export function createColyseusClient() {
  return new Client(process.env.NEXT_PUBLIC_WIAI_SERVER_URL ?? "ws://127.0.0.1:2567");
}
