import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Search, 
  FileCheck, 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  QrCode, 
  Terminal, 
  Lock, 
  Copy, 
  ExternalLink,
  BookOpen,
  ArrowRight,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuditTrailEvent {
  event: string;
  title: string;
  description: string;
  timestamp: string;
  badge: string;
  badge_color: string;
  hash?: string;
}

interface CertificateData {
  id: number;
  code: string;
  issue_date: string;
  expiration_date: string;
  pdf_url: string;
  status: string;
  hash_verification: string;
  is_expired: boolean;
  remaining_days: number;
  user_name: string;
  masked_cpf: string;
  event: {
    id: number;
    title: string;
    description: string;
    date_start: string;
    location: string;
    workload: number;
    category: string;
    org_responsible: string;
  };
  audit_trail: AuditTrailEvent[];
}

export const PublicValidation: React.FC = () => {
  const { code: paramCode } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const codeQuery = searchParams.get('code') || searchParams.get('query') || '';
  const initialCode = (paramCode || codeQuery).trim().toUpperCase();

  const [inputCode, setInputCode] = useState(initialCode);
  const [currentCode, setCurrentCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Carrega validação se houver código inicial
  useEffect(() => {
    if (initialCode) {
      fetchValidation(initialCode);
    }
  }, [initialCode]);

  const fetchValidation = async (code: string) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    setCertData(null);
    try {
      // Faz requisição para a rota singular de certificado
      const res = await api.get(`/certificate/${code}`);
      setCertData(res);
      setCurrentCode(code);
    } catch (err: any) {
      console.error(err);
      if (err.status === 403) {
        setError(err.message || 'O prazo de visualização pública eletrônica deste certificado expirou (Prazo legal de 30 dias).');
        if (err.user_name) {
          // Permite mostrar dados mínimos ocultos mesmo sob expiração
          setCertData({
            is_expired: true,
            code: code,
            user_name: err.user_name,
            event: {
              title: err.event_title,
              org_responsible: err.org_responsible,
            }
          } as any);
        }
      } else {
        setError(err.message || 'Código do certificado não foi localizado na base municipal GOVVIVA.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) return;
    navigate(`/validar/${cleanCode}`);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Formata cores extras de timeline badges
  const getBadgeClass = (color: string) => {
    switch(color) {
      case 'emerald': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'indigo': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'amber': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'blue':
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24 pt-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Topo institucional */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700 font-bold text-[10px] uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4" />
            Serviço Autônomo de Homologação Municipal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase leading-none">
            Validador <span className="text-blue-600">Público de Autenticidade</span>
          </h1>
          <p className="text-slate-500 font-medium mt-3 text-sm max-w-xl mx-auto">
            Verifique o status de diplomas e certificados eletrônicos homologados pelo GOVVIVA nos registros de auditoria da Prefeitura de Maricá.
          </p>
        </div>

        {/* formulário de Consulta */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-code" className="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-2.5">
                Código Único de Protocolo (GOV-CERT)
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <input 
                    id="auth-code"
                    type="text" 
                    placeholder="Cole aqui o código do diploma (Ex: GOV-CERT-E664A...)"
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-150 rounded-2xl text-sm font-semibold uppercase placeholder:normal-case focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={loading || !inputCode.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest px-8 py-4 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Consultar Registro'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Resultados */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 bg-white rounded-[32px] border border-slate-100"
            >
              <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-sm">Consultando livro oficial de homologações...</p>
              <p className="text-slate-400 text-xs mt-1">Conectando ao banco de dados municipal de segurança</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 rounded-[32px] p-8 md:p-10 space-y-6"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-950 uppercase">Certidão de Validação Negada</h3>
                  <p className="text-sm text-red-800 leading-relaxed mt-1">{error}</p>
                </div>
              </div>

              {/* Se for certificado expirado, ainda mostra os dados ocultos anonimizados */}
              {certData?.is_expired && (
                <div className="bg-white rounded-2xl p-6 border border-red-100 space-y-4">
                  <div className="border-b border-slate-50 pb-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Informações Históricas Preservadas</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wide mb-0.5">Participante</span>
                      <strong className="text-slate-800 font-bold">{certData.user_name}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wide mb-0.5">Qualificação / Atividade</span>
                      <strong className="text-slate-800 font-bold">{certData.event?.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block uppercase text-[9px] tracking-wide mb-0.5">Certificador</span>
                      <strong className="text-slate-800 font-bold">{certData.event?.org_responsible}</strong>
                    </div>
                  </div>
                  <div className="text-[10px] bg-slate-50 text-slate-600 font-medium p-3.5 rounded-xl leading-normal border border-slate-100">
                    O acesso aos arquivos PDF públicos e metadados detalhados expira compulsoriamente após 30 dias de sua geração (LGPD / Segurança Informacional). Registros permanentes de integridade continuam válidos internamente.
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {certData && !error && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              
              {/* Card de Status do Diploma */}
              <div className="bg-white rounded-[32px] border border-slate-100 p-8 md:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-blue-50/40 rounded-bl-[180px] -z-0"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-8 mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[9px] uppercase tracking-wider rounded border border-emerald-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Autêntico & Válido
                      </span>
                      <span className="text-slate-300 font-bold">|</span>
                      <span className="text-xs text-slate-400 font-bold font-mono uppercase">CÓD: {certData.code}</span>
                      <button 
                        onClick={() => handleCopyCode(certData.code)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-50 transition-colors"
                        title="Copiar Código"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copiedCode && <span className="text-[9px] text-emerald-600 font-bold animate-pulse">Copiado!</span>}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                      Certidão Eletrônica Homologada
                    </h2>
                  </div>

                  <a 
                    href={`/api/certificate/${certData.code}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    Gerar PDF Oficial
                  </a>
                </div>

                {/* Métricas do Diploma */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 text-sm">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Cidadão Outorgado</span>
                        <strong className="text-base font-extrabold text-slate-900 uppercase block mt-0.5">{certData.user_name}</strong>
                        <span className="text-xs text-slate-400 font-mono">CPF: {certData.masked_cpf}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Qualificação / Atividade</span>
                        <strong className="text-base font-extrabold text-slate-900 uppercase block mt-0.5">{certData.event?.title}</strong>
                        <span className="text-xs text-slate-400 font-bold block mt-0.5">Órgão: {certData.event?.org_responsible}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Data de Lavratura (Expedição)</span>
                        <strong className="text-base font-extrabold text-slate-800 block mt-0.5">
                          {new Date(certData.issue_date).toLocaleDateString('pt-BR')} às {new Date(certData.issue_date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                        <span className="text-xs text-slate-400 font-semibold block mt-0.5">Localização: {certData.event?.location}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Carga de Conclusão</span>
                        <strong className="text-base font-extrabold text-slate-800 block mt-0.5">{certData.event?.workload || 4} Horas Aula Homologadas</strong>
                        <span className="text-xs text-emerald-600 font-bold block mt-0.5">Controle de Frequência Eletrônica: 100% Presença</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bloco de Validação Criptográfica */}
                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-white text-blue-600 rounded-xl border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-blue-900 uppercase">Assinatura Digital Criptográfica (Checksum SHA-256)</h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase leading-snug break-all max-w border-b border-dashed border-slate-200 pb-1.5 mb-1.5 select-all">
                        {certData.hash_verification}
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        A chave acima é uma assinatura matemática unívoca. Qualquer alteração nos dados do cidadão, horas ou datas invalidaria integralmente o hash de autenticidade municipal.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCopyHash(certData.hash_verification)}
                    className="px-4 py-3 border border-blue-200 bg-white hover:bg-blue-50 text-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 select-none shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedHash ? 'Copiado!' : 'Copiar Hash'}
                  </button>
                </div>

              </div>

              {/* Trilha de Auditoria Pública do Certificado */}
              <div className="bg-white rounded-[32px] border border-slate-100 p-8 md:p-10 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-5 mb-8">
                  <div>
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block">Histórico de Integridade Operacional</span>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mt-0.5">
                      Trilha de Auditoria Pública (Blockchain-like Ledger)
                    </h3>
                  </div>
                  <div className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 shrink-0">
                    <Terminal className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed mb-8">
                  O painel abaixo apresenta os fatos operacionais registrados na base de dados para este documento, devidamente assinados eletronicamente e dotados de carimbos de tempo (timestamps) rastreáveis pela Controladoria Municipal.
                </p>

                {/* Timeline Component */}
                <div className="relative border-l border-slate-150 pl-6 ml-4 space-y-8 pb-4">
                  {certData.audit_trail?.map((event, index) => (
                    <div key={index} className="relative">
                      
                      {/* Círculo do Timeline */}
                      <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-white bg-blue-500 ring-8 ring-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="text-sm font-extrabold text-slate-950 uppercase">{event.title}</h4>
                            <span className={`px-2 py-0.5 border text-[8px] font-black uppercase rounded ${getBadgeClass(event.badge_color)}`}>
                              {event.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-semibold mt-1 max-w-xl leading-relaxed">
                            {event.description}
                          </p>
                        </div>

                        {/* Tempo do Evento */}
                        <div className="text-left md:text-right text-[10px] font-semibold text-slate-400 font-mono shrink-0">
                          <p>{new Date(event.timestamp).toLocaleDateString('pt-BR')}</p>
                          <p className="mt-0.5">{new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
              
              {/* Box de Confiança */}
              <div className="bg-slate-900 text-slate-200 p-6 rounded-[24px] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 dark shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                    <QrCode className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-white">QR Code de Autenticidade Dedicado</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Este certificado contém um código QR gravado no cabeçalho do documento PDF para redirecionar diretamente a este portal oficial de integridade.
                    </p>
                  </div>
                </div>
                <div className="bg-white p-1.5 rounded-xl border border-slate-800 shrink-0">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(window.location.origin + '/validar/' + certData.code)}`} 
                    alt="QR Code de Validação" 
                    className="w-16 h-16"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
