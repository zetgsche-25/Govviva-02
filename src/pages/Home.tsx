import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { EventCard } from '../components/EventCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { motion } from 'motion/react';
import { CertificateButton } from '../components/CertificateButton';
import { EmptyState } from '../components/EmptyState';
import { Event, Registration } from '../types';
import { Info, CheckCircle, Loader2, AlertCircle, X, MapPin, Calendar, Users, ExternalLink, ArrowRight, SearchX, Shield } from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const eventsData = await api.get('/events');
      setEvents(eventsData);

      if (user) {
        const regs = await api.get('/registrations/me');
        setMyRegistrations(regs);
      }
    } catch (err: any) {
      setError('Falha ao carregar catálogo de eventos institucional.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (eventId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setActionLoading(true);
      await api.post('/registrations', { event_id: eventId });
      setMessage({ type: 'success', text: 'Inscrição realizada com sucesso! Vaga garantida.' });
      fetchData(); // Atualiza contador de vagas
      setSelectedEvent(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao processar inscrição.' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const featuredEvent = events.length > 0 ? events[0] : null;
  const otherEvents = events.length > 1 ? events.slice(1) : [];

  const isUserRegistered = (eventId: number) => {
    return myRegistrations.some(r => r.event.id === eventId);
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Institutional Hero Banner */}
      <section className="gov-hero-gradient text-white py-24 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl animate-fade-in shadow-2xl shadow-black/20 p-8 rounded-3xl bg-black/10 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-16 h-1.5 bg-white/40 rounded-full"></div>
              <span className="text-xs font-black uppercase tracking-[0.4em] text-white/90">Secretaria Municipal de Cultura - Maricá/RJ</span>
            </div>
            <h1 className="text-5xl sm:text-8xl font-black tracking-tighter mb-8 uppercase leading-[0.85]">
              Agenda <br/>
              <span className="text-blue-200 underline decoration-blue-400/30 underline-offset-[12px] decoration-4">Institucional</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 font-medium mb-12 leading-relaxed max-w-2xl">
              Consulte a programação oficial de eventos, realize sua inscrição em atividades públicas e emita seus certificados de participação de forma digital.
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => document.getElementById('calendario-oficial')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-gov-blue px-12 py-5 rounded-2xl font-black uppercase tracking-[0.15em] text-xs hover:bg-gov-blue-light transition-all shadow-2xl hover:scale-105 active:scale-95"
              >
                Consultar Eventos
              </button>
              <div className="flex items-center gap-3 px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                <Shield className="w-5 h-5 text-blue-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Ambiente Seguro LGPD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 relative -mt-16 z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl flex items-center gap-6 group hover:border-gov-blue/20 transition-all">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-gov-blue group-hover:scale-110 transition-transform">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Próximos Eventos</p>
              <p className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{events.length} Atividades</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl flex items-center gap-6 group hover:border-gov-blue/20 transition-all">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Inscrições Confirmadas</p>
              <p className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{myRegistrations.length} Participações</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl flex items-center gap-6 group hover:border-gov-blue/20 transition-all">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Proteção LGPD</p>
              <p className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Dados Seguros</p>
            </div>
          </div>
        </div>
      </div>

      <div id="calendario-oficial" className="max-w-7xl mx-auto px-4 py-24">
        {/* Mensagens Globais */}
        {message && (
          <div className={`fixed top-24 right-6 z-[100] p-6 rounded-3xl shadow-2xl border-l-[6px] flex items-center gap-5 animate-in slide-in-from-right duration-300 ${
            message.type === 'success' ? 'bg-white border-emerald-500 text-emerald-900' : 'bg-white border-red-500 text-red-900'
          }`}>
            <div className={`p-2.5 rounded-full shadow-sm ${message.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {message.type === 'success' ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <p className="font-black text-[10px] uppercase tracking-[0.2em] mb-0.5 opacity-60">Notificação do Portal</p>
              <p className="font-bold text-base tracking-tight">{message.text}</p>
            </div>
          </div>
        )}

        {/* Featured Section */}
        {!loading && featuredEvent && (
          <div className="mb-24">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-10 w-2 bg-gov-blue rounded-full"></div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Destaque Institucional</h2>
            </div>
            <div 
              onClick={() => setSelectedEvent(featuredEvent)}
              className="bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden group cursor-pointer flex flex-col lg:flex-row hover:border-gov-blue/30 transition-all"
            >
              <div className="lg:w-2/5 h-64 lg:h-auto bg-gov-blue-light relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <Calendar className="w-48 h-48 text-gov-blue" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-tr from-gov-blue/20 to-transparent"></div>
                <div className="absolute top-8 left-8 flex flex-col gap-2">
                  <span className="px-4 py-2 bg-gov-blue text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg border border-white/20 self-start">
                    Protocolo: #2026-{featuredEvent.id.toString().padStart(4, '0')}
                  </span>
                  <span className="px-4 py-2 bg-white/80 backdrop-blur-md text-gov-blue text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg border border-blue-50 self-start">
                    {featuredEvent.org_name || 'Secretaria Responsável'}
                  </span>
                </div>
              </div>
              <div className="lg:w-3/5 p-10 lg:p-16 flex flex-col justify-center">
                <h3 className="text-4xl font-black text-gray-900 mb-6 uppercase tracking-tighter leading-tight group-hover:text-gov-blue transition-colors">
                  {featuredEvent.title}
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed mb-10 line-clamp-3 font-medium">
                  {featuredEvent.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                      <Calendar className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Data Oficial</p>
                      <p className="font-bold text-gray-700 tracking-tight">{new Date(featuredEvent.date_start).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                      <MapPin className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Logradouro</p>
                      <p className="font-bold text-gray-700 tracking-tight line-clamp-1">{featuredEvent.location}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {isUserRegistered(featuredEvent.id) ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="font-black text-xs text-emerald-600 uppercase tracking-widest">Inscrição Confirmada</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="font-black text-xs text-emerald-600 uppercase tracking-widest">{featuredEvent.available_slots} Vagas Disponíveis</span>
                      </>
                    )}
                  </div>
                  <button className="flex items-center gap-2 text-gov-blue font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    {isUserRegistered(featuredEvent.id) ? 'Consultar Protocolo' : 'Realizar Inscrição Oficial'} <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listagem Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-2 w-12 bg-gov-blue rounded-full"></div>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Cronograma de Eventos</h2>
            </div>
            <p className="text-gray-500 font-medium text-xl leading-relaxed">
              Consulte o catálogo completo de atividades oficiais disponibilizadas pela prefeitura.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-xl">
             <div className="flex items-center gap-2 px-6 py-2 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-gray-100">
              Filtro Institucional
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-100 p-20 rounded-[40px] text-center max-w-3xl mx-auto shadow-inner bg-opacity-50">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner shadow-red-200/50">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-3xl font-black text-red-900 uppercase tracking-tighter mb-4">Portal em Manutenção</h3>
            <p className="text-red-700 mt-2 font-medium mb-12 text-lg">Estamos realizando manutenções preventivas em nossos servidores centrais.</p>
            <button onClick={fetchData} className="px-12 py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-red-700 transition-all active:scale-95 shadow-red-200">
              Tentar Restaurar Acesso
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : otherEvents.length === 0 ? (
          <EmptyState 
            title="Nenhum evento adicional"
            description="No momento não existem outros eventos programados. Fique atento às nossas atualizações oficiais."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {otherEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <EventCard 
                  event={event} 
                  isRegistered={isUserRegistered(event.id)}
                  onClick={(id) => setSelectedEvent(event)} 
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes e Inscrição */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-gov-blue-dark/60 backdrop-blur-md" 
            onClick={() => !actionLoading && setSelectedEvent(null)} 
          />
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
            <div className="md:w-1/3 bg-gov-blue text-white p-12 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <span className="inline-block px-4 py-2 bg-white/10 text-white text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/20 mb-8">
                  {selectedEvent.category}
                </span>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-8">Dados de Acesso</h2>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 opacity-70">Data e Hora</p>
                      <p className="font-bold text-lg leading-tight tracking-tight">{new Date(selectedEvent.date_start).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 opacity-70">Local Oficial</p>
                      <p className="font-bold text-lg leading-tight tracking-tight">{selectedEvent.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 opacity-70">Responsável</p>
                      <p className="font-bold text-lg leading-tight tracking-tight">{selectedEvent.org_name || 'Governo Municipal'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 opacity-70">Disponibilidade</p>
                      <p className="font-bold text-lg leading-tight tracking-tight">{selectedEvent.available_slots} Vagas Gratuitas</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-12 relative z-10">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-blue-200">Aviso Institucional</p>
                  <p className="text-xs font-medium text-white/80 leading-relaxed italic">
                    "A garantia da vaga ocorre mediante confirmação digital imediata após o clique."
                  </p>
                </div>
              </div>
            </div>

            <div className="md:w-2/3 p-12 lg:p-16 flex flex-col overflow-y-auto relative">
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-8 right-8 p-3 text-gray-300 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all z-20"
                disabled={actionLoading}
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="w-5 h-5 text-gov-blue" />
                  <span className="text-xs font-black text-gov-blue uppercase tracking-widest">Prontuário de Atividade</span>
                </div>
                <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-tight mb-8">{selectedEvent.title}</h2>
                <div className="prose prose-blue max-w-none">
                  <p className="text-gray-600 font-medium text-lg leading-relaxed">{selectedEvent.description}</p>
                </div>
              </div>

              <div className="mt-auto pt-10 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {isUserRegistered(selectedEvent.id) ? (
                    <div className="w-full flex flex-col gap-4">
                      <div className="w-full bg-emerald-50 text-emerald-800 p-6 rounded-2xl flex items-center justify-center gap-4 border border-emerald-100 shadow-inner">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest mb-0.5">Status: Confirmado</p>
                          <p className="font-bold">Sua participação está garantida nesta atividade.</p>
                        </div>
                      </div>
                      {user && <CertificateButton event={selectedEvent} user={user} />}
                      <button 
                        onClick={() => setSelectedEvent(null)}
                        className="w-full px-10 py-5 bg-gray-50 text-gray-500 hover:text-gray-700 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all hover:bg-gray-100"
                      >
                        Fechar Prontuário
                      </button>
                    </div>
                  ) : selectedEvent.available_slots > 0 ? (
                    <>
                      <button
                        onClick={() => handleEnroll(selectedEvent.id)}
                        disabled={actionLoading}
                        className="w-full sm:w-auto px-12 py-5 bg-gov-blue text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-gov-blue-dark transition-all shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:scale-100 shadow-blue-200"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Validando...
                          </>
                        ) : (
                          <>
                            Garantir Minha Vaga Gratuitamente
                            <ExternalLink className="w-4 h-4" />
                          </>
                        )}
                      </button>
                      <button 
                         onClick={() => setSelectedEvent(null)}
                         disabled={actionLoading}
                         className="w-full sm:w-auto px-10 py-5 bg-gray-50 text-gray-400 hover:text-gray-600 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:bg-gray-100"
                       >
                         Revisar Mais Tarde
                       </button>
                    </>
                  ) : (
                    <div className="w-full bg-red-50 text-red-700 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 border border-red-100">
                      <AlertCircle className="w-6 h-6 mb-2" />
                      <span className="font-black text-xs uppercase tracking-widest">Inscrições Encerradas</span>
                      <p className="text-sm font-medium opacity-80 uppercase tracking-tight">Todas as vagas para esta atividade foram preenchidas.</p>
                      <button 
                        onClick={() => setSelectedEvent(null)}
                        className="mt-4 px-8 py-3 bg-white text-red-600 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-red-50 transition-colors"
                      >
                        Ver Outros Eventos
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em]">
                    Autenticado via Portal GOVVIVA
                  </p>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.25em]">
                    Protocolo: #2026-{selectedEvent.id.toString().padStart(4, '0')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
