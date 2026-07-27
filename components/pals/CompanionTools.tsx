"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOL_NAV } from "@/lib/nav";

export function CompanionTools() {
  const pathname = usePathname();

  return (
    <nav className="companion-tools" aria-label="Companion tools">
      {TOOL_NAV.map((t) => {
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
