import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrency } from "@/lib/utils";
import type { DREData } from "@shared/schema";

interface DREPeriod {
  year: number;
  month: number;
}

interface DREComparison {
  current: DREData;
  previous: DREData;
  percentageChange: {
    grossRevenue: number;
    netProfit: number;
  };
}

interface DRELineItem {
  label: string;
  value: number;
  percentage?: number;
  indent?: number;
  isTotal?: boolean;
  isSubtotal?: boolean;
  items?: DRELineItem[];
}

function DRERow({
  item,
  comparison,
}: {
  item: DRELineItem;
  comparison?: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.items && item.items.length > 0;

  const bgClass = item.isTotal
    ? "bg-muted/50 font-bold"
    : item.isSubtotal
    ? "bg-muted/30 font-semibold"
    : "";

  const paddingClass = item.indent ? `pl-${(item.indent + 1) * 4}` : "pl-4";

  return (
    <>
      <div
        className={`flex items-center justify-between py-3 px-4 border-b ${bgClass}`}
        data-testid={`dre-row-${item.label.toLowerCase().replace(/\s/g, "-")}`}
      >
        <div className={`flex items-center gap-2 ${paddingClass} flex-1`}>
          {hasChildren && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          )}
          <span className={item.isTotal || item.isSubtotal ? "" : "text-muted-foreground"}>
            {item.label}
          </span>
        </div>
        <div className="flex items-center gap-8">
          <span
            className={`text-right min-w-[120px] ${
              item.value < 0 ? "text-red-600" : item.value > 0 ? "text-foreground" : ""
            }`}
          >
            {formatCurrency(Math.abs(item.value))}
            {item.value < 0 && " (-)"}
          </span>
          {item.percentage !== undefined && (
            <span className="text-right min-w-[80px] text-muted-foreground">
              {item.percentage.toFixed(1)}%
            </span>
          )}
          {comparison !== undefined && (
            <span
              className={`text-right min-w-[100px] flex items-center gap-1 ${
                comparison >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {comparison >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {comparison >= 0 ? "+" : ""}
              {comparison.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      {hasChildren && isOpen && (
        <div>
          {item.items!.map((child, index) => (
            <DRERow key={index} item={child} />
          ))}
        </div>
      )}
    </>
  );
}

export default function DRE() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedPeriod, setSelectedPeriod] = useState({
    year: currentYear,
    month: currentMonth,
  });
  const [comparisonPeriod, setComparisonPeriod] = useState({
    year: currentYear,
    month: currentMonth - 1 || 12,
  });

  const { data: dreData, isLoading } = useQuery<DREComparison>({
    queryKey: ["/api/dre", selectedPeriod.year, selectedPeriod.month],
  });

  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const dreItems: DRELineItem[] = dreData
    ? [
        {
          label: "RECEITA BRUTA",
          value: dreData.current.grossRevenue,
          percentage: 100,
          isTotal: true,
        },
        {
          label: "(-) Deduções",
          value: -dreData.current.deductions,
          percentage: dreData.current.grossRevenue > 0
            ? (dreData.current.deductions / dreData.current.grossRevenue) * 100
            : 0,
          indent: 1,
        },
        {
          label: "RECEITA LÍQUIDA",
          value: dreData.current.netRevenue,
          percentage: dreData.current.grossRevenue > 0
            ? (dreData.current.netRevenue / dreData.current.grossRevenue) * 100
            : 0,
          isSubtotal: true,
        },
        {
          label: "(-) Custos",
          value: -dreData.current.costs,
          percentage: dreData.current.grossRevenue > 0
            ? (dreData.current.costs / dreData.current.grossRevenue) * 100
            : 0,
          indent: 1,
        },
        {
          label: "LUCRO BRUTO",
          value: dreData.current.grossProfit,
          percentage: dreData.current.grossRevenue > 0
            ? (dreData.current.grossProfit / dreData.current.grossRevenue) * 100
            : 0,
          isSubtotal: true,
        },
        {
          label: "(-) Despesas Operacionais",
          value: -dreData.current.operationalExpenses,
          percentage: dreData.current.grossRevenue > 0
            ? (dreData.current.operationalExpenses / dreData.current.grossRevenue) * 100
            : 0,
          indent: 1,
        },
        {
          label: "LUCRO OPERACIONAL",
          value: dreData.current.operationalProfit,
          percentage: dreData.current.grossRevenue > 0
            ? (dreData.current.operationalProfit / dreData.current.grossRevenue) * 100
            : 0,
          isSubtotal: true,
        },
        {
          label: "LUCRO LÍQUIDO",
          value: dreData.current.netProfit,
          percentage: dreData.current.grossRevenue > 0
            ? (dreData.current.netProfit / dreData.current.grossRevenue) * 100
            : 0,
          isTotal: true,
        },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            DRE - Demonstrativo de Resultado
          </h1>
          <p className="text-muted-foreground">
            Análise de resultado do exercício
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={selectedPeriod.month.toString()}
            onValueChange={(v) =>
              setSelectedPeriod((prev) => ({ ...prev, month: parseInt(v) }))
            }
          >
            <SelectTrigger className="w-[140px]" data-testid="select-month">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={selectedPeriod.year.toString()}
            onValueChange={(v) =>
              setSelectedPeriod((prev) => ({ ...prev, year: parseInt(v) }))
            }
          >
            <SelectTrigger className="w-[100px]" data-testid="select-year">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Bruta
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-gross-revenue">
                  {formatCurrency(dreData?.current.grossRevenue || 0)}
                </div>
                {dreData?.percentageChange?.grossRevenue !== undefined && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {dreData.percentageChange.grossRevenue >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={
                        dreData.percentageChange.grossRevenue >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {dreData.percentageChange.grossRevenue >= 0 ? "+" : ""}
                      {dreData.percentageChange.grossRevenue.toFixed(1)}%
                    </span>
                    vs. mês anterior
                  </p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lucro Bruto
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-gross-profit">
                  {formatCurrency(dreData?.current.grossProfit || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Margem:{" "}
                  {dreData?.current.grossRevenue
                    ? (
                        (dreData.current.grossProfit / dreData.current.grossRevenue) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Margem de Contribuição
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-contribution-margin">
                  {formatCurrency(dreData?.current.contributionMargin || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {dreData?.current.grossRevenue
                    ? (
                        (dreData.current.contributionMargin /
                          dreData.current.grossRevenue) *
                        100
                      ).toFixed(1)
                    : 0}
                  % da receita
                </p>
              </CardContent>
            </Card>
            <Card
              className={
                (dreData?.current.netProfit || 0) >= 0
                  ? "bg-green-50 dark:bg-green-950/20"
                  : "bg-red-50 dark:bg-red-950/20"
              }
            >
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lucro Líquido
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    (dreData?.current.netProfit || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                  data-testid="text-net-profit"
                >
                  {formatCurrency(dreData?.current.netProfit || 0)}
                </div>
                {dreData?.percentageChange?.netProfit !== undefined && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {dreData.percentageChange.netProfit >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={
                        dreData.percentageChange.netProfit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {dreData.percentageChange.netProfit >= 0 ? "+" : ""}
                      {dreData.percentageChange.netProfit.toFixed(1)}%
                    </span>
                    vs. mês anterior
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-lg">Demonstrativo Detalhado</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Valor (R$)</span>
              <span>% Receita</span>
              <span>Variação</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : dreItems.length > 0 ? (
            <div className="divide-y">
              {dreItems.map((item, index) => (
                <DRERow
                  key={index}
                  item={item}
                  comparison={
                    item.label === "RECEITA BRUTA"
                      ? dreData?.percentageChange?.grossRevenue
                      : item.label === "LUCRO LÍQUIDO"
                      ? dreData?.percentageChange?.netProfit
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Sem dados para o período</p>
              <p className="text-sm">
                Cadastre receitas e despesas para gerar o DRE
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
