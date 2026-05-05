import React from 'react';
import { Calendar, MapPin, Tag, CheckCircle, Download, ExternalLink } from 'lucide-react';
import { Registration, User } from '../types';
import { CertificateButton } from './CertificateButton';

interface RegistrationCardProps {
  registration: Registration;
  user: User;
  onViewEvent: (id: number) => void;
}

export const RegistrationCard: React.FC<RegistrationCardProps> = ({ registration, user, onViewEvent }) => {
  const { event } = registration;
  
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 p-8 hover:shadow-2xl hover:border-gov-blue/20 transition-all shadow-sm gov-card-shadow flex flex-col h-full animate-fade-in group">
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gov-blue-light text-gov-blue text-[10px] font-black rounded-xl uppercase tracking-widest border border-blue-50 shadow-sm self-start">
            <Tag className="w-3 h-3" />
            {event.category}
          </span>
          <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest pl-1">
            Validado: #REG-{registration.registration_id.toString().padStart(6, '0')}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5" />
          {registration.status === 'CONFIRMED' ? 'Validada' : 'Participação Confirmada'}
        </div>
      </div>

      <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter leading-tight group-hover:text-gov-blue transition-colors">
        {event.title}
      </h3>

      <div className="space-y-4 mb-10 flex-grow">
        <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gov-blue-light group-hover:text-gov-blue transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Data Oficial</p>
            {new Date(event.date_start).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gov-blue-light group-hover:text-gov-blue transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">{event.org_name || 'Órgão Responsável'}</p>
            <span className="truncate block max-w-[200px]">{event.location}</span>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-gray-50 flex flex-col gap-3">
        <CertificateButton event={event} user={user} />
        
        <button
          onClick={() => onViewEvent(event.id)}
          className="flex items-center justify-center gap-2 w-full py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 hover:text-gray-900 transition-all border border-transparent hover:border-gray-200 shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Protocolo de Inscrição
        </button>
      </div>
    </div>
  );
};
