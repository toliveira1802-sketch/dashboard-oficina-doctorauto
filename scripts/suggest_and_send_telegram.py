#!/usr/bin/env python3.11
"""
Script para gerar sugestão de agenda e enviar via Telegram
Uso: python3.11 suggest_and_send_telegram.py [data_sugestao]
Exemplo: python3.11 suggest_and_send_telegram.py 2026-01-06
"""

import sys
import requests
import json
from datetime import datetime, timedelta

# Configurações Telegram
TELEGRAM_BOT_TOKEN = '7975097336:AAE5g2C34tAba8fTwLEqSQ17Zv4OJnhcMRU'
TELEGRAM_CHAT_ID = '-5168046940'

# Configurações Trello
TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e'
TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7'
TRELLO_BOARD_ID = 'NkhINjF2'

MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP']

# Horários de atendimento
HORARIOS_SEMANA = ['08h00', '09h00', '10h00', '11h00', '13h30', '14h30', '15h30', '16h30', '17h30']
HORARIOS_SABADO = ['08h00', '09h00', '10h00', '11h00']

def get_cards_trello():
    """Buscar cards do Trello"""
    url = f"https://api.trello.com/1/boards/{TRELLO_BOARD_ID}/cards"
    params = {
        'key': TRELLO_API_KEY,
        'token': TRELLO_TOKEN,
        'customFieldItems': 'true'
    }
    response = requests.get(url, params=params)
    return response.json()

def get_custom_fields():
    """Buscar custom fields do board"""
    url = f"https://api.trello.com/1/boards/{TRELLO_BOARD_ID}/customFields"
    params = {'key': TRELLO_API_KEY, 'token': TRELLO_TOKEN}
    response = requests.get(url, params=params)
    return response.json()

def get_custom_field_value(card, field_name, custom_fields):
    """Extrair valor de custom field"""
    if not card.get('customFieldItems') or not custom_fields:
        return None
    
    field = next((f for f in custom_fields if f['name'] == field_name), None)
    if not field:
        return None
    
    item = next((i for i in card['customFieldItems'] if i['idCustomField'] == field['id']), None)
    if not item:
        return None
    
    if 'value' in item:
        if 'date' in item['value']:
            return item['value']['date']
        if 'text' in item['value']:
            return item['value']['text']
        if 'number' in item['value']:
            return item['value']['number']
    
    if 'idValue' in item and 'options' in field:
        option = next((o for o in field['options'] if o['id'] == item['idValue']), None)
        if option:
            return option['value']['text']
    
    return None

def extrair_placa(nome):
    """Extrair placa do nome do card"""
    parts = nome.split(' ')
    return parts[-1] if parts else 'N/A'

def gerar_sugestao(data_alvo):
    """Gerar sugestão de agenda para data específica"""
    print(f"📅 Gerando sugestão para {data_alvo}...")
    
    # Buscar dados do Trello
    cards = get_cards_trello()
    custom_fields = get_custom_fields()
    
    # Filtrar cards elegíveis (Diagnóstico, Aguardando Aprovação, Aguardando Peças)
    listas_elegiveis = ['Diagnóstico', 'Aguardando Diagnóstico', 'Aguardando Aprovação', 'Aguardando Peças', 'Pronto para Iniciar']
    
    cards_elegiveis = []
    for card in cards:
        # Buscar nome da lista (simplificado - assumindo que está no card)
        placa = extrair_placa(card['name'])
        tipo = get_custom_field_value(card, 'Categoria', custom_fields) or 'Manutenção'
        
        cards_elegiveis.append({
            'placa': placa,
            'tipo': tipo,
            'nome': card['name']
        })
    
    # Determinar horários baseado no dia da semana
    data_obj = datetime.strptime(data_alvo, '%Y-%m-%d')
    dia_semana = data_obj.weekday()  # 0=segunda, 5=sábado
    
    if dia_semana == 5:  # Sábado
        horarios = HORARIOS_SABADO
    else:
        horarios = HORARIOS_SEMANA
    
    # Distribuir cards entre mecânicos
    total_slots = len(MECANICOS) * len(horarios)
    cards_distribuidos = cards_elegiveis[:total_slots]
    
    # Criar sugestão
    sugestao = {}
    idx = 0
    
    for mecanico in MECANICOS:
        sugestao[mecanico] = []
        for horario in horarios:
            if idx < len(cards_distribuidos):
                sugestao[mecanico].append({
                    'horario': horario,
                    'placa': cards_distribuidos[idx]['placa'],
                    'tipo': cards_distribuidos[idx]['tipo']
                })
                idx += 1
    
    return sugestao, data_alvo

