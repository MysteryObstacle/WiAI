"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";
import { Button } from "@/components/ui/button";

interface CloserSectionProps {
  onStart: () => void;
}

export function CloserSection({ onStart }: CloserSectionProps) {
  const t = useTranslations("lobby.promo.closer");
  const ref = useSectionReveal<HTMLElement>();

  return (
    <section
      ref={ref}
      data-promo-section="closer"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(64px,10vh,128px)] text-center sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">
        [02:36]
      </span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">
        06 / CTA
      </span>
      <p
        data-reveal
        className="mx-auto max-w-[680px] text-lg font-extrabold leading-[1.5] tracking-[0.02em] text-foreground sm:text-xl"
      >
        {t("tagline")}
      </p>
      <p data-reveal className="mt-3 text-xs text-foreground/55 sm:text-sm">
        {t("subline")}
      </p>
      <Button
        data-reveal
        size="lg"
        onClick={onStart}
        className="mt-8 h-12 border-foreground/30 bg-foreground px-12 text-base text-background hover:bg-foreground/90"
      >
        ▶ {t("cta")}
      </Button>
    </section>
  );
}
