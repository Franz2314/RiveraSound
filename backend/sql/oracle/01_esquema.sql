-- =============================================================================
-- RiveraSound · Oracle · Usuario y tablas base (catálogo)
-- -----------------------------------------------------------------------------
-- Uso en el proyecto: réplica del catálogo para reportes y para comparar la
-- sintaxis de Oracle con la de PostgreSQL (backend/sql/postgres/01_esquema.sql).
--
-- PARTE 1: como SYSTEM, conectado a la PDB (Oracle XE 21c: XEPDB1)
--   sqlplus system/<tu_clave>@localhost:1521/XEPDB1
-- PARTE 2: como el usuario nuevo
--   sqlplus riverasound/riverasound_123@localhost:1521/XEPDB1
-- (también sirve SQL Developer o Oracle APEX -> SQL Workshop)
-- =============================================================================

-- ============================== PARTE 1 (SYSTEM) ==============================
CREATE USER riverasound IDENTIFIED BY riverasound_123
  DEFAULT TABLESPACE users
  QUOTA UNLIMITED ON users;

GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW,
      CREATE SEQUENCE, CREATE PROCEDURE, CREATE TRIGGER TO riverasound;

-- ============================ PARTE 2 (riverasound) ===========================
CREATE TABLE categorias (
  id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,  -- equivale a SERIAL
  codigo  VARCHAR2(20) NOT NULL UNIQUE,
  nombre  VARCHAR2(50) NOT NULL
);

CREATE TABLE instrumentos (
  id            VARCHAR2(80)  PRIMARY KEY,
  nombre        VARCHAR2(100) NOT NULL,
  marca         VARCHAR2(100) NOT NULL,
  categoria_id  NUMBER        NOT NULL REFERENCES categorias(id),
  precio        NUMBER(10,2)  NOT NULL CHECK (precio > 0),
  stock         VARCHAR2(15)  DEFAULT 'disponible' NOT NULL
                  CHECK (stock IN ('disponible', 'pedido', 'agotado')),
  descripcion   VARCHAR2(300),
  creado_en     TIMESTAMP     DEFAULT SYSTIMESTAMP NOT NULL     -- equivale a now()
);

INSERT INTO categorias (codigo, nombre) VALUES ('viento', 'Viento');
INSERT INTO categorias (codigo, nombre) VALUES ('cuerda', 'Cuerda');
INSERT INTO categorias (codigo, nombre) VALUES ('percusion', 'Percusión');
INSERT INTO categorias (codigo, nombre) VALUES ('teclado', 'Teclado');

INSERT INTO instrumentos (id, nombre, marca, categoria_id, precio, stock, descripcion)
VALUES ('cajon-meinl', 'Cajón Peruano', 'Meinl JC50B',
        (SELECT id FROM categorias WHERE codigo = 'percusion'), 480, 'disponible',
        'Cajón clásico peruano.');

COMMIT;  -- en Oracle los INSERT no se confirman solos

-- Consulta de prueba (diferencia con PostgreSQL: FETCH FIRST en vez de LIMIT)
SELECT i.nombre, c.nombre AS categoria, i.precio
FROM instrumentos i JOIN categorias c ON c.id = i.categoria_id
ORDER BY i.precio DESC
FETCH FIRST 5 ROWS ONLY;
