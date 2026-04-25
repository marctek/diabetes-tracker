/**
 * scripts/update-data.mjs
 *
 * Run by the GitHub Action every Monday to refresh diabetes data.
 * Can also be run manually:
 *
 *   PERPLEXITY_API_KEY=your_key node scripts/update-data.mjs
 *
 * What it does:
 *   1. Asks Perplexity for the 6 most significant diabetes news stories
 *      from the past two weeks
 *   2. Deduplicates against existing items (by URL and title)
 *   3. Prepends new items, trims the list to 30 max
 *   4. Updates lastUpdated to the current month
 *   5. Writes the result back to diabetes-data.json
 */

import { readFile, writeFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "../client/src/data/diabetes-data.json");
const API_KEY = process.env.PERPLEXITY_API_KEY;
const MAX_NEWS_ITEMS = 30;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callPerplexity(prompt) {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Perplexity API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

function parseJsonArray(raw) {
  // Strip markdown code fences
  let cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // Try direct parse first
  try {
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : parsed.items ?? parsed.news ?? [];
  } catch {
    // Fall back: extract the first JSON array we can find
    const match = cleaned.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not find a JSON array in the response.");
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error("❌  PERPLEXITY_API_KEY is not set.");
    process.exit(1);
  }

  console.log("📂  Loading current data...");
  const raw = await readFile(DATA_PATH, "utf-8");
  const data = JSON.parse(raw);

  const today = new Date().toISOString().split("T")[0];
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // ── 1. Fetch latest news ────────────────────────────────────────────────────
  console.log("🔍  Asking Perplexity for latest diabetes news...");

  const newsPrompt = `Today is ${today}. Search the web for the 6 most significant US news stories published between ${twoWeeksAgo} and ${today} about:
- Insulin pricing changes or manufacturer announcements
- New CGM or insulin pump FDA approvals or commercial launches
- Medicare or Medicaid diabetes drug/device coverage changes
- State-level insulin or diabetes legislation enacted or proposed
- Breakthrough diabetes research with clinical significance

Return ONLY a raw JSON array — no markdown, no explanation, no code fences. Each object must have exactly:
[
  {
    "title": "Full headline",
    "source": "Publication or organization",
    "url": "https://direct-article-url.com",
    "date": "YYYY-MM-DD",
    "category": "pricing",
    "summary": "2–3 sentence plain-English summary of the key facts."
  }
]

Valid categories: pricing, devices, coverage, legislation, research.
Only include items with real, working URLs found via web search.`;

  let newItems = [];
  try {
    const rawResponse = await callPerplexity(newsPrompt);
    newItems = parseJsonArray(rawResponse);
    console.log(`✅  Perplexity returned ${newItems.length} item(s).`);
  } catch (err) {
    console.error("⚠️   News fetch failed:", err.message);
    console.log("    Continuing without new news items.");
  }

  // ── 2. Deduplicate ──────────────────────────────────────────────────────────
  const validCategories = new Set([
    "pricing", "devices", "coverage", "legislation", "research",
  ]);

  const existingUrls = new Set(data.recentNews.map((n) => n.url));
  const existingTitles = new Set(
    data.recentNews.map((n) => n.title.toLowerCase().trim())
  );

  const unique = newItems
    .filter(
      (item) =>
        item?.title &&
        item?.url &&
        !existingUrls.has(item.url) &&
        !existingTitles.has(item.title.toLowerCase().trim())
    )
    .map((item) => ({
      title: String(item.title).trim(),
      source: String(item.source ?? "").trim(),
      url: String(item.url).trim(),
      date: String(item.date ?? today),
      category: validCategories.has(item.category) ? item.category : "research",
      summary: String(item.summary ?? "").trim(),
    }));

  if (unique.length > 0) {
    data.recentNews = [...unique, ...data.recentNews].slice(0, MAX_NEWS_ITEMS);
    console.log(`➕  Added ${unique.length} new item(s). Total: ${data.recentNews.length}`);
  } else {
    console.log("ℹ️   No new unique items to add.");
  }

  // ── 3. Update lastUpdated ───────────────────────────────────────────────────
  const monthYear = new Date().toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  data.lastUpdated = monthYear;

  // ── 4. Write back ───────────────────────────────────────────────────────────
  await writeFile(DATA_PATH, JSON.stringify(data, null, 2) + "\n");
  console.log(`💾  Saved to ${DATA_PATH}`);
  console.log(`✨  Done. lastUpdated → "${monthYear}"`);
}

main().catch((err) => {
  console.error("❌  Update script failed:", err);
  process.exit(1);
});
