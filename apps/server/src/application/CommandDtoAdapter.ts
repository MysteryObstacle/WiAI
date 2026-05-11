import {
  browserCommandSchema,
  mapBrowserCommandToIntent,
  type ActorContext,
  type CommandIntent
} from "@wiai/schema";

export function parseRoomMessage(
  type: string,
  payload: unknown,
  actor: ActorContext
): CommandIntent {
  const parsed = browserCommandSchema.parse({
    type,
    payload: payload ?? {}
  });

  return mapBrowserCommandToIntent(parsed, actor);
}
