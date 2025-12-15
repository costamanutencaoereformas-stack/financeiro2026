import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post("/api/suppliers", async (req, res) => {
    const supplier = await storage.createSupplier(req.body);
    res.status(201).json(supplier);
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    const supplier = await storage.updateSupplier(req.params.id, req.body);
    if (!supplier) return res.status(404).json({ error: "Not found" });
    res.json(supplier);
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    await storage.deleteSupplier(req.params.id);
    res.status(204).send();
  });

  // Clients
  app.get("/api/clients", async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.post("/api/clients", async (req, res) => {
    const client = await storage.createClient(req.body);
    res.status(201).json(client);
  });

  app.patch("/api/clients/:id", async (req, res) => {
    const client = await storage.updateClient(req.params.id, req.body);
    if (!client) return res.status(404).json({ error: "Not found" });
    res.json(client);
  });

  app.delete("/api/clients/:id", async (req, res) => {
    await storage.deleteClient(req.params.id);
    res.status(204).send();
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post("/api/categories", async (req, res) => {
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  });

  app.patch("/api/categories/:id", async (req, res) => {
    const category = await storage.updateCategory(req.params.id, req.body);
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  });

  app.delete("/api/categories/:id", async (req, res) => {
    await storage.deleteCategory(req.params.id);
    res.status(204).send();
  });

  // Cost Centers
  app.get("/api/cost-centers", async (req, res) => {
    const costCenters = await storage.getCostCenters();
    res.json(costCenters);
  });

  app.post("/api/cost-centers", async (req, res) => {
    const costCenter = await storage.createCostCenter(req.body);
    res.status(201).json(costCenter);
  });

  app.patch("/api/cost-centers/:id", async (req, res) => {
    const costCenter = await storage.updateCostCenter(req.params.id, req.body);
    if (!costCenter) return res.status(404).json({ error: "Not found" });
    res.json(costCenter);
  });

  app.delete("/api/cost-centers/:id", async (req, res) => {
    await storage.deleteCostCenter(req.params.id);
    res.status(204).send();
  });

  // Accounts Payable
  app.get("/api/accounts-payable", async (req, res) => {
    const accounts = await storage.getAccountsPayable();
    res.json(accounts);
  });

  app.get("/api/accounts-payable/upcoming", async (req, res) => {
    const accounts = await storage.getUpcomingAccountsPayable();
    res.json(accounts);
  });

  app.post("/api/accounts-payable", async (req, res) => {
    const account = await storage.createAccountPayable(req.body);
    res.status(201).json(account);
  });

  app.patch("/api/accounts-payable/:id", async (req, res) => {
    const account = await storage.updateAccountPayable(req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.patch("/api/accounts-payable/:id/pay", async (req, res) => {
    const account = await storage.markAccountPayableAsPaid(req.params.id, req.body.paymentDate);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.delete("/api/accounts-payable/:id", async (req, res) => {
    await storage.deleteAccountPayable(req.params.id);
    res.status(204).send();
  });

  // Accounts Receivable
  app.get("/api/accounts-receivable", async (req, res) => {
    const accounts = await storage.getAccountsReceivable();
    res.json(accounts);
  });

  app.get("/api/accounts-receivable/upcoming", async (req, res) => {
    const accounts = await storage.getUpcomingAccountsReceivable();
    res.json(accounts);
  });

  app.post("/api/accounts-receivable", async (req, res) => {
    const account = await storage.createAccountReceivable(req.body);
    res.status(201).json(account);
  });

  app.patch("/api/accounts-receivable/:id", async (req, res) => {
    const account = await storage.updateAccountReceivable(req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.patch("/api/accounts-receivable/:id/receive", async (req, res) => {
    const account = await storage.markAccountReceivableAsReceived(req.params.id, req.body.receivedDate);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.delete("/api/accounts-receivable/:id", async (req, res) => {
    await storage.deleteAccountReceivable(req.params.id);
    res.status(204).send();
  });

  // Dashboard
  app.get("/api/dashboard/stats", async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/dashboard/cash-flow", async (req, res) => {
    const period = (req.query.period as string) || "daily";
    const data = await storage.getCashFlowData(period);
    res.json(data);
  });

  app.get("/api/dashboard/category-expenses", async (req, res) => {
    const data = await storage.getCategoryExpenses();
    res.json(data);
  });

  // Cash Flow
  app.get("/api/cash-flow", async (req, res) => {
    const period = (req.query.period as string) || "daily";
    const data = await storage.getCashFlowData(period);
    res.json(data);
  });

  app.get("/api/cash-flow/summary", async (req, res) => {
    const period = (req.query.period as string) || "daily";
    const summary = await storage.getCashFlowSummary(period);
    res.json(summary);
  });

  // DRE
  app.get("/api/dre", async (req, res) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const data = await storage.getDREData(year, month);
    res.json(data);
  });

  // Reports (placeholder for PDF/Excel generation)
  app.get("/api/reports/:type", async (req, res) => {
    const { type } = req.params;
    const { format, month, year } = req.query;
    
    // For now, return a simple JSON response
    // In a full implementation, this would generate PDF or Excel files
    res.json({
      message: `Report ${type} requested in ${format} format for ${month}/${year}`,
      note: "PDF/Excel generation requires additional libraries",
    });
  });

  return httpServer;
}
