# GOVVIVA — Briefing Técnico de Alinhamento (Frontend)
**Elaborado por:** Leader Técnico Frontend  
**Público-alvo:** Banca Examinadora, Corpo Docente, Equipe de Desenvolvimento e Stakeholders  

---

## 1. STACK TECNOLÓGICA (O QUE USAMOS E POR QUÊ)

Nossa stack foi selecionada com foco em três pilares principais: **desempenho de carregamento**, **manutenibilidade de código** e **agilidade no desenvolvimento**.

*   **React 19:** Escolhido por ser o padrão de mercado para interfaces SPA (Single Page Application) modernas e interativas. Sua reatividade inteligente garante que a interface atualize apenas as partes que mudaram de dados, oferecendo uma navegação instantânea.
*   **TypeScript 5.8:** Adiciona tipagem estática ao JavaScript. Isso impede bugs bobos e erros de sintaxe antes mesmo do código ser enviado para o servidor, fornecendo um autocompactador de código que agiliza o trabalho em equipe.
*   **Tailwind CSS v4.0:** Framework de estilização baseado em classes utilitárias. Permite construir uma interface 100% responsiva de forma rápida, mantendo o estilo padronizado através de variáveis (tokens de design) e arquivos extremamente leves para o usuário final.
*   **Vite v6.2:** Compilador e build tool que substitui o antigo *Create React App*. O Vite realiza a compilação do projeto em questão de milissegundos, gerando pacotes otimizados para produção.
*   **Axios / API Service:** Biblioteca utilizada para realizar as requisições assíncronas ao servidor backend. Configuramos interceptadores para gerenciar tokens automaticamente.
*   **Context API (AuthContext):** Estado global nativo do React utilizado para monitorar se o usuário está logado, quem ele é (Cidadão ou Admin) e propagar essa informação instantaneamente para todo o sistema.

---

## 2. ARQUITETURA E ORGANIZAÇÃO DE PASTAS

O frontend do GOVVIVA está organizado de forma modular dentro da pasta `/src/`, separando regras visuais, lógicas de comunicação e estados globais:

```text
src/
├── context/       # Estados globais (Ex: AuthContext - monitora sessão e usuário logado)
├── services/      # Integração de rede (Ex: api.ts - cliente Axios com interceptador JWT)
├── pages/         # Telas completas do sistema (Home, Login, Cadastro, Minhas Inscrições, Admin)
├── components/    # Blocos visuais reutilizáveis (Navbar, EventCard, CertificateButton, etc.)
├── types.ts       # Central de contratos (Define a estrutura exata de Usuários, Eventos e Inscrições)
├── index.css      # Design system unificado com Tailwind CSS
└── main.tsx       # Arquivo de entrada que dá o "boot" inicial no React
```

---

## 3. FLUXO OPERACIONAL DO SISTEMA NO FRONTEND

O ciclo de vida do usuário na interface segue as seguintes etapas:

1.  **Registro & Login:** O usuário preenche o formulário. O frontend envia as credenciais para o backend. Se tudo estiver correto, o backend responde com os dados do usuário e um token JWT assinado.
2.  **Persistência da Sessão:** O token JWT é armazenado com segurança no `localStorage` do navegador e o login do usuário é carregado no estado dinâmico do `AuthContext`.
3.  **Consumo da API & Envio do JWT:** Sempre que o frontend solicita dados (como carregar eventos), a instância do Axios em `services/api.ts` lê o token salvo no `localStorage` e o injeta automaticamente nos cabeçalhos (`headers`) da requisição.
4.  **Listagem de Eventos:** Na página inicial, o frontend consome a API do Flask, renderiza os eventos disponíveis e disponibiliza filtros interativos por categoria.
5.  **Inscrição Segura:** O usuário clica em "Inscrever-se". O frontend dispara um comando `POST`, o backend deduz a vaga no banco e responde com sucesso. A interface imediatamente atualiza o número de vagas disponíveis em tempo real.
6.  **Gerenciamento ("Minhas Atividades"):** O cidadão acompanha em quais conferências está inscrito de forma segura e imediata.
7.  **Painel Administrativo:** Filtra acessos. Apenas perfis do tipo `ADMIN` conseguem visualizar métricas de adesão nacional/municipal, cadastrar novas agendas públicas governamentais e visualizar logs.

---

## 4. COMPONENTIZAÇÃO INTELIGENTE (REUTILIZAÇÃO)

Dividimos a interface em cinco componentes chave altamente especializados:

