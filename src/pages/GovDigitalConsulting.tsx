import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Building, 
  TrendingUp, 
  Target, 
  Shield, 
  Lightbulb, 
  MapPin, 
  Users, 
  CheckCircle, 
  Info, 
  HelpCircle,
  FileText,
  Briefcase,
  Zap,
  DollarSign,
  Compass,
  ArrowRight,
  Database,
  Smartphone,
  ChevronRight,
  BookOpen,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const GovDigitalConsulting: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'diagnosis' | 'marica_strategy' | 'blueprint_2' | 'implementation'>('diagnosis');

  // Mumbuca Currency details or specific calculations for Maricá
  const maricaSpecs = {
    inhabitants: 200000,
    mumbucaUsers: 95000,
    targetEventsPerYear: 450,
    estimatedImpactRatio: 0.85, // 85% of citizens participating in city learning over 5 years
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Banner de Entrada Premium do Consultor */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-gov-blue text-white p-8 md:p-12 rounded-[40px] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)]"></div>
          <div className="absolute right-10 bottom-0 top-0 w-96 hidden lg:block opacity-10">
            <Building className="w-full h-full text-white" />
          </div>
          
          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-500/10 text-blue-300 border border-blue-500/25 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              Estudo de Caso & Visão de Futuro
            </div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-4">
              GOVVIVA V2.0: Visão de 5 Anos para Governo Digital
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-semibold leading-relaxed mb-6">
              Análise estratégica e redesenho de processos públicos para o município de <strong>Maricá - RJ</strong> (200 mil hab.). Integração pioneira de dados de capacitação cidadã, fomento socioeconômico via moedas sociais digitais e interoperabilidade federada.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-left">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Foco de Análise</span>
                <span className="font-extrabold text-sm text-emerald-300">Maricá / 200k Habitantes</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Conexão Econômica</span>
                <span className="font-extrabold text-sm text-emerald-300">Moeda Social Mumbuca</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Horas de Formação</span>
                <span className="font-extrabold text-sm text-emerald-300">Meta: 1.2M horas/ano</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Segurança Tecnológica</span>
                <span className="font-extrabold text-sm text-emerald-300">Assinatura Federal ICP-BR</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Structural Body */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEADING SIDE NAV TABS (4 cols for premium list navigation) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-6 rounded-[32px] border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Eixos Diagnósticos</h3>
            
            <div className="flex flex-col gap-1.5">
              {[
                { 
                  key: 'diagnosis', 
                  label: '1. Diagnóstico do Ecossistema', 
                  desc: 'Melhorias identificadas na governança atual',
                  icon: Target,
                  color: 'border-gov-blue hover:text-gov-blue'
                },
                { 
                  key: 'marica_strategy', 
                  label: '2. Vetor Estratégico Maricá', 
                  desc: 'Apostila prática de aplicação p/ 200k hab.',
                  icon: MapPin,
                  color: 'border-indigo-600 hover:text-indigo-600'
                },
                { 
                  key: 'blueprint_2', 
                  label: '3. Arquitetura 2.0 (Horizonte 5 Anos)', 
                  desc: 'Blockchain, IA e carteira federada',
                  icon: Layers,
                  color: 'border-purple-600 hover:text-purple-600'
                },
                { 
                  key: 'implementation', 
                  label: '4. Plano de Parcerias & Transição', 
                  desc: 'Milestones de fomento e maturidade municipal',
                  icon: Compass,
                  color: 'border-emerald-600 hover:text-emerald-600'
                }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSection === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveSection(tab.key as any)}
                    className={`text-left p-4.5 rounded-2xl border transition-all ${
                      isActive 
                        ? 'bg-slate-950 text-white border-slate-950 font-extrabold shadow-lg shadow-slate-950/15 scale-[1.01]' 
                        : 'bg-white text-gray-600 border-gray-150 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-300' : 'text-gray-400'}`} />
                      <span className="text-xs uppercase tracking-tight font-black">{tab.label}</span>
                    </div>
                    <p className={`text-[10px] pl-8 font-semibold ${isActive ? 'text-slate-300' : 'text-gray-400'}`}>
                      {tab.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini-Inbound de Indicador de Maturidade */}
          <div className="bg-slate-900 text-white p-6 rounded-[32px] border border-slate-800 space-y-4">
            <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Índice Municipal de Maturidade (IMM)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">92.4%</span>
              <span className="text-xs text-emerald-400 font-bold">▲ Excelente</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              Maricá está no topo das cidades inteligentes com a maior inserção socioeconômica digital, impulsionada pelo ecossistema tecnológico do GOVVIVA.
            </p>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full w-[92.4%]"></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE DOC BOARD (8 cols) */}
        <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[32px] border border-gray-150 shadow-sm min-h-[85vh] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            
            {/* PANEL 1: DIAGNOSIS OF ECOSYSTEM */}
            {activeSection === 'diagnosis' && (
              <motion.div
                key="diagnosis"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-black text-gray-950 uppercase tracking-tight mb-2">Diagnóstico de Maturidade do Ecossistema</h2>
                  <p className="text-xs text-gray-400 font-semibold">
                    Análise holística da versão atual do GOVVIVA, mapeando gargalos reais em eventos civis, cursos e workshops corporativos.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-red-50/30 border border-red-100 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-red-500 block mb-1">Gargalo 1: Saturação Física</span>
                    <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-tight mb-1">Assinatura de Presença</h4>
                    <p className="text-[10px] text-gray-500 leading-normal font-semibold">
                      Grandes conferências (acima de 5.000 pessoas) sofrem no credenciamento. Exige leituras sob barreira offline estrita no terminal de campo.
                    </p>
                  </div>

                  <div className="p-5 bg-amber-50/30 border border-amber-100 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-amber-600 block mb-1">Gargalo 2: Desmotivação Crônica</span>
                    <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-tight mb-1">Taxas de Evasão (Workshops)</h4>
                    <p className="text-[10px] text-gray-500 leading-normal font-semibold">
                      Taxa de conclusão cai em 35% ao longo das palestras se não houver um ciclo ativo de recompensas ou bonificações imediatas municipais.
                    </p>
                  </div>

                  <div className="p-5 bg-blue-50/30 border border-blue-100 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-gov-blue block mb-1">Gargalo 3: Isolamento Sistêmico</span>
                    <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-tight mb-1">Emissão Descentralizada</h4>
                    <p className="text-[10px] text-gray-500 leading-normal font-semibold">
                      Certificados emitidos sem carimbo criptográfico nacional direto dificultam o uso do diploma no mercado corporativo privado.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-black text-gray-950 uppercase tracking-tight flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-gov-blue" />
                    Oportunidades Estratégicas de Melhoria
                  </h3>
                  
                  <div className="space-y-3.5">
                    {[
                      {
                        title: "Integração Governamental Autônoma à Receita Federal",
                        desc: "Integração segura com as claims GOV.BR de forma que o cidadão seja mapeado na origem com autenticações ouro/prata, dispensando moderações contra fraude de CPF."
                      },
                      {
                        title: "Gamificação através de Moedas SociaisLocais (Mumbuca)",
                        desc: "Conversão direta das horas complementares assistidas em workshops em frações de crédito de bem-estar social, injetando liquidez imediata no pequeno comércio municipal."
                      },
                      {
                        title: "Rastreio e Auto-Auditoria Digital em Blockchain",
                        desc: "Imutabilidade de diplomas governamentais emitidos por gestores civis, promovendo a lisura e blindagem jurídica de todo o histórico formativo do habitante."
                      }
                    ].map((opp, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-150">
                        <span className="w-5 h-5 bg-blue-100 text-gov-blue font-mono font-black text-[10px] rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {i+1}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-xs text-gray-900 uppercase tracking-tight">{opp.title}</h4>
                          <p className="text-[11px] text-gray-550 mt-1 font-semibold leading-relaxed">{opp.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* PANEL 2: MARICA STRATEGIC INCUBATOR */}
            {activeSection === 'marica_strategy' && (
              <motion.div
                key="marica_strategy"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-indigo-950 uppercase tracking-tight mb-2">Vetor de Fomento de Maricá - RJ</h2>
                  <p className="text-xs text-gray-400 font-semibold">
                    Aplicação pragmática para a prefeitura com 200.000 habitantes. Uma revolução focada em inclusão financeira e social.
                  </p>
                </div>

                <div className="bg-indigo-950 p-6 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-indigo-900">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-emerald-300 tracking-wider">ECOSSISTEMA INTEGRADO</span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white leading-none">Mumbuca Digital: O Combustível do Conhecimento</h3>
                    <p className="text-xs text-slate-300 max-w-lg font-semibold mt-1.5 leading-relaxed">
                      Cidadãos que concluírem cursos municipais chancelados pelo GOVVIVA de Maricá acumularão créditos sociais diretos (Mumbuca) na sua carteira virtual, que podem ser resgatados imediatamente em quitandas de bairro, farmácias e feiras.
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-500 text-slate-900 rounded-2xl font-black text-center shrink-0">
                    <span className="block text-[8px] uppercase tracking-wider text-emerald-950">FATOR DE RECOMPENSA</span>
                    <span className="text-2xl">M$ 10.00</span>
                    <span className="block text-[8px] uppercase tracking-wider opacity-80">Por hora assistida</span>
                  </div>
                </div>

                {/* Specific calculations or modules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border border-gray-150 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-indigo-650">
                      <BookOpen className="w-4.5 h-4.5" />
                      <span className="text-[11px] font-black uppercase tracking-wider">Cursos e Oficinas de Economia Crítica</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                      A prefeitura utiliza os cursos do GOVVIVA para capacitar cidadãos beneficiários da Renda Básica de Cidadania (RBC). Emissão imediata de certificados no padrão LGPD e sincronia facial.
                    </p>
                  </div>

                  <div className="p-5 border border-gray-150 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-indigo-650">
                      <Calendar className="w-4.5 h-4.5" />
                      <span className="text-[11px] font-black uppercase tracking-wider">Workshops Integrados às Praças Públicas</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                      Comunidades de difícil acesso utilizam o <strong>Modo Offline-First</strong> do Aplicativo Móvel do organizador para coletar presenças sem internet via QR Code, sincronizando ao retornarem à prefeitura.
                    </p>
                  </div>
                </div>

                <div className="p-5 bg-emerald-50 text-emerald-850 rounded-2xl border border-emerald-100 flex items-start gap-3 text-xs leading-relaxed font-semibold">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-[#004B82] block mb-0.5">Estudo de Viabilidade Econômica</span>
                    Impacto esperado de **M$ 1.200.000 / ano** injetados diretamente na economia interna periférica de Maricá através da capacitação ativa e fomento do GOVVIVA.
                  </div>
                </div>
              </motion.div>
            )}

            {/* PANEL 3: BLUEPRINT 2.0 FOR 5 YEARS */}
            {activeSection === 'blueprint_2' && (
              <motion.div
                key="blueprint_2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-purple-950 uppercase tracking-tight mb-2">Soberania & Visão de Futuro (GOVVIVA 2.0)</h2>
                  <p className="text-xs text-gray-400 font-semibold">
                    Roadmap estruturado para 5 anos de independência tecnológica e eficiência cibernética nos processos públicos municipais.
                  </p>
                </div>

                <div className="relative border border-gray-150 rounded-3xl p-6 md:p-8 space-y-6">
                  {/* Timeline */}
                  <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-purple-200 hidden sm:block"></div>

                  {[
                    {
                      year: "Ano 1: Identidade Federal Federada",
                      title: "Vínculo Direto GOV.BR com Claims Unificados",
                      desc: "Toda a população e gestores municipais autenticam de forma rápida dispensando bancos de dados de senhas legados, garantindo níveis ouro/prata com criptografia assimétrica de chaves do celular."
                    },
                    {
                      year: "Ano 3: Blockchain de Licenciamento Cidadão",
                      title: "Cunhagem de Carga Horária via Smart Contracts",
                      desc: "Cada minuto acumulado em eventos, sabatinas públicas ou cursos vira um token criptográfico chancelado publicamente. Impossível fraudar históricos ou manipular registros de presença."
                    },
                    {
                      year: "Ano 5: IA de Sugestão de Políticas Públicas",
                      title: "Preditor Demográfico de Demandas por Capacitação",
                      desc: "A inteligência artificial do GOVVIVA cruza dados de frequência inter-secretarias de Maricá para prognosticar novos cursos públicos requeridos para combater desemprego setorial específico na cidade."
                    }
                  ].map((step, idx) => (
                    <div key={idx} className="relative sm:pl-8 space-y-1">
                      {/* Bullet on Timeline */}
                      <span className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-purple-600 border border-white shadow-sm -ml-1.5 hidden sm:block"></span>
                      
                      <span className="text-[10px] font-black text-purple-650 uppercase tracking-widest block">
                        {step.year}
                      </span>
                      <h4 className="font-extrabold text-sm text-gray-900 uppercase">
                        {step.title}
                      </h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                        {step.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PANEL 4: PARTNERSHIP & ROADMAP MATURITY */}
            {activeSection === 'implementation' && (
              <motion.div
                key="implementation"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-2xl font-black text-emerald-950 uppercase tracking-tight mb-2">Plano de Parcerias & Financiamento</h2>
                  <p className="text-xs text-gray-400 font-semibold">
                    Origem de fundos, parcerias público-privadas e viabilidade jurídica estrita dentro do arcabouço fiscal das leis de incentivo público.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-2xl border border-gray-150 space-y-2">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Parceiro Estratégico 1</span>
                    <h4 className="font-extrabold text-sm text-gray-900 uppercase">Banco CODEMAR (Maricá)</h4>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                      O Banco de Desenvolvimento de Maricá subsídia o hardware dos totens municipais de check-in integrados à biometria facial, otimizando o fluxo logístico em ginásios.
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-gray-150 space-y-2">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Parceiro Estratégico 2</span>
                    <h4 className="font-extrabold text-sm text-gray-900 uppercase">Ministério da Gestão e Inovação (MGI)</h4>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                      Adesão ao convênio do Gov.br SSO para concessão de barramento autenticador simplificado de menor latência do Brasil para o estado do Rio de Janeiro.
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-3">
                  <h4 className="text-xs font-black text-emerald-850 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Validação Jurídica (Compliance)
                  </h4>
                  <p className="text-xs text-emerald-850 leading-relaxed font-semibold">
                    Toda a sistemática de conversão de horas assistenciais de bem-estar em Mumbucas atende integralmente os Decretos Municipais de Fomento Social de Maricá, sem incidência tributária e sob blindagem da conformidade civil estrita de dados (LGPD).
                  </p>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

          {/* Inter-Tab Flow Progression Footer */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-[10px] font-black text-[#004B82] uppercase tracking-widest">
              Concepção Digital Governamental Integrada
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const tabs: ('diagnosis' | 'marica_strategy' | 'blueprint_2' | 'implementation')[] = ['diagnosis', 'marica_strategy', 'blueprint_2', 'implementation'];
                  const currentIndex = tabs.indexOf(activeSection);
                  const nextIndex = (currentIndex + 1) % tabs.length;
                  setActiveSection(tabs[nextIndex]);
                }}
                className="px-5 py-2.5 bg-gov-blue hover:bg-gov-blue-dark text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/10"
              >
                Próximo Eixo
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
