import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  lead: string;
  tone?: "pals" | "tiers" | "breeding";
  children?: ReactNode;
};

export function CompanionIntro({
  eyebrow = "Companion",
  title,
  lead,
  tone = "pals",
  children,
}: Props) {
  return (
    <header className={`companion-intro companion-intro--${tone}`}>
      <div className="companion-intro__glow" aria-hidden />
      <p className="companion-intro__eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="companion-intro__lead">{lead}</p>
      {children}
    </header>
  );
}
