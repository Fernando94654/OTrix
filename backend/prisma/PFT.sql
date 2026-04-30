-- Trigger 1: Actualiza récords después de cada partida
CREATE OR REPLACE FUNCTION fn_sync_stats() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_level_stats (user_id, level_id, best_score, best_time, total_attempts, last_played)
    VALUES (NEW.user_id, NEW.level_id, NEW.score, NEW.time_used, NEW.attempts, NEW.date)
    ON CONFLICT (user_id, level_id) DO UPDATE SET
        best_score = GREATEST(user_level_stats.best_score, EXCLUDED.best_score),
        best_time = LEAST(COALESCE(user_level_stats.best_time, EXCLUDED.best_time), EXCLUDED.best_time),
        total_attempts = user_level_stats.total_attempts + EXCLUDED.total_attempts,
        last_played = EXCLUDED.last_played;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_sync_stats AFTER INSERT ON level_played 
FOR EACH ROW EXECUTE FUNCTION fn_sync_stats();

-- Trigger 2: Verifica existencia de empresa al crear usuario
CREATE OR REPLACE FUNCTION fn_verify_company() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.company_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM companies WHERE id = NEW.company_id) THEN
        INSERT INTO companies (id, name) VALUES (NEW.company_id, 'Auto-generated');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_verify_company BEFORE INSERT ON users 
FOR EACH ROW EXECUTE FUNCTION fn_verify_company();

-- Trigger 3: Log de cambios en roles de usuario (Seguridad)
CREATE OR REPLACE FUNCTION fn_log_role_change() RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role <> NEW.role THEN
        RAISE NOTICE 'User % changed role from % to %', NEW.id, OLD.role, NEW.role;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_log_role_change BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE FUNCTION fn_log_role_change();


-- Procedure 1: Registro manual de empresas
CREATE OR REPLACE PROCEDURE sp_add_company(p_name VARCHAR) AS $$
BEGIN
    INSERT INTO companies (id, name) VALUES (gen_random_uuid(), p_name);
END;
$$ LANGUAGE plpgsql;

-- Procedure 2: Limpieza de sesiones expiradas
CREATE OR REPLACE PROCEDURE sp_clean_sessions() AS $$
BEGIN
    DELETE FROM sessions WHERE refresh_token_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Procedure 3: Reset de estadísticas de un nivel
CREATE OR REPLACE PROCEDURE sp_reset_level(p_level_id INT) AS $$
BEGIN
    DELETE FROM user_level_stats WHERE level_id = p_level_id;
    DELETE FROM level_played WHERE level_id = p_level_id;
END;
$$ LANGUAGE plpgsql;

-- Función 1: Promedio de intentos por usuario
CREATE OR REPLACE FUNCTION fn_get_avg_attempts(p_uid TEXT) RETURNS FLOAT AS $$
BEGIN
    RETURN (SELECT AVG(attempts) FROM level_played WHERE user_id = p_uid);
END;
$$ LANGUAGE plpgsql;

-- Función 2: Determinar si un score es "High Score" global
CREATE OR REPLACE FUNCTION fn_is_top_score(p_score INT, p_level INT) RETURNS BOOLEAN AS $$
DECLARE max_val INT;
BEGIN
    SELECT MAX(score) INTO max_val FROM level_played WHERE level_id = p_level;
    RETURN p_score >= max_val;
END;
$$ LANGUAGE plpgsql;

-- Función 3: Formatear tiempo (segundos a texto)
CREATE OR REPLACE FUNCTION fn_format_time(p_seconds INT) RETURNS TEXT AS $$
BEGIN
    RETURN (p_seconds / 60)::TEXT || 'm ' || (p_seconds % 60)::TEXT || 's';
END;
$$ LANGUAGE plpgsql;