"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { NavIcon } from "@/components/layout/NavIcons";

type Props = {
  children: React.ReactNode;
};

const NAV_LINKS = [
  { href: "/tiers?role=combat", match: "/tiers", label: "Tier list", icon: "tiers" },
  { href: "/breeding", match: "/breeding", label: "Breeding", icon: "eggs" },
  { href: "/teams", match: "/teams", label: "Teams", icon: "teams" },
  { href: "/pals", match: "/pals", label: "Paldeck", icon: "pals" },
  { href: "/blues", match: "/blues", label: "Dev notes", icon: "blues" },
  { href: "/news", match: "/news", label: "News", icon: "news" },
] as const;

function isActive(pathname: string, match: string) {
  return pathname === match || pathname.startsWith(`${match}/`) || pathname.startsWith(`${match}?`);
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerId = useId();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  function NavBody({ onNavigate }: { onNavigate?: () => void }) {
    return (
      <>
        <p className="side-nav__label">Toolkit</p>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.match}
            href={link.href}
            className={isActive(pathname, link.match) ? "side-link is-active" : "side-link"}
            onClick={onNavigate}
          >
            <NavIcon name={link.icon} />
            {link.label}
          </Link>
        ))}
      </>
    );
  }

  const isHome = pathname === "/";

  return (
    <div className={`app-frame${isHome ? " is-home" : ""}`}>
      <aside className="sidebar" aria-label="Site">
        <Link href="/" className="sidebar__brand">
          <BrandLogo size="sm" />
        </Link>
        <nav className="side-nav" aria-label="Primary">
          <NavBody />
        </nav>
        <p className="sidebar__foot">Unofficial Palworld toolkit</p>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <button
            type="button"
            className="topbar__menu"
            aria-expanded={drawerOpen}
            aria-controls={drawerId}
            onClick={() => setDrawerOpen(true)}
          >
            <span className="topbar__burger" aria-hidden />
            Menu
          </button>
          <Link href="/" className="brand-logo-link brand-logo-link--mobile">
            <BrandLogo size="sm" showWordmark={false} />
          </Link>
          <Link href="/tiers?role=combat" className="topbar__cta">
            Tier list
          </Link>
        </header>

        <main className="shell-main__content">{children}</main>

        <footer className={`site-footer${isHome ? " site-footer--home" : ""}`}>
          <span>Palworld Meta — tier lists, breeding &amp; teams</span>
          <Link href="/tiers?role=combat">Tiers</Link>
          <Link href="/breeding">Breeding</Link>
          <Link href="/teams">Teams</Link>
          <Link href="/pals">Paldeck</Link>
          <Link href="/blues">Dev notes</Link>
          <Link href="/news">News</Link>
          <Link href="/privacy">Privacy</Link>
        </footer>
      </div>

      <div
        className={`drawer-root ${drawerOpen ? "is-open" : ""}`}
        aria-hidden={!drawerOpen}
      >
        <button
          type="button"
          className="drawer-backdrop"
          aria-label="Close menu"
          tabIndex={drawerOpen ? 0 : -1}
          onClick={() => setDrawerOpen(false)}
        />
        <aside
          id={drawerId}
          className="drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div className="drawer__head">
            <BrandLogo size="sm" />
            <button
              type="button"
              className="drawer__close"
              onClick={() => setDrawerOpen(false)}
            >
              Close
            </button>
          </div>
          <nav className="side-nav" aria-label="Mobile">
            <NavBody onNavigate={() => setDrawerOpen(false)} />
          </nav>
        </aside>
      </div>
    </div>
  );
}
