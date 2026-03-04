import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Play,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Settings,
  History,
  TrendingUp,
  DollarSign,
  Zap,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ExecucaoLog {
  id: string;
  timestamp: string;
  status: 'success' | 'error' | 'running';
  mensagem: string;
  dados?: {
    faturado?: number;
    preso?: number;
    atrasado?: number;
    saidaHoje?: number;
    entregues?: number;
    ticketMedio?: number;
    meta?: number;
    progresso?: number;
  };
  relatorio?: string;
  erro?: string;
  duracao?: number;
}

interface ConfiguracaoRobo {
  webhookMake: string;
  horarioAgendamento: string;
  ativo: boolean;
}

const CONFIG_KEY = 'robo_financeiro_config';
const LOGS_KEY = 'robo_financeiro_logs';

export default function RoboFinanceiro() {
  const [executando, setExecutando] = useState(false);
  const [logs, setLogs] = useState<ExecucaoLog[]>([]);
  const [ultimaExecucao, setUltimaExecucao] = useState<ExecucaoLog | null>(null);
  const [config, setConfig] = useState<ConfiguracaoRobo>({
    webhookMake: '',
    horarioAgendamento: '08:00',
    ativo: false,
  });
  const [modalConfigOpen, setModalConfigOpen] = useState(false);
  const [webhookTemp, setWebhookTemp] = useState('');
  const [horarioTemp, setHorarioTemp] = useState('08:00');
  const [logsExpandidos, setLogsExpandidos] = useState(false);
  const [relatorioExpandido, setRelatorioExpandido] = useState<string | null>(null);

  // Carregar configuração e logs do localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem(CONFIG_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      setWebhookTemp(parsed.webhookMake || '');
      setHorarioTemp(parsed.horarioAgendamento || '08:00');
    }

    const savedLogs = localStorage.getItem(LOGS_KEY);
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      setLogs(parsedLogs);
      if (parsedLogs.length > 0) {
        setUltimaExecucao(parsedLogs[0]);
      }
    }
  }, []);

  const salvarConfig = () => {
    const novaConfig: ConfiguracaoRobo = {
      webhookMake: webhookTemp,
      horarioAgendamento: horarioTemp,
      ativo: config.ativo,
    };
    setConfig(novaConfig);
    localStorage.setItem(CONFIG_KEY, JSON.stringify(novaConfig));
    setModalConfigOpen(false);
  };

  const adicionarLog = (log: ExecucaoLog) => {
    setLogs(prev => {
      const novosLogs = [log, ...prev].slice(0, 50); // Manter últimos 50 logs
      localStorage.setItem(LOGS_KEY, JSON.stringify(novosLogs));
      return novosLogs;
    });
    setUltimaExecucao(log);
  };

  const executarRobo = async () => {
    if (executando) return;
    setExecutando(true);

    const logId = Date.now().toString();
    const logInicio: ExecucaoLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      status: 'running',
      mensagem: '🤖 Robô iniciado — coletando dados do Trello...',
    };
    adicionarLog(logInicio);

    const inicio = Date.now();

    try {
      const response = await fetch('/api/robo-financeiro/executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookMake: config.webhookMake }),
      });

      const result = await response.json();
      const duracao = Math.round((Date.now() - inicio) / 1000);

      if (response.ok && result.success) {
        const logSucesso: ExecucaoLog = {
          id: logId,
          timestamp: new Date().toISOString(),
          status: 'success',
          mensagem: result.mensagemEnviada
            ? '✅ Relatório gerado e enviado com sucesso via Make!'
            : '✅ Relatório gerado com sucesso (webhook não configurado)',
          dados: result.dados,
          relatorio: result.relatorio,
          duracao,
        };
        adicionarLog(logSucesso);
      } else {
        throw new Error(result.error || 'Erro desconhecido na execução');
      }
    } catch (error: any) {
      const duracao = Math.round((Date.now() - inicio) / 1000);
      const logErro: ExecucaoLog = {
        id: logId,
        timestamp: new Date().toISOString(),
        status: 'error',
        mensagem: '❌ Erro na execução do robô',
        erro: error.message,
        duracao,
      };
      adicionarLog(logErro);
    } finally {
      setExecutando(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value && value !== 0) return '—';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatTimestamp = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (status: ExecucaoLog['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Sucesso</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">❌ Erro</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 animate-pulse">⚙️ Executando</Badge>;
    }
  };

  const logsVisiveis = logsExpandidos ? logs : logs.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">🤖 Robô Planejador Financeiro</h1>
              <p className="text-slate-500 mt-1">
                Coleta dados do Trello · Gera análise com IA · Envia relatório via Make
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Dialog open={modalConfigOpen} onOpenChange={setModalConfigOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-300">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurar
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-slate-200 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Configurações do Robô
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <Label className="text-slate-700 font-medium">Webhook do Make (URL)</Label>
                    <Input
                      value={webhookTemp}
                      onChange={e => setWebhookTemp(e.target.value)}
                      placeholder="https://hook.eu2.make.com/..."
                      className="mt-1 border-slate-300"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Cole aqui a URL do webhook configurado no Make para envio do relatório.
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-700 font-medium">Horário de Agendamento Automático</Label>
                    <Input
                      type="time"
                      value={horarioTemp}
                      onChange={e => setHorarioTemp(e.target.value)}
                      className="mt-1 border-slate-300"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Horário diário para execução automática do robô (configurado no servidor).
                    </p>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={salvarConfig} className="bg-purple-600 hover:bg-purple-700 text-white flex-1">
                      Salvar Configurações
                    </Button>
                    <Button variant="outline" onClick={() => setModalConfigOpen(false)} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              onClick={executarRobo}
              disabled={executando}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 shadow-md"
            >
              {executando ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Executando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Executar Agora
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status do Robô */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Status do Robô</span>
              <Zap className="w-4 h-4 text-purple-500" />
            </div>
            {executando ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-semibold text-blue-700">Executando...</span>
              </div>
            ) : ultimaExecucao?.status === 'success' ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="font-semibold text-green-700">Pronto</span>
              </div>
            ) : ultimaExecucao?.status === 'error' ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="font-semibold text-red-700">Erro na última execução</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full" />
                <span className="font-semibold text-slate-500">Aguardando</span>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {ultimaExecucao ? `Última execução: ${formatTimestamp(ultimaExecucao.timestamp)}` : 'Nenhuma execução registrada'}
            </p>
          </div>

          {/* Webhook */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Webhook Make</span>
              <Send className="w-4 h-4 text-blue-500" />
            </div>
            {config.webhookMake ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-semibold text-green-700">Configurado</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-amber-700">Não configurado</span>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {config.webhookMake
                ? config.webhookMake.substring(0, 40) + '...'
                : 'Configure o webhook para envio automático'}
            </p>
          </div>

          {/* Total de Execuções */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">Total de Execuções</span>
              <History className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
            <p className="text-xs text-slate-400 mt-2">
              {logs.filter(l => l.status === 'success').length} com sucesso ·{' '}
              {logs.filter(l => l.status === 'error').length} com erro
            </p>
          </div>
        </div>

        {/* Último Relatório */}
        {ultimaExecucao?.status === 'success' && ultimaExecucao.dados && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Último Relatório Gerado
                </h2>
                <span className="text-sm text-slate-400">{formatTimestamp(ultimaExecucao.timestamp)}</span>
              </div>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 divide-x divide-y divide-slate-100">
              {[
                { label: 'Faturado', value: formatCurrency(ultimaExecucao.dados.faturado), icon: '💰', color: 'text-green-600' },
                { label: 'Preso no Pátio', value: formatCurrency(ultimaExecucao.dados.preso), icon: '🔒', color: 'text-amber-600' },
                { label: 'Atrasado', value: formatCurrency(ultimaExecucao.dados.atrasado), icon: '⚠️', color: 'text-red-600' },
                { label: 'Saída Hoje', value: formatCurrency(ultimaExecucao.dados.saidaHoje), icon: '📅', color: 'text-blue-600' },
                { label: 'Entregues', value: `${ultimaExecucao.dados.entregues ?? 0} carros`, icon: '✅', color: 'text-green-600' },
                { label: 'Ticket Médio', value: formatCurrency(ultimaExecucao.dados.ticketMedio), icon: '📊', color: 'text-purple-600' },
              ].map((item, i) => (
                <div key={i} className="p-4 text-center">
                  <p className="text-lg mb-1">{item.icon}</p>
                  <p className={`text-base font-bold ${item.color}`}>{item.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Relatório IA */}
            {ultimaExecucao.relatorio && (
              <div className="p-5 border-t border-slate-100">
                <button
                  onClick={() =>
                    setRelatorioExpandido(
                      relatorioExpandido === ultimaExecucao.id ? null : ultimaExecucao.id
                    )
                  }
                  className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900 transition-colors"
                >
                  <Bot className="w-4 h-4" />
                  {relatorioExpandido === ultimaExecucao.id ? 'Ocultar' : 'Ver'} Análise Completa da IA
                  {relatorioExpandido === ultimaExecucao.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {relatorioExpandido === ultimaExecucao.id && (
                  <div className="mt-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {ultimaExecucao.relatorio}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Histórico de Execuções */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-600" />
              Histórico de Execuções
            </h2>
            {logs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Limpar todo o histórico de execuções?')) {
                    setLogs([]);
                    setUltimaExecucao(null);
                    localStorage.removeItem(LOGS_KEY);
                  }
                }}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Limpar histórico
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <Bot className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Nenhuma execução registrada</p>
              <p className="text-slate-300 text-sm mt-1">Clique em "Executar Agora" para iniciar o robô</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-50">
                {logsVisiveis.map(log => (
                  <div key={log.id + log.timestamp} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-0.5">
                          {log.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {log.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                          {log.status === 'running' && <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{log.mensagem}</p>
                          {log.erro && (
                            <p className="text-xs text-red-500 mt-1 font-mono bg-red-50 px-2 py-1 rounded">
                              {log.erro}
                            </p>
                          )}
                          {log.dados && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {log.dados.faturado !== undefined && (
                                <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                  💰 {formatCurrency(log.dados.faturado)}
                                </span>
                              )}
                              {log.dados.preso !== undefined && (
                                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                                  🔒 Preso: {formatCurrency(log.dados.preso)}
                                </span>
                              )}
                              {log.dados.entregues !== undefined && (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                  ✅ {log.dados.entregues} entregues
                                </span>
                              )}
                            </div>
                          )}
                          {log.relatorio && (
                            <button
                              onClick={() =>
                                setRelatorioExpandido(
                                  relatorioExpandido === log.id ? null : log.id
                                )
                              }
                              className="text-xs text-purple-600 hover:text-purple-800 mt-2 flex items-center gap-1"
                            >
                              <Bot className="w-3 h-3" />
                              {relatorioExpandido === log.id ? 'Ocultar' : 'Ver'} relatório IA
                            </button>
                          )}
                          {relatorioExpandido === log.id && log.relatorio && (
                            <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100 text-xs text-slate-600 whitespace-pre-wrap font-sans">
                              {log.relatorio}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {getStatusBadge(log.status)}
                        <p className="text-xs text-slate-400 mt-1">{formatTimestamp(log.timestamp)}</p>
                        {log.duracao && (
                          <p className="text-xs text-slate-300 mt-0.5 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {log.duracao}s
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {logs.length > 5 && (
                <div className="p-3 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setLogsExpandidos(!logsExpandidos)}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mx-auto"
                  >
                    {logsExpandidos ? (
                      <>
                        <ChevronUp className="w-4 h-4" /> Mostrar menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" /> Ver todos os {logs.length} registros
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Informações do Robô */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
          <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Como o Robô Funciona
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                icon: '📡',
                title: 'Coleta de Dados',
                desc: 'Acessa a API do Trello e extrai todos os dados financeiros do quadro da Doctor Auto',
              },
              {
                step: '2',
                icon: '🧠',
                title: 'Análise com IA',
                desc: 'Processa os dados com GPT-4 para gerar prognóstico, alertas e sugestões estratégicas',
              },
              {
                step: '3',
                icon: '📊',
                title: 'Formatação',
                desc: 'Monta relatório completo com emojis, métricas e recomendações para o grupo',
              },
              {
                step: '4',
                icon: '📤',
                title: 'Envio via Make',
                desc: 'Dispara o webhook do Make que entrega o relatório no grupo do WhatsApp/Telegram',
              },
            ].map(item => (
              <div key={item.step} className="bg-white/70 rounded-lg p-4 border border-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.step}
                  </span>
                  <span className="text-lg">{item.icon}</span>
                </div>
                <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
