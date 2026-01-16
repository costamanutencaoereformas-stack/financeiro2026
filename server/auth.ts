import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import type { Express, RequestHandler } from "express";
import type { User, UserRole } from "@shared/schema";
import connectPgSimple from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;

const scryptAsync = promisify(scrypt);

declare global {
  namespace Express {
    interface User {
      id: string;
      fullName: string | null;
      role: UserRole | string | null;
      status: string | null;
    }
  }
}

// function hashPassword and comparePasswords removed as they relied on local password storage


export function setupAuth(app: Express): void {
  const PgSession = connectPgSimple(session);
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "fincontrol-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Local Strategy disabled as we are moving to Supabase Auth / No password schema
  /*
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      // ... implementation removed
      return done(null, false);
    })
  );
  */

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      });
    } catch (err) {
      done(err);
    }
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
};

export const requireRole = (...roles: UserRole[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    if (!roles.includes(req.user!.role as UserRole)) {
      return res.status(403).json({ error: "Sem permissão para esta ação" });
    }
    next();
  };
};

export const requireAdmin: RequestHandler = requireRole("admin");
export const requireFinancial: RequestHandler = requireRole("admin", "financial");
export const requireViewer: RequestHandler = requireRole("admin", "financial", "viewer");
