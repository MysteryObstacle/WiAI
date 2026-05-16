import type { GameConfig } from "@wiai/game";
import { nanoid } from "nanoid";

export const DEFAULT_ROOM_CONFIG: GameConfig = {
  minPlayers: 3,
  maxPlayers: 6,
  phaseDurationsMs: {
    answer_prep: 30_000,
    answer_reveal: 8_000,
    discussion: 8_000,
    voting: 30_000,
    settlement: 0
  }
};

export function getPort(): number {
  return Number(process.env.PORT ?? 2567);
}

export function getDatabaseFilename(): string {
  const value = process.env.WIAI_DATABASE_URL ?? "file:./.data/wiai.sqlite";
  return value.startsWith("file:") ? value.slice("file:".length) : value;
}

export function generateRoomCode(): string {
  return nanoid(6).toUpperCase();
}
