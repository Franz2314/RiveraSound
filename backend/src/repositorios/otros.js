/**
 * repositorios/otros.js
 * Favoritos, mensajes de contacto, suscriptores del boletín y reportes.
 */
const { query } = require('../db/postgres');

/* ------------------------------- Favoritos ------------------------------- */

/** Favoritos de un usuario, con la forma que guarda js/favoritos.js */
async function listarFavoritos(correo) {
  const { rows } = await query(
    `SELECT c.id, c.nombre, c.marca, c.precio, c.emoji, c.stock
     FROM favoritos f
     JOIN usuarios u   ON u.id = f.usuario_id
     JOIN v_catalogo c ON c.id = f.instrumento_id
     WHERE lower(u.correo) = lower($1)
     ORDER BY f.creado_en`, [correo]);
  return rows;
}

/** Agrega un favorito (si ya existe, no hace nada) */
async function agregarFavorito(correo, instrumentoId) {
  const { rowCount } = await query(
    `INSERT INTO favoritos (usuario_id, instrumento_id)
     SELECT id, $2 FROM usuarios WHERE lower(correo) = lower($1)
     ON CONFLICT DO NOTHING`, [correo, instrumentoId]);
  return rowCount > 0;
}

/** Quita un favorito */
async function quitarFavorito(correo, instrumentoId) {
  const { rowCount } = await query(
    `DELETE FROM favoritos
     WHERE instrumento_id = $2
       AND usuario_id = (SELECT id FROM usuarios WHERE lower(correo) = lower($1))`,
    [correo, instrumentoId]);
  return rowCount > 0;
}

/* ------------------------------- Mensajes -------------------------------- */

/** Guarda un mensaje de contacto, importación o feedback */
async function crearMensaje({ tipo, nombre, correo, telefono, asunto, presupuesto, mensaje }) {
  const { rows } = await query(
    `INSERT INTO mensajes (tipo, nombre, correo, telefono, asunto, presupuesto, mensaje)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, tipo, creado_en`,
    [tipo, nombre, correo || null, telefono || null, asunto || null, presupuesto || null, mensaje]);
  return rows[0];
}

/** Lista mensajes (para el panel de administración) */
async function listarMensajes(tipo) {
  const { rows } = tipo
    ? await query('SELECT * FROM mensajes WHERE tipo = $1 ORDER BY creado_en DESC', [tipo])
    : await query('SELECT * FROM mensajes ORDER BY creado_en DESC');
  return rows;
}

/* ----------------------------- Suscriptores ------------------------------ */

/** Suscribe un correo al boletín; devuelve false si ya estaba suscrito */
async function suscribir(correo) {
  const { rowCount } = await query(
    'INSERT INTO suscriptores (correo) VALUES (lower($1)) ON CONFLICT DO NOTHING', [correo]);
  return rowCount > 0;
}

/* ------------------------------- Reportes -------------------------------- */

async function ventasPorCategoria() {
  const { rows } = await query('SELECT * FROM v_ventas_por_categoria');
  return rows;
}

async function topInstrumentos(limite = 5) {
  const { rows } = await query('SELECT * FROM v_top_instrumentos LIMIT $1', [limite]);
  return rows;
}

module.exports = {
  listarFavoritos, agregarFavorito, quitarFavorito,
  crearMensaje, listarMensajes,
  suscribir,
  ventasPorCategoria, topInstrumentos
};
