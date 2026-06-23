import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Mail, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronLeft,
  KeyRound,
  Info
} from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugToken, setDebugToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDebugToken(null);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.message || 'Se o seu e-mail estiver cadastrado, as instruções foram enviadas.');
      if (res.debug_token) {
        setDebugToken(res.debug_token);
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao solicitar recuperação de senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="forgot-password-page" className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gov-blue"></div>
          
          <div className="mb-6">
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-wider transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar ao Login
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gov-blue-light rounded-2xl mb-6 shadow-inner">
              <KeyRound className="w-8 h-8 text-gov-blue" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Recuperar Senha</h1>
            <p className="text-gray-400 font-medium text-sm px-4">Insira o seu e-mail cadastrado para enviarmos as instruções de redefinição.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <h4 className="text-sm font-black text-emerald-950 uppercase">Solicitação Processada</h4>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-semibold">
                  {success}
                </p>
              </div>

              {debugToken && (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl space-y-2 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <h5 className="text-xs font-black text-amber-950 uppercase">Simulador de E-mail Ativo</h5>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                    Como o SMTP está em modo de simulação Sandbox local, copiamos o seu token gerado abaixo para testes rápidos:
                  </p>
                  <div className="mt-2 text-center p-3 bg-white border border-amber-300 rounded-xl font-mono text-xl font-black tracking-[4px] text-gray-800">
                    {debugToken}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${debugToken || ''}`)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Prosseguir para Redefinição
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Cadastrado</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gov-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-gov-blue-dark transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Disparar Recuperador
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Rodapé de Informação */}
          <div className="mt-8 p-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-center">
            <p className="text-[10px] text-gray-400 font-medium leading-relaxed flex items-center gap-2 justify-center">
              <HelpCircle className="w-4 h-4 text-gray-300 shrink-0" />
              <span>O token único expira em 1 hora para assegurar sigilo sanitário de segurança.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
