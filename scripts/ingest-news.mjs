/**
 * Multi-source Palworld news ingest → short original briefs for PalForge.
 *
 * Sources: Steam app news, Google News RSS, Reddit r/Palworld.
 * Dedupes by title similarity, rewrites into a concise editor voice
 * (optional OpenAI for higher quality).
 *
 * Usage: node scripts/ingest-news.mjs
 * Optional: OPENAI_API_KEY for higher-quality rewrite
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outJson = path.join(root, "data", "news", "articles.json");

const STEAM_APP = 1623730;
const UA =
  "PalForgeNewsBot/1.0 (+https://palforge.app; unofficial Palworld toolkit)";

const MAX_ARTICLES = 24;

/** @typedef {{ type: 'p'|'h2'|'ul', text?: string, items?: string[] }} Block */
/** @typedef {{ id: string, slug: string, title: string, excerpt: string, publishedAt: string, updatedAt: string, tags: string[], body: Block[], sourceRefs: {name:string,url:string}[] }} Article */

/**
 * @typedef {{
 *   key: string,
 *   title: string,
 *   url: string,
 *   publishedAt: string,
 *   sourceName: string,
 *   rawText: string,
 *   imageUrl?: string,
 * }} RawItem
 */

async function fetchText(url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "user-agent": UA,
      accept: "application/json, application/rss+xml, text/xml, text/html;q=0.9,*/*;q=0.8",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/(h[1-6]|li|div)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractSteamImage(html) {
  const clan = String(html || "").match(
    /https?:\/\/clan\.akamai\.steamstatic\.com\/images\/[^\s"'<>]+/i,
  );
  if (clan) return clan[0].replace(/&amp;/g, "&");
  const cdn = String(html || "").match(
    /https?:\/\/cdn\.akamai\.steamstatic\.com\/steamcommunity\/public\/images\/clans\/[^\s"'<>]+/i,
  );
  if (cdn) return cdn[0].replace(/&amp;/g, "&");
  const img = String(html || "").match(/src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)[^"']*)["']/i);
  return img?.[1]?.replace(/&amp;/g, "&");
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72) || "palworld-news";
}

function tokenize(s) {
  return new Set(
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
}

function jaccard(a, b) {
  const A = tokenize(a);
  const B = tokenize(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter += 1;
  return inter / (A.size + B.size - inter);
}

function pickTags(title, text) {
  const blob = `${title} ${text}`.toLowerCase();
  /** @type {string[]} */
  const tags = [];
  const rules = [
    ["patch", /patch|hotfix|update|patch notes|changelog/],
    ["1.0", /\b1\.0\b|full release|official release/],
    ["raid", /raid|blazamut|bellanoir|jolthog|raid boss/],
    ["pals", /\bpals?\b|paldeck|paldex|catch|sphere/],
    ["crossplay", /cross[- ]?play|xbox|ps5|playstation|switch/],
    ["event", /event|login bonus|limited|season/],
    ["steam", /steam|deck|wishlist/],
    ["guide", /guide|how to|tips|build/],
    ["community", /reddit|fan|mod|community/],
  ];
  for (const [tag, re] of rules) if (re.test(blob)) tags.push(tag);
  if (!tags.length) tags.push("palworld");
  return [...new Set(tags)].slice(0, 5);
}

function sentences(text, max = 8) {
  return String(text)
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && s.length < 280)
    .slice(0, max);
}

function cleanSourceTitle(title) {
  return String(title || "")
    .replace(/\s+-\s+[^-]+$/, "")
    .replace(/^\[.*?\]\s*/, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueTitle(item) {
  const base = cleanSourceTitle(item.title);
  return base.length > 96 ? `${base.slice(0, 93).trim()}…` : base;
}

function paraphraseFact(s) {
  let t = s.replace(/^•\s*/, "").trim();
  t = t.replace(/^(also|additionally|meanwhile),?\s+/i, "");
  if (/^players?\b/i.test(t)) t = t.replace(/^players?\b/i, "Hunters");
  if (!/[.!?]$/.test(t)) t += ".";
  return t;
}

function rewriteLocal(item) {
  const facts = sentences(item.rawText, 12);
  const tags = pickTags(item.title, item.rawText);
  const title = uniqueTitle(item);

  /** @type {Block[]} */
  const body = [];

  if (facts.length) {
    for (const f of facts.slice(0, 4).map(paraphraseFact)) {
      body.push({ type: "p", text: f });
    }
  } else {
    body.push({
      type: "p",
      text: "Details are thin beyond the headline — worth a look at the source if the topic matters to your roster.",
    });
  }

  body.push({ type: "p", text: `Source: ${item.sourceName}.` });

  const excerpt = (body[0]?.text || title).slice(0, 190);
  return { title: title.slice(0, 110), excerpt, body, tags };
}

async function rewriteWithOpenAI(item) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const prompt = {
    model: "gpt-4o-mini",
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You write short original Palworld news briefs for PalForge (unofficial toolkit: tier lists, breeding, team builder). Never copy source wording. Return JSON: {title, excerpt, tags:string[], body:[{type:'p'|'h2'|'ul', text?:string, items?:string[]}]}. Tone: confident game-site editor — concise, specific, no hype, no exclamation marks, no calls to action, no next-step checklists. 2-4 short paragraphs max. End the body with a paragraph 'Source: <source name>.' English only.",
      },
      {
        role: "user",
        content: JSON.stringify({
          sourceTitle: item.title,
          sourceName: item.sourceName,
          sourceUrl: item.url,
          rawText: item.rawText.slice(0, 6000),
        }),
      },
    ],
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(prompt),
  });
  if (!res.ok) {
    console.warn("OpenAI rewrite failed", res.status);
    return null;
  }
  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.title || !Array.isArray(parsed.body)) return null;
    return {
      title: String(parsed.title).slice(0, 110),
      excerpt: String(parsed.excerpt || "").slice(0, 200),
      tags: Array.isArray(parsed.tags) ? parsed.tags.map(String).slice(0, 5) : pickTags(item.title, item.rawText),
      body: parsed.body,
    };
  } catch {
    return null;
  }
}

