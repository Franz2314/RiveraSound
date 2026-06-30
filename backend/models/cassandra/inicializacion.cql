-- =============================================
-- RiveraSound — Esquema Cassandra
-- =============================================

-- Crear keyspace
CREATE KEYSPACE IF NOT EXISTS riverasound
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
};

USE riverasound;

-- =============================================
-- TABLA: sesiones (sesiones de usuario)
-- Escrituras frecuentes, lecturas por token
-- =============================================
CREATE TABLE IF NOT EXISTS sesiones (
    token        TEXT PRIMARY KEY,
    usuario_id   INT,
    correo       TEXT,
    nombre       TEXT,
    creado_en    TIMESTAMP,
    expira_en    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sesiones_usuario ON sesiones (usuario_id);

-- =============================================
-- TABLA: logs_vistas_producto (analítica)
-- Altísima escritura, consultas por producto/fecha
-- =============================================
CREATE TABLE IF NOT EXISTS logs_vistas_producto (
    producto_id  TEXT,
    usuario_id   TEXT,
    timestamp    TIMESTAMP,
    ip           TEXT,
    user_agent   TEXT,
    PRIMARY KEY ((producto_id), timestamp, usuario_id)
) WITH CLUSTERING ORDER BY (timestamp DESC);

-- Tabla para consultas por rango de fechas
CREATE TABLE IF NOT EXISTS logs_vistas_por_fecha (
    fecha        DATE,
    timestamp    TIMESTAMP,
    producto_id  TEXT,
    usuario_id   TEXT,
    PRIMARY KEY ((fecha), timestamp, producto_id)
) WITH CLUSTERING ORDER BY (timestamp DESC);

-- =============================================
-- TABLA: carritos_abandonados
-- =============================================
CREATE TABLE IF NOT EXISTS carritos_abandonados (
    usuario_id   TEXT PRIMARY KEY,
    items        LIST<FROZEN<MAP<TEXT, TEXT>>>,
    total        DECIMAL,
    ultimo_acceso TIMESTAMP,
    creado_en    TIMESTAMP
);

-- =============================================
-- TABLA: notificaciones_push
-- =============================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id           TIMEUUID PRIMARY KEY,
    usuario_id   TEXT,
    tipo         TEXT,
    titulo       TEXT,
    mensaje      TEXT,
    leida        BOOLEAN,
    creado_en    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones (usuario_id);

-- Insertar datos de prueba
INSERT INTO sesiones (token, usuario_id, correo, nombre, creado_en, expira_en)
VALUES ('demo-token-001', 1, 'demo@riverasound.pe', 'Demo', toTimeStamp(now()), toTimeStamp(now()) + 86400000);

INSERT INTO logs_vistas_producto (producto_id, usuario_id, timestamp, ip, user_agent)
VALUES ('listado', 'sistema', toTimeStamp(now()), '127.0.0.1', 'RiveraSound/1.0');
