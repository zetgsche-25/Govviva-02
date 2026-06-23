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
  
  // Estado para o modal de detalhes contendo a inscrição completa
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);

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

      {/* Box de Integração GOV.BR (Arquitetura Compatível) */}
      <div className="mb-12 p-6 rounded-3xl bg-slate-50 border border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`p-3.5 rounded-2xl shrink-0 ${user?.govbr_authenticated ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-gov-blue'}`}>
            <Info className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-extrabold text-sm text-gray-950 uppercase tracking-tight">Status do Vínculo Federal GOV.BR</h4>
              {user?.govbr_authenticated ? (
                <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${
                  user.govbr_level === 'GOLD' 
                    ? 'bg-amber-100/50 text-amber-800 border-amber-200' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  Nível {user.govbr_level} 🇧🇷
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                  Não Vinculado
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-3xl">
              {user?.govbr_authenticated ? (
                <>
                  Sua conta está integrada via certificado corporativo único. Seus dados estão sincronizados sob as diretrizes de segurança da LGPD e as emissões de certificados ocorrem de forma imediata com o nível <strong>{user.govbr_level}</strong>. This connection is active under simulated OAuth federation.
                </>
              ) : (
                <>
                  A arquitetura futura do portal permitirá a vinculação de SSO do GOV.BR. Cidadãos com níveis <strong>Prata</strong> ou <strong>Ouro</strong> terão agilidade na leitura biométrica de QR Code presencial, e emissão simplificada de diplomas sem moderação.
                </>
              )}
            </p>
          </div>
        </div>

        {!user?.govbr_authenticated && (
          <Link
            to="/login"
            className="px-6 py-3 bg-[#1351b4] text-white hover:bg-[#0c3c88] transition-all rounded-xl font-bold uppercase tracking-wider text-[10px] shrink-0 text-center"
          >
            Simular Login GOV.BR
          </Link>
        )}
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
              onViewEvent={() => setSelectedReg(reg)}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalhes com QR Code de Presença */}
      {selectedReg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-gov-blue-dark/60 backdrop-blur-md" onClick={() => setSelectedReg(null)} />
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            <button 
              onClick={() => setSelectedReg(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-8 md:p-12">
              <span className="inline-block px-4 py-1.5 bg-gov-blue-light text-gov-blue text-[10px] font-black rounded-xl uppercase tracking-widest mb-4 border border-blue-50">
                {selectedReg.event.category}
              </span>
              <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter leading-tight mb-6">{selectedReg.event.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                {/* Lado QR Code */}
                <div className="flex flex-col items-center text-center">
                  {selectedReg.ticket_code ? (
                    <>
                      <div className="bg-white p-4 rounded-3xl shadow-md border border-gray-100 mb-3">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${selectedReg.ticket_code}`} 
                          alt="QR Code Ticket" 
                          referrerPolicy="no-referrer"
                          className="w-40 h-40 object-contain"
                        />
                      </div>
                      <p className="text-[10px] font-mono font-bold text-gray-400 select-all uppercase tracking-wider">
                        CÓD: {selectedReg.ticket_code}
                      </p>
                    </>
                  ) : (
                    <div className="w-40 h-40 bg-gray-200 rounded-3xl flex items-center justify-center text-gray-400 text-xs">
                      QR Code indisponível
                    </div>
                  )}
                </div>

                {/* Status Frequência */}
                <div className="flex flex-col gap-3 justify-center">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Controle de Presença</p>
                  
                  {selectedReg.presence ? (
                    <div className="space-y-4">
                      {/* Check-in */}
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${selectedReg.presence.check_in_time ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="text-xs font-bold text-gray-800">Check-in (Entrada)</p>
                          <p className="text-[10px] text-gray-500">
                            {selectedReg.presence.check_in_time 
                              ? new Date(selectedReg.presence.check_in_time).toLocaleString('pt-BR') 
                              : 'Aguardando Entrada'}
                          </p>
                        </div>
                      </div>

                      {/* Check-out */}
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${selectedReg.presence.check_out_time ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <div>
                          <p className="text-xs font-bold text-gray-800">Check-out (Saída)</p>
                          <p className="text-[10px] text-gray-500">
                            {selectedReg.presence.check_out_time 
                              ? new Date(selectedReg.presence.check_out_time).toLocaleString('pt-BR') 
                              : 'Aguardando Saída'}
                          </p>
                        </div>
                      </div>

                      {/* Progresso Carga Horária */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-1">
                          <span>PRESENÇA</span>
                          <span>{selectedReg.presence.calculated_percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gov-blue transition-all duration-500" 
                            style={{ width: `${selectedReg.presence.calculated_percentage}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">
                          Horas computadas: {selectedReg.presence.calculated_duration}h de {selectedReg.event.workload || 4}h exigidas.
                        </p>
                      </div>

                      {/* Status literal */}
                      <div className="pt-1">
                        {selectedReg.presence.status === 'APPROVED' ? (
                          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
                            Frequência 100% Cumpriu
                          </span>
                        ) : selectedReg.presence.status === 'INCOMPLETE' ? (
                          <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100">
                            Status: Carga Incompleta
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100">
                            Check-in ok. Aguardando saída.
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
                        <p className="text-xs font-bold text-blue-900 mb-1">Passaporte Pronto</p>
                        <p className="text-[11px] text-blue-700 leading-relaxed">
                          Apresente o QR Code ao organizador na recepção do evento para registrar sua entrada e na conclusão para registrar a sua saída.
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold rounded-lg border border-gray-200">
                        Nenhuma presença registrada
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 mb-10 text-left">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-gov-blue">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Informações do Calendário</p>
                    <p className="text-gray-600 font-medium text-sm leading-relaxed">{selectedReg.event.description}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Gestão Responsável</p>
                    <p className="text-gray-600 font-bold text-sm leading-relaxed">{selectedReg.event.org_responsible || 'Secretaria Executiva Municipal'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Órgão Regulador da Atividade</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedReg(null)}
                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-250"
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
