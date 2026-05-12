"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";

export function SignatureSection() {
  const t = useTranslations("lobby.promo.signature");
  const ref = useSectionReveal<HTMLElement>({ staggerSec: 0.2 });
  const systemLines = t.raw("systemLines") as string[];

  return (
    <section
      ref={ref}
      data-promo-section="signature"
      className="relative mx-auto w-full max-w-[680px] px-6 pb-[clamp(80px,12vh,160px)] pt-[clamp(40px,6vh,72px)] font-mono sm:px-10"
    >
      <header className="mb-4 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.18em] text-emerald-200/65">
        <span>$ {t("channel")}</span>
        <span>{t("status")}</span>
      </header>
      <div className="space-y-2 rounded-md border border-emerald-300/15 bg-[#04130b]/85 px-5 py-4 shadow-[0_0_18px_rgba(16,185,129,0.08)]">
        {systemLines.map((line, index) => (
          <p
            key={index}
            data-reveal
            className="text-xs leading-relaxed text-emerald-200/70 sm:text-sm"
          >
            {line}
          </p>
        ))}
        <p
          data-reveal
          className="pt-2 text-base font-bold tracking-[0.04em] text-emerald-200 sm:text-lg"
        >
          {t("attribution")} : {t("line")}
        </p>
      </div>
    </section>
  );
}
