/** Small geometric glyphs for sidebar / drawer nav. */
import type { ReactNode } from "react";

type Props = {
  name: string;
  className?: string;
};

const PATHS: Record<string, ReactNode> = {
  all: (
    <>
      <path d="M5 7h14M5 12h14M5 17h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  news: (
    <>
      <rect
        x="5"
        y="5"
        width="14"
        height="14"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M8 9h8M8 12h8M8 15h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  teams: (
    <>
      <circle cx="8" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="16" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="16" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.75" />
    </>
  ),
  pals: (
    <>
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 4.5v3M12 16.5v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  tiers: (
    <>
      <path
        d="M6 17h12M8 13h8M9.5 9h5M11 5h2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </>
  ),
  eggs: (
    <>
      <ellipse
        cx="12"
        cy="13"
        rx="5.5"
        ry="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M9.5 11.5c1 .8 3.5.8 4.5 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  blues: (
    <>
      <rect
        x="5"
        y="4"
        width="14"
        height="16"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16.5" cy="7" r="2.2" fill="currentColor" />
    </>
  ),
  map: (
    <>
      <path
        d="M5 7.5 9.5 5.5 14.5 8 19 5.5v13L14.5 16 9.5 18.5 5 16.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.5" r="1.6" fill="currentColor" />
    </>
  ),
};

export function NavIcon({ name, className = "" }: Props) {
  const glyph = PATHS[name] ?? PATHS.all;
  return (
    <svg
      className={`side-link__icon ${className}`}
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
