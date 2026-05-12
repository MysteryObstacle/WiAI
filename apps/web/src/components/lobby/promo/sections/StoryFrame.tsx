"use client";

import type { ReactNode } from "react";

interface StoryFrameProps {
  stage: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function StoryFrame({
  stage,
  eyebrow,
  title,
  children,
  className = ""
}: StoryFrameProps) {
  return (
    <section
      data-story-stage={stage}
      className={`relative flex min-h-dvh w-full items-center overflow-hidden px-5 py-20 sm:px-8 lg:px-12 ${className}`}
    >
      <div className="relative z-10 mx-auto grid w-full max-w-[1180px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <header className="max-w-[620px]">
          {eyebrow ? (
            <p className="mb-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-foreground/45">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-balance text-2xl font-extrabold leading-tight text-foreground sm:text-4xl">
              {title}
            </h2>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  );
}
