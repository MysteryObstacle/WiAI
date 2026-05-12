"use client";

import { useTranslations } from "next-intl";
import { promoAssets } from "../promoContent";
import { EvidenceImageLayer } from "./EvidenceImageLayer";

export function ArchiveSignature() {
  const t = useTranslations("lobby.promo.signature");
  const systemLines = t.raw("systemLines") as string[];
  const archiveAsset = promoAssets.find((asset) => asset.key === "archiveResidue");

  if (!archiveAsset) {
    return null;
  }

  return (
    <section
      data-story-stage="archive"
      className="relative isolate flex min-h-dvh items-center overflow-hidden bg-[#020306] px-5 py-20 text-emerald-100 sm:px-8 lg:px-12"
    >
      <div className="absolute inset-0 opacity-35">
        <EvidenceImageLayer
          asset={archiveAsset}
          className="absolute left-1/2 top-1/2 w-[min(980px,135vw)] -translate-x-1/2 -translate-y-1/2"
          imageClassName="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,3,6,0.28)_45%,rgba(2,3,6,0.92)_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[720px] font-mono">
        <header className="mb-5 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.18em] text-emerald-100/55">
          <span>{t("channel")}</span>
          <span>{t("status")}</span>
        </header>

        <div className="rounded-md border border-emerald-200/15 bg-black/70 p-5 shadow-[0_0_70px_rgba(16,185,129,0.1)] backdrop-blur-sm">
          {systemLines.map((line) => (
            <p key={line} data-archive-line className="text-sm leading-relaxed text-emerald-100/62">
              {line}
            </p>
          ))}
          <p
            data-archive-signature
            className="mt-5 text-xl font-bold tracking-[0.02em] text-emerald-50 sm:text-3xl"
          >
            <span className="mr-2 text-emerald-100/50">{t("attribution")} :</span>
            {t("line")}
          </p>
        </div>
      </div>
    </section>
  );
}
