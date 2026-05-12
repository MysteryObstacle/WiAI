import { describe, expect, it, vi } from "vitest";
import { sendAddDebugPlayers } from "./roomCommands";

describe("room commands", () => {
  it("sends add_debug_players with the requested count", () => {
    const room = {
      send: vi.fn()
    };

    sendAddDebugPlayers(room as unknown as Parameters<typeof sendAddDebugPlayers>[0], 2);

    expect(room.send).toHaveBeenCalledWith("add_debug_players", { count: 2 });
  });
});