async function fetchSteamNews() {
  const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${STEAM_APP}&count=20&maxlength=0&format=json`;
  const res = await fetchText(url);
  const json = await res.json();
  const items = json?.appnews?.newsitems || [];
  /** @type {RawItem[]} */
  const out = [];
  for (const n of items) {
    const html = n.contents || "";
    out.push({
      key: `steam:${n.gid}`,
      title: n.title || "Steam news",
      url: n.url || `https://store.steampowered.com/news/app/${STEAM_APP}`,
      publishedAt: new Date((n.date || 0) * 1000).toISOString(),
      sourceName: "Steam News",
      rawText: stripHtml(html).slice(0, 8000),
      imageUrl: extractSteamImage(html),
    });
  }
  return out;
}

function parseRssItems(xml) {
  const items = [];
  const chunks = String(xml).split(/<item[\s>]/i).slice(1);
  for (const chunk of chunks) {
    const get = (tag) => {
      const m = chunk.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return (m?.[1] || m?.[2] || "").trim();
    };
    const title = stripHtml(get("title"));
    const link = stripHtml(get("link"));
    const desc = stripHtml(get("description"));
    const pub = get("pubDate") || get("published");
    if (!title || !link) continue;
    items.push({ title, link, desc, pub });
  }
  return items;
}

async function fetchGoogleNews() {
  const url =
    "https://news.google.com/rss/search?q=Palworld%20when%3A14d&hl=en-US&gl=US&ceid=US:en";
  try {
    const res = await fetchText(url);
    const xml = await res.text();
    return parseRssItems(xml).slice(0, 12).map((it, i) => ({
      key: `gnews:${createHash("sha1").update(it.link).digest("hex").slice(0, 12)}`,
      title: it.title.replace(/\s+-\s+[^-]+$/, "").trim(),
      url: it.link,
      publishedAt: it.pub ? new Date(it.pub).toISOString() : new Date().toISOString(),
      sourceName: "Google News",
      rawText: it.desc || it.title,
    }));
  } catch (e) {
    console.warn("Google News fetch failed:", e.message);
    return [];
  }
}

