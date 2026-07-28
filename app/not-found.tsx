import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TOOL_NAV } from "@/lib/nav";

export const metadata: Metadata = {
  title: "404 — This pal wandered off",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="not-found">
      <Image
        src="/pal-icons/depresso.png"
        alt=""
        width={104}
        height={104}
        className="not-found__pal"
        priority
      />
      <p className="not-found__code" aria-hidden>
        404
      </p>
      <h1 className="not-found__title">This pal wandered off</h1>
      <p className="not-found__lead">
        The page you&rsquo;re looking for doesn&rsquo;t exist — maybe it got bred
        into something else. Depresso feels your pain. Try one of the tools
        instead:
      </p>
      <nav className="not-found__links" aria-label="Companion tools">
        {TOOL_NAV.map((tool) => (
          <Link key={tool.href} href={tool.href} className="chip chip--link chip--ghost">
            {tool.label}
          </Link>
        ))}
        <Link href="/" className="chip chip--link chip--accent">
          Back home
        </Link>
      </nav>
    </div>
  );
}
