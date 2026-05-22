# GOVVIVA — Plataforma de Gestão de Eventos Públicos e Certificação

O **GOVVIVA** é um ecossistema completo e moderno projetado para otimizar, gerenciar e auditar eventos e conferências oficiais promovidos pela administração pública. Unindo uma experiência ágil de autoatendimento para o cidadão a um robusto painel de controle administrativo, a plataforma garante total integridade nas inscrições, controle de capacidade em tempo real, segurança por restrição hierárquica (RBAC) e geração autônoma de certificados de participação com assinaturas digitais simuladas e validação criptográfica de protocolo.

---

## 🛠️ Stack Tecnológica de Alta Performance

### 1. Backend (API REST)
*   **Linguagem:** Python 3.10+
*   **Framework Principal:** Flask v3.0.0 (Estruturação modular por Application Factory)
*   **Mapeamento Objeto-Relacional (ORM):** Flask-SQLAlchemy v3.1.1 (Interação e persistência com transações seguras)
*   **Autenticação e Sessão:** Flask-JWT-Extended v4.5.3 (Sessões Stateless guiadas por tokens assinados)
*   **Middlewares & Segurança:** 
    *   `Werkzeug v3.0.1` — Criptografia de senhas usando algoritmo saltado pbkdf2:sha256.
    *   `Flask-Cors v4.0.0` — Controle rigoroso de origens para as requisições do frontend.

### 2. Frontend (Single-Page Application)
*   **Framework React:** v19.0.1 com suporte nativo a Hooks e renderização condicional assíncrona.
*   **Linguagem:** TypeScript v5.8 (Tipagem estática e segurança em tempo de compilação em todas as interfaces).
*   **Ferramenta de Build:** Vite v6.2 (Pipelines ágeis para geração de pacotes leves no ambiente de produção).
*   **Estilização Visual:** Tailwind CSS v4.0 (Utilização de classes utilitárias modernas e tokens de design fluidos).
*   **Motion Designer:** Motion (anterior Framer Motion) v12.23 (Destaque para micro-interações, feedbacks suaves e transições elegantes).
*   **Ícones e Vetores:** Lucide React v0.546 (Interface limpa com design minimalista).
*   **Geração de Documentos:** jsPDF v4.2 (Geração nativa de PDFs de certificados e relatórios sem sobrecarga de rede).

### 3. Banco de Dados e Armazenamento
*   **Motor:** SQLite (Persistência imediata e relacional via `/database.db` no diretório raiz do projeto).
*   **Semeador (Seeding):** Embutido na inicialização para gerar automaticamente perfis administrativos e conferências modelo caso o banco de dados esteja nulo.

---

## 🏗️ Arquitetura de Software (Monólito Modular Integrado)

O GOVVIVA adota uma **Arquitetura de Monólito Modular**. O servidor Flask gerencia as transações de dados e regras de negócio de maneira isolada pelas camadas de rotas e services, ao mesmo tempo que atua como hospedeiro dos artefatos estáticos.

### Fluxo de Comunicação Operacional
```text
┌─────────────────┐             JSON over HTTP             ┌─────────────────────┐
│                 │ <────────────────────────────────────> │  Flask Backend API  │
│  React Frontend │     (Auth, Events, Registrations)      │  (Application Root) │
│   (Port 3000)   │                                        └──────────┬──────────┘
│                 │ <────────────────────────────────────┐            │
└─────────────────┘        Serves Static Bundle          │            ▼
                        (dist/index.html & assets)       │     ┌─────────────┐
                                                         └──── │  SQLite DB  │
                                                               │(database.db)│
                                                               └─────────────┘
```

1.  **Frontend (SPA):** Interage com a API RESTful baseada em endpoints estruturados sob o prefixo `/api/`. O cliente utiliza um contexto global (`AuthContext`) que armazena em cache o token JWT obtido no login.
2.  **API Gateway Interno/Flask:** Processa requisições através de Blueprints organizados por contexto (autenticação, eventos e registros). O roteador estático em `run.py` redireciona qualquer requisição externa (não prefixada com `/api`) para o arquivo estático `dist/index.html` gerado pelo pipeline do Vite.
3.  **Persistência Relacional:** O Flask-SQLAlchemy mapeia as tabelas, mantendo relacionamentos lógicos (e integridade referencial) e disparando commits atômicos no SQLite.

