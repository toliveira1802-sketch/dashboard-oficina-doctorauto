import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import Navigation from "../components/Navigation";
import {
  Bot,
  Brain,
  Database,
  FileText,
  Layers3,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  Signal,
  Settings2,
  Sparkles,
  Zap,
  PlayCircle,
  AlertTriangle,
  Clock3,
  Activity,
  Cpu,
} from "lucide-react";

const statusPill = {
  online: { label: "Online", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  degraded: { label: "Degradado", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  offline: { label: "Offline", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  syncing: { label: "Sincronizando", className: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
} as const;

const mock = {
  summary: { activeAgents: 3, ragCollections: 4, indexedDocs: 1284, alerts: 2 },
  agents: [
    { name: "Sophia", role: "Regras de Negócio", status: "online", model: "Gemini 2.5 Pro", last: "há 2 min", tasks: 19 },
    { name: "Anna", role: "Vendas & Atendimento", status: "online", model: "GPT-5.4", last: "agora", tasks: 43 },
    { name: "Thamy", role: "Dados & Pesquisa", status: "degraded", model: "Claude Sonnet", last: "há 18 min", tasks: 11 },
  ],
  rag: [
    { name: "Manuais da Oficina", status: "online", docs: 382, chunks: 1844, updated: "há 4h" },
    { name: "Contratos & Jurídico", status: "syncing", docs: 88, chunks: 311, updated: "há 12m" },
    { name: "Regras de Negócio", status: "online", docs: 104, chunks: 460, updated: "há 1h" },
    { name: "Comercial & Scripts", status: "degraded", docs: 54, chunks: 191, updated: "há 2d" },
  ],
  connectors: [
    { name: "WhatsApp", status: "online", detail: "pareado", icon: MessageSquare },
    { name: "Telegram", status: "online", detail: "bot ativo", icon: Bot },
    { name: "Instagram", status: "offline", detail: "não conectado", icon: Sparkles },
    { name: "NotebookLM", status: "syncing", detail: "importação pendente", icon: FileText },
  ],
  ops: [
    { label: "Reindexar RAG", icon: Database, kind: "primary" },
    { label: "Testar Pergunta", icon: Brain, kind: "secondary" },
    { label: "Ver Logs", icon: Activity, kind: "secondary" },
    { label: "Reiniciar Agentes", icon: RefreshCw, kind: "danger" },
  ],
  logs: [
    { time: "00:18", level: "info", text: "RAG index atualizado com 32 novos chunks" },
    { time: "00:12", level: "warn", text: "Thamy entrou em modo degradado (tempo de resposta alto)" },
    { time: "00:04", level: "info", text: "WhatsApp respondeu com sucesso à última mensagem" },
    { time: "Ontem", level: "error", text: "NotebookLM aguardando login / importação" },
  ],
};

type Status = keyof typeof statusPill;

export default function AIControlCenter() {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    document.title = "AI Control Center - Doctor Auto";
  }, []);

  const totals = useMemo(() => {
    const onlineAgents = mock.agents.filter((a) => a.status === "online").length;
    const onlineConnectors = mock.connectors.filter((c) => c.status === "online").length;
    return { onlineAgents, onlineConnectors };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 900);
  };

  return (
    <>
      <Navigation />
      <div className="p-4 md:p-6 space-y-6 bg-gradient-to-b from-zinc-950 to-black min-h-screen text-white">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <ShieldCheck className="size-5" />
              <span className="text-xs uppercase tracking-[0.28em]">Doctor Auto · AI / RAG Control</span>
            </div>
            <h1 className="text-3xl font-bold">Painel Central de IA</h1>
            <p className="text-zinc-400 mt-1">Controle de agentes, RAG, conectores e operações em um só lugar.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onRefresh} className="bg-red-600 hover:bg-red-700">
              <RefreshCw className={`size-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardDescription className="text-zinc-400">Agentes ativos</CardDescription>
                <CardTitle className="text-3xl text-white mt-2">{mock.summary.activeAgents}</CardTitle>
              </div>
              <Cpu className="size-5 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">{totals.onlineAgents} online agora</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardDescription className="text-zinc-400">Coleções RAG</CardDescription>
                <CardTitle className="text-3xl text-white mt-2">{mock.summary.ragCollections}</CardTitle>
              </div>
              <Database className="size-5 text-sky-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">{mock.summary.indexedDocs} documentos indexados</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardDescription className="text-zinc-400">Conectores</CardDescription>
                <CardTitle className="text-3xl text-white mt-2">{mock.connectors.length}</CardTitle>
              </div>
              <Signal className="size-5 text-violet-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">{totals.onlineConnectors} conectados</p>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardDescription className="text-zinc-400">Alertas</CardDescription>
                <CardTitle className="text-3xl text-white mt-2">{mock.summary.alerts}</CardTitle>
              </div>
              <AlertTriangle className="size-5 text-amber-400" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500">requer atenção</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="size-5 text-red-400" />
              <CardTitle className="text-white">Agentes de IA</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Status e performance dos agentes ativos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {mock.agents.map((agent) => (
                <div key={agent.name} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{agent.name}</span>
                    <Badge variant="outline" className={statusPill[agent.status as Status].className}>
                      {statusPill[agent.status as Status].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-500">{agent.role}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Layers3 className="size-3" /> {agent.model}</span>
                    <span className="flex items-center gap-1"><Clock3 className="size-3" /> {agent.last}</span>
                  </div>
                  <div className="text-xs text-zinc-500">{agent.tasks} tarefas processadas</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RAG Collections */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="size-5 text-sky-400" />
              <CardTitle className="text-white">Coleções RAG</CardTitle>
            </div>
            <CardDescription className="text-zinc-400">Bases de conhecimento vetorizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {mock.rag.map((col) => (
                <div key={col.name} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{col.name}</span>
                    <Badge variant="outline" className={statusPill[col.status as Status].className}>
                      {statusPill[col.status as Status].label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span>{col.docs} docs</span>
                    <span>{col.chunks} chunks</span>
                    <span className="ml-auto flex items-center gap-1"><Clock3 className="size-3" /> {col.updated}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Connectors & Operations */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Connectors */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Signal className="size-5 text-violet-400" />
                <CardTitle className="text-white">Conectores</CardTitle>
              </div>
              <CardDescription className="text-zinc-400">Integrações de canais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mock.connectors.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.name} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 text-zinc-400" />
                      <div>
                        <span className="text-sm text-white font-medium">{c.name}</span>
                        <p className="text-xs text-zinc-500">{c.detail}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={statusPill[c.status as Status].className}>
                      {statusPill[c.status as Status].label}
                    </Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Operations */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="size-5 text-zinc-400" />
                <CardTitle className="text-white">Operações</CardTitle>
              </div>
              <CardDescription className="text-zinc-400">Ações rápidas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mock.ops.map((op) => {
                const Icon = op.icon;
                const variant = op.kind === "danger" ? "bg-red-600/10 border-red-500/30 text-red-400 hover:bg-red-600/20" :
                  op.kind === "primary" ? "bg-sky-600/10 border-sky-500/30 text-sky-400 hover:bg-sky-600/20" :
                    "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700";
                return (
                  <button
                    key={op.label}
                    className={`flex items-center gap-3 w-full rounded-lg border p-3 text-sm font-medium transition-colors ${variant}`}
                  >
                    <Icon className="size-4" />
                    {op.label}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Logs */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-zinc-400" />
              <CardTitle className="text-white">Logs Recentes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mock.logs.map((log, i) => {
                const color = log.level === "error" ? "text-red-400" : log.level === "warn" ? "text-amber-400" : "text-zinc-400";
                return (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="text-zinc-600 min-w-[48px] font-mono">{log.time}</span>
                    <span className={`uppercase text-[10px] font-bold min-w-[40px] mt-0.5 ${color}`}>{log.level}</span>
                    <span className="text-zinc-300">{log.text}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
