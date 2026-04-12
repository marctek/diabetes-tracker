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
import { ChevronDown, Search, ExternalLink, Check, X } from "lucide-react";

export default function CGMPage() {
  const [search, setSearch] = useState("");
  const [mfrFilter, setMfrFilter] = useState("all");
  const [otcFilter, setOtcFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  const manufacturers = useMemo(() => {
    const set = new Set(data.cgmProducts.map((p) => p.manufacturer));
    return ["all", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    let products = [...data.cgmProducts];

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
    if (otcFilter !== "all") {
      const isOtc = otcFilter === "otc";
      products = products.filter((p) => p.otcAvailable === isOtc);
    }

    products.sort((a, b) => {
      const aVal = (a as any)[sortCol] ?? "";
      const bVal = (b as any)[sortCol] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortAsc ? cmp : -cmp;
    });

    return products;
  }, [search, mfrFilter, otcFilter, sortCol, sortAsc]);

  function toggleSort(col: string) {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(true); }
  }

  function SortHeader({ col, children }: { col: string; children: React.ReactNode }) {
    return (
      <TableHead className="cursor-pointer select-none whitespace-nowrap text-xs hover:text-foreground" onClick={() => toggleSort(col)}>
        <span className="inline-flex items-center gap-1">
          {children}
          {sortCol === col && <span className="text-[10px]">{sortAsc ? "↑" : "↓"}</span>}
        </span>
      </TableHead>
    );
  }

  function BoolCell({ value }: { value: boolean }) {
    return value ? (
      <Check className="size-4 text-green-600 dark:text-green-400" />
    ) : (
      <X className="size-4 text-muted-foreground/40" />
    );
  }

  return (
    <div className="space-y-4" data-testid="page-cgm">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">CGM Prices</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data.cgmProducts.length} continuous glucose monitors tracked · Prices as of {data.lastUpdated}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input placeholder="Search CGM devices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" data-testid="input-search" />
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
          <Select value={otcFilter} onValueChange={setOtcFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-9" data-testid="select-otc">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="otc">OTC</SelectItem>
              <SelectItem value="rx">Prescription</SelectItem>
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
                <SortHeader col="name">Name</SortHeader>
                <SortHeader col="manufacturer">Manufacturer</SortHeader>
                <TableHead className="text-xs whitespace-nowrap">Monthly Cost (No Ins.)</TableHead>
                <TableHead className="text-xs whitespace-nowrap">Insurance Copay</TableHead>
                <SortHeader col="medicareCovered">Medicare</SortHeader>
                <SortHeader col="wearTime">Wear Time</SortHeader>
                <SortHeader col="otcAvailable">OTC</SortHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <Collapsible
                  key={product.id}
                  open={expandedId === product.id}
                  onOpenChange={(open) => setExpandedId(open ? product.id : null)}
                  asChild
                >
                  <>
                    <CollapsibleTrigger asChild>
                      <TableRow className="cursor-pointer hover:bg-muted/50" data-testid={`row-cgm-${product.id}`}>
                        <TableCell className="w-8 pr-0">
                          <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${expandedId === product.id ? "rotate-180" : ""}`} />
                        </TableCell>
                        <TableCell className="font-medium text-sm whitespace-nowrap">
                          {product.name.length > 35 ? product.name.slice(0, 35) + "…" : product.name}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {product.manufacturer.split(" ")[0]}{product.manufacturer.includes("/") ? " / " + product.manufacturer.split("/")[1]?.trim().split(" ")[0] : ""}
                        </TableCell>
                        <TableCell className="text-sm">{product.monthlyCostNoInsurance.slice(0, 30)}</TableCell>
                        <TableCell className="text-sm max-w-[180px] truncate">{product.insuranceCopay.slice(0, 40)}</TableCell>
                        <TableCell><BoolCell value={product.medicareCovered} /></TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{product.wearTime.slice(0, 20)}</TableCell>
                        <TableCell>
                          {product.otcAvailable ? (
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 text-[11px] font-normal">OTC</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[11px] font-normal">Rx</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    </CollapsibleTrigger>
                    <CollapsibleContent asChild>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">Sensor Cost</span>
                                <p className="mt-0.5 text-muted-foreground text-[13px]">{product.sensorCostPerUnit}</p>
                              </div>
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">Transmitter</span>
                                <p className="mt-0.5 text-muted-foreground text-[13px]">{product.transmitterCost}</p>
                              </div>
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">Reader</span>
                                <p className="mt-0.5 text-muted-foreground text-[13px]">{product.readerCost}</p>
                              </div>
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">Insurance Notes</span>
                                <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.insuranceNotes}</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">Medicare Part B Copay</span>
                                <p className="mt-0.5 text-muted-foreground text-[13px]">{product.medicarePartBCopay}</p>
                              </div>
                              <div>
                                <span className="font-medium text-xs uppercase text-muted-foreground">Medicare Notes</span>
                                <p className="mt-0.5 text-muted-foreground text-[13px] leading-relaxed">{product.medicareNotes}</p>
                              </div>
                              {product.features.length > 0 && (
                                <div>
                                  <span className="font-medium text-xs uppercase text-muted-foreground">Features</span>
                                  <ul className="mt-1 space-y-0.5">
                                    {product.features.slice(0, 6).map((f, i) => (
                                      <li key={i} className="text-[13px] text-muted-foreground flex items-start gap-1.5">
                                        <span className="text-primary mt-1">•</span>
                                        <span>{f}</span>
                                      </li>
                                    ))}
                                    {product.features.length > 6 && (
                                      <li className="text-[12px] text-muted-foreground/60">
                                        +{product.features.length - 6} more features
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                              {product.sourceUrls.length > 0 && (
                                <div>
                                  <span className="font-medium text-xs uppercase text-muted-foreground">Sources</span>
                                  <div className="flex flex-col gap-0.5 mt-1">
                                    {product.sourceUrls.map((url, i) => (
                                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline truncate max-w-sm">
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
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No CGM devices match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {data.cgmProducts.length} devices · Click a row to expand details
      </p>
    </div>
  );
}