---

## 📁 Estrutura Física do Projeto

A organização das pastas respeita a separação rigorosa de conceitos entre a governança de dados do Backend e as dinâmicas de renderização do Frontend:

```text
├── app/                        # CAMADA DE BACKEND (FLASK)
│   ├── routes/                 # Blueprints de Roteamento da API
│   │   ├── auth.py             # Registro, Login e Verificação de Estado (/api/auth)
│   │   ├── docs.py             # Renderização e disponibilização da Documentação (/docs)
│   │   ├── events.py           # Gestão de Eventos (/api/events)
│   │   └── registrations.py    # Processamento de Matrículas (/api/registrations)
│   ├── __init__.py             # Application Factory e Semeador (Seed) do Banco
│   ├── config.py               # Definição e Parse das Variáveis de Configuração
│   ├── extensions.py           # Inicialização Desacoplada de Instâncias do ORM, JWT e CORS
│   ├── models.py               # Esquemas Declarativos e Serializadores de Entidades
│   └── services.py             # Serviços de Negócio (Cálculo de vagas, inscrições e cadastros)
├── src/                        # CAMADA DE FRONTEND (REACT + TS)
│   ├── components/             # Peças de UI e Visualizadores Reutilizáveis
│   │   ├── CertificateButton.tsx  # Lógica de Emissão Dinâmica do PDF do Certificado
│   │   ├── EmptyState.tsx      # Estados Vazios para Componentes de Listas
│   │   ├── EventCard.tsx       # Renderização Individualizada de Atividades
│   │   ├── Footer.tsx          # Rodapé Institucional
│   │   ├── Navbar.tsx          # Cabeçalho Principal e Monitor de Perfil
│   │   ├── ProtectedRoute.tsx  # Guarda de Rotas Baseada em Perfis (RBAC)
│   │   ├── RegistrationCard.tsx   # Exibição de Evento com Integração de Diplomas
│   │   └── SkeletonCard.tsx    # Simulador de Carregamento Assíncrono (Shimmer Effect)
│   ├── context/
│   │   └── AuthContext.tsx     # Estado Centralizado de Identidade do Usuário
│   ├── hooks/                  # Custom React Hooks
│   ├── pages/                  # Telas Principais do Fluxo SPA
│   │   ├── AdminDashboard.tsx  # Métricas Públicas, Criação de Eventos e Acesso às Docs
│   │   ├── Home.tsx            # Filtros por Categoria e Vitrine de Eventos
│   │   ├── Login.tsx           # Tela de Login com Feedback de Erro
│   │   ├── MyRegistrations.tsx # Histórico de Reservas e Emissões do Cidadão
│   │   └── Register.tsx        # Formulário de Cadastro para Cidadãos
│   ├── services/
│   │   └── api.ts              # Cliente Axios/Instância de Conexão com Interceptadores JWT
│   ├── index.css               # Importações Principais do Tailwind CSS
│   ├── main.tsx                # Bootstrap Principal da Aplicação React
│   └── types.ts                # Definição Estrita de Interfaces TS Compartilhadas
├── run.py                      # Script Unificado de Inicialização do Servidor de Produção
├── requirements.txt            # Manifesto de Requisitos Python
├── package.json                # Manifesto de Dependências Node.js
├── database.db                 # Banco de Dados SQLite (Gerado automaticamente em tempo de execução)
└── tsconfig.json               # Regras do Compilador TypeScript
```

---

## 🗄️ Modelagem de Dados (ERD & Esquemas Relacionais)

A modelagem de dados do GOVVIVA foi projetada para garantir consistência em ambientes concorrentes, utilizando relacionamentos estritos por chaves estrangeiras (`Foreign Keys`) e restrições de integridade.

