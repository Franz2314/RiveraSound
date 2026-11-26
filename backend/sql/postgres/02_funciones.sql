-- =============================================================================
-- RiveraSound · PostgreSQL · 02 · Funciones, procedimiento, trigger y vistas
-- -----------------------------------------------------------------------------
-- Ejecutar conectado a "riverasound" con el usuario rs_app, después del 01.
-- Toda la lógica crítica (contraseñas, cálculo del pedido, cambio de estado)
-- vive aquí, para que la base de datos garantice las reglas de negocio aunque
-- el frontend envíe datos incorrectos.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TRIGGER: mantiene instrumentos.actualizado_en al día en cada UPDATE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_tg_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en := now();   -- sello de tiempo de la última modificación
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_instrumentos_actualizado ON instrumentos;
CREATE TRIGGER tg_instrumentos_actualizado
  BEFORE UPDATE ON instrumentos
  FOR EACH ROW
  EXECUTE FUNCTION fn_tg_actualizado_en();

-- -----------------------------------------------------------------------------
-- FUNCIÓN: registrar un usuario guardando la contraseña con bcrypt
-- Devuelve el id creado. Lanza error si el correo ya existe.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_registrar_usuario(
  p_nombre    VARCHAR,
  p_apellido  VARCHAR,
  p_correo    VARCHAR,
  p_clave     VARCHAR
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_id INTEGER;
BEGIN
  IF length(coalesce(p_clave, '')) < 6 THEN
    RAISE EXCEPTION 'La contraseña debe tener al menos 6 caracteres'
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO usuarios (nombre, apellido, correo, password_hash)
  VALUES (trim(p_nombre),
          trim(coalesce(p_apellido, '')),
          lower(trim(p_correo)),                    -- correo normalizado
          crypt(p_clave, gen_salt('bf')))           -- hash bcrypt
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- FUNCIÓN: validar login. Devuelve los datos del usuario (sin el hash) si el
-- correo y la contraseña coinciden; si no, no devuelve filas.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validar_login(p_correo VARCHAR, p_clave VARCHAR)
RETURNS TABLE (
  id         INTEGER,
  nombre     VARCHAR,
  apellido   VARCHAR,
  correo     VARCHAR,
  telefono   VARCHAR,
  direccion  VARCHAR,
  ciudad     VARCHAR,
  rol        VARCHAR
)
LANGUAGE sql
STABLE
AS $$
  SELECT u.id, u.nombre, u.apellido, u.correo,
         u.telefono, u.direccion, u.ciudad, u.rol
  FROM usuarios u
  WHERE lower(u.correo) = lower(trim(p_correo))
    AND u.password_hash = crypt(p_clave, u.password_hash);  -- compara el hash
$$;

-- -----------------------------------------------------------------------------
-- FUNCIÓN: crear un pedido completo en UNA transacción.
-- p_items es un JSON: [{"id": "sax-alto-yamaha", "cantidad": 2}, ...]
-- El subtotal se calcula con los precios de la BASE DE DATOS (no los del
-- navegador), así nadie puede comprar a un precio manipulado.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_crear_pedido(
  p_pedido_id    VARCHAR,
  p_correo       VARCHAR,
  p_items        JSONB,
  p_metodo_pago  VARCHAR,
  p_cuotas       INTEGER,
  p_total        NUMERIC,
  p_cuota_monto  NUMERIC
)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  v_usuario   usuarios%ROWTYPE;
  v_item      JSONB;
  v_inst      instrumentos%ROWTYPE;
  v_cantidad  INTEGER;
  v_subtotal  NUMERIC(12,2) := 0;
BEGIN
  -- 1) El usuario debe existir y tener datos de envío (misma regla del frontend)
  SELECT * INTO v_usuario FROM usuarios WHERE lower(correo) = lower(trim(p_correo));
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe un usuario con el correo %', p_correo
      USING ERRCODE = 'no_data_found';
  END IF;
  IF v_usuario.telefono IS NULL OR v_usuario.direccion IS NULL OR v_usuario.ciudad IS NULL
     OR v_usuario.telefono = '' OR v_usuario.direccion = '' OR v_usuario.ciudad = '' THEN
    RAISE EXCEPTION 'Registra tu dirección, teléfono y ciudad antes de comprar'
      USING ERRCODE = 'check_violation';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El pedido no tiene productos' USING ERRCODE = 'check_violation';
  END IF;

  -- 2) Cabecera con subtotal 0; se actualiza al final con el valor real
  INSERT INTO pedidos (id, usuario_id, subtotal, total, metodo_pago, cuotas, cuota_monto)
  VALUES (p_pedido_id, v_usuario.id, 0, 0, p_metodo_pago,
          coalesce(p_cuotas, 1), coalesce(p_cuota_monto, 0));

  -- 3) Detalle: valida cada instrumento y toma su precio actual
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_cantidad := coalesce((v_item->>'cantidad')::INTEGER, 1);

    SELECT * INTO v_inst FROM instrumentos
    WHERE id = v_item->>'id' AND activo;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'El instrumento % no existe en el catálogo', v_item->>'id'
        USING ERRCODE = 'no_data_found';
    END IF;
    IF v_inst.stock = 'agotado' THEN
      RAISE EXCEPTION 'El instrumento "%" está agotado', v_inst.nombre
        USING ERRCODE = 'check_violation';
    END IF;

    INSERT INTO pedido_items (pedido_id, instrumento_id, nombre, emoji, precio_unitario, cantidad)
    VALUES (p_pedido_id, v_inst.id, v_inst.nombre, v_inst.emoji, v_inst.precio, v_cantidad);

    v_subtotal := v_subtotal + v_inst.precio * v_cantidad;
  END LOOP;

  -- 4) El total puede incluir interés de cuotas, pero nunca ser menor al subtotal
  IF coalesce(p_total, v_subtotal) < v_subtotal THEN
    RAISE EXCEPTION 'El total (%) no puede ser menor al subtotal (%)', p_total, v_subtotal
      USING ERRCODE = 'check_violation';
  END IF;

  UPDATE pedidos
  SET subtotal = v_subtotal,
      total    = coalesce(p_total, v_subtotal)
  WHERE id = p_pedido_id;

  -- Si cualquier paso falla, PostgreSQL deshace TODO (cabecera + items)
  RETURN p_pedido_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- PROCEDIMIENTO: cambiar el estado de un pedido (panel de administración)
