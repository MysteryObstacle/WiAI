"use client";

import type { FinalRoundCopy, FinalRoundMessage } from "../promoContent";

function messageClass(message: FinalRoundMessage) {
  if (message.suspect) {
    return "border-red-400/45 bg-red-500/10 text-red-50";
  }

  if (message.isMe) {
    return "border-sky-300/35 bg-sky-300/10 text-sky-50";
  }

  if (message.roleHint === "shelterer") {
    return "border-emerald-300/35 bg-emerald-300/10 text-emerald-50";
  }

  return "border-white/12 bg-white/[0.045] text-foreground/80";
}

interface FinalRoundPanelProps {
  round: FinalRoundCopy;
}

export function FinalRoundPanel({ round }: FinalRoundPanelProps) {
  return (
    <div className="w-full max-w-[680px] rounded-md border border-white/12 bg-black/55 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-md sm:p-5">
      <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-red-200/80">
        {round.eyebrow}
      </p>
      <h3 className="mt-3 text-balance text-xl font-bold leading-snug text-foreground sm:text-2xl">
        {round.question}
      </h3>

      <div data-round-beat="answers" className="mt-5 space-y-2">
        {round.answers.map((message) => (
          <p
            key={`answer-${message.who}`}
            className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${messageClass(message)}`}
          >
            <span className="mr-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-foreground/45">
              {message.who}
            </span>
            {message.body}
          </p>
        ))}
      </div>

      <div data-round-beat="discussion" className="mt-5 space-y-2 border-t border-white/10 pt-4">
        {round.discussion.map((message, index) => (
          <p
            key={`discussion-${message.who}-${index}`}
            className={`rounded-md border px-3 py-2 text-sm leading-relaxed ${messageClass(message)}`}
          >
            <span className="mr-2 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-foreground/45">
              {message.who}
            </span>
            {message.body}
          </p>
        ))}
      </div>

      <div
        data-round-beat="vote"
        className="mt-5 rounded-md border border-red-300/35 bg-red-500/15 px-4 py-3"
      >
        <p className="font-mono text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-red-100/75">
          {round.vote.label}
        </p>
        <p className="mt-1 text-lg font-extrabold text-red-50">{round.vote.result}</p>
        <p className="mt-1 text-xs leading-relaxed text-red-50/70">{round.vote.note}</p>
      </div>
    </div>
  );
}
