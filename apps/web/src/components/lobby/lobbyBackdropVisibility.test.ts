import { describe, expect, it } from "vitest";
import { showLobbySciFiBackdrop } from "./lobbyBackdropVisibility";

describe("showLobbySciFiBackdrop", () => {
  it("is true when disconnected (not connected)", () => {
    expect(showLobbySciFiBackdrop(false, false)).toBe(true);
  });

  it("is true when connected but no room yet", () => {
    expect(showLobbySciFiBackdrop(true, false)).toBe(true);
  });

  it("is false when connected lobby with room (LobbyRoom)", () => {
    expect(showLobbySciFiBackdrop(true, true)).toBe(false);
  });
});
