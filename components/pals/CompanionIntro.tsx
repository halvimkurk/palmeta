"use client";

/* eslint-disable @next/next/no-img-element -- avoids next/image fill hydration mismatches */

import type { ReactNode } from "react";
import { companionArtFor, type CompanionArtTone } from "@/lib/companion-art";

type Props = {
  eyebrow?: string;
  title: string;
  lead: string;
  tone?: CompanionArtTone;
  children?: ReactNode;
};

export function CompanionIntro({
  eyebrow = "Companion",
  title,
  lead,
  tone = "pals",
  children,
}: Props) {
  const art = companionArtFor(tone);

  return (
    <header className={`companion-intro companion-intro--${tone}`}>
      <div className="companion-intro__glow" aria-hidden />
      <div className="companion-intro__mesh" aria-hidden />
      <div className="companion-intro__inner">
        <div className="companion-intro__copy">
          <p className="companion-intro__eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="companion-intro__lead">{lead}</p>
          {children}
        </div>
        <div className="companion-intro__art" aria-hidden>
          {/* Plain img avoids next/image fill hydration mismatches in client trees. */}
          <img
            src={art.src}
            alt=""
            className="companion-intro__art-img"
            style={{ objectPosition: art.objectPosition }}
            decoding="async"
            fetchPriority="high"
          />
          <div className="companion-intro__art-shade" />
        </div>
      </div>
    </header>
  );
}
