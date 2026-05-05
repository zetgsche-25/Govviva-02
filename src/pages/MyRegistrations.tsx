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
            Retornar ao Cronograma Oficial
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-14 bg-gov-blue rounded-full"></div>
            <h2 className="text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none">Minhas <span className="text-gov-blue">Inscrições</span></h2>
          </div>
          <p className="text-gray-500 font-medium text-xl leading-relaxed max-w-2xl">
            Consulte seu histórico de participações, valide protocolos ativos e realize o download de certificados autenticados pela Secretaria Municipal.
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gov-blue-light flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-gov-blue" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Protocolos Ativos</p>
            <p className="text-2xl font-black text-gray-900">{registrations.length}</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-100 p-12 rounded-3xl text-center shadow-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-900">Falha na Comunicação Institucional</h3>
          <p className="text-red-700 mt-2 font-medium">{error}</p>
          <button onClick={fetchRegistrations} className="mt-8 px-8 py-3 bg-red-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg active:scale-95">Reestabelecer Conexão</button>
        </div>
      ) : registrations.length === 0 ? (
        <EmptyState 
          title="Nenhum protocolo localizado"
          description="Seu histórico de participações oficiais aparecerá aqui após a confirmação em atividades do calendário municipal."
          actionText="Consultar Agenda Oficial"
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
          <div className="absolute inset-0 bg-gov-blue-dark/60 backdrop-blur-md" onClick={() => setSelectedEvent(null)} />
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-12">
              <span className="inline-block px-4 py-1.5 bg-gov-blue-light text-gov-blue text-[10px] font-black rounded-xl uppercase tracking-widest mb-6 border border-blue-50">
                {selectedEvent.category}
              </span>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-tight mb-8">{selectedEvent.title}</h2>
              
              <div className="space-y-6 mb-10">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-gov-blue">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Informações do Evento</p>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">{selectedEvent.description}</p>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[24px] flex items-center gap-4">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  <div>
                    <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Inscrição Validada</p>
                    <p className="text-sm font-bold text-emerald-900">Sua participação está oficialmente garantida.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all active:scale-95"
              >
                Retornar ao Painel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
