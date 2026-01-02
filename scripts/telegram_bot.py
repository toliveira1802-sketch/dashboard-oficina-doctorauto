#!/usr/bin/env python3.11
"""
Bot Telegram para escutar comandos de aprovação de agenda
Roda como serviço em background
"""

import requests
import json
import time
import re
from datetime import datetime

# Configurações
TELEGRAM_BOT_TOKEN = '7975097336:AAE5g2C34tAba8fTwLEqSQ17Zv4OJnhcMRU'
TELEGRAM_CHAT_ID = '-5168046940'
API_BASE_URL = 'https://3000-igh4wux5skge31okxfsqg-8280e67f.us2.manus.computer'

last_update_id = 0

def get_updates():
    """Buscar atualizações do Telegram"""
    global last_update_id
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
    params = {
        'offset': last_update_id + 1,
        'timeout': 30
    }
    
    try:
        response = requests.get(url, params=params, timeout=35)
        data = response.json()
        
        if data['ok'] and data['result']:
            last_update_id = data['result'][-1]['update_id']
            return data['result']
        
        return []
    except Exception as e:
        print(f"❌ Erro ao buscar updates: {e}")
        return []

def send_message(text):
    """Enviar mensagem no Telegram"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': text,
        'parse_mode': 'Markdown'
    }
    
    try:
        response = requests.post(url, json=payload)
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Erro ao enviar mensagem: {e}")
        return False

def carregar_sugestao(data):
    """Carregar sugestão do arquivo JSON"""
    try:
        with open(f'/home/ubuntu/dashboard-oficina-doctorauto/data/sugestao_{data}.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return None

def aprovar_agenda(data):
    """Aprovar agenda e salvar no banco de dados"""
    print(f"📝 Aprovando agenda para {data}...")
    
    # Carregar sugestão
    sugestao_data = carregar_sugestao(data)
    
    if not sugestao_data:
        send_message(f"❌ Sugestão para {data} não encontrada!")
        return False
    
    if sugestao_data.get('aprovado'):
        send_message(f"⚠️ Agenda de {data} já foi aprovada anteriormente!")
        return False
    
    sugestao = sugestao_data['sugestao']
    
    # Salvar no banco de dados via API
    try:
        # Preparar dados para API
        agendas = []
        for mecanico, atendimentos in sugestao.items():
            for item in atendimentos:
                agendas.append({
                    'date': data,
                    'mecanico': mecanico,
                    'horario': item['horario'],
                    'placa': item['placa'],
                    'modelo': '',  # Será preenchido depois
                    'tipo': item['tipo']
                })
        
        # Chamar API para salvar (usando createBatch)
        response = requests.post(
            f'{API_BASE_URL}/api/trpc/agenda.createBatch',
            json=agendas,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            # Marcar como aprovado
            sugestao_data['aprovado'] = True
            sugestao_data['aprovado_em'] = datetime.now().isoformat()
            
            with open(f'/home/ubuntu/dashboard-oficina-doctorauto/data/sugestao_{data}.json', 'w') as f:
                json.dump(sugestao_data, f, indent=2)
            
            data_formatada = datetime.strptime(data, '%Y-%m-%d').strftime('%d/%m/%Y')
            send_message(f"✅ *AGENDA APROVADA!*\n\n📅 Data: {data_formatada}\n👨‍🔧 {len(agendas)} atendimentos agendados\n\n🎯 Acesse o painel para visualizar!")
            
            print(f"✅ Agenda aprovada com sucesso!")
            return True
        else:
            send_message(f"❌ Erro ao salvar agenda no banco de dados!")
            print(f"❌ Erro API: {response.text}")
            return False
            
    except Exception as e:
        send_message(f"❌ Erro ao processar aprovação: {str(e)}")
        print(f"❌ Erro: {e}")
        return False

def processar_comando(message):
    """Processar comandos recebidos"""
    if 'text' not in message:
        return
    
    text = message['text'].strip()
    
    # Comando /aprovar YYYY-MM-DD
    match = re.match(r'/aprovar\s+(\d{4}-\d{2}-\d{2})', text)
    if match:
        data = match.group(1)
        print(f"📥 Comando de aprovação recebido para {data}")
        aprovar_agenda(data)
        return
    
    # Comando /help
    if text == '/help' or text == '/start':
        help_text = """
🤖 *Bot de Agenda Doctor Auto*

Comandos disponíveis:

`/aprovar YYYY-MM-DD` - Aprovar agenda sugerida
Exemplo: `/aprovar 2026-01-06`

`/help` - Mostrar esta mensagem
        """
        send_message(help_text)
        return

def main():
    print("=" * 60)
    print("BOT TELEGRAM - DOCTOR AUTO")
    print("=" * 60)
    print()
    print("🤖 Bot iniciado! Aguardando comandos...")
    print("💡 Para parar: Ctrl+C")
    print()
    
    send_message("🤖 Bot de aprovação iniciado! Use `/help` para ver comandos.")
    
    while True:
        try:
            updates = get_updates()
            
            for update in updates:
                if 'message' in update:
                    message = update['message']
                    
                    # Verificar se é do grupo correto
                    if str(message['chat']['id']) == TELEGRAM_CHAT_ID:
                        processar_comando(message)
            
            time.sleep(1)
            
        except KeyboardInterrupt:
            print("\n\n⚠️  Bot interrompido pelo usuário")
            send_message("🤖 Bot de aprovação parado.")
            break
        except Exception as e:
            print(f"❌ Erro no loop principal: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
