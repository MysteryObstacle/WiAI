import type { Room } from "colyseus.js";

export function sendReady(room: Room, isReady: boolean) {
  room.send("ready", { isReady });
}

export function sendStartGame(room: Room) {
  room.send("start_game", {});
}

export function sendAddDebugPlayers(room: Room, count: number) {
  room.send("add_debug_players", { count });
}

export function sendAnswer(room: Room, content: string) {
  room.send("submit_answer", { content });
}

export function sendCancelAnswer(room: Room) {
  room.send("cancel_submit_answer", {});
}

export function sendChat(room: Room, content: string) {
  room.send("send_chat", { content });
}

export function sendBallot(
  room: Room,
  payload:
    | {
        ballotType: "suspicion" | "decision";
        targetGameNumber: number;
        abstain: false;
      }
    | {
        ballotType: "suspicion";
        abstain: true;
      }
) {
  room.send("submit_ballot", payload);
}
