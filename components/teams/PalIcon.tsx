"use client";

import Image from "next/image";
import { useState } from "react";
import type { Pal } from "@/lib/teams/types";
import { getPalIconSrc } from "@/lib/teams/icons";

type Props = {
  pal: Pick<Pal, "slug" | "name" | "elements">;
  size?: number;
  className?: string;
  priority?: boolean;
  /** When set, image is meaningful (e.g. pal detail portrait). */
  decorative?: boolean;
};

export function PalIcon({
  pal,
  size = 64,
  className = "",
  priority = false,
  decorative = true,
}: Props) {
  const [failed, setFailed] = useState(false);
  const src = getPalIconSrc(pal.slug);
  const el = pal.elements[0] ?? "normal";
  const alt = decorative ? "" : pal.name;

  if (failed) {
    return (
      <span
        className={`pal-icon pal-icon--fallback el-${el} ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        {pal.name.slice(0, 1)}
      </span>
    );
  }

  return (
    <span
      className={`pal-icon ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        className="pal-icon__img"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        onError={() => setFailed(true)}
      />
    </span>
  );
}
