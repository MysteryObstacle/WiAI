/**
 * When `LobbyClient` renders `GameClient`, this module is not mounted — no need to pass game visibility here.
 */
export function showLobbySciFiBackdrop(isConnected: boolean, hasRoom: boolean): boolean {
  return !(isConnected && hasRoom);
}
