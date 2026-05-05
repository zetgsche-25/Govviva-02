import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { RegistrationCard } from '../components/RegistrationCard';
import { EmptyState } from '../components/EmptyState';
import { Registration, Event } from '../types';
import { Loader2, AlertCircle, CalendarX, ArrowLeft, X, Info, CheckCircle, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyRegistrations: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para o modal de detalhes (reutilizando lógica da Home por simplicidade no MVP)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get('/registrations/me');
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar suas inscrições.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Sincronizando suas atividades...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-fade-in relative">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="max-w-3xl">
          <Link to="/" className="flex items-center gap-2 text-gov-blue hover:text-gov-blue-dark text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-all group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao Calendário Oficial
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-14 bg-gov-blue rounded-full"></div>
            <h2 className="text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none">Área do Cidadão</h2>
          </div>
          <p className="text-gray-500 font-medium text-xl leading-relaxed max-w-2xl">
            Acompanhe seu histórico de participações oficiais, valide sua presença e emita certificados oficiais vinculados ao seu CPF.
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gov-blue-light flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-gov-blue" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Total de Atividades</p>
            <p className="text-2xl font-black text-gray-900">{registrations.length}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 p-12 rounded-3xl text-center shadow-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900">Erro de sincronização</h3>
          <p className="text-red-700 mt-2 font-medium">{error}</p>
          <button onClick={fetchRegistrations} className="mt-8 px-8 py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg active:scale-95">Tentar Novamente</button>
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState 
          title="Você ainda não possui inscrições"
          description="Seu histórico de participações aparecerá aqui assim que você garantir sua vaga em um de nossos eventos oficiais."
          actionText="Explorar Calendário"
          actionLink="/"
          icon={<CalendarX className="w-16 h-16 text-gray-200" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {registrations.map(reg => (
            <RegistrationCard 
              key={reg.registration_id} 
              registration={reg} 
              user={user!}
              onViewEvent={() => setSelectedEvent(reg.event)}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalhes (Simplificado para visualização) */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                {selectedEvent.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                    <Info className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sobre o Evento</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{selectedEvent.description}</p>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-800">Sua vaga está garantida para este evento.</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
