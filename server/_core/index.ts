import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { startTrelloSync } from "../services/trelloSync.js";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Trello API routes (must be before tRPC to avoid conflicts)
  const trelloRoutes = await import('../routes/trello.js');
  app.use('/api/trello', trelloRoutes.default);
  // Export routes
  const exportRoutes = await import('../routes/export.js');
  app.use('/api/export', exportRoutes.default);
  // Metas routes
  const metasRoutes = await import('../routes/metas.js');
  app.use('/api/metas', metasRoutes.default);
  
  // Telegram routes
  const telegramRoutes = await import('../routes/telegram.js');
  app.use('/api/telegram', telegramRoutes.default);
  
  // Supabase validation routes
  const supabaseValidateRoutes = await import('../routes/supabase/validate-tables.js');
  app.use(supabaseValidateRoutes.default);
  
  // Supabase API routes
  const supabaseApiRoutes = await import('./supabase-api.js');
  app.use('/api/supabase', supabaseApiRoutes.default);
  
  // ===== WEBHOOK MINIMALISTA DO TRELLO =====
  // HEAD - Validação do Trello
  app.head('/api/webhook/trello', (req, res) => {
    console.log('[Trello Webhook] HEAD request - validação');
    res.status(200).send();
  });
  
  // POST - Recebe eventos do Trello
  app.post('/api/webhook/trello', (req, res) => {
    try {
      const payload = req.body;
      console.log('[Trello Webhook] Evento recebido:', JSON.stringify(payload, null, 2));
      
      const actionType = payload?.action?.type || 'unknown';
      const cardName = payload?.action?.data?.card?.name || 'N/A';
      const listName = payload?.action?.data?.list?.name || payload?.action?.data?.listAfter?.name || 'N/A';
      
      console.log(`[Trello Webhook] Ação: ${actionType} | Card: ${cardName} | Lista: ${listName}`);
      
      res.status(200).json({
        success: true,
        message: 'Webhook Trello processado com sucesso!',
        received: {
          action: actionType,
          card: cardName,
          list: listName
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('[Trello Webhook] Erro:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // GET /test - Teste do webhook
  app.get('/api/webhook/trello/test', (req, res) => {
    res.json({
      success: true,
      message: 'Webhook Trello está funcionando!',
      timestamp: new Date().toISOString(),
      instructions: {
        method: 'POST',
        url: '/api/webhook/trello',
        example_payload: {
          action: {
            type: 'updateCard',
            data: {
              card: { name: 'Teste Card' },
              list: { name: 'AGENDADOS' }
            }
          }
        }
      }
    });
  });
  
  // ===== WEBHOOK DO KOMMO COM AUTOMAÇÃO =====
  app.post('/api/webhook/kommo', async (req, res) => {
    try {
      const payload = req.body;
      const lead = payload?.leads?.[0];
      if (!lead) {
        return res.status(400).json({ success: false, error: 'Payload inválido' });
      }
      
      const leadId = lead.id;
      const leadName = lead.name || 'Lead sem nome';
      const statusName = lead.status_name || '';
      const pipelineName = lead.pipeline_name || '';
      const telefone = lead.custom_fields_values?.find((f: any) => f.field_name === 'Telefone')?.values?.[0]?.value || null;
      const email = lead.custom_fields_values?.find((f: any) => f.field_name === 'Email')?.values?.[0]?.value || null;
      
      console.log(`[Kommo] ${leadId}: ${leadName} | ${pipelineName} | ${statusName}`);
      
      // Salvar no Supabase
      const { supabase } = await import('../supabase.js');
      await supabase.from('kommo_leads').upsert({
        kommo_lead_id: leadId,
        name: leadName,
        phone: telefone,
        email: email,
        pipeline_name: pipelineName,
        status_name: statusName,
        custom_fields: lead.custom_fields_values || {},
        sync_status: 'pending'
      }, { onConflict: 'kommo_lead_id' });
      
      // Se Agendamento Confirmado, criar card no Trello
      let trelloResult = null;
      if (statusName === 'AGENDAMENTO CONFIRMADO' && pipelineName === 'Doctor Prime') {
        const { createTrelloCard } = await import('../services/create-trello-card.js');
        trelloResult = await createTrelloCard({
          name: leadName,
          phone: telefone || undefined,
          email: email || undefined,
          kommoLeadId: leadId
        });
        
        if (trelloResult.success) {
          console.log('[Kommo] Card criado:', trelloResult.cardId);
          await supabase.from('kommo_leads').update({
            trello_card_id: trelloResult.cardId,
            trello_card_url: trelloResult.cardUrl,
            sync_status: 'synced',
            last_sync_at: new Date().toISOString()
          }).eq('kommo_lead_id', leadId);
        } else {
          await supabase.from('kommo_leads').update({
            sync_status: 'error',
            sync_error: trelloResult.error
          }).eq('kommo_lead_id', leadId);
        }
      }
      
      res.json({
        success: true,
        lead_id: leadId,
        trello_card_created: !!trelloResult?.success,
        trello_card_id: trelloResult?.cardId
      });
    } catch (error: any) {
      console.error('[Kommo] Erro:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // GET /test - Teste do webhook Kommo
  app.get('/api/webhook/kommo/test', (req, res) => {
    res.json({
      success: true,
      message: 'Webhook Kommo está funcionando!',
      timestamp: new Date().toISOString(),
      instructions: {
        method: 'POST',
        url: '/api/webhook/kommo',
        example_payload: {
          leads: [{
            id: 123456,
            name: 'João Silva',
            pipeline_name: 'Doctor Prime',
            status_name: 'Agendamento Confirmado'
          }]
        }
      }
    });
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Inicia sincronização automática com Trello
    startTrelloSync();
    
    // Inicia sincronização agendada Trello → Supabase (a cada 5 minutos)
    const { startScheduledSync } = await import('../services/scheduled-sync.js');
    startScheduledSync(5);
  });
}

startServer().catch(console.error);
