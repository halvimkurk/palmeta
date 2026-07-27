import type { Metadata } from "next";
import { Suspense } from "react";
import { MapClientLoader } from "@/components/map/MapClientLoader";
import { JsonLd } from "@/components/seo/JsonLd";
import { SeoFaq } from "@/components/seo/SeoFaq";
import { getMapMarkers } from "@/lib/map";
import { pageMeta } from "@/lib/seo";
import { breadcrumbJsonLd, faqJsonLd, webAppJsonLd } from "@/lib/seo/schema";

const DESCRIPTION =
  "Interactive Palworld map for 1.0 — hunt alpha pals and Syndicate towers, find wild spawns, collect effigies and notes, and plan fast travel. Switch modes and track what you have found.";

export const metadata: Metadata = pageMeta({
  title: "Palworld Map — Alphas, Spawns, Effigies & Fast Travel",
  description: DESCRIPTION,
  path: "/map",
});

const FAQ = [
  {
    q: "What can I find on the Palworld Meta map?",
    a: "Four scenario modes: Hunt (alphas and towers), Find Pal (wild spawns plus alphas), Collect (effigies and notes), and Travel (fast travel statues and towers).",
  },
  {
    q: "Does the map link to Paldeck pages?",
    a: "Alpha and spawn markers with a known pal open their Paldeck sheet so you can check stats, work, and breeding routes in one click.",
  },
  {
    q: "Can I share a map view?",
    a: "Yes. Mode and focus state live in the URL query string — copy the address bar to send a hunt or collect view to friends.",
  },
  {
    q: "Is progress saved?",
    a: "Found markers are stored in your browser localStorage on this device. Clearing site data resets checkmarks.",
  },
];

export default function MapPage() {
  const markers = getMapMarkers();

  return (
    <>
      <JsonLd
        data={[
          webAppJsonLd({
            name: "Palworld Map",
            description: DESCRIPTION,
            path: "/map",
          }),
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Map", path: "/map" },
          ]),
          faqJsonLd(FAQ),
        ]}
      />
      <Suspense fallback={<p className="hub-hint">Loading map…</p>}>
        <MapClientLoader markers={markers} />
      </Suspense>
      <SeoFaq title="Map FAQ" items={FAQ} />
    </>
  );
}
