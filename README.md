# GOVVIVA - Plataforma de Gestão de Eventos Institucionais

GOVVIVA é uma aplicação web desenvolvida para simplificar a organização de eventos governamentais e a inscrição de cidadãos. O sistema foca em transparência, controle de vagas em tempo real e facilidade de acesso a certificados de participação.

## 🚀 Tecnologias Utilizadas

### Backend
- **Python / Flask**: Framework para construção da API REST modular.
- **Flask-SQLAlchemy**: ORM para manipulação do banco de dados relacional.
- **Flask-JWT-Extended**: Autenticação segura via tokens JWT (JSON Web Tokens).
- **SQLite**: Banco de dados relacional utilizado para o MVP.

### Frontend
- **React**: Biblioteca para construção da interface do usuário.
- **Vite**: Ferramenta de build e desenvolvimento rápido.
- **Tailwind CSS**: Framework de estilização via classes utilitárias.
- **Lucide React**: Biblioteca de ícones.
- **Motion**: Biblioteca para animações de interface.
- **jsPDF**: Geração de certificados em PDF no lado do cliente.

## 📁 Estrutura do Projeto (Arquitetura)

O projeto segue uma arquitetura modular, separando responsabilidades entre rotas, modelos e serviços.

```text
├── app/                  # Backend em Flask
│   ├── routes/           # Definição dos endpoints (Blueprints)
│   ├── models/           # Mapeamento do banco de dados (SQLAlchemy)
│   ├── services/         # Lógica de negócio e regras do sistema
│   ├── extensions.py     # Inicialização de extensões (DB, JWT, CORS)
│   └── config.py         # Configurações do sistema
├── src/                  # Frontend em React
│   ├── components/       # Componentes visuais reutilizáveis
│   ├── services/         # Integração (fetch) com a API Flask
│   ├── types.ts          # Definições de tipos TypeScript
│   └── App.tsx           # Ponto de entrada da interface
├── run.py                # Inicializador do servidor Flask
├── requirements.txt      # Dependências Python
└── package.json          # Dependências Frontend
```

## 🔐 Segurança e Regras de Negócio

1.  **Autenticação**: O acesso é protegido por tokens JWT enviados no header `Authorization: Bearer <token>`.
2.  **Perfis de Acesso**: Separação entre `CITIZEN` (pode se inscrever) e `ADMIN` (pode criar eventos).
3.  **Integridade**: O banco de dados possui uma `unique constraint` que impede que um mesmo cidadão se inscreva duas vezes no mesmo evento.
4.  **Controle de Vagas**: Cada inscrição decrementa o contador de vagas disponíveis de forma atômica.

## 📝 Documentação da API (Exemplos)

### Autenticação
- **POST `/api/auth/login`**
  - **Body**: `{"email": "admin@gov.br", "password": "..."}`
  - **Resposta**: `{"token": "JWT_KEY", "user": {...}}`

### Eventos
- **GET `/api/events`**
  - **Resposta**: Lista de eventos ativos e disponíveis.
- **POST `/api/events`** (Apenas ADMIN)
  - **Body**: `{"title": "Workshop Gov", "total_slots": 50, ...}`
  - **Resposta**: Resumo do evento criado.

### Inscrições
- **POST `/api/registrations`** (Requer Login)
  - **Body**: `{"event_id": 1}`
  - **Resposta**: `{"message": "Inscrição confirmada!"}`

## 🔄 Fluxo de Inscrição (Passo a Passo)

1.  **Exploração**: O cidadão acessa a plataforma e visualiza a lista de eventos (via `fetch` na rota `/api/events`).
2.  **Identificação**: Para se inscrever, o usuário realiza o login e recebe um token JWT.
3.  **Solicitação**: Ao clicar em "Inscrever-se", o frontend envia uma requisição POST para `/api/registrations` com o ID do evento e o token de autenticação.
4.  **Validação**: O servidor verifica se o cidadão já está inscrito e se existem vagas disponíveis.
5.  **Confirmação**: Caso os requisitos sejam atendidos, a vaga é reservada e a confirmação é exibida na interface.
6.  **Certificação**: O usuário pode baixar seu certificado em PDF, gerado dinamicamente com os dados do evento.

## 🛠️ Como Executar

### 1. Preparar o Backend
```bash
pip install -r requirements.txt
```

### 2. Preparar o Frontend
```bash
npm install
```

### 3. Executar o Projeto
```bash
npm run dev
```
A plataforma estará acessível em `http://localhost:3000`.

---
*Projeto acadêmico focado em transparência e eficiência na gestão pública.*
