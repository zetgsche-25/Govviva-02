import React from 'react';
import { jsPDF } from 'jspdf';
import { Download, Lock, AlertTriangle } from 'lucide-react';
import { Registration, User } from '../types';

interface CertificateButtonProps {
  registration: Registration;
  user: User;
}

export const CertificateButton: React.FC<CertificateButtonProps> = ({ registration, user }) => {
  const { event, certificate, presence } = registration;

  const isEventConcluded = event.status === 'CONCLUDED' || event.status === 'CONCLUIDO';
  const hasMinPresence = presence && (presence.status === 'APPROVED' || (presence.calculated_percentage !== undefined && presence.calculated_percentage >= 75.0));

  const generatePDF = () => {
    if (!certificate) return;

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Decorative frame
    doc.setFillColor(245, 247, 250);
    doc.rect(0, 0, 297, 210, 'F');
    
    doc.setDrawColor(0, 75, 130); // GOV BLUE
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190, 'S');

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(30, 41, 59);
    doc.text("CERTIFICADO DIGITAL", 148, 55, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("OUTORGADO PELO PORTAL MUNICIPAL GOVVIVA DE MARICÁ/RJ", 148, 68, { align: "center" });

    // Body
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Certificamos para os devidos fins que o cidadão registrado:", 148, 95, { align: "center" });
    
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 75, 130);
    doc.text(user.name.toUpperCase(), 148, 112, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`PORTADOR DO CPF: ${user.cpf || 'Não informado'}`, 148, 122, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);
    doc.text(`cumpriu com aproveitamento as atividades presenciais de:`, 148, 138, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(`"${event.title.toUpperCase()}"`, 148, 146, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Órgão Responsável: ${event.org_responsible || 'Secretaria Executiva'} | Carga Horária: ${event.workload || 4} Horas`, 148, 156, { align: "center" });

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "bold");
    doc.text(`CÓDIGO DE AUTENTICAÇÃO: ${certificate.code}`, 148, 178, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(`ASSINATURA DIGITAL (SHA-256): ${certificate.hash_verification}`, 148, 184, { align: "center" });
    
    const dateStr = new Date(certificate.issued_at).toLocaleDateString('pt-BR');
    doc.text(`Emitido oficialmente em ${dateStr} - Válido sob os termos da legislação municipal de Maricá.`, 148, 192, { align: "center" });
    
    doc.save(`certificado_govviva_${certificate.code}.pdf`);
  };

  if (certificate) {
    return (
      <button
        onClick={generatePDF}
        className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold transition-all active:scale-[0.98] uppercase tracking-widest text-[10px] shadow-md shadow-emerald-100"
      >
        <Download className="w-4 h-4" />
        Baixar Certificado Oficial
      </button>
    );
  }

  if (!isEventConcluded) {
    return (
      <button
        disabled
        className="flex items-center justify-center gap-2 w-full py-3 bg-gray-150 text-gray-400 rounded-xl font-bold cursor-not-allowed uppercase tracking-widest text-[10px] border border-gray-200"
        title="O certificado só estará disponível após o encerramento do evento."
      >
        <Lock className="w-3.5 h-3.5" />
        Certificado Indisponível (Em andamento)
      </button>
    );
  }

  return (
    <button
      disabled
      className="flex items-center justify-center gap-2 w-full py-3 bg-amber-50/50 text-amber-600 border border-amber-250 rounded-xl font-bold cursor-not-allowed uppercase tracking-widest text-[10px]"
      title="Você não atingiu a carga horária mínima de presença (75%) exigida para emissão."
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      Certificado indisponível. Presença insuficiente.
    </button>
  );
};
