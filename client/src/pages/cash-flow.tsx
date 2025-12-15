import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CashFlowData } from "@shared/schema";

type ViewPeriod = "daily" | "weekly" | "monthly";

interface CashFlowSummary {
  totalIncome: number;
  totalExpense: number;
  netFlow: number;
  projectedBalance: number;
  currentBalance: number;
}

export default function CashFlow() {
  const [period, setPeriod] = useState<ViewPeriod>("daily");

  const { data: cashFlowData, isLoading } = useQuery<CashFlowData[]>({
    queryKey: ["/api/cash-flow", period],
  });

  const { data: summary, isLoading: summaryLoading } = useQuery<CashFlowSummary>({
    queryKey: ["/api/cash-flow/summary", period],
  });

  const getChartData = () => {
    if (!cashFlowData) return [];
    return cashFlowData;
  };

  const chartData = getChartData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Acompanhe a movimentação financeira da empresa
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as ViewPeriod)}>
          <TabsList>
            <TabsTrigger value="daily" data-testid="tab-daily">Diário</TabsTrigger>
            <TabsTrigger value="weekly" data-testid="tab-weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly" data-testid="tab-monthly">Mensal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
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
            <Card className="bg-green-50 dark:bg-green-950/20">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Entradas
                </CardTitle>
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600" data-testid="text-total-income">
                  {formatCurrency(summary?.totalIncome || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 dark:bg-red-950/20">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Saídas
                </CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-total-expense">
                  {formatCurrency(summary?.totalExpense || 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Atual
                </CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-current-balance">
                  {formatCurrency(summary?.currentBalance || 0)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo Projetado
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600" data-testid="text-projected-balance">
                  {formatCurrency(summary?.projectedBalance || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado nas contas cadastradas
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fluxo de Caixa - Evolução</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Saldo"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorBalance)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                <TrendingUp className="h-12 w-12 mb-2" />
                <p>Sem dados de fluxo de caixa</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entradas vs Saídas</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
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
                  <Legend />
                  <Bar dataKey="income" name="Entradas" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Saídas" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
                <Calendar className="h-12 w-12 mb-2" />
                <p>Sem dados para exibir</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Movimentações Detalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : chartData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Entradas</TableHead>
                    <TableHead className="text-right">Saídas</TableHead>
                    <TableHead className="text-right">Saldo do Dia</TableHead>
                    <TableHead className="text-right">Saldo Acumulado</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((row, index) => (
                    <TableRow key={index} data-testid={`row-cashflow-${index}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formatDate(row.date)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-green-600 dark:text-green-400">
                        {row.income > 0 ? formatCurrency(row.income) : "-"}
                      </TableCell>
                      <TableCell className="text-right text-red-600 dark:text-red-400">
                        {row.expense > 0 ? formatCurrency(row.expense) : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={row.income - row.expense >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(row.income - row.expense)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(row.balance)}
                      </TableCell>
                      <TableCell>
                        {row.projected ? (
                          <span className="text-xs text-muted-foreground italic">Projetado</span>
                        ) : (
                          <span className="text-xs text-green-600">Realizado</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Sem movimentações</p>
              <p className="text-sm">Cadastre contas a pagar e receber para visualizar o fluxo</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
