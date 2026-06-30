-- =============================================
-- RiveraSound — Esquema PostgreSQL
-- =============================================

-- Crear base de datos (ejecutar fuera del script)
-- CREATE DATABASE riverasound;

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABLA: categorias
-- =============================================
CREATE TABLE IF NOT EXISTS categorias (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL UNIQUE,
    slug        VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    emoji       VARCHAR(10) DEFAULT '🎵',
    creado_en   TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- TABLA: productos
-- =============================================
CREATE TABLE IF NOT EXISTS productos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    marca       VARCHAR(100) NOT NULL,
    categoria   VARCHAR(50) NOT NULL REFERENCES categorias(slug),
    precio      DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    stock       VARCHAR(20) NOT NULL DEFAULT 'disponible'
                CHECK (stock IN ('disponible', 'agotado', 'pedido')),
    descripcion TEXT DEFAULT '',
    emoji       VARCHAR(10) DEFAULT '🎵',
    destacado   BOOLEAN DEFAULT false,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_productos_categoria ON productos(categoria);
CREATE INDEX idx_productos_stock ON productos(stock);
CREATE INDEX idx_productos_destacado ON productos(destacado) WHERE destacado = true;

-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id            SERIAL PRIMARY KEY,
    nombre        VARCHAR(80) NOT NULL,
    apellido      VARCHAR(80) NOT NULL,
    correo        VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono      VARCHAR(15),
    direccion     TEXT,
    rol           VARCHAR(20) NOT NULL DEFAULT 'cliente'
                  CHECK (rol IN ('cliente', 'admin')),
    activo        BOOLEAN DEFAULT true,
    creado_en     TIMESTAMP DEFAULT NOW(),
    actualizado_en TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =============================================
-- TABLA: pedidos
-- =============================================
CREATE TABLE IF NOT EXISTS pedidos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    total           DECIMAL(12,2) NOT NULL CHECK (total >= 0),
    estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado')),
    direccion_envio TEXT DEFAULT '',
    notas           TEXT DEFAULT '',
    creado_en       TIMESTAMP DEFAULT NOW(),
    actualizado_en  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha ON pedidos(creado_en DESC);

-- =============================================
-- TABLA: detalle_pedidos
-- =============================================
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id               SERIAL PRIMARY KEY,
    pedido_id        INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id      INTEGER NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    nombre           VARCHAR(100) NOT NULL,
    cantidad         INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario  DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal         DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_detalle_pedido ON detalle_pedidos(pedido_id);
CREATE INDEX idx_detalle_producto ON detalle_pedidos(producto_id);

-- =============================================
-- TABLA: carrito_items (carrito de compras)
-- =============================================
CREATE TABLE IF NOT EXISTS carrito_items (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id     INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0) DEFAULT 1,
    creado_en       TIMESTAMP DEFAULT NOW(),
    actualizado_en  TIMESTAMP DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

CREATE INDEX idx_carrito_usuario ON carrito_items(usuario_id);

-- =============================================
-- TABLA: stock_log (historial de cambios de stock)
-- =============================================
CREATE TABLE IF NOT EXISTS stock_log (
    id          SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    stock_anterior VARCHAR(20),
    stock_nuevo    VARCHAR(20),
    usuario_id  INTEGER REFERENCES usuarios(id),
    creado_en   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stock_log_producto ON stock_log(producto_id);

-- =============================================
-- DATOS INICIALES
-- =============================================
INSERT INTO categorias (nombre, slug, descripcion, emoji) VALUES
    ('Viento', 'viento', 'Instrumentos de viento: saxofones, trompetas, flautas', '🎺'),
    ('Cuerda', 'cuerda', 'Instrumentos de cuerda: guitarras, violines, bajos', '🎸'),
    ('Percusión', 'percusion', 'Instrumentos de percusión: baterías, cajones, congas', '🥁'),
    ('Teclado', 'teclado', 'Teclados: pianos digitales, sintetizadores, MIDI', '🎹')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO productos (nombre, marca, categoria, precio, stock, descripcion, emoji, destacado) VALUES
    ('Saxofón Alto', 'Yamaha YAS-280', 'viento', 2850, 'disponible', 'Ideal para principiantes. Sonido brillante.', '🎷', true),
    ('Saxofón Tenor', 'Jupiter JTS-700', 'viento', 3400, 'disponible', 'Potente sonido para intermedios.', '🎷', false),
    ('Trompeta', 'Bach TR300H2', 'viento', 1750, 'disponible', 'Sonido clásico y construcción robusta.', '🎺', false),
    ('Clarinete', 'Buffet Crampon B12', 'viento', 1200, 'agotado', 'Clarinete estudiante de alta calidad.', '🪗', false),
    ('Flauta Traversa', 'Yamaha YFL-222', 'viento', 980, 'disponible', 'Flauta plateada con mecánica confiable.', '🎶', false),
    ('Guitarra Clásica', 'Fender CN-60S', 'cuerda', 980, 'disponible', 'Tapa de abeto, cuerpo de caoba.', '🎸', true),
    ('Guitarra Eléctrica', 'Squier Stratocaster', 'cuerda', 1350, 'disponible', 'Clásico sonido Stratocaster.', '🎸', false),
    ('Bajo Eléctrico', 'Ibanez GSR200', 'cuerda', 1100, 'pedido', 'Bajo versátil para cualquier género.', '🎸', false),
    ('Violín', 'Mendini MV300', 'cuerda', 450, 'disponible', 'Kit completo para principiantes.', '🎻', false),
    ('Ukelele', 'Kala KA-C Caoba', 'cuerda', 320, 'disponible', 'Ukelele clásico de caoba.', '🪕', false),
    ('Batería Completa', 'Pearl Roadshow RS525', 'percusion', 3200, 'disponible', 'Set 5 piezas con herrajes.', '🥁', true),
    ('Cajón Peruano', 'Meinl JC50B', 'percusion', 480, 'disponible', 'Cajón clásico peruano.', '🪘', false),
    ('Congas', 'LP LP201AX', 'percusion', 1600, 'pedido', 'Par de congas profesionales.', '🪘', false),
    ('Piano Digital', 'Roland FP-30X', 'teclado', 4100, 'disponible', '88 teclas con acción de martillo.', '🎹', true),
    ('Teclado 61 Teclas', 'Casio CT-S300', 'teclado', 590, 'disponible', 'Portátil con 400 tonos.', '🎹', false),
    ('Sintetizador', 'Korg Minilogue', 'teclado', 3800, 'agotado', 'Sintetizador analógico polifónico.', '🎹', false)
ON CONFLICT DO NOTHING;
