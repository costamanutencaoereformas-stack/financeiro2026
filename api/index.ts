import { app, httpServer } from "../server/index";
import { registerRoutes } from "../server/routes";
import { storage } from "../server/storage";
import { log } from "../server/index";

// Vercel serverless function entry point
export default async function handler(req: any, res: any) {
    // Ensure routes are registered
    // Note: registerRoutes is idempotent in terms of adding middleware to 'app'
    // but it's better to ensure it only runs once if possible.
    // Express app is persistent in the lambda instance.

    if (!(app as any)._routesRegistered) {
        log("Registering routes for Vercel...");
        await storage.seedDefaultData();
        await registerRoutes(httpServer, app);
        (app as any)._routesRegistered = true;
    }

    return app(req, res);
}
