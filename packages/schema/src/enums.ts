import { z } from "zod";
import {
  ballotTypes,
  gamePhases,
  playerControlModes,
  playerRoles,
  playerTypes,
  winnerSides
} from "@wiai/kernel";

export const gamePhaseSchema = z.enum(gamePhases);
export const playerTypeSchema = z.enum(playerTypes);
export const playerRoleSchema = z.enum(playerRoles);
export const controlModeSchema = z.enum(playerControlModes);
export const ballotTypeSchema = z.enum(ballotTypes);
export const winnerSideSchema = z.enum(winnerSides);
