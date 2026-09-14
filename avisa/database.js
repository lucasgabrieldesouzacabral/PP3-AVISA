import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('meuavisa.db');

export function initDatabase() {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS usuarios (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_completo TEXT NOT NULL,
      email_institucional TEXT UNIQUE NOT NULL,
      matricula TEXT UNIQUE NOT NULL,
      senha TEXT NOT NULL,
      tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('Discente', 'Docente', 'Servidor')),
      data_cadastro TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS discentes (
      id_usuario INTEGER PRIMARY KEY,
      curso TEXT NOT NULL,
      FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS docentes (
      id_usuario INTEGER PRIMARY KEY,
      formacao TEXT NOT NULL,
      FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS servidores (
      id_usuario INTEGER PRIMARY KEY,
      funcao TEXT NOT NULL,
      FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS eventos (
      id_evento INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      data_evento TEXT NOT NULL,
      horario TEXT NOT NULL,
      local TEXT NOT NULL,
      vagas_disponiveis INTEGER,
      suporte_terceiros INTEGER NOT NULL DEFAULT 0 CHECK (suporte_terceiros IN (0, 1)),
      status TEXT NOT NULL DEFAULT 'Pendente'
        CHECK (status IN ('Pendente', 'Confirmado', 'Cancelado', 'Adiado')),
      id_organizador_principal INTEGER NOT NULL,
      FOREIGN KEY (id_organizador_principal) REFERENCES usuarios (id_usuario)
    );

    CREATE TABLE IF NOT EXISTS solicitacoes_evento (
      id_solicitacao INTEGER PRIMARY KEY AUTOINCREMENT,
      id_evento INTEGER,
      id_discente INTEGER,
      id_avaliador INTEGER,
      status_solicitacao TEXT NOT NULL DEFAULT 'Pendente'
        CHECK (status_solicitacao IN ('Pendente', 'Aceito', 'Recusado')),
      motivo_recusa TEXT,
      data_solicitacao TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_evento) REFERENCES eventos (id_evento),
      FOREIGN KEY (id_discente) REFERENCES usuarios (id_usuario),
      FOREIGN KEY (id_avaliador) REFERENCES usuarios (id_usuario)
    );

    CREATE TABLE IF NOT EXISTS inscricoes_evento (
      id_usuario INTEGER NOT NULL,
      id_evento INTEGER NOT NULL,
      tipo_inscricao TEXT NOT NULL CHECK (tipo_inscricao IN ('Participante', 'Colaborador')),
      justificativa_contribuicao TEXT,
      presenca_confirmada INTEGER NOT NULL DEFAULT 0 CHECK (presenca_confirmada IN (0, 1)),
      PRIMARY KEY (id_usuario, id_evento),
      FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
      FOREIGN KEY (id_evento) REFERENCES eventos (id_evento)
    );

    CREATE TABLE IF NOT EXISTS notificacoes (
      id_notificacao INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER,
      mensagem TEXT NOT NULL,
      data_envio TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      lida INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0, 1)),
      FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
    );
  `);
}

export function normalizeDiscentePayload(payload) {
  return {
    nome_completo: String(payload.nome_completo || '').trim(),
    email_institucional: String(payload.email_institucional || '').trim().toLowerCase(),
    matricula: String(payload.matricula || '').trim(),
    senha: String(payload.senha || '').trim(),
    curso: String(payload.curso || '').trim(),
  };
}

export function validateDiscentePayload(payload) {
  const normalized = normalizeDiscentePayload(payload);

  if (!normalized.nome_completo || !normalized.email_institucional || !normalized.matricula || !normalized.senha || !normalized.curso) {
    throw new Error('Preencha todos os campos do discente.');
  }

  if (!normalized.email_institucional.includes('@')) {
    throw new Error('Informe um e-mail institucional válido.');
  }

  if (normalized.senha.length < 6) {
    throw new Error('A senha deve ter pelo menos 6 caracteres.');
  }

  return normalized;
}

export function registerDiscente(payload) {
  const data = validateDiscentePayload(payload);

  const existsEmail = db.getFirstSync(
    'SELECT id_usuario FROM usuarios WHERE email_institucional = ?',
    [data.email_institucional]
  );

  if (existsEmail) {
    throw new Error('E-mail institucional já cadastrado.');
  }

  const existsMatricula = db.getFirstSync(
    'SELECT id_usuario FROM usuarios WHERE matricula = ?',
    [data.matricula]
  );

  if (existsMatricula) {
    throw new Error('Matrícula já cadastrada.');
  }

  db.runSync(
    `INSERT INTO usuarios (nome_completo, email_institucional, matricula, senha, tipo_usuario)
     VALUES (?, ?, ?, ?, 'Discente')`,
    [data.nome_completo, data.email_institucional, data.matricula, data.senha]
  );

  const usuario = db.getFirstSync(
    'SELECT id_usuario FROM usuarios WHERE email_institucional = ?',
    [data.email_institucional]
  );

  db.runSync(
    'INSERT INTO discentes (id_usuario, curso) VALUES (?, ?)',
    [usuario.id_usuario, data.curso]
  );

  return db.getFirstSync(
    'SELECT id_usuario, nome_completo, email_institucional, matricula, tipo_usuario FROM usuarios WHERE id_usuario = ?',
    [usuario.id_usuario]
  );
}

export function loginDiscente(email_institucional, senha) {
  const email = String(email_institucional || '').trim().toLowerCase();
  const password = String(senha || '').trim();

  if (!email || !password) {
    throw new Error('Informe o e-mail institucional e a senha.');
  }

  const usuario = db.getFirstSync(
    `SELECT u.*
     FROM usuarios u
     LEFT JOIN discentes d ON d.id_usuario = u.id_usuario
     WHERE u.email_institucional = ? AND u.senha = ? AND u.tipo_usuario = 'Discente'`,
    [email, password]
  );

  if (!usuario) {
    throw new Error('Credenciais inválidas.');
  }

  const discente = db.getFirstSync(
    'SELECT id_usuario, curso FROM discentes WHERE id_usuario = ?',
    [usuario.id_usuario]
  );

  if (!discente) {
    throw new Error('O usuário encontrado não é um discente válido.');
  }

  return {
    id_usuario: usuario.id_usuario,
    nome_completo: usuario.nome_completo,
    email_institucional: usuario.email_institucional,
    matricula: usuario.matricula,
    tipo_usuario: usuario.tipo_usuario,
    curso: discente.curso,
  };
}

export function getDiscenteById(id_usuario) {
  return db.getFirstSync(
    `SELECT u.id_usuario, u.nome_completo, u.email_institucional, u.matricula, u.tipo_usuario, d.curso
     FROM usuarios u
     JOIN discentes d ON d.id_usuario = u.id_usuario
     WHERE u.id_usuario = ?`,
    [id_usuario]
  );
}

export default db;
