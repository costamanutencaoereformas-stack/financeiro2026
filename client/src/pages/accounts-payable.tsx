import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle,
  Upload,
  Calendar,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel, isOverdue } from "@/lib/utils";
import type { AccountPayable, Supplier, Category, CostCenter } from "@shared/schema";

const accountPayableFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  supplierId: z.string().optional(),
  categoryId: z.string().optional(),
  costCenterId: z.string().optional(),
  notes: z.string().optional(),
  recurrence: z.string().optional(),
});

type AccountPayableFormData = z.infer<typeof accountPayableFormSchema>;

export default function AccountsPayable() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountPayable | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: accounts, isLoading } = useQuery<AccountPayable[]>({
    queryKey: ["/api/accounts-payable"],
  });

  const { data: suppliers } = useQuery<Supplier[]>({
    queryKey: ["/api/suppliers"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: costCenters } = useQuery<CostCenter[]>({
    queryKey: ["/api/cost-centers"],
  });

  const form = useForm<AccountPayableFormData>({
    resolver: zodResolver(accountPayableFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      dueDate: "",
      supplierId: "",
      categoryId: "",
      costCenterId: "",
      notes: "",
      recurrence: "none",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AccountPayableFormData) =>
      apiRequest("POST", "/api/accounts-payable", {
        ...data,
        amount: data.amount,
        supplierId: data.supplierId || null,
        categoryId: data.categoryId || null,
        costCenterId: data.costCenterId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts-payable"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Conta a pagar criada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar a conta.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AccountPayableFormData & { id: string }) =>
      apiRequest("PATCH", `/api/accounts-payable/${data.id}`, {
        ...data,
        amount: data.amount,
        supplierId: data.supplierId || null,
        categoryId: data.categoryId || null,
        costCenterId: data.costCenterId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts-payable"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsOpen(false);
      setEditingAccount(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a conta.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/accounts-payable/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts-payable"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Conta excluída com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a conta.",
        variant: "destructive",
      });
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/accounts-payable/${id}/pay`, {
        paymentDate: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts-payable"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Conta marcada como paga.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a conta como paga.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AccountPayableFormData) => {
    if (editingAccount) {
      updateMutation.mutate({ ...data, id: editingAccount.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (account: AccountPayable) => {
    setEditingAccount(account);
    form.reset({
      description: account.description,
      amount: account.amount,
      dueDate: account.dueDate,
      supplierId: account.supplierId || "",
      categoryId: account.categoryId || "",
      costCenterId: account.costCenterId || "",
      notes: account.notes || "",
      recurrence: account.recurrence || "none",
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingAccount(null);
      form.reset();
    }
  };

  const filteredAccounts = accounts?.filter((account) => {
    const matchesSearch = account.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    let actualStatus = account.status;
    if (actualStatus === "pending" && isOverdue(account.dueDate, account.status)) {
      actualStatus = "overdue";
    }
    
    const matchesStatus =
      statusFilter === "all" || actualStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expenseCategories = categories?.filter((c) => c.type === "expense");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Contas a Pagar</h1>
          <p className="text-muted-foreground">
            Gerencie suas despesas e pagamentos
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-payable">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Editar Conta a Pagar" : "Nova Conta a Pagar"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da conta a pagar
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Aluguel do escritório"
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            {...field}
                            data-testid="input-amount"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Vencimento *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-due-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="supplierId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornecedor</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-supplier">
                              <SelectValue placeholder="Selecione um fornecedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers?.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {expenseCategories?.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="costCenterId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Centro de Custo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-cost-center">
                              <SelectValue placeholder="Selecione um centro de custo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {costCenters?.map((cc) => (
                              <SelectItem key={cc.id} value={cc.id}>
                                {cc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recurrence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recorrência</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-recurrence">
                              <SelectValue placeholder="Sem recorrência" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Sem recorrência</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais..."
                          {...field}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Salvando..."
                      : editingAccount
                      ? "Atualizar"
                      : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Lista de Contas</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="paid">Pagos</SelectItem>
                  <SelectItem value="overdue">Vencidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredAccounts && filteredAccounts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Fornecedor</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const supplier = suppliers?.find((s) => s.id === account.supplierId);
                    const category = categories?.find((c) => c.id === account.categoryId);
                    const overdue = isOverdue(account.dueDate, account.status);
                    const displayStatus = overdue ? "overdue" : account.status;

                    return (
                      <TableRow key={account.id} data-testid={`row-payable-${account.id}`}>
                        <TableCell className="font-medium">
                          {account.description}
                        </TableCell>
                        <TableCell>
                          {supplier ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{supplier.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {category ? (
                            <Badge variant="secondary" className="font-normal">
                              {category.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(account.dueDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(account.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(displayStatus)}>
                            {getStatusLabel(displayStatus)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" data-testid={`button-actions-${account.id}`}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {account.status !== "paid" && (
                                <DropdownMenuItem
                                  onClick={() => markAsPaidMutation.mutate(account.id)}
                                  data-testid={`button-mark-paid-${account.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar como Pago
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleEdit(account)}
                                data-testid={`button-edit-${account.id}`}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteMutation.mutate(account.id)}
                                className="text-destructive"
                                data-testid={`button-delete-${account.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Building2 className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Nenhuma conta encontrada</p>
              <p className="text-sm">Clique em "Nova Conta" para adicionar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
