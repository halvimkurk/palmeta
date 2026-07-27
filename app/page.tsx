import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { companionArtFor, type CompanionArtTone } from "@/lib/companion-art";
import { TOOL_NAV } from "@/lib/nav";
import { HOME_FAQ } from "@/lib/seo/faqs";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

const TONE_BY_ICON = {
  tiers: "tiers",
  eggs: "breeding",
  teams: "teams",
  pals: "pals",
} as const satisfies Record<(typeof TOOL_NAV)[number]["icon"], CompanionArtTone>;

const HOME_TOOLS = TOOL_NAV.map((tool, index) => ({
  href: tool.href,
  label: tool.label,
  hint: tool.hint,
  tone: TONE_BY_ICON[tool.icon],
  kicker: String(index + 1).padStart(2, "0"),
}));

export default function HomePage() {
  return (
    <div className="home">
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: "Home", path: "/" }]),
          faqJsonLd(HOME_FAQ),
        ]}
      />

      <header className="home-hero">
        <BrandLogo size="lg" className="home-hero__logo" />
        <div className="home-hero__copy">
          <h1 className="home-hero__title">
            Palworld 1.0 Tier List, Breeding Calculator &amp; Team Builder
          </h1>
          <p className="home-hero__tag">
            Your unofficial chronicle for Palworld 1.0 — tier lists, breeding charts, team rosters, and the full Paldeck.
          </p>
        </div>
      </header>

      <section className="home-tools" aria-label="Companion tools">
        {HOME_TOOLS.map((tool) => {
          const art = companionArtFor(tool.tone);
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className={`home-tool home-tool--${tool.tone}`}
            >
              <span className="home-tool__art" aria-hidden>
                <Image
                  src={art.src}
                  alt=""
                  fill
                  sizes="(max-width: 720px) 100vw, 50vw"
                  className="home-tool__art-img"
                  style={{ objectPosition: art.objectPosition }}
                />
                <span className="home-tool__art-shade" />
              </span>
              <span className="home-tool__atmosphere" aria-hidden />
              <span className="home-tool__kicker">{tool.kicker}</span>
              <span className="home-tool__label">{tool.label}</span>
              <span className="home-tool__hint">{tool.hint}</span>
            </Link>
          );
        })}
      </section>

      <SeoFaq items={HOME_FAQ} />
    </div>
  );
}
