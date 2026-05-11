import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";

export class LobbyPlayerState extends Schema {
  @type("string") id = "";
  @type("string") nickname = "";
  @type("boolean") isHost = false;
  @type("boolean") isReady = false;
  @type("string") status = "online";
}

export class SessionPlayerState extends Schema {
  @type("string") id = "";
  @type("string") lobbyPlayerId = "";
  @type("number") gameNumber = 0;
  @type("string") displayName = "";
  @type("string") playerType = "human";
  @type("string") role = "";
  @type("string") controlMode = "player";
  @type("boolean") isActive = true;
}

export class AnswerState extends Schema {
  @type("string") id = "";
  @type("number") roundIndex = 0;
  @type("string") sessionPlayerId = "";
  @type("string") content = "";
  @type("string") submittedAt = "";
}

export class ChatMessageState extends Schema {
  @type("string") id = "";
  @type("number") roundIndex = 0;
  @type("string") sessionPlayerId = "";
  @type("string") content = "";
  @type("string") createdAt = "";
}

export class BallotState extends Schema {
  @type("string") id = "";
  @type("number") roundIndex = 0;
  @type("string") actorSessionPlayerId = "";
  @type("string") ballotType = "";
  @type("string") targetSessionPlayerId = "";
  @type("boolean") abstain = false;
}

export class QuestionState extends Schema {
  @type("number") roundIndex = -1;
  @type("string") kind = "";
  @type("string") prompt = "";
}

export class ResultState extends Schema {
  @type("string") winnerSide = "";
  @type("string") frozenSessionPlayerId = "";
}

export class WiaiState extends Schema {
  @type("string") roomId = "";
  @type("string") roomCode = "";
  @type("string") status = "lobby";
  @type("string") phase = "lobby";
  @type("number") phaseVersion = 0;
  @type("number") roundIndex = -1;
  @type("number") phaseEndsAt = 0;
  @type({ map: LobbyPlayerState }) lobbyPlayers = new MapSchema<LobbyPlayerState>();
  @type({ map: SessionPlayerState }) sessionPlayers = new MapSchema<SessionPlayerState>();
  @type({ map: AnswerState }) answers = new MapSchema<AnswerState>();
  @type({ map: ChatMessageState }) messages = new MapSchema<ChatMessageState>();
  @type({ map: BallotState }) ballots = new MapSchema<BallotState>();
  @type([QuestionState]) questions = new ArraySchema<QuestionState>();
  @type(ResultState) result = new ResultState();
}
