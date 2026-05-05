# GOVVIVA - Documentação Técnica do Sistema

Este documento fornece uma visão técnica detalhada do projeto **GOVVIVA**, um sistema institucional de gerenciamento de eventos públicos, migrado para uma arquitetura profissional utilizando Python/Flask no backend e React no frontend.

---

## 1. VISÃO GERAL DO SISTEMA

O **GOVVIVA** é uma plataforma desenvolvida para modernizar a gestão de eventos governamentais. Ele permite que instituições públicas publiquem atividades oficiais, gerenciem vagas em tempo real e forneçam certificados de participação aos cidadãos de forma automatizada e segura.

*   **Objetivo:** Centralizar a oferta de eventos públicos e simplificar o processo de inscrição para o cidadão.
*   **Público-alvo:** Secretarias municipais, servidores públicos e cidadãos em geral.
*   **Problema que resolve:** Fragmentação de canais de inscrição, falta de controle sobre vagas públicas e dificuldade na emissão de comprovantes de participação.

---

## 2. ARQUITETURA DO SISTEMA

O sistema adota uma arquitetura **monolítica modular**, projetada para ser eficiente e fácil de manter em ambientes escaláveis.

*   **Backend (Flask):** Responsável por todas as regras de negócio, persistência de dados e segurança. Implementa uma API RESTful completa.
*   **Frontend (React + TypeScript):** Uma SPA (Single Page Application) moderna, focada em UX institucional, consumindo a API REST de forma assíncrona.
*   **Comunicação:** Ocorre exclusivamente via JSON sobre HTTP, utilizando tokens JWT para autenticação.
*   **Serviço Integrado:** O backend atua tanto como servidor de API quanto servidor de arquivos estáticos, servindo o bundle compilado do React a partir do diretório `dist/`.

---

## 3. STACK TECNOLÓGICA

### Backend
*   **Linguagem:** Python 3.x
*   **Framework:** Flask
*   **ORM:** SQLAlchemy (via Flask-SQLAlchemy)
*   **Autenticação:** JWT (via Flask-JWT-Extended)
*   **Segurança:** Werkzeug (Hashing de senhas)
*   **CORS:** Flask-Cors

### Frontend
*   **Framework:** React 19
*   **Linguagem:** TypeScript
*   **Build Tool:** Vite
*   **Estilização:** Tailwind CSS 4.0
*   **Animações:** Motion (framer-motion)
*   **Ícones:** Lucide React
*   **Geração de Certificados:** jsPDF

### Banco de Dados
*   **Engine:** SQLite (Arquivo local `database.db`)
*   **Persistência:** Real e imediata em disco.

---

## 4. ESTRUTURA DO PROJETO

O projeto segue uma organização modular:

*   `app/__init__.py`: Factory da aplicação, inicialização de extensões e registro de Blueprints.
*   `app/models.py`: Definição das entidades do banco de dados e lógica de serialização (to_dict).
*   `app/services.py`: Camada de serviço contendo a lógica de negócio (ex: controle de vagas).
*   `app/routes/`: Subdiretório contendo os módulos de rotas (auth, events, registrations).
*   `app/extensions.py`: Instâncias globais do SQLAlchemy e JWT.
*   `config.py`: Centralização de variáveis de ambiente e configurações de sistema.
*   `run.py`: Script principal que inicia o servidor Flask e gerencia a entrega do frontend.
*   `src/`: Código fonte do frontend React (componentes, páginas, hooks, serviços).
*   `requirements.txt`: Lista de dependências Python.
*   `package.json`: Gestão de scripts de build e dependências Node.js.

---

## 5. BANCO DE DADOS

### Tabelas Principais

1.  **Users (`users`)**:
    *   `id` (PK), `name`, `email` (Unique), `password_hash`, `role` (CITIZEN/ADMIN), `org_id`, `created_at`.
2.  **Events (`events`)**:
    *   `id` (PK), `title`, `description`, `date_start`, `location`, `total_slots`, `available_slots`, `category`, `status`, `creator_id` (FK), `org_name`.
3.  **Registrations (`registrations`)**:
    *   `id` (PK), `user_id` (FK), `event_id` (FK), `registered_at`, `status`.
    *   **Constraint:** `UniqueConstraint('user_id', 'event_id')` para impedir inscrições duplicadas.

