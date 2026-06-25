import React from 'react';
import { jsPDF } from 'jspdf';
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
  
  const generateReceiptPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Outer border
    doc.setFillColor(252, 252, 253);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setDrawColor(0, 75, 130);
    doc.setLineWidth(1);
    doc.rect(15, 15, 180, 267, 'S');

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 75, 130);
    doc.text("GOVVIVA - MARICÁ/RJ", 105, 35, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("COMPROVANTE OFICIAL DE INSCRIÇÃO", 105, 45, { align: "center" });

    doc.setDrawColor(226, 232, 240);
    doc.line(25, 52, 185, 52);

    // Section 1: Inscrição
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("PROTOCOLO DE ATIVIDADE", 25, 62);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(`#REG-${registration.registration_id.toString().padStart(6, '0')}`, 25, 69);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("TICKET ID ÚNICO", 115, 62);
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(registration.ticket_code || "GOV-TKT-SECURE", 115, 69);

    // Section 2: Cidadão
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("NOME DO PARTICIPANTE", 25, 84);
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(user.name.toUpperCase(), 25, 91);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("CPF", 115, 84);
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(user.cpf || "Não cadastrado", 115, 91);

    doc.setDrawColor(226, 232, 240);
    doc.line(25, 99, 185, 99);

    // Section 3: Evento
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("ATIVIDADE / EVENTO", 25, 111);
    doc.setFontSize(13);
    doc.setTextColor(0, 75, 130);
    doc.setFont("helvetica", "bold");
    doc.text(event.title.toUpperCase(), 25, 118);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("ÓRGÃO RESPONSÁVEL", 25, 131);
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(event.org_responsible || "Secretaria Municipal de Governo", 25, 138);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("DATA DO EVENTO", 25, 151);
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(new Date(event.date_start).toLocaleDateString('pt-BR'), 25, 158);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("LOCAL DE REALIZAÇÃO", 115, 151);
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.setFont("helvetica", "bold");
    doc.text(event.location, 115, 158);

    doc.setDrawColor(226, 232, 240);
    doc.line(25, 168, 185, 168);

    // QR Code and Security Instructions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 75, 130);
    doc.text("REQUISITOS DE FREQUÊNCIA INTELIGENTE", 105, 182, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text("1. Apresente este passaporte com QR Code na entrada (Check-in).", 30, 194);
    doc.text("2. Apresente este passaporte na saída da atividade (Check-out).", 30, 201);
    doc.text("3. A frequência mínima exigida para obtenção do diploma é de 75%.", 30, 208);
    doc.text("4. Os registros são auditados e assinados digitalmente com carimbo de tempo IP.", 30, 215);

    // Decorative ticket block representing the pass
    doc.setFillColor(241, 245, 249);
    doc.rect(25, 225, 160, 40, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(25, 225, 160, 40, 'S');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text("PASSAPORTE ELETRÔNICO DE ENTRADA", 105, 233, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Use o QR Code no seu smartphone ou impresso para check-in e check-out.`, 105, 240, { align: "center" });
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 75, 130);
    doc.text(`CÓDIGO DE ACESSO: ${registration.ticket_code}`, 105, 250, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`ASSINATURA DE SEGURANÇA: ${registration.security_hash || "GOVVIVA-SECURE-HASH-2026"}`, 105, 258, { align: "center" });

    doc.save(`comprovante_inscricao_${registration.registration_id}.pdf`);
  };

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
        <CertificateButton registration={registration} user={user} />
        
        <button
          onClick={generateReceiptPDF}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-2xl font-bold uppercase tracking-widest text-[10px] border border-gray-100 transition-all shadow-sm active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          Baixar Comprovante
        </button>

        <button
          onClick={() => onViewEvent(event.id)}
          className="flex items-center justify-center gap-2 w-full py-3 bg-white text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:text-gray-900 transition-all border border-transparent hover:border-gray-200 shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
          Visualizar Detalhes & QR Code
        </button>
      </div>
    </div>
  );
};
