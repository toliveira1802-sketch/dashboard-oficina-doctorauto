import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Edit3, Save, Plus, X, GripVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import Navigation from '@/components/Navigation';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MECANICOS = ['Samuel', 'Aldo', 'Tadeu', 'Wendel', 'JP'];

const HORARIOS = [
  '08h00',
  '09h00',
  '10h00',
  '11h00',
  // Almoço 12h15 - 13h30
  '13h30',
  '14h30',
  '15h30',
  '16h30',
  '17h30',
];

interface AgendaItem {
  id?: number;
  date: string;
  mecanico: string;
  horario: string;
  placa?: string;
  modelo?: string;
  tipo?: string;
  isEncaixe?: number;
  status?: string;
}

interface SortableCardProps {
  item: AgendaItem;
  onRemove: () => void;
  editMode: boolean;
}

function SortableCard({ item, onRemove, editMode }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || `temp-${item.placa}-${item.horario}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-white hover:shadow-md transition-shadow border-l-4 ${
        item.isEncaixe ? 'border-l-orange-500' : 'border-l-blue-500'
      } ${editMode ? 'cursor-move' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {editMode && (
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-slate-400" />
            </div>
          )}
          <span className="text-xs font-bold text-slate-600">{item.horario}</span>
        </div>
        <div className="flex items-center gap-2">
          {item.isEncaixe && (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
              Encaixe
            </span>
          )}
          {editMode && (
            <button
              onClick={onRemove}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <p className="font-bold text-slate-900 text-sm">{item.placa || 'N/A'}</p>
        <p className="text-xs text-slate-600 truncate">{item.modelo || 'Sem modelo'}</p>
        <p className="text-xs text-slate-500">{item.tipo || 'Manutenção'}</p>
      </div>

      {item.status && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <span
            className={`text-xs px-2 py-1 rounded ${
              item.status === 'concluido'
                ? 'bg-green-100 text-green-700'
                : item.status === 'em_andamento'
                ? 'bg-yellow-100 text-yellow-700'
                : item.status === 'cancelado'
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {item.status === 'planejado'
              ? 'Planejado'
              : item.status === 'em_andamento'
              ? 'Em Andamento'
              : item.status === 'concluido'
              ? 'Concluído'
              : 'Cancelado'}
          </span>
        </div>
      )}
    </Card>
  );
}

