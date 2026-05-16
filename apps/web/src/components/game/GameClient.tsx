"use client";

import type { Room } from "colyseus.js";
import type { SessionPlayerSnapshot, WiaiSnapshot } from "@/game-client/types";
import { GameLayout } from "./GameLayout";
import { AppShell, AppShellContainer } from "@/components/layout/AppShell";

interface GameClientProps {
  room: Room;
  snapshot: WiaiSnapshot;
  currentSessionPlayer: SessionPlayerSnapshot | undefined;
}

export function GameClient({ room, snapshot, currentSessionPlayer }: GameClientProps) {
  return (
    <AppShell variant="game">
      <AppShellContainer className="max-w-[1440px]">
        <GameLayout room={room} snapshot={snapshot} currentSessionPlayer={currentSessionPlayer} />
      </AppShellContainer>
    </AppShell>
  );
}
