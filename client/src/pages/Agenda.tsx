import { useState, useEffect } from 'react';
import { Calendar, Clock, Save, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Navigation from '@/components/Navigation';

const TRELLO_API_KEY = 'e327cf4891fd2fcb6020899e3718c45e';
const TRELLO_TOKEN = 'ATTAa37008bfb8c135e0815e9a964d5c7f2e0b2ed2530c6bfdd202061e53ae1a6c18F1F6F8C7';
const BOARD_ID = '69562921bad93c92c7922d0a';

const HORARIOS = [
  { id: 1, hora: '08h15', periodo: 'Manhã' },
  { id: 2, hora: '10h15', periodo: 'Manhã' },
  { id: 3, hora: '13h30', periodo: 'Tarde' },
  { id: 4, hora: '15h30', periodo: 'Tarde' },
];

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

interface Card {
  id: string;
  name: string;
  customFieldItems?: any[];
}

interface SlotData {
  cardId: string;
  placa: string;
  modelo: string;
  tipo: string;
}

interface AgendaData {
  [mecanico: string]: {
    [slotId: number]: SlotData | null;
    encaixe1: SlotData | null;
    encaixe2: SlotData | null;
  };
}

export default function Agenda() {
  const [cards, setCards] = useState<Card[]>([]);
  const [agenda, setAgenda] = useState<AgendaData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCards();
    loadAgenda();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch(
        `https://api.trello.com/1/boards/${BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}&customFieldItems=true`
      );
      const data = await response.json();
      setCards(data);
    } catch (error) {
      console.error('Erro ao buscar cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgenda = () => {
    const saved = localStorage.getItem('agenda_mecanicos');
    if (saved) {
      setAgenda(JSON.parse(saved));
    } else {
      // Inicializar agenda vazia
      const initialAgenda: AgendaData = {};
      MECANICOS.forEach(mec => {
        initialAgenda[mec] = {
          1: null,
          2: null,
          3: null,
          4: null,
          encaixe1: null,
          encaixe2: null,
        };
      });
      setAgenda(initialAgenda);
    }
  };

  const saveAgenda = () => {
    setSaving(true);
    localStorage.setItem('agenda_mecanicos', JSON.stringify(agenda));
    setTimeout(() => {
      setSaving(false);
    }, 500);
  };

  const getCardInfo = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return null;

    // Extrair placa do nome (formato: "Modelo Placa")
    const parts = card.name.split(' ');
    const placa = parts[parts.length - 1];
    const modelo = parts.slice(0, -1).join(' ');

    // Buscar categoria nos custom fields
    let tipo = 'Manutenção';
    if (card.customFieldItems) {
      const categoriaField = card.customFieldItems.find((item: any) => 
        item.idCustomField
      );
      if (categoriaField && categoriaField.value) {
        tipo = categoriaField.value.text || 'Manutenção';
      }
    }

    return { placa, modelo, tipo };
  };

  const handleSlotChange = (mecanico: string, slotId: number | string, cardId: string) => {
    if (!cardId || cardId === 'none') {
      // Limpar slot
      setAgenda(prev => ({
        ...prev,
        [mecanico]: {
          ...prev[mecanico],
          [slotId]: null,
        },
      }));
      return;
    }

    const cardInfo = getCardInfo(cardId);
    if (!cardInfo) return;

    setAgenda(prev => ({
      ...prev,
      [mecanico]: {
        ...prev[mecanico],
        [slotId]: {
          cardId,
          ...cardInfo,
        },
      },
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              Agenda dos Mecânicos
            </h1>
            <p className="text-slate-600 mt-1">Gestão Visual de Atendimentos</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={fetchCards} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Placas
            </Button>
            <Button onClick={saveAgenda} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Agenda'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {MECANICOS.map(mecanico => (
            <Card key={mecanico} className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                {mecanico}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {HORARIOS.map(horario => {
                  const slot = agenda[mecanico]?.[horario.id];
                  return (
                    <div key={horario.id} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Clock className="h-4 w-4" />
                        {horario.hora} - {horario.periodo}
                      </div>
                      
                      <Select
                        value={slot?.cardId || ''}
                        onValueChange={(value) => handleSlotChange(mecanico, horario.id, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecionar veículo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Vazio</SelectItem>
                          {cards.map(card => (
                            <SelectItem key={card.id} value={card.id}>
                              {card.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {slot && (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <div className="text-sm font-bold text-blue-900">{slot.placa}</div>
                          <div className="text-xs text-blue-700">{slot.modelo}</div>
                          <div className="text-xs text-blue-600 mt-1">{slot.tipo}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Encaixes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['encaixe1', 'encaixe2'].map((encaixe, idx) => {
                    const slot = agenda[mecanico]?.[encaixe as keyof typeof agenda[typeof mecanico]];
                    return (
                      <div key={encaixe} className="space-y-2">
                        <div className="text-sm font-semibold text-orange-700">
                          Encaixe {idx + 1}
                        </div>
                        
                        <Select
                          value={slot?.cardId || ''}
                          onValueChange={(value) => handleSlotChange(mecanico, encaixe, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecionar veículo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Vazio</SelectItem>
                            {cards.map(card => (
                              <SelectItem key={card.id} value={card.id}>
                                {card.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {slot && (
                          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                            <div className="text-sm font-bold text-orange-900">{slot.placa}</div>
                            <div className="text-xs text-orange-700">{slot.modelo}</div>
                            <div className="text-xs text-orange-600 mt-1">{slot.tipo}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
