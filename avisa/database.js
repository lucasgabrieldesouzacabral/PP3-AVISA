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

export default db;
