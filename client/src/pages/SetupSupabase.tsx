import { useState } from 'react';
import { CheckCircle, Circle, Copy, Database, AlertCircle, Loader2 } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  sqlFile: string;
  completed: boolean;
}

export default function SetupSupabase() {
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: 'Criar Tabelas',
      description: 'Tabelas: trello_cards, kommo_leads, webhook_logs e índices',
      sqlFile: 'supabase-part1-tables.sql',
      completed: false,
    },
    {
      id: 2,
      title: 'Criar Funções e Triggers',
      description: 'Funções: process_kommo_webhook(), process_trello_webhook()',
      sqlFile: 'supabase-part2-functions.sql',
      completed: false,
    },
    {
      id: 3,
      title: 'Criar Views e RLS',
      description: 'Views úteis e políticas de segurança (Row Level Security)',
      sqlFile: 'supabase-part3-views-rls.sql',
      completed: false,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [sqlContent, setSqlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState('');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const loadSQL = async (sqlFile: string) => {
    try {
      setLoading(true);
      addLog(`Carregando ${sqlFile}...`);
      
      const response = await fetch(`/${sqlFile}`);
      if (!response.ok) {
        throw new Error(`Erro ao carregar ${sqlFile}`);
      }
      
      const content = await response.text();
      setSqlContent(content);
      addLog(`✅ ${sqlFile} carregado com sucesso!`);
      setError('');
    } catch (err: any) {
      const errorMsg = `❌ Erro ao carregar SQL: ${err.message}`;
      addLog(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlContent);
      addLog('📋 SQL copiado para área de transferência!');
    } catch (err) {
      addLog('❌ Erro ao copiar SQL');
    }
  };

  const markStepComplete = (stepId: number) => {
    setSteps(prev =>
      prev.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
    addLog(`✅ Etapa ${stepId} marcada como concluída!`);
    
    if (stepId < 3) {
      setCurrentStep(stepId + 1);
      loadSQL(steps[stepId].sqlFile);
    }
  };

  const validateTables = async () => {
    try {
      setValidating(true);
      addLog('🔍 Validando tabelas no Supabase...');
      
      const response = await fetch('/api/supabase/validate-tables');
      const data = await response.json();
      
      if (data.success) {
        addLog(`✅ Tabelas encontradas: ${data.tables.join(', ')}`);
        
        // Marcar etapas como concluídas baseado nas tabelas encontradas
        if (data.tables.includes('trello_cards') && data.tables.includes('kommo_leads')) {
          markStepComplete(1);
        }
      } else {
        addLog(`⚠️ Algumas tabelas não foram encontradas`);
      }
    } catch (err: any) {
      addLog(`❌ Erro ao validar: ${err.message}`);
    } finally {
      setValidating(false);
    }
  };

  const allStepsCompleted = steps.every(step => step.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Database className="w-12 h-12 text-red-500" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Setup Supabase
            </h1>
            <p className="text-gray-400 mt-1">
              Configure o banco de dados em 3 etapas simples
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progresso</span>
            <span className="text-sm font-bold text-red-500">
              {steps.filter(s => s.completed).length} / {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-red-500 to-red-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Steps */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Etapas</h2>
          
          {steps.map((step) => (
            <div
              key={step.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 transition-all cursor-pointer ${
                currentStep === step.id
                  ? 'border-red-500 shadow-lg shadow-red-500/20'
                  : step.completed
                  ? 'border-green-500'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => {
                setCurrentStep(step.id);
                loadSQL(step.sqlFile);
              }}
            >
              <div className="flex items-start gap-4">
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-500 flex-shrink-0 mt-1" />
                )}
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">
                      Etapa {step.id}: {step.title}
                    </h3>
                    {currentStep === step.id && (
                      <span className="text-xs bg-red-500 px-2 py-1 rounded">
                        ATUAL
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{step.description}</p>
                  <p className="text-xs text-gray-500 font-mono">{step.sqlFile}</p>
                  
                  {currentStep === step.id && !step.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markStepComplete(step.id);
                      }}
                      className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      ✅ Marcar como Concluída
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Validate Button */}
          <button
            onClick={validateTables}
            disabled={validating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {validating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Validar Tabelas
              </>
            )}
          </button>

          {allStepsCompleted && (
            <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-6 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-500 mb-2">
                🎉 Setup Concluído!
              </h3>
              <p className="text-gray-300">
                Todas as etapas foram executadas com sucesso!
              </p>
            </div>
          )}
        </div>

        {/* Right: SQL Preview & Logs */}
        <div className="space-y-4">
          {/* SQL Preview */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">SQL Preview</h2>
              <button
                onClick={copyToClipboard}
                disabled={!sqlContent}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copiar SQL
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              </div>
            ) : sqlContent ? (
              <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96 overflow-y-auto border border-gray-700">
                {sqlContent}
              </pre>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Selecione uma etapa para visualizar o SQL</p>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-900/30 border border-red-500 rounded-lg p-4 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-3">📋 Instruções</h3>
            <ol className="space-y-2 text-sm text-gray-300">
              <li>1. Clique em "Copiar SQL" para copiar o código</li>
              <li>2. Acesse o <a href="https://supabase.com/dashboard/project/mtrmtkvhgrzhwhhfffhj/editor" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:underline">Supabase SQL Editor</a></li>
              <li>3. Cole o SQL e clique em "Run"</li>
              <li>4. Volte aqui e marque a etapa como concluída</li>
              <li>5. Repita para as próximas etapas</li>
            </ol>
          </div>

          {/* Logs */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-3">📝 Logs</h3>
            <div className="bg-gray-900 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-xs space-y-1 border border-gray-700">
              {logs.length === 0 ? (
                <p className="text-gray-500">Nenhum log ainda...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-gray-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
