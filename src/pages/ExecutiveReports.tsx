import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  FileText, 
  Download, 
  Users, 
  Calendar, 
  CheckCircle, 
  Award, 
  TrendingUp, 
  Filter, 
  Search, 
  Building2, 
  Tag, 
  Grid, 
  RefreshCw,
  Clock,
  MapPin,
  ChevronRight,
  TrendingDown,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { MultiSecretariasDashboard } from '../components/MultiSecretariasDashboard';

// Cores Oficiais da Identidade GOVVIVA
const COLORS = ['#004B82', '#0070C0', '#1F5F8B', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

interface ReportSummary {
  total_citizens: number;
  total_admins: number;
  total_events: number;
  total_registrations: number;
  total_presence: number;
  total_certificates: number;
}

interface DistributionItem {
  name: string;
  value: number;
}

interface EventDetail {
  id: number;
  title: string;
  category: string;
  org_name: string;
  date_start: string;
  location: string;
  status: string;
  workload: number;
  org_responsible?: string;
  gestor_responsavel?: string;
  total_registrations: number;
  total_presence: number;
  total_certificates: number;
}

export const ExecutiveReports: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  
  // Dados do backend
  const [summary, setSummary] = useState<ReportSummary>({
    total_citizens: 0,
    total_admins: 0,
    total_events: 0,
    total_registrations: 0,
    total_presence: 0,
    total_certificates: 0
  });
  const [byCategory, setByCategory] = useState<DistributionItem[]>([]);
  const [bySecretaria, setBySecretaria] = useState<DistributionItem[]>([]);
  const [byBairro, setByBairro] = useState<DistributionItem[]>([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([]);
  const [rankingEvents, setRankingEvents] = useState<any[]>([]);
  const [eventsDetails, setEventsDetails] = useState<EventDetail[]>([]);

  // Filtros de Frontend
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSecretaria, setSelectedSecretaria] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Módulo Multi-Secretarias
  const [reportsTab, setReportsTab] = useState<'kpi_geral' | 'multi_secretarias'>('kpi_geral');
  const [selectedSecretariatTab, setSelectedSecretariatTab] = useState<string>('Secretaria de Ciência e Tecnologia');

  // Agrupado de dados de cada secretaria de forma consolidada e computada em tempo real
  const secretariatMetrics = useMemo(() => {
    const defaultSecs = [
      'Secretaria de Ciência e Tecnologia',
      'Secretaria Municipal de Educação',
      'Secretaria Municipal de Saúde',
      'Secretaria Municipal de Governo',
      'Secretaria Municipal de Turismo',
      'Secretaria Municipal de Inovação e Tecnologia'
    ];

    const secretariatsUnion = Array.from(new Set([
      ...defaultSecs,
      ...eventsDetails.map(e => e.org_name).filter(Boolean)
    ]));

    return secretariatsUnion.map(secName => {
      const secEvents = eventsDetails.filter(e => e.org_name === secName);
      
      let events_count = secEvents.length;
      let total_slots_offered = secEvents.reduce((acc, curr) => acc + curr.total_slots, 0);
      let total_registrations = secEvents.reduce((acc, curr) => acc + curr.total_registrations, 0);
      let total_presence = secEvents.reduce((acc, curr) => acc + curr.total_presence, 0);
      let total_certificates = secEvents.reduce((acc, curr) => acc + curr.total_certificates, 0);
      
      const gestores = Array.from(new Set(secEvents.map(e => e.gestor_responsavel).filter(Boolean)));
      const categories = Array.from(new Set(secEvents.map(e => e.category).filter(Boolean)));

      const presenceRate = total_registrations > 0 ? Math.round((total_presence / total_registrations) * 100) : 0;
      const certRate = total_registrations > 0 ? Math.round((total_certificates / total_registrations) * 100) : 0;

      return {
        name: secName,
        events_count,
        total_slots_offered,
        total_registrations,
        total_presence,
        total_certificates,
        presenceRate,
        certRate,
        gestores: gestores.length > 0 ? gestores : ['Gestor Geral'],
        categories: categories.length > 0 ? categories : ['Geral']
      };
    });
  }, [eventsDetails]);

  // Carregar dados
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/reports/executive');
      if (res.success) {
        setSummary(res.summary);
        setByCategory(res.by_category || []);
        setBySecretaria(res.by_secretaria || []);
        setByBairro(res.by_bairro || []);
        setMonthlyGrowth(res.monthly_growth || []);
        setRankingEvents(res.ranking_events || []);
        setEventsDetails(res.events_details || []);
      } else {
        throw new Error('Falha ao processar dados de relatórios.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Não foi possível carregar as informações do servidor corporativo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Obter listas únicas para os filtros de select
  const uniqueCategories = useMemo(() => {
    const list = eventsDetails.map(e => e.category).filter(Boolean);
    return Array.from(new Set(list));
  }, [eventsDetails]);

  const uniqueSecretarias = useMemo(() => {
    const list = eventsDetails.map(e => e.org_name).filter(Boolean);
    return Array.from(new Set(list));
  }, [eventsDetails]);

  // Filtrar dados da tabela de atividades
  const filteredEvents = useMemo(() => {
    return eventsDetails.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase()) || 
                            (event.location && event.location.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesSecretaria = selectedSecretaria === 'all' || event.org_name === selectedSecretaria;
      const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesSecretaria && matchesStatus;
    });
  }, [eventsDetails, search, selectedCategory, selectedSecretaria, selectedStatus]);

  // KPIs dinâmicos baseados no filtro de eventos atual
  const filteredKPIs = useMemo(() => {
    let totalInscricoes = 0;
    let totalPresencas = 0;
    let totalCertificados = 0;

    filteredEvents.forEach(e => {
      totalInscricoes += e.total_registrations;
      totalPresencas += e.total_presence;
      totalCertificados += e.total_certificates;
    });

    const presenceRate = totalInscricoes > 0 ? (totalPresencas / totalInscricoes) * 100 : 0;
    const certRate = totalInscricoes > 0 ? (totalCertificados / totalInscricoes) * 100 : 0;

    return {
      totalInscricoes,
      totalPresencas,
      totalCertificados,
      presenceRate: Math.round(presenceRate * 10) / 10,
      certRate: Math.round(certRate * 10) / 10
    };
  }, [filteredEvents]);

  // Toast de Sucesso
  const triggerToast = (msg: string) => {
    setCopiedMessage(msg);
    setTimeout(() => setCopiedMessage(null), 3500);
  };

  // Exportar Excel Completo
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Aba 1: Resumo Executivo
      const summaryData = [
        { 'Métrica Executiva': 'Cidadãos Gerais Cadastrados', 'Total / Quantidade': summary.total_citizens, 'Unidade': 'Cidadãos' },
        { 'Métrica Executiva': 'Administradores do Sistema', 'Total / Quantidade': summary.total_admins, 'Unidade': 'Gestores' },
        { 'Métrica Executiva': 'Total de Atividades Cadastradas', 'Total / Quantidade': summary.total_events, 'Unidade': 'Atividades' },
        { 'Métrica Executiva': 'Total de Inscrições Confirmadas', 'Total / Quantidade': summary.total_registrations, 'Unidade': 'Inscrições' },
        { 'Métrica Executiva': 'Total de Chamadas/Presenças', 'Total / Quantidade': summary.total_presence, 'Unidade': 'Presenças' },
        { 'Métrica Executiva': 'Total de Certificados Emitidos', 'Total / Quantidade': summary.total_certificates, 'Unidade': 'Certificados' },
      ];
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo Geral');

      // Aba 2: Participação por Categoria
      const wsCat = XLSX.utils.json_to_sheet(
        byCategory.map(c => ({ 'Categoria': c.name, 'Inscrições Confirmadas': c.value }))
      );
      XLSX.utils.book_append_sheet(wb, wsCat, 'Por Categoria');

      // Aba 3: Participação por Secretaria
      const wsSec = XLSX.utils.json_to_sheet(
        bySecretaria.map(s => ({ 'Secretaria Municipal': s.name, 'Parceiros Inscritos': s.value }))
      );
      XLSX.utils.book_append_sheet(wb, wsSec, 'Por Secretaria');

      // Aba 4: Detalhes das Atividades
      const wsDetail = XLSX.utils.json_to_sheet(
        eventsDetails.map(e => ({
          'Título da Atividade': e.title,
          'Categoria': e.category,
          'Secretaria Organizadora': e.org_name,
          'Local do Evento': e.location,
          'Data de Início': new Date(e.date_start).toLocaleDateString('pt-BR'),
          'Carga Horária (h)': e.workload,
          'Status Atual': e.status === 'CONCLUDED' ? 'Concluído' : e.status === 'ACTIVE' ? 'Ativo' : 'Cancelado',
          'Alunos Inscritos': e.total_registrations,
          'Presenças Registradas': e.total_presence,
          'Certificados Emitidos': e.total_certificates
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Dados de Eventos');

      // Aba 5: Participação por Bairro (Maricá)
      const wsBairro = XLSX.utils.json_to_sheet(
        byBairro.map(b => ({ 'Bairro de Residência (Maricá)': b.name, 'Usuários Inscritos': b.value }))
      );
      XLSX.utils.book_append_sheet(wb, wsBairro, 'Por Bairro');

      // Aba 6: Crescimento Histórico Mensal
      const wsGrowth = XLSX.utils.json_to_sheet(
        monthlyGrowth.map(g => ({ 'Mês': g.month, 'Novas Inscrições no Mês': g.registrations, 'Inscrições Acumuladas': g.cumulative }))
      );
      XLSX.utils.book_append_sheet(wb, wsGrowth, 'Crescimento Mensal');

      XLSX.writeFile(wb, 'GOVVIVA_Relatorio_Executivo_Capacitacoes.xlsx');
      triggerToast('Planilha executiva de alta precisão exportada com sucesso.');
    } catch (err) {
      console.error(err);
      triggerToast('Erro ao compilar arquivo do Excel.');
    }
  };

  // Exportar PDF Completo Formatado
  const exportToPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const darkBlue = '#004B82';
      const gray = '#4B5563';

      // Página 1: Capa Oficial Timbrada
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, 'F');

      // Faixa Decorativa Azul Maricá
      doc.setFillColor(0, 75, 130);
      doc.rect(0, 0, 210, 35, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('GOVVIVA - PORTAL DE CAPACITAÇÃO MUNICIPAL', 20, 22);

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(22);
      doc.text('RELATÓRIO EXECUTIVO ANUAL', 20, 70);
      doc.setFontSize(14);
      doc.text('Indicadores de Engajamento, Presença e Qualificação de Cidadãos', 20, 80);

      doc.setDrawColor(229, 231, 235);
      doc.line(20, 88, 190, 88);

      // Metadados Gerais
      doc.setFontSize(10);
      doc.setTextColor(gray);
      doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 20, 100);
      doc.text('Destinatário: Secretaria Municipal de Governo e Gabinete do Prefeito', 20, 106);
      doc.text('Status dos Dados: Extraído em Tempo Real', 20, 112);

      // Bloco de KPIs na Capa
      doc.setFillColor(255, 255, 255);
      doc.rect(20, 130, 170, 100, 'F');
      doc.setDrawColor(209, 213, 219);
      doc.rect(20, 130, 170, 100, 'D');

      doc.setTextColor(darkBlue);
      doc.setFontSize(12);
      doc.text('SUMÁRIO EXECUTIVO DE INDICADORES:', 30, 142);

      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const metricsRows = [
        `• Cidadãos Cadastrados na Base: ${summary.total_citizens.toLocaleString('pt-BR')}`,
        `• Atividades e Conferências Criadas: ${summary.total_events}`,
        `• Inscrições Efetuadas com Sucesso: ${summary.total_registrations.toLocaleString('pt-BR')}`,
        `• Diários / Chamadas de Presença Realizadas: ${summary.total_presence.toLocaleString('pt-BR')}`,
        `• Diplomas de Conclusão / Certificados Emitidos: ${summary.total_certificates.toLocaleString('pt-BR')}`
      ];

      let curY = 155;
      metricsRows.forEach(row => {
        doc.text(row, 30, curY);
        curY += 10;
      });

      // Assinatura e Rodapé da capa
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(darkBlue);
      doc.text('PROCESSO DE AUDITORIA INTERNA - HOMOLOGADO', 20, 260);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(gray);
      doc.text('Prefeitura Municipal de Maricá - Modernização do Atendimento e Educação Coletiva', 20, 266);

      // Página 2: Distribuições e Detalhes
      doc.addPage();
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, 'F');

      // Topo minimalista
      doc.setFillColor(0, 75, 130);
      doc.rect(0, 0, 210, 15, 'F');

      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('DISTRIBUIÇÃO DE PARTICIPANTES POR CATEGORIA:', 15, 30);

      let catY = 40;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      byCategory.forEach(cat => {
        doc.text(`   •  ${cat.name}: ${cat.value} inscrições`, 15, catY);
        catY += 7;
      });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('ENGAJAMENTO DE CIDADÃOS POR SECRETARIA ORGANIZADORA:', 15, catY + 8);
      
      let secY = catY + 18;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      bySecretaria.forEach(sec => {
        doc.text(`   •  ${sec.name}: ${sec.value} inscritos`, 15, secY);
        secY += 7;
      });

      // 1. Participação por Bairro
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 75, 130);
      doc.text('RELAÇÃO DE INSCRITOS POR BAIRRO DE RESIDÊNCIA (MARICÁ):', 15, secY + 10);
      
      let bairroY = secY + 20;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      byBairro.slice(0, 8).forEach(b => {
        doc.text(`   •  ${b.name}: ${b.value} cidadãos`, 15, bairroY);
        bairroY += 7;
      });

      // 2. Crescimento Mensal e Top Ranking
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 75, 130);
      doc.text('RECRUTAMENTO MENSAL E HISTÓRICO DE CRESCIMENTO:', 15, bairroY + 8);
      
      let growthY = bairroY + 18;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(31, 41, 55);
      monthlyGrowth.slice(-6).forEach(g => {
        doc.text(`   •  Mês ${g.month}: ${g.registrations} novas (+${g.cumulative} acumulado)`, 15, growthY);
        growthY += 7;
      });

      // Página 3: Tabela Detalhada de Atividades
      doc.addPage();
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, 'F');

      // Topo minimalista
      doc.setFillColor(0, 75, 130);
      doc.rect(0, 0, 210, 15, 'F');

      doc.setTextColor(31, 41, 55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('QUALIFICAÇÃO INDIVIDUAL DE ATIVIDADES PROGRAMADAS', 15, 30);

      let tableY = 42;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(229, 231, 235);
      doc.rect(15, tableY - 4, 180, 6, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text('Atividade', 17, tableY);
      doc.text('Secretaria', 80, tableY);
      doc.text('Inscritos', 135, tableY);
      doc.text('Presentes', 155, tableY);
      doc.text('Certificados', 175, tableY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(gray);
      tableY += 6.5;

      eventsDetails.forEach(e => {
        if (tableY > 275) {
          doc.addPage();
          doc.setFillColor(248, 250, 252);
          doc.rect(0, 0, 210, 297, 'F');
          doc.setFillColor(0, 75, 130);
          doc.rect(0, 0, 210, 15, 'F');
          
          tableY = 30;
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setFillColor(229, 231, 235);
          doc.rect(15, tableY - 4, 180, 6, 'F');
          doc.setTextColor(0, 0, 0);
          doc.text('Atividade', 17, tableY);
          doc.text('Secretaria', 80, tableY);
          doc.text('Inscritos', 135, tableY);
          doc.text('Presentes', 155, tableY);
          doc.text('Certificados', 175, tableY);
          
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(gray);
          tableY += 6.5;
        }

        doc.text(e.title.length > 35 ? e.title.substring(0, 32) + '...' : e.title, 17, tableY);
        doc.text(e.org_name.length > 25 ? e.org_name.substring(0, 22) + '...' : e.org_name, 80, tableY);
        doc.text(e.total_registrations.toString(), 135, tableY);
        doc.text(e.total_presence.toString(), 155, tableY);
        doc.text(e.total_certificates.toString(), 175, tableY);
        tableY += 6.5;
      });

      doc.save('GOVVIVA_Relatorio_Executivo_Capacitacoes.pdf');
      triggerToast('Relatório executivo timbrado em PDF baixado com sucesso!');
    } catch (err) {
      console.error(err);
      triggerToast('Erro ao processar as páginas do PDF.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
        <RefreshCw className="w-10 h-10 text-gov-blue animate-spin mb-4" />
        <h3 className="text-sm font-black uppercase text-gray-800 tracking-widest">Carregando painel de relatórios...</h3>
        <p className="text-xs text-gray-400 mt-1">Consolidação em tempo real dos bancos de dados municipais.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="p-8 bg-red-50 border-l-[6px] border-red-500 rounded-3xl text-left shadow-md">
          <h3 className="text-lg font-black text-red-950 uppercase mb-2">Erro de Processamento</h3>
          <p className="text-sm text-red-900 leading-relaxed font-semibold">{error}</p>
          <button 
            onClick={fetchData} 
            className="mt-6 flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white font-black uppercase text-[10px] tracking-widest px-5 py-3.5 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-8">
      
      {/* Toast flutuante de sucesso */}
      <AnimatePresence>
        {copiedMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-[100] bg-white border-l-[6px] border-gov-blue text-gray-900 p-6 rounded-3xl shadow-2xl flex items-center gap-4 max-w-sm"
          >
            <div className="p-2 bg-blue-50 text-gov-blue rounded-full">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800 leading-snug">{copiedMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho do Módulo */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gov-blue/5 rounded-bl-[120px] -z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-gov-blue" />
              <span className="text-[10px] font-black text-gov-blue uppercase tracking-[0.3em]">Painel de Indicadores de Gestão</span>
            </div>
            <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tighter leading-none">
              Relatórios <span className="text-gov-blue">Executivos</span> GOVVIVA
            </h1>
            <p className="text-gray-400 font-semibold mt-2 text-sm max-w-2xl">
              Consolidação de frequência de cidadãos, estatísticas de aceites, distribuição estruturada por secretaria e relatórios de conformidade.
            </p>
          </div>
          <div className="flex gap-2 relative z-10">
            <button 
              onClick={exportToPDF}
              className="flex items-center gap-2 bg-gov-blue hover:bg-gov-blue-dark text-white text-[10px] font-black uppercase tracking-widest px-5 py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              PDF Oficial
            </button>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-5 py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              Excel (XLSX)
            </button>
          </div>
        </div>

        {/* Agrupador de Abas de Relatórios */}
        <div className="flex gap-4 mb-8 bg-gray-150 p-1.5 rounded-2xl w-full max-w-lg shadow-inner">
          <button
            onClick={() => setReportsTab('kpi_geral')}
            className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              reportsTab === 'kpi_geral'
                ? 'bg-white text-gov-blue shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Geral e Atividades
          </button>
          <button
            onClick={() => setReportsTab('multi_secretarias')}
            className={`flex-1 py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
              reportsTab === 'multi_secretarias'
                ? 'bg-white text-gov-blue shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Módulo Multi-Secretarias
          </button>
        </div>

        {reportsTab === 'kpi_geral' ? (
          <>
            {/* Linha 1: KPIs Principais (Acumulado de Todo o Sistema) */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              
              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gov-blue" /> Cidadãos Base
                  </p>
                  <p className="text-3xl font-black text-gray-950 mt-3">{summary.total_citizens.toLocaleString('pt-BR')}</p>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1">Munícipes cadastrados</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gov-blue" /> Atividades
                  </p>
                  <p className="text-3xl font-black text-gray-950 mt-3">{summary.total_events}</p>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1">Conferências e fóruns</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-gov-blue" /> Inscrições
                  </p>
                  <p className="text-3xl font-black text-gray-950 mt-3">{summary.total_registrations.toLocaleString('pt-BR')}</p>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1">Inscrições confirmadas</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Presenças
                  </p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <p className="text-3xl font-black text-gray-950">{summary.total_presence.toLocaleString('pt-BR')}</p>
                    <span className="text-xs font-black text-emerald-600">
                      ({summary.total_registrations > 0 ? Math.round((summary.total_presence / summary.total_registrations) * 100) : 0}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1">Leituras de QR Code</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" /> Certificados
                  </p>
                  <div className="flex items-baseline gap-1 mt-3">
                    <p className="text-3xl font-black text-gray-950">{summary.total_certificates.toLocaleString('pt-BR')}</p>
                    <span className="text-xs font-black text-amber-600">
                      ({summary.total_registrations > 0 ? Math.round((summary.total_certificates / summary.total_registrations) * 100) : 0}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-semibold mt-1">Conclusões diplomadas</p>
                </div>
              </div>

            </div>

            {/* Filtros Ativos para Dados Filtrados e Gráficos */}
            <div className="bg-white p-6 rounded-[24px] border border-gray-150 shadow-sm mb-8 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center-stretch flex-grow max-w-5xl">
                {/* Busca livre */}
                <div className="relative min-w-[200px] flex-grow">
                  <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por título ou local..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:border-gov-blue hover:border-gray-300 transition-all"
                  />
                </div>

                {/* Categoria */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:border-gov-blue transition-all cursor-pointer"
                >
                  <option value="all">Todas as Categorias</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Secretaria */}
                <select
                  value={selectedSecretaria}
                  onChange={(e) => setSelectedSecretaria(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:border-gov-blue transition-all cursor-pointer"
                >
                  <option value="all">Todas as Secretarias</option>
                  {uniqueSecretarias.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>

                {/* Status */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl text-xs font-semibold focus:outline-none focus:border-gov-blue transition-all cursor-pointer"
                >
                  <option value="all">Todos os Status</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="CONCLUDED">Concluído</option>
                </select>
              </div>

              <button 
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                  setSelectedSecretaria('all');
                  setSelectedStatus('all');
                }}
                className="flex items-center gap-1.5 px-4 py-3 text-gray-500 hover:text-gov-blue text-[10px] font-black uppercase tracking-wider transition-all"
              >
                Limpar Filtros
              </button>
            </div>

            {/* Linha de KPIs de dados filtrados */}
            <div className="bg-blue-50/50 border border-blue-150/40 p-5 rounded-[24px] mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <span className="text-[9px] font-black uppercase text-gov-blue/80 tracking-widest">Inscrições com filtro ativo</span>
                <p className="text-xl font-black text-gray-900 mt-1">{filteredKPIs.totalInscricoes}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-gov-blue/80 tracking-widest">Taxa média de Presença</span>
                <p className="text-xl font-black text-gray-900 mt-1">
                  {filteredKPIs.presenceRate}% <span className="text-xs text-gray-400 font-semibold">({filteredKPIs.totalPresencas} presentes)</span>
                </p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-gov-blue/80 tracking-widest">Taxa de Conclusão / Certificação</span>
                <p className="text-xl font-black text-gray-900 mt-1">
                  {filteredKPIs.certRate}% <span className="text-xs text-gray-400 font-semibold">({filteredKPIs.totalCertificados} emitidos)</span>
                </p>
              </div>
            </div>

            {/* Linha de Gráficos Recharts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              
              {/* Caixa Secretaria */}
              <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm">
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5 text-gov-blue" />
                  Inscrições por Secretaria Municipal
                </h3>
                
                {bySecretaria.length > 0 ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bySecretaria} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 9, fontWeight: 600, fill: '#6B7280' }} 
                          interval={0}
                          tickFormatter={(val) => val.length > 15 ? val.substring(0, 12) + '...' : val}
                        />
                        <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#6B7280' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 11 }}
                          formatter={(value: any) => [`${value} inscrições`, 'Inscrições']}
                        />
                        <Bar dataKey="value" fill="#004B82" radius={[6, 6, 0, 0]}>
                          {bySecretaria.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-gray-400 text-xs">
                    <Inbox className="w-8 h-8 mb-2" /> No momento não existem dados cadastrais.
                  </div>
                )}
              </div>

              {/* Caixa Categoria */}
              <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm">
                <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <Tag className="w-5 h-5 text-gov-blue" />
                  Inscrições por Categoria de Capacitação
                </h3>
                
                {byCategory.length > 0 ? (
                  <div className="h-72 w-full flex flex-col md:flex-row items-center justify-between">
                    <div className="w-full md:w-1/2 h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={byCategory}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {byCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1F2937', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 11 }}
                            formatter={(value: any) => [`${value} inscrições`, 'Inscrições']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legendas Customizadas */}
                    <div className="w-full md:w-1/2 space-y-2 max-h-60 overflow-y-auto pl-4">
                      {byCategory.map((item, index) => {
                        const total = byCategory.reduce((acc, curr) => acc + curr.value, 0);
                        const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
                        return (
                          <div key={item.name} className="flex items-center justify-between text-xs font-semibold text-gray-600">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            <span className="text-gray-900 shrink-0 font-mono pl-2">{item.value} ({percentage}%)</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="h-72 flex flex-col items-center justify-center text-gray-400 text-xs">
                    <Inbox className="w-8 h-8 mb-2" /> No momento não existem dados cadastrais.
                  </div>
                )}
              </div>

            </div>

            {/* Linha 2 de Gráficos e Rankings (Requisito: Bairro, Crescimento Mensal e Ranking) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              {/* Gráfico de Bairros de Maricá */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-gov-blue" />
                    Participação por Bairro
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">Inscrições de munícipes por bairros residenciais de Maricá.</p>
                </div>
                
                {byBairro.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={byBairro.slice(0, 5)} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 9, fontWeight: 600, fill: '#6B7280' }} />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          tick={{ fontSize: 10, fontWeight: 700, fill: '#1F2937' }} 
                          width={75}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 11 }}
                          formatter={(value: any) => [`${value} inscrições`, 'Inscrições']}
                        />
                        <Bar dataKey="value" fill="#0070C0" radius={[0, 6, 6, 0]}>
                          {byBairro.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs text-center py-8">
                    <Inbox className="w-8 h-8 mb-2" /> Nenhuma inscrição qualificada em bairros ativos.
                  </div>
                )}
              </div>

              {/* Histórico / Crescimento Mensal */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-gov-blue" />
                    Crescimento Mensal
                  </h3>
                  <p className="text-xs text-gray-400 mb-6">Evolução de novas inscrições e crescimento cívico consolidado.</p>
                </div>
                
                {monthlyGrowth.length > 0 ? (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                        <defs>
                          <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#004B82" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#004B82" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 9, fontWeight: 600, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#6B7280' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 11 }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="cumulative" 
                          name="Acumulado" 
                          stroke="#004B82" 
                          strokeWidth={2.5} 
                          fillOpacity={1} 
                          fill="url(#colorRegistrations)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs text-center py-8">
                    <Inbox className="w-8 h-8 mb-2" /> Histórico de inscrições sem dados suficientes.
                  </div>
                )}
              </div>

              {/* Ranking de Eventos (Top 5) */}
              <div className="bg-white p-6 rounded-[32px] border border-gray-150 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-amber-500" />
                    Ranking de Eventos
                  </h3>
                  <p className="text-xs text-gray-400 mb-6 font-semibold">Atividades líderes em adesão e engajamento escolar ou cívico.</p>
                </div>
                
                {rankingEvents.length > 0 ? (
                  <div className="space-y-3 h-64 overflow-y-auto pr-1">
                    {rankingEvents.map((event, index) => (
                      <div key={event.id} className="flex items-center gap-3 bg-gray-50/70 hover:bg-gray-50 p-3 rounded-2xl border border-gray-100 transition-all">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          index === 0 ? 'bg-amber-100 text-amber-800' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-amber-50 text-amber-900 border border-amber-100' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-gray-900 truncate uppercase tracking-tight">{event.title}</h4>
                          <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider block mt-0.5 max-w-full truncate">{event.org_name}</span>
                        </div>
                        <div className="text-right shrink-0 pl-1">
                          <p className="font-mono text-xs font-black text-gray-900">{event.total_registrations}</p>
                          <span className="text-[8px] font-semibold text-gray-400 uppercase">inscritos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs text-center py-8">
                    <Inbox className="w-8 h-8 mb-2" /> Sem ranking disponível no momento.
                  </div>
                )}
              </div>

            </div>

            {/* Tabela de Detalhes dos Eventos com Métricas de Conclusão */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
                <div>
                  <h3 className="text-base font-black text-gray-950 uppercase tracking-tight">Indicadores Individuais de Atividades</h3>
                  <p className="text-xs text-gray-400 mt-1">Estatísticas detalhadas de inscrições confirmadas, presença qualificada e certidões emitidas.</p>
                </div>
                <span className="px-3.5 py-1.5 bg-blue-50 text-gov-blue text-[10px] font-black uppercase tracking-widest rounded-xl">
                  {filteredEvents.length} Atividades Filtradas
                </span>
              </div>

              {filteredEvents.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-150 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50">
                        <th className="p-4 rounded-l-2xl">Atividade / Conferência</th>
                        <th className="p-4 pb-2">Secretaria Organizadora</th>
                        <th className="p-4 pb-2">Gestor do Evento</th>
                        <th className="p-4 text-center">Inscritos</th>
                        <th className="p-4 text-center">Presentes</th>
                        <th className="p-4 text-center">Diplomas</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 rounded-r-2xl">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {filteredEvents.map((e) => {
                        const localPresenceRate = e.total_registrations > 0 ? Math.round((e.total_presence / e.total_registrations) * 100) : 0;
                        const localCertRate = e.total_registrations > 0 ? Math.round((e.total_certificates / e.total_registrations) * 100) : 0;

                        return (
                          <tr key={e.id} className="hover:bg-gray-50/55 transition-all">
                            <td className="p-4 font-bold text-gray-900 max-w-xs">
                              <p className="truncate block">{e.title}</p>
                              <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-[9px] font-extrabold text-gray-500 rounded uppercase">
                                {e.category}
                              </span>
                            </td>
                            <td className="p-4 text-gray-500 font-semibold max-w-[150px] truncate">{e.org_name}</td>
                            <td className="p-4 text-gray-500 font-semibold">{e.gestor_responsavel}</td>
                            <td className="p-4 text-center font-mono font-bold text-gray-900">{e.total_registrations}</td>
                            <td className="p-4 text-center">
                              <p className="font-mono font-bold text-gray-900">{e.total_presence}</p>
                              <span className="text-[10px] font-extrabold text-emerald-600">({localPresenceRate}%)</span>
                            </td>
                            <td className="p-4 text-center">
                              <p className="font-mono font-bold text-gray-900">{e.total_certificates}</p>
                              <span className="text-[10px] font-extrabold text-amber-600">({localCertRate}%)</span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-block px-3 py-1 text-[9px] font-extrabold uppercase rounded-full ${
                                e.status === 'CONCLUDED' 
                                  ? 'bg-amber-50 text-amber-700' 
                                  : e.status === 'ACTIVE' 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : 'bg-gray-150 text-gray-500'
                              }`}>
                                {e.status === 'CONCLUDED' ? 'Concluído' : e.status === 'ACTIVE' ? 'Ativo' : 'Outros'}
                              </span>
                            </td>
                            <td className="p-4 font-semibold text-gray-450">
                              {new Date(e.date_start).toLocaleDateString('pt-BR')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-gray-400">
                  <Inbox className="w-10 h-10 mb-2 text-gray-300" />
                  <p className="font-bold text-sm">Nenhum evento encontrado para as seleções inseridas.</p>
                  <p className="text-[11px] text-gray-450 mt-1">Experimente alterar os filtros na barra superior.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <MultiSecretariasDashboard eventsDetails={eventsDetails} />
        )}

      </div>
    </div>
  );
};
export default ExecutiveReports;
