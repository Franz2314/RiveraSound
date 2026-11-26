-- =============================================================================
-- RiveraSound · PostgreSQL · 01 · Esquema (tablas, restricciones e índices)
-- -----------------------------------------------------------------------------
-- Ejecutar conectado a la base "riverasound" con el usuario rs_app.
-- Es re-ejecutable: borra y vuelve a crear las tablas (¡se pierden los datos!).
--
-- Cada tabla reemplaza una clave del localStorage del frontend:
--   riverasound_instrumentos   -> instrumentos (+ categorias)
--   riverasound_usuarios       -> usuarios
--   riverasound_pedidos        -> pedidos + pedido_items
--   riverasound_favoritos_*    -> favoritos
--   formulario de contacto     -> mensajes   (contacto y feedback)
--   boletín del footer         -> suscriptores
-- =============================================================================

-- pgcrypto: hash de contraseñas con crypt() + gen_salt('bf') (bcrypt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Orden inverso a las dependencias (primero las tablas hijas)
DROP TABLE IF EXISTS pedido_items  CASCADE;
DROP TABLE IF EXISTS pedidos       CASCADE;
DROP TABLE IF EXISTS favoritos     CASCADE;
DROP TABLE IF EXISTS instrumentos  CASCADE;
DROP TABLE IF EXISTS categorias    CASCADE;
DROP TABLE IF EXISTS usuarios      CASCADE;
DROP TABLE IF EXISTS mensajes      CASCADE;
DROP TABLE IF EXISTS suscriptores  CASCADE;

-- -----------------------------------------------------------------------------
-- categorias: las 4 familias del catálogo (viento, cuerda, percusion, teclado)
-- -----------------------------------------------------------------------------
CREATE TABLE categorias (
  id      SERIAL       PRIMARY KEY,
  codigo  VARCHAR(20)  NOT NULL UNIQUE,         -- valor que usa el frontend
  nombre  VARCHAR(50)  NOT NULL
);

-- -----------------------------------------------------------------------------
-- instrumentos: catálogo. El id es el mismo "slug" que usa el frontend
-- (ej. 'sax-alto-yamaha') para que carrito y favoritos sigan funcionando.
-- -----------------------------------------------------------------------------
CREATE TABLE instrumentos (
  id              VARCHAR(80)    PRIMARY KEY,
  nombre          VARCHAR(100)   NOT NULL,
  marca           VARCHAR(100)   NOT NULL,
  categoria_id    INTEGER        NOT NULL REFERENCES categorias(id),
  precio          NUMERIC(10,2)  NOT NULL CHECK (precio > 0),
  stock           VARCHAR(15)    NOT NULL DEFAULT 'disponible'
                    CHECK (stock IN ('disponible', 'pedido', 'agotado')),
  emoji           VARCHAR(16),
  descripcion     VARCHAR(300),
  activo          BOOLEAN        NOT NULL DEFAULT TRUE,   -- borrado lógico
  -- clock_timestamp() (no now()) para que cada fila de un INSERT múltiple
  -- tenga su propia hora y el catálogo conserve el orden de registro
  creado_en       TIMESTAMPTZ    NOT NULL DEFAULT clock_timestamp(),
  actualizado_en  TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_instrumentos_categoria ON instrumentos (categoria_id);
CREATE INDEX idx_instrumentos_precio    ON instrumentos (precio);

-- -----------------------------------------------------------------------------
-- usuarios: clientes y administradores. La contraseña nunca se guarda en texto
-- plano: password_hash contiene el resultado de crypt(clave, gen_salt('bf')).
-- -----------------------------------------------------------------------------
CREATE TABLE usuarios (
  id             SERIAL        PRIMARY KEY,
  nombre         VARCHAR(60)   NOT NULL,
  apellido       VARCHAR(60)   NOT NULL DEFAULT '',
  correo         VARCHAR(120)  NOT NULL,
  password_hash  TEXT          NOT NULL,
  telefono       VARCHAR(20),
  direccion      VARCHAR(200),
  ciudad         VARCHAR(60),
  rol            VARCHAR(10)   NOT NULL DEFAULT 'cliente'
                   CHECK (rol IN ('cliente', 'admin')),
  creado_en      TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT chk_usuarios_correo CHECK (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Correo único sin importar mayúsculas (el frontend lo normaliza a minúsculas)
CREATE UNIQUE INDEX uq_usuarios_correo ON usuarios (lower(correo));

-- -----------------------------------------------------------------------------
-- pedidos: cabecera de la compra. El id conserva el formato del frontend
-- (PED-XXXXXXXX-XXXX). Los estados son los mismos del panel de pedidos.
-- -----------------------------------------------------------------------------
CREATE TABLE pedidos (
  id            VARCHAR(40)    PRIMARY KEY,
  usuario_id    INTEGER        NOT NULL REFERENCES usuarios(id),
  fecha         TIMESTAMPTZ    NOT NULL DEFAULT now(),
  subtotal      NUMERIC(12,2)  NOT NULL CHECK (subtotal >= 0),
  total         NUMERIC(12,2)  NOT NULL CHECK (total >= 0),
  estado        VARCHAR(25)    NOT NULL DEFAULT 'Pendiente'
                  CHECK (estado IN ('Pendiente', 'En envío', 'Entregado',
                                    'Recogido en tienda', 'Cancelado')),
  metodo_pago   VARCHAR(40)    NOT NULL,
  cuotas        SMALLINT       NOT NULL DEFAULT 1 CHECK (cuotas BETWEEN 1 AND 36),
  cuota_monto   NUMERIC(12,2)  NOT NULL DEFAULT 0
);

CREATE INDEX idx_pedidos_usuario ON pedidos (usuario_id, fecha DESC);

-- -----------------------------------------------------------------------------
-- pedido_items: detalle de cada pedido (relación N a N pedido-instrumento).
-- nombre y precio_unitario son una "foto" del momento de la compra: si luego
-- cambia el precio del catálogo, el pedido histórico no se altera.
-- -----------------------------------------------------------------------------
CREATE TABLE pedido_items (
  pedido_id        VARCHAR(40)    NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  instrumento_id   VARCHAR(80)    NOT NULL REFERENCES instrumentos(id),
  nombre           VARCHAR(100)   NOT NULL,
  emoji            VARCHAR(16),
  precio_unitario  NUMERIC(10,2)  NOT NULL CHECK (precio_unitario > 0),
  cantidad         INTEGER        NOT NULL CHECK (cantidad > 0),
  PRIMARY KEY (pedido_id, instrumento_id)
);

-- -----------------------------------------------------------------------------
-- favoritos: lista de deseos de cada usuario (N a N usuario-instrumento)
-- -----------------------------------------------------------------------------
CREATE TABLE favoritos (
  usuario_id      INTEGER      NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  instrumento_id  VARCHAR(80)  NOT NULL REFERENCES instrumentos(id) ON DELETE CASCADE,
  creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, instrumento_id)
);

-- -----------------------------------------------------------------------------
-- mensajes: los 3 formularios de la página Contacto
--   contacto    -> asunto = tipo de consulta
--   importacion -> asunto = instrumento solicitado, presupuesto = monto
--   feedback    -> solo nombre y mensaje
-- -----------------------------------------------------------------------------
CREATE TABLE mensajes (
  id           SERIAL         PRIMARY KEY,
  tipo         VARCHAR(12)    NOT NULL CHECK (tipo IN ('contacto', 'importacion', 'feedback')),
  nombre       VARCHAR(100)   NOT NULL,
  correo       VARCHAR(120),
  telefono     VARCHAR(20),
  asunto       VARCHAR(150),
  presupuesto  NUMERIC(10,2)  CHECK (presupuesto IS NULL OR presupuesto > 0),
  mensaje      TEXT           NOT NULL,
  creado_en    TIMESTAMPTZ    NOT NULL DEFAULT now()
);

CREATE INDEX idx_mensajes_tipo ON mensajes (tipo, creado_en DESC);

-- -----------------------------------------------------------------------------
-- suscriptores: correos del boletín
-- -----------------------------------------------------------------------------
CREATE TABLE suscriptores (
  correo     VARCHAR(120)  PRIMARY KEY,
  creado_en  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
