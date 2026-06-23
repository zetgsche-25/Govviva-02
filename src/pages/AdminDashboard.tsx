import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Event } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  FileText,
  X,
  RefreshCw,
  QrCode,
  Check,
  ShieldCheck,
  Trash2,
  Lock,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { SystemHealthTab } from '../components/SystemHealthTab';

export const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'audit' | 'emails' | 'health'>('events');

  // Controle de Eventos
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date_start: '',
    location: '',
    total_slots: 0,
    category: '',
    org_name: '',
    workload: 4,
    org_responsible: '',
    gestor_responsavel: ''
  });

  // Módulo de Frequência do Organizador
  const [selectedEventForPresence, setSelectedEventForPresence] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  
  const [ticketCodeToScan, setTicketCodeToScan] = useState('');
  const [scanResult, setScanResult] = useState<{ status: string; message: string; participant?: string } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Auditoria Municipal
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Envio de E-mails e Conclusão de Eventos
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [concluding, setConcluding] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else if (activeTab === 'emails') {
      fetchEmailLogs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedEventForPresence) {
      fetchParticipants(selectedEventForPresence.id);
    }
  }, [selectedEventForPresence]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.get('/events');
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos administrativos', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (eventId: number) => {
    try {
      setLoadingParticipants(true);
      const res = await api.get(`/presence/event/${eventId}`);
      setParticipants(res.participants || []);
    } catch (err) {
      console.error('Erro ao carregar participantes', err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingAudit(true);
      const data = await api.get('/presence/audit');
      setAuditLogs(data || []);
    } catch (err) {
      console.error('Erro ao carregar auditorias', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      setLoadingEmails(true);
      const data = await api.get('/certificates/email-logs');
      setEmailLogs(data || []);
    } catch (err) {
      console.error('Erro ao carregar logs de transmissão de e-mails', err);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleResendEmail = async (certId: number) => {
    if (resendingId !== null) return;
    setResendingId(certId);
    try {
      const res = await api.post(`/certificates/${certId}/resend-email`);
      alert(res.message || "Parabéns, e-mail de certificado reenviado com sucesso!");
      fetchEmailLogs();
    } catch (err: any) {
      console.error('Erro no reenvio de e-mail', err);
      alert("Falha no reenvio do e-mail: " + (err.error || err.message || "Erro desconhecido"));
    } finally {
      setResendingId(null);
    }
  };

  const handleConcludeEvent = async (eventId: number) => {
    if (!window.confirm("Atenção! Deseja realmente ENCERRAR OFICIALMENTE esta atividade?\n\nEsta ação vai:\n1. Alterar o status do evento para 'CONCLUÍDO'\n2. Certificar todos os participantes com presença validada (100%)\n3. Enviar certificados PDF por e-mail automaticamente")) {
      return;
    }
    setConcluding(true);
    try {
      const res = await api.post(`/events/${eventId}/conclude`);
      alert(`Sucesso! Evento encerrado oficial e eletronicamente.\n\n` + 
            `- Cidadãos aptos: ${res.eligible_participants_count}\n` +
            `- Certificados emitidos: ${res.certificates_issued_count}\n` +
            `- Transmitidos por e-mail: ${res.emails_sent_count}\n` +
            `- Falhas de SMTP: ${res.emails_failed_count}`
      );
      fetchEvents();
      // If we are editing presence of specific event:
      setSelectedEventForPresence(prev => prev ? { ...prev, status: 'CONCLUDED' } : null);
    } catch (err: any) {
      console.error('Erro ao concluir evento', err);
      alert("Falha ao concluir evento institucional: " + (err.error || err.message || "tente novamente"));
    } finally {
      setConcluding(false);
    }
  };

  const handleCancelEvent = async (eventId: number) => {
    if (!window.confirm("Atenção! Você está prestes a CANCELAR esta atividade de forma definitiva.\n\nEsta ação vai:\n1. Marcar o status do evento como 'CANCELADO'\n2. Gerar notificações automáticas no banco para TODOS os cidadãos inscritos.\n\nDeseja prosseguir?")) {
      return;
    }
    try {
      const res = await api.post(`/events/${eventId}/cancel`);
      alert(`Sucesso! Evento cancelado.\nNotificações de alerta enviadas para ${res.notified_count} cidadãos inscritos.`);
      fetchEvents();
      setSelectedEventForPresence(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
    } catch (err: any) {
      console.error('Erro ao cancelar evento', err);
      alert("Falha ao cancelar evento público: " + (err.message || "tente novamente"));
    }
  };

  const handleChangeLocation = async (eventId: number, currentLocation: string) => {
    const newLocation = window.prompt("Informe o novo endereço / local físico desta atividade pública:", currentLocation);
    if (newLocation === null) return;
    if (!newLocation.trim()) {
      alert("O campo de local é obrigatório.");
      return;
    }
    try {
      const res = await api.post(`/events/${eventId}/change-location`, { location: newLocation.trim() });
      alert(`Sucesso! Local atualizado para: ${res.new_location}.\nAlertas enviados para ${res.notified_count} inscritos.`);
      fetchEvents();
      setSelectedEventForPresence(prev => prev ? { ...prev, location: res.new_location } : null);
    } catch (err: any) {
      console.error('Erro ao alterar local do evento', err);
      alert("Falha ao atualizar o local: " + (err.message || "tente novamente"));
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', newEvent);
      setShowModal(false);
      fetchEvents();
      setNewEvent({
        title: '',
        description: '',
        date_start: '',
        location: '',
        total_slots: 0,
        category: '',
        org_name: '',
        workload: 4,
        org_responsible: '',
        gestor_responsavel: ''
      });
    } catch (error: any) {
      console.error('Erro ao criar evento', error);
      alert('Erro ao criar evento institucional: ' + (error.message || 'tente novamente'));
    }
  };

  const handleScanTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanError(null);
    setScanResult(null);
    if (!ticketCodeToScan.trim()) return;

    try {
      const res = await api.post('/presence/scan', { ticket_code: ticketCodeToScan.trim() });
      setScanResult({
        status: res.action_type || 'SUCCESS',
        message: res.message,
        participant: res.participant_name
      });
      setTicketCodeToScan('');
      if (selectedEventForPresence) {
        fetchParticipants(selectedEventForPresence.id);
      }
    } catch (err: any) {
      setScanError(err.message || 'Código do ticket inválido ou já escaneado.');
    }
  };

  const handleManualAction = async (registrationId: number, action: 'check_in' | 'check_out') => {
    try {
      const res = await api.post('/presence/manual', { registration_id: registrationId, action });
      if (selectedEventForPresence) {
        fetchParticipants(selectedEventForPresence.id);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao processar ação manual.');
    }
  };

  const handleResetPresence = async (registrationId: number) => {
    if (!window.confirm('Aviso de Segurança: Deseja realmente restaurar (zerar) todos os registros de presença desta inscrição?')) return;
    try {
      await api.post('/presence/reset', { registration_id: registrationId });
      if (selectedEventForPresence) {
        fetchParticipants(selectedEventForPresence.id);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao resetar frequência.');
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Admin */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gov-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-gov-blue uppercase tracking-[0.3em]">Gestão Pública Eficiente</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none">Painel de <span className="text-gov-blue">Controle Administrativo</span></h1>
              <p className="text-gray-400 font-medium mt-4 max-w-xl">Gerenciamento oficial de atividades, chamadas eletrônicas em lote e relatórios regulados do município.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/docs/render" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-white text-gray-700 border-2 border-gray-100 px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <FileText className="w-5 h-5 text-gov-blue" />
                Documentação PDF
              </a>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-3 bg-gov-blue text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gov-blue-dark transition-all shadow-2xl shadow-blue-100 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Criar Novo Evento
              </button>
            </div>
          </div>

          {/* Abas Administrativas */}
          <div className="flex gap-4 mt-12 border-b border-gray-100 pb-0">
            <button 
              onClick={() => setActiveTab('events')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'events' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Agenda e Atividades
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'audit' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Auditoria de Segurança ({auditLogs.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('emails')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'emails' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Logs de E-mail ({emailLogs.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab('health')}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'health' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Saúde do Sistema
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'events' ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Eventos Totais</p>
                <p className="text-4xl font-black text-gray-900 leading-none">{events.length}</p>
                <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                  <ArrowUpRight className="w-3 h-3" /> Agenda Ativa
                </div>
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Vagas Ofertadas</p>
                <p className="text-4xl font-black text-gray-900 leading-none">
                  {events.reduce((acc, e) => acc + e.total_slots, 0)}
                </p>
                <div className="mt-4 flex items-center gap-2 text-gov-blue font-black text-[10px] uppercase tracking-widest">
                  <Users className="w-3 h-3" /> Capacidade Total
                </div>
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Média de Carga Horária</p>
                <p className="text-4xl font-black text-gray-950 leading-none">
                  {events.length > 0 ? (events.reduce((acc, e) => acc + (e.workload || 4), 0) / events.length).toFixed(1) : 0}h
                </p>
                <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                  <CheckCircle className="w-3 h-3" /> Criteriosa (100% de Presença)
                </div>
              </div>
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Tempo de Resposta</p>
                <p className="text-4xl font-black text-gray-900 leading-none">0.8s</p>
                <div className="mt-4 flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                  <Clock className="w-3 h-3" /> Sistema Otimizado
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por título ou categoria..."
                  className="w-full pl-16 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">
                  <Filter className="w-4 h-4" />
                  Filtrar
                </button>
              </div>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Evento</th>
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Órgão Regulador</th>
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Carga Horária</th>
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status Vagas</th>
                      <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-10 py-8 h-20 bg-gray-50/20"></td>
                        </tr>
                      ))
                    ) : filteredEvents.map((event) => (
                      <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-gov-blue font-black flex-shrink-0 group-hover:bg-gov-blue group-hover:text-white transition-all">
                              {event.title.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-gray-900 uppercase tracking-tight mb-1">{event.title}</p>
                              <div className="flex items-center gap-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" /> {new Date(event.date_start).toLocaleDateString('pt-BR')}
                                </span>
                                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                <span className="text-gray-400">{event.location}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-200 shadow-sm">
                            {event.org_responsible || event.org_name || 'Secretaria Geral'}
                          </span>
                        </td>
                        <td className="px-10 py-8 font-mono text-xs font-bold text-gray-900">
                          {event.workload || 4} Horas Aula
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            <div className="w-24 bg-gray-150 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-gov-blue h-full rounded-full transition-all duration-1000"
                                style={{ width: `${((event.total_slots - event.available_slots) / event.total_slots) * 100}%` }}
                              ></div>
                            </div>
                            <p className="text-xs font-black text-gray-900 uppercase">
                              {event.total_slots - event.available_slots} <span className="text-gray-300">/ {event.total_slots}</span>
                            </p>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <button 
                            onClick={() => setSelectedEventForPresence(event)}
                            className="inline-flex items-center gap-2 px-5 py-3 bg-gov-blue-light text-gov-blue hover:bg-gov-blue hover:text-white rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all shadow-sm active:scale-95"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Chamada Oficial
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!loading && filteredEvents.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Nenhum evento localizado</h3>
                  <p className="text-gray-400 font-medium mt-2 tracking-tight">Tente ajustar seus termos de pesquisa institucional.</p>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'audit' ? (
          /* Aba de Auditoria Municipal */
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Histórico de Auditoria Eletrônica</h3>
                <p className="text-gray-400 text-sm font-medium mt-1">Registros de segurança e validações de presença regulados conforme a Lei Municipal.</p>
              </div>
              <button 
                onClick={fetchAuditLogs}
                disabled={loadingAudit}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-500 flex items-center gap-2 hover:text-gray-900 text-xs font-black uppercase tracking-widest"
              >
                <RefreshCw className={`w-4 h-4 ${loadingAudit ? 'animate-spin' : ''}`} />
                Atualizar Histórico
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Horário</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ação Regulada</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">IP Máquina</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Descrição / Cidadão</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Agente Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingAudit ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-10 py-6 h-12 bg-gray-50/20"></td>
                      </tr>
                    ))
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center text-sm text-gray-400 font-bold">
                        Nenhum registro de auditoria disponível no momento.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-10 py-6 font-mono text-xs text-gray-500 whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toLocaleString('pt-BR') : 'Tempo não registrado'}
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded-md border ${
                            log.action.includes('CHECKIN') 
                              ? 'bg-emerald-55 bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : log.action.includes('CHECKOUT') 
                                ? 'bg-cyan-50 text-cyan-700 border-cyan-100'
                                : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-10 py-6 font-mono text-xs text-gray-400">
                          {log.ip_address || "Interceptado"}
                        </td>
                        <td className="px-10 py-6">
                          <p className="text-xs font-bold text-gray-800 leading-relaxed">{log.description}</p>
                        </td>
                        <td className="px-10 py-6 text-xs font-bold text-gray-500">
                          {log.user_name || "Prefeitura / Sistema"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'emails' ? (
          /* Aba de Logs de Transmissão de E-mails */
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-10 border-b border-gray-100 flex items-center justify-between col-span-full">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Histórico de Transmissão de Certificados</h3>
                <p className="text-gray-400 text-sm font-medium mt-1">Logs de envios automáticos e manuais via SMTP com detalhamento de falhas e reenvios.</p>
              </div>
              <button 
                onClick={fetchEmailLogs}
                disabled={loadingEmails}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all text-gray-500 flex items-center gap-2 hover:text-gray-900 text-xs font-black uppercase tracking-widest disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loadingEmails ? 'animate-spin' : ''}`} />
                Atualizar Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Destinatário / PDF</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cidadão</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Evento</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status Envio</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Enviado Em</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tentativas</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tipo</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loadingEmails ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-10 py-6 h-12 bg-gray-50/20"></td>
                      </tr>
                    ))
                  ) : emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-sm text-gray-400 font-bold">
                        Nenhum registro de transmissão de e-mail disponível no momento.
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-10 py-6 font-mono text-xs text-gray-800 whitespace-nowrap">
                          {log.recipient_email}
                          <div className="text-[10px] text-gray-400 mt-1 font-mono">{log.certificate_code}</div>
                        </td>
                        <td className="px-10 py-6 text-xs font-bold text-gray-700">
                          {log.user_name}
                        </td>
                        <td className="px-10 py-6 text-xs text-gray-500 max-w-xs truncate">
                          {log.event_title}
                        </td>
                        <td className="px-10 py-6">
                          <span className={`px-2.5 py-1 text-[9px] font-black tracking-widest uppercase rounded-md border inline-block ${
                            log.status === 'SENT' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : log.status === 'FAILED' 
                                ? 'bg-red-50 text-red-700 border-red-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {log.status === 'SENT' ? 'Enviado' : log.status === 'FAILED' ? 'Falhou' : 'Pendente'}
                          </span>
                          {log.error_message && (
                            <div className="text-[10px] text-red-500 mt-1.5 max-w-xs font-medium leading-tight">
                              Erro: {log.error_message}
                            </div>
                          )}
                        </td>
                        <td className="px-10 py-6 font-mono text-xs text-gray-500 whitespace-nowrap">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString('pt-BR') : 'Não enviado'}
                        </td>
                        <td className="px-10 py-6 text-xs font-mono text-gray-500">
                          {log.attempts}
                        </td>
                        <td className="px-10 py-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                          {log.is_manual ? 'Manual' : 'Automático'}
                        </td>
                        <td className="px-10 py-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleResendEmail(log.certificate_id)}
                            disabled={resendingId === log.certificate_id}
                            className="bg-gov-blue hover:bg-gov-blue-dark text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all disabled:opacity-50"
                          >
                            {resendingId === log.certificate_id ? 'Enviando...' : 'Reenviar'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <SystemHealthTab />
        )}
      </div>

      {/* Slide-over ou Modal Gigante de Controle de Chamada Oficial */}
      {selectedEventForPresence && (
        <div className="fixed inset-0 z-[80] flex items-center justify-end p-0">
          <div className="absolute inset-0 bg-gov-blue-dark/50 backdrop-blur-md" onClick={() => {
            setSelectedEventForPresence(null);
            setScanResult(null);
            setScanError(null);
          }} />
          
          <div className="bg-white w-full max-w-4xl h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-250 z-10">
            {/* Header Chamada */}
            <div className="p-8 border-b border-gray-150 bg-gray-55 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest pl-1">Secretaria do Evento</span>
                <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tighter mt-1">{selectedEventForPresence.title}</h2>
                <p className="text-xs text-gray-400 mt-1">Carga Horária Exigida: {selectedEventForPresence.workload || 4} Horas | Local: {selectedEventForPresence.location}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {selectedEventForPresence.status !== 'CONCLUDED' && selectedEventForPresence.status !== 'CANCELLED' ? (
                  <>
                    <button
                      onClick={() => handleChangeLocation(selectedEventForPresence.id, selectedEventForPresence.location)}
                      className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      title="Alterar endereço/local do evento"
                    >
                      <MapPin className="w-4 h-4" />
                      Alterar Local
                    </button>

                    <button
                      onClick={() => handleCancelEvent(selectedEventForPresence.id)}
                      className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      title="Cancelar evento com alertas automáticos"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Cancelar Atividade
                    </button>

                    <button
                      onClick={() => handleConcludeEvent(selectedEventForPresence.id)}
                      disabled={concluding}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {concluding ? 'Encerrando...' : 'Encerrar Atividade'}
                    </button>
                  </>
                ) : (
                  <span className={`px-4 py-2 border text-[10px] font-black uppercase tracking-widest rounded-lg ${
                    selectedEventForPresence.status === 'CANCELLED'
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    {selectedEventForPresence.status === 'CANCELLED' ? 'Atividade Cancelada' : 'Atividade Concluída'}
                  </span>
                )}
                
                <button 
                  onClick={() => {
                    setSelectedEventForPresence(null);
                    setScanResult(null);
                    setScanError(null);
                  }} 
                  className="p-3 hover:bg-gray-100 text-gray-400 hover:text-gray-800 rounded-full transition-all"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
            </div>

            {/* Secao do Leitor de QR Code (Simulado) */}
            <div className="p-8 border-b border-gray-100 bg-blue-50/30">
              <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                <form onSubmit={handleScanTicket} className="flex-1">
                  <label className="block text-[10px] font-black text-gov-blue uppercase tracking-widest mb-3 pl-1">
                    Simular Escaneamento de Ingressos (Código Único QR)
                  </label>
                  <div className="relative">
                    <QrCode className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gov-blue" />
                    <input 
                      type="text" 
                      placeholder="Insira o PROTOCOLO ou TICKET do Cidadão para entrada/saída..."
                      className="w-full pl-16 pr-32 py-5 bg-white border border-gray-200.5 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                      value={ticketCodeToScan}
                      onChange={(e) => setTicketCodeToScan(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-3 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      Processar QR
                    </button>
                  </div>
                </form>

                {/* Resutado do escaneamento */}
                <div className="w-full lg:w-72 flex flex-col justify-center">
                  {scanResult && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 animate-fade-in">
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-emerald-950 uppercase">{scanResult.status === 'CHECKIN' ? 'Check-In Aprovado' : 'Check-Out Concluído'}</p>
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">{scanResult.message}</p>
                      </div>
                    </div>
                  )}

                  {scanError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 animate-fade-in">
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-black text-red-950 uppercase">Falha na Escuta</p>
                        <p className="text-[11px] text-red-700 font-medium mt-0.5">{scanError}</p>
                      </div>
                    </div>
                  )}

                  {!scanResult && !scanError && (
                    <div className="p-4 border border-gray-150 border-dashed rounded-2xl flex items-center justify-center text-center text-[10px] font-bold text-gray-400 h-full">
                      Aguardando leitura de QR Code...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lista dos Inscritos */}
            <div className="flex-grow overflow-y-auto p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Participantes Inscritos ({participants.length})</h3>
                  <p className="text-xs text-gray-400">Controles de override manual e logs oficiais de frequência para liberação de certificados.</p>
                </div>
                <button 
                  onClick={() => selectedEventForPresence && fetchParticipants(selectedEventForPresence.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingParticipants ? 'animate-spin' : ''}`} />
                  Recarregar Lista
                </button>
              </div>

              {loadingParticipants ? (
                <div className="py-20 text-center text-gray-400 font-bold text-sm">
                  Sincronizando frequências oficiais...
                </div>
              ) : participants.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <Users className="w-10 h-10 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-500">Nenhum cidadão inscrito nesta atividade ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {participants.map((p) => (
                    <div key={p.registration_id} className="p-6 bg-white border border-gray-100 rounded-[24px] hover:border-gray-200 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-black text-gray-950 uppercase">{p.user.name}</p>
                          <span className="text-[10px] pl-1.5 font-mono text-gray-300 font-bold uppercase tracking-wider select-all">CÓD: {p.ticket_code}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest pl-0.5">
                          <span>CPF: {p.user.cpf}</span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span>Inscrito em: {new Date(p.registered_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>

                      {/* Info de Entrada/Saida */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-shrink-0 w-full md:w-auto">
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Entrada (Check-in)</p>
                          <p className="text-xs font-bold text-gray-700">
                            {p.presence?.check_in_time ? new Date(p.presence.check_in_time).toLocaleTimeString('pt-BR') : '---'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Saída (Check-out)</p>
                          <p className="text-xs font-bold text-gray-700">
                            {p.presence?.check_out_time ? new Date(p.presence.check_out_time).toLocaleTimeString('pt-BR') : '---'}
                          </p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Frequência</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-gray-900">{p.presence?.calculated_percentage || 0}%</span>
                            <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${
                              p.presence?.status === 'APPROVED' 
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                : p.presence?.status === 'INCOMPLETE' 
                                  ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                  : 'bg-gray-100 text-gray-500'
                            }`}>
                              {p.presence?.status || 'Aguardando'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botoes overrides */}
                      <div className="flex gap-2 w-full md:w-auto">
                        {!p.presence?.check_in_time ? (
                          <button 
                            onClick={() => handleManualAction(p.registration_id, 'check_in')}
                            className="flex-1 md:flex-initial px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            Entrada Manual
                          </button>
                        ) : !p.presence?.check_out_time ? (
                          <button 
                            onClick={() => handleManualAction(p.registration_id, 'check_out')}
                            className="flex-1 md:flex-initial px-4 py-2.5 bg-gov-blue hover:bg-gov-blue-dark text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                          >
                            Concluir (100%)
                          </button>
                        ) : null}

                        {p.presence?.id && (
                          <button 
                            onClick={() => handleResetPresence(p.registration_id)}
                            title="Resetar freqüência (auditoria e dados)"
                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all border border-red-100 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Evento */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gov-blue-dark/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gov-blue uppercase tracking-widest mb-1">Novo Protocolo</p>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Registrar Atividade</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-8 h-8 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Título Institucional</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: II Fórum de Mobilidade"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Categoria Oficial</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: Gestão Pública"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Setor / Órgão Ofertante</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: Secretaria de Esportes"
                    value={newEvent.org_name}
                    onChange={(e) => setNewEvent({...newEvent, org_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Órgão Responsável Administrativo</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: Gabinete do Prefeito"
                    value={newEvent.org_responsible}
                    onChange={(e) => setNewEvent({...newEvent, org_responsible: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Gestor Responsável</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: Dr. Carlos Silva"
                    value={newEvent.gestor_responsavel}
                    onChange={(e) => setNewEvent({...newEvent, gestor_responsavel: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Data e Horário</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    value={newEvent.date_start}
                    onChange={(e) => setNewEvent({...newEvent, date_start: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Carga (Horas)</label>
                  <input 
                    type="number" 
                    required
                    min={1}
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: 4"
                    value={newEvent.workload}
                    onChange={(e) => setNewEvent({...newEvent, workload: parseInt(e.target.value) || 4})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Vagas Ofertadas</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    value={newEvent.total_slots}
                    onChange={(e) => setNewEvent({...newEvent, total_slots: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Localização Oficial</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: Cine Teatro Henfil"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Descrição do Evento</label>
                <textarea 
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none min-h-[100px] resize-none"
                  placeholder="Descreva as diretrizes do evento..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-gov-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gov-blue-dark transition-all shadow-xl shadow-blue-100"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
