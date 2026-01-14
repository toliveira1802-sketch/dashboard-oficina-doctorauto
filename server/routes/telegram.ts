import { Router } from 'express';
import { sendTelegramNotification, sendTestMessage, type TelegramNotification } from '../lib/telegram';

const router = Router();

/**
 * POST /api/telegram/notify
 * Envia notificação para o grupo do Telegram
 */
router.post('/notify', async (req, res) => {
  try {
    const notification: TelegramNotification = req.body;

    // Validar payload
    if (!notification.type || !notification.placa || !notification.mecanico || !notification.horario) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: type, placa, mecanico, horario'
      });
    }

    if (!['bo_peca', 'carro_pronto'].includes(notification.type)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo inválido. Use "bo_peca" ou "carro_pronto"'
      });
    }

    const success = await sendTelegramNotification(notification);

    if (success) {
      res.json({
        success: true,
        message: 'Notificação enviada com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao enviar notificação'
      });
    }

  } catch (error: any) {
    console.error('[API Telegram] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno'
    });
  }
});

/**
 * GET /api/telegram/test
 * Envia mensagem de teste
 */
router.get('/test', async (req, res) => {
  try {
    const success = await sendTestMessage();

    if (success) {
      res.json({
        success: true,
        message: 'Mensagem de teste enviada com sucesso'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Falha ao enviar mensagem de teste'
      });
    }

  } catch (error: any) {
    console.error('[API Telegram Test] Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno'
    });
  }
});

export default router;
