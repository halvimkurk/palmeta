import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacy policy",
  description:
    "Palworld Meta privacy policy — localStorage teams stay on your device, no accounts, minimal analytics.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="prose">
      <h1>Privacy policy</h1>
      <p>Last updated: July 24, 2026</p>
      <p>
        Palworld Meta is an unofficial Palworld toolkit. It is not affiliated with
        Pocketpair. We collect as little as possible.
      </p>
      <h2>Local data</h2>
      <p>
        Saved teams are stored in your browser via localStorage and never leave
        your device. Clearing site data in your browser removes them.
      </p>
      <h2>No accounts, no ads</h2>
      <p>
        The site has no sign-in, no advertising scripts, and no third-party
        trackers.
      </p>
      <h2>Analytics</h2>
      <p>
        We may use privacy-friendly host analytics (e.g. Vercel Analytics) for
        aggregate traffic and performance. No personal data is sold.
      </p>
      <h2>Contact</h2>
      <p>
        For questions, email{" "}
        <a href="mailto:support@palmeta.app">support@palmeta.app</a> or contact
        the operator via the project repository.
      </p>
    </article>
  );
}
