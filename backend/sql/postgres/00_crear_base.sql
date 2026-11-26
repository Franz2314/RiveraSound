-- =============================================================================
-- RiveraSound · PostgreSQL · 00 · Crear usuario de la aplicación y base de datos
-- -----------------------------------------------------------------------------
-- Ejecutar UNA sola vez, conectado como superusuario (postgres) a la base
-- "postgres". En pgAdmin: Query Tool sobre la base "postgres".
-- En psql:   psql -U postgres -f 00_crear_base.sql
--
-- Si usas otra contraseña, cámbiala también en backend/.env (PG_PASSWORD).
-- =============================================================================

-- Usuario dueño de la base: la API se conecta con él
CREATE ROLE rs_app WITH LOGIN PASSWORD 'rs_app_123';

-- Base de datos del proyecto, con codificación UTF-8 (tildes y emojis)
CREATE DATABASE riverasound
  WITH OWNER = rs_app
       ENCODING = 'UTF8'
       TEMPLATE = template0;

COMMENT ON DATABASE riverasound IS 'Tienda de instrumentos musicales RiveraSound (Importaciones Rivera S.A.C.)';
