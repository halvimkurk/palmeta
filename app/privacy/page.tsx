import type { Metadata } from "next";
import { pageMeta, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";

const GITHUB_URL = "https://github.com/halvimkurk/palmeta";

export const metadata: Metadata = pageMeta({
  title: "Privacy policy",
  description: `${SITE_NAME} privacy policy — saved teams and map markers stay in your browser, no accounts, GA4 analytics only.`,
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <article className="prose">
      <h1>Privacy policy</h1>
      <p>Last updated: July 27, 2026</p>
      <p>
        <a href={SITE_URL}>{SITE_NAME}</a> ({SITE_URL.replace(/^https?:\/\//, "")}) is an
        unofficial Palworld 1.0 toolkit — {SITE_TAGLINE.toLowerCase()} It is not
        affiliated with, endorsed by, or sponsored by Pocketpair. We collect as little
        data as possible.
      </p>
      <h2>Local data</h2>
      <p>
        Some features save data only in your browser via <code>localStorage</code> and
        never send it to our servers:
      </p>
      <ul>
        <li>
          <strong>Saved teams</strong> — party rosters you save in the team builder.
        </li>
        <li>
          <strong>Map progress</strong> — markers you mark as found on the interactive
          map.
        </li>
      </ul>
      <p>
        Clearing site data in your browser removes this information. Shareable tool
        URLs (breeding targets, team links, tier filters) are encoded in the address bar
        only — we do not store them server-side.
      </p>
      <h2>No accounts</h2>
      <p>
        The site has no sign-in, no profiles, and no cloud sync. Advertising scripts are
        not loaded today; if ads are added later, they will stay off until explicitly
        enabled in deployment configuration.
      </p>
      <h2>Analytics</h2>
      <p>
        We use Google Analytics 4 for aggregate traffic — pages visited, referrer, and
        device type. GA may set cookies and process usage data under{" "}
        <a
          href="https://policies.google.com/privacy"
          rel="noopener noreferrer"
          target="_blank"
        >
          Google&apos;s privacy policy
        </a>
        . We do not sell personal data. To disable analytics entirely, block third-party
        scripts or use a browser extension; we do not fingerprint users beyond what GA
        collects by default.
      </p>
      <h2>Contact</h2>
      <p>
        There is no support inbox yet. For privacy questions or corrections, open an
        issue on the{" "}
        <a href={GITHUB_URL} rel="noopener noreferrer" target="_blank">
          project repository
        </a>
        .
      </p>
    </article>
  );
}
