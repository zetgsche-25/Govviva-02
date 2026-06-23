import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { User as UserIcon, Mail, Lock, CheckCircle2, Loader2, ArrowLeft, AlertCircle, MapPin } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CITIZEN',
    bairro: 'Centro',
    lgpd_terms_accepted: false,
    lgpd_privacy_accepted: false,
    lgpd_marketing_consented: false,
    lgpd_treatment_consented: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lgpd_terms_accepted || !formData.lgpd_privacy_accepted) {
      setError('É obrigatório consentir com os Termos de Uso e a Política de Privacidade para prosseguir.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-xl w-full">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gov-blue"></div>
          
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gov-blue transition-colors text-[10px] font-black uppercase tracking-widest mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Login
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Conta Única</h1>
            <p className="text-gray-400 font-medium text-sm px-4">Cadastre-se para ter acesso pleno aos serviços digitais em conformidade estrita com a LGPD.</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo Oficial</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gov-blue transition-colors" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail para Notificações</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gov-blue transition-colors" />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                  placeholder="exemplo@provedor.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bairro de Residência (Maricá)</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gov-blue transition-colors z-10" />
                <select
                  required
                  className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-700 cursor-pointer appearance-none relative"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                >
                  <option value="Centro">Centro</option>
                  <option value="Itaipuaçu">Itaipuaçu</option>
                  <option value="Ponta Negra">Ponta Negra</option>
                  <option value="Inoã">Inoã</option>
                  <option value="Barra de Maricá">Barra de Maricá</option>
                  <option value="São José do Imbassaí">São José do Imbassaí</option>
                  <option value="Cordeirinho">Cordeirinho</option>
                  <option value="Mumbuca">Mumbuca</option>
                  <option value="Araçatiba">Araçatiba</option>
                  <option value="Jaconé">Jaconé</option>
                  <option value="Flamengo">Flamengo</option>
                  <option value="Ubatiba">Ubatiba</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Crie uma Senha Forte</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gov-blue transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* LGPD Regs Section */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Termos & Garantias Legais (LGPD)
              </p>

              <div className="space-y-3">
                <label className="flex gap-3 items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-gov-blue focus:ring-gov-blue/25 w-4.5 h-4.5 accent-gov-blue"
                    checked={formData.lgpd_terms_accepted}
                    onChange={(e) => setFormData({ ...formData, lgpd_terms_accepted: e.target.checked })}
                  />
                  <span className="text-xs text-gray-500 font-bold leading-normal">
                    Li e aceito voluntariamente os{' '}
                    <button 
                      type="button"
                      onClick={() => setShowTerms(!showTerms)}
                      className="underline text-gov-blue font-black hover:text-blue-800"
                    >
                      Termos de Uso
                    </button>{' '}
                    da plataforma GOVVIVA. *
                  </span>
                </label>

                {showTerms && (
                  <div className="p-4 bg-white rounded-xl border border-gray-150 text-[10px] text-gray-500 leading-relaxed font-mono h-32 overflow-y-scroll animate-in fade-in slide-in-from-top-1">
                    <p className="font-bold text-gray-700 mb-1">TERMO DE USO GOVVIVA</p>
                    <p>O aplicativo gerencia dados pessoais para atestado cívico municipal, controle de integridade de cargas formativas e geração de relatórios de auditoria e escabilidade.</p>
                    <p className="mt-2">Seus dados de CPF e endereço de rede (IP) são processados com foco na unicidade e combate a fraudes de emissão pública de certificados, não sendo passíveis de cessão financeira comercial.</p>
                  </div>
                )}

                <label className="flex gap-3 items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-gov-blue focus:ring-gov-blue/25 w-4.5 h-4.5 accent-gov-blue"
                    checked={formData.lgpd_privacy_accepted}
                    onChange={(e) => setFormData({ ...formData, lgpd_privacy_accepted: e.target.checked })}
                  />
                  <span className="text-xs text-gray-500 font-bold leading-normal">
                    Autorizo o tratamento de dados pessoais segundo a{' '}
                    <button
                      type="button" 
                      onClick={() => setShowPrivacy(!showPrivacy)}
                      className="underline text-gov-blue font-black hover:text-blue-800"
                    >
                      Política de Privacidade
                    </button>. *
                  </span>
                </label>

                {showPrivacy && (
                  <div className="p-4 bg-white rounded-xl border border-gray-150 text-[10px] text-gray-500 leading-relaxed font-mono h-32 overflow-y-scroll animate-in fade-in slide-in-from-top-1">
                    <p className="font-bold text-gray-700 mb-1">POLÍTICA DE PRIVACIDADE</p>
                    <p>Com base nos Artigos 7º, III e 23 da Lei nº 13.709/2018 (LGPD), salvaguardamos seus dados (CPF, e-mail) para cumprimento de dever legal municipal de registro de políticas cívicas.</p>
                    <p className="mt-2">Você goza do direito de exclusão instantânea irreversível da conta por meio do Painel LGPD de autoatendimento no portal municipal.</p>
                  </div>
                )}

                <label className="flex gap-3 items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-gov-blue focus:ring-gov-blue/25 w-4.5 h-4.5 accent-gov-blue"
                    checked={formData.lgpd_treatment_consented}
                    onChange={(e) => setFormData({ ...formData, lgpd_treatment_consented: e.target.checked })}
                  />
                  <span className="text-[11px] text-gray-400 font-bold leading-normal">
                    (Opcional) Autorizo tratamento estatístico para avaliação de impacto e auditorias públicas de progresso.
                  </span>
                </label>

                <label className="flex gap-3 items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    className="mt-1 rounded border-gray-300 text-gov-blue focus:ring-gov-blue/25 w-4.5 h-4.5 accent-gov-blue"
                    checked={formData.lgpd_marketing_consented}
                    onChange={(e) => setFormData({ ...formData, lgpd_marketing_consented: e.target.checked })}
                  />
                  <span className="text-[11px] text-gray-400 font-bold leading-normal">
                    (Opcional) Autorizo o preenchimento de lembretes e avisos institucionais do município diretamente por e-mail.
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-3 transform hover:-translate-y-1"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Finalizar Credenciamento
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <p className="mt-8 text-center text-[10px] text-gray-400 font-medium leading-relaxed">
            Seu cadastro é amparado juridicamente pela Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
          </p>
        </div>
      </div>
    </div>
  );
};
