-- =============================================================================
-- RiveraSound · PostgreSQL · 03 · Datos iniciales
-- -----------------------------------------------------------------------------
-- Ejecutar conectado a "riverasound" con rs_app, después del 01 y el 02.
-- Los 35 instrumentos son los mismos de js/catalogo.js (defaultInstrumentos).
-- =============================================================================

-- Categorías del catálogo
INSERT INTO categorias (codigo, nombre) VALUES
  ('viento',    'Viento'),
  ('cuerda',    'Cuerda'),
  ('percusion', 'Percusión'),
  ('teclado',   'Teclado');

-- Instrumentos (id, nombre, marca, categoría, precio, stock, emoji, descripción)
INSERT INTO instrumentos (id, nombre, marca, categoria_id, precio, stock, emoji, descripcion) VALUES
  ('sax-alto-yamaha', 'Saxofón Alto', 'Yamaha YAS-280', (SELECT id FROM categorias WHERE codigo = 'viento'), 2850.00, 'disponible', '🎷', 'Ideal para principiantes. Sonido brillante.'),
  ('sax-tenor-jupiter', 'Saxofón Tenor', 'Jupiter JTS-700', (SELECT id FROM categorias WHERE codigo = 'viento'), 3400.00, 'disponible', '🎷', 'Potente sonido para intermedios.'),
  ('sax-soprano-yamaha', 'Saxofón Soprano', 'Yamaha YSS-475', (SELECT id FROM categorias WHERE codigo = 'viento'), 4200.00, 'pedido', '🎷', 'Recto, tono puro y afinación precisa.'),
  ('trompeta-bach', 'Trompeta', 'Bach TR300H2', (SELECT id FROM categorias WHERE codigo = 'viento'), 1750.00, 'disponible', '🎺', 'Sonido clásico y construcción robusta.'),
  ('trompeta-yamaha', 'Trompeta Profesional', 'Yamaha Xeno 8335', (SELECT id FROM categorias WHERE codigo = 'viento'), 5200.00, 'pedido', '🎺', 'Para músicos avanzados y profesionales.'),
  ('clarinete-buffet', 'Clarinete', 'Buffet Crampon B12', (SELECT id FROM categorias WHERE codigo = 'viento'), 1200.00, 'agotado', '🪗', 'Clarinete estudiante de alta calidad.'),
  ('flauta-yamaha', 'Flauta Traversa', 'Yamaha YFL-222', (SELECT id FROM categorias WHERE codigo = 'viento'), 980.00, 'disponible', '🎶', 'Flauta plateada con mécanica confiable.'),
  ('flauta-dulce', 'Flauta Dulce', 'Yamaha YRS-302B', (SELECT id FROM categorias WHERE codigo = 'viento'), 180.00, 'disponible', '🎶', 'Ideal para estudiantes de música.'),
  ('trombon-bach', 'Trombón', 'Bach TB502', (SELECT id FROM categorias WHERE codigo = 'viento'), 2100.00, 'disponible', '🎺', 'Trombón de vara con campana de 8".'),
  ('oboe-jupiter', 'Oboe', 'Jupiter JOB-700', (SELECT id FROM categorias WHERE codigo = 'viento'), 3600.00, 'pedido', '🎺', 'Oboe profesional con sistema conservatorio.'),
  ('guitarra-clasica-fender', 'Guitarra Clásica', 'Fender CN-60S', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 980.00, 'disponible', '🎸', 'Tapa de abeto, cuerpo de caoba.'),
  ('guitarra-electrica-squier', 'Guitarra Eléctrica', 'Squier Stratocaster', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 1350.00, 'disponible', '🎸', 'Clásico sonido Stratocaster.'),
  ('guitarra-acustica-taylor', 'Guitarra Acústica', 'Taylor GS Mini', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 2900.00, 'disponible', '🎸', 'Sonido grande en cuerpo pequeño.'),
  ('guitarra-electro-yamaha', 'Guitarra Electroacústica', 'Yamaha APX600', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 1200.00, 'disponible', '🎸', 'Perfecta para escenarios.'),
  ('violin-mendini', 'Violín', 'Mendini MV300', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 450.00, 'disponible', '🎻', 'Kit completo para principiantes.'),
  ('violin-profesional', 'Violín Profesional', 'Yamaha V7SG', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 3200.00, 'pedido', '🎻', 'Construcción artesanal.'),
  ('violonchelo-cecilio', 'Violonchelo', 'Cecilio CCO-500', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 2800.00, 'disponible', '🎻', 'Sonido cálido y resonante.'),
  ('bajo-ibanez', 'Bajo Eléctrico', 'Ibanez GSR200', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 1100.00, 'pedido', '🎸', 'Bajo versátil para cualquier género.'),
  ('ukelele-kala', 'Ukelele', 'Kala KA-C Caoba', (SELECT id FROM categorias WHERE codigo = 'cuerda'), 320.00, 'disponible', '🪕', 'Ukelele clásico de caoba.'),
  ('bateria-pearl', 'Batería Completa', 'Pearl Roadshow RS525', (SELECT id FROM categorias WHERE codigo = 'percusion'), 3200.00, 'disponible', '🥁', 'Set 5 piezas con herrajes.'),
  ('bateria-electronica', 'Batería Electrónica', 'Roland TD-07DMK', (SELECT id FROM categorias WHERE codigo = 'percusion'), 4800.00, 'disponible', '🥁', 'Silenciosa, ideal para departamento.'),
  ('cajon-meinl', 'Cajón Peruano', 'Meinl JC50B', (SELECT id FROM categorias WHERE codigo = 'percusion'), 480.00, 'disponible', '🪘', 'Cajón clásico peruano.'),
  ('cajon-profesional', 'Cajón Profesional', 'LP LP397', (SELECT id FROM categorias WHERE codigo = 'percusion'), 780.00, 'disponible', '🪘', 'Cajón con bordona ajustable.'),
  ('congas-lp', 'Congas', 'LP LP201AX', (SELECT id FROM categorias WHERE codigo = 'percusion'), 1600.00, 'pedido', '🪘', 'Par de congas de 11" y 11.75".'),
  ('bongos-lp', 'Bongós', 'LP LP395', (SELECT id FROM categorias WHERE codigo = 'percusion'), 520.00, 'disponible', '🪘', 'Bongós de madera con parches sintéticos.'),
  ('timbaleta-pearl', 'Timbaleta', 'Pearl PHP-925', (SELECT id FROM categorias WHERE codigo = 'percusion'), 2100.00, 'pedido', '🥁', 'Timbaleta profesional 14" y 15".'),
  ('percusion-menor', 'Set Percusión Menor', 'Meinl Pack', (SELECT id FROM categorias WHERE codigo = 'percusion'), 380.00, 'disponible', '🪘', 'Pandereta, maracas, claves y güiro.'),
  ('piano-roland', 'Piano Digital', 'Roland FP-30X', (SELECT id FROM categorias WHERE codigo = 'teclado'), 4100.00, 'disponible', '🎹', '88 teclas con acción de martillo.'),
  ('piano-casio', 'Piano de Cola Digital', 'Casio GP-510', (SELECT id FROM categorias WHERE codigo = 'teclado'), 12000.00, 'pedido', '🎹', 'Acción de cola real.'),
  ('teclado-casio', 'Teclado 61 Teclas', 'Casio CT-S300', (SELECT id FROM categorias WHERE codigo = 'teclado'), 590.00, 'disponible', '🎹', 'Portátil con 400 tonos.'),
  ('teclado-yamaha', 'Teclado Arreglador', 'Yamaha PSR-E373', (SELECT id FROM categorias WHERE codigo = 'teclado'), 850.00, 'disponible', '🎹', 'Con estilos de acompañamiento.'),
  ('sintetizador-korg', 'Sintetizador', 'Korg Minilogue', (SELECT id FROM categorias WHERE codigo = 'teclado'), 3800.00, 'agotado', '🎹', 'Sintetizador analógico polifónico.'),
  ('sintetizador-moog', 'Sintetizador Modular', 'Moog Subsequent 37', (SELECT id FROM categorias WHERE codigo = 'teclado'), 8500.00, 'pedido', '🎹', 'Sintetizador semi-modular.'),
  ('controlador-novation', 'Controlador MIDI', 'Novation Launchkey 49', (SELECT id FROM categorias WHERE codigo = 'teclado'), 1100.00, 'disponible', '🎹', '49 teclas con pads y perillas.'),
  ('organo-hammond', 'Órgano Eléctrico', 'Hammond XK-1C', (SELECT id FROM categorias WHERE codigo = 'teclado'), 6800.00, 'pedido', '🎹', 'Órgano portátil con ruedas tonewheel.');

