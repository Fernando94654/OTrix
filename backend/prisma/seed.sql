-- Run once against your database:  psql "$DATABASE_URL" -f prisma/seed.sql
-- Safe to run multiple times (upsert on id). Keep level ids stable — the Unity
-- project references them via the `numeroDeNivel` field on each scene script.

INSERT INTO level (id, name, max_score, difficulty) VALUES
  (1, 'Phishing Bait',     3000,  'Easy'),
  (2, 'IDMZ Shield',       10000, 'Medium'),
  (3, 'Patch Management',  10000, 'Medium'),
  (4, 'MFA Slider',        10000, 'Hard'),
  (5, 'Shatter Glass',     10000, 'Insane')
ON CONFLICT (id) DO UPDATE SET
  name       = EXCLUDED.name,
  max_score  = EXCLUDED.max_score,
  difficulty = EXCLUDED.difficulty;

SELECT setval(
  pg_get_serial_sequence('level', 'id'),
  GREATEST((SELECT MAX(id) FROM level), 1)
);
