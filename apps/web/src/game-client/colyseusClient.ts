import { Client } from "colyseus.js";

type BrowserLocation = Pick<Location, "hostname" | "protocol">;

export function getColyseusServerUrl(location?: BrowserLocation) {
  if (process.env.NEXT_PUBLIC_WIAI_SERVER_URL) {
    return process.env.NEXT_PUBLIC_WIAI_SERVER_URL;
  }

  if (!location && typeof window === "undefined") {
    return "ws://127.0.0.1:2567";
  }

  const browserLocation = location ?? window.location;
  const protocol = browserLocation.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${browserLocation.hostname}:2567`;
}

export function createColyseusClient() {
  return new Client(getColyseusServerUrl());
}
