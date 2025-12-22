import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { setupAuth, hashPassword, requireAuth, requireAdmin, requireFinancial, requireViewer } from "./auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ error: info?.message || "Credenciais inválidas" });
      }
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    res.json({ 
      user: { 
        id: req.user!.id, 
        username: req.user!.username, 
        name: req.user!.name, 
        role: req.user!.role 
      } 
    });
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const existingUsers = await storage.getUsers();
      if (existingUsers.length > 0 && !req.isAuthenticated()) {
        return res.status(401).json({ error: "Apenas administradores podem criar novos usuários" });
      }
      if (existingUsers.length > 0 && req.user?.role !== "admin") {
        return res.status(403).json({ error: "Apenas administradores podem criar novos usuários" });
      }

      const { username, password, name, role } = req.body;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Usuário já existe" });
      }

      const hashedPassword = await hashPassword(password);
      const userRole = existingUsers.length === 0 ? "admin" : (role || "viewer");
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        name,
        role: userRole,
      });

      res.status(201).json({ 
        user: { id: user.id, username: user.username, name: user.name, role: user.role } 
      });
    } catch (err) {
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  });

  app.get("/api/users", requireAdmin, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users.map(u => ({ id: u.id, username: u.username, name: u.name, role: u.role, active: u.active })));
  });

  app.patch("/api/users/:id", requireAdmin, async (req, res) => {
    const { password, ...data } = req.body;
    let updateData = data;
    if (password) {
      updateData.password = await hashPassword(password);
    }
    const user = await storage.updateUser(req.params.id, updateData);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ id: user.id, username: user.username, name: user.name, role: user.role, active: user.active });
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    if (req.user!.id === req.params.id) {
      return res.status(400).json({ error: "Você não pode excluir sua própria conta" });
    }
    await storage.deleteUser(req.params.id);
    res.status(204).send();
  });

  app.get("/api/suppliers", requireViewer, async (req, res) => {
    const suppliers = await storage.getSuppliers();
    res.json(suppliers);
  });

  app.post("/api/suppliers", requireFinancial, async (req, res) => {
    const supplier = await storage.createSupplier(req.body);
    res.status(201).json(supplier);
  });

  app.patch("/api/suppliers/:id", requireFinancial, async (req, res) => {
    const supplier = await storage.updateSupplier(req.params.id, req.body);
    if (!supplier) return res.status(404).json({ error: "Not found" });
    res.json(supplier);
  });

  app.delete("/api/suppliers/:id", requireFinancial, async (req, res) => {
    await storage.deleteSupplier(req.params.id);
    res.status(204).send();
  });

  app.get("/api/clients", requireViewer, async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.post("/api/clients", requireFinancial, async (req, res) => {
    const client = await storage.createClient(req.body);
    res.status(201).json(client);
  });

  app.patch("/api/clients/:id", requireFinancial, async (req, res) => {
    const client = await storage.updateClient(req.params.id, req.body);
    if (!client) return res.status(404).json({ error: "Not found" });
    res.json(client);
  });

  app.delete("/api/clients/:id", requireFinancial, async (req, res) => {
    await storage.deleteClient(req.params.id);
    res.status(204).send();
  });

  app.get("/api/categories", requireViewer, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.post("/api/categories", requireAdmin, async (req, res) => {
    const category = await storage.createCategory(req.body);
    res.status(201).json(category);
  });

  app.patch("/api/categories/:id", requireAdmin, async (req, res) => {
    const category = await storage.updateCategory(req.params.id, req.body);
    if (!category) return res.status(404).json({ error: "Not found" });
    res.json(category);
  });

  app.delete("/api/categories/:id", requireAdmin, async (req, res) => {
    await storage.deleteCategory(req.params.id);
    res.status(204).send();
  });

  app.get("/api/cost-centers", requireViewer, async (req, res) => {
    const costCenters = await storage.getCostCenters();
    res.json(costCenters);
  });

  app.post("/api/cost-centers", requireAdmin, async (req, res) => {
    const costCenter = await storage.createCostCenter(req.body);
    res.status(201).json(costCenter);
  });

  app.patch("/api/cost-centers/:id", requireAdmin, async (req, res) => {
    const costCenter = await storage.updateCostCenter(req.params.id, req.body);
    if (!costCenter) return res.status(404).json({ error: "Not found" });
    res.json(costCenter);
  });

  app.delete("/api/cost-centers/:id", requireAdmin, async (req, res) => {
    await storage.deleteCostCenter(req.params.id);
    res.status(204).send();
  });

  app.get("/api/accounts-payable", requireViewer, async (req, res) => {
    const accounts = await storage.getAccountsPayable();
    res.json(accounts);
  });

  app.get("/api/accounts-payable/upcoming", requireViewer, async (req, res) => {
    const accounts = await storage.getUpcomingAccountsPayable();
    res.json(accounts);
  });

  app.post("/api/accounts-payable", requireFinancial, async (req, res) => {
    const account = await storage.createAccountPayable(req.body);
    res.status(201).json(account);
  });

  app.patch("/api/accounts-payable/:id", requireFinancial, async (req, res) => {
    const account = await storage.updateAccountPayable(req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.patch("/api/accounts-payable/:id/pay", requireFinancial, async (req, res) => {
    const account = await storage.markAccountPayableAsPaid(req.params.id, req.body.paymentDate);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.delete("/api/accounts-payable/:id", requireFinancial, async (req, res) => {
    await storage.deleteAccountPayable(req.params.id);
    res.status(204).send();
  });

  app.get("/api/accounts-receivable", requireViewer, async (req, res) => {
    const accounts = await storage.getAccountsReceivable();
    res.json(accounts);
  });

  app.get("/api/accounts-receivable/upcoming", requireViewer, async (req, res) => {
    const accounts = await storage.getUpcomingAccountsReceivable();
    res.json(accounts);
  });

  app.post("/api/accounts-receivable", requireFinancial, async (req, res) => {
    const account = await storage.createAccountReceivable(req.body);
    res.status(201).json(account);
  });

  app.patch("/api/accounts-receivable/:id", requireFinancial, async (req, res) => {
    const account = await storage.updateAccountReceivable(req.params.id, req.body);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.patch("/api/accounts-receivable/:id/receive", requireFinancial, async (req, res) => {
    const account = await storage.markAccountReceivableAsReceived(req.params.id, req.body.receivedDate);
    if (!account) return res.status(404).json({ error: "Not found" });
    res.json(account);
  });

  app.delete("/api/accounts-receivable/:id", requireFinancial, async (req, res) => {
    await storage.deleteAccountReceivable(req.params.id);
    res.status(204).send();
  });

  app.get("/api/dashboard/stats", requireViewer, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  app.get("/api/dashboard/cash-flow", requireViewer, async (req, res) => {
    const period = (req.query.period as string) || "daily";
    const data = await storage.getCashFlowData(period);
    res.json(data);
  });

  app.get("/api/dashboard/category-expenses", requireViewer, async (req, res) => {
    const data = await storage.getCategoryExpenses();
    res.json(data);
  });

  app.get("/api/cash-flow", requireViewer, async (req, res) => {
    const period = (req.query.period as string) || "daily";
    const data = await storage.getCashFlowData(period);
    res.json(data);
  });

  app.get("/api/cash-flow/summary", requireViewer, async (req, res) => {
    const period = (req.query.period as string) || "daily";
    const summary = await storage.getCashFlowSummary(period);
    res.json(summary);
  });

  app.get("/api/dre", requireViewer, async (req, res) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const data = await storage.getDREData(year, month);
    res.json(data);
  });

  app.get("/api/reports/:type", requireViewer, async (req, res) => {
    const { type } = req.params;
    const { format, month, year } = req.query;
    
    res.json({
      message: `Report ${type} requested in ${format} format for ${month}/${year}`,
      note: "PDF/Excel generation requires additional libraries",
    });
  });

  return httpServer;
}
