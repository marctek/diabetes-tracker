/**
 * Netlify Serverless Function: fetch-news
 * Called by the News page "Refresh" button.
 * Queries Perplexity AI for the latest diabetes news and returns
 * structured news items as JSON.
 *
 * Required Netlify environment variable:
 *   PERPLEXITY_API_KEY — your Perplexity API key
 *
 * URL: /.netlify/functions/fetch-news  (or /api/news via netlify.toml redirect)
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

exports.handler = async () => {
  const apiKey = process.env.PERPLEXITY_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 503,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: "PERPLEXITY_API_KEY is not configured in Netlify environment variables.",
      }),
    };
  }

  const today = new Date().toISOString().split("T")[0];

  const prompt = `Today is ${today}. Search the web for the 6 most significant recent US news stories from the past 30 days about any of these topics:
- Insulin pricing changes or manufacturer announcements
- New CGM (continuous glucose monitor) or insulin pump FDA approvals or launches
- Medicare or Medicaid diabetes drug/device coverage policy changes
- State-level insulin or diabetes legislation
- Breakthrough diabetes research or clinical trial results

Return ONLY a raw JSON array — no markdown, no explanation, no code fences. Each object in the array must have exactly these fields:
[
  {
    "title": "Headline here",
    "source": "Publication or organization name",
    "url": "https://direct-link-to-article.com",
    "date": "YYYY-MM-DD",
    "category": "pricing",
    "summary": "2-3 sentence plain-English summary."
  }
]

The category field must be exactly one of: pricing, devices, coverage, legislation, research.
Only include items you found via web search with a real, working URL.`;

  let perplexityRes;
  try {
    perplexityRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Failed to reach Perplexity API.", detail: String(err) }),
    };
  }

  if (!perplexityRes.ok) {
    const errText = await perplexityRes.text();
    return {
      statusCode: 502,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Perplexity API returned an error.", detail: errText }),
    };
  }

  const perplexityData = await perplexityRes.json();
  const raw = perplexityData?.choices?.[0]?.message?.content ?? "";

  // Strip markdown code fences if present, then parse JSON
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let items = [];
  try {
    const parsed = JSON.parse(cleaned);
    items = Array.isArray(parsed) ? parsed : parsed.items ?? parsed.news ?? [];
  } catch {
    // Perplexity sometimes wraps the array in an object — try extracting it
    const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      try {
        items = JSON.parse(match[0]);
      } catch {
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: "Could not parse Perplexity response.", raw }),
        };
      }
    }
  }

  // Sanitise: ensure required fields exist
  const validCategories = new Set(["pricing", "devices", "coverage", "legislation", "research"]);
  const sanitised = items
    .filter((item) => item && item.title && item.url)
    .map((item) => ({
      title: String(item.title || ""),
      source: String(item.source || ""),
      url: String(item.url || ""),
      date: String(item.date || today),
      category: validCategories.has(item.category) ? item.category : "research",
      summary: String(item.summary || ""),
    }));

  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ items: sanitised, fetchedAt: today }),
  };
};