def formatar_mensagem(sugestao, data_alvo):
    """Formatar mensagem para Telegram"""
    data_obj = datetime.strptime(data_alvo, '%Y-%m-%d')
    data_formatada = data_obj.strftime('%d/%m/%Y')
    dia_semana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][data_obj.weekday()]
    
    mensagem = f"🤖 *SUGESTÃO DE AGENDA*\n\n"
    mensagem += f"📅 {dia_semana}, {data_formatada}\n\n"
    
    for mecanico, atendimentos in sugestao.items():
        mensagem += f"👨‍🔧 *{mecanico}*\n"
        if atendimentos:
            for item in atendimentos:
                mensagem += f"  • {item['horario']} - {item['placa']} ({item['tipo']})\n"
        else:
            mensagem += f"  • Sem atendimentos\n"
        mensagem += "\n"
    
    mensagem += "━━━━━━━━━━━━━━━━━━━━━━\n"
    mensagem += "Para aprovar, responda: `/aprovar {data_alvo}`\n"
    mensagem += f"Exemplo: `/aprovar {data_alvo}`"
    
    return mensagem

def enviar_telegram(mensagem):
    """Enviar mensagem via Telegram"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        'chat_id': TELEGRAM_CHAT_ID,
        'text': mensagem,
        'parse_mode': 'Markdown'
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        print("✅ Mensagem enviada com sucesso!")
        return True
    else:
        print(f"❌ Erro ao enviar mensagem: {response.text}")
        return False

def salvar_sugestao_banco(sugestao, data_alvo):
    """Salvar sugestão no banco de dados (tabela sugestoes)"""
    # TODO: Implementar salvamento no banco via API
    print(f"💾 Salvando sugestão no banco para {data_alvo}...")
    
    # Por enquanto, salvar em arquivo JSON
    import os
    os.makedirs('/home/ubuntu/dashboard-oficina-doctorauto/data', exist_ok=True)
    
    with open(f'/home/ubuntu/dashboard-oficina-doctorauto/data/sugestao_{data_alvo}.json', 'w') as f:
        json.dump({
            'data': data_alvo,
            'sugestao': sugestao,
            'criado_em': datetime.now().isoformat(),
            'aprovado': False
        }, f, indent=2)
    
    print("✅ Sugestão salva!")

def main():
    # Determinar data alvo
    if len(sys.argv) > 1:
        data_alvo = sys.argv[1]
    else:
        # Calcular próximo dia útil
        hoje = datetime.now()
        dia_semana = hoje.weekday()
        
        if dia_semana == 4:  # Sexta (17h) → Sábado
            data_alvo = (hoje + timedelta(days=1)).strftime('%Y-%m-%d')
        elif dia_semana == 5:  # Sábado (11h30) → Segunda
            data_alvo = (hoje + timedelta(days=2)).strftime('%Y-%m-%d')
        else:  # Seg-Qui (17h) → Dia seguinte
            data_alvo = (hoje + timedelta(days=1)).strftime('%Y-%m-%d')
    
    print("=" * 60)
    print("GERADOR DE SUGESTÃO DE AGENDA - DOCTOR AUTO")
    print("=" * 60)
    print()
    
    # Gerar sugestão
    sugestao, data = gerar_sugestao(data_alvo)
    
    # Formatar mensagem
    mensagem = formatar_mensagem(sugestao, data)
    
    # Salvar no banco
    salvar_sugestao_banco(sugestao, data)
    
    # Enviar Telegram
    print()
    print("📤 Enviando para Telegram...")
    enviar_telegram(mensagem)
    
    print()
    print("=" * 60)
    print("✅ PROCESSO CONCLUÍDO!")
    print("=" * 60)

if __name__ == "__main__":
    main()
