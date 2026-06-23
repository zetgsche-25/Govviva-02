-- ==========================================
-- GOVVIVA - PROJETO MUNICIPAL ESCALÁVEL (200K+ USUÁRIOS)
-- SCHEMA DE MIGRAÇÃO POSTGRESQL (MÓDULOS DE PRESENÇA, CERTIFICADOS E AUDITORIA)
-- ==========================================

-- NOTA DE ARQUITETURA: 
-- Todos os IDs utilizam serial/integer convencional, porém os índices compostos,
-- parciais e de cobertura são aplicados para otimização de leitura simultânea em massa.

-- ------------------------------------------
-- 1. Tabela de Usuários (Cidadãos e Administradores)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    cpf VARCHAR(14) NULL, -- Exemplo de CPF: 123.456.789-00
    password_hash VARCHAR(256) NOT NULL,
    role VARCHAR(20) DEFAULT 'CITIZEN' NOT NULL, -- CITIZEN, ADMIN
    org_id VARCHAR(50) NULL, -- Para admins vinculados a uma Secretaria
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
);

-- Índices de Alta Performance para Busca Rápida de Usuários
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id) WHERE org_id IS NOT NULL;

-- ------------------------------------------
-- 2. Tabela de Eventos, Cursos, Capatitações
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    date_start TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    location VARCHAR(200) NOT NULL,
    total_slots INTEGER NOT NULL,
    available_slots INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL, -- ACTIVE, CONCLUDED, CANCELLED
    workload INTEGER DEFAULT 4 NOT NULL, -- Carga Horária em Horas
    org_responsible VARCHAR(150) DEFAULT 'Secretaria Municipal do Governo' NOT NULL,
    creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    org_id VARCHAR(50) NULL,
    org_name VARCHAR(100) NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
);

-- Índices Otimizados para Consulta de Cronograma e Paginação de Eventos
CREATE INDEX IF NOT EXISTS idx_events_status_date ON events(status, date_start DESC);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_org_id ON events(org_id);

-- ------------------------------------------
-- 3. Tabela de Inscrições nos Eventos
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED' NOT NULL, -- CONFIRMED, CANCELLED
    ticket_code VARCHAR(100) NULL UNIQUE, -- Código seguro para geração de QR Code de Check-in
    CONSTRAINT _user_event_uc UNIQUE (user_id, event_id)
);

-- Índices de Cobertura para Evitar Lock/Deadlocks e Acelerar Junções (Joins)
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_ticket ON registrations(ticket_code) WHERE ticket_code IS NOT NULL;

-- ------------------------------------------
-- 4. Tabela de Presença, Check-in, Check-out
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS presence_checks (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITHOUT TIME ZONE NULL,
    check_out_time TIMESTAMP WITHOUT TIME ZONE NULL,
    location VARCHAR(200) NULL,
    calculated_duration DOUBLE PRECISION DEFAULT 0.0 NOT NULL, -- Horas calculadas entre check-in/out
    calculated_percentage DOUBLE PRECISION DEFAULT 0.0 NOT NULL, -- Percentual de presença (segundo workload do evento)
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL -- PENDING, APPROVED, INCOMPLETE, ABSENT
);

-- Índices Rápidos de Filtro de Frequência e Validação de Auditoras
CREATE INDEX IF NOT EXISTS idx_presence_checks_registration ON presence_checks(registration_id);
CREATE INDEX IF NOT EXISTS idx_presence_checks_status ON presence_checks(status);

-- ------------------------------------------
-- 5. Tabela de Certificados Digitais Emitidos
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL UNIQUE, -- GOV-CERT-12345
    hash_verification VARCHAR(256) NOT NULL, -- Chave SHA256 / Assinatura Digital do Município
    issued_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL,
    is_publicly_available BOOLEAN DEFAULT TRUE NOT NULL, -- Expira em 30 dias para download público
    reactivated_at TIMESTAMP WITHOUT TIME ZONE NULL,
    
    -- Controle de Fila e Envio de E-mail de forma Assíncrona
    sent_by_email BOOLEAN DEFAULT FALSE NOT NULL,
    email_sent_at TIMESTAMP WITHOUT TIME ZONE NULL,
    email_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL, -- PENDING, SENT, FAILED
    email_attempts INTEGER DEFAULT 0 NOT NULL,
    email_delivery_confirmed BOOLEAN DEFAULT FALSE NOT NULL
);

-- Índices de barramento para busca instantânea de certificados e validação pública por QR Code
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(code);
CREATE INDEX IF NOT EXISTS idx_certificates_availability ON certificates(is_publicly_available, issued_at);
CREATE INDEX IF NOT EXISTS idx_certificates_email_queue ON certificates(email_status) WHERE sent_by_email = FALSE;

-- ------------------------------------------
-- 6. Tabela de Auditoria Log (Segurança & Transparência)
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- LOGIN, REGISTER, ENROLL, CHECKIN, CHECKOUT, CERTIFICATE_EMISSION
    ip_address VARCHAR(45) NULL, -- Compatível com IPv4 e IPv6
    description TEXT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
);

-- Índices Cronológicos para Relatórios de Segurança do Município
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;

-- ------------------------------------------
-- 7. Tabela de Notificações Internas para o Cidadão
-- ------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() AT TIME ZONE 'utc') NOT NULL
);

-- Índices de Desempenho para Carregamento de Sininho de Alertas
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
