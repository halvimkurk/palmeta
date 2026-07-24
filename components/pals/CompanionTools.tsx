"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TOOLS = [
  { href: "/pals", match: "/pals", label: "Paldeck", hint: "Browse & filter" },
  { href: "/tiers?role=combat", match: "/tiers", label: "Tiers", hint: "Role picks" },
  { href: "/breeding", match: "/breeding", label: "Breeding", hint: "Eggs & parents" },
  { href: "/teams", match: "/teams", label: "Teams", hint: "Party of 5" },
] as const;

export function CompanionTools() {
  const pathname = usePathname();

  return (
    <nav className="companion-tools" aria-label="Companion tools">
      {TOOLS.map((t) => {
        const active = pathname.startsWith(t.match);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`companion-tools__item ${active ? "is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="companion-tools__label">{t.label}</span>
            <span className="companion-tools__hint">{t.hint}</span>
          </Link>
        );
      })}
    </nav>
  );
}
