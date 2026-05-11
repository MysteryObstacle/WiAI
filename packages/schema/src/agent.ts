import { z } from "zod";
import {
  controlModeSchema,
  gamePhaseSchema,
  playerRoleSchema,
  playerTypeSchema
} from "./enums";

const nonEmptyText = z.string().trim().min(1);

export const agentVisibleContextSchema = z.object({
  session: z.object({
    sessionId: z.string().trim().min(1),
    roomCode: z.string().trim().min(1),
    phase: gamePhaseSchema,
    roundIndex: z.number().int(),
    phaseEndsAt: z.number().int().nonnegative()
  }),
  self: z.object({
    sessionPlayerId: z.string().trim().min(1),
    gameNumber: z.number().int().positive(),
    playerType: playerTypeSchema,
    role: playerRoleSchema,
    controlMode: controlModeSchema
  }),
  visiblePlayers: z.array(
    z.object({
      sessionPlayerId: z.string().trim().min(1),
      gameNumber: z.number().int().positive(),
      displayName: z.string().trim().min(1),
      isSelf: z.boolean(),
      isActive: z.boolean()
    })
  ),
  currentQuestion: z.object({
    roundIndex: z.number().int().nonnegative(),
    kind: z.string().trim().min(1),
    prompt: nonEmptyText
  }),
  revealedAnswers: z.array(
    z.object({
      sessionPlayerId: z.string().trim().min(1),
      gameNumber: z.number().int().positive(),
      displayName: z.string().trim().min(1),
      content: nonEmptyText
    })
  ),
  discussionMessages: z.array(
    z.object({
      id: z.string().trim().min(1),
      sessionPlayerId: z.string().trim().min(1),
      gameNumber: z.number().int().positive(),
      displayName: z.string().trim().min(1),
      content: nonEmptyText,
      createdAt: z.string().trim().min(1)
    })
  ),
  allowedActions: z.array(z.enum(["submit_answer", "send_chat", "submit_ballot", "noop"])),
  allRoles: z
    .array(
      z.object({
        sessionPlayerId: z.string().trim().min(1),
        gameNumber: z.number().int().positive(),
        role: playerRoleSchema
      })
    )
    .optional()
});

export type AgentVisibleContext = z.infer<typeof agentVisibleContextSchema>;

export const agentSuggestionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("action_suggestion"),
    payload: z.discriminatedUnion("type", [
      z.object({
        type: z.literal("submit_answer"),
        payload: z.object({
          content: nonEmptyText
        }),
        requestId: z.string().trim().min(1)
      }),
      z.object({
        type: z.literal("send_chat"),
        payload: z.object({
          content: nonEmptyText
        }),
        requestId: z.string().trim().min(1)
      }),
      z.object({
        type: z.literal("submit_ballot"),
        payload: z
          .object({
            ballotType: z.enum(["suspicion", "decision"]),
            targetGameNumber: z.number().int().positive().optional(),
            abstain: z.boolean()
          })
          .refine((payload) => payload.abstain || payload.targetGameNumber !== undefined, {
            message: "non-abstain ballot requires targetGameNumber",
            path: ["targetGameNumber"]
          }),
        requestId: z.string().trim().min(1)
      }),
      z.object({
        type: z.literal("noop"),
        payload: z.object({}).default({}),
        requestId: z.string().trim().min(1)
      })
    ])
  })
]);

export type AgentSuggestion = z.infer<typeof agentSuggestionSchema>;
