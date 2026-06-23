import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  Settings, 
  Cpu, 
  Map, 
  Link as LinkIcon, 
  ShieldAlert, 
  Lock, 
  CheckCircle, 
  Info, 
  Code, 
  Database, 
  Layers, 
  Radio, 
  Tv, 
  Eye, 
  Camera, 
  Users, 
  Award, 
  QrCode, 
  FileText, 
  Menu,
  ChevronRight,
  TrendingUp,
  Inbox,
  UserCheck,
  Building,
  HelpCircle,
  Clock,
  MapPin,
  RefreshCw,
  Sliders,
  Maximize2
} from 'lucide-react';

export const MobileDocs: React.FC = () => {
  // Navigation tabs for the technical doc panel
  const [activeTab, setActiveTab] = useState<'architecture' | 'screens' | 'flows' | 'apis'>('architecture');
  
  // Mobile Simulator State
  const [simRole, setSimRole] = useState<'citizen' | 'organizer'>('citizen');
  const [simScreen, setSimScreen] = useState<string>('login'); // login, events, qrcode, certs, select_event, camera_scan, attendee_list, rep_view
  
  // Simulator form data (for interactivity)
  const [mockEmail, setMockEmail] = useState('nathalia@govviva.com');
  const [mockPwd, setMockPwd] = useState('••••••••');
  const [mockCpf, setMockCpf] = useState('445.667.112-88');
  const [mockName, setMockName] = useState('Mariana Ferreira Lima');
  const [mockLevel, setMockLevel] = useState<'BRONZE' | 'SILVER' | 'GOLD'>('SILVER');
  const [isLoggedSim, setIsLoggedSim] = useState(false);
  const [scannedCitizen, setScannedCitizen] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  
  // Offline toggle inside simulator
  const [isSimOffline, setIsSimOffline] = useState(false);

  // Quick preset loader
  const applySimPreset = (level: 'BRONZE' | 'SILVER' | 'GOLD') => {
    setMockLevel(level);
    if (level === 'GOLD') {
      setMockName('Carlos Alberto de Souza');
      setMockCpf('112.554.887-09');
    } else if (level === 'SILVER') {
      setMockName('Mariana Ferreira Lima');
      setMockCpf('445.667.112-88');
    } else {
      setMockName('Roberto Alves Cruz');
      setMockCpf('889.332.115-44');
    }
  };

  const handleSimLogin = (type: 'traditional' | 'govbr') => {
    setIsLoggedSim(true);
    if (type === 'govbr') {
      // Gov.br logins automatically route to QR-Code digital dynamic screen or Event Vitrine
      setSimScreen('events');
    } else {
      setSimScreen('events');
    }
  };

  const handleSimLogout = () => {
    setIsLoggedSim(false);
    setSimScreen('login');
    setScannedCitizen(null);
    setScanStatus(null);
  };

  const executeMockScan = (citizen: string) => {
    setScannedCitizen(citizen);
    setScanStatus('success');
    setTimeout(() => {
      setScanStatus(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-br from-[#004B82] to-[#0070C0] p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/20">
              Projeto e Engenharia de Software
            </span>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mt-3 mb-2">
              Documentação do App Móvel GOVVIVA
            </h1>
            <p className="text-sm text-blue-100 font-semibold max-w-2xl">
              Arquitetura em React Native, documentação de integração com GOV.BR, especificação completa de APIs, roteadores offline-first e um simulador móvel interativo para validação em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0 relative z-10">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-blue-200 font-bold">
              <Smartphone className="w-5 h-5 text-emerald-300" />
              Android & iOS • Expo SDK 51
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: TECH SPECIFICATIONS & DOCUMENTATION TAB ENGINE (7/12) */}
        <div className="lg:col-span-7 bg-white rounded-[32px] border border-gray-150 shadow-sm overflow-hidden flex flex-col min-h-[90vh]">
          
          {/* Tabs Navigation Header */}
          <div className="border-b border-gray-150 bg-gray-50/50 px-6 py-4 flex flex-wrap gap-2">
            {[
              { key: 'architecture', label: 'Arquitetura', icon: Layers },
              { key: 'screens', label: 'Especificação de Telas', icon: Smartphone },
              { key: 'flows', label: 'Fluxos Síncronos/Offline', icon: Map },
              { key: 'apis', label: 'Contrato de APIs', icon: LinkIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    isActive 
                      ? 'bg-gov-blue text-white shadow-md shadow-blue-500/10' 
                      : 'text-gray-500 hover:bg-gray-150/70 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Tab Content Renderer */}
          <div className="p-8 flex-grow">
            <AnimatePresence mode="wait">
              
              {/* TAB 1: ARCHITECTURE COMPONENT */}
              {activeTab === 'architecture' && (
                <motion.div
                  key="architecture"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mb-2">Estrutura de Engenharia Móvel</h3>
                    <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                      O aplicativo é estruturado sob o paradigma híbrido-nativo do Expo, maximizando o reuso de componentes estilizados com NativeWind v4 e preservando a rigidez de tipos do TypeScript.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50/20 border border-blue-150/50 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 text-gov-blue mb-2">
                        <Cpu className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Módulos Core React Native</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Focado em performance com renderização baseada em <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">FlatList</code> e ciclo de vida otimizado via React Hooks customizados sobre geolocalização e câmera nativa de varredura.
                      </p>
                    </div>

                    <div className="bg-emerald-50/20 border border-emerald-150/50 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 text-emerald-700 mb-2">
                        <Database className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-wider">SQLite & Offline-First</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        O banco local <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[10px]">expo-sqlite</code> mantém uma réplica completa de eventos e registros de presença, sincronizando de forma transparente via canais de repetição em segundo plano.
                      </p>
                    </div>

                    <div className="bg-amber-50/20 border border-amber-150/50 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 text-amber-700 mb-2">
                        <Code className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-wider">Zustand State Store</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Armazenamento leve do estado global. Controla sessões de login, cache de eventos e filas temporárias de sincronização local de presença de forma reativa e com zero fardo de processamento interno.
                      </p>
                    </div>

                    <div className="bg-indigo-50/20 border border-indigo-150/50 p-5 rounded-2xl">
                      <div className="flex items-center gap-2 text-indigo-700 mb-2">
                        <Sliders className="w-5 h-5" />
                        <span className="text-[11px] font-black uppercase tracking-wider">NativeWind (Tailwind CSS)</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Sistema unificado de classes de estilização móvel sob as mesmas regras visuais do painel web, acelerando o layout responsivo e o suporte nativo cross-platform.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150">
                    <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-3">E-S do Sistema (Hardware Requerido)</h4>
                    <ul className="space-y-3.5 text-xs text-gray-600 font-semibold">
                      <li className="flex items-start gap-2">
                        <Camera className="w-4.5 h-4.5 text-gov-blue shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-gray-900 block font-bold">Câmera de Auto-Foco Segura</span>
                          Usada no módulo organizador para scanner do QR Code em campo com filtragem integrada para lentes trêmulas.
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <MapPin className="w-4.5 h-4.5 text-gov-blue shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-gray-900 block font-bold">Serviço de Geolocalização Integrado</span>
                          Utilizado pelas secretarias para rastrear e validar a posição física do organizador (GPS) no exato instante do Check-in presencial garantindo auditoria anti-fraudes.
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Clock className="w-4.5 h-4.5 text-gov-blue shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <span className="text-gray-900 block font-bold">Armazenamento Protegido OS (Keychain)</span>
                          As chaves federativas do cidadão oriundas da autorização GOV.BR são trancadas em contêineres de criptografia no chip de segurança física do smartphone.
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center gap-3.5 p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800">
                    <Info className="w-5 h-5 text-gov-blue shrink-0" />
                    <span>
                      Dica do Simulador: Utilize o <strong>Painel do Smartphone ao Lado</strong> para experimentar e mudar de telas live e ver o emparelhamento visual em CSS puro!
                    </span>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SCREENS DETAIL COMPONENT */}
              {activeTab === 'screens' && (
                <motion.div
                  key="screens"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mb-2">Especificações dos Fluxos e Telas</h3>
                    <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                      Concepção de telas e especificações de interface nativa voltada à acessibilidade, com feedbacks vibratórios (Haptic) e contrastes em conformidade federal de design.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Citizen Mode */}
                    <div className="border border-gray-150 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-gov-blue"></span>
                        <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-tight">Experiência do Cidadão (Participante)</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                        <button 
                          onClick={() => { setSimRole('citizen'); setSimScreen('login'); }}
                          className="text-left p-4.5 bg-gray-50 hover:bg-gov-blue-light/30 border border-gray-150 rounded-xl transition-all"
                        >
                          <span className="font-black text-[10px] text-gov-blue uppercase block mb-1">Tela P1 • Login & GOV.BR</span>
                          Integração unificada. Entrada via senhas de banco de dados locais ou federativo com SSO Federal e verificação de nível.
                        </button>
                        
                        <button 
                          onClick={() => { setSimRole('citizen'); setSimScreen('events'); }}
                          className="text-left p-4.5 bg-gray-50 hover:bg-gov-blue-light/30 border border-gray-150 rounded-xl transition-all"
                        >
                          <span className="font-black text-[10px] text-gov-blue uppercase block mb-1">Tela P2 • Vitrine de Eventos</span>
                          Filtros rápidos por Secretaria realizadora, busca por texto e barra de progresso com vagas públicas disponíveis na hora.
                        </button>

                        <button 
                          onClick={() => { setSimRole('citizen'); setSimScreen('qrcode'); }}
                          className="text-left p-4.5 bg-gray-50 hover:bg-gov-blue-light/30 border border-gray-150 rounded-xl transition-all"
                        >
                          <span className="font-black text-[10px] text-gov-blue uppercase block mb-1">Tela P3 • Entrada Segura QR Code</span>
                          Gera o criptograma seguro de check-in offline. Aumenta automaticamente o brilho da tela do celular para leitura precisa.
                        </button>

                        <button 
                          onClick={() => { setSimRole('citizen'); setSimScreen('certs'); }}
                          className="text-left p-4.5 bg-gray-50 hover:bg-gov-blue-light/30 border border-gray-150 rounded-xl transition-all"
                        >
                          <span className="font-black text-[10px] text-gov-blue uppercase block mb-1">Tela P4 • Meus Certificados</span>
                          Bento-grid com histórico totalizador de carga horária acumulada e botão para baixar PDFs de diplomas oficiais direto no celular.
                        </button>
                      </div>
                    </div>

                    {/* Organizer Mode */}
                    <div className="border border-gray-150 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h4 className="font-extrabold text-sm text-gray-900 uppercase tracking-tight">Experiência do Fiscal de Campo (Organizador)</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                        <button 
                          onClick={() => { setSimRole('organizer'); setSimScreen('select_event'); }}
                          className="text-left p-4.5 bg-gray-50 hover:bg-emerald-50/55 border border-gray-150 rounded-xl transition-all"
                        >
                          <span className="font-black text-[10px] text-emerald-600 uppercase block mb-1">Tela O1 • Lista de Gestão</span>
                          Painel para o organizador baixar o espectro completo das inscrições do seu evento e setar o modo offline se necessário.
                        </button>

                        <button 
                          onClick={() => { setSimRole('organizer'); setSimScreen('camera_scan'); }}
                          className="text-left p-4.5 bg-gray-50 hover:bg-emerald-50/55 border border-gray-150 rounded-xl transition-all"
                        >
                          <span className="font-black text-[10px] text-emerald-600 uppercase block mb-1">Tela O2 • Câmera Scanner QR Code</span>
                          Carga contínua e leitura ultra rápida (menos de 150ms). Disparo imediato de avisos auditórios de sucesso ou falha.
                        </button>

                        <button 
                          onClick={() => { setSimRole('organizer'); setSimScreen('attendee_list'); }}
                          className="text-left p-4.5 bg-gray-50 hover:bg-emerald-50/55 border border-gray-150 rounded-xl transition-all"
                        >
                          <span className="font-black text-[10px] text-emerald-600 uppercase block mb-1">Tela O3 • Lista Nominal Manual</span>
                          Tabela de participantes completa. Busca direta e toggles manuais rápidos para celulares avariados ou sem QR code.
                        </button>

                        <button 
                          onClick={() => { setSimRole('organizer'); setSimScreen('rep_view'); }}
                          className="text-left p-4.5 bg-gray-50 hover:bg-emerald-50/55 border border-gray-150 rounded-xl transition-all"
                        >
                          <span className="font-black text-[10px] text-emerald-600 uppercase block mb-1">Tela O4 • Métricas de Campo</span>
                          Dashboard estatístico de presença com conversão e liberação de diplomas imediatos pós-encerramento da atividade.
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: FLOWS COMPONENT */}
              {activeTab === 'flows' && (
                <motion.div
                  key="flows"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mb-2">Conectividade & Tolerância a Falhas</h3>
                    <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                      Diagrama lógico do motor de sincronização. O GOVVIVA foi projetado para nunca travar ou perder presenças de cidadãos, registrando checkpoints robustos mesmo sem internet.
                    </p>
                  </div>

                  <div className="bg-gray-950 text-emerald-400 p-6 rounded-2xl border border-gray-850 font-mono text-xs space-y-4 shadow-inner">
                    <div className="border-b border-emerald-950/50 pb-2 text-emerald-500 font-black flex items-center justify-between">
                      <span>LÓGICA DO BUFFER OFFLINE (SYNC QUEUE)</span>
                      <span className="animate-pulse flex items-center gap-1.5"><Radio className="w-3.5 h-3.5" /> MONITOR ATIVO</span>
                    </div>
                    
                    <div className="space-y-2 leading-relaxed">
                      <p className="text-gray-400"># 1. Varredura do QR Code do participante pelo organizador:</p>
                      <p className="pl-4">Câmera detecta QR Code seguro -&gt; Valida SHA256 do hash internamente no App.</p>
                      
                      <p className="text-gray-400 mt-3"># 2. Avaliação de Redes e Conexões:</p>
                      <p className="pl-4 text-amber-300">IF NetInfo.isConnected === false OR API Timeout {`{`}</p>
                      <p className="pl-8 text-amber-300">// Grava instantaneamente na tabela SQLite local</p>
                      <p className="pl-8 text-amber-300">SQLite.execute("INSERT INTO presence_queue (regId, type, gps, ts) VALUES...")</p>
                      <p className="pl-8 text-amber-300">TriggerHapticFeedback("SUCCESS_DOUBLE_SHORT_TICK")</p>
                      <p className="pl-4 text-amber-300">{`}`} ELSE {`{`}</p>
                      <p className="pl-8">// Envia direto via requisição Axios HTTP POST</p>
                      <p className="pl-8">Axios.post("/api/presence/mark", payload)</p>
                      <p className="pl-4">{`}`}</p>

                      <p className="text-gray-400 mt-3"># 3. Sincronização Automática em Background:</p>
                      <p className="pl-4 text-[#10B981]">BackgroundFetch.onNetworkRestored(async () =&gt; {`{`}</p>
                      <p className="pl-8 text-[#10B981]">const queue = await SQLite.query("SELECT * FROM presence_queue")</p>
                      <p className="pl-8 text-[#10B981]">const result = await Axios.post("/api/presence/mark", queue)</p>
                      <p className="pl-8 text-[#10B981]">if (result.status === 200) SQLite.query("DELETE FROM presence_queue")</p>
                      <p className="pl-4 text-[#10B981]">{`}`})</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Vantagens Civis Dessa Arquitetura:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-150">
                        <span className="text-gray-900 font-bold block mb-1">Garantia LGPD Estrita</span>
                        Dados de presença de geolocalização e cadastrais do cidadão nunca transitam de forma plana ou transparente, sendo encriptados em buffers protegidos.
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-150">
                        <span className="text-gray-900 font-bold block mb-1">Sem Gargalos Logísticos</span>
                        Capacidade de processar fluxos de check-in em estádios esportivos ou praças públicas sem depender de conexões instáveis de telefonia celular nas nuvens.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: APIS COMPONENT */}
              {activeTab === 'apis' && (
                <motion.div
                  key="apis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-black text-gray-950 uppercase tracking-tight mb-2">Estrutura e Contrato de APIs Móveis</h3>
                    <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                      Mapeamento direto dos endpoints e dos contratos de JSON que o aplicativo React Native consome direto do servidor central Flask/GCP.
                    </p>
                  </div>

                  {/* Endoint 1 */}
                  <div className="border border-gray-150 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-150 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider rounded-md">POST</span>
                        <code className="font-mono text-xs font-bold text-gray-800">/api/auth/govbr/simulate</code>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Login / Federação SSO</span>
                    </div>
                    <div className="p-4 bg-gray-50 space-y-3 font-mono text-[10px] text-gray-600">
                      <div>
                        <span className="text-gray-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Request Payload JSON:</span>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
{`{
  "name": "Mariana Ferreira Lima",
  "email": "mariana.lima@silver.gov.br",
  "cpf": "445.667.112-88",
  "govbr_level": "SILVER" // BRONZE, SILVER, GOLD
}`}
                        </pre>
                      </div>
                      <div>
                        <span className="text-gray-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Response JSON (200 OK):</span>
                        <pre className="bg-gray-900 text-emerald-400 p-3 rounded-lg overflow-x-auto">
{`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 89,
    "name": "Mariana Ferreira Lima",
    "email": "mariana.lima@silver.gov.br",
    "cpf": "445.667.112-88",
    "role": "CITIZEN",
    "govbr_authenticated": true,
    "govbr_level": "SILVER"
  }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Endoint 2 */}
                  <div className="border border-gray-150 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 px-4 py-3 border-b border-gray-150 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider rounded-md">POST</span>
                        <code className="font-mono text-xs font-bold text-gray-800">/api/presence/mark</code>
                      </div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sincronizador Lotes</span>
                    </div>
                    <div className="p-4 bg-gray-50 space-y-3 font-mono text-[10px] text-gray-600">
                      <div>
                        <span className="text-gray-400 block font-bold text-[9px] uppercase tracking-wider mb-1">Request Payload JSON:</span>
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
{`{
  "event_id": 4,
  "records": [
    {
      "registration_id": 512,
      "type": "CHECK_IN",
      "timestamp": "2026-11-20T08:15:32-03:00",
      "latitude": -23.55052,
      "longitude": -46.633308,
      "offline_recorded": true
    }
  ]
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Download button and tech disclaimer footer */}
          <div className="border-t border-gray-150 p-6 bg-gray-50 bg-opacity-40 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black text-[#004B82] uppercase tracking-wider">Documentação Sincronizada</p>
              <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Disponível localmente no repositório em MOBILE_README.md</p>
            </div>
            <div className="bg-blue-50 text-gov-blue border border-blue-100 px-4.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-inner">
              Revisão de Engenharia V2.6
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE MOBILE SMARTPHONE SIMULATOR (5/12) */}
        <div className="lg:col-span-5 flex flex-col justify-center items-center">
          
          <div className="w-full max-w-[340px] mb-4 flex items-center justify-between p-1 bg-white rounded-2xl border border-gray-150 shadow-xs">
            <button 
              onClick={() => { setSimRole('citizen'); setSimScreen('login'); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                simRole === 'citizen' ? 'bg-gov-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Cidadão
            </button>
            <button 
              onClick={() => { setSimRole('organizer'); setSimScreen('select_event'); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                simRole === 'organizer' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Organizador (Fiscal)
            </button>
          </div>

          {/* Smartphone Frame Wrapper */}
          <div className="relative w-[340px] h-[680px] bg-slate-900 rounded-[52px] shadow-3xl p-3.5 border-4 border-slate-800 ring-[14px] ring-slate-950 ring-opacity-95 overflow-hidden flex flex-col justify-between">
            
            {/* Notch Speaker and Camera */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center gap-1.5 px-4">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-900/40 border border-blue-500/15" />
              <span className="w-14 h-1 bg-slate-850 rounded-full" />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-950" />
            </div>

            {/* Inner Phone Content (Always 100% height) */}
            <div className="w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col justify-between relative pt-6 text-gray-900 border border-slate-950/20 shadow-xs">
              
              {/* Phone Status Bar */}
              <div className="px-5 py-2 flex items-center justify-between bg-white text-[10px] font-black text-gray-400 border-b border-gray-50 shrink-0">
                <span className="font-mono">10:45</span>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsSimOffline(!isSimOffline)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-0.5 border ${
                      isSimOffline 
                        ? 'bg-red-50 text-red-600 border-red-200' 
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}
                  >
                    <span>{isSimOffline ? 'Sem Sinal' : '4G Online'}</span>
                  </button>
                  <span className="w-2.5 h-4 border border-gray-300 rounded-[3px] p-[1px] relative">
                    <span className="w-full h-full bg-gray-400 block rounded-[1px]" />
                    <span className="absolute -right-1 top-1 bg-gray-300 w-[2px] h-1.5 rounded-r-[1px]" />
                  </span>
                </div>
              </div>

              {/* Dynamic Screen Area */}
              <div className="flex-grow flex flex-col justify-between overflow-y-auto px-5 py-4 relative bg-gray-50/30">
                <AnimatePresence mode="wait">
                  
                  {/* SCREEN 1: LOGIN (Citizen and general entry) */}
                  {simScreen === 'login' && (
                    <motion.div
                      key="sim_login"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 flex flex-col justify-center h-full pt-4"
                    >
                      <div className="text-center mb-2">
                        <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 text-gov-blue">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <h4 className="font-black text-sm uppercase text-gray-900 tracking-tight leading-tighter">Portal Móvel GOVVIVA</h4>
                        <p className="text-[10px] text-gray-450 font-semibold mt-0.5">Sua carteira de participação oficial</p>
                      </div>

                      {/* Inputs */}
                      <div className="space-y-2">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-150 shadow-2xs">
                          <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider">E-mail do Cidadão</label>
                          <input 
                            type="text" 
                            disabled 
                            className="bg-transparent text-xs w-full font-bold text-gray-700 outline-none" 
                            value={mockEmail} 
                          />
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-150 shadow-2xs">
                          <label className="text-[8px] font-black uppercase text-gray-400 tracking-wider">Senha Secreta</label>
                          <input 
                            type="password" 
                            disabled 
                            className="bg-transparent text-xs w-full font-bold text-gray-700 outline-none" 
                            value={mockPwd} 
                          />
                        </div>
                      </div>

                      {/* Traditional Button */}
                      <button 
                        onClick={() => handleSimLogin('traditional')}
                        className="w-full py-2.5 bg-gov-blue text-white rounded-xl font-bold uppercase tracking-wider text-[9px] shadow-sm"
                      >
                        Acessar Conta
                      </button>

                      {/* Divider */}
                      <div className="flex items-center gap-2 justify-center my-1.5">
                        <span className="w-full h-[1px] bg-gray-150" />
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Ou</span>
                        <span className="w-full h-[1px] bg-gray-150" />
                      </div>

                      {/* Federated gov.br login */}
                      <button 
                        onClick={() => handleSimLogin('govbr')}
                        className="w-full py-3 bg-[#1351b4] text-white rounded-xl font-black uppercase tracking-wider text-[9px] shadow-md flex items-center justify-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded bg-emerald-400 animate-ping" />
                        Acessar com GOV.BR 🇧🇷
                      </button>
                    </motion.div>
                  )}

                  {/* SCREEN 2: EVENT LIST (Vitrine do Participante) */}
                  {simScreen === 'events' && (
                    <motion.div
                      key="sim_events"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[9px] font-black text-gov-blue uppercase tracking-widest">Ações Disponíveis</p>
                          <h4 className="font-extrabold text-sm text-gray-900 leading-none">Eventos Ativos</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-md text-[8px] font-black bg-blue-50 text-gov-blue border border-blue-100">
                          {mockName.split(' ')[0]}
                        </span>
                      </div>

                      {/* Search Bar Mockup */}
                      <div className="p-2.5 bg-white border border-gray-150 rounded-xl text-[10px] text-gray-400 font-semibold shadow-2xs">
                        🔍 Buscar atividade governamental...
                      </div>

                      {/* Filter list */}
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        <span className="px-2.5 py-1 bg-gov-blue text-white text-[8px] font-black uppercase rounded-lg shrink-0">Educação</span>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded-lg shrink-0">Saúde</span>
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[8px] font-black uppercase rounded-lg shrink-0">Esportes</span>
                      </div>

                      {/* Event Cards FlatList scroll mock */}
                      <div className="space-y-2 max-h-[290px] overflow-y-auto pr-0.5">
                        {[
                          { title: 'Treinamento de Brigadistas Municipais', cat: 'Proteção Civil', workload: 6, slots: '28 vagas' },
                          { title: 'Workshop: Gestão Financeira Cidadã', cat: 'Educação', workload: 4, slots: 'Sublimado' },
                          { title: 'Mutirão de Oftalmologia do Trabalhador', cat: 'Saúde', workload: 8, slots: '65 vagas restantes' },
                        ].map((evt, i) => (
                          <div key={i} className="bg-white p-3 rounded-xl border border-gray-150 hover:border-gov-blue transition-all shadow-2xs relative">
                            <span className="absolute top-2.5 right-2 text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">
                              {evt.slots}
                            </span>
                            <span className="text-[8px] font-black uppercase tracking-wider text-gov-blue block mb-1">{evt.cat}</span>
                            <h5 className="font-extrabold text-[11px] text-gray-900 leading-tight uppercase mb-1.5">{evt.title}</h5>
                            <div className="flex justify-between items-center text-[9px] text-gray-400 font-bold">
                              <span>⏱️ Carga: {evt.workload}h</span>
                              <button 
                                onClick={() => setSimScreen('qrcode')}
                                className="px-2 py-1 bg-gov-blue hover:bg-gov-blue-dark text-white font-black uppercase rounded text-[7px]"
                              >
                                Inscrever
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* SCREEN 3: QR CODE CARD (Participante) */}
                  {simScreen === 'qrcode' && (
                    <motion.div
                      key="sim_qrcode"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 flex flex-col justify-center h-full pt-2 text-center"
                    >
                      <div className="bg-white p-6 rounded-[28px] border border-gray-150 shadow-md">
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 bg-emerald-50 py-0.5 px-3 rounded-full w-max mx-auto">
                          Inscrição Condecorada
                        </p>
                        <h4 className="font-extrabold text-xs text-gray-900 leading-tight mb-4 uppercase">
                          Treinamento de Brigadistas Municipais
                        </h4>

                        {/* Simulated QR Code Criptografado */}
                        <div className="w-36 h-36 border-2 border-dashed border-gov-blue bg-blue-50/20 rounded-2xl mx-auto flex items-center justify-center p-3 mb-4 select-none relative group">
                          <QrCode className="w-full h-full text-gov-blue" />
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-3xs rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[7px] font-black text-gov-blue text-center uppercase tracking-widest px-2">
                              AES-256 SECURED SHA-256 SIGNED
                            </span>
                          </div>
                        </div>

                        <div className="font-mono text-[8px] text-gray-400 block mb-1">
                          CODENAME-EV4-REG512-VAL
                        </div>
                        <p className="text-[9px] text-gray-400 font-semibold px-2">
                          Apresente este código na portaria ao fiscal de campo. O brilho da tela foi aumentado ao máximo.
                        </p>
                      </div>

                      <button 
                        onClick={() => setSimScreen('certs')}
                        className="w-full py-2 bg-emerald-600 text-white font-black uppercase text-[8px] rounded-lg tracking-widest"
                      >
                        Simular Conclusão (Presença OK)
                      </button>
                    </motion.div>
                  )}

                  {/* SCREEN 4: MY CERTIFICATES LIST (Participante) */}
                  {simScreen === 'certs' && (
                    <motion.div
                      key="sim_certs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-sm text-gray-900 uppercase">Diplomas Concluídos</h4>
                        <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[8px] font-black rounded uppercase border border-yellow-200 shadow-3xs flex items-center gap-0.5">
                          ⭐ {mockLevel}
                        </span>
                      </div>

                      {/* Totals Grid */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="p-2.5 bg-white border border-gray-150 rounded-xl shadow-3xs">
                          <span className="text-[8px] text-gray-400 block font-bold uppercase">Carga Total</span>
                          <span className="font-black text-xs text-gray-900 mt-0.5 block">14 h</span>
                        </div>
                        <div className="p-2.5 bg-white border border-gray-150 rounded-xl shadow-3xs">
                          <span className="text-[8px] text-gray-400 block font-bold uppercase">Atividades</span>
                          <span className="font-black text-xs text-gray-900 mt-0.5 block">3 Concluídas</span>
                        </div>
                      </div>

                      {/* Cert list */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
                        {[
                          { title: 'Treinamento de Brigadistas Municipais', workload: 6, code: 'GOV-512-4' },
                          { title: 'Curso de Liderando Projetos Sociais', workload: 8, code: 'GOV-322-1' }
                        ].map((c, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-xl border border-gray-150 shadow-2xs relative">
                            <span className="text-[8px] font-extrabold text-emerald-600 uppercase block">Chancela Válida</span>
                            <h5 className="font-extrabold text-[10px] text-gray-900 leading-tight uppercase limit-line">{c.title}</h5>
                            <p className="text-[9px] text-gray-400 mt-1">Carga: {c.workload}h • Chave: {c.code}</p>
                            
                            <div className="flex gap-1.5 mt-2">
                              <button 
                                onClick={() => alert('Download do PDF do certificado simulado acionado.')}
                                className="flex-1 py-1 bg-gov-blue hover:bg-gov-blue-dark text-white rounded font-bold text-[7px] uppercase"
                              >
                                Baixar PDF
                              </button>
                              <button 
                                onClick={() => alert('Compartilhar certificado no LinkedIn simulado.')}
                                className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded font-bold text-[7px] uppercase"
                              >
                                Compartilhar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* SCREEN 5: ORGANIZER SELECT EVENT */}
                  {simScreen === 'select_event' && (
                    <motion.div
                      key="sim_select_event"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Organizador de Campo</p>
                        <h4 className="font-extrabold text-sm text-gray-900 uppercase">Selecione Atividade p/ Atendimento</h4>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 bg-white border-2 border-emerald-500 rounded-xl shadow-2xs">
                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">Educação e Esporte</span>
                          <h5 className="font-extrabold text-[11px] text-gray-900 uppercase leading-snug">Treinamento de Brigadistas Municipais</h5>
                          <p className="text-[9px] text-gray-400 mt-1 font-semibold">145 Inscrições Totais</p>
                          
                          <button 
                            onClick={() => setSimScreen('camera_scan')}
                            className="w-full mt-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[8px] font-black uppercase tracking-wider"
                          >
                            Iniciar Scanner Câmera
                          </button>
                        </div>

                        <div className="p-3 bg-white border border-gray-150 rounded-xl shadow-2xs text-gray-400">
                          <span className="text-[8px] font-black uppercase tracking-widest block mb-0.5">Assistência Social</span>
                          <h5 className="font-extrabold text-[11px] text-gray-500 uppercase leading-snug">Oficina de Autonomia Profissional Feminina</h5>
                          <p className="text-[9px] mt-1 font-semibold">54 Inscrições Ativas</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* SCREEN 6: ORGANIZER CAMERA SCANNER (Simula Scanner) */}
                  {simScreen === 'camera_scan' && (
                    <motion.div
                      key="sim_camera_scan"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 flex flex-col justify-between h-full relative"
                    >
                      {/* Simulates Camera Frame */}
                      <div className="w-full h-52 bg-slate-950 border-4 border-emerald-500 rounded-2xl relative overflow-hidden flex flex-col justify-center items-center">
                        
                        {/* Scanning Laser Line */}
                        <div className="absolute left-0 w-full h-1 bg-emerald-400 shadow-[0_0_12px_#34d399] anim-laser" style={{ top: '35%' }}></div>
                        
                        {/* Target border box */}
                        <div className="w-28 h-28 border-2 border-emerald-400 rounded-xl animate-pulse relative flex items-center justify-center p-2">
                          <QrCode className="w-full h-full text-emerald-400 opacity-60" />
                        </div>

                        <div className="absolute top-2 w-full text-center">
                          <span className="bg-emerald-650 text-white text-[7px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm">
                            CÂMERA ATIVA {isSimOffline ? 'OFFLINE' : 'ONLINE'}
                          </span>
                        </div>

                        <div className="absolute bottom-2 w-full text-center px-2">
                          <p className="text-[8px] text-gray-300 font-bold leading-none">
                            Aponte a lente para o QR Code do Cidadão no telefone.
                          </p>
                        </div>
                      </div>

                      {/* Floating Scan Result/Feedback */}
                      {scanStatus === 'success' && (
                        <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-xl text-center shadow-md animate-in slide-in-from-bottom-2">
                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block mb-0.5">✓ Vínculo Identificado</span>
                          <p className="text-[10px] font-black text-gray-900 leading-none">{scannedCitizen}</p>
                          <p className="text-[8px] text-emerald-700 font-semibold mt-1">Presença registrada com sucesso no {isSimOffline ? 'SQLite Local' : 'Servidor Central'}!</p>
                        </div>
                      )}

                      {/* Mockup scanner trigger Buttons */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block text-center">Gatilho de Simulação de Leitura:</span>
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={() => executeMockScan('Mariana Ferreira Lima')}
                            className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[7px] font-black uppercase border border-emerald-200"
                          >
                            Mariana
                          </button>
                          <button 
                            type="button" 
                            onClick={() => executeMockScan('Carlos Alberto de Souza')}
                            className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[7px] font-black uppercase border border-emerald-200"
                          >
                            Carlos
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button 
                          onClick={() => setSimScreen('attendee_list')}
                          className="flex-1 py-2 bg-gray-150 text-gray-600 rounded-lg text-[8px] font-extrabold uppercase"
                        >
                          Manual
                        </button>
                        <button 
                          onClick={() => setSimScreen('rep_view')}
                          className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-[8px] font-black uppercase"
                        >
                          Métricas
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* SCREEN 7: ORGANIZER ATTENDEE NOMINAL LIST */}
                  {simScreen === 'attendee_list' && (
                    <motion.div
                      key="sim_attendee_list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-xs text-gray-900 uppercase">Inscrições Nominais</h4>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[8px] font-bold">145 total</span>
                      </div>

                      {/* Search Bar */}
                      <div className="p-2 bg-white border border-gray-150 rounded-lg text-[9px] text-gray-400 font-semibold">
                        🔍 Procurar por nome ou CPF do cidadão...
                      </div>

                      {/* Attendee list nominal select mock */}
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5">
                        {[
                          { name: 'Mariana Ferreira Lima', cpf: '***.667.112-**', active: true },
                          { name: 'Carlos Alberto de Souza', cpf: '***.554.887-**', active: true },
                          { name: 'Roberto Alves Cruz', cpf: '***.332.115-**', active: false },
                          { name: 'Nathalia Zetgshce Pinheiro', cpf: '***.331.002-**', active: false },
                        ].map((p, idx) => (
                          <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-150 flex items-center justify-between text-[10px] shadow-3xs">
                            <div>
                              <p className="font-bold text-gray-900 leading-tight">{p.name}</p>
                              <p className="text-[8px] text-gray-400 mt-0.5 font-mono">{p.cpf}</p>
                            </div>
                            
                            <button 
                              onClick={() => executeMockScan(p.name)}
                              className={`px-2 py-1 text-[8px] font-black uppercase rounded ${
                                p.active 
                                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                  : 'bg-gray-150 text-gray-500'
                              }`}
                            >
                              {p.active ? 'Presente' : 'Registrar'}
                            </button>
                          </div>
                        ))}
                      </div>

                    </motion.div>
                  )}

                  {/* SCREEN 8: ORGANIZER REPORT METRICS VIEW */}
                  {simScreen === 'rep_view' && (
                    <motion.div
                      key="sim_rep_view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Resumo de Auditoria</p>
                        <h4 className="font-extrabold text-sm text-gray-900 uppercase">Indicadores do Evento</h4>
                      </div>

                      <div className="space-y-2">
                        <div className="p-3 bg-white border border-gray-150 rounded-xl shadow-2xs">
                          <div className="flex justify-between items-center mb-1 text-[10px]">
                            <span className="text-gray-400 font-bold block">Taxa de Presença</span>
                            <span className="font-black text-gray-900">88.27%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '88.27%' }} />
                          </div>
                        </div>

                        <div className="p-3 bg-white border border-gray-150 rounded-xl shadow-2xs">
                          <div className="flex justify-between items-center mb-1 text-[10px]">
                            <span className="text-gray-400 font-bold block">Certificados Prontos</span>
                            <span className="font-black text-gray-900">115 diplomas</span>
                          </div>
                          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: '79%' }} />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 text-center">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ação Conclusiva</span>
                        <button 
                          onClick={() => alert('Sincronização forçada concluída com o banco GOVVIVA. Relatórios homologados!')}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[8px] font-black uppercase tracking-wider"
                        >
                          Sincronizar e Encerrar Atividade
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* Home bar button for phone */}
              {isLoggedSim && (
                <div className="px-5 py-3 border-t border-gray-50 flex justify-center items-center shrink-0">
                  <button 
                    onClick={handleSimLogout}
                    className="w-24 h-1 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors"
                  />
                </div>
              )}

            </div>
          </div>

          {/* Quick instructions under mobile frame */}
          <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-150 text-center text-xs text-gray-500 max-w-[340px]">
            <HelpCircle className="w-4 h-4 text-gov-blue mx-auto mb-1" />
            <p className="font-bold text-gray-900 mb-0.5">Explore os modos clicando nos botões acima</p>
            Altere entre o perfil de Cidadão ou Organizador para avaliar o design das interfaces React Native projetadas.
          </div>

        </div>

      </div>

    </div>
  );
};
