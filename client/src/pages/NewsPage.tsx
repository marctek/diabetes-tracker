import { useState, useMemo } from "react";
import data from "@/data/diabetes-data.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Newspaper, Globe, RefreshCw, Wifi, WifiOff } from "lucide-react";

const categoryColors: Record<string, string> = {
  pricing: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  devices: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  coverage: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  legislation: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  research: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

const sourceCategories: Record<string, string> = {
  government: "Government & Regulatory",
  pharma: "Pharmaceutical Companies",
  media: "Media & Advocacy",
};

type NewsItem = {
  title: string;
  source: string;
  url: string;
  date: string;
  category: string;
  summary: string;
};

type FetchStatus = "idle" | "loading" | "success" | "error" | "unavailable";

export default function NewsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [liveItems, setLiveItems] = useState<NewsItem[]>([]);
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const categories = ["all", "pricing", "devices", "coverage", "legislation", "research"];

  // Merge live items with static data, deduplicated by URL
  const allNews = useMemo<NewsItem[]>(() => {
    const staticItems = data.recentNews as NewsItem[];
    if (liveItems.length === 0) return staticItems;
    const existingUrls = new Set(staticItems.map((n) => n.url));
    const newOnly = liveItems.filter((item) => !existingUrls.has(item.url));
    return [...newOnly, ...staticItems];
  }, [liveItems]);

  const filteredNews = useMemo(() => {
    if (categoryFilter === "all") return allNews;
    return allNews.filter((n) => n.category === categoryFilter);
  }, [categoryFilter, allNews]);

  const groupedSources = useMemo(() => {
    const groups: Record<string, typeof data.newsSources> = {};
    data.newsSources.forEach((s) => {
      const cat = s.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, []);

  async function handleRefresh() {
    setFetchStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/news", { signal: AbortSignal.timeout(20_000) });

      if (res.status === 404) {
        // Function not deployed yet (local dev)
        setFetchStatus("unavailable");
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const payload = await res.json();
      const items: NewsItem[] = payload.items ?? [];

      if (items.length === 0) {
        setFetchStatus("error");
        setErrorMsg("No news items returned. Try again in a moment.");
        return;
      }

      setLiveItems(items);
      setFetchedAt(payload.fetchedAt ?? new Date().toISOString().split("T")[0]);
      setFetchStatus("success");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "TimeoutError") {
        setFetchStatus("error");
        setErrorMsg("Request timed out. Try again.");
      } else if (err instanceof TypeError) {
        // Network error — function not reachable (local dev)
        setFetchStatus("unavailable");
      } else {
        setFetchStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Unknown error.");
      }
    }
  }

  return (
    <div className="space-y-6" data-testid="page-news">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">
            News & Resources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Recent developments in diabetes pricing, coverage, and technology
          </p>
        </div>

        {/* Live Refresh Button */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            onClick={handleRefresh}
            disabled={fetchStatus === "loading"}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border border-border bg-card text-foreground hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-refresh-news"
          >
            <RefreshCw className={`size-3.5 ${fetchStatus === "loading" ? "animate-spin" : ""}`} />
            {fetchStatus === "loading" ? "Checking for news…" : "Refresh live news"}
          </button>

          {/* Status feedback */}
          {fetchStatus === "success" && (
            <p className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1">
              <Wifi className="size-3" />
              Live news loaded · {fetchedAt}
            </p>
          )}
          {fetchStatus === "unavailable" && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <WifiOff className="size-3" />
              Live refresh only available on the deployed site
            </p>
          )}
          {fetchStatus === "error" && (
            <p className="text-[11px] text-destructive">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Live items banner */}
      {liveItems.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-md px-3 py-2">
          <Wifi className="size-3.5 shrink-0" />
          Showing {liveItems.filter((item) => !data.recentNews.some((n) => n.url === item.url)).length} new live items alongside {data.recentNews.length} curated items
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
              categoryFilter === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
            }`}
            data-testid={`button-category-${cat}`}
          >
            {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* News Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredNews.map((news, i) => {
          const isLive = liveItems.some((li) => li.url === news.url);
          return (
            <Card
              key={news.url || i}
              className={`flex flex-col ${isLive ? "ring-1 ring-green-400/40 dark:ring-green-600/30" : ""}`}
              data-testid={`card-news-${i}`}
            >
              <CardContent className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="secondary"
                      className={`text-[11px] font-normal shrink-0 ${categoryColors[news.category] || ""}`}
                    >
                      {news.category}
                    </Badge>
                    {isLive && (
                      <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                        Live
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{news.date}</span>
                </div>
                <a
                  href={news.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:text-primary transition-colors leading-snug"
                >
                  {news.title}
                </a>
                <p className="text-[13px] text-muted-foreground leading-relaxed flex-1">
                  {news.summary}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{news.source}</span>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Read more <ExternalLink className="size-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredNews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No news items in this category.
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Curated Sources */}
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">Curated Source Directory</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Trusted sources for diabetes cost and coverage information
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(sourceCategories).map(([key, label]) => {
            const sources = groupedSources[key] || [];
            return (
              <Card key={key}>
                <CardHeader className="pb-2 px-4 pt-4">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    {key === "government" && <Globe className="size-4 text-primary" />}
                    {key === "pharma" && <Newspaper className="size-4 text-chart-2" />}
                    {key === "media" && <Newspaper className="size-4 text-chart-3" />}
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="space-y-2.5">
                    {sources.map((source, i) => (
                      <div key={i} className="space-y-0.5">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                        >
                          {source.name}
                          <ExternalLink className="size-3 text-muted-foreground" />
                        </a>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {source.description}
                        </p>
                      </div>
                    ))}
                    {sources.length === 0 && (
                      <p className="text-xs text-muted-foreground">No sources in this category.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
