import React, { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { 
  FileCheck, 
  Search, 
  Download, 
  Printer, 
  Calendar, 
  Award, 
  Clock, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw,
  Clock3,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

export const Certificates: React.FC = () => {
  const { user } = useAuth();
  
  // Tabs: 'citizen' (My Certs), 'validate' (Verification / Public), 'admin' (Admin History)
  const [activeTab, setActiveTab] = useState<'citizen' | 'validate' | 'admin'>('validate');

  // Meus Certificados (Cidadão)
  const [myCertificates, setMyCertificates] = useState<any[]>([]);
  const [loadingCitizen, setLoadingCitizen] = useState(false);

  // Validador Público
  const [searchCode, setSearchCode] = useState('');
  const [validatedCert, setValidatedCert] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingValidation, setLoadingValidation] = useState(false);

  // Exibição do PDF / Impressão no Modal
  const [selectedCertForPrint, setSelectedCertForPrint] = useState<any | null>(null);

  // Admin Histórico
  const [adminCerts, setAdminCerts] = useState<any[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

  const fetchMyCertificates = useCallback(async () => {
    try {
      setLoadingCitizen(true);
      const data = await api.get('/certificates/my');
      setMyCertificates(data || []);
    } catch (err) {
      console.error('Erro ao carregar meus certificados', err);
    } finally {
      setLoadingCitizen(false);
    }
  }, []);

  const fetchAdminCertificates = useCallback(async () => {
    try {
      setLoadingAdmin(true);
      const data = await api.get('/certificates/admin/all');
      setAdminCerts(data || []);
    } catch (err) {
      console.error('Erro ao carregar histórico administrativo', err);
    } finally {
      setLoadingAdmin(false);
    }
  }, []);

  // Seleciona a aba inicial amigável dependendo se logado ou se há query parameter no QR code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('query') || params.get('code');
    
    if (codeParam) {
      setActiveTab('validate');
      setSearchCode(codeParam);
      // Dispara validação automática
      setTimeout(() => {
        handleValidate(codeParam);
      }, 100);
    } else if (user) {
      if (user.role === 'ADMIN') {
        setActiveTab('admin');
        fetchAdminCertificates();
      } else {
        setActiveTab('citizen');
        fetchMyCertificates();
      }
    } else {
      setActiveTab('validate');
    }
  }, [user, fetchMyCertificates, fetchAdminCertificates]);

  const handleValidate = async (codeToQuery?: string) => {
    const code = codeToQuery || searchCode.trim();
    if (!code) return;

    try {
      setLoadingValidation(true);
      setValidationError(null);
      setValidatedCert(null);
      
      const res = await api.get(`/certificates/validate/${code}`);
      setValidatedCert(res);
      setSelectedCertForPrint(res); // Abre o visualizador se for consulta com sucesso
    } catch (err: any) {
      if (err.status === 403) {
        // Objeto que indica expiração de 30 dias público
        setValidationError(err.message || 'O prazo de visualização pública deste certificado expirou. (Limite legal de 30 dias)');
        setValidatedCert({
          is_expired: true,
          code: code,
          user_name: err.user_name || 'Participante Registrado',
          event_title: err.event_title || 'Atividade Homologada',
          org_responsible: err.org_responsible || 'Secretaria do Evento'
        });
      } else {
        setValidationError(err.message || 'Código de certificado inválido ou inexistente.');
      }
    } finally {
      setLoadingValidation(false);
    }
  };

  const handleReactivate = async (certId: number) => {
    try {
      const res = await api.post('/certificates/admin/reactivate', { certificate_id: certId });
      alert(res.message || 'Certificado reativado por mais 30 dias!');
      fetchAdminCertificates();
    } catch (err: any) {
      alert(err.message || 'Falha ao reativar certificado.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtrar certificados na aba administrativa
  const filteredAdminCerts = adminCerts.filter(c => 
    c.code.toLowerCase().includes(adminSearch.toLowerCase()) ||
    c.user.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
    c.event.title.toLowerCase().includes(adminSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-12 pb-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gov-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-gov-blue uppercase tracking-[0.3em]">Autenticação de Aptidão</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                Certificados <span className="text-gov-blue">Digitais GOVVIVA</span>
              </h1>
              <p className="text-gray-400 font-medium mt-4 max-w-xl">
                Emissão instantânea, homologação municipal com QR Code certificado e histórico completo de participação.
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-4 mt-12 border-b border-gray-100 pb-0">
            <button 
              onClick={() => {
                setActiveTab('validate');
                setValidatedCert(null);
                setValidationError(null);
              }}
              className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'validate' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              Validar Certificado
            </button>

            {user && user.role !== 'ADMIN' && (
              <button 
                onClick={() => {
                  setActiveTab('citizen');
                  fetchMyCertificates();
                }}
                className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'citizen' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Meus Certificados ({myCertificates.length || 0})
              </button>
            )}

            {user && user.role === 'ADMIN' && (
              <button 
                onClick={() => {
                  setActiveTab('admin');
                  fetchAdminCertificates();
                }}
                className={`pb-4 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'admin' ? 'border-gov-blue text-gov-blue' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
              >
                Livro de Registro Geral (Admin)
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:p-0">
        {/* Aba Validador Público */}
        {activeTab === 'validate' && (
          <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 print:hidden">
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-blue-50 text-gov-blue rounded-3xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Validação Municipal Oficial</h2>
              <p className="text-gray-400 text-sm mt-2">
                Qualquer entidade, universidade ou contratante pode auditar a veracidade do certificado informando o protocolo único da prefeitura.
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gov-blue uppercase tracking-widest mb-3 pl-1">
                  Código de Autenticação Único
                </label>
                <div className="flex gap-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      type="text" 
                      placeholder="Ex: GOV-CERT-A1B2C3D4"
                      className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-2xl text-sm font-bold uppercase placeholder:normal-case focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleValidate(); }}
                    />
                  </div>
                  <button 
                    onClick={() => handleValidate()}
                    disabled={loadingValidation || !searchCode.trim()}
                    className="bg-gov-blue text-white hover:bg-gov-blue-dark px-8 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loadingValidation ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : 'Validar'}
                  </button>
                </div>
              </div>

              {/* Erro de Validação ou Publicidade de 30 dias Expirada */}
              {validationError && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-[24px] space-y-4 animate-in fade-in duration-200">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-black text-red-950 uppercase">Validação Restrita</h4>
                      <p className="text-xs text-red-700 leading-relaxed mt-1">{validationError}</p>
                    </div>
                  </div>

                  {validatedCert?.is_expired && (
                    <div className="mt-4 pt-4 border-t border-red-100 bg-white p-5 rounded-2xl space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Informações Preservadas</p>
                      <p className="text-xs text-gray-900"><strong>Cidadão:</strong> {validatedCert.user_name}</p>
                      <p className="text-xs text-gray-900"><strong>Atividade:</strong> {validatedCert.event_title}</p>
                      <p className="text-xs text-gray-900"><strong>Responsável:</strong> {validatedCert.org_responsible}</p>
                      
                      <div className="flex items-center gap-2 mt-4 text-[10px] bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-100 font-bold">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        <span>A visualização pública expira após 30 dias por razões de privacidade. Emissores podem solicitar reativação administrativa.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba Meu Painel (Cidadão) */}
        {activeTab === 'citizen' && (
          <div className="space-y-8 animate-in fade-in duration-200 print:hidden">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Meus Diplomas e Capacitações</h2>
            
            {loadingCitizen ? (
              <div className="py-20 text-center text-gray-400 font-bold">
                Buscando histórico na base de dados municipal...
              </div>
            ) : myCertificates.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-[32px] border border-gray-100">
                <Award className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-gray-900 uppercase">Nenhum certificado disponível</h3>
                <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto leading-relaxed">
                  Os certificados digitais oficiais são expedidos imediatamente ao atingir 100% de presença nas atividades municipais. Acompanhe suas frequências nas inscrições.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {myCertificates.map((item) => (
                  <div 
                    key={item.certificate.id}
                    className="bg-white rounded-[32px] p-8 border border-gray-100 hover:border-gray-200 transition-all flex flex-col justify-between shadow-sm relative group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <span className="px-3.5 py-1 bg-gov-blue-light text-gov-blue text-[9px] font-black tracking-widest uppercase rounded-lg border border-blue-50">
                          {item.event.category}
                        </span>
                        
                        {item.expiration.is_expired ? (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black tracking-widest uppercase rounded-md border border-red-100">
                            PÚBLICO EXPIRADO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black tracking-widest uppercase rounded-md border border-emerald-100 flex items-center gap-1">
                            <Clock3 className="w-2.5 h-2.5" /> {item.expiration.remaining_days} dias restantes
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight leading-tight group-hover:text-gov-blue transition-colors">
                        {item.event.title}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-2 tracking-wider">CÓD: {item.certificate.code}</p>

                      <div className="mt-6 space-y-3 pt-6 border-t border-gray-100 text-xs font-bold text-gray-500">
                        <p className="flex justify-between">
                          <span className="text-gray-300 uppercase tracking-wider text-[9px]">Participante:</span>
                          <span className="text-gray-800">{item.user_name} (CPF: {item.masked_cpf})</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-300 uppercase tracking-wider text-[9px]">Carga Horária:</span>
                          <span className="text-gray-800">{item.event.workload || 4} Horas Aula</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-gray-300 uppercase tracking-wider text-[9px]">Expedido em:</span>
                          <span className="text-gray-800">{new Date(item.certificate.issued_at).toLocaleDateString('pt-BR')}</span>
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 flex gap-4 w-full">
                      {item.expiration.is_expired ? (
                        <div className="w-full text-center p-3 bg-red-50 text-red-700 text-[10px] font-bold rounded-xl border border-red-100 leading-tight">
                          Prazo de download público expirado. Entre em contato com a Prefeitura se precisar da reativação deste certificado.
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setSelectedCertForPrint(item);
                          }}
                          className="w-full py-4 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                        >
                          <Printer className="w-4 h-4" /> Visualizar e Imprimir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Aba Administrativa */}
        {activeTab === 'admin' && (
          <div className="space-y-8 animate-in fade-in duration-200 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Livro de Homologação Municipal</h2>
                <p className="text-sm text-gray-400">Controle completo de documentos expedidos e chaves públicas de certificação.</p>
              </div>

              <div className="relative w-full md:w-96">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Pesquisar por cidadão ou código..."
                  className="w-full pl-14 pr-6 py-3.5 bg-white border border-gray-150 rounded-2xl text-xs font-bold uppercase focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none shadow-sm"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
              </div>
            </div>

            {loadingAdmin ? (
              <div className="py-20 text-center text-gray-400 font-bold">
                Carregando registros e assinaturas digitais...
              </div>
            ) : filteredAdminCerts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-[32px] border border-gray-100">
                <AwardsEmptyState />
              </div>
            ) : (
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Código</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cidadão / CPF</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Capacitação / Evento</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Carga</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Expiração</th>
                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Controle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredAdminCerts.map((c) => (
                        <tr key={c.certificate_id} className="hover:bg-gray-50/30 transition-all text-xs">
                          <td className="px-10 py-6 font-mono font-bold text-gray-900 uppercase select-all">
                            {c.code}
                          </td>
                          <td className="px-10 py-6">
                            <div>
                              <p className="font-extrabold text-gray-900 uppercase">{c.user.name}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">CPF: {c.user.cpf || 'Não informado'}</p>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div>
                              <p className="font-extrabold text-gray-900 uppercase line-clamp-1">{c.event.title}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{c.event.org_responsible}</p>
                            </div>
                          </td>
                          <td className="px-10 py-6 font-mono font-bold text-gray-700">
                            {c.event.workload || 4}h
                          </td>
                          <td className="px-10 py-6">
                            {c.is_expired ? (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black tracking-widest uppercase rounded-md border border-red-100">
                                EXPIRADO (30d)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black tracking-widest uppercase rounded-md border border-emerald-100">
                                ATIVO ({c.remaining_days}d)
                              </span>
                            )}
                          </td>
                          <td className="px-10 py-6 text-right space-x-2">
                            <button 
                              onClick={() => {
                                handleValidate(c.code);
                              }}
                              className="px-3 py-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                            >
                              Visualizar
                            </button>

                            {c.is_expired && (
                              <button 
                                onClick={() => handleReactivate(c.certificate_id)}
                                className="px-3 py-1.5 bg-gov-blue text-white hover:bg-gov-blue-dark rounded-lg text-[9px] font-black uppercase tracking-wider transition-all"
                              >
                                Reativar +30d
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visualizador de Alta Fidelidade / Modal de Impressão (Fundo Branco Padrão do Diploma) */}
      {selectedCertForPrint && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 overflow-y-auto print:static print:p-0 print:z-0 print:bg-white print:overflow-visible">
          <div className="absolute inset-0 bg-gov-blue-dark/50 backdrop-blur-md print:hidden" onClick={() => setSelectedCertForPrint(null)} />
          
          <div className="bg-white w-full max-w-5xl rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 my-8 p-1 md:p-4 print:my-0 print:rounded-none print:shadow-none print:p-0 print:max-w-none print:w-full print:bg-white">
            {/* Controles do visualizador */}
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between print:hidden">
              <div>
                <p className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Homologação Digital</p>
                <h3 className="text-lg font-black text-gray-950 uppercase tracking-tighter">Certificado Oficial Lavrado</h3>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handlePrint}
                  className="px-6 py-3 bg-gov-blue text-white hover:bg-gov-blue-dark rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Imprimir / PDF
                </button>
                <button 
                  onClick={() => setSelectedCertForPrint(null)}
                  className="px-5 py-3 bg-white text-gray-400 hover:text-gray-900 border border-gray-150 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Layout do Certificado de Alta Fidelidade (Impressão Perfeita) */}
            <div className="bg-white p-6 md:p-16 relative border-8 border-double border-gov-blue m-2 md:m-6 rounded-[24px] print:m-0 print:border-8 print:p-8 print:rounded-none">
              
              {/* Adornos Clássicos de Diploma nos cantos */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-gov-blue print:top-2 print:left-2" />
              <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-gov-blue print:top-2 print:right-2" />
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-gov-blue print:bottom-2 print:left-2" />
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-gov-blue print:bottom-2 print:right-2" />

              {/* Cabeçalho Institucional do Munícipio */}
              <div className="text-center mb-10 md:mb-14">
                {/* Brasão Simbólico Municipal */}
                <div className="w-16 h-16 bg-gov-blue text-white rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl ring-2 ring-gov-blue print:shadow-none">
                  <Award className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-black text-gov-blue uppercase tracking-[0.3em] leading-none mb-1">MUNICÍPIO DE MARICÁ</h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedCertForPrint.event?.org_responsible || 'PORTAL GOVVIVA DE ATIVIDADES'}</p>
                <div className="w-32 h-0.5 bg-gov-blue/20 mx-auto mt-4" />
              </div>

              {/* Corpo do Diploma */}
              <div className="text-center space-y-6 md:space-y-8">
                <h1 className="text-3xl md:text-5xl font-black text-gov-blue italic tracking-tighter uppercase mb-6">CERTIFICADO DE CAPACITAÇÃO</h1>
                
                <p className="text-sm md:text-lg text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
                  A prefeitura municipal confere a outorga eletrônica oficial declarando que o cidadão(ã) 
                  <strong className="text-gray-950 block text-2xl md:text-3xl font-black uppercase tracking-tight mt-3 mb-1 font-serif">
                    {selectedCertForPrint.user_name || selectedCertForPrint.user?.name}
                  </strong>
                  portador do CPF sob máscara <strong className="text-gray-900 font-mono font-bold">{selectedCertForPrint.masked_cpf || selectedCertForPrint.user?.masked_cpf}</strong>, 
                  completou com aproveitamento de <strong className="text-gov-blue font-black">100% de frequência</strong> regulamentada por controle de passaporte eletrônico, a atividade e qualificação profissional de:
                </p>

                <div className="bg-gray-50/50 border border-gray-100 p-6 md:p-8 rounded-[24px] max-w-3xl mx-auto print:border print:bg-white">
                  <h2 className="text-lg md:text-xl font-black text-gray-900 uppercase tracking-tight leading-snug">
                    {selectedCertForPrint.event?.title}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-wider mt-2">
                    Categoria: {selectedCertForPrint.event?.category} | Carga Horária de <span className="text-gov-blue font-black">{selectedCertForPrint.event?.workload || 4} Horas Aula</span>
                  </p>
                </div>

                <p className="text-xs md:text-sm text-gray-400 mt-6 font-medium">
                  Atividade realizada em {new Date(selectedCertForPrint.event?.date_start || selectedCertForPrint.certificate?.issued_at).toLocaleDateString('pt-BR')} no local {selectedCertForPrint.event?.location}.
                </p>
              </div>

              {/* Selo, Data e Assinaturas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-14 pt-8 border-t border-gray-100 items-center">
                {/* QR Code de Validação Público */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-none">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(window.location.origin + '/validar/' + (selectedCertForPrint.certificate?.code || selectedCertForPrint.code))}`} 
                      alt="QR Code de Validação de Certificado" 
                      referrerPolicy="no-referrer"
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 font-bold mt-2 uppercase tracking-wide">LEIA PARA CONFIRMAR AUTENTICIDADE</p>
                </div>

                {/* Chave Criptográfica */}
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 bg-blue-50/50 rounded-2xl border border-blue-100 print:border">
                    <p className="text-[10px] font-black text-gov-blue uppercase tracking-widest mb-1">PROTOCOLO DE HOMOLOGAÇÃO</p>
                    <p className="text-xs font-mono font-bold text-gray-900 uppercase select-all">{selectedCertForPrint.certificate?.code || selectedCertForPrint.code}</p>
                    <p className="text-[9px] font-mono text-gray-400 mt-1 uppercase select-all tracking-wider">SIGN: {selectedCertForPrint.certificate?.hash_verification?.substring(0, 16) || selectedCertForPrint.hash_verification?.substring(0, 16)}...</p>
                  </div>
                </div>

                {/* Assinatura Simbólica do Secretário */}
                <div className="text-center md:text-right flex flex-col items-center md:items-end">
                  <div className="w-48 border-b border-gray-300 pb-2 text-center">
                    <p className="font-serif italic text-gray-400 text-sm select-none">Prefeitura de Maricá</p>
                  </div>
                  <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest mt-2">{selectedCertForPrint.event?.org_responsible}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">ÓRGÃO DE CERTIFICAÇÃO EM ATIVIDADES</p>
                </div>
              </div>

              {/* Nota Legal */}
              <div className="text-center text-[9px] text-gray-300 font-mono mt-12 uppercase tracking-widest leading-relaxed">
                Este diploma tem amparo na lei organica municipal. Para fins de auditoria, os dados deste certificado são vitalícios para consulta da prefeitura, tendo validade pública no portal eletrônico por 30 dias contados da expedição automática.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AwardsEmptyState: React.FC = () => {
  return (
    <div className="py-20 text-center">
      <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
        <Award className="w-10 h-10 text-gray-200" />
      </div>
      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Sem Certificados Lavrados</h3>
      <p className="text-gray-400 font-medium mt-2 tracking-tight">O livro eletrônico de registro municipal está limpo.</p>
    </div>
  );
};
