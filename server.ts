import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('database.db');
const JWT_SECRET = process.env.JWT_SECRET || 'govviva_secret_key_2026';

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'CITIZEN',
    org_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date_start DATETIME NOT NULL,
    location TEXT NOT NULL,
    total_slots INTEGER NOT NULL,
    available_slots INTEGER NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    creator_id INTEGER,
    org_id TEXT,
    org_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'CONFIRMED',
    UNIQUE(user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (event_id) REFERENCES events (id)
  );
`);

// Migration and seeding
try {
  db.prepare('SELECT org_name FROM events LIMIT 1').get();
} catch (e) {
  db.exec('ALTER TABLE events ADD COLUMN org_name TEXT');
}

const eventCount = db.prepare('SELECT COUNT(*) as count FROM events').get() as { count: number };
if (eventCount.count === 0) {
  const insertEvent = db.prepare(`
    INSERT INTO events (title, description, date_start, location, total_slots, available_slots, category, org_id, org_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertEvent.run(
    'II Conferência Municipal de Políticas Culturais',
    'Evento oficial destinado ao debate e formulação das diretrizes culturais para o próximo biênio. Participação fundamental para a validação das propostas de fomento artístico.',
    '2026-06-15T14:00:00Z',
    'Cine Teatro Henfil, Centro - Maricá/RJ',
    200, 195, 'Cultura', 'SEC_CULTURA', 'Secretaria Municipal de Cultura'
  );
  
  insertEvent.run(
    'Workshop de Modernização Administrativa',
    'Programa de capacitação focado na implementação de processos digitais e atendimento ao cidadão conforme as normas de transparência pública.',
    '2026-06-20T09:00:00Z',
    'SIM Centro, Maricá/RJ',
    50, 42, 'Capacitação', 'SEC_INOVACAO', 'Secretaria de Inovação e Tecnologia'
  );

  insertEvent.run(
    'Fórum Governamental de Transparência',
    'Sessão solene de apresentação do novo portal de transparência municipal e mecanismos de auditoria cidadã.',
    '2026-07-05T18:30:00Z',
    'Auditório da Prefeitura de Maricá',
    100, 100, 'Gestão Pública', 'SEC_GOVERNO', 'Secretaria Municipal de Governo'
  );

  // Seed Admin User
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  db.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role, org_id)
    VALUES (?, ?, ?, ?, ?)
  `).run('Gestor Administrativo', 'admin@marica.rj.gov.br', adminPasswordHash, 'ADMIN', 'SEC_GOVERNO');
}

const app = express();
app.use(express.json());
app.use(cors());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(401).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role, org_id } = req.body;
  
  try {
    const password_hash = bcrypt.hashSync(password, 10);
    const info = db.prepare('INSERT INTO users (name, email, password_hash, role, org_id) VALUES (?, ?, ?, ?, ?)').run(
      name, email, password_hash, role || 'CITIZEN', org_id || null
    );
    
    const user = db.prepare('SELECT id, name, email, role, org_id FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ message: 'Usuário criado!', user });
  } catch (error: any) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'E-mail já cadastrado.' });
    }
    res.status(500).json({ error: 'Erro interno ao criar usuário' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, org_id: user.org_id } });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user = db.prepare('SELECT id, name, email, role, org_id FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

// --- EVENT ROUTES ---
app.get('/api/events', (req, res) => {
  const events = db.prepare("SELECT * FROM events WHERE status = 'ACTIVE' ORDER BY date_start ASC").all();
  res.json(events);
});

app.post('/api/events', authenticateToken, (req: any, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso administrativo negado' });
  }

  const { title, description, date_start, location, total_slots, category, org_id, org_name } = req.body;
  
  try {
    const info = db.prepare(`
      INSERT INTO events (title, description, date_start, location, total_slots, available_slots, category, creator_id, org_id, org_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, description, date_start, location, total_slots, total_slots, category, req.user.id, org_id || 'GOV_ROOT', org_name || 'Governo Municipal');
    
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar evento' });
  }
});

// --- REGISTRATION ROUTES ---
app.post('/api/registrations', authenticateToken, (req: any, res) => {
  const { event_id } = req.body;
  const user_id = req.user.id;

  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id) as any;
    if (!event || event.status !== 'ACTIVE') {
      return res.status(404).json({ error: 'Evento não encontrado ou inativo.' });
    }

    if (event.available_slots <= 0) {
      return res.status(400).json({ error: 'Vagas esgotadas.' });
    }

    const existing = db.prepare('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?').get(user_id, event_id);
    if (existing) {
      return res.status(400).json({ error: 'Você já está inscrito neste evento.' });
    }

    const enroll = db.transaction(() => {
      const info = db.prepare('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)').run(user_id, event_id);
      db.prepare('UPDATE events SET available_slots = available_slots - 1 WHERE id = ?').run(event_id);
      return info.lastInsertRowid;
    });

    const id = enroll();
    res.status(201).json({ message: 'Inscrição confirmada!', id });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar inscrição' });
  }
});

app.get('/api/registrations/me', authenticateToken, (req: any, res) => {
  const regs = db.prepare('SELECT * FROM registrations WHERE user_id = ?').all(req.user.id) as any[];
  
  const result = regs.map(r => {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(r.event_id);
    return {
      registration_id: r.id,
      status: r.status,
      event
    };
  });
  
  res.json(result);
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
