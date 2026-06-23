import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  Fingerprint,
  Info,
  Globe,
  Award,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export const Login: React.FC = () => {
  const { login, loginWithGovBr } = useAuth();
  const navigate = useNavigate();
  
  // Standard Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GOV.BR Future Integration Simulator State
  const [showGovBrSimulator, setShowGovBrSimulator] = useState(false);
  const [govName, setGovName] = useState('');
  const [govEmail, setGovEmail] = useState('');
  const [govCpf, setGovCpf] = useState('');
  const [govLevel, setGovLevel] = useState<'BRONZE' | 'SILVER' | 'GOLD'>('SILVER');
  const [govLoading, setGovLoading] = useState(false);
  const [govError, setGovError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleGovBrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!govName || !govEmail || !govCpf) {
      setGovError('Por favor, preencha todos os campos obrigatórios do cidadão.');
      return;
    }

    setGovLoading(true);
    setGovError(null);

    try {
      await loginWithGovBr(govName, govEmail, govCpf, govLevel);
      setShowGovBrSimulator(false);
      navigate('/');
    } catch (err: any) {
      setGovError(err.message || 'Falha ao processar simulação de login com GOV.BR.');
    } finally {
      setGovLoading(false);
    }
  };

  // Helper to pre-populate mock citizen data for instant evaluation
  const loadPreset = (presetType: 'BRONZE' | 'SILVER' | 'GOLD') => {
    setGovLevel(presetType);
    if (presetType === 'GOLD') {
      setGovName('Carlos Alberto de Souza');
      setGovEmail('carlos.souza@gold.gov.br');
      setGovCpf('112.554.887-09');
    } else if (presetType === 'SILVER') {
      setGovName('Mariana Ferreira Lima');
      setGovEmail('mariana.lima@silver.gov.br');
      setGovCpf('445.667.112-88');
    } else {
      setGovName('Roberto Alves Cruz');
      setGovEmail('roberto.cruz@bronze.gov.br');
      setGovCpf('889.332.115-44');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in relative">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gov-blue"></div>
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gov-blue-light rounded-2xl mb-6 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-gov-blue" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Portal do Cidadão</h1>
            <p className="text-gray-400 font-medium text-sm px-4">Acesse sua conta única para gerenciar inscrições e certificados oficiais.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-700">{error}</p>
            </div>
          )}

          {/* Formulário Tradicional */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gov-blue transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Senha de Acesso</label>
                <Link
                  to="/forgot-password"
                  className="text-[10px] font-black text-gov-blue uppercase tracking-wider hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gov-blue transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gov-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-gov-blue-dark transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 transform hover:-translate-y-1"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar no Sistema
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divisor GOV.BR */}
          <div className="my-8 flex items-center justify-center gap-3">
            <span className="h-[1px] w-full bg-gray-150"></span>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest shrink-0">Ou integre via</span>
            <span className="h-[1px] w-full bg-gray-150"></span>
          </div>

          {/* Botão de Integração gov.br */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowGovBrSimulator(true)}
              className="w-full py-4.5 bg-[#1351b4] text-white hover:bg-[#0c3c88] transition-all duration-200 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-lg shadow-blue-500/15 group relative overflow-hidden"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
              <Globe className="w-4.5 h-4.5 text-emerald-300 animate-pulse" />
              <span>Entrar com <span className="text-emerald-300">gov.br</span></span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-bold">
              <Fingerprint className="w-3.5 h-3.5 text-gov-blue" />
              <span>Acesso seguro com Identidade Federal única</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-450 font-semibold">Ainda não possui cadastro?</p>
            <Link
              to="/register"
              className="mt-1.5 inline-block text-gov-blue font-black uppercase tracking-widest text-[10px] hover:underline"
            >
              Criar Conta Cidadão Agora
            </Link>
          </div>

          {/* Aviso de Conformidade LGPD no Login */}
          <div className="mt-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
              🔒 Autenticação segura e auditada em conformidade com a <strong>LGPD (Lei nº 13.709/2018)</strong>. Gerencie seus consentimentos na Central de Privacidade.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.3em]">
          &copy; 2026 GOVVIVA - Segurança e Transparência
        </div>
      </div>

      {/* MODAL SIMULADOR GOV.BR INTEGRADO (Arquitetura Compatível) */}
      {showGovBrSimulator && (
        <div className="fixed inset-0 bg-gray-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[36px] shadow-3xl max-w-lg w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Cabeçalho do Simulador de Integração */}
            <div className="bg-[#1351b4] p-8 text-white relative">
              <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                Ambiente de Arquitetura e Engenharia
              </div>
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-6 h-6 text-emerald-300 shrink-0" />
                <span className="font-extrabold text-sm opacity-90 uppercase tracking-widest text-emerald-300">gov.br</span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-2">Simulador de Provedor Federated SSO</h3>
              <p className="text-xs text-blue-100 font-medium leading-relaxed">
                Este painel simula a troca estrutural de claims (OpenID Connect com PKCE) e os metadados do cidadão que alimentarão o banco de dados oficial do GOVVIVA no futuro.
              </p>
            </div>

            {/* Corpo do Cadastro/Login GOV.BR */}
            <form onSubmit={handleGovBrSubmit} className="p-8 space-y-6">
              
              {/* Seletor de Níveis de Segurança */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-gray-150">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-3">
                  1. Escolha o Nível de Verificação da Conta (Claims)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'GOLD', label: 'OURO', color: 'border-yellow-500 text-yellow-700 bg-yellow-50 text-yellow-600' },
                    { key: 'SILVER', label: 'PRATA', color: 'border-slate-300 text-slate-700 bg-slate-50 text-slate-500' },
                    { key: 'BRONZE', label: 'BRONZE', color: 'border-amber-600 text-amber-800 bg-amber-50 text-amber-700' }
                  ].map((lvl) => (
                    <button
                      key={lvl.key}
                      type="button"
                      onClick={() => loadPreset(lvl.key as any)}
                      className={`py-3.5 px-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 text-center transition-all ${
                        govLevel === lvl.key 
                          ? `${lvl.key === 'GOLD' ? 'border-amber-400 bg-amber-50 text-amber-800 ring-4 ring-amber-400/10' : lvl.key === 'SILVER' ? 'border-blue-500 bg-blue-50 text-blue-800 ring-4 ring-blue-500/10' : 'border-orange-500 bg-orange-50 text-orange-900 ring-4 ring-orange-500/10'}`
                          : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-[8px] opacity-75 font-bold">Nível</span>
                      {lvl.label}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-400 mt-3 font-semibold flex items-start gap-1">
                  <Info className="w-3 h-3 text-[#1351b4] shrink-0 mt-0.5" />
                  <span>
                    Contas <strong>Prata</strong> e <strong>Ouro</strong> possuem validação facial ou bancária, qualificando o cidadão para obtenção instantânea de certificados sem revisão de auditoria.
                  </span>
                </p>
              </div>

              {/* Botões rápidos de presets estatísticos */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider shrink-0">Dados de Teste instantâneos:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => loadPreset('GOLD')}
                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-[9px] font-bold border border-amber-200"
                  >
                    Carlos (Ouro)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => loadPreset('SILVER')}
                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[9px] font-bold border border-blue-200"
                  >
                    Mariana (Prata)
                  </button>
                  <button 
                    type="button" 
                    onClick={() => loadPreset('BRONZE')}
                    className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-[9px] font-bold border border-orange-200"
                  >
                    Roberto (Bronze)
                  </button>
                </div>
              </div>

              {govError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-[11px] font-bold text-red-700">{govError}</p>
                </div>
              )}

              {/* Campos das claims mapeadas */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo (Mapeado da Receita Federal)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl font-bold text-xs text-gray-700 outline-none focus:border-[#1351b4] focus:bg-white"
                    placeholder="Nome Completo do Cidadão"
                    value={govName}
                    onChange={(e) => setGovName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail de Contato</label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl font-bold text-xs text-gray-700 outline-none focus:border-[#1351b4] focus:bg-white"
                      placeholder="cidadao@provedor.com"
                      value={govEmail}
                      onChange={(e) => setGovEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">CPF (Chave Única)</label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl font-bold text-xs text-gray-700 outline-none focus:border-[#1351b4] focus:bg-white"
                      placeholder="000.000.000-00"
                      value={govCpf}
                      onChange={(e) => setGovCpf(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGovBrSimulator(false)}
                  className="flex-1 py-4.5 bg-gray-100 hover:bg-gray-200 text-gray-650 font-bold uppercase tracking-widest text-[10px] rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={govLoading}
                  className="flex-1.5 py-4.5 bg-[#1351b4] hover:bg-[#0c3c88] text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/15"
                >
                  {govLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Autorizar e Entrar
                      <CheckCircle className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};
