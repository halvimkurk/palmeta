import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { COMPANION_ART, type CompanionArtTone } from "@/lib/companion-art";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

const TOOLS: {
  href: string;
  label: string;
  hint: string;
  tone: CompanionArtTone;
  kicker: string;
}[] = [
  {
    href: "/tiers?role=combat",
    label: "Summit Tiers",
    hint: "Combat, work, mounts, capture — ranked by role",
    tone: "tiers",
    kicker: "01",
  },
  {
    href: "/breeding",
    label: "Egg Nest",
    hint: "Predict eggs or find parents for a target pal",
    tone: "breeding",
    kicker: "02",
  },
  {
    href: "/teams",
    label: "Raid Roster",
    hint: "Meta comps and a party builder for five pals",
    tone: "teams",
    kicker: "03",
  },
  {
    href: "/pals",
    label: "Paldeck",
    hint: "Stats, work suitability, and skills for every pal",
    tone: "pals",
    kicker: "04",
  },
];

const HOME_FAQ = [
  {
    q: "What is Palworld Meta?",
    a: "Palworld Meta is an unofficial Palworld 1.0 companion with role tier lists, a breeding calculator, a team builder with meta comps, and a searchable Paldeck. It is a fan project and is not affiliated with Pocketpair.",
  },
  {
    q: "Is the breeding calculator updated for Palworld 1.0?",
    a: "Yes. The calculator uses the site’s curated breeding catalog for forward prediction (two parents → child) and reverse lookup (target pal → parent pairs). URLs update as you pick combos so you can share links.",
  },
  {
    q: "How are the Palworld tier lists ranked?",
    a: "Tiers are split by role — combat, base workers, flying mounts, ground mounts, and catching helpers. Each placement includes a short reason so you can judge fit for your route, not only a letter grade.",
  },
  {
    q: "Can I build and share Palworld teams?",
    a: "Yes. The team builder loads meta comps or custom five-pal parties. Your roster encodes into the URL, and you can save builds in your browser without an account.",
  },
];

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
            Unofficial companion — Summit Tiers, Egg Nest, Raid Roster, and Paldeck in one place.
          </p>
        </div>
      </header>

      <section className="home-tools" aria-label="Companion tools">
        {TOOLS.map((tool, i) => {
          const art = COMPANION_ART[tool.tone];
          return (
            <Link key={tool.href} href={tool.href} className="home-tool">
              <Image
                className="home-tool__bg"
                src={art.src}
                alt=""
                fill
                sizes="(max-width: 719px) 100vw, (max-width: 960px) 50vw, 320px"
                style={{ objectPosition: art.position }}
                priority={i < 2}
              />
              <span className="home-tool__shade" aria-hidden />
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
