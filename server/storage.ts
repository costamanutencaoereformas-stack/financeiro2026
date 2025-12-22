import { eq, and, lte, gte, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users, suppliers, clients, categories, costCenters,
  accountsPayable, accountsReceivable, mercadoPagoTransactions,
} from "@shared/schema";
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
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { password: string }): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  getCostCenters(): Promise<CostCenter[]>;
  getCostCenter(id: string): Promise<CostCenter | undefined>;
  createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter>;
  updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter | undefined>;
  deleteCostCenter(id: string): Promise<boolean>;

  getAccountsPayable(): Promise<AccountPayable[]>;
  getAccountPayable(id: string): Promise<AccountPayable | undefined>;
  getUpcomingAccountsPayable(): Promise<AccountPayable[]>;
  createAccountPayable(account: InsertAccountPayable): Promise<AccountPayable>;
  updateAccountPayable(id: string, account: Partial<InsertAccountPayable>): Promise<AccountPayable | undefined>;
  markAccountPayableAsPaid(id: string, paymentDate: string): Promise<AccountPayable | undefined>;
  deleteAccountPayable(id: string): Promise<boolean>;

  getAccountsReceivable(): Promise<AccountReceivable[]>;
  getAccountReceivable(id: string): Promise<AccountReceivable | undefined>;
  getUpcomingAccountsReceivable(): Promise<AccountReceivable[]>;
  createAccountReceivable(account: InsertAccountReceivable): Promise<AccountReceivable>;
  updateAccountReceivable(id: string, account: Partial<InsertAccountReceivable>): Promise<AccountReceivable | undefined>;
  markAccountReceivableAsReceived(id: string, receivedDate: string): Promise<AccountReceivable | undefined>;
  deleteAccountReceivable(id: string): Promise<boolean>;

  getDashboardStats(): Promise<DashboardStats>;
  getCashFlowData(period: string): Promise<CashFlowData[]>;
  getCashFlowSummary(period: string): Promise<{ totalIncome: number; totalExpense: number; netFlow: number; projectedBalance: number; currentBalance: number }>;
  getCategoryExpenses(): Promise<CategoryExpense[]>;
  getDREData(year: number, month: number): Promise<{ current: DREData; previous: DREData; percentageChange: { grossRevenue: number; netProfit: number } }>;
  
  seedDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private formatDate(date: Date, daysOffset: number = 0): string {
    const d = new Date(date);
    d.setDate(d.getDate() + daysOffset);
    return d.toISOString().split("T")[0];
  }

  async seedDefaultData(): Promise<void> {
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length > 0) return;

    const defaultCategories = [
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

    for (const cat of defaultCategories) {
      await db.insert(categories).values(cat);
    }

    const defaultCostCenters = [
      { name: "Administrativo", description: "Despesas administrativas gerais" },
      { name: "Comercial", description: "Departamento de vendas e marketing" },
      { name: "Operacional", description: "Operações e produção" },
      { name: "TI", description: "Tecnologia da informação" },
    ];

    for (const cc of defaultCostCenters) {
      await db.insert(costCenters).values(cc);
    }

    const supplierData = [
      { name: "Fornecedor ABC Ltda", document: "12.345.678/0001-90", email: "contato@abc.com", phone: "(11) 3456-7890", address: "Rua das Flores, 123" },
      { name: "Distribuidora XYZ", document: "98.765.432/0001-10", email: "vendas@xyz.com", phone: "(11) 9876-5432", address: "Av. Principal, 456" },
    ];

    for (const sup of supplierData) {
      await db.insert(suppliers).values(sup);
    }

    const clientData = [
      { name: "Cliente Premium S.A.", document: "11.222.333/0001-44", email: "compras@premium.com", phone: "(11) 1234-5678", address: "Av. Comercial, 789" },
      { name: "Empresa Beta Ltda", document: "44.555.666/0001-77", email: "financeiro@beta.com", phone: "(11) 8765-4321", address: "Rua Industrial, 321" },
    ];

    for (const cli of clientData) {
      await db.insert(clients).values(cli);
    }

    const allSuppliers = await db.select().from(suppliers);
    const allClients = await db.select().from(clients);
    const allCategories = await db.select().from(categories);
    const allCostCenters = await db.select().from(costCenters);

    const expenseCategories = allCategories.filter(c => c.type === "expense");
    const incomeCategories = allCategories.filter(c => c.type === "income" && c.dreCategory === "revenue");

    const today = new Date();

    const payables = [
      { description: "Aluguel do escritório", amount: "5000.00", dueDate: this.formatDate(today, 5), status: "pending" },
      { description: "Conta de energia", amount: "850.00", dueDate: this.formatDate(today, -2), status: "pending" },
      { description: "Internet e telefone", amount: "450.00", dueDate: this.formatDate(today, 10), status: "pending" },
      { description: "Material de escritório", amount: "320.00", dueDate: this.formatDate(today, -5), status: "paid", paymentDate: this.formatDate(today, -5) },
      { description: "Manutenção equipamentos", amount: "1200.00", dueDate: this.formatDate(today, 15), status: "pending" },
    ];

    for (let i = 0; i < payables.length; i++) {
      const pay = payables[i];
      await db.insert(accountsPayable).values({
        ...pay,
        supplierId: allSuppliers[i % allSuppliers.length]?.id || null,
        categoryId: expenseCategories[i % expenseCategories.length]?.id || null,
        costCenterId: allCostCenters[i % allCostCenters.length]?.id || null,
      });
    }

    const receivables = [
      { description: "Venda produto lote 001", amount: "15000.00", dueDate: this.formatDate(today, 3), status: "pending" },
      { description: "Serviço de consultoria", amount: "8500.00", dueDate: this.formatDate(today, -1), status: "pending" },
      { description: "Venda produto lote 002", amount: "12000.00", dueDate: this.formatDate(today, 7), status: "pending" },
      { description: "Manutenção mensal", amount: "3500.00", dueDate: this.formatDate(today, -3), status: "received", receivedDate: this.formatDate(today, -3) },
      { description: "Projeto especial", amount: "25000.00", dueDate: this.formatDate(today, 20), status: "pending" },
    ];

    for (let i = 0; i < receivables.length; i++) {
      const rec = receivables[i];
      await db.insert(accountsReceivable).values({
        ...rec,
        clientId: allClients[i % allClients.length]?.id || null,
        categoryId: incomeCategories[i % incomeCategories.length]?.id || null,
      });
    }
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser & { password: string }): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    await db.delete(users).where(eq(users.id, id));
    return true;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return db.select().from(suppliers);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updated] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return true;
  }

  async getClients(): Promise<Client[]> {
    return db.select().from(clients);
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updated] = await db.update(clients).set(client).where(eq(clients.id, id)).returning();
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db.update(categories).set(category).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  async getCostCenters(): Promise<CostCenter[]> {
    return db.select().from(costCenters);
  }

  async getCostCenter(id: string): Promise<CostCenter | undefined> {
    const [costCenter] = await db.select().from(costCenters).where(eq(costCenters.id, id));
    return costCenter;
  }

  async createCostCenter(costCenter: InsertCostCenter): Promise<CostCenter> {
    const [newCostCenter] = await db.insert(costCenters).values(costCenter).returning();
    return newCostCenter;
  }

  async updateCostCenter(id: string, costCenter: Partial<InsertCostCenter>): Promise<CostCenter | undefined> {
    const [updated] = await db.update(costCenters).set(costCenter).where(eq(costCenters.id, id)).returning();
    return updated;
  }

  async deleteCostCenter(id: string): Promise<boolean> {
    await db.delete(costCenters).where(eq(costCenters.id, id));
    return true;
  }

  async getAccountsPayable(): Promise<AccountPayable[]> {
    return db.select().from(accountsPayable);
  }

  async getAccountPayable(id: string): Promise<AccountPayable | undefined> {
    const [account] = await db.select().from(accountsPayable).where(eq(accountsPayable.id, id));
    return account;
  }

  async getUpcomingAccountsPayable(): Promise<AccountPayable[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const todayStr = today.toISOString().split("T")[0];
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    return db.select().from(accountsPayable)
      .where(and(
        eq(accountsPayable.status, "pending"),
        lte(accountsPayable.dueDate, nextWeekStr)
      ));
  }

  async createAccountPayable(account: InsertAccountPayable): Promise<AccountPayable> {
    const [newAccount] = await db.insert(accountsPayable).values({
      ...account,
      status: account.status || "pending",
    }).returning();
    return newAccount;
  }

  async updateAccountPayable(id: string, account: Partial<InsertAccountPayable>): Promise<AccountPayable | undefined> {
    const [updated] = await db.update(accountsPayable).set(account).where(eq(accountsPayable.id, id)).returning();
    return updated;
  }

  async markAccountPayableAsPaid(id: string, paymentDate: string): Promise<AccountPayable | undefined> {
    const [updated] = await db.update(accountsPayable)
      .set({ status: "paid", paymentDate })
      .where(eq(accountsPayable.id, id))
      .returning();
    return updated;
  }

  async deleteAccountPayable(id: string): Promise<boolean> {
    await db.delete(accountsPayable).where(eq(accountsPayable.id, id));
    return true;
  }

  async getAccountsReceivable(): Promise<AccountReceivable[]> {
    return db.select().from(accountsReceivable);
  }

  async getAccountReceivable(id: string): Promise<AccountReceivable | undefined> {
    const [account] = await db.select().from(accountsReceivable).where(eq(accountsReceivable.id, id));
    return account;
  }

  async getUpcomingAccountsReceivable(): Promise<AccountReceivable[]> {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    return db.select().from(accountsReceivable)
      .where(and(
        eq(accountsReceivable.status, "pending"),
        lte(accountsReceivable.dueDate, nextWeekStr)
      ));
  }

  async createAccountReceivable(account: InsertAccountReceivable): Promise<AccountReceivable> {
    const [newAccount] = await db.insert(accountsReceivable).values({
      ...account,
      status: account.status || "pending",
    }).returning();
    return newAccount;
  }

  async updateAccountReceivable(id: string, account: Partial<InsertAccountReceivable>): Promise<AccountReceivable | undefined> {
    const [updated] = await db.update(accountsReceivable).set(account).where(eq(accountsReceivable.id, id)).returning();
    return updated;
  }

  async markAccountReceivableAsReceived(id: string, receivedDate: string): Promise<AccountReceivable | undefined> {
    const [updated] = await db.update(accountsReceivable)
      .set({ status: "received", receivedDate })
      .where(eq(accountsReceivable.id, id))
      .returning();
    return updated;
  }

  async deleteAccountReceivable(id: string): Promise<boolean> {
    await db.delete(accountsReceivable).where(eq(accountsReceivable.id, id));
    return true;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const allPayables = await db.select().from(accountsPayable);
    const allReceivables = await db.select().from(accountsReceivable);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    const totalExpenses = allPayables
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

    const totalRevenue = allReceivables
      .filter(r => r.status === "received")
      .reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);

    const pendingPayables = allPayables
      .filter(p => p.status === "pending")
      .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

    const pendingReceivables = allReceivables
      .filter(r => r.status === "pending")
      .reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);

    const overduePayables = allPayables.filter(p => {
      if (p.status === "paid") return false;
      return p.dueDate < todayStr;
    }).length;

    const overdueReceivables = allReceivables.filter(r => {
      if (r.status === "received") return false;
      return r.dueDate < todayStr;
    }).length;

    const dueTodayCount = [...allPayables, ...allReceivables].filter(a => {
      if (a.status === "paid" || a.status === "received") return false;
      return a.dueDate === todayStr;
    }).length;

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split("T")[0];

    const dueThisWeekCount = [...allPayables, ...allReceivables].filter(a => {
      if (a.status === "paid" || a.status === "received") return false;
      return a.dueDate >= todayStr && a.dueDate <= nextWeekStr;
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
    const allPayables = await db.select().from(accountsPayable);
    const allReceivables = await db.select().from(accountsReceivable);
    
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
      
      const dayIncome = allReceivables
        .filter(r => (r.status === "received" ? r.receivedDate === dateStr : r.dueDate === dateStr))
        .reduce((sum, r) => sum + parseFloat(r.amount || "0"), 0);
      
      const dayExpense = allPayables
        .filter(p => (p.status === "paid" ? p.paymentDate === dateStr : p.dueDate === dateStr))
        .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
      
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
    const allPayables = await db.select().from(accountsPayable);
    const allCategories = await db.select().from(categories);
    
    const expenseCategories = allCategories.filter(c => c.type === "expense");
    const payablesWithCategory = allPayables.filter(p => p.categoryId);
    
    const total = payablesWithCategory.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
    
    return expenseCategories.map(cat => {
      const amount = payablesWithCategory
        .filter(p => p.categoryId === cat.id)
        .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
      
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    }).filter(c => c.amount > 0);
  }

  async getDREData(year: number, month: number): Promise<{ current: DREData; previous: DREData; percentageChange: { grossRevenue: number; netProfit: number } }> {
    const allReceivables = await db.select().from(accountsReceivable);
    const allPayables = await db.select().from(accountsPayable);
    const allCategories = await db.select().from(categories);

    const calculateDRE = (y: number, m: number): DREData => {
      const monthStart = new Date(y, m - 1, 1);
      const monthEnd = new Date(y, m, 0);
      const startStr = monthStart.toISOString().split("T")[0];
      const endStr = monthEnd.toISOString().split("T")[0];

      const monthReceivables = allReceivables.filter(r => {
        const dateStr = r.receivedDate || r.dueDate;
        return dateStr >= startStr && dateStr <= endStr;
      });

      const monthPayables = allPayables.filter(p => {
        const dateStr = p.paymentDate || p.dueDate;
        return dateStr >= startStr && dateStr <= endStr;
      });

      let grossRevenue = 0;
      let deductions = 0;
      let costs = 0;
      let operationalExpenses = 0;

      monthReceivables.forEach(r => {
        const cat = allCategories.find(c => c.id === r.categoryId);
        const amount = parseFloat(r.amount || "0");
        if (cat?.dreCategory === "revenue") grossRevenue += amount;
        if (cat?.dreCategory === "deductions") deductions += amount;
      });

      monthPayables.forEach(p => {
        const cat = allCategories.find(c => c.id === p.categoryId);
        const amount = parseFloat(p.amount || "0");
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

export const storage = new DatabaseStorage();