```text
┌─────────────────┐             1:N             ┌─────────────────┐
│     User        │ ──────────────────────────> │      Event      │
│ (users Table)   │                             │ (events Table)  │
└────────┬────────┘                             └────────┬────────┘
         │                                               │
         │ 1:N                                           │ 1:N
         │         ┌───────────────────────────┐         │
         └────────>│       Registration        │<────────┘
                   │  (registrations Table)    │
                   │                           │
                   │ Constraint:               │
                   │ UNIQUE(user_id, event_id) │
                   └───────────────────────────┘
```

### 1. Tabela `users` (Entidade Perfil)
Responsável pelo registro de Cidadãos (`CITIZEN`) e Gestores Administrativos (`ADMIN`).
*   `id` (Integer, Primary Key): Identificador único indexado automaticamente.
*   `name` (String(100), NOT NULL): Nome completo do usuário.
*   `email` (String(120), Unique, Index, NOT NULL): Identificador de login do usuário.
*   `password_hash` (String(256), NOT NULL): Senha criptografada por PBKDF2 com Salt correspondente.
*   `role` (String(20), Default: `'CITIZEN'`): Nível de permissão (`CITIZEN` ou `ADMIN`).
*   `org_id` (String(50), Nullable): Referência à organização ou secretaria associada (obrigatório para ADMINs).
*   `created_at` (DateTime, Default: `datetime.utcnow`): Registro cronológico de criação.

### 2. Tabela `events` (Entidade Evento)
Contém todas as informações públicas dos eventos institucionais promovidos.
*   `id` (Integer, Primary Key): Identificador primário do evento.
*   `title` (String(200), NOT NULL): Título público da atividade.
*   `description` (Text): Descrição editorial detalhada das diretrizes.
*   `date_start` (DateTime, NOT NULL): Data e hora programada para início da atividade.
*   `location` (String(200), NOT NULL): Endereço físico ou canal digital oficial.
*   `total_slots` (Integer, NOT NULL): Capacidade máxima de participação estipulada.
*   `available_slots` (Integer, NOT NULL): Controle remanescente de vagas atualizado dinamicamente.
*   `category` (String(50), NOT NULL): Classificação do evento (ex: *Cultura*, *Capacitação*, e *Gestão Pública*).
*   `status` (String(20), Default: `'ACTIVE'`): Indica se o evento está aceitando cadastros (`ACTIVE` ou `CLOSED`).
*   `creator_id` (Integer, Foreign Key -> `users.id`): Identificador do administrador criador.
*   `org_id` (String(50)): ID oficial da secretaria municipal organizadora.
*   `org_name` (String(100)): Nome descritivo da secretaria municipal organizadora.

### 3. Tabela `registrations` (Entidade Matrícula)
Tabela associativa que consolida a participação dos cidadãos nos eventos.
*   `id` (Integer, Primary Key): ID da transação de matrícula.
*   `user_id` (Integer, Foreign Key -> `users.id`, NOT NULL): ID do cidadão matriculado.
*   `event_id` (Integer, Foreign Key -> `events.id`, NOT NULL): ID do evento solicitado.
*   `registered_at` (DateTime, Default: `datetime.utcnow`): Registro de data e hora do processamento da vaga.
*   `status` (String(20), Default: `'CONFIRMED'`): Estado da inscrição (`CONFIRMED` ou `CANCELLED`).
*   **Restrição Estrita:** `UniqueConstraint('user_id', 'event_id')` — Impede que um mesmo usuário reserve mais de um assento no mesmo evento sob qualquer condição.

---

## 🔒 Autenticação e Protocolos de Segurança

O sistema adota padrões rigorosos para proteção contra acessos indevidos e corrupção de dados:

1.  **Criptografia na Origem:** O registro de contas novas passa pelo gerador saltado de senhas Werkzeug (`generate_password_hash`), impossibilitando o vazamento em formato legível de chaves de acesso.
2.  **Autenticação por JWT (Stateless Token):** A validação é baseada em assinaturas digitais por tokens com validade de 24 horas. O token é gerado no backend no endpoint `/api/auth/login` e deve ser injetado no cabeçalho HTTP de requisições protegidas:
    ```http
    Authorization: Bearer <token_jwt_assinado>
    ```
