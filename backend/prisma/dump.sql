-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ENUMS
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER');
CREATE TYPE role AS ENUM ('USER', 'ADMIN');

-- TABLE: companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT
);

-- TABLE: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    company_id UUID,
    password TEXT NOT NULL,
    birthday TIMESTAMP,
    gender gender,
    role role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
);

CREATE INDEX idx_users_company_id
ON users(company_id);

-- TABLE: level
CREATE TABLE level (
    id SERIAL PRIMARY KEY,
    name TEXT,
    max_score INTEGER,
    difficulty TEXT
);

-- TABLE: sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    refresh_token TEXT NOT NULL,
    refresh_token_expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);

CREATE INDEX idx_sessions_user_id
ON sessions(user_id);

-- TABLE: level_played
CREATE TABLE level_played (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    level_id INTEGER NOT NULL,
    score INTEGER,
    attempts INTEGER,
    time_used INTEGER,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_lp_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_lp_level
        FOREIGN KEY (level_id)
        REFERENCES level(id)
);

CREATE INDEX idx_lp_user
ON level_played(user_id);

CREATE INDEX idx_lp_level
ON level_played(level_id);
 
-- INSERT TEST DATA

-- Companies
INSERT INTO companies (name) VALUES
('Google'),
('Microsoft'),
('OpenAI');

-- Users
INSERT INTO users (name, last_name, email, password, role, gender)
VALUES
('Fernando', 'Lopez', 'fernando@test.com', 'hashedpassword', 'ADMIN', 'MALE'),
('Ana', 'Martinez', 'ana@test.com', 'hashedpassword', 'USER', 'FEMALE'),
('Carlos', 'Perez', 'carlos@test.com', 'hashedpassword', 'USER', 'MALE');

-- Levels
INSERT INTO level (name, max_score, difficulty)
VALUES
('Intro Level', 100, 'EASY'),
('Maze Level', 200, 'MEDIUM'),
('Boss Level', 500, 'HARD');

-- Sessions
INSERT INTO sessions (user_id, refresh_token, refresh_token_expires_at)
VALUES
(
    (SELECT id FROM users LIMIT 1),
    'sample_refresh_token',
    NOW() + INTERVAL '7 days'
);

-- Levels Played
INSERT INTO level_played (user_id, level_id, score, attempts, time_used)
VALUES
(
    (SELECT id FROM users LIMIT 1),
    1,
    80,
    3,
    120
),
(
    (SELECT id FROM users OFFSET 1 LIMIT 1),
    2,
    150,
    2,
    200
);