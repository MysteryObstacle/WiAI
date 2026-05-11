import { z } from "zod";
import { ballotTypeSchema } from "./enums";

const nonEmptyText = z.string().trim().min(1);

export const readyCommandSchema = z.object({
  type: z.literal("ready"),
  payload: z.object({
    isReady: z.boolean()
  }),
  requestId: z.string().trim().min(1).optional()
});

export const startGameCommandSchema = z.object({
  type: z.literal("start_game"),
  payload: z.object({}).default({}),
  requestId: z.string().trim().min(1).optional()
});

export const submitAnswerCommandSchema = z.object({
  type: z.literal("submit_answer"),
  payload: z.object({
    content: nonEmptyText
  }),
  requestId: z.string().trim().min(1).optional()
});

export const cancelSubmitAnswerCommandSchema = z.object({
  type: z.literal("cancel_submit_answer"),
  payload: z.object({}).default({}),
  requestId: z.string().trim().min(1).optional()
});

export const sendChatCommandSchema = z.object({
  type: z.literal("send_chat"),
  payload: z.object({
    content: nonEmptyText
  }),
  requestId: z.string().trim().min(1).optional()
});

export const submitBallotCommandSchema = z.object({
  type: z.literal("submit_ballot"),
  payload: z
    .object({
      ballotType: ballotTypeSchema,
      targetGameNumber: z.number().int().positive().optional(),
      abstain: z.boolean()
    })
    .refine((payload) => payload.abstain || payload.targetGameNumber !== undefined, {
      message: "non-abstain ballot requires targetGameNumber",
      path: ["targetGameNumber"]
    }),
  requestId: z.string().trim().min(1).optional()
});

export const requestStateCommandSchema = z.object({
  type: z.literal("request_state"),
  payload: z.object({}).default({}),
  requestId: z.string().trim().min(1).optional()
});

export const browserCommandSchema = z.discriminatedUnion("type", [
  readyCommandSchema,
  startGameCommandSchema,
  submitAnswerCommandSchema,
  cancelSubmitAnswerCommandSchema,
  sendChatCommandSchema,
  submitBallotCommandSchema,
  requestStateCommandSchema
]);

export type BrowserCommand = z.infer<typeof browserCommandSchema>;

export type ActorContext = {
  actorLobbyPlayerId?: string;
  actorSessionPlayerId?: string;
  requestId?: string;
};

export type CommandIntent =
  | {
      type: "ready";
      actorLobbyPlayerId: string;
      requestId?: string;
      isReady: boolean;
    }
  | {
      type: "start_game";
      actorLobbyPlayerId: string;
      requestId?: string;
    }
  | {
      type: "submit_answer";
      actorSessionPlayerId: string;
      requestId?: string;
      content: string;
    }
  | {
      type: "cancel_submit_answer";
      actorSessionPlayerId: string;
      requestId?: string;
    }
  | {
      type: "send_chat";
      actorSessionPlayerId: string;
      requestId?: string;
      content: string;
    }
  | {
      type: "submit_ballot";
      actorSessionPlayerId: string;
      requestId?: string;
      ballotType: "suspicion" | "decision";
      targetGameNumber?: number;
      abstain: boolean;
    }
  | {
      type: "request_state";
      actorLobbyPlayerId?: string;
      actorSessionPlayerId?: string;
      requestId?: string;
    };

export function mapBrowserCommandToIntent(
  command: BrowserCommand,
  actor: ActorContext
): CommandIntent {
  const requestId = command.requestId ?? actor.requestId;

  switch (command.type) {
    case "ready":
      return withOptionalRequestId({
        type: "ready",
        actorLobbyPlayerId: requireLobbyActor(actor),
        isReady: command.payload.isReady
      }, requestId);
    case "start_game":
      return withOptionalRequestId({
        type: "start_game",
        actorLobbyPlayerId: requireLobbyActor(actor)
      }, requestId);
    case "submit_answer":
      return withOptionalRequestId({
        type: "submit_answer",
        actorSessionPlayerId: requireSessionActor(actor),
        content: command.payload.content
      }, requestId);
    case "cancel_submit_answer":
      return withOptionalRequestId({
        type: "cancel_submit_answer",
        actorSessionPlayerId: requireSessionActor(actor)
      }, requestId);
    case "send_chat":
      return withOptionalRequestId({
        type: "send_chat",
        actorSessionPlayerId: requireSessionActor(actor),
        content: command.payload.content
      }, requestId);
    case "submit_ballot":
      return withOptionalRequestId(
        withOptionalTargetGameNumber({
        type: "submit_ballot",
        actorSessionPlayerId: requireSessionActor(actor),
        ballotType: command.payload.ballotType,
        abstain: command.payload.abstain
        }, command.payload.targetGameNumber),
        requestId
      );
    case "request_state":
      return withOptionalRequestId(
        withOptionalActors({
        type: "request_state",
        }, actor),
        requestId
      );
  }
}

function requireLobbyActor(actor: ActorContext): string {
  if (!actor.actorLobbyPlayerId) {
    throw new Error("not_joined");
  }

  return actor.actorLobbyPlayerId;
}

function requireSessionActor(actor: ActorContext): string {
  if (!actor.actorSessionPlayerId) {
    throw new Error("not_joined");
  }

  return actor.actorSessionPlayerId;
}

function withOptionalRequestId<T extends object>(value: T, requestId: string | undefined): T & { requestId?: string } {
  return requestId ? { ...value, requestId } : value;
}

function withOptionalTargetGameNumber<T extends object>(
  value: T,
  targetGameNumber: number | undefined
): T & { targetGameNumber?: number } {
  return targetGameNumber === undefined ? value : { ...value, targetGameNumber };
}

function withOptionalActors<T extends object>(
  value: T,
  actor: ActorContext
): T & { actorLobbyPlayerId?: string; actorSessionPlayerId?: string } {
  return {
    ...value,
    ...(actor.actorLobbyPlayerId ? { actorLobbyPlayerId: actor.actorLobbyPlayerId } : {}),
    ...(actor.actorSessionPlayerId ? { actorSessionPlayerId: actor.actorSessionPlayerId } : {})
  };
}
