"use client";

import { useTranslations } from "next-intl";
import { useSectionReveal } from "../useSectionReveal";
import { promoContent, type RoleAccent } from "../promoContent";

const ACCENT_CLASS: Record<RoleAccent, string> = {
  citizen: "border-l-[3px] border-l-sky-300/60",
  ai: "border-l-[3px] border-l-rose-300/60",
  shelter: "border-l-[3px] border-l-emerald-300/60"
};

export function RolesSection() {
  const t = useTranslations("lobby.promo.roles");
  const ref = useSectionReveal<HTMLElement>({ staggerSec: 0.12 });

  return (
    <section
      ref={ref}
      data-promo-section="roles"
      className="relative mx-auto w-full max-w-[920px] px-6 py-[clamp(48px,8vh,96px)] sm:px-10"
    >
      <span className="pointer-events-none absolute left-2 top-3 text-[0.58rem] font-medium uppercase tracking-[0.16em] text-foreground/30">
        [02:26]
      </span>
      <span className="pointer-events-none absolute right-3 top-3 text-[0.58rem] font-medium uppercase tracking-[0.18em] text-foreground/35">
        04 / ROLES
      </span>
      <h2
        data-reveal
        className="mb-6 text-base font-bold uppercase tracking-[0.18em] text-foreground sm:text-lg"
      >
        {t("label")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {promoContent.roles.map((role) => (
          <article
            key={role.key}
            data-reveal
            className={`rounded-md border border-foreground/10 bg-foreground/5 p-4 ${ACCENT_CLASS[role.accent]}`}
          >
            <header>
              <p className="text-lg font-extrabold uppercase tracking-[0.12em] text-foreground sm:text-xl">
                {t(`${role.key}.name`)}
              </p>
              <p className="mt-1 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-foreground/55">
                {t(`${role.key}.count`)}
              </p>
            </header>
            <p className="mt-3 text-xs leading-relaxed text-foreground/75 sm:text-sm">
              {t(`${role.key}.objective`)}
            </p>
            <p className="mt-4 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-foreground/85">
              <span className="mr-1 text-foreground/40">WIN</span>
              {t(`${role.key}.win`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
