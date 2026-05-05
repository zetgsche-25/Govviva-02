import React from 'react';
import { SearchX, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  actionText, 
  actionLink,
  icon = <SearchX className="w-16 h-16 text-gray-200" />
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in bg-white rounded-[40px] border border-gray-100 gov-card-shadow max-w-2xl mx-auto">
      <div className="mb-8 p-6 bg-gray-50 rounded-[32px]">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter mb-4">{title}</h3>
      <p className="text-gray-400 font-medium max-w-sm mb-10 leading-relaxed">
        {description}
      </p>
      {actionText && actionLink && (
        <Link 
          to={actionLink}
          className="flex items-center gap-2 bg-gov-blue text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gov-blue-dark transition-all shadow-xl shadow-blue-100 group active:scale-95"
        >
          {actionText}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>
  );
};
