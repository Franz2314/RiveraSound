/**
 * db/postgres.js
 * Conexión a PostgreSQL (base de datos PRINCIPAL del proyecto).
 * Usa un "pool": un grupo de conexiones abiertas que se reutilizan entre
 * peticiones, en lugar de abrir y cerrar una conexión por cada consulta.
 */
const { Pool, types } = require('pg');
const config = require('../config/env');

// NUMERIC (oid 1700) llega como texto por defecto; lo convertimos a número
// para que el frontend reciba precios como 2850 y no como "2850.00".
types.setTypeParser(1700, (valor) => (valor === null ? null : parseFloat(valor)));

const pool = new Pool({
  host: config.postgres.host,
  port: config.postgres.port,
  database: config.postgres.database,
  user: config.postgres.user,
  password: config.postgres.password,
  max: 10,                      // conexiones simultáneas como máximo
  idleTimeoutMillis: 30000,     // cierra conexiones inactivas tras 30 s
  connectionTimeoutMillis: 5000 // falla rápido si el servidor no responde
});

/**
 * Ejecuta una consulta parametrizada.
 * Usar SIEMPRE $1, $2... en lugar de concatenar texto (evita inyección SQL).
 * @param {string} sql
 * @param {Array} [parametros]
 */
function query(sql, parametros = []) {
  return pool.query(sql, parametros);
}

/**
 * Ejecuta varias consultas en UNA transacción: si alguna falla, se deshacen todas.
 * @param {(cliente: import('pg').PoolClient) => Promise<any>} trabajo
 */
async function transaccion(trabajo) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    const resultado = await trabajo(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (error) {
    await cliente.query('ROLLBACK');
    throw error;
  } finally {
    cliente.release(); // devuelve la conexión al pool
  }
}

/** Prueba la conexión y devuelve la versión del servidor */
async function probar() {
  const { rows } = await pool.query('SELECT version() AS version, current_database() AS base, current_user AS usuario');
  return { version: rows[0].version.split(',')[0], base: rows[0].base, usuario: rows[0].usuario };
}

/** Cierra todas las conexiones (al apagar el servidor) */
function cerrar() {
  return pool.end();
}

module.exports = { pool, query, transaccion, probar, cerrar };
