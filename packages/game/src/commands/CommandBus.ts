import { ok, type Result } from "@wiai/kernel";
import { advanceOnTimeout } from "../policies/phasePolicies";
import type { DomainCommand, GameErrorCode, GameEvent, GameState } from "../types";
import { executeCommand } from "./handlers";

export class CommandBus {
  execute(
    state: GameState,
    command: DomainCommand
  ): Result<GameEvent[], GameErrorCode> {
    return executeCommand(state, command);
  }

  handlePhaseTimeout(state: GameState, expectedPhaseVersion: number): Result<GameEvent[], GameErrorCode> {
    const beforeEventCount = state.events.length;
    advanceOnTimeout(state, expectedPhaseVersion);
    return ok(state.events.slice(beforeEventCount));
  }
}
