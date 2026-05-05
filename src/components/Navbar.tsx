import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User as UserIcon, Calendar, Menu, X, ChevronRight, Globe, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full relative z-[100]">
      {/* Top Bar Branding */}
      <div className="bg-gov-blue-dark py-2.5 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black text-white/70 tracking-[0.2em] uppercase">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-blue-400" />
              Institucional
            </span>
            <span className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-blue-400" />
              Segurança Digital
            </span>
          </div>
          <div className="flex gap-6 items-center">
            <a href="#" className="hover:text-white transition-colors">Transparência</a>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <a href="#" className="hover:text-white transition-colors">Ouvidoria</a>
            <div className="w-1 h-1 bg-white/20 rounded-full"></div>
            <a href="#" className="hover:text-white transition-colors">Acessibilidade</a>
          </div>
        </div>
      </div>

      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24 items-center">
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="bg-gov-blue p-3 rounded-2xl shadow-xl shadow-blue-100 group-hover:scale-105 transition-all group-hover:shadow-blue-200">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-tighter text-gov-blue uppercase italic">
                  GOV<span className="text-gray-900 not-italic">VIVA</span>
                </span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 opacity-80">
                  Sistema Municipal de Eventos
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-12">
              <Link 
                to="/" 
                className={`text-[11px] font-black uppercase tracking-[0.2em] py-2 transition-all relative group ${
                  isActive('/') ? 'text-gov-blue' : 'text-gray-400 hover:text-gov-blue'
                }`}
              >
                Início
                <span className={`absolute bottom-0 left-0 h-0.5 bg-gov-blue transition-all ${
                  isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
              <Link 
                to="/" 
                className={`text-[11px] font-black uppercase tracking-[0.2em] py-2 transition-all relative group ${
                  isActive('/calendar') ? 'text-gov-blue' : 'text-gray-400 hover:text-gov-blue'
                }`}
              >
                Calendário
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gov-blue group-hover:w-full transition-all"></span>
              </Link>
              {user && user.role === 'ADMIN' && (
                <Link 
                  to="/admin" 
                  className={`text-[11px] font-black uppercase tracking-[0.2em] py-2 transition-all relative group ${
                    isActive('/admin') ? 'text-gov-blue' : 'text-gray-400 hover:text-gov-blue'
                  }`}
                >
                  Gestão Administrativa
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-gov-blue transition-all ${
                    isActive('/admin') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              )}
              {user && (
                <Link 
                  to="/my-registrations" 
                  className={`text-[11px] font-black uppercase tracking-[0.2em] py-2 transition-all relative group ${
                    isActive('/my-registrations') ? 'text-gov-blue' : 'text-gray-400 hover:text-gov-blue'
                  }`}
                >
                  Minhas Inscrições
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-gov-blue transition-all ${
                    isActive('/my-registrations') ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              )}
            </div>

            {/* Auth/Mobile Menu Button */}
            <div className="flex items-center gap-4">
              {user ? (
                <div className="hidden lg:flex items-center gap-5 pl-8 border-l border-gray-100">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-gray-900 uppercase tracking-tight">{user.name.split(' ')[0]}</span>
                    <span className="text-[9px] text-gov-blue font-black uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded mt-1">
                      {user.role === 'ADMIN' ? 'Gestor Público' : 'Cidadão'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-gray-100 hover:border-red-100 group"
                    title="Sair do Portal"
                  >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex bg-gov-blue text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gov-blue-dark transition-all shadow-2xl shadow-blue-100 hover:shadow-blue-200 active:scale-95"
                >
                  Identificar-se
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-3 bg-gray-50 text-gov-blue rounded-2xl hover:bg-gov-blue-light transition-all border border-gray-100"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-10 space-y-8">
                <div className="space-y-4">
                  <Link 
                    to="/" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-between items-center text-sm font-black text-gray-900 uppercase tracking-widest bg-gray-50 p-5 rounded-2xl hover:bg-gov-blue-light hover:text-gov-blue transition-all"
                  >
                    Home <ChevronRight className="w-4 h-4" />
                  </Link>
                  {user && (
                    <Link 
                      to="/my-registrations" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex justify-between items-center text-sm font-black text-gray-900 uppercase tracking-widest bg-gray-50 p-5 rounded-2xl hover:bg-gov-blue-light hover:text-gov-blue transition-all"
                    >
                      Minhas Inscrições <ChevronRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {user ? (
                  <div className="pt-8 border-t border-gray-100 space-y-6">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-gov-blue shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 uppercase">{user.name}</p>
                        <p className="text-[10px] font-black text-gov-blue uppercase tracking-widest">Portal Conectado</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full py-5 bg-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-transform"
                    >
                      <LogOut className="w-5 h-5" />
                      Encerrar Sessão
                    </button>
                  </div>
                ) : (
                  <div className="pt-8 border-t border-gray-100">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-5 bg-gov-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl shadow-blue-100 active:scale-95"
                    >
                      Entrar no Sistema
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
};