async function fetchReddit() {
  // JSON API often 403's bots; RSS is more reliable.
  try {
    const res = await fetchText("https://www.reddit.com/r/Palworld/.rss", {
      headers: {
        accept: "application/rss+xml, application/atom+xml, text/xml",
        "user-agent":
          "Mozilla/5.0 (compatible; PalForgeNewsBot/1.0; +https://palforge.app)",
      },
    });
    const xml = await res.text();
    const entries = String(xml).split(/<entry[\s>]/i).slice(1);
    /** @type {RawItem[]} */
    const out = [];
    for (const chunk of entries.slice(0, 15)) {
      const get = (tag) => {
        const m = chunk.match(
          new RegExp(
            `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
            "i",
          ),
        );
        return (m?.[1] || m?.[2] || "").trim();
      };
      const title = stripHtml(get("title"));
      const linkMatch = chunk.match(/<link[^>]+href=["']([^"']+)["']/i);
      const link = linkMatch?.[1] || "";
      const content = stripHtml(get("content") || get("summary"));
      const updated = get("updated") || get("published");
      if (!title || !link) continue;
      out.push({
        key: `reddit:${createHash("sha1").update(link).digest("hex").slice(0, 12)}`,
        title,
        url: link,
        publishedAt: updated ? new Date(updated).toISOString() : new Date().toISOString(),
        sourceName: "Reddit r/Palworld",
        rawText: content.slice(0, 5000) || title,
      });
    }
    if (out.length) return out;
  } catch (e) {
    console.warn("Reddit RSS failed:", e.message);
  }
  return [];
}

function dedupe(items) {
  /** @type {RawItem[]} */
  const kept = [];
  for (const item of items) {
    const dup = kept.find((k) => jaccard(k.title, item.title) > 0.55);
    if (dup) {
      // Prefer Steam for images/text richness; otherwise keep earlier + merge refs via longer text
      if (item.sourceName === "Steam News" && dup.sourceName !== "Steam News") {
        const idx = kept.indexOf(dup);
        kept[idx] = {
          ...item,
          rawText: [item.rawText, dup.rawText].join("\n\n").slice(0, 10000),
        };
      } else if ((item.rawText?.length || 0) > (dup.rawText?.length || 0) * 1.3) {
        dup.rawText = item.rawText;
        if (item.imageUrl && !dup.imageUrl) dup.imageUrl = item.imageUrl;
      }
      continue;
    }
    kept.push(item);
  }
  return kept;
}

async function loadExisting() {
  try {
    const raw = await readFile(outJson, "utf8");
    const json = JSON.parse(raw);
    return Array.isArray(json.articles) ? json.articles : [];
  } catch {
    return [];
  }
}

async function main() {
  await mkdir(path.dirname(outJson), { recursive: true });

  console.log("Fetching sources…");
  const [steam, gnews, reddit] = await Promise.all([
    fetchSteamNews().catch((e) => {
      console.warn("Steam failed", e.message);
      return [];
    }),
    fetchGoogleNews(),
    fetchReddit(),
  ]);

  console.log(`Steam ${steam.length}, Google ${gnews.length}, Reddit ${reddit.length}`);
  const filteredReddit = reddit.filter((r) => {
    const t = r.title.toLowerCase();
    const meaningful = stripHtml(r.rawText || "")
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const bodyLen = meaningful.length;
    // Drop meme / screenshot posts unless the title is clearly newsy.
    const newsy =
      /patch|update|1\.0|raid|achievement|boss|mod|steam|xbox|ps5|guide|breeding|hotfix|launch|player count|early access|psa|changed/.test(
        t,
      );
    if (newsy) return true;
    return bodyLen > 420 && !/[😂🙃🤣💕❤️]/.test(r.title);
  });
  console.log(`Reddit kept ${filteredReddit.length}`);
  const merged = dedupe(
    [...steam, ...gnews, ...filteredReddit].sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    ),
  ).slice(0, MAX_ARTICLES);

  const existing = await loadExisting();
  const byId = new Map(existing.map((a) => [a.id, a]));

  /** @type {Article[]} */
  const articles = [];

  for (const item of merged) {
    if ((item.rawText || "").length < 40 && item.sourceName !== "Steam News") {
      // Still allow short Google titles with rewrite scaffolding
      item.rawText = item.title;
    }

    const id = createHash("sha1").update(item.key).digest("hex").slice(0, 16);
    if (byId.has(id) && !process.env.NEWS_FORCE) {
      articles.push(byId.get(id));
      continue;
    }

    const rewritten = (await rewriteWithOpenAI(item)) || rewriteLocal(item);
    let slug = slugify(rewritten.title);
    // uniquify slug
    let n = 2;
    while (articles.some((a) => a.slug === slug) || [...byId.values()].some((a) => a.slug === slug && a.id !== id)) {
      slug = `${slugify(rewritten.title)}-${n++}`;
    }

    /** @type {Article} */
    const article = {
      id,
      slug,
      title: rewritten.title,
      excerpt: rewritten.excerpt || rewritten.body.find((b) => b.type === "p")?.text?.slice(0, 180) || "",
      publishedAt: item.publishedAt,
      updatedAt: new Date().toISOString(),
      tags: rewritten.tags,
      body: rewritten.body,
      sourceRefs: [{ name: item.sourceName, url: item.url }],
    };
    articles.push(article);
    console.log("·", article.title);
  }

  // Keep any older unique articles not in this run (up to 40 total)
  for (const old of existing) {
    if (articles.length >= 40) break;
    if (!articles.some((a) => a.id === old.id)) articles.push(old);
  }

  articles.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  const catalog = {
    version: "1",
    generatedAt: new Date().toISOString(),
    articles,
  };
  await writeFile(outJson, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Wrote ${articles.length} articles → data/news/articles.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
