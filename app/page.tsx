import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/schema";

const TOOLS = [
  {
    href: "/tiers?role=combat",
    label: "Tier list",
    hint: "Combat, work, mounts, capture — ranked by role",
    image: "/home/tiers.webp",
    kicker: "01",
  },
  {
    href: "/breeding",
    label: "Breeding",
    hint: "Predict eggs or find parents for a target pal",
    image: "/home/breeding.webp",
    kicker: "02",
  },
  {
    href: "/teams",
    label: "Teams",
    hint: "Meta comps and a party builder for five pals",
    image: "/home/teams.webp",
    kicker: "03",
  },
  {
    href: "/pals",
    label: "Paldeck",
    hint: "Stats, work suitability, and skills for every pal",
    image: "/home/paldeck.webp",
    kicker: "04",
  },
] as const;

const HOME_FAQ = [
  {
    q: "What is Palworld Meta?",
    a: "Palworld Meta is an unofficial Palworld 1.0 toolkit with role tier lists, a breeding calculator, a team builder with meta comps, and a searchable Paldeck. It is a fan project and is not affiliated with Pocketpair.",
  },
  {
    q: "Is the breeding calculator updated for Palworld 1.0?",
    a: "Yes. The calculator uses the site’s curated breeding catalog for forward prediction (two parents → child) and reverse lookup (target pal → parent pairs).",
  },
  {
    q: "How are the Palworld tier lists ranked?",
    a: "Tiers are split by role — combat, base workers, flying mounts, ground mounts, and catching helpers. Each placement includes a short reason so you can judge fit for your route, not only a letter grade.",
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
            Tier lists, breeding calculator &amp; team builder
          </h1>
          <p className="home-hero__tag">
            Unofficial Palworld 1.0 toolkit — combat roles, eggs, parties, Paldeck.
          </p>
        </div>
      </header>

      <section className="home-tools" aria-label="Toolkit">
        {TOOLS.map((tool, i) => (
          <Link key={tool.href} href={tool.href} className="home-tool">
            <Image
              className="home-tool__bg"
              src={tool.image}
              alt=""
              fill
              sizes="(max-width: 719px) 100vw, 50vw"
              priority={i < 2}
            />
            <span className="home-tool__shade" aria-hidden />
            <span className="home-tool__kicker">{tool.kicker}</span>
            <span className="home-tool__label">{tool.label}</span>
            <span className="home-tool__hint">{tool.hint}</span>
          </Link>
        ))}
      </section>
    </div>
  );
}
