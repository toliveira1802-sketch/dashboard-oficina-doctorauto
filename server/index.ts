import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { startTrelloSync } from "./services/trelloSync.js";
import { startSyncScheduler } from "./services/sync-scheduler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Parse JSON body
  app.use(express.json());

  // Import and use Trello routes
  const trelloRoutes = await import('./routes/trello.js');
  app.use('/api/trello', trelloRoutes.default);
  
  // Import and use Trello webhook routes
  const webhookRoutes = await import('./routes/trello-webhook.js');
  app.use('/api', webhookRoutes.default);
  
  // Import and use Supabase data routes
  const supabaseRoutes = await import('./routes/supabase-data.js');
  app.use('/api/supabase', supabaseRoutes.default);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Inicia sincronização automática com Trello (legado)
    startTrelloSync();
    
    // Inicia sincronização híbrida Trello → Supabase (webhook + polling)
    startSyncScheduler(30); // Polling a cada 30 minutos
  });
}

startServer().catch(console.error);
