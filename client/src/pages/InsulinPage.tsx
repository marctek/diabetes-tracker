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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Search, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <SortHeader col="brandName">Brand</SortHeader>
                <SortHeader col="genericName">Generic Name</SortHeader>
                <SortHeader col="manufacturer">Manufacturer</SortHeader>
                <SortHeader col="type">Type</SortHeader>
                <TableHead className="text-xs whitespace-nowrap">Retail (Vial)</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Retail (Pen)</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Insurance Copay</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Medicare Copay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <Collapsible
                  key={product.id}
                  open={expandedId === product.id}
                  onOpenChange={(open) =>
                    setExpandedId(open ? product.id : null)
                  }
                  asChild
                >
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow
                        className="cursor-pointer hover:bg-muted/50"
                        data-testid={`row-insulin-${product.id}`}
                      >
                        <TableCell className="w-8 pr-0">
                          <ChevronDown
                            className={`size-3.5 text-muted-foreground transition-transform ${
                              expandedId === product.id ? "rotate-180" : ""
                            }`}
                          />
                        </TableCell>
                        <TableCell className="font-medium text-sm whitespace-nowrap">
                          {product.brandName.length > 30
                            ? product.brandName.slice(0, 30) + "…"
                            : product.brandName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {product.genericName}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {product.manufacturer.length > 20
                            ? product.manufacturer.split(" ")[0] + (product.manufacturer.split(" ").length > 1 ? "…" : "")
                            : product.manufacturer}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`text-[11px] font-normal ${typeColors[product.type] || ""}`}
                          >
                            {product.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {product.retailPriceVial.split("(")[0].trim().slice(0, 20)}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {product.retailPricePen.split("(")[0].trim().slice(0, 20)}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {product.insuranceCopay.slice(0, 25)}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {product.medicareCopay.slice(0, 25)}
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={9} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
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
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">Patient Assistance</span>
                                <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.patientAssistance}</p>
                              </div>
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">Forms Available</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {product.forms.map((f) => (
                                    <Badge key={f} variant="outline" className="text-[11px] font-normal">
                                      {f}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">IRA $35 Cap</span>
                                <p className="mt-0.5">
                                  {product.ira35Cap ? (
                                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-[11px] font-normal">
                                      ✓ Eligible
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[11px] font-normal">Not applicable</Badge>
                                  )}
                                </p>
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
                                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-sm"
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
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No insulin products match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {data.insulinProducts.length} products · Click a row to expand details
      </p>
    </div>
  );
}
