import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, date, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("viewer"), // 'admin' | 'financial' | 'viewer'
  active: boolean("active").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserRole = "admin" | "financial" | "viewer";

// Suppliers (Fornecedores)
export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  document: text("document"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Clients (Clientes)
export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  document: text("document"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
});

export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

// Categories (Categorias)
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'income' | 'expense'
  dreCategory: text("dre_category"), // 'revenue' | 'deductions' | 'costs' | 'operational_expenses'
});

export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Cost Centers (Centros de Custo)
export const costCenters = pgTable("cost_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
});

export const insertCostCenterSchema = createInsertSchema(costCenters).omit({ id: true });
export type InsertCostCenter = z.infer<typeof insertCostCenterSchema>;
export type CostCenter = typeof costCenters.$inferSelect;

// Accounts Payable (Contas a Pagar)
export const accountsPayable = pgTable("accounts_payable", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: text("due_date").notNull(),
  paymentDate: text("payment_date"),
  status: text("status").notNull().default("pending"), // 'pending' | 'paid' | 'overdue'
  supplierId: varchar("supplier_id"),
  categoryId: varchar("category_id"),
  costCenterId: varchar("cost_center_id"),
  notes: text("notes"),
  attachmentUrl: text("attachment_url"),
  recurrence: text("recurrence"), // 'none' | 'monthly' | 'weekly'
});

export const insertAccountPayableSchema = createInsertSchema(accountsPayable).omit({ id: true });
export type InsertAccountPayable = z.infer<typeof insertAccountPayableSchema>;
export type AccountPayable = typeof accountsPayable.$inferSelect;

// Accounts Receivable (Contas a Receber)
export const accountsReceivable = pgTable("accounts_receivable", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  dueDate: text("due_date").notNull(),
  receivedDate: text("received_date"),
  status: text("status").notNull().default("pending"), // 'pending' | 'received' | 'overdue'
  clientId: varchar("client_id"),
  categoryId: varchar("category_id"),
  notes: text("notes"),
  mercadoPagoId: text("mercado_pago_id"),
});

export const insertAccountReceivableSchema = createInsertSchema(accountsReceivable).omit({ id: true });
export type InsertAccountReceivable = z.infer<typeof insertAccountReceivableSchema>;
export type AccountReceivable = typeof accountsReceivable.$inferSelect;

// Mercado Pago Transactions
export const mercadoPagoTransactions = pgTable("mercado_pago_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  externalId: text("external_id").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 15, scale: 2 }),
  netAmount: decimal("net_amount", { precision: 15, scale: 2 }),
  transactionDate: text("transaction_date").notNull(),
  status: text("status").notNull(),
  reconciled: boolean("reconciled").default(false),
  accountReceivableId: varchar("account_receivable_id"),
});

export const insertMercadoPagoTransactionSchema = createInsertSchema(mercadoPagoTransactions).omit({ id: true });
export type InsertMercadoPagoTransaction = z.infer<typeof insertMercadoPagoTransactionSchema>;
export type MercadoPagoTransaction = typeof mercadoPagoTransactions.$inferSelect;

// Extended types for frontend with relations
export type AccountPayableWithRelations = AccountPayable & {
  supplier?: Supplier;
  category?: Category;
  costCenter?: CostCenter;
};

export type AccountReceivableWithRelations = AccountReceivable & {
  client?: Client;
  category?: Category;
};

// Dashboard types
export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  projectedBalance: number;
  overduePayables: number;
  overdueReceivables: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
}

export interface CashFlowData {
  date: string;
  income: number;
  expense: number;
  balance: number;
  projected: boolean;
}

export interface DREData {
  grossRevenue: number;
  deductions: number;
  netRevenue: number;
  costs: number;
  grossProfit: number;
  operationalExpenses: number;
  operationalProfit: number;
  netProfit: number;
  contributionMargin: number;
}

export interface CategoryExpense {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}
