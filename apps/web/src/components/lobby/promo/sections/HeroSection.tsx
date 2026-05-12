"use client";

import { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { LobbyBackdrop } from "../../LobbyBackdrop";
import { LobbyIntelOverlay } from "../../LobbyIntelOverlay";
import { BrandMark, PageHeader, PageTitle } from "@/components/layout/PageHeader";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  isHeroActive: boolean;
  onStart: () => void;
}

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection({ isHeroActive, onStart }, ref) {
    const t = useTranslations("lobby.promo.hero");
    const tApp = useTranslations("app");

    return (
      <section
        ref={ref}
        aria-label={tApp("title")}
        className="relative isolate min-h-dvh w-full overflow-hidden"
        data-promo-section="hero"
      >
        <LobbyBackdrop isActive={isHeroActive} />
        <LobbyIntelOverlay isActive={isHeroActive} />

        <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-between p-4 sm:p-6">
          <div className="pointer-events-auto">
            <PageHeader className="mb-0">
              <BrandMark />
              <PageTitle
                className="sr-only"
                title={tApp("heroTitle")}
                description={tApp("description")}
              />
            </PageHeader>
          </div>
          <div className="pointer-events-auto">
            <LanguageSwitch />
          </div>
        </div>

        <p className="pointer-events-none absolute left-1/2 top-[32%] z-10 max-w-[calc(100vw-2rem)] -translate-x-1/2 whitespace-nowrap text-center text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-foreground/75 sm:top-[33%] sm:text-xs">
          {t("subtitle")}
        </p>

        <Button
          size="lg"
          onClick={onStart}
          className="absolute left-1/2 top-[59%] z-10 h-11 -translate-x-1/2 border-foreground/30 bg-foreground px-8 text-background hover:bg-foreground/90 sm:top-[58%]"
        >
          Start
        </Button>

        <p className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-[0.58rem] font-medium uppercase tracking-[0.24em] text-foreground/45">
          ▾ {t("scrollHint")}
        </p>
      </section>
    );
  }
);