*   **Navbar:** Cabeçalho padrão governamental. Adapta-se automaticamente: se o usuário estiver deslogado, mostra botões de login/registro; se cidadão, links de atividades; se administrador, atalhos do painel de controle.
*   **EventCard:** Cartão visual para listagem de eventos. Mostra título, data, local, categoria institucional e botão de ação inteligente (adapta-se caso as vagas estejam zeradas).
*   **RegistrationCard:** Cartão personalizado para o histórico do cidadão. Se o evento já ocorreu ou está ativo, exibe o crachá oficial e integra o botão de download de certificados.
*   **ProtectedRoute:** Componente invisível de segurança. Ele envolve as rotas administrativas e barra acessos diretos pelo navegador por pessoas não autorizadas, redirecionando o infrator imediatamente para a Home.
*   **CertificateButton:** Lógica integrada que utiliza o `jsPDF` no cliente para emitir, com formatação oficial, o certificado governamental completo com o número do protocolo de autenticidade (hash), minimizando processamento no servidor de produção.

---

## 5. EXPERIÊNCIA DO USUÁRIO (UX/UI INSTITUCIONAL)

Aplicamos regras de design institucionais para garantir confiança, acessibilidade e elegância:

*   **Identidade Visual Sólida:** Cores baseadas nas paletas oficiais de serviços públicos (Azul Marinho Real, Branco Puro e Cinza Slate).
*   **Responsividade Fluida (Mobile-First):** O sistema se redimensiona graciosamente e rearranja seus elementos para funcionar perfeitamente em telas pequenas (smartphones) e telas grandes (desktops).
*   **Feedback de Carregamento (Loading States):** Implementamos *Skeleton Shimmers* (efeito de luz pulsante de carregamento) nas listagens de eventos para que o usuário saiba que os dados estão vindo do servidor, eliminando telas travadas e melhorando a percepção de velocidade.
*   **Prevenção de Erros:** Bloqueios de cliques duplos durante inscrições (estados de submissão desabilitam os botões imediatos) para evitar re-envios.

---

## 6. INTEGRAÇÃO ASSÍNCRONA COM O BACKEND (FLASK)

A união das duas pontas é automatizada pelo nosso arquivo `src/services/api.ts`.
A engenharia funciona de acordo com a lógica abaixo:

```typescript
// Exemplo conceitual simplificado do nosso interceptador de segurança
import axios from 'axios';

const api = axios.create({
  baseURL: '/api' // URL mapeada no servidor de produção comum
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // JWT injetado de forma automatizada
  }
  return config;
});

export default api;
```
*   **Isolamento de Origem:** Não há problemas de CORS em ambiente de homologação, pois o próprio Flask serve os arquivos estáticos compilados em uma única porta (`3000`), mitigando portas cruzadas.

---

## 7. ROTEIRO RÁPIDO PARA A REUNIÃO (MINI Q&A)

Prepare-se para possíveis perguntas de avaliadores com essas respostas curtas e profissionais:

*   *“Por que React e não HTML/JS puro?”*  
    **Resposta:** "O React nos permite modularizar a nossa interface em componentes independentes. Isso acelera a manutenção do sistema, evita repetição de código e proporciona a experiência ágil de SPA (Single Page Application) onde a tela nunca recarrega por completo, simulando um aplicativo nativo."
*   *“Para que serve o TypeScript neste projeto?”*  
    **Resposta:** "O TypeScript funciona como uma camada de segurança extra sobre o JavaScript. Ele valida se as estruturas de dados vindas da API (como o formato de um evento) batem exatamente com o que a tela espera. Isso nos poupa de erros silenciosos em produção."
*   *“Como funciona a autenticação com o JWT?”*  
    **Resposta:** "É uma autenticação baseada em tokens assinados digitalmente. O frontend recebe o token do Flask no login, guarda-o no `localStorage` e envia de forma automática nos cabeçalhos das requisições de segurança."
*   *“Como os certificados em PDF são gerados?”*  
    **Resposta:** "Eles são gerados de forma instantânea diretamente no navegador do cidadão usando a biblioteca `jsPDF`. Isso economiza recursos preciosos do nosso servidor, pois o backend não precisa gastar energia renderizando ou armazenando arquivos pesados de imagem ou PDF."

---

## 8. SUMÁRIO DE 1 MINUTO (DISCURSO PRONTO)

> *"Olá a todos. No frontend do **GOVVIVA**, nós implementamos uma Single Page Application completa usando **React**, **TypeScript** e **Tailwind CSS**, orquestrada pelo compilador **Vite**.  
>  
> Nosso foco foi construir uma interface institucional robusta, segura e moderna. Organizamos as responsabilidades de forma modular: criamos um contexto global para cuidar de sessões ativas (**AuthContext**), rotas protegidas por controle de acesso (**ProtectedRoute**) e um interceptador de requisições que injeta automaticamente o token JWT.  
>  
> Atualmente, todo o ecossistema está integrado e funcional: o usuário pode se cadastrar, acessar eventos com filtro de categoria, confirmar inscrições em tempo real e baixar o certificado oficial assinado gerado em PDF diretamente pelo seu navegador. Tudo isso em um layout responsivo, limpo e com loadings dinâmicos. O frontend está pronto para demonstração institucional e homologação."*
