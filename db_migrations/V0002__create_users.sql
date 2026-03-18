CREATE TABLE t_p87581554_cool_messenger_taxe.users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#00ffff',
  bio TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'online',
  photo TEXT DEFAULT NULL,
  session_token TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
