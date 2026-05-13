import { useState, useMemo } from "react";
import data from "@/data/diabetes-data.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Newspaper, Globe } from "lucide-react";

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

export default function NewsPage() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const categories = ["all", "pricing", "devices", "coverage", "legislation", "research"];

  const filteredNews = useMemo(() => {
    if (categoryFilter === "all") return data.recentNews;
    return data.recentNews.filter((n) => n.category === categoryFilter);
  }, [categoryFilter]);

  const groupedSources = useMemo(() => {
    const groups: Record<string, typeof data.newsSources> = {};
    data.newsSources.forEach((s) => {
      const cat = s.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    });
    return groups;
  }, []);

  return (
    <div className="space-y-6" data-testid="page-news">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">News & Resources</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Recent developments in diabetes pricing, coverage, and technology
        </p>
      </div>

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
        {filteredNews.map((news, i) => (
          <Card key={i} className="flex flex-col" data-testid={`card-news-${i}`}>
            <CardContent className="p-4 flex flex-col gap-2 flex-1">
              <div className="flex items-start justify-between gap-2">
                <Badge
                  variant="secondary"
                  className={`text-[11px] font-normal shrink-0 ${categoryColors[news.category] || ""}`}
                >
                  {news.category}
                </Badge>
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
        ))}
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
