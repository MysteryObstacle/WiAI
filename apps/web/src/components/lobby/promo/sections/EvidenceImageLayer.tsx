"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { PromoAsset } from "../promoContent";

interface EvidenceImageLayerProps {
  asset: PromoAsset;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
}

export function EvidenceImageLayer({
  asset,
  priority = false,
  className = "",
  imageClassName = ""
}: EvidenceImageLayerProps) {
  const t = useTranslations("lobby.promo.assets");

  return (
    <figure className={`pointer-events-none relative aspect-[4/3] w-full ${className}`}>
      <Image
        src={asset.src}
        alt={t(asset.altKey)}
        fill
        priority={priority}
        sizes="(max-width: 768px) 92vw, 58vw"
        className={`object-contain drop-shadow-[0_28px_80px_rgba(0,0,0,0.55)] ${imageClassName}`}
      />
    </figure>
  );
}
