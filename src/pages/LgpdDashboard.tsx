import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  UserCheck, 
  Clock, 
  ChevronRight, 
  Eye, 
  Lock, 
  Loader2,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { api } from '../services/api';

interface ConsentState {
  lgpd_terms_accepted: boolean;
  lgpd_privacy_accepted: boolean;
  lgpd_marketing_consented: boolean;
  lgpd_treatment_consented: boolean;
}

export const LgpdDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'consents' | 'documents' | 'portability' | 'delete'>('consents');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingConsents, setSavingConsents] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportedData, setExportedData] = useState<any>(null);
  const [consents, setConsents] = useState<ConsentState>({
    lgpd_terms_accepted: false,
    lgpd_privacy_accepted: false,
    lgpd_marketing_consented: false,
    lgpd_treatment_consented: false,
  });
  
  // Account Deletion States
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  
  // Notification states
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get('/auth/me');
      setUser(data);
      setConsents({
        lgpd_terms_accepted: data.lgpd_terms_accepted || false,
        lgpd_privacy_accepted: data.lgpd_privacy_accepted || false,
        lgpd_marketing_consented: data.lgpd_marketing_consented || false,
        lgpd_treatment_consented: data.lgpd_treatment_consented || false,
      });
    } catch (err) {
      console.error('Falha ao obter perfil do usuário', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleSaveConsents = async () => {
    try {
      setSavingConsents(true);
      const res = await api.put('/auth/lgpd/consents', consents);
      setUser(res.user);
      showToast('Suas preferências de consentimento LGPD foram atualizadas e registradas em auditoria pública!');
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar os consentimentos.', 'error');
    } finally {
      setSavingConsents(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);
      const data = await api.get('/auth/lgpd/export');
      setExportedData(data);
      
      // Proporcionar o download do arquivo JSON
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(data, null, 2)
      )}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `portabilidade_dados_govviva_${user?.id}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      showToast('Relatório de Portabilidade de Dados Gerado e Baixado com Sucesso!');
    } catch (err: any) {
      showToast(err.message || 'Erro ao exportar dados.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== user?.email) {
      showToast('O e-mail digitado não coincide com sua conta cadastrada.', 'error');
      return;
    }

    try {
      setIsDeleting(true);
      await api.delete('/auth/lgpd/delete');
      showToast('Sua conta foi excluída com sucesso de forma definitiva. Redirecionando...');
      setTimeout(() => {
        localStorage.removeItem('govviva_token');
        window.location.href = '/';
      }, 3000);
    } catch (err: any) {
      showToast(err.message || 'Ocorreu um erro ao excluir a sua conta.', 'error');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-gov-blue animate-spin" id="lgpd-loading-spinner" />
        <p className="text-sm font-black uppercase text-gray-500 tracking-widest">Carregando Termas e Painel LGPD...</p>
      </div>
    );
  }

  // Not logged in view safety (in case token is missing or expired)
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex p-6 bg-amber-50 rounded-full border border-amber-100 text-amber-500 mb-6">
          <Lock className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-4">Autenticação Requerida</h2>
        <p className="text-gray-500 text-sm mb-8">
          Para gerenciar seus dados pessoais, analisar a conformidade LGPD da sua conta e baixar relatórios de portabilidade, é necessário estar conectado em sua conta única.
        </p>
        <a 
          href="/login" 
          className="inline-flex py-4 px-8 bg-gray-900 text-white rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-black transition-colors"
        >
          Ir para Login de Cidadão
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-16 animate-fade-in" id="lgpd-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border ${
              message.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-red-50 border-red-100 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <p className="text-xs font-black">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-80 bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl space-y-4 flex-shrink-0" id="lgpd-menu">
          <div className="flex items-center gap-3 pb-5 border-b border-gray-50">
            <div className="p-3 bg-gov-blue-light text-gov-blue rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-sm text-gray-900 uppercase tracking-tighter">Central LGPD</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Controle de Privacidade</p>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest pl-2">Minhas Requisições</div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('consents')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'consents'
                  ? 'bg-gov-blue-light text-gov-blue'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>Gerenciar Consentimentos</span>
              <UserCheck className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'documents'
                  ? 'bg-gov-blue-light text-gov-blue'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>Termos & Políticas</span>
              <FileText className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={() => setActiveTab('portability')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'portability'
                  ? 'bg-gov-blue-light text-gov-blue'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span>Portabilidade de Dados</span>
              <Download className="w-4 h-4 ml-2" />
            </button>

            <button
              onClick={() => setActiveTab('delete')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold text-xs uppercase tracking-wider transition-all ${
                activeTab === 'delete'
                  ? 'bg-red-50 text-red-600'
                  : 'text-red-400 hover:bg-red-50/50 hover:text-red-700'
              }`}
            >
              <span>Excluir Minha Conta</span>
              <Trash2 className="w-4 h-4 ml-2" />
            </button>
          </nav>

          <div className="pt-4 border-t border-gray-50 text-center">
            <p className="text-[10px] text-gray-400 font-bold leading-normal">
              Seu perfil de dados está hospedado de forma segura na Secretaria de Ciência e Tecnologia.
            </p>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className="flex-grow w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'consents' && (
              <motion.div
                key="consents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[32px] p-8 lg:p-10 border border-gray-100 shadow-xl space-y-8"
              >
                <div>
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Painel de Consentimento de Dados</h1>
                  <p className="text-gray-500 text-sm">
                    A Lei Geral de Proteção de Dados (LGPD) concede o direito de controlar como suas informações de cidadão são tratadas pela administração pública municipal. Ative ou revogue opcionais a qualquer momento.
                  </p>
                </div>

                {/* Audit Context Bar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                  <div className="flex gap-3 items-center">
                    <Clock className="w-5 h-5 text-gov-blue" />
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Última Validação Legal</p>
                      <p className="text-[11px] font-bold text-gray-700">
                        {user.lgpd_accepted_at ? new Date(user.lgpd_accepted_at).toLocaleString('pt-BR') : 'Requer validação instantânea'}
                      </p>
                    </div>
                  </div>
                  <div className="inline-flex px-3.5 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-700 items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Adesão Regularizada
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Mandatory consents show state */}
                  <div className="p-6 bg-gray-50 rounded-[24px] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900">Termos Gerais de Uso e Serviços Digitais</h3>
                        <span className="text-[9px] font-black bg-gov-blue-light text-gov-blue px-2 py-0.5 rounded-full uppercase tracking-wider">Obrigatório</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Permite a criação do seu perfil de cidadão único e a gravação histórica de suas interações no portal municipais.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-150 text-emerald-600 text-xs font-black uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" /> Aceito
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-[24px] border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900">Política de Privacidade de Dados</h3>
                        <span className="text-[9px] font-black bg-gov-blue-light text-gov-blue px-2 py-0.5 rounded-full uppercase tracking-wider">Obrigatório</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Autoriza o processamento e salvamento dos seus dados essenciais de cadastro, CPF e e-mail para emissão de bilhetes oficiais.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-150 text-emerald-600 text-xs font-black uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" /> Aceito
                    </div>
                  </div>

                  {/* Optional consent 1 */}
                  <div className="p-6 bg-white rounded-[24px] border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gov-blue/20 transition-all">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900">Tratamento de Dados de Impacto e Auditorias Públicas</h3>
                        <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Opcional</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Autoriza a consolidação não nominal de suas presenças técnicas para relatórios de prestação de contas, estatísticas municipais públicas e modernização dos transportes/serviços de assessoria.
                      </p>
                    </div>
                    <button
                      onClick={() => setConsents({ ...consents, lgpd_treatment_consented: !consents.lgpd_treatment_consented })}
                      className="text-gray-400 hover:text-gov-blue transition-colors flex-shrink-0"
                    >
                      {consents.lgpd_treatment_consented ? (
                        <ToggleRight className="w-14 h-8 text-gov-blue" />
                      ) : (
                        <ToggleLeft className="w-14 h-8 text-gray-300" />
                      )}
                    </button>
                  </div>

                  {/* Optional consent 2 */}
                  <div className="p-6 bg-white rounded-[24px] border border-gray-150 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gov-blue/20 transition-all">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-gray-900">Alertas Institucionais do Município</h3>
                        <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Opcional</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Permite que a prefeitura envie alertas de novas vagas em eventos públicos de cultura e ciência, atualizações de novos bilhetes disponíveis, e informativos gerais de relevância cívica direto no seu e-mail cadastrado.
                      </p>
                    </div>
                    <button
                      onClick={() => setConsents({ ...consents, lgpd_marketing_consented: !consents.lgpd_marketing_consented })}
                      className="text-gray-400 hover:text-gov-blue transition-colors flex-shrink-0"
                    >
                      {consents.lgpd_marketing_consented ? (
                        <ToggleRight className="w-14 h-8 text-gov-blue" />
                      ) : (
                        <ToggleLeft className="w-14 h-8 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                    <Info className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    Mudanças criam registros criptografados na sua trilha de auditoria
                  </div>
                  
                  <button
                    onClick={handleSaveConsents}
                    disabled={savingConsents}
                    className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white hover:bg-black rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-75 flex items-center justify-center gap-2"
                  >
                    {savingConsents ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Registrando...
                      </>
                    ) : (
                      <>
                        Salvar Consentimentos <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'documents' && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[32px] p-8 lg:p-10 border border-gray-100 shadow-xl space-y-8"
              >
                <div>
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Termos Municipais e Política de Privacidade</h1>
                  <p className="text-gray-500 text-sm">
                    Abaixo apresentamos as especificações legais sobre a coleta, armazenamento, processamento e exclusão de seus dados pessoais em nosso ecossistema municipal digital (GOVVIVA).
                  </p>
                </div>

                <div className="space-y-8">
                  {/* Terms of Use */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gov-blue" />
                      1. Termos e Condições Gerais de Uso (Versão 2.0)
                    </h3>
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-[11px] text-gray-600 h-64 overflow-y-scroll leading-relaxed space-y-4">
                      <p className="font-bold text-gray-700">1. ESCOPO DO SERVIÇO</p>
                      <p>
                        O aplicativo e portal GOVVIVA é uma plataforma pública desenvolvida pela Secretaria de Ciência e Tecnologia para fomento cívico, credenciamento em conferências oficiais, geração e validação de certificados municipais com assinaturas criptográficas nativas.
                      </p>
                      <p className="font-bold text-gray-700">2. CADASTRO DE CIDADÃO E SEGURANÇA</p>
                      <p>
                        O usuário declara ser titular legítimo das informações inseridas. O cadastro requer a coleta fundamentada do nome completo, e-mail legítimo e do CPF do cidadão para garantir a unicidade de registros e evitar fraude em repasse de carga horária formativa.
                      </p>
                      <p className="font-bold text-gray-700">3. VALIDAÇÃO GOV.BR</p>
                      <p>
                        Ao optar pelo credenciamento via GOV.BR, realizamos o consumo seguro do Authorization Flow com criptografia OIDC, coletando seu nível cadastral (Bronze, Prata ou Ouro) sem armazenar suas credenciais confidenciais de senha de rede nacional.
                      </p>
                      <p className="font-bold text-gray-700">4. ASSINATURA ELETRÔNICA E AUTENTICIDADE</p>
                      <p>
                        Todos os certificados gerados no portal possuem hash único de validação que atesta conformidade do cidadão e do órgão emissor. A prefeitura reserva o direito de auditar registros sob suspeitas de fraude ou violação física.
                      </p>
                    </div>
                  </div>

                  {/* Privacy Policy */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm uppercase tracking-wide text-gray-900 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gov-blue" />
                      2. Política de Privacidade e Proteção de Dados
                    </h3>
                    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 font-mono text-[11px] text-gray-600 h-64 overflow-y-scroll leading-relaxed space-y-4">
                      <p className="font-bold text-gray-700">1. AGENTES DE TRATAMENTO</p>
                      <p>
                        Controlador: Prefeitura Municipal de Maricá / Secretaria Municipal do Governo. <br/>
                        Operador: Departamento Municipal de Tecnologia da Informação e Inovação Pública.
                      </p>
                      <p className="font-bold text-gray-700">2. BASE LEGAL PARA O TRATAMENTO</p>
                      <p>
                        O tratamento de dados pessoais de CPF, presenças e registros civis baseia-se estritamente no Artigo 7º, Inciso III, e no Artigo 23 da Lei nº 13.709/2018 (LGPD), sendo efetuado para a execução de políticas públicas previstas na lei municipal de incentivo à cidadania ativa.
                      </p>
                      <p className="font-bold text-gray-700">3. ARMAZENAMENTO E SEGURANÇA DE REDE</p>
                      <p>
                        Seus dados são salvos em banco de dados isolados, com proteção por tokens JWT com tempo de expiração padrão de 24 horas, garantindo confidencialidade. Nenhuma senha original de cidadão é guardada sem o algoritmo BCrypt com salt dinâmico.
                      </p>
                      <p className="font-bold text-gray-700 font-black text-rose-600">4. DIREITOS DO TITULAR (ARTIGO 18 DA LGPD)</p>
                      <p>
                        O cidadão goza plenamente do direito de confirmação de existência do tratamento, acesso simples a relatórios estruturados de portabilidade, correção de dados, e revogação irrevogável das informações mediante exclusão total de sua conta.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'portability' && (
              <motion.div
                key="portability"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[32px] p-8 lg:p-10 border border-gray-100 shadow-xl space-y-8"
              >
                <div>
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-2">Relatório de Portabilidade / Livre Acesso</h1>
                  <p className="text-gray-500 text-sm">
                    Baixe uma cópia criptográfica legível de todas as informações que o município detém associadas ao seu CPF e e-mail. Este direito é facultado nos termos do Artigo 18, Inciso V da LGPD.
                  </p>
                </div>

                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4 items-start">
                  <Info className="w-5 h-5 text-gov-blue mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gov-blue-dark">O que está contido no arquivo estruturado?</p>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      O arquivo compactará seus dados de perfil cadastral, logins registrados, histórico completo de auditoria no portal, inscrições ativas e canceladas em eventos do município, bem como registros de presenças individuais já avaliados.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Download className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-xs font-bold text-gray-700 mb-1">Portabilidade de Dados Pessoais (JSON)</p>
                  <p className="text-[10px] text-gray-400 font-bold mb-6">Padrão estruturado em conformidade com o Artigo 18 da LGPD</p>

                  <button
                    onClick={handleExportData}
                    disabled={exporting}
                    className="px-6 py-4 bg-gray-900 text-white hover:bg-black rounded-2xl text-[11px] font-black uppercase tracking-widest active:scale-95 disabled:opacity-70 transition-all flex items-center justify-center gap-3"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Compilando Servidores...
                      </>
                    ) : (
                      <>
                        Exportar Meus Dados <Download className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Inspecting state on-screen */}
                {exportedData && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-1 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gov-blue" />
                      Visualização do Relatório Estruturado
                    </p>
                    <pre className="p-6 bg-gray-950 text-emerald-400 rounded-2xl font-mono text-[10px] max-h-80 overflow-y-scroll shadow-inner">
                      {JSON.stringify(exportedData, null, 2)}
                    </pre>
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === 'delete' && (
              <motion.div
                key="delete"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[32px] p-8 lg:p-10 border border-gray-100 shadow-xl space-y-8"
              >
                <div>
                  <h1 className="text-2xl font-black text-rose-600 uppercase tracking-tight mb-2">Exclusão Permanente de Conta</h1>
                  <p className="text-gray-500 text-sm">
                    O Artigo 18, Inciso VI da LGPD garante-lhe o direito à eliminação total de seus dados pessoais tratados com base no consentimento. Esta ação é estrita e irreversível.
                  </p>
                </div>

                {/* Warning Card */}
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl space-y-4">
                  <div className="flex gap-3 items-center">
                    <AlertTriangle className="w-6 h-6 text-rose-600 flex-shrink-0" />
                    <h3 className="font-extrabold text-sm text-rose-800">ATENÇÃO: CONSEQUÊNCIAS IRREVERSÍVEIS</h3>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-rose-700 leading-relaxed space-y-2 font-medium">
                    <li>Você perderá acesso imediato e irrevogável ao seu portal de cadastro cidadão.</li>
                    <li>Todas as suas inscrições confirmadas para eventos municipais serão canceladas, e suas vagas devolvidas à comunidade.</li>
                    <li>Registros de presença de auditoria e seus certificados de participação ativos serão desativados e permanentemente deletados.</li>
                    <li>Isso constitui a aplicação plena do direito à exclusão e purga total ("direito ao esquecimento") dos servidores ativos.</li>
                  </ul>
                </div>

                {deleteStep === 1 ? (
                  <div className="pt-4 flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-150">
                    <div>
                      <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1">Entendo os termos descritos acima</p>
                      <p className="text-xs text-gray-600 font-bold">Desejo progredir para a etapa de dupla confirmação de exclusão do cidadão.</p>
                    </div>
                    <button
                      onClick={() => setDeleteStep(2)}
                      className="px-6 py-4 bg-rose-600 text-white hover:bg-rose-700 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-colors active:scale-95 flex items-center gap-2"
                    >
                      Avançar <ChevronRight className="w-4 h-4 animate-pulse" />
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 pt-4 border-t border-gray-100"
                  >
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 block">
                        Confirme seu endereço de e-mail cadastrado
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Para confirmar a exclusão e auditar a titularidade de sua identidade, por favor digite exatamente o seu endereço de e-mail <strong className="text-gray-900 select-all">{user?.email}</strong>.
                      </p>
                      <div className="relative group">
                        <input
                          type="email"
                          className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-rose-500/5 focus:border-rose-500/30 outline-none transition-all font-semibold text-gray-700 placeholder:text-gray-300"
                          placeholder="Digite seu e-mail completo para validar"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end items-center gap-3">
                      <button
                        onClick={() => {
                          setDeleteStep(1);
                          setDeleteConfirmText('');
                        }}
                        className="w-full sm:w-auto px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-800 transition-colors"
                      >
                        Cancelar Exclusão
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting || deleteConfirmText !== user?.email}
                        className="w-full sm:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-rose-200/50"
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" /> Expulsando Registros...
                          </>
                        ) : (
                          <>
                            Excluir Integralmente <Trash2 className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
