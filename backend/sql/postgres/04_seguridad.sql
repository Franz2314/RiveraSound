-- =============================================================================
-- RiveraSound · PostgreSQL · 04 · Seguridad: roles, usuarios y permisos
-- -----------------------------------------------------------------------------
-- Ejecutar conectado a "riverasound" como superusuario (postgres), al final.
--
--   rs_app       dueño de la base; lo usa la API (creado en el 00)
--   rs_lector    ROL de grupo (sin login): solo lectura para reportes
--   rs_reportes  USUARIO con login que hereda rs_lector (ej. un analista)
--
-- El lector puede ver todo menos la columna password_hash de usuarios.
-- =============================================================================

-- Nadie fuera de los roles autorizados puede crear objetos en "public"
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE riverasound FROM PUBLIC;
GRANT CONNECT ON DATABASE riverasound TO rs_app;

-- 1) Rol de grupo de solo lectura (no inicia sesión)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rs_lector') THEN
    CREATE ROLE rs_lector NOLOGIN;
  END IF;
END $$;

GRANT CONNECT ON DATABASE riverasound TO rs_lector;
GRANT USAGE ON SCHEMA public TO rs_lector;

-- Lectura de todas las tablas y vistas del catálogo, pedidos y reportes
GRANT SELECT ON categorias, instrumentos, pedidos, pedido_items,
                favoritos, mensajes, suscriptores                TO rs_lector;
GRANT SELECT ON v_catalogo, v_ventas_por_categoria, v_top_instrumentos TO rs_lector;

-- Usuarios: solo columnas no sensibles (sin password_hash)
GRANT SELECT (id, nombre, apellido, correo, telefono, direccion, ciudad, rol, creado_en)
  ON usuarios TO rs_lector;

-- 2) Usuario con login que pertenece al rol de lectura
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'rs_reportes') THEN
    CREATE ROLE rs_reportes WITH LOGIN PASSWORD 'reportes_123';
  END IF;
END $$;

GRANT rs_lector TO rs_reportes;

-- -----------------------------------------------------------------------------
-- Comprobaciones (puedes ejecutarlas para demostrar que funciona):
--   \du                                         -- lista roles y membresías
--   SET ROLE rs_reportes;
--   SELECT * FROM v_ventas_por_categoria;       -- OK
--   SELECT password_hash FROM usuarios;         -- ERROR: permission denied
--   INSERT INTO categorias (codigo, nombre) VALUES ('x', 'x');  -- ERROR
--   RESET ROLE;
--
-- Quitar el permiso de leer mensajes al grupo:
--   REVOKE SELECT ON mensajes FROM rs_lector;
-- =============================================================================
