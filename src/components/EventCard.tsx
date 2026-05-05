import React from 'react';
import { Calendar, MapPin, Users, Tag, ChevronRight, CheckCircle } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  onClick: (id: number) => void;
  isRegistered?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, isRegistered }) => {
  const isFull = event.available_slots <= 0;
  
  return (
    <div 
      onClick={() => onClick(event.id)}
      className="group bg-white rounded-3xl border border-gray-100 hover:border-gov-blue/40 hover:shadow-2xl transition-all text-left flex flex-col h-full cursor-pointer overflow-hidden gov-card-shadow active:scale-[0.98] animate-fade-in"
    >
      {/* Visual Identity Strip */}
      <div className={`h-2.5 w-full ${isRegistered ? 'bg-emerald-500' : 'bg-gov-blue'} group-hover:h-3 transition-all`}></div>
      
      <div className="p-8 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gov-blue-light text-gov-blue text-[9px] font-black rounded-lg uppercase tracking-[0.2em] border border-blue-100 shadow-sm shadow-blue-50">
            <Tag className="w-3 h-3" />
            {event.category}
          </span>
          <div className="flex items-center gap-2">
            {isRegistered ? (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md border border-emerald-100 uppercase tracking-widest flex items-center gap-1 shadow-sm">
                <CheckCircle className="w-3 h-3" />
                Inscrito
              </span>
            ) : isFull ? (
              <span className="px-3 py-1 bg-red-50 text-red-600 text-[9px] font-black rounded-md border border-red-100 uppercase tracking-widest shadow-sm">
                Esgotado
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md border border-emerald-100 uppercase tracking-widest shadow-sm">
                Vagas: {event.available_slots}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-black text-gray-900 group-hover:text-gov-blue transition-colors line-clamp-2 mb-4 leading-[1.1] uppercase tracking-tighter">
          {event.title}
        </h3>

        <div className="space-y-4 mb-10 flex-grow">
          <div className="flex items-start gap-3.5 text-gray-600">
            <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gov-blue-light group-hover:text-gov-blue transition-all">
              <Calendar className="w-5 h-5 text-gray-400 group-hover:text-gov-blue" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Calendário Oficial</span>
              <span className="font-bold text-sm tracking-tight text-gray-700">
                {new Date(event.date_start).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-3.5 text-gray-600">
            <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-gov-blue-light group-hover:text-gov-blue transition-all">
              <MapPin className="w-5 h-5 text-gray-400 group-hover:text-gov-blue" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Localização</span>
              <span className="font-bold text-sm tracking-tight text-gray-700 line-clamp-1">{event.location}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] group-hover:text-gov-blue transition-colors">
            Acessar Prontuário
          </span>
          <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:bg-gov-blue transition-all group-hover:scale-105 shadow-sm border border-gray-100 group-hover:border-gov-blue">
            <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-white transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};
