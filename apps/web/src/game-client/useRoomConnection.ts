"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Room } from "colyseus.js";
import { createColyseusClient } from "./colyseusClient";
import type { WiaiSnapshot } from "./types";

type ConnectionStatus = "idle" | "connecting" | "connected" | "error";

const emptySnapshot: WiaiSnapshot = {
  roomId: "",
  roomCode: "",
  status: "lobby",
  phase: "lobby",
  phaseVersion: 0,
  roundIndex: -1,
  phaseEndsAt: 0,
  lobbyPlayers: [],
  sessionPlayers: [],
  answers: [],
  messages: [],
  ballots: [],
  questions: [],
  result: {
    winnerSide: "",
    frozenSessionPlayerId: ""
  }
};

export function useRoomConnection() {
  const client = useMemo(() => createColyseusClient(), []);
  const [room, setRoom] = useState<Room | null>(null);
  const [snapshot, setSnapshot] = useState<WiaiSnapshot>(emptySnapshot);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [error, setError] = useState("");

  const bindRoom = useCallback((nextRoom: Room) => {
    setRoom(nextRoom);
    setSnapshot(toSnapshot(nextRoom.state));
    setStatus("connected");
    window.localStorage.setItem("wiai:lastRoomId", nextRoom.roomId);

    nextRoom.onStateChange((state) => {
      const nextSnapshot = toSnapshot(state);
      setSnapshot(nextSnapshot);
      if (nextSnapshot.roomCode) {
        window.localStorage.setItem("wiai:lastRoomCode", nextSnapshot.roomCode);
      }
    });

    nextRoom.onMessage("error", (message) => {
      setError(message?.message ?? message?.code ?? "Room command failed");
    });

    nextRoom.onMessage("state", (message) => {
      setSnapshot(message as WiaiSnapshot);
    });

    nextRoom.onLeave(() => {
      setStatus("idle");
    });

    nextRoom.send("request_state", {});
  }, []);

  const createRoom = useCallback(
    async (nickname: string) => {
      setStatus("connecting");
      setError("");
      try {
        const nextRoom = await client.create("wiai", { nickname });
        window.localStorage.setItem("wiai:nickname", nickname);
        bindRoom(nextRoom);
      } catch (cause) {
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Could not create room");
      }
    },
    [bindRoom, client]
  );

  const joinRoomByCode = useCallback(
    async (roomCode: string, nickname: string) => {
      setStatus("connecting");
      setError("");
      try {
        const nextRoom = await client.joinById(roomCode.trim().toUpperCase(), { nickname });
        window.localStorage.setItem("wiai:nickname", nickname);
        bindRoom(nextRoom);
      } catch (cause) {
        setStatus("error");
        setError(cause instanceof Error ? cause.message : "Could not join room");
      }
    },
    [bindRoom, client]
  );

  useEffect(() => {
    return () => {
      void room?.leave();
    };
  }, [room]);

  const currentLobbyPlayerId = room ? `lp_${room.sessionId}` : "";
  const currentLobbyPlayer = snapshot.lobbyPlayers.find((player) => player.id === currentLobbyPlayerId);
  const currentSessionPlayer = snapshot.sessionPlayers.find(
    (player) => player.lobbyPlayerId === currentLobbyPlayerId
  );

  return {
    room,
    snapshot,
    status,
    error,
    currentLobbyPlayer,
    currentSessionPlayer,
    createRoom,
    joinRoomByCode
  };
}

function toSnapshot(state: any): WiaiSnapshot {
  if (!state) {
    return emptySnapshot;
  }

  return {
    roomId: String(state.roomId ?? ""),
    roomCode: String(state.roomCode ?? ""),
    status: state.status ?? "lobby",
    phase: state.phase ?? "lobby",
    phaseVersion: Number(state.phaseVersion ?? 0),
    roundIndex: Number(state.roundIndex ?? -1),
    phaseEndsAt: Number(state.phaseEndsAt ?? 0),
    lobbyPlayers: valuesOf(state.lobbyPlayers).map((player: any) => ({
      id: String(player.id ?? ""),
      nickname: String(player.nickname ?? ""),
      isHost: Boolean(player.isHost),
      isReady: Boolean(player.isReady),
      status: String(player.status ?? "online")
    })),
    sessionPlayers: valuesOf(state.sessionPlayers).map((player: any) => ({
      id: String(player.id ?? ""),
      lobbyPlayerId: String(player.lobbyPlayerId ?? ""),
      gameNumber: Number(player.gameNumber ?? 0),
      displayName: String(player.displayName ?? ""),
      playerType: player.playerType === "ai" ? "ai" : "human",
      role: player.role ?? "",
      controlMode: String(player.controlMode ?? "player"),
      isActive: Boolean(player.isActive)
    })),
    answers: valuesOf(state.answers).map((answer: any) => ({
      id: String(answer.id ?? ""),
      roundIndex: Number(answer.roundIndex ?? 0),
      sessionPlayerId: String(answer.sessionPlayerId ?? ""),
      content: String(answer.content ?? ""),
      submittedAt: String(answer.submittedAt ?? "")
    })),
    messages: valuesOf(state.messages).map((message: any) => ({
      id: String(message.id ?? ""),
      roundIndex: Number(message.roundIndex ?? 0),
      sessionPlayerId: String(message.sessionPlayerId ?? ""),
      content: String(message.content ?? ""),
      createdAt: String(message.createdAt ?? "")
    })),
    ballots: valuesOf(state.ballots).map((ballot: any) => ({
      id: String(ballot.id ?? ""),
      roundIndex: Number(ballot.roundIndex ?? 0),
      actorSessionPlayerId: String(ballot.actorSessionPlayerId ?? ""),
      ballotType: String(ballot.ballotType ?? ""),
      targetSessionPlayerId: String(ballot.targetSessionPlayerId ?? ""),
      abstain: Boolean(ballot.abstain)
    })),
    questions: valuesOf(state.questions).map((question: any) => ({
      roundIndex: Number(question.roundIndex ?? -1),
      kind: String(question.kind ?? ""),
      prompt: String(question.prompt ?? "")
    })),
    result: {
      winnerSide: state.result?.winnerSide ?? "",
      frozenSessionPlayerId: state.result?.frozenSessionPlayerId ?? ""
    }
  };
}

function valuesOf(collection: any): any[] {
  if (!collection) {
    return [];
  }
  const values: any[] = [];
  if (typeof collection.forEach === "function") {
    collection.forEach((value: any) => values.push(value));
    return values;
  }
  if (Array.isArray(collection)) {
    return collection;
  }
  return Object.values(collection);
}