-- Usuario administrador: es la cuenta demo que el frontend ya trata como admin
SELECT fn_registrar_usuario('Usuario', 'Demo', 'demo@riverasound.pe', 'demo123');
UPDATE usuarios SET rol = 'admin' WHERE correo = 'demo@riverasound.pe';

-- Cliente de ejemplo con datos de envío, para tener pedidos en los reportes
SELECT fn_registrar_usuario('Ana', 'Torres', 'cliente@riverasound.pe', 'cliente123');
UPDATE usuarios
SET telefono = '987654321', direccion = 'Av. Javier Prado 1234', ciudad = 'Lima'
WHERE correo = 'cliente@riverasound.pe';

-- Pedidos de ejemplo creados con la misma función que usa la API
SELECT fn_crear_pedido('PED-DEMO0001-AAAA', 'cliente@riverasound.pe',
  '[{"id": "cajon-meinl", "cantidad": 2}, {"id": "ukelele-kala", "cantidad": 1}]',
  'Efectivo / Transferencia', 1, 1280.00, 0);

SELECT fn_crear_pedido('PED-DEMO0002-BBBB', 'cliente@riverasound.pe',
  '[{"id": "piano-roland", "cantidad": 1}]',
  'Tarjeta de Crédito (Visa)', 6, 4305.00, 717.50);
CALL sp_cambiar_estado_pedido('PED-DEMO0002-BBBB', 'Entregado');

-- Mensaje de ejemplo del formulario de contacto
INSERT INTO mensajes (tipo, nombre, correo, asunto, mensaje)
VALUES ('contacto', 'Luis Rojas', 'luis@example.com', 'cotizacion',
        '¿Tienen saxofones tenor en color dorado?');
