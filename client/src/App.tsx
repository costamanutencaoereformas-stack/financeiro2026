import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/dashboard";
import AccountsPayable from "@/pages/accounts-payable";
import AccountsReceivable from "@/pages/accounts-receivable";
import CashFlow from "@/pages/cash-flow";
import DRE from "@/pages/dre";
import Reports from "@/pages/reports";
import Suppliers from "@/pages/suppliers";
import Clients from "@/pages/clients";
import Categories from "@/pages/categories";
import CostCenters from "@/pages/cost-centers";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/contas-pagar" component={AccountsPayable} />
      <Route path="/contas-receber" component={AccountsReceivable} />
      <Route path="/fluxo-caixa" component={CashFlow} />
      <Route path="/dre" component={DRE} />
      <Route path="/relatorios" component={Reports} />
      <Route path="/fornecedores" component={Suppliers} />
      <Route path="/clientes" component={Clients} />
      <Route path="/categorias" component={Categories} />
      <Route path="/centros-custo" component={CostCenters} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="fincontrol-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between gap-2 p-3 border-b bg-background sticky top-0 z-50">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto bg-muted/30">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
