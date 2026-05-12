export type RoleAccent = "citizen" | "ai" | "shelter";

export interface ConstraintEntry {
  key: "noSearch" | "noProof" | "noExternal";
}

export interface RoleEntry {
  key: "citizen" | "ai" | "shelterer";
  accent: RoleAccent;
  headcount: number;
}

export interface PromoContent {
  session: {
    constraints: ConstraintEntry[];
  };
  roles: RoleEntry[];
  howItPlays: {
    roundCount: 3;
    minMessagesPerRound: 2;
  };
  signature: {
    systemLineCount: 3;
  };
}

export const promoContent: PromoContent = {
  session: {
    constraints: [
      { key: "noSearch" },
      { key: "noProof" },
      { key: "noExternal" }
    ]
  },
  roles: [
    { key: "citizen", accent: "citizen", headcount: 4 },
    { key: "ai", accent: "ai", headcount: 1 },
    { key: "shelterer", accent: "shelter", headcount: 1 }
  ],
  howItPlays: {
    roundCount: 3,
    minMessagesPerRound: 2
  },
  signature: {
    systemLineCount: 3
  }
};

export interface RoundMessage {
  who: string;
  body: string;
  suspect?: boolean;
  isMe?: boolean;
}

export interface RoundCopy {
  num: string;
  lab: string;
  hint: string;
  prompt: string;
  messages: RoundMessage[];
  closing?: string;
}
