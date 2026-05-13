import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ThemeProvider";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Syringe,
  Activity,
  Cpu,
  GitCompareArrows,
  Newspaper,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

const navItems = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Insulin", href: "/insulin", icon: Syringe },
  { title: "CGMs", href: "/cgm", icon: Activity },
  { title: "Pumps", href: "/pumps", icon: Cpu },
  { title: "Compare", href: "/compare", icon: GitCompareArrows },
  { title: "News", href: "/news", icon: Newspaper },
];

function AppLogo({ collapsed }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="DiabetesRx Tracker logo"
        className="shrink-0"
      >
        <rect x="2" y="2" width="28" height="28" rx="6" stroke="currentColor" strokeWidth="2" className="text-sidebar-primary" />
        <path d="M16 7v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-sidebar-primary" />
        <path d="M10 13h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-sidebar-primary" />
        <circle cx="16" cy="22" r="2" fill="currentColor" className="text-sidebar-primary" />
        <path d="M11 8.5C11 8.5 13 10 16 10s5-1.5 5-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-sidebar-primary-foreground opacity-40" />
      </svg>
      {!collapsed && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-foreground">DiabetesRx</span>
          <span className="text-xs text-sidebar-foreground/60">Tracker</span>
        </div>
      )}
    </div>
  );
}

function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar collapsible="icon" data-testid="sidebar-nav">
      <SidebarHeader className="py-4 px-3">
        <AppLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? location === "/" || location === ""
                    : location.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href} data-testid={`nav-${item.title.toLowerCase()}`}>
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-3 pb-3">
        <div className="text-[11px] text-sidebar-foreground/40 leading-tight group-data-[collapsible=icon]:hidden">
          Data current as of March 2026. Not medical advice.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-8 text-muted-foreground"
      data-testid="button-theme-toggle"
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between px-4 py-2 border-b bg-background/80 backdrop-blur-sm shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            <div className="max-w-[1400px] mx-auto p-4 md:p-6">
              {children}
            </div>
            <PerplexityAttribution />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
