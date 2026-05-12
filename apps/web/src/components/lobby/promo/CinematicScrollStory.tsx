"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useHeroVisibility } from "./useHeroVisibility";
import { useReducedMotion } from "./useReducedMotion";
import { promoAssets, promoContent, type FinalRoundCopy } from "./promoContent";
import { ArchiveSignature } from "./sections/ArchiveSignature";
import { EvidenceImageLayer } from "./sections/EvidenceImageLayer";
import { FinalRoundPanel } from "./sections/FinalRoundPanel";
import { HeroSection } from "./sections/HeroSection";
import { StoryFrame } from "./sections/StoryFrame";

gsap.registerPlugin(ScrollTrigger);

interface CinematicScrollStoryProps {
  onStart: () => void;
}

function useDesktopStory() {
  const [isDesktopStory, setIsDesktopStory] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktopStory(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isDesktopStory;
}

function assetByKey(key: (typeof promoAssets)[number]["key"]) {
  const asset = promoAssets.find((entry) => entry.key === key);
  if (!asset) {
    throw new Error(`Missing promo asset: ${key}`);
  }
  return asset;
}

export function CinematicScrollStory({ onStart }: CinematicScrollStoryProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isDesktopStory = useDesktopStory();
  const isHeroActive = useHeroVisibility(heroRef);
  const tPrologue = useTranslations("lobby.promo.prologue");
  const tSession = useTranslations("lobby.promo.session");
  const tHow = useTranslations("lobby.promo.howItPlays");
  const tCloser = useTranslations("lobby.promo.closer");
  const prologueLines = tPrologue.raw("lines") as string[];
  const round = tHow.raw("decisiveRound") as FinalRoundCopy;
  const shouldPin = isDesktopStory && !reducedMotion;

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin || !shouldPin) return;

    const ctx = gsap.context(() => {
      const hero = pin.querySelector<HTMLElement>('[data-story-layer="hero"]');
      const prologue = pin.querySelector<HTMLElement>('[data-story-layer="prologue"]');
      const session = pin.querySelector<HTMLElement>('[data-story-layer="session"]');
      const roundLayer = pin.querySelector<HTMLElement>('[data-story-layer="round"]');
      const vote = pin.querySelector<HTMLElement>('[data-story-layer="vote"]');
      const cta = pin.querySelector<HTMLElement>('[data-story-layer="cta"]');
      const archive = pin.querySelector<HTMLElement>('[data-story-layer="archive"]');
      const papers = pin.querySelectorAll<HTMLElement>("[data-evidence-paper]");
      const redMarks = pin.querySelectorAll<HTMLElement>("[data-red-mark]");
      const roundBeats = pin.querySelectorAll<HTMLElement>("[data-round-beat]");
      const archiveLines = pin.querySelectorAll<HTMLElement>("[data-archive-line]");
      const archiveSignature = pin.querySelector<HTMLElement>("[data-archive-signature]");

      gsap.set([prologue, session, roundLayer, vote, cta, archive], { autoAlpha: 0 });
      gsap.set(papers, { autoAlpha: 0, y: 80, rotate: -4, scale: 0.9 });
      gsap.set(redMarks, { autoAlpha: 0, scale: 0.8, rotate: -8 });
      gsap.set(roundBeats, { autoAlpha: 0, y: 18 });
      gsap.set(archiveLines, { autoAlpha: 0, y: 10 });
      gsap.set(archiveSignature, { autoAlpha: 0, y: 16 });

      const layerFade = 0.02;
      const paperReveal = 0.04;
      const copyReveal = 0.05;

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.8,
            pin,
            anticipatePin: 1
          }
        })
        .to(
          hero,
          { scale: 1.04, filter: "blur(1.2px)", autoAlpha: 0.42, duration: 0.18 },
          0.08
        )
        .to("[data-hero-copy]", { autoAlpha: 0, y: -14, duration: 0.08 }, 0.08)
        .to(prologue, { autoAlpha: 1, duration: layerFade }, 0.14)
        .fromTo(
          "[data-prologue-line]",
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: copyReveal, stagger: 0.04 },
          0.18
        )
        .to(prologue, { autoAlpha: 0, y: -30, duration: layerFade }, 0.34)
        .to(session, { autoAlpha: 1, duration: layerFade }, 0.37)
        .to(
          '[data-evidence-paper="verification"]',
          { autoAlpha: 1, y: 0, rotate: 2, scale: 1, duration: paperReveal },
          0.38
        )
        .to(session, { autoAlpha: 0, y: -32, duration: layerFade }, 0.52)
        .to(roundLayer, { autoAlpha: 1, duration: layerFade }, 0.55)
        .to(
          '[data-evidence-paper="memory"]',
          { autoAlpha: 1, y: 0, rotate: -2, scale: 1, duration: paperReveal },
          0.56
        )
        .to(roundBeats, { autoAlpha: 1, y: 0, duration: 0.035, stagger: 0.02 }, 0.59)
        .to(roundLayer, { autoAlpha: 0, y: -26, duration: layerFade }, 0.7)
        .to(vote, { autoAlpha: 1, duration: layerFade }, 0.74)
        .to(
          '[data-evidence-paper="vote"]',
          { autoAlpha: 1, y: 0, rotate: 1, scale: 1.04, duration: paperReveal },
          0.75
        )
        .to(redMarks, { autoAlpha: 1, scale: 1, rotate: 0, duration: 0.035, stagger: 0.025 }, 0.78)
        .to(vote, { autoAlpha: 0, scale: 1.04, duration: layerFade }, 0.82)
        .to(cta, { autoAlpha: 1, duration: layerFade }, 0.85)
        .to(cta, { autoAlpha: 0, y: -20, duration: layerFade }, 0.91)
        .to(archive, { autoAlpha: 1, duration: layerFade }, 0.94)
        .to(archiveLines, { autoAlpha: 1, y: 0, duration: 0.035, stagger: 0.025 }, 0.95)
        .to(archiveSignature, { autoAlpha: 1, y: 0, duration: 0.04 }, 0.98);
    }, pin);

    return () => ctx.revert();
  }, [shouldPin]);

  const verificationAsset = assetByKey("verificationGrid");
  const memoryAsset = assetByKey("memoryAnswerSheet");
  const voteAsset = assetByKey("voteFreezeSheet");

  return (
    <div
      ref={rootRef}
      className={shouldPin ? "relative h-[720dvh] bg-[#05070b]" : "relative bg-[#05070b]"}
    >
      <div ref={pinRef} className="relative min-h-dvh overflow-hidden bg-[#05070b] text-foreground">
        <div data-story-layer="hero" className={shouldPin ? "absolute inset-0" : "relative"}>
          <HeroSection ref={heroRef} storyMode isHeroActive={isHeroActive} onStart={onStart} />
        </div>

        <div data-story-layer="prologue" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame stage="prologue" eyebrow={tPrologue("label")} className="bg-transparent">
            <div className="space-y-3 lg:col-span-2 lg:max-w-[780px]">
              {prologueLines.map((line, index) => (
                <p
                  key={line}
                  data-prologue-line
                  className={`text-balance text-xl leading-relaxed sm:text-3xl ${
                    index >= 2 ? "font-bold text-foreground" : "text-foreground/68"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="session" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame
            stage="session"
            eyebrow="Human Verification Session"
            title={tSession("intro")}
          >
            <div className="space-y-5">
              <div data-evidence-paper="verification">
                <EvidenceImageLayer
                  asset={verificationAsset}
                  priority
                  className="mx-auto max-w-[680px]"
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {promoContent.session.constraints.map((entry) => (
                  <p
                    key={entry.key}
                    className="rounded-md border border-white/12 bg-white/[0.045] px-3 py-2 text-sm font-semibold text-foreground/75"
                  >
                    {tSession(`constraints.${entry.key}.title`)}
                  </p>
                ))}
              </div>
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="round" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame stage="decisive-round" eyebrow={tHow("label")} title={round.eyebrow}>
            <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr] xl:items-center">
              <div data-evidence-paper="memory">
                <EvidenceImageLayer asset={memoryAsset} className="mx-auto max-w-[560px]" />
              </div>
              <FinalRoundPanel round={round} />
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="vote" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame stage="vote-freeze" eyebrow={round.vote.label} title={round.vote.result}>
            <div data-evidence-paper="vote" className="relative mx-auto w-full max-w-[720px]">
              <EvidenceImageLayer asset={voteAsset} />
              <div
                data-red-mark
                className="absolute left-[19%] top-[18%] h-[24%] w-[34%] rounded-[50%] border-[12px] border-red-500/80"
              />
              <div
                data-red-mark
                className="absolute bottom-[15%] right-[12%] h-[26%] w-[38%] -rotate-6 rounded-[50%] border-[12px] border-red-500/75"
              />
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="cta" className={shouldPin ? "absolute inset-0" : "relative"}>
          <StoryFrame stage="cta" title={tCloser("tagline")} className="text-center">
            <div className="lg:col-span-2">
              <p className="mx-auto max-w-[660px] text-sm leading-relaxed text-foreground/58 sm:text-base">
                {tCloser("subline")}
              </p>
              <Button
                size="lg"
                onClick={onStart}
                className="mt-8 h-12 border-foreground/30 bg-foreground px-12 text-base text-background hover:bg-foreground/90"
              >
                {tCloser("cta")}
              </Button>
            </div>
          </StoryFrame>
        </div>

        <div data-story-layer="archive" className={shouldPin ? "absolute inset-0" : "relative"}>
          <ArchiveSignature />
        </div>
      </div>
    </div>
  );
}