export default function Agenda() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  const [editMode, setEditMode] = useState(false);
  const [localAgenda, setLocalAgenda] = useState<Record<string, AgendaItem[]>>({});
  const [activeId, setActiveId] = useState<string | number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalMecanico, setAddModalMecanico] = useState('');
  const [newItem, setNewItem] = useState<Partial<AgendaItem>>({
    horario: '08h00',
    placa: '',
    modelo: '',
    tipo: 'Manutenção',
    isEncaixe: 0,
  });

  // Buscar agenda do dia
  const { data: agendaData, isLoading, refetch } = trpc.agenda.getByDate.useQuery({ date: selectedDate });
  const clearDateMutation = trpc.agenda.clearDate.useMutation();
  const createBatchMutation = trpc.agenda.createBatch.useMutation();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Atualizar agenda local quando dados mudarem
  useEffect(() => {
    if (agendaData) {
      const grouped: Record<string, AgendaItem[]> = {};
      MECANICOS.forEach((mec) => {
        grouped[mec] = [];
      });

      agendaData.forEach((item: any) => {
        if (grouped[item.mecanico]) {
          grouped[item.mecanico].push(item);
        }
      });

      // Ordenar por horário
      Object.keys(grouped).forEach((mec) => {
        grouped[mec].sort((a, b) => {
          const timeA = a.horario.replace('h', ':');
          const timeB = b.horario.replace('h', ':');
          return timeA.localeCompare(timeB);
        });
      });

      setLocalAgenda(grouped);
    }
  }, [agendaData]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    // Encontrar mecânico de origem e destino
    let sourceMecanico = '';
    let sourceIndex = -1;

    for (const mec of MECANICOS) {
      const idx = localAgenda[mec]?.findIndex((item) => item.id === active.id);
      if (idx !== -1) {
        sourceMecanico = mec;
        sourceIndex = idx;
        break;
      }
    }

    // Determinar mecânico de destino (baseado no ID do droppable)
    const targetMecanico = String(over.id).startsWith('droppable-')
      ? String(over.id).replace('droppable-', '')
      : sourceMecanico;

    if (sourceMecanico && sourceIndex !== -1) {
      const newAgenda = { ...localAgenda };
      const [movedItem] = newAgenda[sourceMecanico].splice(sourceIndex, 1);

      // Atualizar mecânico do item
      movedItem.mecanico = targetMecanico;

      // Adicionar ao destino
      if (!newAgenda[targetMecanico]) {
        newAgenda[targetMecanico] = [];
      }
      newAgenda[targetMecanico].push(movedItem);

      // Reordenar por horário
      newAgenda[targetMecanico].sort((a, b) => {
        const timeA = a.horario.replace('h', ':');
        const timeB = b.horario.replace('h', ':');
        return timeA.localeCompare(timeB);
      });

      setLocalAgenda(newAgenda);
      toast.success(`Atendimento movido para ${targetMecanico}`);
    }

    setActiveId(null);
  };

  const handleRemoveItem = (mecanico: string, index: number) => {
    const newAgenda = { ...localAgenda };
    const removed = newAgenda[mecanico][index];
    newAgenda[mecanico].splice(index, 1);
    setLocalAgenda(newAgenda);
    toast.success(`Atendimento ${removed.placa} removido`);
  };

  const handleAddItem = () => {
    if (!newItem.placa || !addModalMecanico) {
      toast.error('Preencha placa e selecione mecânico!');
      return;
    }

    const item: AgendaItem = {
      date: selectedDate,
      mecanico: addModalMecanico,
      horario: newItem.horario || '08h00',
      placa: newItem.placa,
      modelo: newItem.modelo || '',
      tipo: newItem.tipo || 'Manutenção',
      isEncaixe: newItem.isEncaixe || 0,
      status: 'planejado',
    };

    const newAgenda = { ...localAgenda };
    if (!newAgenda[addModalMecanico]) {
      newAgenda[addModalMecanico] = [];
    }
    newAgenda[addModalMecanico].push(item);

    // Reordenar
    newAgenda[addModalMecanico].sort((a, b) => {
      const timeA = a.horario.replace('h', ':');
      const timeB = b.horario.replace('h', ':');
      return timeA.localeCompare(timeB);
    });

    setLocalAgenda(newAgenda);
    setShowAddModal(false);
    setNewItem({
      horario: '08h00',
      placa: '',
      modelo: '',
      tipo: 'Manutenção',
      isEncaixe: 0,
    });
    toast.success('Atendimento adicionado!');
  };

  const handleSaveChanges = async () => {
    try {
      // Limpar agenda existente
      await clearDateMutation.mutateAsync({ date: selectedDate });

      // Preparar novos dados
      const allItems: AgendaItem[] = [];
      Object.entries(localAgenda).forEach(([mecanico, items]) => {
        items.forEach((item) => {
          allItems.push({
            ...item,
            date: selectedDate,
            mecanico,
          });
        });
      });

      // Salvar no banco
      if (allItems.length > 0) {
        await createBatchMutation.mutateAsync(allItems);
      }

      toast.success('Alterações salvas com sucesso!');
      setEditMode(false);
      refetch();
    } catch (error) {
      toast.error('Erro ao salvar alterações!');
      console.error(error);
    }
  };

  if (isLoading) {
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
            <p className="text-slate-600 mt-1">
              {editMode ? 'Modo de Edição - Arraste para reorganizar' : 'Visão Kanban do Dia'}
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md"
              disabled={editMode}
            />
            {!editMode ? (
              <>
                <Button onClick={() => refetch()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
                <Button onClick={() => setEditMode(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setShowAddModal(true);
                    setAddModalMecanico(MECANICOS[0]);
                  }}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
                <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    refetch();
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MECANICOS.map((mecanico) => (
              <div key={mecanico} className="flex flex-col">
                {/* Header da Coluna */}
                <Card className="p-4 mb-3 bg-blue-600 text-white">
                  <h2 className="text-lg font-bold text-center">{mecanico}</h2>
                  <p className="text-xs text-center text-blue-100 mt-1">
                    {localAgenda[mecanico]?.length || 0} atendimentos
                  </p>
                </Card>

                {/* Cards de Veículos */}
                <SortableContext
                  id={`droppable-${mecanico}`}
                  items={localAgenda[mecanico]?.map((item) => item.id || `temp-${item.placa}-${item.horario}`) || []}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 flex-1 min-h-[200px] p-2 rounded-lg bg-slate-100">
                    {!localAgenda[mecanico] || localAgenda[mecanico].length === 0 ? (
                      <Card className="p-4 bg-white border-2 border-dashed border-slate-300">
                        <p className="text-sm text-slate-500 text-center">
                          {editMode ? 'Arraste cards aqui' : 'Sem atendimentos'}
                        </p>
                      </Card>
                    ) : (
                      localAgenda[mecanico].map((item, idx) => (
                        <SortableCard
                          key={item.id || `temp-${item.placa}-${item.horario}-${idx}`}
                          item={item}
                          onRemove={() => handleRemoveItem(mecanico, idx)}
                          editMode={editMode}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            ))}
          </div>
        </DndContext>

        {/* Legenda */}
        <Card className="mt-6 p-4 bg-white">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Legenda</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-slate-600">Atendimento Normal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-slate-600">Encaixe</span>
            </div>
            {editMode && (
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Arraste para mover</span>
              </div>
            )}
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-slate-500">
          <p>Horários: 8h-17h30 • Almoço: 12h15-13h30</p>
          {!editMode && <p className="mt-1">Clique em "Editar" para reorganizar a agenda</p>}
        </div>
      </div>

      {/* Modal de Adicionar */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md bg-white">
            <h2 className="text-xl font-bold mb-4">Adicionar Atendimento</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mecânico</label>
                <select
                  value={addModalMecanico}
                  onChange={(e) => setAddModalMecanico(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  {MECANICOS.map((mec) => (
                    <option key={mec} value={mec}>
                      {mec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horário</label>
                <select
                  value={newItem.horario}
                  onChange={(e) => setNewItem({ ...newItem, horario: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  {HORARIOS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Placa *</label>
                <Input
                  value={newItem.placa}
                  onChange={(e) => setNewItem({ ...newItem, placa: e.target.value })}
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Modelo</label>
                <Input
                  value={newItem.modelo}
                  onChange={(e) => setNewItem({ ...newItem, modelo: e.target.value })}
                  placeholder="Gol 1.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={newItem.tipo}
                  onChange={(e) => setNewItem({ ...newItem, tipo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="Manutenção">Manutenção</option>
                  <option value="Revisão">Revisão</option>
                  <option value="Diagnóstico">Diagnóstico</option>
                  <option value="Reparo">Reparo</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newItem.isEncaixe === 1}
                  onChange={(e) => setNewItem({ ...newItem, isEncaixe: e.target.checked ? 1 : 0 })}
                  className="rounded"
                />
                <label className="text-sm">Marcar como Encaixe</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleAddItem} className="flex-1">
                Adicionar
              </Button>
              <Button onClick={() => setShowAddModal(false)} variant="outline" className="flex-1">
                Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