-- Uso: CALL sp_cambiar_estado_pedido('PED-XXXX-XXXX', 'Entregado');
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE sp_cambiar_estado_pedido(p_pedido_id VARCHAR, p_estado VARCHAR)
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE pedidos SET estado = p_estado WHERE id = p_pedido_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe el pedido %', p_pedido_id USING ERRCODE = 'no_data_found';
  END IF;
  -- El CHECK de la tabla rechaza automáticamente un estado inválido
END;
$$;

-- -----------------------------------------------------------------------------
-- VISTAS para reportes
-- -----------------------------------------------------------------------------

-- Catálogo con el código de categoría que espera el frontend
CREATE OR REPLACE VIEW v_catalogo AS
SELECT i.id, i.nombre, i.marca, c.codigo AS categoria, i.precio,
       i.stock, i.emoji, i.descripcion AS "desc"
FROM instrumentos i
JOIN categorias c ON c.id = i.categoria_id
WHERE i.activo;

-- Ventas por categoría (sin contar pedidos cancelados).
-- Los ::int convierten los bigint de count/sum a entero (números en JSON).
CREATE OR REPLACE VIEW v_ventas_por_categoria AS
SELECT c.nombre                                         AS categoria,
       count(DISTINCT v.pedido_id)::int                 AS pedidos,
       coalesce(sum(v.cantidad), 0)::int                AS unidades,
       coalesce(sum(v.cantidad * v.precio_unitario), 0) AS importe
FROM categorias c
LEFT JOIN instrumentos i ON i.categoria_id = c.id
LEFT JOIN (                         -- solo ítems de pedidos válidos
  SELECT pi.*
  FROM pedido_items pi
  JOIN pedidos p ON p.id = pi.pedido_id
  WHERE p.estado <> 'Cancelado'
) v ON v.instrumento_id = i.id
GROUP BY c.nombre
ORDER BY importe DESC;

-- Instrumentos más vendidos
CREATE OR REPLACE VIEW v_top_instrumentos AS
SELECT pi.instrumento_id, pi.nombre,
       sum(pi.cantidad)::int                 AS unidades,
       sum(pi.cantidad * pi.precio_unitario) AS importe
FROM pedido_items pi
JOIN pedidos p ON p.id = pi.pedido_id
WHERE p.estado <> 'Cancelado'
GROUP BY pi.instrumento_id, pi.nombre
ORDER BY unidades DESC;
