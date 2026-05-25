# Changelog — GOVVIVA

Todas as alterações e melhorias técnicas implementadas no ecossistema **GOVVIVA** são documentadas sob esta estrutura de versionamento semântico.

---

## [1.0.0] - 2026-05-25

### 🚀 Novidades (Features - `feat:`)
*   **Backend (Flask Core & SQLAlchemy Models):**
    *   `feat: backend flask init setup` — Configuração inicial do servidor Flask, Application Factory no caminho `app/__init__.py` e instanciamento unificado usando `api.ts` para intercomunicação estável.
    *   `feat: models sqlalchemy design schema` — Estruturação relacional estrita das tabelas `users`, `events` e `registrations` com chaves estrangeiras apropriadas e restrição única para evitar submissões duplicadas no banco SQLite.
    *   `feat: authentication session stateless jwt` — Incorporação do barramento de sessões por token assinado JWT via Flask-JWT-Extended e criptografia de senhas por salt PBKDF2 (`werkzeug.security`).
    *   `feat: system registration processing logic` — Construção de rotas assíncronas do sistema de inscrições em eventos no backend, com diminuição relacional de vagas úteis por concorrência atômica.
*   **Frontend (React SPA & UI/UX):**
    *   `feat: frontend components architecture` — Criação de componentes funcionais dinâmicos: `Navbar` institucional adaptável, cartões modulares `EventCard` e `RegistrationCard`, e o indicador dinâmico de carregamentos assíncronos `SkeletonCard`.
    *   `feat: authentication flow authcontext global hook` — Criação do hook `AuthContext.tsx` e lógica integrada de persistência local da identidade do portador do token JWT via `localStorage` e interceptadores Axios automáticos.
    *   `feat: route guards rbca protected route` — Proteção estrita de rotas administrativas `ProtectedRoute.tsx` baseada no nível hierárquico `role` do cidadão/gestor.
    *   `feat: certificate engine browser-side logic` — Integração de sistema autônomo do lado do cliente com `jsPDF` (`CertificateButton.tsx`) para renderização instantânea do certificado oficial governamental, provendo assinatura digital e código de autenticação único (hash), economizando tráfego de rede e recursos do servidor.
    *   `feat: management administrator dashboard views` — Interface completa de relatórios agregados nacionais/municipais, formulários dinâmicos de cadastro e gestão de agendas governamentais.

### 🐛 Correções de Erros (Bug Fixes - `fix:`)
*   **Ajustes de Infraestrutura e Dependências:**
    *   `fix: services python package import correction` — Correção de imports relativos e absolutos inválidos que impediam o carregamento da camada de serviços (ex: correção do import de `models` de caminhos externos para referências locais limpas).
    *   `fix: package manager dependency pip launch` — Automatização do runtime Node/Python no `package.json` para instalar requisitos do Flask via pip e iniciar o servidor unificado instantaneamente sem quebras de `ModuleNotFoundError: No module named 'flask'`.
    *   `fix: static router redirect index single-page application` — Correção de rota estática de roteamento em `run.py` para responder com `index.html` em qualquer endpoint que não use a prefixação `/api/`, saneando quebras de navegação ou recarregamentos manuais por página (F5).
    *   `fix: strict type matching frontend definitions` — Correção de inconsistências de contrato na serialização do objeto Evento oriundo da base SQL para o contrato TypeScript em no arquivo `src/types.ts`.

### ⚙️ Refatorações e Manutenções (Refactors & Chores - `refactor:`, `chore:`)
*   `refactor: modular services encapsulation logic` — Organização de operações do banco de dados agregando responsabilidades às funções do `services.py` de modo a manter as rotas simples, enxutas e de única função.
*   `chore: update configuration variables example` — Sincronização do manifesto `.env.example` e atualizações de permissions estruturais via `metadata.json`.
*   `chore: polish comprehensive documentation layout` — Refinamento editorial do arquivo `README.md` técnico-visual e briefing de homologação.

---
*GOVVIVA - Excelência e transparência técnica em governança e tecnologia.*
