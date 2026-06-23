import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Activity, 
  Database, 
  FileCheck, 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Terminal, 
  Clock, 
  Search, 
  SlidersHorizontal,
  ArrowRight,
  Server,
  Cpu,
  CornerDownRight,
  ShieldAlert,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NetworkCount {
  users: number;
  events: number;
  registrations: number;
  presence_checks: number;
  certificates: number;
  audit_logs: number;
}

interface HealthData {
  api: {
    status: string;
    latency_ms: number;
    python_version: string;
    env: string;
    uptime_check: string;
    cors_headers: string;
  };
  database: {
    status: string;
    latency_ms: number;
    type: string;
    counts: NetworkCount;
  };
  certificate_queue: {
    total_generated: number;
    pending_generation: number;
    pending_dispatch: number;
    processing_speed: string;
    status: string;
  };
  email_queue: {
    total: number;
    pending: number;
    sent: number;
    failed: number;
    recent_deliveries: Array<{
      id: number;
      certificate_id: number;
      recipient_email: string;
      sent_at: string;
      status: string;
      attempts: number;
      error_message: string | null;
    }>;
    status: string;
  };
  error_logs: Array<{
    timestamp: string;
    category: string;
    message: string;
    severity: string;
  }>;
}

export const SystemHealthTab: React.FC = () => {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logFilter, setLogFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SMTP' | 'AUDIT'>('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/reports/system-health');
      setData(res);
      setRefreshCountdown(30);
    } catch (err: any) {
      console.error('Erro ao buscar dados de saúde do sistema', err);
      setError(err.message || 'Falha ao conectar com o serviço de diagnóstico municipal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  // Efeito para auto refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchHealth();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-12 h-12 text-gov-blue animate-spin mb-4" />
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Iniciando Sonda Diagnóstica</h3>
        <p className="text-gray-400 font-medium text-xs mt-1">Carregando livro caixa, filas SMTP, registros do ORM e conexões de rede...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 border border-red-100 p-8 rounded-[32px] text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-red-150 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-red-950 uppercase">Erro de Telecomunicação</h3>
        <p className="text-red-800 text-sm mt-2 leading-relaxed">{error}</p>
        <button 
          onClick={fetchHealth}
          className="mt-6 inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase text-[10px] tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" /> Reestabelecer Conexão
        </button>
      </div>
    );
  }

  // Filtrar logs de erro baseados no filtro selecionado
  const getFilteredLogs = () => {
    if (!data) return [];
    return data.error_logs.filter((log) => {
      if (logFilter === 'ALL') return true;
      if (logFilter === 'CRITICAL') return log.severity === 'CRITICAL';
      if (logFilter === 'WARNING') return log.severity === 'WARNING';
      if (logFilter === 'SMTP') return log.category === 'SMTP' || log.category === 'E-MAIL';
      if (logFilter === 'AUDIT') return log.category === 'AUDITORIA';
      return true;
    });
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-10">
      
      {/* Barra de Controle de Atualização */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full animate-ping ${data?.api.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          <p className="text-xs text-gray-500 font-semibold">
            {autoRefresh ? (
              <span>Atualização automática ativa. Verificando novamente em <strong className="font-mono text-gray-700 font-bold">{refreshCountdown}s</strong></span>
            ) : (
              <span>Atualização manual selecionada.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-gov-blue focus:ring-gov-blue/20 w-4 h-4"
            />
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Auto Refresh</span>
          </label>
          <button 
            onClick={fetchHealth}
            className="flex items-center gap-2 border border-gray-200 hover:border-gray-300 bg-gray-50 py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-gray-600 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sondar Agora
          </button>
        </div>
      </div>

      {/* Grid de Principais Serviços (APIs e Banco de Dados) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Bloco 1: APIs Online */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-bl-[160px] -z-0"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-50 text-gov-blue rounded-2xl border border-blue-100">
                <Activity className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9px] uppercase tracking-wider rounded">
                {data?.api.status}
              </span>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">API de Serviços Governamentais</h3>
            <p className="text-gray-400 text-xs font-semibold mt-1">Status de gateway, integridade de rotas e latência do servidor HTTP no Cloud Run.</p>

            <div className="grid grid-cols-2 gap-6 mt-8 border-t border-gray-50 pt-6">
              <div>
                <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block">Latência Média</span>
                <strong className="text-xl font-black text-gray-800 tracking-tight font-mono">{data?.api.latency_ms} ms</strong>
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block">Ambiente</span>
                <strong className="text-base font-black text-blue-700 tracking-tight uppercase">{data?.api.env}</strong>
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block">Runtime de Execução</span>
                <strong className="text-xs font-black text-gray-700 line-clamp-1 block mt-0.5">{data?.api.python_version.split(' ')[0]}</strong>
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block">Uptime Check</span>
                <strong className="text-xs font-black text-emerald-600 block flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" /> ONLINE
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco 2: Banco de Dados Online */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[160px] -z-0"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-gray-550/10 text-gray-600 rounded-2xl border border-gray-200">
                <Database className="w-6 h-6" />
              </div>
              <span className={`px-3 py-1 font-bold text-[9px] uppercase tracking-wider rounded ${
                data?.database.status === 'CONNECTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {data?.database.status === 'CONNECTED' ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Banco de Dados Relacional</h3>
            <p className="text-gray-400 text-xs font-semibold mt-1">Conexão ativa do pool SQLAlchemy ORM, controle transacional e integridade física de tabelas.</p>

            <div className="grid grid-cols-2 gap-6 mt-8 border-t border-gray-50 pt-6">
              <div>
                <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block">Resposta DB</span>
                <strong className="text-xl font-black text-gray-800 tracking-tight font-mono">{data?.database.latency_ms} ms</strong>
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block">SGBD Driver</span>
                <strong className="text-xs font-black text-gray-700 tracking-tight leading-loose block font-mono">SQLAlchemy + SQLite</strong>
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block">Tabelas Mapeadas</span>
                <strong className="text-xs font-black text-gray-700 block mt-0.5">6 Core Tables</strong>
              </div>
              <div>
                <span className="text-[9px] font-black text-gray-350 uppercase tracking-widest block">Volume Total de Registros</span>
                <strong className="text-xs font-black text-blue-700 block mt-0.5">
                  {data ? (
                    data.database.counts.users +
                    data.database.counts.events +
                    data.database.counts.registrations +
                    data.database.counts.presence_checks +
                    data.database.counts.certificates +
                    data.database.counts.audit_logs
                  ) : 0} Entradas
                </strong>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Seção das Filas do Sistema (Certificados e E-mails) */}
      <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.25em] border-b border-gray-100 pb-3">
        Filas de Transmissão e Processamento Ativas
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card Fila de Certificados */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
          <div className="flex gap-4 items-center border-b border-gray-50 pb-5 mb-6">
            <div className="p-3.5 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest block">Processador de Diplomas</span>
              <h4 className="text-base font-black text-gray-900 uppercase">Fila de Lavratura (Certificados)</h4>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-center">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Gerados (Total)</span>
              <strong className="text-2xl font-black text-slate-800 tracking-tight font-mono mt-1 block">{data?.certificate_queue.total_generated}</strong>
            </div>
            <div className="bg-amber-55/10 border border-amber-100 rounded-2xl p-4 text-center">
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest block">Fila de Geração</span>
              <strong className="text-2xl font-black text-amber-600 tracking-tight font-mono mt-1 block">{data?.certificate_queue.pending_generation}</strong>
            </div>
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 text-center">
              <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest block">Pendente Envio</span>
              <strong className="text-2xl font-black text-indigo-700 tracking-tight font-mono mt-1 block">{data?.certificate_queue.pending_dispatch}</strong>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-gray-500 leading-normal font-semibold">
            <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
              <span>Velocidade de Geração:</span>
              <span className="text-gray-800 font-bold max-w-[200px] text-right line-clamp-1">{data?.certificate_queue.processing_speed}</span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
              <span>Status do Mecanismo:</span>
              <span className="flex items-center gap-1.5 font-bold text-gray-800">
                <span className={`w-2 h-2 rounded-full ${data?.certificate_queue.status === 'IDLE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {data?.certificate_queue.status === 'IDLE' ? 'EM ESPERA (IDLE)' : 'PROCESSANDO (ACTIVE)'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Fila de E-mails */}
        <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
          <div className="flex gap-4 items-center border-b border-gray-50 pb-5 mb-6">
            <div className="p-3.5 bg-sky-50 text-sky-700 rounded-2xl border border-sky-100">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest block">Servidor de Mensagens (SMTP)</span>
              <h4 className="text-base font-black text-gray-900 uppercase">Fila de Transmissão por E-mail</h4>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-6">
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-center">
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block">Total</span>
              <strong className="text-xl font-black text-slate-800 tracking-tight font-mono mt-1 block">{data?.email_queue.total}</strong>
            </div>
            <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-3 text-center">
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest block">Pendente</span>
              <strong className="text-xl font-black text-blue-600 tracking-tight font-mono mt-1 block">{data?.email_queue.pending}</strong>
            </div>
            <div className="bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 text-center">
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest block">Enviado</span>
              <strong className="text-xl font-black text-emerald-600 tracking-tight font-mono mt-1 block">{data?.email_queue.sent}</strong>
            </div>
            <div className="bg-red-50/30 border border-red-100 rounded-xl p-3 text-center">
              <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block">Falhou</span>
              <strong className="text-xl font-black text-red-600 tracking-tight font-mono mt-1 block">{data?.email_queue.failed}</strong>
            </div>
          </div>

          <div className="space-y-3.5 text-xs text-gray-500 leading-normal font-semibold">
            <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
              <span>Status de Transmissão:</span>
              <span className={`font-bold ${data?.email_queue.status === 'HEALTHY' ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`}>
                {data?.email_queue.status === 'HEALTHY' ? 'INTEGRIDADE EXCELENTE' : 'SINAL DEGRADADO / SMTP SIMULADO'}
              </span>
            </div>
            <div className="flex justify-between border-b border-dashed border-gray-100 pb-2">
              <span>Entrega Direta por Endpoint:</span>
              <span className="text-gray-800 font-bold font-mono">Direct / Simulation Web Sandbox</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bloco Detalhado: Histórico de Entregas Recentes de E-mail */}
      <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-gray-50 pb-5 mb-6">
          <div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block">Fila SMTP Auditável</span>
            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Posta de Envios (Últimas Entregas)</h4>
          </div>
          <div className="p-2 bg-gray-50 text-gray-400 rounded-xl border border-gray-100">
            <Send className="w-5 h-5" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {!data || data.email_queue.recent_deliveries.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs font-semibold">
              Nenhuma entrega recente efetuada na fila SMTP do sistema.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-gray-150 text-gray-400 uppercase font-bold text-[9px] tracking-wider">
                  <th className="py-3 px-4 pl-0">ID / Transação</th>
                  <th className="py-3 px-4">Destinatário</th>
                  <th className="py-3 px-4 text-center">Tentativas</th>
                  <th className="py-3 px-4">Carimbo de Data</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 pr-0">Detalhes de Conexão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-semibold text-gray-600">
                {data.email_queue.recent_deliveries.map((delivery) => (
                  <tr key={delivery.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-3.5 px-4 pl-0 font-mono text-gray-450">#DEL-{delivery.id}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-800 uppercase">{delivery.recipient_email}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{delivery.attempts}x</td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">
                      {new Date(delivery.sent_at).toLocaleDateString('pt-BR')} às {new Date(delivery.sent_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 border text-[8px] font-black uppercase rounded ${
                        delivery.status === 'SENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        delivery.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                        'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {delivery.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 pr-0 text-[10px] text-gray-400 max-w-xs truncate" title={delivery.error_message || "OK"}>
                      {delivery.error_message || "Enviado e gravado sem restrições"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Bloco Detalhado: Logs de Erro do Sistema */}
      <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-550/10 pb-5 mb-8">
          <div>
            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest block">Log de Incidentes de Segurança e Rede</span>
            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Logs de Falhas do Sistema</h4>
          </div>

          {/* Filtros de Logs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'CRITICAL', label: 'Críticos' },
              { id: 'WARNING', label: 'Avisos' },
              { id: 'SMTP', label: 'SMTP / E-mail' },
              { id: 'AUDIT', label: 'Auditoria' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setLogFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all select-none ${
                  logFilter === f.id 
                    ? 'bg-red-500 text-white shadow-md shadow-red-100' 
                    : 'bg-gray-50 text-gray-400 border border-gray-100 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Erros do Console em Alta Fidelidade */}
        <div className="bg-gray-900 rounded-3xl p-6 border border-gray-800 text-white font-mono text-xs overflow-hidden max-h-[480px] overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4 text-gray-450 text-[10px] uppercase font-bold justify-between select-none">
            <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-red-500" /> CLI Standard Terminal Output</span>
            <span>UTF-8 ENCODED LOGS</span>
          </div>

          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-medium">
                Nenhum incidente de segurança ou falha de sistema registrado para os filtros selecionados.
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-4 hover:bg-white/5 p-2 rounded transition-colors">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 mt-0.5 ${
                    log.severity === 'CRITICAL' ? 'bg-red-650/40 text-red-400 border border-red-550/35' :
                    log.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {log.severity}
                  </span>
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-450 font-bold select-none">
                      <span className="text-red-300 font-black">[{log.category}]</span>
                      <span>
                        {new Date(log.timestamp).toLocaleDateString('pt-BR')} {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-gray-250 leading-relaxed break-all font-medium text-[11px] selection:bg-red-500 selection:text-white">
                      {log.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