3.  **Filtragem de Permissões de Acesso (RBAC):**
    *   No Backend: Rotas como criação de eventos (`POST /api/events`) e listagens gerais possuem uma verificação forçada do status do usuário no banco. Caso o perfil não seja `ADMIN`, é imediatamente retornado o erro `403 Forbidden`.
    *   No Frontend: O componente `<ProtectedRoute>` valida a carga de autorização no `AuthContext` do React. Cidadãos comuns que tentem forçar entrada no endereço `/admin` são automaticamente encaminhados de volta para a `/` protegendo a visualização dos dados.

---

## 🔁 Fluxo Operacional Unificado (Passo a Passo)

```text
 CIDADÃO                   FRONTEND (SPA)           BACKEND (API)            BANCO DE DADOS
   │                             │                         │                       │
   │─── Preenche Cadastro ──────>│                         │                       │
   │                             │─── POST /auth/register ─>│                       │
   │                             │                         │─── Insere Registro ──>│
   │                             │<── Status 201 (Criad) ──│                       │
   │                             │                         │                       │
   │─── Realiza o Login ────────>│                         │                       │
   │                             │─── POST /auth/login ───>│                       │
   │                             │                         │─── Valida Senha ─────>│
   │                             │<── Retorna Token ───────│                       │
   │                             │                         │                       │
   │─── Filtra & Escolhe Evento ─>│                         │                       │
   │                             │─── POST /registrations >│                       │
   │                             │    (Token no Header)    │─── Verifica Vagas ───>│
   │                             │                         │─── Valida Duplicidade─>│
   │                             │                         │─── Decrementa Vaga ──>│
   │                             │                         │─── Confirma Inscrição─>│
   │                             │<── Status 201 ──────────│                       │
   │                             │                         │                       │
   │─── Baixa Certificado ──────>│                         │                       │
   │                             │  (jsPDF gera na hora    │                       │
   │                             │   com Hash de Assinat)  │                       │
```

---

## 📌 Principais Endpoints da API REST

Toda a troca de dados entre o cliente e o servidor de dados do GOVVIVA utiliza o formato JSON:

### 📑 Serviços de Autenticação e Perfil
*   **POST `/api/auth/register`** — Criação de um novo perfil institucional.
    *   *Payload:* `{"name": "Nome Completo", "email": "cidadao@exemplo.com", "password": "senha_segura"}`
    *   *Resposta:* `201 Created` — `{"message": "Usuário criado!", "user": {"id": 1, ...}}`
*   **POST `/api/auth/login`** — Autenticação do Usuário e provisionamento do Token JWT.
    *   *Payload:* `{"email": "cidadao@exemplo.com", "password": "senha_segura"}`
    *   *Resposta:* `200 OK` — `{"token": "JWT_TOKEN_HERE", "user": {"id": 1, "name": "...", ...}}`
*   **GET `/api/auth/me`** — Retorna dados sensíveis do portador do Token JWT (Requer Token no Header).
    *   *Resposta:* `200 OK` — `{"id": 1, "name": "Nome", "email": "...", "role": "CITIZEN"}`

### 📅 Serviços de Gerenciamento de Atividades (Eventos)
*   **GET `/api/events`** — Listagem de todos os eventos catalogados como ativos ordenados por data cronológica.
    *   *Resposta:* `200 OK` — `[{"id": 1, "title": "...", "available_slots": 195, ...}]`
*   **POST `/api/events`** — Criação de novos eventos administrativos (Exclusivo para ADMIN, Requer Token no Header).
    *   *Payload:* `{"title": "Novo Evento", "description": "...", "date_start": "2026-06-25T14:00:00", "location": "Auditório", "total_slots": 100, "category": "Cultura"}`
    *   *Resposta:* `201 Created` — `{"id": 4, "title": "Novo Evento", "available_slots": 100, ...}`

