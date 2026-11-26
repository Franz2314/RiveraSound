/**
 * repositorios/instrumentos.js
 * Consultas SQL del catálogo. Devuelve los instrumentos con la MISMA forma que
 * usa el frontend: { id, nombre, marca, categoria, precio, stock, emoji, desc }.
 */
const { query } = require('../db/postgres');

/** Crea un id estilo "kebab-case" igual que js/admin.js (generarId) */
function generarId(nombre, marca) {
  return `${nombre}-${marca}`
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // quita tildes
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Lista el catálogo, con filtros opcionales.
 * @param {{ categoria?: string, buscar?: string }} filtros
 */
async function listar({ categoria, buscar } = {}) {
  const condiciones = [];
  const parametros = [];

  if (categoria) {
    parametros.push(categoria);
    condiciones.push(`v.categoria = $${parametros.length}`);
  }
  if (buscar) {
    parametros.push(`%${buscar}%`);
    condiciones.push(`(v.nombre ILIKE $${parametros.length} OR v.marca ILIKE $${parametros.length})`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  // v_catalogo ya filtra los inactivos y trae la categoría como texto.
  // Orden: el mismo del frontend (viento, cuerda, percusión, teclado) y,
  // dentro de cada categoría, el orden en que se registraron.
  const { rows } = await query(
    `SELECT v.* FROM v_catalogo v
     JOIN instrumentos i ON i.id = v.id
     JOIN categorias c   ON c.codigo = v.categoria
     ${where}
     ORDER BY c.id, i.creado_en, v.nombre`, parametros);
  return rows;
}

/** Busca un instrumento por id (null si no existe) */
async function obtener(id) {
  const { rows } = await query('SELECT * FROM v_catalogo WHERE id = $1', [id]);
  return rows[0] || null;
}

/**
 * Crea un instrumento. Si no trae id, se genera a partir de nombre y marca.
 * @param {object} datos  { id?, nombre, marca, categoria, precio, stock, emoji, desc }
 */
async function crear(datos) {
  const id = datos.id || generarId(datos.nombre, datos.marca);
  // Si existe pero fue eliminado (activo = false), lo reactiva con los datos nuevos.
  // Si existe y está activo, no toca nada (rowCount = 0) y avisamos del duplicado.
  const { rowCount } = await query(
    `INSERT INTO instrumentos (id, nombre, marca, categoria_id, precio, stock, emoji, descripcion)
     VALUES ($1, $2, $3, (SELECT id FROM categorias WHERE codigo = $4), $5, $6, $7, $8)
     ON CONFLICT (id) DO UPDATE
       SET nombre = EXCLUDED.nombre, marca = EXCLUDED.marca,
           categoria_id = EXCLUDED.categoria_id, precio = EXCLUDED.precio,
           stock = EXCLUDED.stock, emoji = EXCLUDED.emoji,
           descripcion = EXCLUDED.descripcion, activo = TRUE
       WHERE NOT instrumentos.activo`,
    [id, datos.nombre, datos.marca, datos.categoria, datos.precio,
      datos.stock || 'disponible', datos.emoji || null, datos.desc || null]
  );
  if (rowCount === 0) {
    const error = new Error(`Ya existe un instrumento con el id "${id}"`);
    error.status = 409;
    throw error;
  }
  return obtener(id);
}

/** Actualiza un instrumento existente (null si no existe) */
async function actualizar(id, datos) {
  const { rowCount } = await query(
    `UPDATE instrumentos
     SET nombre = $2, marca = $3,
         categoria_id = (SELECT id FROM categorias WHERE codigo = $4),
         precio = $5, stock = $6, emoji = $7, descripcion = $8,
         activo = TRUE
     WHERE id = $1`,
    [id, datos.nombre, datos.marca, datos.categoria, datos.precio,
      datos.stock || 'disponible', datos.emoji || null, datos.desc || null]
  );
  return rowCount ? obtener(id) : null;
}

/**
 * Elimina un instrumento con BORRADO LÓGICO (activo = false): así los pedidos
 * antiguos que lo incluyen no pierden su referencia.
 */
async function eliminar(id) {
  const { rowCount } = await query('UPDATE instrumentos SET activo = FALSE WHERE id = $1 AND activo', [id]);
  return rowCount > 0;
}

module.exports = { listar, obtener, crear, actualizar, eliminar, generarId };
