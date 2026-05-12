import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Event } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Clock,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date_start: '',
    location: '',
    total_slots: 0,
    category: '',
    org_name: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/events', newEvent);
      setShowModal(false);
      fetchEvents();
      setNewEvent({
        title: '',
        description: '',
        date_start: '',
        location: '',
        total_slots: 0,
        category: '',
        org_name: ''
      });
    } catch (error) {
      console.error('Erro ao criar evento', error);
      alert('Erro ao criar evento institucional.');
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await api.get('/events');
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos administrativos', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Admin */}
      <div className="bg-white border-b border-gray-100 mb-8 pt-12 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gov-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-gov-blue uppercase tracking-[0.3em]">Gestão Pública Eficiente</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none">Painel de <span className="text-gov-blue">Controle Administrativo</span></h1>
              <p className="text-gray-400 font-medium mt-4 max-w-xl">Gerenciamento oficial de atividades, monitoramento de vagas e acompanhamento de adesão pública.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/docs/render" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-white text-gray-700 border-2 border-gray-100 px-8 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm active:scale-95"
              >
                <FileText className="w-5 h-5 text-gov-blue" />
                Documentação PDF
              </a>
              <button 
                onClick={() => setShowModal(true)}
                className="flex items-center justify-center gap-3 bg-gov-blue text-white px-10 py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gov-blue-dark transition-all shadow-2xl shadow-blue-100 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Criar Novo Evento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Eventos Totais</p>
            <p className="text-4xl font-black text-gray-900 leading-none">{events.length}</p>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
              <ArrowUpRight className="w-3 h-3" /> Agenda 2026
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Vagas Ofertadas</p>
            <p className="text-4xl font-black text-gray-900 leading-none">
              {events.reduce((acc, e) => acc + e.total_slots, 0)}
            </p>
            <div className="mt-4 flex items-center gap-2 text-gov-blue font-black text-[10px] uppercase tracking-widest">
              <Users className="w-3 h-3" /> Capacidade Total
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Taxa de Ocupação</p>
            <p className="text-4xl font-black text-gray-900 leading-none">78%</p>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
              <CheckCircle className="w-3 h-3" /> Meta Alcançada
            </div>
          </div>
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Tempo de Resposta</p>
            <p className="text-4xl font-black text-gray-900 leading-none">0.8s</p>
            <div className="mt-4 flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
              <Clock className="w-3 h-3" /> Sistema Otimizado
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input 
              type="text" 
              placeholder="Pesquisar por título ou categoria..."
              className="w-full pl-16 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-gov-blue/5 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <button className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-all">
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Evento</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Categoria</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vagas (I/T)</th>
                  <th className="px-10 py-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-8 h-20 bg-gray-50/20"></td>
                    </tr>
                  ))
                ) : filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-gov-blue font-black flex-shrink-0 group-hover:bg-gov-blue group-hover:text-white transition-all">
                          {event.title.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 uppercase tracking-tight mb-1">{event.title}</p>
                          <div className="flex items-center gap-3 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(event.date_start).toLocaleDateString('pt-BR')}</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                            <span className="text-gov-blue">{event.org_name || 'Setor Responsável'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-200 shadow-sm">
                        {event.category}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${event.available_slots > 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${event.available_slots > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {event.available_slots > 0 ? 'Inscrições Abertas' : 'Vagas Esgotadas'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-gray-100 h-2 rounded-full max-w-[80px] overflow-hidden">
                          <div 
                            className="bg-gov-blue h-full rounded-full transition-all duration-1000"
                            style={{ width: `${((event.total_slots - event.available_slots) / event.total_slots) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs font-black text-gray-900 uppercase">
                          {event.total_slots - event.available_slots} <span className="text-gray-300">/ {event.total_slots}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-300 hover:text-gov-blue hover:border-gov-blue/20 hover:bg-gov-blue-light transition-all shadow-sm group/btn">
                        <MoreVertical className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && filteredEvents.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Nenhum evento localizado</h3>
              <p className="text-gray-400 font-medium mt-2 tracking-tight">Tente ajustar seus termos de pesquisa institucional.</p>
            </div>
          )}
        </div>
      </div>
      {/* Modal de Criação */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gov-blue-dark/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black text-gov-blue uppercase tracking-widest mb-1">Novo Protocolo</p>
                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter">Registrar Atividade</h2>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-8 h-8 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Título Institucional</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: II Fórum de Mobilidade"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Categoria Oficial</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    placeholder="Ex: Gestão Pública"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Órgão Responsável</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                  placeholder="Ex: Secretaria de Educação"
                  value={newEvent.org_name}
                  onChange={(e) => setNewEvent({...newEvent, org_name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Data e Horário</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    value={newEvent.date_start}
                    onChange={(e) => setNewEvent({...newEvent, date_start: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Vagas Ofertadas</label>
                  <input 
                    type="number" 
                    required
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                    value={newEvent.total_slots}
                    onChange={(e) => setNewEvent({...newEvent, total_slots: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Localização Oficial</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none"
                  placeholder="Ex: Cine Teatro Henfil"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Descrição do Evento</label>
                <textarea 
                  required
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-gov-blue/5 transition-all outline-none min-h-[100px] resize-none"
                  placeholder="Descreva as diretrizes do evento..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:text-gray-900 hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-gov-blue text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gov-blue-dark transition-all shadow-xl shadow-blue-100"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
