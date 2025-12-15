import { randomUUID } from "crypto";
import type {
  User, InsertUser,
  Supplier, InsertSupplier,
  Client, InsertClient,
  Category, InsertCategory,
  CostCenter, InsertCostCenter,
  AccountPayable, InsertAccountPayable,
  AccountReceivable, InsertAccountReceivable,
  MercadoPagoTransaction, InsertMercadoPagoTransaction,
  DashboardStats, CashFlowData, DREData, CategoryExpense,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Cost Centers
  getCostCenters(): Promise<CostCenter[]>;
  getCostCenter(id: string): Promise<CostCenter | undefined>;
  createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter>;
  updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter | undefined>;
  deleteCostCenter(id: string): Promise<boolean>;

  // Accounts Payable
  getAccountsPayable(): Promise<AccountPayable[]>;
  getAccountPayable(id: string): Promise<AccountPayable | undefined>;
  getUpcomingAccountsPayable(): Promise<AccountPayable[]>;
  createAccountPayable(account: InsertAccountPayable): Promise<AccountPayable>;
  updateAccountPayable(id: string, account: Partial<InsertAccountPayable>): Promise<AccountPayable | undefined>;
  markAccountPayableAsPaid(id: string, paymentDate: string): Promise<AccountPayable | undefined>;
  deleteAccountPayable(id: string): Promise<boolean>;

  // Accounts Receivable
  getAccountsReceivable(): Promise<AccountReceivable[]>;
  getAccountReceivable(id: string): Promise<AccountReceivable | undefined>;
  getUpcomingAccountsReceivable(): Promise<AccountReceivable[]>;
  createAccountReceivable(account: InsertAccountReceivable): Promise<AccountReceivable>;
  updateAccountReceivable(id: string, account: Partial<InsertAccountReceivable>): Promise<AccountReceivable | undefined>;
  markAccountReceivableAsReceived(id: string, receivedDate: string): Promise<AccountReceivable | undefined>;
  deleteAccountReceivable(id: string): Promise<boolean>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
  getCashFlowData(period: string): Promise<CashFlowData[]>;
  getCashFlowSummary(period: string): Promise<{ totalIncome: number; totalExpense: number; netFlow: number; projectedBalance: number; currentBalance: number }>;
  getCategoryExpenses(): Promise<CategoryExpense[]>;
  getDREData(year: number, month: number): Promise<{ current: DREData; previous: DREData; percentageChange: { grossRevenue: number; netProfit: number } }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private clients: Map<string, Client> = new Map();
  private categories: Map<string, Category> = new Map();
  private costCenters: Map<string, CostCenter> = new Map();
  private accountsPayable: Map<string, AccountPayable> = new Map();
  private accountsReceivable: Map<string, AccountReceivable> = new Map();
  private mercadoPagoTransactions: Map<string, MercadoPagoTransaction> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categories = [
      { name: "Vendas de Produtos", type: "income", dreCategory: "revenue" },
      { name: "Prestação de Serviços", type: "income", dreCategory: "revenue" },
      { name: "Outras Receitas", type: "income", dreCategory: "revenue" },
      { name: "Impostos sobre Vendas", type: "income", dreCategory: "deductions" },
      { name: "Devoluções", type: "income", dreCategory: "deductions" },
      { name: "Custo de Mercadorias", type: "expense", dreCategory: "costs" },
      { name: "Aluguel", type: "expense", dreCategory: "operational_expenses" },
      { name: "Salários", type: "expense", dreCategory: "operational_expenses" },
      { name: "Marketing", type: "expense", dreCategory: "operational_expenses" },
      { name: "Utilidades", type: "expense", dreCategory: "operational_expenses" },
      { name: "Material de Escritório", type: "expense", dreCategory: "operational_expenses" },
    ];
    categories.forEach((cat) => {
      const id = randomUUID();
      this.categories.set(id, { id, ...cat });
    });

    // Seed cost centers
    const costCenters = [
      { name: "Administrativo", description: "Despesas administrativas gerais" },
      { name: "Comercial", description: "Departamento de vendas e marketing" },
      { name: "Operacional", description: "Operações e produção" },
      { name: "TI", description: "Tecnologia da informação" },
    ];
    costCenters.forEach((cc) => {
      const id = randomUUID();
      this.costCenters.set(id, { id, ...cc });
    });

    // Seed suppliers
    const suppliers = [
      { name: "Fornecedor ABC Ltda", document: "12.345.678/0001-90", email: "contato@abc.com", phone: "(11) 3456-7890", address: "Rua das Flores, 123" },
      { name: "Distribuidora XYZ", document: "98.765.432/0001-10", email: "vendas@xyz.com", phone: "(11) 9876-5432", address: "Av. Principal, 456" },
    ];
    suppliers.forEach((sup) => {
      const id = randomUUID();
      this.suppliers.set(id, { id, ...sup });
    });

    // Seed clients
    const clients = [
      { name: "Cliente Premium S.A.", document: "11.222.333/0001-44", email: "compras@premium.com", phone: "(11) 1234-5678", address: "Av. Comercial, 789" },
      { name: "Empresa Beta Ltda", document: "44.555.666/0001-77", email: "financeiro@beta.com", phone: "(11) 8765-4321", address: "Rua Industrial, 321" },
    ];
    clients.forEach((cli) => {
      const id = randomUUID();
      this.clients.set(id, { id, ...cli });
    });

    // Seed sample accounts payable
    const today = new Date();
    const supplierIds = Array.from(this.suppliers.keys());
    const expenseCategories = Array.from(this.categories.values()).filter(c => c.type === "expense");
    const costCenterIds = Array.from(this.costCenters.keys());

    const payables = [
      { description: "Aluguel do escritório", amount: "5000.00", dueDate: this.formatDate(today, 5), status: "pending" },
      { description: "Conta de energia", amount: "850.00", dueDate: this.formatDate(today, -2), status: "pending" },
      { description: "Internet e telefone", amount: "450.00", dueDate: this.formatDate(today, 10), status: "pending" },
      { description: "Material de escritório", amount: "320.00", dueDate: this.formatDate(today, -5), status: "paid", paymentDate: this.formatDate(today, -5) },
      { description: "Manutenção equipamentos", amount: "1200.00", dueDate: this.formatDate(today, 15), status: "pending" },
    ];

    payables.forEach((pay, i) => {
      const id = randomUUID();
      this.accountsPayable.set(id, {
        id,
        ...pay,
        supplierId: supplierIds[i % supplierIds.length],
        categoryId: expenseCategories[i % expenseCategories.length]?.id || null,
        costCenterId: costCenterIds[i % costCenterIds.length],
        notes: null,
        attachmentUrl: null,
        recurrence: null,
        paymentDate: pay.paymentDate || null,
      });
    });

    // Seed sample accounts receivable
    const clientIds = Array.from(this.clients.keys());
    const incomeCategories = Array.from(this.categories.values()).filter(c => c.type === "income" && c.dreCategory === "revenue");

    const receivables = [
      { description: "Venda produto lote 001", amount: "15000.00", dueDate: this.formatDate(today, 3), status: "pending" },
      { description: "Serviço de consultoria", amount: "8500.00", dueDate: this.formatDate(today, -1), status: "pending" },
      { description: "Venda produto lote 002", amount: "12000.00", dueDate: this.formatDate(today, 7), status: "pending" },
      { description: "Manutenção mensal", amount: "3500.00", dueDate: this.formatDate(today, -3), status: "received", receivedDate: this.formatDate(today, -3) },
      { description: "Projeto especial", amount: "25000.00", dueDate: this.formatDate(today, 20), status: "pending" },
    ];

    receivables.forEach((rec, i) => {
      const id = randomUUID();
      this.accountsReceivable.set(id, {
        id,
        ...rec,
        clientId: clientIds[i % clientIds.length],
        categoryId: incomeCategories[i % incomeCategories.length]?.id || null,
        notes: null,
        mercadoPagoId: null,
        receivedDate: rec.receivedDate || null,
      });
    });
  }

  private formatDate(date: Date, daysOffset: number = 0): string {
    const d = new Date(date);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split("T")[0];
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = randomUUID();
    const newUser: User = { id, ...user };
    this.users.set(id, newUser);
    return newUser;
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const newSupplier: Supplier = { id, ...supplier };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existing = this.suppliers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...supplier };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = randomUUID();
    const newClient: Client = { id, ...client };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existing = this.clients.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...client };
    this.clients.set(id, updated);
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { id, ...category };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Cost Centers
  async getCostCenters(): Promise<CostCenter[]> {
    return Array.from(this.costCenters.values());
  }

  async getCostCenter(id: string): Promise<CostCenter | undefined> {
    return this.costCenters.get(id);
  }

  async createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter> {
    const id = randomUUID();
    const newCostCenter: CostCenter = { id, ...costCenter };
    this.costCenters.set(id, newCostCenter);
    return newCostCenter;
  }

  async updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter | undefined> {
    const existing = this.costCenters.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...costCenter };
    this.costCenters.set(id, updated);
    return updated;
  }

  async deleteCostCenter(id: string): Promise<boolean> {
    return this.costCenters.delete(id);
  }

  // Accounts Payable
  async getAccountsPayable(): Promise<AccountPayable[]> {
    return Array.from(this.accountsPayable.values());
  }

  async getAccountPayable(id: string): Promise<AccountPayable | undefined> {
    return this.accountsPayable.get(id);
  }

  async getUpcomingAccountsPayable(): Promise<AccountPayable[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return Array.from(this.accountsPayable.values())
      .filter((a) => a.status === "pending")
      .filter((a) => {
        const dueDate = new Date(a.dueDate + "T00:00:00");
        return dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async createAccountPayable(account: InsertAccountPayable): Promise<AccountPayable> {
    const id = randomUUID();
    const newAccount: AccountPayable = { 
      id, 
      ...account,
      status: account.status || "pending",
      paymentDate: account.paymentDate || null,
      notes: account.notes || null,
      attachmentUrl: account.attachmentUrl || null,
      recurrence: account.recurrence || null,
      supplierId: account.supplierId || null,
      categoryId: account.categoryId || null,
      costCenterId: account.costCenterId || null,
    };
    this.accountsPayable.set(id, newAccount);
    return newAccount;
  }

  async updateAccountPayable(id: string, account: Partial<InsertAccountPayable>): Promise<AccountPayable | undefined> {
    const existing = this.accountsPayable.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...account };
    this.accountsPayable.set(id, updated);
    return updated;
  }

  async markAccountPayableAsPaid(id: string, paymentDate: string): Promise<AccountPayable | undefined> {
    const existing = this.accountsPayable.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status: "paid", paymentDate };
    this.accountsPayable.set(id, updated);
    return updated;
  }

  async deleteAccountPayable(id: string): Promise<boolean> {
    return this.accountsPayable.delete(id);
  }

  // Accounts Receivable
  async getAccountsReceivable(): Promise<AccountReceivable[]> {
    return Array.from(this.accountsReceivable.values());
  }

  async getAccountReceivable(id: string): Promise<AccountReceivable | undefined> {
    return this.accountsReceivable.get(id);
  }

  async getUpcomingAccountsReceivable(): Promise<AccountReceivable[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return Array.from(this.accountsReceivable.values())
      .filter((a) => a.status === "pending")
      .filter((a) => {
        const dueDate = new Date(a.dueDate + "T00:00:00");
        return dueDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  async createAccountReceivable(account: InsertAccountReceivable): Promise<AccountReceivable> {
    const id = randomUUID();
    const newAccount: AccountReceivable = { 
      id, 
      ...account,
      status: account.status || "pending",
      receivedDate: account.receivedDate || null,
      notes: account.notes || null,
      mercadoPagoId: account.mercadoPagoId || null,
      clientId: account.clientId || null,
      categoryId: account.categoryId || null,
    };
    this.accountsReceivable.set(id, newAccount);
    return newAccount;
  }

  async updateAccountReceivable(id: string, account: Partial<InsertAccountReceivable>): Promise<AccountReceivable | undefined> {
    const existing = this.accountsReceivable.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...account };
    this.accountsReceivable.set(id, updated);
    return updated;
  }

  async markAccountReceivableAsReceived(id: string, receivedDate: string): Promise<AccountReceivable | undefined> {
    const existing = this.accountsReceivable.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status: "received", receivedDate };
    this.accountsReceivable.set(id, updated);
    return updated;
  }

  async deleteAccountReceivable(id: string): Promise<boolean> {
    return this.accountsReceivable.delete(id);
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const payables = Array.from(this.accountsPayable.values());
    const receivables = Array.from(this.accountsReceivable.values());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalExpenses = payables
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const totalRevenue = receivables
      .filter((r) => r.status === "received")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const pendingPayables = payables
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const pendingReceivables = receivables
      .filter((r) => r.status === "pending")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0);

    const overduePayables = payables.filter((p) => {
      if (p.status === "paid") return false;
      const dueDate = new Date(p.dueDate + "T00:00:00");
      return dueDate < today;
    }).length;

    const overdueReceivables = receivables.filter((r) => {
      if (r.status === "received") return false;
      const dueDate = new Date(r.dueDate + "T00:00:00");
      return dueDate < today;
    }).length;

    const todayStr = today.toISOString().split("T")[0];
    const dueTodayCount = [...payables, ...receivables].filter((a) => {
      if (a.status === "paid" || a.status === "received") return false;
      return a.dueDate === todayStr;
    }).length;

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dueThisWeekCount = [...payables, ...receivables].filter((a) => {
      if (a.status === "paid" || a.status === "received") return false;
      const dueDate = new Date(a.dueDate + "T00:00:00");
      return dueDate >= today && dueDate <= nextWeek;
    }).length;

    const balance = totalRevenue - totalExpenses;
    const projectedBalance = balance + pendingReceivables - pendingPayables;

    return {
      totalRevenue,
      totalExpenses,
      balance,
      projectedBalance,
      overduePayables,
      overdueReceivables,
      dueTodayCount,
      dueThisWeekCount,
    };
  }

  async getCashFlowData(period: string): Promise<CashFlowData[]> {
    const payables = Array.from(this.accountsPayable.values());
    const receivables = Array.from(this.accountsReceivable.values());
    
    const today = new Date();
    const data: Map<string, CashFlowData> = new Map();
    
    let days = 7;
    if (period === "weekly") days = 28;
    if (period === "monthly") days = 90;
    
    let runningBalance = 0;

    for (let i = -days; i <= days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      
      const dayIncome = receivables
        .filter((r) => (r.status === "received" ? r.receivedDate === dateStr : r.dueDate === dateStr))
        .reduce((sum, r) => sum + parseFloat(r.amount), 0);
      
      const dayExpense = payables
        .filter((p) => (p.status === "paid" ? p.paymentDate === dateStr : p.dueDate === dateStr))
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      runningBalance += dayIncome - dayExpense;
      
      data.set(dateStr, {
        date: dateStr,
        income: dayIncome,
        expense: dayExpense,
        balance: runningBalance,
        projected: i > 0,
      });
    }
    
    return Array.from(data.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getCashFlowSummary(period: string): Promise<{ totalIncome: number; totalExpense: number; netFlow: number; projectedBalance: number; currentBalance: number }> {
    const cashFlowData = await this.getCashFlowData(period);
    const stats = await this.getDashboardStats();
    
    const totalIncome = cashFlowData.reduce((sum, d) => sum + d.income, 0);
    const totalExpense = cashFlowData.reduce((sum, d) => sum + d.expense, 0);
    
    return {
      totalIncome,
      totalExpense,
      netFlow: totalIncome - totalExpense,
      projectedBalance: stats.projectedBalance,
      currentBalance: stats.balance,
    };
  }

  async getCategoryExpenses(): Promise<CategoryExpense[]> {
    const payables = Array.from(this.accountsPayable.values()).filter((p) => p.categoryId);
    const categories = Array.from(this.categories.values()).filter((c) => c.type === "expense");
    
    const total = payables.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
    return categories.map((cat) => {
      const amount = payables
        .filter((p) => p.categoryId === cat.id)
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    }).filter((c) => c.amount > 0);
  }

  async getDREData(year: number, month: number): Promise<{ current: DREData; previous: DREData; percentageChange: { grossRevenue: number; netProfit: number } }> {
    const receivables = Array.from(this.accountsReceivable.values());
    const payables = Array.from(this.accountsPayable.values());
    const categories = Array.from(this.categories.values());

    const calculateDRE = (y: number, m: number): DREData => {
      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 0);

      const monthReceivables = receivables.filter((r) => {
        const date = new Date((r.receivedDate || r.dueDate) + "T00:00:00");
        return date >= monthStart && date <= monthEnd;
      });

      const monthPayables = payables.filter((p) => {
        const date = new Date((p.paymentDate || p.dueDate) + "T00:00:00");
        return date >= monthStart && date <= monthEnd;
      });

      let grossRevenue = 0;
      let deductions = 0;
      let costs = 0;
      let operationalExpenses = 0;

      monthReceivables.forEach((r) => {
        const cat = categories.find((c) => c.id === r.categoryId);
        const amount = parseFloat(r.amount);
        if (cat?.dreCategory === "revenue") grossRevenue += amount;
        if (cat?.dreCategory === "deductions") deductions += amount;
      });

      monthPayables.forEach((p) => {
        const cat = categories.find((c) => c.id === p.categoryId);
        const amount = parseFloat(p.amount);
        if (cat?.dreCategory === "costs") costs += amount;
        if (cat?.dreCategory === "operational_expenses") operationalExpenses += amount;
      });

      const netRevenue = grossRevenue - deductions;
      const grossProfit = netRevenue - costs;
      const operationalProfit = grossProfit - operationalExpenses;
      const netProfit = operationalProfit;
      const contributionMargin = netRevenue - costs;

      return {
        grossRevenue,
        deductions,
        netRevenue,
        costs,
        grossProfit,
        operationalExpenses,
        operationalProfit,
        netProfit,
        contributionMargin,
      };
    };

    const current = calculateDRE(year, month);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const previous = calculateDRE(prevYear, prevMonth);

    return {
      current,
      previous,
      percentageChange: {
        grossRevenue: previous.grossRevenue > 0 ? ((current.grossRevenue - previous.grossRevenue) / previous.grossRevenue) * 100 : 0,
        netProfit: previous.netProfit !== 0 ? ((current.netProfit - previous.netProfit) / Math.abs(previous.netProfit)) * 100 : 0,
      },
    };
  }
}

export const storage = new MemStorage();
