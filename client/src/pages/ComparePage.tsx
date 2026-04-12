import data from "@/data/diabetes-data.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, AlertTriangle, Building2, ExternalLink } from "lucide-react";

export default function ComparePage() {
  const { regulatoryNotes } = data;
  const iraCap = regulatoryNotes.iraCap as any;
  const stateCaps = regulatoryNotes.stateCaps;

  return (
    <div className="space-y-6" data-testid="page-compare">
      <div>
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">Coverage Comparison</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Side-by-side costs across coverage types · Data as of {data.lastUpdated}
        </p>
      </div>

      {/* Three column comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* No Insurance */}
        <Card className="border-destructive/20">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <AlertTriangle className="size-4 text-destructive" />
              No Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">Insulin</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Retail prices range from <span className="font-medium text-foreground">$25–$275+ per vial</span> depending on brand.
                Most manufacturers offer $35/month programs regardless of insurance status (Lilly Value Program, Novo MyInsulinRx, Sanofi Valyou).
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">CGMs</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monthly costs range from <span className="font-medium text-foreground">$49–$530+</span> without insurance.
                OTC options (Dexcom Stelo, Libre Rio, Lingo) available at $49–$99/month.
                Prescription CGMs (G7, Libre 3) cost $155–$530/month at retail.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">Pumps</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pump hardware ranges from <span className="font-medium text-foreground">$1,000–$9,000+</span>.
                Monthly supplies add $100–$500+/month.
                First-year total: $5,000–$15,000+ without coverage.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Commercial Insurance */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Building2 className="size-4 text-primary" />
              Commercial Insurance
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">Insulin</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Typical copay: <span className="font-medium text-foreground">$35/month</span> via manufacturer programs.
                All major manufacturers (Lilly, Novo Nordisk, Sanofi) auto-apply $35/month caps at most retail pharmacies.
                Some plans cover insulin at $0 copay under preventive benefit.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">CGMs</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Typical copay: <span className="font-medium text-foreground">$0–$75/month</span>.
                Dexcom and Abbott offer copay assistance programs.
                Prior authorization often required. Coverage increasingly common for both Type 1 and Type 2.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">Pumps</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Pump hardware: <span className="font-medium text-foreground">$0–$1,000 copay</span> (most plans cover 80%).
                Monthly supplies: $25–$75/month copay.
                Prior authorization required. Must demonstrate medical necessity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Medicare */}
        <Card className="border-green-500/20">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ShieldCheck className="size-4 text-green-600 dark:text-green-400" />
              Medicare
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">Insulin</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">$35/month cap</span> on all covered insulin per the Inflation Reduction Act.
                Applies to Part D and Part B insulin. No deductible for Part D insulin.
                All 26 tracked products eligible for the cap.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">CGMs</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Covered under <span className="font-medium text-foreground">Medicare Part B</span> as DME.
                20% coinsurance after $257 annual Part B deductible.
                Expanded coverage since April 2023 for all insulin-treated patients.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground mb-1.5">Pumps</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Traditional pumps covered under <span className="font-medium text-foreground">Part B (DME)</span> — 80% covered after deductible.
                Tubeless pumps (Omnipod) covered under <span className="font-medium text-foreground">Part D (pharmacy)</span>.
                Prior authorization and medical necessity documentation required.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IRA $35 Cap Info */}
      <Card data-testid="card-ira-cap">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="size-4 text-primary" />
            Inflation Reduction Act — $35 Insulin Cap
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          {typeof iraCap === "string" ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{iraCap}</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground leading-relaxed">{iraCap.summary}</p>
              {iraCap.details && Array.isArray(iraCap.details) && (
                <ul className="space-y-1">
                  {iraCap.details.map((detail: string, i: number) => (
                    <li key={i} className="text-[13px] text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5 shrink-0">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
              {iraCap.commercialInsuranceStatus && (
                <div className="mt-3 p-3 rounded-md bg-muted/50">
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Commercial Insurance Status</p>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{iraCap.commercialInsuranceStatus}</p>
                </div>
              )}
              {iraCap.sources && Array.isArray(iraCap.sources) && (
                <div className="mt-2">
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {iraCap.sources.map((url: string, i: number) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="size-3 shrink-0" />
                        {(() => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } })()}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* State Caps */}
      <Card data-testid="card-state-caps">
        <CardHeader className="pb-2 px-4 pt-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Building2 className="size-4 text-chart-2" />
            State Insulin Price Caps
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            {stateCaps.length} states/territories have enacted insulin copay cap legislation for state-regulated insurance plans.
          </p>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
            {stateCaps.map((cap: string, i: number) => {
              const colonIdx = cap.indexOf(":");
              const state = colonIdx > -1 ? cap.slice(0, colonIdx) : cap;
              const details = colonIdx > -1 ? cap.slice(colonIdx + 1) : "";
              return (
                <div key={i} className="text-[13px] py-1.5 px-2.5 rounded bg-muted/50">
                  <span className="font-medium text-foreground">{state}</span>
                  {details && <span className="text-muted-foreground">:{details}</span>}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
