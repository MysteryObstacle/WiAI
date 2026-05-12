"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";
import type { RoundCopy } from "../promoContent";

export function HowItPlaysSection() {
  const t = useTranslations("lobby.promo.howItPlays");
  const ref = useSectionReveal<HTMLElement>();
  const rounds = t.raw("rounds") as RoundCopy[];
  const youLabel = t("you");

  return (
    <section
      ref={ref}
      data-promo-section="how-it-plays"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(48px,8vh,96px)] sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">
        [02:30]
      </span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">
        05 / HOW IT PLAYS
      </span>
      <h2
        data-reveal
        className="mb-6 text-base font-bold uppercase tracking-[0.18em] text-foreground sm:text-lg"
      >
        {t("label")}
      </h2>
      <div className="space-y-6">
        {rounds.map((round) => (
          <div
            key={round.num}
            data-reveal
            className="grid gap-4 border-b border-foreground/10 pb-6 last:border-b-0 last:pb-0 sm:grid-cols-[120px_1fr]"
          >
            <div>
              <p className="text-2xl font-extrabold tracking-[0.06em] text-foreground/85">
                {round.num}
              </p>
              <p className="mt-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-foreground/65">
                {round.lab}
              </p>
              <p className="mt-1 text-[0.56rem] uppercase tracking-[0.12em] text-foreground/35">
                {round.hint}
              </p>
            </div>
            <div className="rounded-md border border-foreground/10 bg-foreground/5 p-3">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-sky-300/70">
                ▸ {round.prompt}
              </p>
              <ul className="mt-2 space-y-1.5">
                {round.messages.map((message, index) => (
                  <li
                    key={`${round.num}-${index}`}
                    className={`rounded-[5px] border px-2 py-1 text-xs leading-relaxed sm:text-sm ${
                      message.suspect
                        ? "border-rose-300/30 bg-rose-300/10"
                        : message.isMe
                          ? "border-sky-300/30 bg-sky-300/10"
                          : "border-foreground/10 bg-foreground/5"
                    }`}
                  >
                    <span className="mr-2 text-[0.58rem] uppercase tracking-[0.12em] text-foreground/50">
                      {message.who}
                      {message.isMe ? ` · ${youLabel}` : ""}
                    </span>
                    {message.body}
                  </li>
                ))}
              </ul>
              {round.closing ? (
                <p className="mt-2 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-sky-300/70">
                  {round.closing}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
