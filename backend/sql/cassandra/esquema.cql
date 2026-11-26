-- =============================================================================
-- RiveraSound · Cassandra · Keyspace, tablas y rol de la aplicación
-- -----------------------------------------------------------------------------
-- Ejecutar en cqlsh:
--   WSL/Ubuntu:  cqlsh -f esquema.cql
--   Docker:      docker cp esquema.cql cassandra-node:/esquema.cql
--                docker exec -it cassandra-node cqlsh -f /esquema.cql
--
-- Uso en el proyecto: historial de actividad, muchos datos escritos
-- seguido y consultados por usuario o por fecha (lo que Cassandra hace mejor).
-- En Cassandra se diseña UNA tabla POR CONSULTA (no hay JOIN).
-- =============================================================================

CREATE KEYSPACE IF NOT EXISTS riverasound
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE riverasound;

-- Consulta 1: "¿qué instrumentos vio este usuario, del más reciente al más antiguo?"
--   partition key = correo   -> todas las vistas de un usuario quedan juntas
--   clustering    = fecha    -> ordenadas por fecha dentro de la partición
CREATE TABLE IF NOT EXISTS vistas_por_usuario (
  correo          TEXT,
  fecha           TIMESTAMP,
  instrumento_id  TEXT,
  nombre          TEXT,
  PRIMARY KEY ((correo), fecha, instrumento_id)
) WITH CLUSTERING ORDER BY (fecha DESC, instrumento_id ASC);

-- Consulta 2: "¿cuántas veces se vio cada instrumento?" (tabla de contadores)
CREATE TABLE IF NOT EXISTS vistas_por_instrumento (
  instrumento_id  TEXT PRIMARY KEY,
  total           COUNTER
);

-- Datos de ejemplo (la vista caduca en 30 días con TTL)
INSERT INTO vistas_por_usuario (correo, fecha, instrumento_id, nombre)
VALUES ('cliente@riverasound.pe', toTimestamp(now()), 'piano-roland', 'Piano Digital')
USING TTL 2592000;

UPDATE vistas_por_instrumento SET total = total + 1 WHERE instrumento_id = 'piano-roland';

-- Consultas de ejemplo
SELECT * FROM vistas_por_usuario WHERE correo = 'cliente@riverasound.pe' LIMIT 10;
SELECT * FROM vistas_por_instrumento;

-- -----------------------------------------------------------------------------
-- Rol de la aplicación. Solo funciona si activaste en cassandra.yaml:
--   authenticator: PasswordAuthenticator   y   authorizer: CassandraAuthorizer
-- y entras con: cqlsh -u cassandra -p cassandra
-- Luego en backend/.env: CASSANDRA_USUARIO=riverasound_app, CASSANDRA_CLAVE=cass_app_123
-- -----------------------------------------------------------------------------
-- CREATE ROLE IF NOT EXISTS riverasound_app WITH PASSWORD = 'cass_app_123' AND LOGIN = true;
-- GRANT SELECT ON KEYSPACE riverasound TO riverasound_app;
-- GRANT MODIFY ON KEYSPACE riverasound TO riverasound_app;
-- LIST ALL PERMISSIONS OF riverasound_app;
