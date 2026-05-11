"use client";

import type { Room } from "colyseus.js";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { GameLayout } from "./GameLayout";

export function GameClient({
  room,
  snapshot,
  currentSessionPlayer
}: {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}) {
  return (
    <main className="app-shell game-shell">
      <GameLayout room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
    </main>
  );
}
