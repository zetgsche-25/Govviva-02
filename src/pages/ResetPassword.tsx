import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  KeyRound, 
  Lock, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ChevronLeft
} from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Auto-populate from query string parameters if available
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    
    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        token,
        password
      });

      setSuccess(res.message || 'Sua senha foi redefinida com sucesso.');
    } catch (err: any) {
      setError(err.message || 'Não foi possível redefinir a senha. Verifique o token e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="reset-password-page" className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 p-10 lg:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gov-blue"></div>
          
          <div className="mb-6">
            <Link 
              to="/login"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-xs font-black uppercase tracking-wider transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Cancelar e Voltar
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gov-blue-light rounded-2xl mb-6 shadow-inner">
              <KeyRound className="w-8 h-8 text-gov-blue" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Nova Senha</h1>
            <p className="text-gray-400 font-medium text-sm px-4">Insira o e-mail, o token de uso único e a sua nova senha de acesso.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-xs font-bold text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-3xl space-y-3 animate-in fade-in slide-in-from-top-2 text-center">
                <div className="flex items-center gap-3 justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <h4 className="text-sm font-black text-emerald-950 uppercase">Redefinição Concluída</h4>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-semibold">
                  {success}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-4 bg-gov-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-gov-blue-dark transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Ir para o Login
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Campo E-mail */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-700 placeholder:text-gray-300 text-sm"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Campo Token */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Token de Recuperação (6 dígitos)</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-mono font-bold text-gray-750 text-center text-lg placeholder:text-gray-300 select-all tracking-[4px]"
                    placeholder="xxxxxx"
                    value={token}
                    onChange={(e) => setToken(e.target.value.trim())}
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nova Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gov-blue transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-750 placeholder:text-gray-300 text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Confirmar Nova Senha */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-gov-blue transition-colors" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-gov-blue/5 focus:border-gov-blue/30 outline-none transition-all font-medium text-gray-750 placeholder:text-gray-300 text-sm"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-gov-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-gov-blue-dark transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Confirmar Nova Senha
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
              <span>A nova senha deve ter no mínimo 6 dígitos e diferir da anterior.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