### 🎫 Serviços de Controle de Matrículas e Presenças
*   **POST `/api/registrations`** — Inscreve o Cidadão conectado em um determinado evento (Requer Token no Header).
    *   *Payload:* `{"event_id": 1}`
    *   *Resposta:* `201 Created` — `{"message": "Inscrição confirmada!", "id": 15}`
*   **GET `/api/registrations/me`** — Histórico de inscrições do cidadão para acompanhamento e emissão de certificados (Requer Token no Header).
    *   *Resposta:* `200 OK` — `[{"registration_id": 15, "status": "CONFIRMED", "event": {"id": 1, "title": "Conferência...", ...}}]`

---

## 🗝️ Credenciais Oficiais para Homologação e Testes

Para agilizar o processo de demonstração e auditoria em ambientes homologados, o sistema possui contas padrão semeadas automaticamente:

### 👤 Perfil Administrativo (Gestor Público)
*   **E-mail:** `admin@marica.rj.gov.br`
*   **Senha:** `admin123`
*   **Role:** `ADMIN` (Acesso total ao Painel Governamental, criação de eventos de controle, log de inscrições e relatórios técnicos).

### 👥 Perfil Cidadão de Testes
*   O fluxo de autoatendimento está totalmente aberto e livre. Qualquer avaliador pode usar o formulário de cadastro exposto em `/register` para gerar dados em tempo real, os quais persistirão integralmente de forma automática.

---

## 🛠️ Como Instalar e Rodar Localmente (Guia Completo)

Para instalar e implantar o GOVVIVA em seu ambiente local, siga as diretrizes técnicas descritas abaixo:

### 🎒 Pré-requisitos Obrigatórios
*   **Python v3.10** ou superior instalado localmente.
*   **Node.js v20** ou superior instalado para a build dos arquivos Javascript.

---

### Passo 1: Configuração do Backend
1.  Clone o repositório ou obtenha os fontes do projeto do GOVVIVA.
2.  Entre na pasta raiz do projeto.
3.  Crie e ative um ambiente virtual estável (recomendado):
    ```bash
    # Criar ambiente virtual
    python3 -m venv venv

    # Ativar no macOS ou Linux
    source venv/bin/activate

    # Ativar no Windows (Prompt de Comando)
    venv\Scripts\activate
    ```
4.  Instale todas as dependências requeridas no backend utilizando o pip:
    ```bash
    pip install -r requirements.txt
    ```

---

### Passo 2: Build dos Arquivos Estáticos do Frontend React
1.  Na pasta raiz do projeto, instale as dependências do ecossistema Node:
    ```bash
    npm install
    ```
2.  Execute o processo de compilação dos arquivos do React para produção. O Vite gerará o diretório compactado `/dist` no projeto raiz:
    ```bash
    npm run build
    ```

---

### Passo 3: Inicialização do Sistema Unificado
Com os pacotes compilados na pasta `dist/` e com as dependências do Flask instaladas, inicie o servidor Python primário:
```bash
python3 run.py
```
O servidor estará ativo em **`http://localhost:3000`**, atendendo de maneira limpa as conexões do Frontend e as requisições direcionadas para os serviços backend.

---

## ⚖️ Estratégia de Qualidade e MVP (Limitações do Sistema)

1.  **Engine Sqlite3 para Produção Simples:** O banco nativo do Sqlite é prático para portabilidade e rapidez de MVP, mas recomenda-se migrá-lo para conexões PostgreSQL em cenários de alta concorrência concorrentes simultâneos no futuro.
2.  **Validade do Token no Client-Side:** O armazenamento do token é mantido no `localStorage` do navegador para manter o usuário conectado. Em ambientes corporativos de alta segurança governamental, é aconselhável migrar para mecanismos HttpOnly Cookies para proteção aprimorada contra ataques estilo XSS.
3.  **Persistência de Sessão no SQLite:** No SQLite, as transações são seguras, mas não há um sistema de logs distribuídos ou filas em background (como Redis) para notificações massivas automáticas imediatas de cancelamentos ou adiamentos.

---
*GOVVIVA - Sistema com Governança Pública, Transparência Absoluta e Excelência Tecnológica.*
