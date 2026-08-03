"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { NavIcon } from "@/components/layout/NavIcons";
import { NAV, PRIMARY_NAV } from "@/lib/nav";

type Props = {
  children: React.ReactNode;
};

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
        {PRIMARY_NAV.map((link) => (
          <Link
            key={link.match}
            href={link.href}
            className={`side-link side-link--${link.icon}${
              isActive(pathname, link.match) ? " is-active" : ""
            }`}
            onClick={onNavigate}
          >
            <NavIcon name={link.icon} />
            <span className="side-link__label">{link.label}</span>
          </Link>
        ))}
      </>
    );
  }

  function SideFoot() {
    return (
      <div className="sidebar__foot">
        <p className="sidebar__foot-note">Unofficial Palworld companion</p>
        <p className="sidebar__foot-meta">
          <span>1.0 data</span>
          <span aria-hidden>·</span>
          <Link href="/privacy">Privacy</Link>
        </p>
      </div>
    );
  }

  const isHome = pathname === "/";

  return (
    <div className={`app-frame${isHome ? " is-home" : ""}`}>
      <aside className="sidebar" aria-label="Site">
        <span className="sidebar__atmosphere" aria-hidden />
        <Link href="/" className="sidebar__brand">
          <BrandLogo size="sm" />
        </Link>
        <nav className="side-nav" aria-label="Primary">
          <NavBody />
        </nav>
        <SideFoot />
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
            <BrandLogo size="sm" />
          </Link>
          <Link href={NAV.tiers.href} className="topbar__cta">
            {NAV.tiers.label}
          </Link>
        </header>

        <main className="shell-main__content">{children}</main>

        <footer className={`site-footer${isHome ? " site-footer--home" : ""}`}>
          <span>ThePaldex — Paldeck, tier lists, breeding, teams &amp; guides</span>
          <Link href={NAV.tiers.href}>{NAV.tiers.label}</Link>
          <Link href={NAV.breeding.href}>{NAV.breeding.label}</Link>
          <Link href={NAV.teams.href}>{NAV.teams.label}</Link>
          <Link href={NAV.pals.href}>{NAV.pals.label}</Link>
          <Link href={NAV.guides.href}>{NAV.guides.label}</Link>
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
          <span className="sidebar__atmosphere" aria-hidden />
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
          <SideFoot />
        </aside>
      </div>
    </div>
  );
}
