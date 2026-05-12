export type RoleAccent = "citizen" | "ai" | "shelter";
export type PromoAssetKey =
  | "verificationGrid"
  | "memoryAnswerSheet"
  | "voteFreezeSheet"
  | "archiveResidue";

export interface ConstraintEntry {
  key: "noSearch" | "noProof" | "noExternal";
}

export interface RoleEntry {
  key: "citizen" | "ai" | "shelterer";
  accent: RoleAccent;
  headcount: number;
}

export interface FinalRoundMessage {
  who: string;
  body: string;
  suspect?: boolean;
  isMe?: boolean;
  roleHint?: "shelterer" | "accuser";
}

export interface FinalRoundCopy {
  eyebrow: string;
  question: string;
  answers: FinalRoundMessage[];
  discussion: FinalRoundMessage[];
  vote: {
    label: string;
    result: string;
    note: string;
  };
}

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

export interface PromoContent {
  session: {
    constraints: ConstraintEntry[];
  };
  roles: RoleEntry[];
  howItPlays: {
    certificationRoundCount: 3;
    visibleRoundLabels: [];
    decisiveRound: {
      answerCount: 4;
      discussionCount: 4;
      hasSheltererMisdirection: true;
    };
  };
  signature: {
    systemLineCount: 2;
  };
}

export interface PromoAsset {
  key: PromoAssetKey;
  src: `/promo/${string}.png`;
  altKey: PromoAssetKey;
}

export const promoAssets: PromoAsset[] = [
  {
    key: "verificationGrid",
    src: "/promo/verification-grid.png",
    altKey: "verificationGrid"
  },
  {
    key: "memoryAnswerSheet",
    src: "/promo/memory-answer-sheet.png",
    altKey: "memoryAnswerSheet"
  },
  {
    key: "voteFreezeSheet",
    src: "/promo/vote-freeze-sheet.png",
    altKey: "voteFreezeSheet"
  },
  {
    key: "archiveResidue",
    src: "/promo/archive-residue.png",
    altKey: "archiveResidue"
  }
];

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
    certificationRoundCount: 3,
    visibleRoundLabels: [],
    decisiveRound: {
      answerCount: 4,
      discussionCount: 4,
      hasSheltererMisdirection: true
    }
  },
  signature: {
    systemLineCount: 2
  }
};
