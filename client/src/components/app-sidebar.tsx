import { useLocation, Link } from "wouter";
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  TrendingUp,
  FileText,
  BarChart3,
  Building2,
  Users,
  Tags,
  FolderTree,
  RefreshCw,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Contas a Pagar",
    url: "/contas-pagar",
    icon: CreditCard,
  },
  {
    title: "Contas a Receber",
    url: "/contas-receber",
    icon: Wallet,
  },
  {
    title: "Fluxo de Caixa",
    url: "/fluxo-caixa",
    icon: TrendingUp,
  },
  {
    title: "DRE",
    url: "/dre",
    icon: FileText,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
  },
];

const settingsNavItems = [
  {
    title: "Fornecedores",
    url: "/fornecedores",
    icon: Building2,
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
  },
  {
    title: "Categorias",
    url: "/categorias",
    icon: Tags,
  },
  {
    title: "Centros de Custo",
    url: "/centros-custo",
    icon: FolderTree,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold" data-testid="text-app-name">FinControl</span>
            <span className="text-xs text-muted-foreground">Controle Financeiro</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Cadastros</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                  >
                    <Link href={item.url} data-testid={`link-nav-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button variant="outline" className="w-full gap-2" data-testid="button-sync-mercadopago">
          <RefreshCw className="h-4 w-4" />
          Sincronizar Mercado Pago
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
