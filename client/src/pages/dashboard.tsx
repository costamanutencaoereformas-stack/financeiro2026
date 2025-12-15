import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatDate, getDaysUntilDue, getStatusColor, getStatusLabel } from "@/lib/utils";
import type { DashboardStats, CashFlowData, CategoryExpense, AccountPayable, AccountReceivable } from "@shared/schema";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: {
  title: string;
  value: string;
  icon: typeof TrendingUp;
  trend?: "up" | "down";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const variantStyles = {
    default: "bg-card",
    success: "bg-green-50 dark:bg-green-950/20",
    warning: "bg-yellow-50 dark:bg-yellow-950/20",
    danger: "bg-red-50 dark:bg-red-950/20",
  };

  return (
    <Card className={variantStyles[variant]}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={`text-kpi-${title.toLowerCase().replace(/\s/g, "-")}`}>{value}</div>
        {trend && trendValue && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-600" />
            )}
            <span className={trend === "up" ? "text-green-600" : "text-red-600"}>
              {trendValue}
            </span>
            vs. período anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingPaymentsList({ items, type }: { items: (AccountPayable | AccountReceivable)[]; type: "payable" | "receivable" }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Calendar className="h-8 w-8 mb-2" />
        <p className="text-sm">Nenhuma conta próxima do vencimento</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.slice(0, 5).map((item) => {
        const daysUntil = getDaysUntilDue(item.dueDate);
        const isUrgent = daysUntil <= 0;
        const isWarning = daysUntil > 0 && daysUntil <= 3;

        return (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 rounded-md bg-muted/50"
            data-testid={`card-upcoming-${type}-${item.id}`}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.description}</p>
              <p className="text-xs text-muted-foreground">
                Vence em {formatDate(item.dueDate)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {formatCurrency(item.amount)}
              </span>
              {isUrgent && (
                <Badge variant="destructive" className="text-xs">
                  Vencido
                </Badge>
              )}
              {isWarning && (
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 text-xs">
                  {daysUntil}d
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: cashFlow, isLoading: cashFlowLoading } = useQuery<CashFlowData[]>({
    queryKey: ["/api/dashboard/cash-flow"],
  });

  const { data: categoryExpenses, isLoading: expensesLoading } = useQuery<CategoryExpense[]>({
    queryKey: ["/api/dashboard/category-expenses"],
  });

  const { data: upcomingPayables, isLoading: payablesLoading } = useQuery<AccountPayable[]>({
    queryKey: ["/api/accounts-payable/upcoming"],
  });

  const { data: upcomingReceivables, isLoading: receivablesLoading } = useQuery<AccountReceivable[]>({
    queryKey: ["/api/accounts-receivable/upcoming"],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas finanças
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <KPICard
              title="Receitas"
              value={formatCurrency(stats?.totalRevenue || 0)}
              icon={TrendingUp}
              trend="up"
              trendValue="+12%"
              variant="success"
            />
            <KPICard
              title="Despesas"
              value={formatCurrency(stats?.totalExpenses || 0)}
              icon={TrendingDown}
              trend="down"
              trendValue="-5%"
              variant="danger"
            />
            <KPICard
              title="Saldo Atual"
              value={formatCurrency(stats?.balance || 0)}
              icon={Wallet}
            />
            <KPICard
              title="Saldo Projetado"
              value={formatCurrency(stats?.projectedBalance || 0)}
              icon={Wallet}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(stats?.overduePayables || 0) > 0 && (
          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  {stats?.overduePayables} contas a pagar vencidas
                </p>
                <p className="text-xs text-red-600 dark:text-red-400">
                  Regularize para evitar juros
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {(stats?.overdueReceivables || 0) > 0 && (
          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
            <CardContent className="flex items-center gap-3 p-4">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {stats?.overdueReceivables} contas a receber vencidas
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Entre em contato com os clientes
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {(stats?.dueTodayCount || 0) > 0 && (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {stats?.dueTodayCount} contas vencem hoje
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Verifique os pagamentos do dia
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fluxo de Caixa</CardTitle>
          </CardHeader>
          <CardContent>
            {cashFlowLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : cashFlow && cashFlow.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      const date = new Date(value + "T00:00:00");
                      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
                    }}
                    className="text-xs"
                  />
                  <YAxis
                    tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelFormatter={(label) => formatDate(label)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    name="Receitas"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    name="Despesas"
                    stroke="hsl(var(--chart-5))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    name="Saldo"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <TrendingUp className="h-12 w-12 mb-2" />
                <p>Sem dados de fluxo de caixa</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : categoryExpenses && categoryExpenses.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryExpenses}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {categoryExpenses.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoryExpenses.map((category, index) => (
                    <div key={category.categoryId} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-sm flex-1 truncate">{category.categoryName}</span>
                      <span className="text-sm font-medium">{category.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <BarChart3 className="h-12 w-12 mb-2" />
                <p>Sem dados de despesas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contas a Pagar Próximas</CardTitle>
          </CardHeader>
          <CardContent>
            {payablesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <UpcomingPaymentsList items={upcomingPayables || []} type="payable" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contas a Receber Próximas</CardTitle>
          </CardHeader>
          <CardContent>
            {receivablesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <UpcomingPaymentsList items={upcomingReceivables || []} type="receivable" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { BarChart3 } from "lucide-react";
