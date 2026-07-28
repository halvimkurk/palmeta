import type { ReactNode } from "react";

export type StatIconId =
  | "hp"
  | "melee"
  | "shot"
  | "defense"
  | "support"
  | "stamina"
  | "runSpeed"
  | "rideSprintSpeed";

const PATHS: Record<StatIconId, ReactNode> = {
  hp: (
    <path d="M8 13.4C5.1 11 2.7 8.8 2.7 6.4 2.7 4.6 4 3.2 5.7 3.2c.9 0 1.8.4 2.3 1.2.5-.8 1.4-1.2 2.3-1.2 1.7 0 3 1.4 3 3.2 0 2.4-2.4 4.6-5.3 7Z" />
  ),
  melee: (
    <>
      <path d="M13 3 6.5 9.5" />
      <path d="M13 3h-2.6M13 3v2.6" />
      <path d="m5.4 8.4 2.2 2.2" />
      <path d="M6.5 9.5 4 12" />
    </>
  ),
  shot: (
    <>
      <circle cx="8" cy="8" r="4.2" />
      <path d="M8 1.6v2.2M8 12.2v2.2M1.6 8h2.2M12.2 8h2.2" />
    </>
  ),
  defense: (
    <path d="M8 2 3.2 3.9v3.9c0 2.9 2 4.9 4.8 6 2.8-1.1 4.8-3.1 4.8-6V3.9L8 2Z" />
  ),
  support: (
    <>
      <circle cx="8" cy="8" r="5.4" />
      <path d="M8 5.6v4.8M5.6 8h4.8" />
    </>
  ),
  stamina: <path d="M9.2 2 4.2 9h3.2L6.8 14l5-7H8.6L9.2 2Z" />,
  runSpeed: (
    <>
      <path d="m3.5 4 4 4-4 4" />
      <path d="m8.5 4 4 4-4 4" />
    </>
  ),
  rideSprintSpeed: (
    <>
      <path d="M2 5.2h6.8a1.9 1.9 0 1 0-1.9-1.9" />
      <path d="M2 8.2h9.6a1.9 1.9 0 1 1-1.9 1.9" />
      <path d="M2 11.2h4.6" />
    </>
  ),
};

type Props = {
  id: StatIconId;
  size?: number;
  className?: string;
};

/** Tiny stroke icon for pal stat rows (HP, attack, defense, ...). */
export function StatIcon({ id, size = 14, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`stat-icon ${className}`}
    >
      {PATHS[id]}
    </svg>
  );
}
