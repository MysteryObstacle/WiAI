"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";

export function PrologueSection() {
  const t = useTranslations("lobby.promo.prologue");
  const ref = useSectionReveal<HTMLElement>({ staggerSec: 0.18 });
  const lines = t.raw("lines") as string[];

  return (
    <section
      ref={ref}
      data-promo-section="prologue"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(48px,8vh,96px)] sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">
        [02:18]
      </span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">
        02 / PROLOGUE
      </span>
      <p
        data-reveal
        className="mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/65"
      >
        {t("label")}
      </p>
      <div className="space-y-2 pl-12 sm:pl-20">
        {lines.map((line, index) => (
          <p
            key={index}
            data-reveal
            className={
              index < 2
                ? "text-base text-foreground/65 sm:text-lg"
                : "text-base font-semibold text-foreground sm:text-lg"
            }
          >
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
