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
  
  // Supabase validation routes
  const supabaseValidateRoutes = await import('../routes/supabase/validate-tables.js');
  app.use(supabaseValidateRoutes.default);
  
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
  
  // ===== WEBHOOK MINIMALISTA DO KOMMO =====
  // POST - Recebe leads do Kommo
  app.post('/api/webhook/kommo', async (req, res) => {
    try {
      const payload = req.body;
      console.log('[Kommo Webhook] Lead recebido:', JSON.stringify(payload, null, 2));
      
      const lead = payload?.leads?.[0];
      if (!lead) {
        return res.status(400).json({ success: false, error: 'Payload inválido' });
      }
      
      const leadName = lead.name || 'N/A';
      const statusName = lead.status_name || 'N/A';
      const pipelineName = lead.pipeline_name || 'N/A';
      
      console.log(`[Kommo Webhook] Lead: ${leadName} | Pipeline: ${pipelineName} | Status: ${statusName}`);
      
      // Se o status for "Agendamento Confirmado", criar card no Trello
      let trelloCardCreated = false;
      let trelloCardId = null;
      
      if (statusName === 'AGENDAMENTO CONFIRMADO' && pipelineName === 'Doctor Prime') {
        try {
          console.log('[Kommo Webhook] Criando card no Trello...');
          
          // Extrair dados do lead
          const telefone = lead.custom_fields_values?.find((f: any) => f.field_name === 'Telefone')?.values?.[0]?.value || 'N/A';
          const email = lead.custom_fields_values?.find((f: any) => f.field_name === 'Email')?.values?.[0]?.value || 'N/A';
          
          // Credenciais do Trello
          const TRELLO_API_KEY = process.env.TRELLO_API_KEY || '5d7cb0184659fe5f671928f3328d5d1a';
          const TRELLO_TOKEN = process.env.TRELLO_TOKEN || 'ATTAc41176b5a54379ce116e6aa9ec7e865a5e1d522c583995aa1ac071eb846c5414E7CDB404';
          const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || '69562921bad93c92c7922d0a';
          
          // Buscar ID da lista AGENDADOS
          const listsResponse = await fetch(
            `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`
          );
          const lists = await listsResponse.json();
          const agendadosList = lists.find((l: any) => l.name === '🟢 AGENDAMENTO CONFIRMADO');
          
          if (!agendadosList) {
            throw new Error('Lista AGENDADOS não encontrada no Trello');
          }
          
          // Criar card
          const cardName = `${leadName} - ${telefone}`;
          const cardDesc = `**Lead do Kommo**\n\n**Nome:** ${leadName}\n**Telefone:** ${telefone}\n**Email:** ${email}\n**Pipeline:** ${pipelineName}\n**Status:** ${statusName}\n**Lead ID:** ${lead.id}`;
          
          console.log(`[Kommo Webhook] Criando card: ${cardName}`);
          console.log(`[Kommo Webhook] Lista ID: ${agendadosList.id}`);
          
          const createCardResponse = await fetch(
            `https://api.trello.com/1/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: cardName,
                desc: cardDesc,
                idList: agendadosList.id,
                pos: 'top'
              })
            }
          );
          
          console.log(`[Kommo Webhook] Status da resposta Trello: ${createCardResponse.status}`);
          
          if (!createCardResponse.ok) {
            const errorText = await createCardResponse.text();
            console.error(`[Kommo Webhook] Erro da API Trello: ${errorText}`);
            throw new Error(`Trello API error: ${createCardResponse.status} - ${errorText}`);
          }
          
          const newCard = await createCardResponse.json();
          trelloCardCreated = true;
          trelloCardId = newCard.id;
          
          console.log(`[Kommo Webhook] ✅ Card criado no Trello! ID: ${trelloCardId}`);
          console.log(`[Kommo Webhook] URL: https://trello.com/c/${newCard.shortLink}`);
        } catch (trelloError: any) {
          console.error('[Kommo Webhook] Erro ao criar card no Trello:', trelloError);
        }
      }
      
      res.status(200).json({
        success: true,
        message: 'Webhook Kommo processado com sucesso!',
        received: {
          lead_id: lead.id,
          name: leadName,
          pipeline: pipelineName,
          status: statusName
        },
        trello: {
          card_created: trelloCardCreated,
          card_id: trelloCardId
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('[Kommo Webhook] Erro:', error);
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

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Inicia sincronização automática com Trello
    startTrelloSync();
  });
}

startServer().catch(console.error);
