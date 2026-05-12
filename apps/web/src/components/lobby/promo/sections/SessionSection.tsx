"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";
import { promoContent } from "../promoContent";

export function SessionSection() {
  const t = useTranslations("lobby.promo.session");
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      data-promo-section="session"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(48px,8vh,96px)] sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">
        [02:22]
      </span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">
        03 / SESSION
      </span>
      <h2
        data-reveal
        className="mb-3 text-base font-bold uppercase tracking-[0.18em] text-foreground sm:text-lg"
      >
        {t("label")}
      </h2>
      <p
        data-reveal
        className="mb-6 max-w-[680px] text-sm leading-relaxed text-foreground/70 sm:text-base"
      >
        {t("intro")}
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {promoContent.session.constraints.map((entry) => (
          <div
            key={entry.key}
            data-reveal
            className="border-l-2 border-foreground/25 pl-4"
          >
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-foreground">
              {t(`constraints.${entry.key}.title`)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/60 sm:text-sm">
              {t(`constraints.${entry.key}.body`)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
