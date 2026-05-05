import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gov-blue-dark text-white pt-24 pb-12 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gov-blue"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-2">
                <div className="w-full h-full bg-gov-blue rounded-sm"></div>
              </div>
              <span className="text-2xl font-black uppercase tracking-tighter italic">GOV<span className="text-blue-300">VIVA</span></span>
            </div>
            <p className="text-blue-100/60 font-medium leading-relaxed">
              Maricá - RJ<br />
              Portal de Serviços Municipais e Participação Cidadã. 
              Garantindo transparência e eficiência administrativa.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">Estrutura de Gestão</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-blue-100/60 hover:text-white transition-colors font-semibold flex items-center gap-2 group text-xs uppercase tracking-wider"><ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" /> Secretaria de Cultura</a></li>
              <li><a href="#" className="text-blue-100/60 hover:text-white transition-colors font-semibold flex items-center gap-2 group text-xs uppercase tracking-wider"><ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" /> Secretaria de Governo</a></li>
              <li><a href="#" className="text-blue-100/60 hover:text-white transition-colors font-semibold flex items-center gap-2 group text-xs uppercase tracking-wider"><ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" /> Secretaria de Inovação</a></li>
              <li><a href="#" className="text-blue-100/60 hover:text-white transition-colors font-semibold flex items-center gap-2 group text-xs uppercase tracking-wider"><ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" /> Portal da Transparência</a></li>
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">Atendimento Oficial</h3>
            <ul className="space-y-6">
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-0.5">Central do Cidadão</p>
                  <p className="font-bold text-lg">0800 123 4567</p>
                </div>
              </li>
              <li className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-0.5">Ouvidoria Geral</p>
                  <p className="font-bold text-lg">ouvidoria@marica.rj.gov.br</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-blue-300">Sede Administrativa</h3>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-blue-100/60 font-medium leading-relaxed">
                Centro Administrativo Municipal<br />
                Rua da Cidadania, 1000<br />
                Centro, Maricá - RJ<br />
                CEP: 24900-000
              </p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-100/30">
              &copy; 2026 GOVVIVA - Secretaria Municipal de Gestão e Planejamento
            </p>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400/50 justify-center md:justify-start">
              <Shield className="w-3 h-3" /> Ambiente Seguro e Dados Protegidos (LGPD)
            </p>
          </div>
          <div className="flex items-center gap-8">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-100/30">Dados Abertos</span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-100/30">Privacidade</span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-100/30">Anotações Legais</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
