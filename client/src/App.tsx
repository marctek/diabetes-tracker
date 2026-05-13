import { Switch, Route, Router } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import InsulinPage from "@/pages/InsulinPage";
import CGMPage from "@/pages/CGMPage";
import PumpsPage from "@/pages/PumpsPage";
import ComparePage from "@/pages/ComparePage";
import NewsPage from "@/pages/NewsPage";

function AppRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/insulin" component={InsulinPage} />
        <Route path="/cgm" component={CGMPage} />
        <Route path="/pumps" component={PumpsPage} />
        <Route path="/compare" component={ComparePage} />
        <Route path="/news" component={NewsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
