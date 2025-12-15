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
  Calendar,
  Users,
  Wallet,
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
import type { AccountReceivable, Client, Category } from "@shared/schema";

const accountReceivableFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  clientId: z.string().optional(),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
});

type AccountReceivableFormData = z.infer<typeof accountReceivableFormSchema>;

export default function AccountsReceivable() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountReceivable | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: accounts, isLoading } = useQuery<AccountReceivable[]>({
    queryKey: ["/api/accounts-receivable"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<AccountReceivableFormData>({
    resolver: zodResolver(accountReceivableFormSchema),
    defaultValues: {
      description: "",
      amount: "",
      dueDate: "",
      clientId: "",
      categoryId: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: AccountReceivableFormData) =>
      apiRequest("POST", "/api/accounts-receivable", {
        ...data,
        amount: data.amount,
        clientId: data.clientId || null,
        categoryId: data.categoryId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts-receivable"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      setIsOpen(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Conta a receber criada com sucesso.",
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
    mutationFn: (data: AccountReceivableFormData & { id: string }) =>
      apiRequest("PATCH", `/api/accounts-receivable/${data.id}`, {
        ...data,
        amount: data.amount,
        clientId: data.clientId || null,
        categoryId: data.categoryId || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts-receivable"] });
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
    mutationFn: (id: string) => apiRequest("DELETE", `/api/accounts-receivable/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts-receivable"] });
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

  const markAsReceivedMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("PATCH", `/api/accounts-receivable/${id}/receive`, {
        receivedDate: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts-receivable"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Sucesso",
        description: "Conta marcada como recebida.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a conta como recebida.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: AccountReceivableFormData) => {
    if (editingAccount) {
      updateMutation.mutate({ ...data, id: editingAccount.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (account: AccountReceivable) => {
    setEditingAccount(account);
    form.reset({
      description: account.description,
      amount: account.amount,
      dueDate: account.dueDate,
      clientId: account.clientId || "",
      categoryId: account.categoryId || "",
      notes: account.notes || "",
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

  const incomeCategories = categories?.filter((c) => c.type === "income");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Contas a Receber</h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas e recebimentos
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-receivable">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Editar Conta a Receber" : "Nova Conta a Receber"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da conta a receber
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
                          placeholder="Ex: Venda de produto X"
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
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-client">
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients?.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.name}
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
                            {incomeCategories?.map((category) => (
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
                  <SelectItem value="received">Recebidos</SelectItem>
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
                    <TableHead>Cliente</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Vencimento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => {
                    const client = clients?.find((c) => c.id === account.clientId);
                    const category = categories?.find((c) => c.id === account.categoryId);
                    const overdue = isOverdue(account.dueDate, account.status);
                    const displayStatus = overdue ? "overdue" : account.status;

                    return (
                      <TableRow key={account.id} data-testid={`row-receivable-${account.id}`}>
                        <TableCell className="font-medium">
                          {account.description}
                        </TableCell>
                        <TableCell>
                          {client ? (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{client.name}</span>
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
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
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
                              {account.status !== "received" && (
                                <DropdownMenuItem
                                  onClick={() => markAsReceivedMutation.mutate(account.id)}
                                  data-testid={`button-mark-received-${account.id}`}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marcar como Recebido
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
              <Wallet className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Nenhuma conta encontrada</p>
              <p className="text-sm">Clique em "Nova Conta" para adicionar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
