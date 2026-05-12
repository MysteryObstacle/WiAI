"use client";

import { useRef } from "react";
import { HeroSection } from "./sections/HeroSection";
import { PrologueSection } from "./sections/PrologueSection";
import { SessionSection } from "./sections/SessionSection";
import { RolesSection } from "./sections/RolesSection";
import { HowItPlaysSection } from "./sections/HowItPlaysSection";
import { CloserSection } from "./sections/CloserSection";
import { SignatureSection } from "./sections/SignatureSection";
import { useHeroVisibility } from "./useHeroVisibility";

interface LobbyPromoPageProps {
  onStart: () => void;
}

export function LobbyPromoPage({ onStart }: LobbyPromoPageProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const isHeroActive = useHeroVisibility(heroRef);

  return (
    <div className="relative w-full overflow-x-clip bg-background text-foreground">
      <HeroSection ref={heroRef} isHeroActive={isHeroActive} onStart={onStart} />
      <div
        className="relative w-full"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top, oklch(14% 0.012 250) 0%, oklch(8% 0.01 250) 65%)"
        }}
      >
        <PrologueSection />
        <SessionSection />
        <RolesSection />
        <HowItPlaysSection />
        <CloserSection onStart={onStart} />
        <SignatureSection />
      </div>
    </div>
  );
}
