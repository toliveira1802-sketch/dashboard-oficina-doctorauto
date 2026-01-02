#!/bin/bash
# Script para configurar cron jobs de sugestão de agenda

echo "=========================================="
echo "CONFIGURANDO CRON JOBS - DOCTOR AUTO"
echo "=========================================="
echo ""

# Caminho do script
SCRIPT_PATH="/home/ubuntu/dashboard-oficina-doctorauto/scripts/suggest_and_send_telegram.py"

# Criar cron jobs
# Segunda a Quinta às 17h
CRON_SEG_QUI="0 17 * * 1-4 /usr/bin/python3.11 $SCRIPT_PATH >> /home/ubuntu/dashboard-oficina-doctorauto/logs/agenda_cron.log 2>&1"

# Sexta às 17h
CRON_SEX="0 17 * * 5 /usr/bin/python3.11 $SCRIPT_PATH >> /home/ubuntu/dashboard-oficina-doctorauto/logs/agenda_cron.log 2>&1"

# Sábado às 11h30
CRON_SAB="30 11 * * 6 /usr/bin/python3.11 $SCRIPT_PATH >> /home/ubuntu/dashboard-oficina-doctorauto/logs/agenda_cron.log 2>&1"

# Criar diretório de logs
mkdir -p /home/ubuntu/dashboard-oficina-doctorauto/logs

# Adicionar cron jobs
(crontab -l 2>/dev/null | grep -v "suggest_and_send_telegram.py"; echo "$CRON_SEG_QUI"; echo "$CRON_SEX"; echo "$CRON_SAB") | crontab -

echo "✅ Cron jobs configurados!"
echo ""
echo "Agendamentos criados:"
echo "  📅 Segunda a Quinta às 17h00"
echo "  📅 Sexta às 17h00"
echo "  📅 Sábado às 11h30"
echo ""
echo "Para ver os cron jobs:"
echo "  crontab -l"
echo ""
echo "Para ver logs:"
echo "  tail -f /home/ubuntu/dashboard-oficina-doctorauto/logs/agenda_cron.log"
echo ""
echo "=========================================="
