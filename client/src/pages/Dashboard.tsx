import data from "@/data/diabetes-data.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Syringe, Activity, Cpu, ShieldCheck, Factory, DollarSign } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const insulinCount = data.insulinProducts.length;
  const cgmCount = data.cgmProducts.length;
  const pumpCount = data.pumpProducts.length;

  const manufacturers = new Set<string>();
  data.insulinProducts.forEach((p) => manufacturers.add(p.manufacturer));
  data.cgmProducts.forEach((p) => manufacturers.add(p.manufacturer));
  data.pumpProducts.forEach((p) => manufacturers.add(p.manufacturer));

  const ira35Products = data.insulinProducts.filter((p) => p.ira35Cap).length;

  return (
    <div className="space-y-6" data-testid="page-dashboard">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Track current diabetes medication, device, and supply costs across insurance types.
          Prices reflect manufacturer list prices and common out-of-pocket costs as of{" "}
          <span className="font-medium text-foreground">{data.lastUpdated}</span>.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card data-testid="card-kpi-insulin-count">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Insulin Products</p>
                <p className="text-2xl font-bold mt-1">{insulinCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">brands & generics tracked</p>
              </div>
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Syringe className="size-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-price-range">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg Retail Range</p>
                <p className="text-2xl font-bold mt-1">$25–$275</p>
                <p className="text-xs text-muted-foreground mt-0.5">per vial (post-2023 cuts)</p>
              </div>
              <div className="size-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <DollarSign className="size-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-medicare-cap">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Medicare $35 Cap</p>
                <p className="text-2xl font-bold mt-1">{ira35Products}/{insulinCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">insulin products covered</p>
              </div>
              <div className="size-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="size-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-kpi-manufacturers">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Manufacturers</p>
                <p className="text-2xl font-bold mt-1">{manufacturers.size}</p>
                <p className="text-xs text-muted-foreground mt-0.5">across all categories</p>
              </div>
              <div className="size-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                <Factory className="size-5 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/insulin">
          <Card className="cursor-pointer hover:border-primary/30 transition-colors" data-testid="card-category-insulin">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Syringe className="size-4 text-primary" />
                </div>
                Insulin Products
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5">
              <p className="text-sm text-muted-foreground">
                {insulinCount} products across rapid-acting, long-acting, intermediate, short-acting, mixed, and biosimilar types.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["rapid-acting", "long-acting", "intermediate", "short-acting", "mixed", "biosimilar"].map((t) => {
                  const count = data.insulinProducts.filter((p) => p.type === t).length;
                  if (count === 0) return null;
                  return (
                    <Badge key={t} variant="secondary" className="text-xs font-normal">
                      {t} ({count})
                    </Badge>
                  );
                })}
              </div>
              <p className="text-xs text-primary font-medium">View all insulin prices →</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cgm">
          <Card className="cursor-pointer hover:border-primary/30 transition-colors" data-testid="card-category-cgm">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="size-8 rounded-md bg-chart-2/10 flex items-center justify-center">
                  <Activity className="size-4 text-chart-2" />
                </div>
                CGM Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5">
              <p className="text-sm text-muted-foreground">
                {cgmCount} continuous glucose monitoring systems including OTC and prescription options.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs font-normal">
                  OTC ({data.cgmProducts.filter((p) => p.otcAvailable).length})
                </Badge>
                <Badge variant="secondary" className="text-xs font-normal">
                  Rx ({data.cgmProducts.filter((p) => !p.otcAvailable).length})
                </Badge>
              </div>
              <p className="text-xs text-chart-2 font-medium">View all CGM prices →</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/pumps">
          <Card className="cursor-pointer hover:border-primary/30 transition-colors" data-testid="card-category-pumps">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <div className="size-8 rounded-md bg-chart-3/10 flex items-center justify-center">
                  <Cpu className="size-4 text-chart-3" />
                </div>
                Insulin Pumps
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2.5">
              <p className="text-sm text-muted-foreground">
                {pumpCount} insulin pump systems from tubed to tubeless, open-loop and closed-loop.
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs font-normal">
                  Closed-loop ({data.pumpProducts.filter((p) => p.closedLoop).length})
                </Badge>
                <Badge variant="secondary" className="text-xs font-normal">
                  Tubeless ({data.pumpProducts.filter((p) => p.tubeless).length})
                </Badge>
              </div>
              <p className="text-xs text-chart-3 font-medium">View all pump prices →</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Updated indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="size-1.5 rounded-full bg-green-500" />
        Last updated: {data.lastUpdated}
      </div>
    </div>
  );
}
