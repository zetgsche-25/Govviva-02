import React from 'react';
import { jsPDF } from 'jspdf';
import { Award, Download } from 'lucide-react';
import { Event, User } from '../types';

interface CertificateButtonProps {
  event: Event;
  user: User;
}

export const CertificateButton: React.FC<CertificateButtonProps> = ({ event, user }) => {
  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Fundo decorativo simples
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, 297, 210, 'F');
    
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190, 'S');

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(30, 41, 59);
    doc.text("CERTIFICADO", 148, 60, { align: "center" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text("DE PARTICIPAÇÃO EM EVENTO OFICIAL", 148, 75, { align: "center" });

    // Conteúdo
    doc.setFontSize(14);
    doc.text("Certificamos que para os devidos fins de comprovação,", 148, 105, { align: "center" });
    
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text(user.name.toUpperCase(), 148, 120, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(`Participou do evento: "${event.title}"`, 148, 135, { align: "center" });
    doc.text(`Realizado por: ${event.org_name || 'Governo Municipal'}`, 148, 145, { align: "center" });
    doc.text(`Local: ${event.location}`, 148, 155, { align: "center" });

    // Rodapé
    doc.setFontSize(10);
    const date = new Date().toLocaleDateString('pt-BR');
    doc.text(`Protocolo de Autenticação: #2026-${event.id.toString().padStart(4, '0')}`, 148, 175, { align: "center" });
    doc.text(`Gerado via Portal GOVVIVA em ${date}`, 148, 185, { align: "center" });
    
    doc.save(`certificado_viva_${event.id}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="flex items-center justify-center gap-2 w-full py-3 bg-white text-emerald-700 rounded-xl border-2 border-emerald-100 font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px]"
    >
      <Download className="w-4 h-4" />
      Emitir Certificado Oficial
    </button>
  );
};
