import React, { useState, useMemo } from 'react';
import { 
  Shield, 
  Database, 
  Cpu, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Layers, 
  Key, 
  Download, 
  Copy, 
  RefreshCw,
  Search,
  BookOpen,
  Settings,
  HardDrive,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

// Definição dos planos textuais do relatório
interface AuditSection {
  title: string;
  id: 'report' | 'production' | 'backup' | 'recovery' | 'costs';
  icon: React.ReactNode;
}

export const ScalabilityAudit: React.FC = () => {
  // Estado principal: Metas de Cidadãos Cadastrados (Slider Dinâmico)
  const [citizenTarget, setCitizenTarget] = useState<number>(200000);
  const [activeTab, setActiveTab] = useState<'report' | 'production' | 'backup' | 'recovery' | 'costs'>('report');
  
  // Feedback visual de ação
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);

  // Cálculos dinâmicos com base no volume de usuários
  const metrics = useMemo(() => {
    // Estimativas de banco baseadas em 200.000 usuários
    const userDbSizeMB = 0.5; // 500kb por usuário com dados históricos, logs, presenças
    const baseDbSizeGB = (citizenTarget * userDbSizeMB) / 1024;
    
    // Estimativa de requisições de pico em eventos (RPS - Requests Per Second)
    // Se 10% dos cidadãos cadastrados vão a um evento simultâneo e emitem check-in em um intervalo de 1 hora:
    const activeConcurrentUsers = Math.round(citizenTarget * 0.05); 
    const peakRPS = Math.round((activeConcurrentUsers * 4) / 3600); // 4 requisições por usuário ativo na hora do pico

    // PDF gerados / dia nos picos de atividades
    const dailyCertificates = Math.round(citizenTarget * 0.02);

    // Dimensionamento de Hardware (Compute / Storage)
    let cpuRecommendation = "2 vCPU";
    let ramRecommendation = "7.5 GB (db-custom-2-7680)";
    let pgVersion = "PostgreSQL 15 (Enterprise Edition)";
    let storageType = "SSD persistente regional";
    
    if (citizenTarget > 350000) {
      cpuRecommendation = "8 vCPU";
      ramRecommendation = "30 GB (db-custom-8-30720)";
    } else if (citizenTarget > 150000) {
      cpuRecommendation = "4 vCPU";
      ramRecommendation = "15 GB (db-custom-4-15360)";
    }

    return {
      dbVolumeGB: Math.round(baseDbSizeGB * 10) / 10,
      peakRPS: Math.max(10, peakRPS),
      dailyCertificates,
      cpuRecommendation,
      ramRecommendation,
      pgVersion,
      storageType
    };
  }, [citizenTarget]);

  // Estrutura de custos do GCP estimada
  const gcpCosts = useMemo(() => {
    // Escalonador com base no volume selecionado
    const ratio = citizenTarget / 200000;
    
    const cloudSqlBase = 180 * ratio; // Instância PostgreSQL Customizada com HA
    const storageSql = 0.24 * metrics.dbVolumeGB * 2; // Armazenamento SSD Duplicado (Read Replica + HA)
    const cloudRunCost = 120 * ratio; // Server CPU/Memory para lidar com CPU de validação de Assinaturas
    const cloudCDN = 45 * Math.min(1.5, ratio); // CDN para os PDFs de certificados
    const sendgridMails = 19.95 * Math.max(1, ratio * 2); // Disparos de Certificados
    const backupsGCS = 0.026 * metrics.dbVolumeGB * 3; // 3 retenções completas
    
    const totalUSD = cloudSqlBase + storageSql + cloudRunCost + cloudCDN + sendgridMails + backupsGCS;
    const totalBRL = totalUSD * 5.20; // Cotação fixa para ilustração municipal

    return {
      cloudSql: Math.round(cloudSqlBase),
      storage: Math.round(storageSql),
      cloudRun: Math.round(cloudRunCost),
      cdn: Math.round(cloudCDN),
      emails: Math.round(sendgridMails),
      backups: Math.round(backupsGCS),
      totalUSD: Math.round(totalUSD),
      totalBRL: Math.round(totalBRL)
    };
  }, [citizenTarget, metrics]);

  // Índices sugeridos com DDL e justificativa técnica
  const indexRecommendations = [
    {
      table: "users",
      columns: ["email", "role"],
      ddl: "CREATE UNIQUE INDEX idx_users_email_role ON users(email, role);",
      benefit: "Elimina buscas sequenciais (Seq Scan) na autenticação de login de cidadãos e verificação de privilégios de Administrador."
    },
    {
      table: "registrations",
      columns: ["user_id", "event_id"],
      ddl: "CREATE UNIQUE INDEX idx_registrations_user_event ON registrations(user_id, event_id) WHERE status = 'CONFIRMED';",
      benefit: "Evita dupla inscrição de cidadãos em uma mesma atividade e otimiza a listagem de 'Minhas Inscrições' de forma indexada."
    },
    {
      table: "presence_checks",
      columns: ["registration_id", "status"],
      ddl: "CREATE INDEX idx_presence_checks_reg_status ON presence_checks(registration_id, status);",
      benefit: "Acelera a varredura da folha de presença municipal durante chamadas, leituras QR Code do Organizador e contagem de alunos."
    },
    {
      table: "certificates",
      columns: ["code", "hash_verification"],
      ddl: "CREATE UNIQUE INDEX idx_certificates_code_hash ON certificates(code, hash_verification);",
      benefit: "Garante resposta sub-milissegundo na validação pública externa de assinaturas de certificados por órgãos reguladores."
    },
    {
      table: "audit_logs",
      columns: ["action", "created_at"],
      ddl: "CREATE INDEX idx_audit_logs_action_created ON audit_logs(action, created_at DESC);",
      benefit: "Otimiza a renderização de logs forenses no painel administrativo de GOVVIVA, ordenado por tempos decrescentes."
    }
  ];

  const handleCopySQL = (ddl: string, key: string) => {
    navigator.clipboard.writeText(ddl);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  const showSystemMessage = (text: string) => {
    setCopiedMessage(text);
    setTimeout(() => setCopiedMessage(null), 4000);
  };

  // Exportar Relatório Oficial com jsPDF
  const handleExportTechnicalPDF = () => {
    setExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Estilo de Órgão Público Regulador
      const primaryColor = '#004B82'; // Azul Oficial
      const darkColor = '#1F2937';
      const grayColor = '#4B5563';

      // PÁGINA 1: Capa Executiva
      doc.setFillColor(0, 75, 130);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text('GOVVIVA MUNICIPAL', 20, 70);
      doc.setFontSize(18);
      doc.text('AUDITORIA DE SEGURANÇA E ESCALABILIDADE', 20, 80);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Meta de Projeto: Suportar ${citizenTarget.toLocaleString('pt-BR')} Cidadãos Ativos`, 20, 90);
      doc.line(20, 100, 190, 100);

      // Metadados da Capa
      doc.setFontSize(10);
      doc.text('Órgão Certificador: Controladoria Municipal de Tecnologia e Inovação', 20, 220);
      doc.text('Ambiente Alvo: Google Cloud Platform (GCP) - Região southamerica-east1 (São Paulo)', 20, 227);
      doc.text(`Documentação Emitida: ${new Date().toLocaleDateString('pt-BR')}`, 20, 234);
      doc.text('Status de Certificação: HOMOLOGADO PARA ALTA ESCALA', 20, 241);

      // PÁGINA 2: Diagnóstico PostgreSQL e Índices
      doc.addPage();
      doc.setFillColor(255, 255, 255);
      
      // Cabeçalho de página
      doc.setFillColor(243, 244, 246);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.setFontSize(11);
      doc.text('GOVVIVA - RELATÓRIO TÉCNICO DE AUDITORIA', 15, 15);
      doc.setFontSize(8);
      doc.setTextColor(grayColor);
      doc.text(`Meta de Escalonamento: ${citizenTarget.toLocaleString('pt-BR')} Inscritos`, 150, 15);

      // Seção 1
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(darkColor);
      doc.text('1. Diagnóstico do Banco de Dados PostgreSQL', 15, 40);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(grayColor);
      
      const p1Text = [
        `Para atingirmos com segurança a meta de ${citizenTarget.toLocaleString('pt-BR')} cidadãos cadastrados na plataforma de capacitação, mapeamos o crescimento informacional e sugerimos especificações precisas de infraestrutura computacional no Google Cloud SQL.`,
        ``,
        `• Volume Estimado de Armazenamento: ${metrics.dbVolumeGB} GB (considerando dados históricos).`,
        `• Pico Concorrente Projetado: ${metrics.peakRPS} RPS na virada de check-ins/check-outs municipais.`,
        `• Dimensionamento de Hardware Recomendado: ${metrics.cpuRecommendation} CPU, ${metrics.ramRecommendation}.`,
        `• Mecanismo de Conexão Recomendado: PgBouncer para realizar pool eficiente de até 1.500 conexões ativas.`
      ];
      
      let curY = 48;
      p1Text.forEach(line => {
        doc.text(line, 15, curY);
        curY += 7;
      });

      // Índices
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(darkColor);
      doc.text('2. Estratégia de Índices SQL Necessários', 15, curY + 5);
      curY += 13;

      indexRecommendations.forEach((idx) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(primaryColor);
        doc.text(`Tabela '${idx.table.toUpperCase()}':`, 17, curY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(grayColor);
        doc.text(`Benefício: ${idx.benefit}`, 17, curY + 4.5);
        doc.setFont('Courier', 'normal');
        doc.setFontSize(7.5);
        doc.text(idx.ddl, 17, curY + 9);
        doc.setFont('helvetica', 'normal');
        
        doc.setDrawColor(243, 244, 246);
        doc.line(15, curY + 12, 195, curY + 12);
        curY += 16;
      });

      // PÁGINA 3: Segurança e Políticas de Backup
      doc.addPage();
      doc.setFillColor(243, 244, 246);
      doc.rect(0, 0, 210, 25, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.setFontSize(11);
      doc.text('GOVVIVA - PLANOS OPERACIONAIS DE INFRAESTRUTURA', 15, 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(darkColor);
      doc.text('3. Segurança, JWT & Rate Limiting', 15, 40);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(grayColor);
      
      const p3Text = [
        `• Algoritmo de Criptografia JWT: Recomendação de migração de HS256 para RS256 (assimétrico), utilizando`,
        `  chaves públicas para verificação em microsserviços sem expor o segredo original da prefeitura.`,
        `• Tempo de Vida dos Tokens: 1 hora de expiração para Access Token, com Refresh Token rotativo de 7 dias`,
        `  armazenado em cookie seguro com flag HTTPOnly (proteção contra ataques XSS e CSRF).`,
        `• Rate Limiting Municipal: Limite estrito de 60 requisições/minuto por IP para IPs cidadãos gerais e até`,
        `  1.200 requisições/minuto para IPs organizadores autenticados e rotas oficiais de bipes QR Code.`,
        `• Algoritmos indicados: Token Bucket para evitar rajadas e Leaky Bucket para suavizar o tráfego nos servidores.`
      ];

      curY = 48;
      p3Text.forEach(line => {
        doc.text(line, 15, curY);
        curY += 6.5;
      });

      // Backup e DR
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(darkColor);
      doc.text('4. Plano de Backup e Recuperação de Desastre (DR)', 15, curY + 8);
      curY += 15;

      const p4Text = [
        `• Frequência de Backup Automatizado: Backups diários completos executados automaticamente às 02:00 UTC`,
        `  com retenção de 30 dias no Google Cloud Storage (GCS) em classe Nearline no mesmo datacenter regional.`,
        `• Point-In-Time-Recovery (PITR): Habilitação de Write-Ahead Logging (WAL) arquivado em lotes de 5 minutos,`,
        `  garantindo recuperação de transações para qualquer segundo do dia em caso de falha de sistema.`,
        `• Recovery Time Objective (RTO): Tempo máximo estipulado de até 45 minutos para restabelecer o sistema completo.`,
        `• Recovery Point Objective (RPO): Perda máxima aceitável de transações limitada a no máximo 5 minutos (PITR).`,
        `• Alta Disponibilidade (HA): Replicação multi-zona ativa em southamerica-east1-a e southamerica-east1-b`
      ];

      p4Text.forEach(line => {
        doc.text(line, 15, curY);
        curY += 6.5;
      });

      // Custos Estimados
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(darkColor);
      doc.text('5. Estimativa de Custos de Cloud (GCP/Mensal)', 15, curY + 8);
      curY += 15;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(grayColor);
      doc.text(`• Google Cloud SQL Custom Instance (HA): $${gcpCosts.cloudSql}/mês`, 15, curY);
      doc.text(`• SSD Storage de Alta performance (Duplicado): $${gcpCosts.storage}/mês`, 15, curY + 6);
      doc.text(`• Google Cloud Run (Server Container Cpu/Ram): $${gcpCosts.cloudRun}/mês`, 15, curY + 12);
      doc.text(`• Cloud CDN & DNS para Certificados Públicos: $${gcpCosts.cdn}/mês`, 15, curY + 18);
      doc.text(`• Servidor de Email de Altíssima Entrega: $${gcpCosts.emails}/mês`, 15, curY + 24);
      doc.text(`• Armazenamento Redundante Nearline Backups: $${gcpCosts.backups}/mês`, 15, curY + 30);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor);
      doc.text(`CUSTO TOTAL ESTIMADO: $${gcpCosts.totalUSD} USD /mês (~R$ ${gcpCosts.totalBRL.toLocaleString('pt-BR')} BRL)`, 15, curY + 38);

      doc.save(`GOVVIVA_Relatorio_Escalabilidade_${citizenTarget}_Usuarios.pdf`);
      showSystemMessage('Relatório Técnico de Alta Escala baixado em formato PDF com sucesso!');
    } catch (err) {
      console.error(err);
      showSystemMessage('Erro ao compilar PDF. Verifique os dados inseridos.');
    } finally {
      setExporting(false);
    }
  };

  // Exportar Tabela de Custos e Métricas com XLSX
  const handleExportExcelCosts = () => {
    if (!citizenTarget) return;

    const dataToExport = [
      { 'Parâmetro de Auditoria': 'Meta de Cidadãos Cadastrados', 'Metodologia': 'Capacidade Máxima Alvo', 'Métrica / Recurso': `${citizenTarget.toLocaleString('pt-BR')} cidadãos`, 'Custo Mensal Estimado': 'N/A' },
      { 'Parâmetro de Auditoria': 'Volume Estimado de Dados', 'Metodologia': 'Média de 500kb/user com logs', 'Métrica / Recurso': `${metrics.dbVolumeGB} GB SSD`, 'Custo Mensal Estimado': 'N/A' },
      { 'Parâmetro de Auditoria': 'Requisições Concorrentes de Pico', 'Metodologia': 'Check-in expresso bipes', 'Métrica / Recurso': `${metrics.peakRPS} Req/seg (RPS)`, 'Custo Mensal Estimado': 'N/A' },
      { 'Parâmetro de Auditoria': 'Google Cloud SQL (HA)', 'Metodologia': 'PostgreSQL com Read Replica', 'Métrica / Recurso': `${metrics.cpuRecommendation} - ${metrics.ramRecommendation}`, 'Custo Mensal Estimado': `$${gcpCosts.cloudSql} USD` },
      { 'Parâmetro de Auditoria': 'Armazenamento SSD', 'Metodologia': 'Double zone SSD regional', 'Métrica / Recurso': `${metrics.dbVolumeGB * 2} GB SSD`, 'Custo Mensal Estimado': `$${gcpCosts.storage} USD` },
      { 'Parâmetro de Auditoria': 'Google Cloud Run', 'Metodologia': 'Processamento de validação assinaturas', 'Métrica / Recurso': 'Servidor Auto-escalável', 'Custo Mensal Estimado': `$${gcpCosts.cloudRun} USD` },
      { 'Parâmetro de Auditoria': 'Cloud CDN & DNS', 'Metodologia': 'Cacheamento de PDFs de certificados', 'Métrica / Recurso': 'Alta performance', 'Custo Mensal Estimated': `$${gcpCosts.cdn} USD` },
      { 'Parâmetro de Auditoria': 'Disparador de E-mails', 'Metodologia': 'Envio por SMTP homologado Sendgrid', 'Métrica / Recurso': `${metrics.dailyCertificates} emails/dia`, 'Custo Mensal Estimado': `$${gcpCosts.emails} USD` },
      { 'Parâmetro de Auditoria': 'Backups e Retenções Store', 'Metodologia': 'Google GCS Nearline storage', 'Métrica / Recurso': '3 Backups Completos', 'Custo Mensal Estimado': `$${gcpCosts.backups} USD` },
      { 'Parâmetro de Auditoria': 'TOTAL DE INVESTIMENTO ESTIMADO', 'Metodologia': 'Custo de nuvem somado mensal', 'Métrica / Recurso': 'Solução Completa SaaS', 'Custo Mensal Estimado': `~R$ ${gcpCosts.totalBRL.toLocaleString('pt-BR')} BRL ($${gcpCosts.totalUSD} USD)` },
    ];

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Estimativa de Custos Cloud');

    // Ajuste de largura das colunas
    worksheet['!cols'] = [
      { wch: 35 },
      { wch: 40 },
      { wch: 35 },
      { wch: 25 },
    ];

    XLSX.writeFile(workbook, `GOVVIVA_Plano_Financeiro_Cloud_${citizenTarget}_Usuarios.xlsx`);
    showSystemMessage('Dados financeiros de custos exportados para Excel com sucesso!');
  };

  const auditSections: AuditSection[] = [
    { title: "Relatório Técnico", id: "report", icon: <FileText className="w-4 h-4" /> },
    { title: "Plano de Produção (GCP)", id: "production", icon: <Layers className="w-4 h-4" /> },
    { title: "Plano de Backup", id: "backup", icon: <HardDrive className="w-4 h-4" /> },
    { title: "Plano de Recuperação (DR)", id: "recovery", icon: <CheckCircle2 className="w-4 h-4" /> },
    { title: "Custos Mensais Cloud", id: "costs", icon: <DollarSign className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-12">
      
      {/* Toast Notificações */}
      <AnimatePresence>
        {copiedMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-[100] bg-white border-l-[6px] border-gov-blue text-gray-900 p-6 rounded-3xl shadow-2xl flex items-center gap-4 max-w-md"
          >
            <div className="p-2 bg-blue-50 text-gov-blue rounded-full">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-[10px] uppercase tracking-widest text-gov-blue">Controladoria GOVVIVA</p>
              <p className="font-bold text-sm text-gray-700 mt-0.5 leading-snug">{copiedMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Topo Institucional */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gov-blue/5 rounded-bl-[160px] -z-0"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-gov-blue" />
              <span className="text-[10px] font-black text-gov-blue uppercase tracking-[0.3em]">Ambiente de Compliance Municipal</span>
            </div>
            <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tighter leading-none">
              Auditoria de <span className="text-gov-blue">Escalabilidade</span>
            </h1>
            <p className="text-gray-400 font-bold mt-2 text-sm max-w-2xl">
              Simulador operacional de infraestrutura, planejamento estratégico de alta estabilidade e conformidade para o Portal de Capacitações e Certificados.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 relative z-10">
            <button 
              onClick={handleExportTechnicalPDF}
              className="flex items-center gap-2 bg-gov-blue hover:bg-gov-blue-dark text-white text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              Baixar Relatório PDF
            </button>
            <button 
              onClick={handleExportExcelCosts}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              Baixar Custos (XLSX)
            </button>
          </div>
        </div>

        {/* PAINEL DE SIMULAÇÃO DE CARGA (200.000 USUÁRIOS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Card de Configuração do Escalamento */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-950 uppercase tracking-tight flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gov-blue" />
                Target de Escalonamento
              </h2>
              <p className="text-gray-400 text-[11px] font-semibold leading-relaxed mb-6">
                Ajuste a quantidade prevista de cidadãos cadastrados de forma simultânea no ecossistema GOVVIVA. A matriz operacional recalculará as cargas operacionais de banco de dados e custos de nuvem correspondentes.
              </p>

              <div className="space-y-4">
                <div className="flex justify-between items-end font-mono">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Base de Cidadãos</span>
                  <span className="text-xl font-black text-gov-blue">
                    {citizenTarget.toLocaleString('pt-BR')} <span className="text-xs text-gray-400">ativos</span>
                  </span>
                </div>
                
                <input 
                  type="range" 
                  min="10000" 
                  max="500000" 
                  step="10000"
                  value={citizenTarget}
                  onChange={(e) => setCitizenTarget(Number(e.target.value))}
                  className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-gov-blue"
                />

                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <span>10.000 (Mín)</span>
                  <span>200.000 (ALVO)</span>
                  <span>500.000 (Máx)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex bg-blue-50/50 rounded-2xl p-4 gap-3 border border-blue-100">
                <AlertTriangle className="w-5 h-5 text-gov-blue shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-950 font-semibold leading-normal">
                  <strong>Auditoria Recomendada:</strong> Para a meta de <strong>200.000</strong> cadastros, o banco PostgreSQL precisa de reconfiguração de Pool de Conexões e Índices Complexos Obrigatórios para evitar latências superiores a 1 segundo.
                </p>
              </div>
            </div>
          </div>

          {/* KPIs Calculados Dinamicamente */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume Estimado em Disco (Banco)</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <p className="text-3xl font-black text-gray-950">{metrics.dbVolumeGB} GB</p>
                  <p className="text-xs text-gray-400 font-bold">SSD Regional</p>
                </div>
                <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                  Cálculo de histórico baseado em dados cadastrais, presenças biométricas diárias, registros de acessos e assinaturas geradas.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-gov-blue font-black text-[9px] uppercase tracking-widest">
                <Database className="w-4 h-4" /> PostgreSQL 15 Engine
              </div>
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pico de Requisições de Presença</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <p className="text-3xl font-black text-gray-950">{metrics.peakRPS} RPS</p>
                  <p className="text-xs text-gray-400 font-bold">Req/Segundo</p>
                </div>
                <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                  Previsão durante horários cruciais de término de atividades no ecossistema municipal, com picos simultâneos por QR Code.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-amber-500 font-black text-[9px] uppercase tracking-widest">
                <Activity className="w-4 h-4" /> Estimativa de Pico Concorrente
              </div>
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hardware Cloud SQL Recomendado</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <p className="text-xl font-black text-gray-950">{metrics.cpuRecommendation} @ {metrics.ramRecommendation}</p>
                </div>
                <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                  Configuração de instâncias de processamento de alta redundância na GCP na região southamerica-east1 (São Paulo).
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-gov-blue font-black text-[9px] uppercase tracking-widest">
                <Cpu className="w-4 h-4" /> Recomendação de Hardware
              </div>
            </div>

            <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-sm flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacidade Certificados Emitidos</p>
                <div className="flex items-baseline gap-1 mt-2">
                  <p className="text-3xl font-black text-gov-blue">~{metrics.dailyCertificates.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400 font-bold">PDFs/Dia</p>
                </div>
                <p className="text-[11px] text-gray-400 font-semibold mt-2 leading-relaxed">
                  Fluxo diário de renderização, assinatura pública de segurança hash oficial e envio automatizado via SMTP para Maricá.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-gov-blue font-black text-[9px] uppercase tracking-widest">
                <FileText className="w-4 h-4" /> Geração de Documentos
              </div>
            </div>

          </div>

        </div>

        {/* TABELA DE GESTÃO DE ÍNDICES MANDATÓRIOS DO POSTGRES */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 pb-6">
            <div>
              <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight flex items-center gap-2">
                <Database className="w-5 h-5 text-gov-blue" />
                Índices de Otimização Recomendados (PostgreSQL)
              </h2>
              <p className="text-sm text-gray-400 font-medium mt-1">
                A aplicação de índices customizados abaixo evita o scan completo (Seq Scan) nas tabelas, garantindo que buscas por CPF, Email e Tickets operem em tempo constante (O(log N)) mesmo com 500mil registros.
              </p>
            </div>
            <span className="px-4 py-2 bg-blue-50 text-gov-blue hover:bg-blue-100 rounded-xl text-[10px] font-black uppercase tracking-widest select-none">
              Homologação Necessária
            </span>
          </div>

          <div className="space-y-4">
            {indexRecommendations.map((idx, index) => {
              const isCopied = copiedIndex === idx.table;
              return (
                <div key={index} className="p-5 bg-gray-50 border border-gray-150 rounded-[20px] hover:border-gov-blue/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 bg-gray-900 text-white text-[9px] font-black uppercase tracking-wider rounded">
                        TABELA: {idx.table}
                      </span>
                      <span className="text-[10px] font-extrabold text-gray-450 uppercase tracking-wider">
                        Campos: {idx.columns.join(' + ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 font-semibold leading-relaxed max-w-2xl mb-3">
                      <strong>Impacto na carga:</strong> {idx.benefit}
                    </p>
                    <div className="bg-gray-900 p-4 rounded-xl text-[11px] font-mono text-gray-200 select-all border border-gray-850 overflow-x-auto w-full max-w-3xl">
                      {idx.ddl}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopySQL(idx.ddl, idx.table)}
                    className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-gray-100 text-gray-700 border border-gray-150 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all self-end md:self-center"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {isCopied ? 'Copiado!' : 'Copiar DDL'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* NAVEGAÇÃO ENTRE OS DOCUMENTOS E TEXTOS DE AUDITORIA */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Menu Lateral de Tabs */}
          <div className="flex flex-col gap-2">
            {[
              { id: 'report', title: '1. Relatório Técnico', icon: <FileText className="w-4 h-4" />, desc: 'Análise de APIs e Gargalos' },
              { id: 'production', title: '2. Plano de Produção', icon: <Layers className="w-4 h-4" />, desc: 'Arquitetura de Nuvem GCP' },
              { id: 'backup', title: '3. Plano de Backup', icon: <HardDrive className="w-4 h-4" />, desc: 'Estratégia e Retenções GCS' },
              { id: 'recovery', title: '4. Plano de Recuperação', icon: <CheckCircle2 className="w-4 h-4" />, desc: 'Disaster Recovery (RTO/RPO)' },
              { id: 'costs', title: '5. Matriz de Custos Cloud', icon: <DollarSign className="w-4 h-4" />, desc: 'Gastos Estimados Mensais' },
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id as any)}
                className={`p-5 rounded-[24px] border text-left transition-all ${
                  activeTab === section.id 
                    ? 'bg-gov-blue text-white border-gov-blue shadow-lg shadow-blue-100' 
                    : 'bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 border-gray-150'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg ${activeTab === section.id ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {section.icon}
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-wide">{section.title}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${activeTab === section.id ? 'text-blue-150' : 'text-gray-400'}`}>{section.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Painel Display de Conteúdo Textual */}
          <div className="lg:col-span-3 bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm">
            
            {activeTab === 'report' && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Documentação Oficial - Seção 1</span>
                  <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mt-1">Diagnóstico e Relatório Técnico de Alta Escala</h3>
                </div>

                <div className="space-y-4 text-xs font-semibold text-gray-600 leading-relaxed">
                  <p>
                    O ecossistema GOVVIVA foi projetado originalmente para operar eventos institucionais municipais. Com a nova meta operacional de estender o serviço de capacitação para até <strong>{citizenTarget.toLocaleString('pt-BR')} cidadãos</strong> do município, realizamos uma varredura completa das rotas e do banco PostgreSQL.
                  </p>

                  <div className="bg-red-50 p-5 rounded-2xl border border-red-100 flex items-start gap-4">
                    <AlertTriangle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-xs uppercase text-red-950">Gargalo Crítico Identificado: N+1 na listagem de presenças</p>
                      <p className="mt-1 leading-normal text-[11px] text-red-900">
                        O endpoint de listagem de presença de participantes (<code className="font-mono bg-white/70 px-1 rounded">/presence/event/&lt;id&gt;</code>) realiza buscas repetidas na tabela de usuários de forma individual (<code className="font-mono bg-white/70 px-1 rounded">User.query.get(r.user_id)</code>) para cada registro de inscrição (N+1 Query). Sob tráfego simultâneo na virada de eventos, isso causa estouro de conexões e travamento do pool do Cloud SQL.
                      </p>
                    </div>
                  </div>

                  <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider mt-6">Soluções Arquiteturais Obrigatórias:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-[11px]">
                    <li>
                      <strong>Query Optimisation (Eager Loading):</strong> Substituição da iteração manual do Python no backend por junção explícita de tabelas SQL (<code className="font-mono">db.session.query(Registration).join(User)...</code>), reduzindo N+1 consultas para apenas 1 consulta unificada em lote.
                    </li>
                    <li>
                      <strong>Validação JWT Assíncrona:</strong> Configuração do algoritmo de autenticação JWT para uso de chaves assimétricas RS256, permitindo que servidores periféricos ou instâncias Cloud Run de leitura validem os cookies de segurança sem sobrecarregar a microsserviço principal de escrita de Maricá.
                    </li>
                    <li>
                      <strong>Rate Limiting Adaptativo:</strong> Implementação de regras estritas de limite por IP via middleware do Nginx Ingress ou Redis Rate Limiter, utilizando algoritmo de <strong>Token Bucket</strong>.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'production' && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Documentação Oficial - Seção 2</span>
                  <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mt-1">Plano Estratégico de Produção e Deploy GCP</h3>
                </div>

                <div className="space-y-4 text-xs font-semibold text-gray-600 leading-relaxed">
                  <p>
                    Para o deploy definitivo de alta escalabilidade do GOVVIVA na nuvem do Google Cloud Platform (GCP), visando latência abaixo de 300 milissegundos e disponibilidade anual de no mínimo 99.95%, estruturamos a seguinte topologia de infraestrutura de datacenter regional na América do Sul:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150">
                      <p className="font-black text-[11px] text-gray-900 uppercase">Processamento (App Servers)</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        • Deploy em Google Cloud Run (Serverless)<br />
                        • Autoscaling automático de 2 a 30 instâncias<br />
                        • Limites de concorrência: 100 conexões/container
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150">
                      <p className="font-black text-[11px] text-gray-900 uppercase">Estratégia de Cache (Redis)</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        • Google Memorystore Redis (Cache Central)<br />
                        • Caching de catálogo e atividades por 30 minutos<br />
                        • Cacheamento de sessões JWT de cidadãos ativos
                      </p>
                    </div>
                  </div>

                  <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">Topologia de Ingress e Rede Segura:</h3>
                  <p className="text-[11px]">
                    Todos os acessos passarão obrigatoriamente através do Cloud Armor (WAF) responsável por barrar ataques de negação de serviço distribuído (DDoS) de forma automática. Em seguida, os caminhos estáticos dos arquivos de PDFs de certificados do GOVVIVA são servidos via Cloud CDN com cache local de Maricá, reduzindo o processamento de leitura de PDFs gerados para quase 0% de latência e custo.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Documentação Oficial - Seção 3</span>
                  <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mt-1">Plano Governamental de Backups e Segurança Informacional</h3>
                </div>

                <div className="space-y-4 text-xs font-semibold text-gray-600 leading-relaxed">
                  <p>
                    Para garantir que nenhum dado de presença de cidadãos ou certificados públicos de Maricá seja perdido sob qualquer hipótese de desastre operacional ou ataque cibernético de ransomware, estabelecemos a seguinte política estrita de backups governamentais:
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 border-l-4 border-gov-blue bg-blue-55 bg-blue-50/40 rounded-r-2xl">
                      <p className="font-bold text-xs text-blue-950 uppercase">Backup Diário Automático (GCS)</p>
                      <p className="text-[11px] text-blue-900 mt-1 font-semibold">
                        • Executado imperativamente às 02:00 horas da madrugada no Google Cloud Storage (Região southamerica-east1).<br />
                        • Retenção fixa: 30 dias com migração automática para classe Coldline após 15 dias.
                      </p>
                    </div>
                    <div className="p-4 border-l-4 border-emerald-500 bg-emerald-50/40 rounded-r-2xl">
                      <p className="font-bold text-xs text-emerald-950 uppercase">Arquivamento WAL (Write-Ahead Logging / PITR)</p>
                      <p className="text-[11px] text-emerald-900 mt-1 font-semibold">
                        • Arquivamento automático de logs de escrita do PostgreSQL em lotes de 5 minutos.<br />
                        • Permite restaurar o banco de dados do município para virtualmente qualquer segundo do dia nos últimos 7 dias.
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] mt-4">
                    Todo e qualquer backup gerado em disco passa obrigatoriamente por criptografia automática em trânsito e em repouso por chaves gerenciadas de segurança (Google KMS-customer managed), garantindo conformidade municipal com as novas regulações da LGPD (Lei Geral de Proteção de Dados).
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'recovery' && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Documentação Oficial - Seção 4</span>
                  <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mt-1">Plano de Recuperação de Desastre (Disaster Recovery Plan)</h3>
                </div>

                <div className="space-y-4 text-xs font-semibold text-gray-600 leading-relaxed">
                  <p>
                    O Plano de Recuperação de Desastres do GOVVIVA define os tempos máximos aceitáveis de parada e metas oficiais de segurança informacional contra interrupções de datacenters geográficos:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 border border-gray-150 rounded-2xl bg-gray-50">
                      <span className="text-[10px] font-black uppercase text-gray-400">RTO (Recovery Time Objective)</span>
                      <p className="text-2xl font-black text-gray-900 mt-1">45 minutos</p>
                      <p className="text-[10px] text-gray-500 mt-1 font-semibold">Tempo máximo aceitável para o sistema GOVVIVA voltar a estar ativo e operando após qualquer colapso completo do datacenter principal.</p>
                    </div>
                    <div className="p-5 border border-gray-150 rounded-2xl bg-gray-50">
                      <span className="text-[10px] font-black uppercase text-gray-400">RPO (Recovery Point Objective)</span>
                      <p className="text-2xl font-black text-gov-blue mt-1">5 minutos</p>
                      <p className="text-[10px] text-gray-500 mt-1 font-semibold">Tolerância de perda informacional de transações. Garante que, de forma sistêmica, no máximo 5 minutos de novas inscrições sejam perdidos.</p>
                    </div>
                  </div>

                  <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider mt-4">Manual de Acionamento (Failover):</h3>
                  <p className="text-[11px]">
                    No caso de queda física da zona southamerica-east1-a, o sistema de Cloud SQL com Alta Disponibilidade (HA) rotacionará de forma automática e transparente o tráfego do pool de gravação para a zona ativa de stand-by southamerica-east1-b em menos de 10 segundos, sem nenhuma intervenção mecânica por parte do comitê de tecnologia de Maricá.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'costs' && (
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4">
                  <span className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Documentação Oficial - Seção 5</span>
                  <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mt-1">Matriz de Investimento e Custos de Nuvem GCP</h3>
                </div>

                <div className="space-y-4 text-xs font-semibold text-gray-600 leading-relaxed">
                  <p>
                    Planilha orçamentária dos custos estimativos mensais para manutenção da infraestrutura de alta escala do GOVVIVA, calculados sob demanda baseados no target selecionado de <strong>{citizenTarget.toLocaleString('pt-BR')} cidadãos</strong>:
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Serviço Recomendado</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Capacidade Mapeada</th>
                          <th className="p-4 text-[10px] font-black text-gray-405 uppercase tracking-wider text-right">Preço Estimativo USD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 text-gray-700">
                        <tr>
                          <td className="p-4">Google Cloud SQL Instance (PostgreSQL HA)</td>
                          <td className="p-4">{metrics.cpuRecommendation} cpu / {metrics.ramRecommendation}</td>
                          <td className="p-4 text-right font-mono">${gcpCosts.cloudSql} USD</td>
                        </tr>
                        <tr>
                          <td className="p-4">SSD Persistent Storage Duplicado HA</td>
                          <td className="p-4">{metrics.dbVolumeGB * 2} GB regional</td>
                          <td className="p-4 text-right font-mono">${gcpCosts.storage} USD</td>
                        </tr>
                        <tr>
                          <td className="p-4">Google Cloud Run Serverless Containers</td>
                          <td className="p-4">Matriz auto-escalável ativa</td>
                          <td className="p-4 text-right font-mono">${gcpCosts.cloudRun} USD</td>
                        </tr>
                        <tr>
                          <td className="p-4">Cloud CDN & DNS Oficial</td>
                          <td className="p-4">Arquivos PDFs de Certificados Públicos</td>
                          <td className="p-4 text-right font-mono">${gcpCosts.cdn} USD</td>
                        </tr>
                        <tr>
                          <td className="p-4">Backups diários automatizados GCS</td>
                          <td className="p-4">GCS Nearlin Storage classe regional</td>
                          <td className="p-4 text-right font-mono">${gcpCosts.backups} USD</td>
                        </tr>
                        <tr>
                          <td className="p-4">SMTP Transmissor de Alertas e PDFs</td>
                          <td className="p-4">SendGrid Enterprise Gateway</td>
                          <td className="p-4 text-right font-mono">${gcpCosts.emails} USD</td>
                        </tr>
                        <tr className="bg-blue-50/50 font-black text-gov-blue">
                          <td className="p-4 uppercase text-xs" colSpan={2}>Valor Total Mensal Estimado:</td>
                          <td className="p-4 text-right text-xs font-mono">${gcpCosts.totalUSD} USD /mês <br /><span className="text-[10px] text-gray-400">~R$ {gcpCosts.totalBRL.toLocaleString('pt-BR')} BRL</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
          </div>

        </div>

      </div>

    </div>
  );
};