---

## 6. AUTENTICAÇÃO E SEGURANÇA

*   **JWT (JSON Web Token):** Utilizado para persistência de sessão. O token contém a identidade do usuário e é exigido no header `Authorization: Bearer <token>` em rotas protegidas.
*   **Hashing de Senhas:** Nenhuma senha é armazenada em texto plano. Utiliza-se `pbkdf2:sha256` via Werkzeug.
*   **RBAC (Role Based Access Control):**
    *   **CITIZEN:** Acesso às inscrições e certificados.
    *   **ADMIN:** Acesso ao painel de controle, criação de eventos e monitoramento de adesão.

---

## 7. FUNCIONALIDADES IMPLEMENTADAS

*   **Autenticação Completa:** Fluxo de Registro e Login com validação de credenciais.
*   **Catálogo Institucional:** Listagem dinâmica de eventos ativos com filtros por categoria.
*   **Sistema de Inscrição:** Processo em um clique, com validação de vagas em tempo real.
*   **Certificação PDF:** Geração de certificados com assinatura visual e protocolo de autenticidade (jsPDF).
*   **Painel Administrativo:** Dashboard para criação de eventos e visualização de indicadores.
*   **Protocolos de Segurança:** Números de protocolo oficiais gerados para cada inscrição e evento.

---

## 8. REGRAS DE NEGÓCIO

1.  **Concorrência de Vagas:** No momento da inscrição, o sistema verifica se `available_slots > 0`. A operação de decremento é atômica via SQLAlchemy.
2.  **Integridade de Participação:** O cidadão não pode se inscrever duas vezes no mesmo evento (erro 400).
3.  **Persistência:** Todos os dados são salvos no `database.db`. Reiniciar o servidor não apaga os dados.
4.  **Seeding Automático:** Na primeira execução, o sistema cria o administrador padrão e eventos de exemplo.

---

## 9. FLUXO COMPLETO DO SISTEMA

1.  **Cadastro:** Usuário cria conta como `CITIZEN`.
2.  **Login:** Usuário autentica e recebe um token JWT armazenado localmente.
3.  **Navegação:** Usuário visualiza eventos na Home.
4.  **Inscrição:** Usuário escolhe um evento. O frontend envia o token. O backend valida a duplicidade e disponibilidade de vaga.
5.  **Confirmação:** A vaga é reservada e a inscrição confirmada.
6.  **Pós-Evento:** O usuário acessa "Minhas Atividades" e emite o certificado digital.

---

## 10. INTEGRAÇÃO FRONTEND/BACKEND

*   **Base URL:** O frontend utiliza `/api` relativo ao host atual.
*   **Interceptors:** O sistema utiliza uma instância configurada do Axios (ou fetch) que injeta o token JWT automaticamente nos cabeçalhos de cada requisição.
*   **Sincronização:** Estados globais (como usuário logado) são gerenciados via React Context para garantir consistência visual.

---

## 11. EXECUÇÃO DO PROJETO

### Pré-requisitos
*   Python 3.10+
*   Node.js (apenas para build do frontend)

### Comandos de Inicialização
```bash
# 1. Instalar dependências Python
pip install -r requirements.txt

# 2. Build do Frontend
npm run build

# 3. Iniciar o Sistema (Backend + Frontend)
python3 run.py
```
O sistema estará disponível em `http://localhost:3000`.

---

## 12. VALIDAÇÃO DE FUNCIONAMENTO

*   **Login Admin:** `admin@marica.rj.gov.br` / `admin123`
*   **Persistência:** Testada e confirmada via SQLite.
*   **Fluxo de Inscrição:** Validado com tratamento de erros para vagas esgotadas e duplicidade.

---

## 13. CONCLUSÃO TÉCNICA

O sistema **GOVVIVA** evoluiu de um protótipo para um **MVP Profissional**. A arquitetura atual, baseada em Flask e React, segue os padrões de mercado para sistemas de média complexidade, garantindo segurança, performance e uma experiência de usuário polida.

**Classificação:** [X] MVP Profissional / Pronto para Demonstração

O projeto está tecnicamente sólido para ser apresentado como solução institucional integrada.
