import React, { useState, useMemo } from 'react';
import { 
  Building2, Calendar, Users, CheckCircle, Award, 
  TrendingUp, Inbox, FileText, ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, 
  Tooltip, Bar, Cell, Legend 
} from 'recharts';
interface EventDetail {
  id: number;
  title: string;
  category: string;
  org_name: string;
  date_start: string;
  location: string;
  status: string;
  workload: number;
  org_responsible?: string;
  gestor_responsavel?: string;
  total_registrations: number;
  total_presence: number;
  total_certificates: number;
  total_slots: number;
}

interface MultiSecretariasDashboardProps {
  eventsDetails: EventDetail[];
}

const COLORS = ['#004B82', '#0284C7', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const MultiSecretariasDashboard: React.FC<MultiSecretariasDashboardProps> = ({ eventsDetails }) => {
  const [selectedSecretariatTab, setSelectedSecretariatTab] = useState<string>('Secretaria de Ciência e Tecnologia');

  // Agrupado de dados de cada secretaria de forma consolidada e computada em tempo real
  const secretariatMetrics = useMemo(() => {
    const defaultSecs = [
      'Secretaria de Ciência e Tecnologia',
      'Secretaria Municipal de Educação',
      'Secretaria Municipal de Saúde',
      'Secretaria Municipal de Governo',
      'Secretaria Municipal de Turismo',
      'Secretaria Municipal de Inovação e Tecnologia'
    ];

    const secretariatsUnion = Array.from(new Set([
      ...defaultSecs,
      ...eventsDetails.map(e => e.org_name).filter(Boolean)
    ]));

    return secretariatsUnion.map(secName => {
      const secEvents = eventsDetails.filter(e => e.org_name === secName);
      
      let events_count = secEvents.length;
      let total_slots_offered = secEvents.reduce((acc, curr) => acc + curr.total_slots, 0);
      let total_registrations = secEvents.reduce((acc, curr) => acc + curr.total_registrations, 0);
      let total_presence = secEvents.reduce((acc, curr) => acc + curr.total_presence, 0);
      let total_certificates = secEvents.reduce((acc, curr) => acc + curr.total_certificates, 0);
      
      const gestores = Array.from(new Set(secEvents.map(e => e.gestor_responsavel).filter(Boolean)));
      const categories = Array.from(new Set(secEvents.map(e => e.category).filter(Boolean)));

      const presenceRate = total_registrations > 0 ? Math.round((total_presence / total_registrations) * 100) : 0;
      const certRate = total_registrations > 0 ? Math.round((total_certificates / total_registrations) * 100) : 0;

      return {
        name: secName,
        events_count,
        total_slots_offered,
        total_registrations,
        total_presence,
        total_certificates,
        presenceRate,
        certRate,
        gestores: gestores.length > 0 ? gestores : ['Gestor Geral'],
        categories: categories.length > 0 ? categories : ['Geral']
      };
    });
  }, [eventsDetails]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="multi-sec-dashboard-root">
      
      {/* Bloco 1: Seleção de Secretaria Ativa (Filtro por Secretaria) */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm" id="sec-selector-card">
        <p className="text-[10px] font-black text-gov-blue uppercase tracking-widest mb-3">Módulo de Monitoramento Individual</p>
        <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mb-6">Filtragem Dinâmica de Desempenho</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="sec-buttons-grid">
          {secretariatMetrics.map((sec) => {
            const isActive = selectedSecretariatTab === sec.name;
            return (
              <button
                key={sec.name}
                id={`btn-sec-${sec.name.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => setSelectedSecretariatTab(sec.name)}
                className={`text-left p-5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between h-32 ${
                  isActive 
                    ? 'border-gov-blue bg-blue-50/10 ring-4 ring-gov-blue/5' 
                    : 'border-gray-150 hover:border-gray-300 bg-white hover:bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Building2 className={`w-5 h-5 ${isActive ? 'text-gov-blue' : 'text-gray-400'}`} />
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                      isActive ? 'bg-gov-blue text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {sec.events_count} Ativ.
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-gray-900 line-clamp-2 leading-tight uppercase">
                    {sec.name.replace('Secretaria Municipal de ', '').replace('Secretaria de ', '')}
                  </h4>
                </div>
                <div className="text-[10px] text-gray-400 font-semibold">
                  {sec.total_registrations.toLocaleString('pt-BR')} cidadãos inscritos
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scorecard Completo da Secretaria Escolhida */}
      {(() => {
        const currentSecIndex = secretariatMetrics.findIndex(s => s.name === selectedSecretariatTab);
        const sec = currentSecIndex !== -1 ? secretariatMetrics[currentSecIndex] : secretariatMetrics[0];
        if (!sec) return null;

        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="selected-sec-scorecard">
            {/* Ficha Social do Órgão */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm md:col-span-1 flex flex-col justify-between" id="sec-info-card">
              <div>
                <div className="flex items-center gap-2 mb-4 bg-blue-50 text-gov-blue px-3.5 py-1.5 w-max rounded-full">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[9px] font-black uppercase tracking-wider">Órgão Oficial Ofertante</span>
                </div>
                <h3 className="text-2xl font-black text-gray-950 uppercase tracking-tighter leading-tight mb-2">
                  {sec.name}
                </h3>
                <p className="text-xs text-gray-400 font-semibold mb-6">Divisão de Educação e Políticas Cidadãs</p>

                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">Gestores Públicos Responsáveis</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {sec.gestores.map(g => (
                        <span key={g} className="inline-block px-2.5 py-1 bg-gray-50 border border-gray-150 text-[10px] font-bold text-gray-600 rounded-lg">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block mb-1">Principais Categorias</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {sec.categories.map(c => (
                        <span key={c} className="inline-block px-2.5 py-1 bg-blue-50 text-[10px] font-bold text-gov-blue rounded-lg">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-semibold">
                <span>Status do Painel</span>
                <span className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase text-[9px] tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Ativo
                </span>
              </div>
            </div>

            {/* Diagnósticos de Capacitação do Órgão */}
            <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm md:col-span-2 space-y-6" id="sec-numeric-kpis">
              <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-gov-blue" />
                Indicadores de Aproveitamento da Secretaria
              </h3>

              {/* Caixa de números horizontais */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Atividades</span>
                  <p className="text-xl font-black text-gray-900 mt-1">{sec.events_count}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Vagas Ofertadas</span>
                  <p className="text-xl font-black text-gray-900 mt-1">{sec.total_slots_offered}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Inscritos</span>
                  <p className="text-xl font-black text-gray-900 mt-1">{sec.total_registrations}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-2xl text-center">
                  <span className="text-[9px] font-black uppercase tracking-wider text-gray-400">Diplomados</span>
                  <p className="text-xl font-black text-gray-900 mt-1">{sec.total_certificates}</p>
                </div>
              </div>

              {/* Barras de Desempenho com metas */}
              <div className="space-y-6 pt-4 border-t border-gray-100">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-2">
                    <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-widest text-gray-400">
                      Presença e Leitura de QR Codes
                    </span>
                    <span>{sec.presenceRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden animate-out">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${sec.presenceRate}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">
                    Taxa média de cidadãos que realizaram entrada e saída com sucesso usando QR code.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-2">
                    <span className="flex items-center gap-1.5 uppercase text-[10px] tracking-widest text-gray-400">
                      Aproveitamento / Emissão de Certificados
                    </span>
                    <span>{sec.certRate}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${sec.certRate}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5 font-semibold">
                    Percentual de inscritos habilitados a salvar ou imprimir diplomas com carga horária validada.
                  </p>
                </div>

              </div>
            </div>
          </div>
        );
      })()}

      {/* Atividades Oferecidas por essa Secretaria */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm" id="sec-activities-table-card">
        <h3 className="text-sm font-black text-gray-950 uppercase tracking-widest flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-gov-blue" />
          Atividades Governamentais Agendadas p/ a Secretaria Ativa
        </h3>

        {(() => {
          const currentSecIndex = secretariatMetrics.findIndex(s => s.name === selectedSecretariatTab);
          const sec = currentSecIndex !== -1 ? secretariatMetrics[currentSecIndex] : secretariatMetrics[0];
          const secEvents = eventsDetails.filter(e => e.org_name === sec?.name);

          if (secEvents.length > 0) {
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="sec-individual-activities-table">
                  <thead>
                    <tr className="border-b border-gray-150 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50">
                      <th className="p-4 rounded-l-2xl">Atividade</th>
                      <th className="p-4">Gestor Responsável</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4 text-center">Inscritos</th>
                      <th className="p-4 text-center">Presentes</th>
                      <th className="p-4 text-center">Certificados</th>
                      <th className="p-4 text-center rounded-r-2xl">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                    {secEvents.map(e => (
                      <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{e.title}</td>
                        <td className="p-4 text-gray-500 font-semibold">{e.gestor_responsavel}</td>
                        <td className="p-4 text-gray-400 font-semibold">{e.category}</td>
                        <td className="p-4 text-center font-mono font-bold text-gray-900">{e.total_registrations}</td>
                        <td className="p-4 text-center font-mono text-emerald-600 font-bold">{e.total_presence}</td>
                        <td className="p-4 text-center font-mono text-amber-600 font-bold">{e.total_certificates}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 text-[9px] font-extrabold uppercase rounded-full ${
                            e.status === 'CONCLUDED' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {e.status === 'CONCLUDED' ? 'Concluído' : 'Ativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          return (
            <div className="p-12 text-center text-gray-450 text-xs font-semibold">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              Nenhuma atividade oficial foi cadastrada para essa secretaria ainda.
            </div>
          );
        })()}
      </div>

      {/* SEÇÃO 3: RELATÓRIOS COMPARATIVOS (Ranking e Gráficos Comparativos) */}
      <div className="bg-white p-8 rounded-[32px] border border-gray-150 shadow-sm" id="comparative-reports-block">
        <h3 className="text-base font-black text-gray-950 uppercase tracking-tight flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-gov-blue" />
          Relatórios Comparativos Inter-Secretarias
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Ranking de Engajamento e Eficiência */}
          <div id="comparative-ranking-panel">
            <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-4">Ranking de Inscritos e Presenças</h4>
            <div className="space-y-4">
              {[...secretariatMetrics]
                .sort((a,b) => b.total_registrations - a.total_registrations)
                .map((sec, index) => {
                  return (
                    <div key={sec.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-6 h-6 rounded-lg font-mono text-[11px] font-black flex items-center justify-center shrink-0 ${
                          index === 0 ? 'bg-amber-100 text-amber-800' : index === 1 ? 'bg-slate-200 text-slate-800' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <h5 className="font-extrabold text-xs text-gray-900 truncate">
                            {sec.name.replace('Secretaria Municipal de ', '').replace('Secretaria de ', '')}
                          </h5>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {sec.events_count} atividades planejadas
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-3">
                        <span className="font-mono text-xs font-black text-gray-900">{sec.total_registrations} inscr.</span>
                        <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{sec.presenceRate}% pres. média</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Gráfico Comparativo Recharts de Eficiência */}
          <div id="comparative-graphic-panel">
            <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-4">Gráfico Analítico de Distribuição de Presença</h4>
            <div className="h-72 w-full mt-4 bg-gray-50/50 p-4 rounded-3xl border border-gray-150">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={secretariatMetrics.map(s => ({
                    aba: s.name.replace('Secretaria Municipal de ', '').replace('Secretaria de ', '').substring(0, 10),
                    'Inscrições': s.total_registrations,
                    'Diplomados': s.total_certificates
                  }))} 
                  margin={{ top: 10, right: 10, left: -25, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="aba" tick={{ fontSize: 9, fontWeight: 600, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 9, fontWeight: 600, fill: '#6B7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', color: '#FFFFFF', borderRadius: 12, border: 'none', fontSize: 11 }} />
                  <Bar dataKey="Inscrições" fill="#004B82" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Diplomados" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
        
        {/* Quadro Resumo Comparativo Analítico final */}
        <div className="overflow-x-auto mt-8 border-t border-gray-100 pt-8" id="comparative-detailed-table-block">
          <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-4">Quadro Resumo Analítico Consolidado</h4>
          <table className="w-full text-left border-collapse" id="comparative-detailed-table">
            <thead>
              <tr className="border-b border-gray-150 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50">
                <th className="p-4 rounded-l-2xl">Secretaria</th>
                <th className="p-4 text-center">Qtd Atividades</th>
                <th className="p-4 text-center">Vagas Totais</th>
                <th className="p-4 text-center">Inscritos Totais</th>
                <th className="p-4 text-center">Taxa de Presença %</th>
                <th className="p-4 text-center">Taxa de Certificação %</th>
                <th className="p-4 rounded-r-2xl">Gestor Principal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {secretariatMetrics.map(sec => (
                <tr key={sec.name} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{sec.name}</td>
                  <td className="p-4 text-center font-mono font-bold">{sec.events_count}</td>
                  <td className="p-4 text-center font-mono text-gray-500">{sec.total_slots_offered}</td>
                  <td className="p-4 text-center font-mono font-bold text-gray-900">{sec.total_registrations}</td>
                  <td className="p-4 text-center font-mono text-emerald-600 font-bold">{sec.presenceRate}%</td>
                  <td className="p-4 text-center font-mono text-amber-600 font-bold">{sec.certRate}%</td>
                  <td className="p-4 font-semibold text-gray-600">{sec.gestores[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
