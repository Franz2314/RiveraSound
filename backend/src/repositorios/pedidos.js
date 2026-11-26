/**
 * repositorios/pedidos.js
 * Pedidos y su detalle. La creación usa fn_crear_pedido (una sola transacción
 * dentro de PostgreSQL, con los precios de la base de datos).
 */
const { query } = require('../db/postgres');

/** Mismo formato de ID que js/carrito.js: PED-<timestamp36>-<4 aleatorios> */
function generarIdPedido() {
  return 'PED-' + Date.now().toString(36).toUpperCase() + '-' +
    Math.random().toString(36).substring(2, 6).toUpperCase();
}

/** Formato de fecha que muestra el frontend en "Mis pedidos" */
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-PE', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

// Cabecera + items agregados como arreglo JSON, en una sola consulta
const SELECT_PEDIDOS = `
  SELECT p.id, p.fecha, p.subtotal, p.total, p.estado,
         p.metodo_pago, p.cuotas, p.cuota_monto, u.correo,
         coalesce(json_agg(json_build_object(
           'id', pi.instrumento_id, 'nombre', pi.nombre, 'emoji', pi.emoji,
           'precio', pi.precio_unitario, 'cantidad', pi.cantidad
         ) ORDER BY pi.nombre) FILTER (WHERE pi.pedido_id IS NOT NULL), '[]') AS items
  FROM pedidos p
  JOIN usuarios u          ON u.id = p.usuario_id
  LEFT JOIN pedido_items pi ON pi.pedido_id = p.id`;

/** Convierte una fila al objeto que usa el frontend (camelCase) */
function aFormatoFrontend(f) {
  return {
    id: f.id,
    fecha: formatearFecha(f.fecha),
    fechaISO: new Date(f.fecha).toISOString(),
    items: f.items.map((i) => ({ ...i, precio: Number(i.precio) })),
    subtotal: f.subtotal,
    total: f.total,
    estado: f.estado,
    metodoPago: f.metodo_pago,
    cuotas: f.cuotas,
    cuotaMonto: f.cuota_monto,
    usuario: f.correo
  };
}

/** Lista pedidos; si se pasa correo, solo los de ese usuario (más recientes primero) */
async function listar(correo) {
  const parametros = [];
  let where = '';
  if (correo) {
    parametros.push(correo);
    where = 'WHERE lower(u.correo) = lower($1)';
  }
  const { rows } = await query(
    `${SELECT_PEDIDOS} ${where} GROUP BY p.id, u.correo ORDER BY p.fecha DESC`, parametros);
  return rows.map(aFormatoFrontend);
}

/** Un pedido por id (null si no existe) */
async function obtener(id) {
  const { rows } = await query(`${SELECT_PEDIDOS} WHERE p.id = $1 GROUP BY p.id, u.correo`, [id]);
  return rows[0] ? aFormatoFrontend(rows[0]) : null;
}

/**
 * Crea un pedido.
 * @param {object} datos { id?, correo, items: [{id, cantidad}], metodoPago, cuotas, total, cuotaMonto }
 */
async function crear(datos) {
  const id = datos.id || generarIdPedido();
  const items = (datos.items || []).map((i) => ({ id: i.id, cantidad: i.cantidad || 1 }));
  await query('SELECT fn_crear_pedido($1, $2, $3::jsonb, $4, $5, $6, $7)', [
    id, datos.correo, JSON.stringify(items), datos.metodoPago,
    datos.cuotas || 1, datos.total ?? null, datos.cuotaMonto || 0
  ]);
  return obtener(id);
}

/** Cambia el estado con el procedimiento almacenado */
async function cambiarEstado(id, estado) {
  await query('CALL sp_cambiar_estado_pedido($1, $2)', [id, estado]);
  return obtener(id);
}

module.exports = { listar, obtener, crear, cambiarEstado };
