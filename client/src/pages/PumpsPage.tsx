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

export default function PumpsPage() {
  const [search, setSearch] = useState("");
  const [mfrFilter, setMfrFilter] = useState("all");
  const [clFilter, setClFilter] = useState("all");
  const [tlFilter, setTlFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  const manufacturers = useMemo(() => {
    const set = new Set(data.pumpProducts.map((p) => p.manufacturer));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    let products = [...data.pumpProducts];

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.manufacturer.toLowerCase().includes(q)
      );
    }
    if (mfrFilter !== "all") {
      products = products.filter((p) => p.manufacturer === mfrFilter);
    }
    if (clFilter !== "all") {
      const isCl = clFilter === "closed";
      products = products.filter((p) => p.closedLoop === isCl);
    }
    if (tlFilter !== "all") {
      const isTl = tlFilter === "tubeless";
      products = products.filter((p) => p.tubeless === isTl);
    }

    products.sort((a, b) => {
      const aVal = (a as any)[sortCol] ?? "";
      const bVal = (b as any)[sortCol] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortAsc ? cmp : -cmp;
    });

    return products;
  }, [search, mfrFilter, clFilter, tlFilter, sortCol, sortAsc]);

  return (
    <div className="space-y-4" data-testid="page-pumps">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Insulin Pumps</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.pumpProducts.length} pump systems tracked · Prices as of {data.lastUpdated}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search pumps..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" data-testid="input-search" />
          </div>
          <Select value={mfrFilter} onValueChange={setMfrFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-9" data-testid="select-manufacturer">
              <SelectValue placeholder="Manufacturer" />
            </SelectTrigger>
            <SelectContent>
              {manufacturers.map((m) => (
                <SelectItem key={m} value={m}>
                  {m === "all" ? "All Manufacturers" : m.length > 30 ? m.slice(0, 30) + "…" : m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={clFilter} onValueChange={setClFilter}>
            <SelectTrigger className="w-full sm:w-[150px] h-9" data-testid="select-closed-loop">
              <SelectValue placeholder="Loop Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="closed">Closed-Loop</SelectItem>
              <SelectItem value="open">Open-Loop</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tlFilter} onValueChange={setTlFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9" data-testid="select-tubeless">
              <SelectValue placeholder="Form" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Forms</SelectItem>
              <SelectItem value="tubeless">Tubeless</SelectItem>
              <SelectItem value="tubed">Tubed</SelectItem>
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
            <Card data-testid={`row-pump-${product.id}`}>
              <CollapsibleTrigger asChild>
                <button className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors rounded-xl">
                  <ChevronDown
                    className={`size-4 text-muted-foreground mt-0.5 shrink-0 transition-transform ${
                      expandedId === product.id ? "rotate-180" : ""
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{product.name}</span>
                      {product.closedLoop && (
                        <Badge className="text-[11px] font-normal bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                          Closed-Loop
                        </Badge>
                      )}
                      {product.tubeless && (
                        <Badge className="text-[11px] font-normal bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                          Tubeless
                        </Badge>
                      )}
                      {product.medicareCovered && (
                        <Badge className="text-[11px] font-normal bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          Medicare ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{product.manufacturer}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Pump Cost</span>
                        <p className="text-sm font-medium">{product.pumpCost}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Monthly Supplies</span>
                        <p className="text-sm font-medium">{product.monthlySupplyCost}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Insurance</span>
                        <p className="text-sm font-medium">{product.insurancePumpCopay}</p>
                      </div>
                    </div>
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-0 border-t border-border/50">
                  <div className="grid grid-cols-1 gap-3 mt-3 text-sm">
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">First Year Cost (No Insurance)</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px]">{product.firstYearCostNoInsurance}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Insurance Monthly Copay</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px]">{product.insuranceMonthlyCopay}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Insurance Notes</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.insuranceNotes}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Medicare Pump Cost</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px]">{product.medicarePumpCost}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Medicare Monthly Supply</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px]">{product.medicareMonthlySupply}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Medicare Notes</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.medicareNotes}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">CGM Integration</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px]">{product.cgmIntegration}</p>
                    </div>
                    <div>
                      <span className="font-medium text-xs uppercase text-muted-foreground">Warranty</span>
                      <p className="mt-0.5 text-muted-foreground text-[13px]">{product.warrantyYears} years</p>
                    </div>
                    {product.features.length > 0 && (
                      <div>
                        <span className="font-medium text-xs uppercase text-muted-foreground">Features</span>
                        <ul className="mt-1 space-y-0.5">
                          {product.features.slice(0, 5).map((f, i) => (
                            <li key={i} className="text-[13px] text-muted-foreground flex items-start gap-1.5">
                              <span className="text-primary mt-1">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                          {product.features.length > 5 && (
                            <li className="text-[12px] text-muted-foreground/60">+{product.features.length - 5} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                    {product.sourceUrls.length > 0 && (
                      <div>
                        <span className="font-medium text-xs uppercase text-muted-foreground">Sources</span>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {product.sourceUrls.map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
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
              No pumps match your filters.
            </CardContent>
          </Card>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {data.pumpProducts.length} pumps · Click a row to expand details
      </p>
    </div>
  );
}
