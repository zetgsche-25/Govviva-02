import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Event, User, Registration } from '../types';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Clock,
  FileText,
  X,
  RefreshCw,
  QrCode,
  Check,
  Trash2,
  Download,
  FileSpreadsheet,
  Award,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

export const OrganizerModule: React.FC = () => {
  // Eventos e Sincronização
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  
  // Pesquisa e Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, PRESENT, ABSENT, CERTIFIED
  
  // Controle de QR Code / Input de Busca de Ticket
  const [ticketInput, setTicketInput] = useState('');
  const [scanResult, setScanResult] = useState<{ status: 'CHECKIN' | 'CHECKOUT' | 'ERROR'; message: string; name?: string } | null>(null);

  // Estados dos Botões e Transações
  const [emittingCertId, setEmittingCertId] = useState<number | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carregar lista de eventos inicial
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/events');
      setEvents(data);
    } catch (err: any) {
      console.error('Erro ao carregar eventos:', err);
      showActionMessage('error', 'Falha ao carregar catálogo de eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Carrega os participantes de um evento específico
  const fetchParticipants = useCallback(async (eventId: number) => {
    try {
      setLoadingParticipants(true);
      const res = await api.get(`/presence/event/${eventId}`);
      setParticipants(res.participants || []);
    } catch (err: any) {
      console.error('Erro ao carregar participantes:', err);
      showActionMessage('error', 'Erro ao carregar folha de participantes.');
    } finally {
      setLoadingParticipants(false);
    }
  }, []);

  // Monitora a troca de evento
  useEffect(() => {
    if (selectedEvent) {
      fetchParticipants(selectedEvent.id);
      setScanResult(null);
    } else {
      setParticipants([]);
    }
  }, [selectedEvent, fetchParticipants]);

  // Mostrar mensagem de aviso temporária
  const showActionMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // Processamento do Check-in/Check-out por Código
  const handleProcessTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim() || !selectedEvent) return;

    try {
      const trimmed = ticketInput.trim();
      const res = await api.post('/presence/scan', { ticket_code: trimmed });
      
      const actionType = res.action_type || 'CHECKIN';
      setScanResult({
        status: actionType as 'CHECKIN' | 'CHECKOUT',
        message: res.message,
        name: res.participant_name
      });
      setTicketInput('');
      fetchParticipants(selectedEvent.id);
      showActionMessage('success', res.message);
    } catch (err: any) {
      setScanResult({
        status: 'ERROR',
        message: err.message || 'Código inválido ou erro no processamento.'
      });
      showActionMessage('error', err.message || 'Código de ticket incorreto.');
    }
  };

  // Botões de Entrada / Saída Manual
  const handleManualAction = async (registrationId: number, action: 'check_in' | 'check_out') => {
    if (!selectedEvent) return;
    try {
      const res = await api.post('/presence/manual', { registration_id: registrationId, action });
      showActionMessage('success', res.message || 'Ação de presença registrada manualmente!');
      fetchParticipants(selectedEvent.id);
    } catch (err: any) {
      showActionMessage('error', err.message || 'Erro ao registrar presença manualmente.');
    }
  };

  // Resetar presença individual (Auditoria e Dados)
  const handleResetPresence = async (registrationId: number) => {
    if (!selectedEvent) return;
    if (!window.confirm('Atenção: Deseja realmente restaurar os dados de presença deste participante? Esta ação apagará os horários de check-in/out.')) return;
    try {
      const res = await api.post('/presence/reset', { registration_id: registrationId });
      showActionMessage('success', res.message || 'Dados de presença excluídos com sucesso.');
      fetchParticipants(selectedEvent.id);
    } catch (err: any) {
      showActionMessage('error', err.message || 'Erro ao redefinir presença.');
    }
  };

  // Emissão manual do Certificado
  const handleEmitCertificate = async (registrationId: number) => {
    if (!selectedEvent) return;
    setEmittingCertId(registrationId);
    try {
      const res = await api.post('/certificates/manual-emit', { registration_id: registrationId });
      showActionMessage('success', res.message || 'Certificado lavrado com sucesso no livro eletrônico oficial!');
      fetchParticipants(selectedEvent.id);
    } catch (err: any) {
      showActionMessage('error', err.message || 'Erro ao emitir certificado. Verifique a frequência do participante.');
    } finally {
      setEmittingCertId(null);
    }
  };

  // Reenvio do e-mail do certificado
  const handleResendEmail = async (certId: number) => {
    setResendingId(certId);
    try {
      const res = await api.post(`/certificates/${certId}/resend-email`);
      showActionMessage('success', res.message || 'E-mail enviado ao cidadão com sucesso!');
    } catch (err: any) {
      showActionMessage('error', err.message || 'Erro ao disparar envio do SMTP.');
    } finally {
      setResendingId(null);
    }
  };

  // Cálculos do Dashboard
  const totalInscritos = participants.length;
  
  const totalPresentes = participants.filter(p => 
    p.presence?.check_in_time !== null || p.presence?.check_out_time !== null
  ).length;

  const totalAusentes = participants.filter(p => 
    p.presence?.check_in_time === null && p.presence?.check_out_time === null
  ).length;

  // Busca certificados emitidos. Como vamos saber? 
  // O participante tem certificado emitido se p.presence?.status === 'APPROVED' ou se há logs de que já receberam certificados.
  // No nosso caso, podemos deduzir que se p.presence?.status === 'APPROVED', ou se o cidadão já possui um objeto certificado.
  // Vamos buscar e verificar quem tem certificado gerado na lista de participantes.
  // Nota: o endpoint `/presence/event/<id>` não retorna diretamente o cód de certificado mas podemos ver pelo status 'APPROVED' 
  // ou se ele já foi certificado. Para calcularmos de forma real:
  const totalCertificadosEmitidos = participants.filter(p => p.presence?.status === 'APPROVED').length;

  // Exportação Excel via xlsx
  const handleExportExcel = () => {
    if (!selectedEvent || participants.length === 0) return;

    const dataToExport = participants.map((p, index) => ({
      'Nº Inscrição': p.registration_id,
      'Nome do Cidadão': p.user?.name || '',
      'E-mail': p.user?.email || '',
      'CPF': p.user?.cpf || 'Não cadastrado',
      'Código do Ticket': p.ticket_code || '',
      'Data de Inscrição': p.registered_at ? new Date(p.registered_at).toLocaleDateString('pt-BR') : '',
      'Check-In (Entrada)': p.presence?.check_in_time ? new Date(p.presence.check_in_time).toLocaleString('pt-BR') : 'Sem registro',
      'Check-Out (Saída)': p.presence?.check_out_time ? new Date(p.presence.check_out_time).toLocaleString('pt-BR') : 'Sem registro',
      'Carga Horária (h)': p.presence?.calculated_duration || 0,
      'Frequência (%)': `${p.presence?.calculated_percentage || 0}%`,
      'Status': p.presence?.status === 'APPROVED' ? 'Aprovado (100%)' : p.presence?.status === 'INCOMPLETE' ? 'Incompleto' : 'Pendente/Ausente'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participantes');

    // Autoajustar largura das colunas
    const maxLens = Object.keys(dataToExport[0] || {}).map(key => 
      Math.max(key.length, ...dataToExport.map(row => String((row as any)[key] || '').length))
    );
    worksheet['!cols'] = maxLens.map(len => ({ wch: len + 3 }));

    XLSX.writeFile(workbook, `GOVVIVA_Participantes_Evento_${selectedEvent.id}.xlsx`);
    showActionMessage('success', 'Planilha Excel de conformidade baixada com sucesso.');
  };

  // Exportação PDF via jsPDF
  const handleExportPDF = () => {
    if (!selectedEvent || participants.length === 0) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Configurações Estéticas do Documento de Órgão Regulador
    const primaryColor = '#004B82'; // Azul GOVVIVA
    const grayText = '#4B5563';

    // Cabeçalho Institucional
    doc.setFillColor(0, 75, 130);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('GOVVIVA - PORTAL DO ORGANIZADOR', 15, 15);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RELATÓRIO DE PRESENÇA E CONFORMIDADE DE ATIVIDADE PÚBLICA', 15, 22);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')}`, 150, 15);

    // Corpo de Dados do Evento
    doc.setTextColor('#111827');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(`EVENTO: ${selectedEvent.title.toUpperCase()}`, 15, 48);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(grayText);
    doc.text(`Organizador Responsável: ${selectedEvent.org_responsible || selectedEvent.org_name || 'Governo Municipal'}`, 15, 54);
    doc.text(`Local Oficial: ${selectedEvent.location}`, 15, 59);
    doc.text(`Data do Evento: ${new Date(selectedEvent.date_start).toLocaleDateString('pt-BR')}`, 15, 64);
    doc.text(`Carga Horária Exigida: ${selectedEvent.workload || 4} horas aula`, 150, 54);

    // Divisores de Seção
    doc.setDrawColor('#E5E7EB');
    doc.line(15, 70, 195, 70);

    // Dados Estatísticos do Evento
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(primaryColor);
    doc.text('ESTATÍSTICAS DA GESTÃO DE PRESENÇA:', 15, 78);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor('#111827');
    doc.text(`Total Inscritos: ${totalInscritos}`, 15, 85);
    doc.text(`Total de Presentes: ${totalPresentes}`, 65, 85);
    doc.text(`Total de Ausentes: ${totalAusentes}`, 115, 85);
    doc.text(`Certificados Emitidos (Aprovados): ${totalCertificadosEmitidos}`, 15, 91);

    // Tabela de Alunos
    doc.line(15, 98, 195, 98);
    
    // Cabeçalho da tabela
    doc.setFillColor('#F3F4F6');
    doc.rect(15, 102, 180, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Cidadão inscrito', 17, 107.5);
    doc.text('Ticket', 85, 107.5);
    doc.text('Check-In', 110, 107.5);
    doc.text('Check-Out', 140, 107.5);
    doc.text('Presença %', 172, 107.5);

    let currentY = 115;
    doc.setFont('helvetica', 'normal');

    participants.slice(0, 20).forEach((p) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20; // resetar Y para nova página
      }

      const nameToPrint = p.user?.name || 'Cidadão';
      const truncatedName = nameToPrint.length > 32 ? nameToPrint.slice(0, 30) + '...' : nameToPrint;
      
      doc.setFont('helvetica', 'bold');
      doc.text(truncatedName, 17, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(grayText);
      doc.text(`CPF: ${p.user?.cpf || 'Não cadastrado'}`, 17, currentY + 4);

      doc.setFontSize(9);
      doc.setTextColor('#111827');
      doc.text(p.ticket_code || '---', 85, currentY + 2);
      
      const checkInLabel = p.presence?.check_in_time 
        ? new Date(p.presence.check_in_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
        : 'Ausente';
      doc.text(checkInLabel, 110, currentY + 2);

      const checkOutLabel = p.presence?.check_out_time 
        ? new Date(p.presence.check_out_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
        : 'Ausente';
      doc.text(checkOutLabel, 140, currentY + 2);

      const pct = p.presence?.calculated_percentage || 0;
      doc.text(`${pct}%`, 172, currentY + 2);

      // Linha de baixo
      doc.setDrawColor('#F3F4F6');
      doc.line(15, currentY + 6, 195, currentY + 6);
      currentY += 12;
    });

    if (participants.length > 20) {
      doc.setTextColor(grayText);
      doc.setFontSize(8);
      doc.text(`* Mostrando os primeiros 20 participantes de um total de ${participants.length}. Utilize a planilha para a relação completa.`, 15, currentY + 5);
    }

    doc.save(`Relatorio_Conformidade_GOVVIVA_Evento_${selectedEvent.id}.pdf`);
    showActionMessage('success', 'Relatório Oficial em formato PDF exportado com sucesso!');
  };

  // Filtragem da lista com base na barra de pesquisa e abas
  const filteredParticipants = participants.filter((p) => {
    // Busca por termo
    const term = searchTerm.toLowerCase();
    const matchSearch = 
      p.user?.name?.toLowerCase().includes(term) ||
      p.user?.cpf?.includes(term) ||
      p.ticket_code?.toLowerCase().includes(term);

    // Filtro por Aba
    if (!matchSearch) return false;
    if (statusFilter === 'ALL') return true;
    
    const hasCheckIn = p.presence?.check_in_time !== null;
    const hasCheckOut = p.presence?.check_out_time !== null;
    const isApproved = p.presence?.status === 'APPROVED';

    if (statusFilter === 'PRESENT') return hasCheckIn || hasCheckOut;
    if (statusFilter === 'ABSENT') return !hasCheckIn && !hasCheckOut;
    if (statusFilter === 'CERTIFIED') return isApproved;

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      
      {/* Alertas Temporários */}
      <AnimatePresence>
        {actionMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-6 z-[100] p-6 rounded-3xl shadow-2xl border-l-[6px] flex items-center gap-5  ${
              actionMessage.type === 'success' ? 'bg-white border-emerald-500 text-emerald-900' : 'bg-white border-red-500 text-red-900'
            }`}
          >
            <div className={`p-2.5 rounded-full shadow-sm ${actionMessage.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {actionMessage.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-black text-[10px] uppercase tracking-[0.2em] mb-0.5 opacity-60">Organizador GOVVIVA</p>
              <p className="font-bold text-base tracking-tight">{actionMessage.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Superior */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gov-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-black text-gov-blue uppercase tracking-[0.3em]">Cultura e Capacitação Oficial</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-none">
              Organizador <span className="text-gov-blue">GOVVIVA</span>
            </h1>
            <p className="text-gray-400 font-medium mt-1 text-sm">
              Gestão de eventos municipais, presença eletrônica, chamadas e certificados homologados.
            </p>
          </div>
          
          {selectedEvent && (
            <button 
              onClick={() => setSelectedEvent(null)}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Mudar de Atividade
            </button>
          )}
        </div>

        {/* FLUXO 1: Nenhum evento selecionado - Mostrar Lista de Atividades */}
        {!selectedEvent ? (
          <div>
            <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gov-blue" />
              Selecione uma Atividade para Gerenciar
            </h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[32px] border border-gray-100">
                <RefreshCw className="w-8 h-8 text-gov-blue animate-spin" />
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Sincronizando Atividades do Município...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="bg-white p-12 rounded-[32px] border border-gray-100 text-center">
                <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-sm font-bold">Nenhum evento localizado no calendário oficial de Maricá.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((e) => (
                  <div 
                    key={e.id}
                    onClick={() => setSelectedEvent(e)}
                    className="bg-white rounded-[28px] border border-gray-150 p-6 hover:border-gov-blue/40 shadow-sm transition-all cursor-pointer hover:shadow-md block group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-[100px] -z-10 group-hover:bg-blue-100/50 transition-colors"></div>
                    
                    <span className="inline-block px-3 py-1 bg-gov-blue-light text-gov-blue text-[9px] font-black uppercase tracking-widest rounded-lg border border-blue-50 mb-4">
                      {e.category}
                    </span>

                    <h3 className="text-lg font-black text-gray-900 group-hover:text-gov-blue transition-colors uppercase tracking-tight line-clamp-2 leading-snug mb-4">
                      {e.title}
                    </h3>

                    <div className="space-y-2 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mb-6 pl-0.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(e.date_start).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>Carga: {e.workload || 4}h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>Inscritos: {e.total_slots - e.available_slots} / {e.total_slots}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-gov-blue text-[9px] font-black uppercase tracking-widest">
                      <span>Gerenciar Presença</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          
          /* FLUXO 2: Evento Selecionado - Painel Completo do Organizador */
          <div>
            
            {/* Resumo do Evento no Topo */}
            <div className="bg-gov-blue text-white p-8 rounded-[32px] shadow-lg mb-8 relative overflow-hidden">
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/15 px-3 py-1 rounded-md border border-white/10">
                    ATIVIDADE SELECIONADA: {selectedEvent.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter mt-3 mb-2">{selectedEvent.title}</h2>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-blue-100 uppercase tracking-wider pl-0.5">
                    <span>Local: {selectedEvent.location}</span>
                    <span>•</span>
                    <span>Data: {new Date(selectedEvent.date_start).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <span>•</span>
                    <span>Carga: {selectedEvent.workload || 4}h</span>
                  </div>
                </div>
                
                {/* Botão de Conclusão do Evento se não fechou */}
                <div className="flex flex-wrap gap-4 items-center">
                  {selectedEvent.status === 'CONCLUDED' ? (
                    <span className="px-5 py-3 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 border border-emerald-500 shadow-md">
                      <CheckCircle className="w-4 h-4" />
                      Status: Concluído
                    </span>
                  ) : (
                    <span className="px-5 py-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-1.5 border border-amber-400 shadow-md">
                      <Clock className="w-4 h-4" />
                      Status: Em Chamada
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* DASHBOARD: Estatísticas Rápidas do Evento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              
              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Inscritos</p>
                  <p className="text-3xl font-black text-gray-900 mt-2">{totalInscritos}</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-gov-blue font-black text-[9px] uppercase tracking-widest">
                  <Users className="w-3.5 h-3.5" /> Programação de Inscrições
                </div>
              </div>

              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cidadãos Presentes</p>
                  <p className="text-3xl font-black text-emerald-600 mt-2">{totalPresentes}</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase tracking-widest">
                  <CheckCircle className="w-3.5 h-3.5" /> Ao menos 1 registro
                </div>
              </div>

              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cidadãos Ausentes</p>
                  <p className="text-3xl font-black text-red-500 mt-2">{totalAusentes}</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-red-500 font-black text-[9px] uppercase tracking-widest">
                  <AlertCircle className="w-3.5 h-3.5" /> Inscritos sem check-in
                </div>
              </div>

              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Aptos / Certificados</p>
                  <p className="text-3xl font-black text-gov-blue mt-2">{totalCertificadosEmitidos}</p>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-gov-blue font-black text-[9px] uppercase tracking-widest">
                  <Award className="w-3.5 h-3.5" /> Frequência 100% Homologada
                </div>
              </div>

            </div>

            {/* SEÇÃO DE CHASSIS / LEITOR DE QR-CODE EXPRESSO */}
            <div className="mb-8 bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 flex flex-col lg:flex-row gap-6 items-stretch">
              <div className="flex-grow">
                <form onSubmit={handleProcessTicket}>
                  <label className="block text-[10px] font-black text-gov-blue uppercase tracking-widest mb-3 pl-1">
                    Check-in / Check-out Expresso (Simulação Integrada de Crachás)
                  </label>
                  <div className="relative">
                    <QrCode className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gov-blue" />
                    <input 
                      type="text" 
                      placeholder="Bipe ou digite o TICKET do cidadão para registrar entrada/saída oficial..."
                      className="w-full pl-14 pr-32 py-4 bg-white border border-gray-200.5 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                      value={ticketInput}
                      onChange={(e) => setTicketInput(e.target.value)}
                    />
                    <button 
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      Bipar QR
                    </button>
                  </div>
                </form>
              </div>

              {/* Resultado da leitura espressa */}
              <div className="w-full lg:w-80 flex flex-col justify-center">
                {scanResult && (
                  <div className={`p-4 border rounded-2xl flex items-start gap-2.5 animate-fade-in ${
                    scanResult.status === 'CHECKIN' 
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-950' 
                      : scanResult.status === 'CHECKOUT' 
                        ? 'bg-blue-50 border-blue-100 text-blue-950' 
                        : 'bg-red-50 border-red-100 text-red-950'
                  }`}>
                    {scanResult.status === 'ERROR' ? (
                      <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Check className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p className="text-[10px] font-black uppercase">
                        {scanResult.status === 'CHECKIN' 
                          ? 'Entrada Homologada' 
                          : scanResult.status === 'CHECKOUT' 
                            ? 'Saída Registrada (100%)' 
                            : 'Falha Sistema'}
                      </p>
                      <p className="text-[11px] font-bold opacity-80 mt-1 leading-tight">
                        {scanResult.message} {scanResult.name && `- ${scanResult.name}`}
                      </p>
                    </div>
                  </div>
                )}

                {!scanResult && (
                  <div className="p-4 border border-gray-150 border-dashed rounded-2xl flex items-center justify-center text-center text-[10px] font-bold text-gray-400 h-full">
                    Crachá biometria/parada pronto para bipe.
                  </div>
                )}
              </div>
            </div>

            {/* CONTROLES DE FILTRO E EXPORTAÇÃO */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Abas de visualização */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {[
                  { id: 'ALL', label: 'Todos inscritos' },
                  { id: 'PRESENT', label: 'Presentes' },
                  { id: 'ABSENT', label: 'Ausentes' },
                  { id: 'CERTIFIED', label: 'Certificados' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      statusFilter === tab.id 
                        ? 'bg-gov-blue text-white border-gov-blue' 
                        : 'bg-white text-gray-500 hover:text-gray-700 border-gray-150'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Botões de Ação de Exportação */}
              <div className="flex gap-3 w-full md:w-auto justify-end">
                <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-emerald-700 border border-emerald-100 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-red-600 border border-red-100 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  PDF Oficial
                </button>
              </div>

            </div>

            {/* BARRA DE PESQUISA INTERNA DE PARTICIPANTES */}
            <div className="bg-white p-4 rounded-2xl border border-gray-150 mb-6 flex items-center">
              <Search className="w-5 h-5 text-gray-400 ml-2 mr-3" />
              <input 
                type="text" 
                placeholder="Filtrar por nome, CPF ou ticket do cidadão..."
                className="w-full bg-transparent border-none text-xs font-bold outline-none text-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* TABELA DE GESTÃO DE PARTICIPANTES */}
            <div className="bg-white rounded-[32px] border border-gray-150 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Participante</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Entrada/Saída</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Frequência</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Certificação</th>
                      <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Controles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loadingParticipants ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={6} className="px-8 py-8 h-16 bg-gray-50/20"></td>
                        </tr>
                      ))
                    ) : filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                          Nenhum cidadão localizado para os parâmetros filtrados.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map((p) => {
                        const hasCheckIn = p.presence?.check_in_time !== null;
                        const hasCheckOut = p.presence?.check_out_time !== null;
                        const isApproved = p.presence?.status === 'APPROVED';

                        return (
                          <tr key={p.registration_id} className="hover:bg-gray-50/10 transition-colors">
                            
                            {/* Nome e Dados Pessoais */}
                            <td className="px-8 py-4">
                              <div>
                                <p className="font-bold text-gray-950 text-sm">{p.user?.name || 'Inscrito'}</p>
                                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mt-0.5">
                                  CPF: {p.user?.cpf || 'Não cadastrado'}
                                </p>
                              </div>
                            </td>

                            {/* Ticket Único */}
                            <td className="px-8 py-4">
                              <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md select-all">
                                {p.ticket_code || '---'}
                              </span>
                            </td>

                            {/* Horários de Registro */}
                            <td className="px-8 py-4">
                              <div className="space-y-1">
                                <p className="text-[10px] text-gray-500">
                                  <strong className="text-[9px] uppercase tracking-wider text-gray-400">Entrada: </strong>
                                  {p.presence?.check_in_time ? new Date(p.presence.check_in_time).toLocaleTimeString('pt-BR') : '---'}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  <strong className="text-[9px] uppercase tracking-wider text-gray-400">Saída: </strong>
                                  {p.presence?.check_out_time ? new Date(p.presence.check_out_time).toLocaleTimeString('pt-BR') : '---'}
                                </p>
                              </div>
                            </td>

                            {/* Carga e Porcentagem */}
                            <td className="px-8 py-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-sans font-bold text-xs text-gray-900">{p.presence?.calculated_percentage || 0}%</span>
                                  <span className={`px-1.5 py-0.5 text-[8px] font-black uppercase rounded ${
                                    isApproved 
                                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                                      : p.presence?.status === 'INCOMPLETE'
                                        ? 'bg-amber-50 text-amber-600 border border-amber-100'
                                        : 'bg-gray-100 text-gray-400'
                                  }`}>
                                    {isApproved ? 'Aprovado' : p.presence?.status === 'INCOMPLETE' ? 'Incompleto' : 'Ausente'}
                                  </span>
                                </div>
                                <p className="text-[9px] text-gray-400 mt-0.5">
                                  Tempo: {p.presence?.calculated_duration || 0}h computadas
                                </p>
                              </div>
                            </td>

                            {/* Homologação / Certificado emitido */}
                            <td className="px-8 py-4">
                              {isApproved ? (
                                <div className="flex flex-col gap-1">
                                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black bg-blue-50 text-gov-blue px-2 py-0.5 rounded-md self-start border border-blue-100 uppercase tracking-widest">
                                    <Award className="w-3 h-3" /> Certificado Pronto
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center text-[9px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md uppercase tracking-widest select-none">
                                  Não Elegível
                                </span>
                              )}
                            </td>

                            {/* Controles manuais administráveis */}
                            <td className="px-8 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 shrink-0">
                                
                                {/* Entrada manual */}
                                {!hasCheckIn && (
                                  <button 
                                    onClick={() => handleManualAction(p.registration_id, 'check_in')}
                                    className="px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  >
                                    Check-In
                                  </button>
                                )}

                                {/* Saída manual */}
                                {hasCheckIn && !hasCheckOut && (
                                  <button 
                                    onClick={() => handleManualAction(p.registration_id, 'check_out')}
                                    className="px-3 py-1.5 bg-gov-blue hover:bg-gov-blue-dark text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all"
                                  >
                                    Check-Out (100%)
                                  </button>
                                )}

                                {/* Emitir Certificado manual */}
                                {isApproved && (
                                  <button 
                                    onClick={() => handleEmitCertificate(p.registration_id)}
                                    disabled={emittingCertId === p.registration_id}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
                                  >
                                    {emittingCertId === p.registration_id ? 'Gravando...' : 'Homologar'}
                                  </button>
                                )}

                                {/* Excluir tempos de frequência */}
                                {p.presence?.id && (
                                  <button 
                                    onClick={() => handleResetPresence(p.registration_id)}
                                    title="Zerar dados de chamada"
                                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg border border-red-100 transition-all ml-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                              </div>
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
