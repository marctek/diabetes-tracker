import { useState, useMemo } from "react";
import data from "@/data/diabetes-data.json";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Search, ExternalLink } from "lucide-react";

const typeColors: Record<string, string> = {
  "rapid-acting": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "long-acting": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "intermediate": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "short-acting": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  "mixed": "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "biosimilar": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
};

const types = ["all", "rapid-acting", "long-acting", "intermediate", "short-acting", "mixed", "biosimilar"];

export default function InsulinPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [mfrFilter, setMfrFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<string>("brandName");
  const [sortAsc, setSortAsc] = useState(true);

  const manufacturers = useMemo(() => {
    const set = new Set(data.insulinProducts.map((p) => p.manufacturer));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    let products = [...data.insulinProducts];

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.brandName.toLowerCase().includes(q) ||
          p.genericName.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q)
      );
    }
    if (typeFilter !== "all") {
      products = products.filter((p) => p.type === typeFilter);
    }
    if (mfrFilter !== "all") {
      products = products.filter((p) => p.manufacturer === mfrFilter);
    }

    products.sort((a, b) => {
      const aVal = (a as any)[sortCol] ?? "";
      const bVal = (b as any)[sortCol] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortAsc ? cmp : -cmp;
    });

    return products;
  }, [search, typeFilter, mfrFilter, sortCol, sortAsc]);

  function toggleSort(col: string) {
    if (sortCol === col) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(col);
      setSortAsc(true);
    }
  }

  function SortHeader({ col, children }: { col: string; children: React.ReactNode }) {
    return (
      <TableHead
        className="cursor-pointer select-none whitespace-nowrap text-xs hover:text-foreground"
        onClick={() => toggleSort(col)}
      >
        <span className="inline-flex items-center gap-1">
          {children}
          {sortCol === col && (
            <span className="text-[10px]">{sortAsc ? "↑" : "↓"}</span>
          )}
        </span>
      </TableHead>
    );
  }

  return (
    <div className="space-y-4" data-testid="page-insulin">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">
          Insulin Prices
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.insulinProducts.length} products tracked · Prices as of {data.lastUpdated}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
              data-testid="input-search"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-9" data-testid="select-type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "all" ? "All Types" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={mfrFilter} onValueChange={setMfrFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-9" data-testid="select-manufacturer">
              <SelectValue placeholder="Manufacturer" />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map((m) => (
                <SelectItem key={m} value={m}>
                  {m === "all" ? "All Manufacturers" : m.length > 25 ? m.slice(0, 25) + "…" : m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Card List */}
      <div className="space-y-2">
        {filtered.map((product) => (
          <Collapsible
            key={product.id}
            open={expandedId === product.id}
            onOpenChange={(open) => setExpandedId(open ? product.id : null)}
          >
            <Card data-testid={`row-insulin-${product.id}`}>
              <CollapsibleTrigger asChild>
                <button className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors rounded-xl">
                  <ChevronDown
                    className={`size-4 text-muted-foreground mt-0.5 shrink-0 transition-transform ${
                      expandedId === product.id ? "rotate-180" : ""
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{product.brandName}</span>
                      <Badge
                        variant="secondary"
                        className={`text-[11px] font-normal ${typeColors[product.type] || ""}`}
                      >
                        {product.type}
                      </Badge>
                      {product.ira35Cap && (
                        <Badge className="text-[11px] font-normal bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          ✓ $35 Cap
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.genericName} · {product.manufacturer}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Retail/Vial</span>
                        <p className="text-sm font-medium">{product.retailPriceVial.split("(")[0].trim()}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Retail/Pen</span>
                        <p className="text-sm font-medium">{product.retailPricePen.split("(")[0].trim()}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Insurance</span>
                        <p className="text-sm font-medium">{product.insuranceCopay}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Medicare</span>
                        <p className="text-sm font-medium">{product.medicareCopay}</p>
                      </div>
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-0 border-t border-border/50 mt-0">
                  <div className="grid grid-cols-1 gap-3 mt-3 text-sm">
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Retail Notes</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.retailNotes}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Insurance Notes</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.insuranceNotes}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Medicare Notes</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.medicareNotes}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Patient Assistance</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.patientAssistance}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Forms Available</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.forms.map((f) => (
                          <Badge key={f} variant="outline" className="text-[11px] font-normal">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    {product.sourceUrls.length > 0 && (
                      <div>
                        <span className="font-medium text-xs uppercase text-muted-foreground">Sources</span>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {product.sourceUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="size-3 shrink-0" />
                              {new URL(url).hostname.replace("www.", "")}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              No insulin products match your filters.
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {data.insulinProducts.length} products · Click a row to expand details
      </p>
    </div>
  );
}
