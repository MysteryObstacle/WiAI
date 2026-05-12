"use client";

import { CinematicScrollStory } from "./CinematicScrollStory";

interface LobbyPromoPageProps {
  onStart: () => void;
}

export function LobbyPromoPage({ onStart }: LobbyPromoPageProps) {
  return (
    <div className="relative w-full overflow-x-clip bg-[#05070b] text-foreground">
      <CinematicScrollStory onStart={onStart} />
    </div>
  );
}
