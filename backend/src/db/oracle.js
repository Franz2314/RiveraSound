/**
 * db/oracle.js
 * Conexión a Oracle Database (relacional, como PostgreSQL).
 * Usa el modo "Thin" de node-oracledb: NO necesita instalar Oracle Instant
 * Client, solo tener Oracle XE (o Autonomous Database) corriendo.
 * Uso sugerido en RiveraSound: réplica del esquema relacional para reportes
 * o comparar sintaxis Oracle vs PostgreSQL (backend/sql/oracle/01_esquema.sql).
 *
 * Ejemplo de uso:
 *   const { ejecutar } = require('../db/oracle');
 *   const r = await ejecutar('SELECT * FROM instrumentos WHERE precio > :p', { p: 1000 });
 */
const oracledb = require('oracledb');
const config = require('../config/env');

// Devuelve filas como objetos { COLUMNA: valor } en lugar de arreglos
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

let pool = null;

/** Crea (una sola vez) el pool de conexiones */
async function obtenerPool() {
  if (!config.oracle.habilitado) {
    throw new Error('Oracle está deshabilitado (ORACLE_HABILITADO=false en .env)');
  }
  if (!pool) {
    pool = await oracledb.createPool({
      user: config.oracle.usuario,
      password: config.oracle.clave,
      connectString: config.oracle.cadena,  // host:puerto/servicio
      poolMin: 0,
      poolMax: 4
    });
  }
  return pool;
}

/**
 * Ejecuta una sentencia con parámetros nombrados (:nombre) y la confirma.
 * @param {string} sql
 * @param {object} [parametros]
 */
async function ejecutar(sql, parametros = {}) {
  const p = await obtenerPool();
  const conexion = await p.getConnection();
  try {
    return await conexion.execute(sql, parametros, { autoCommit: true });
  } finally {
    await conexion.close(); // devuelve la conexión al pool
  }
}

/** Prueba la conexión: usuario conectado y versión de la base */
async function probar() {
  const r = await ejecutar(
    "SELECT USER AS usuario, SYS_CONTEXT('USERENV', 'DB_NAME') AS base FROM dual");
  const p = await obtenerPool();
  const conexion = await p.getConnection();
  const version = conexion.oracleServerVersionString;
  await conexion.close();
  return { version: `Oracle ${version}`, usuario: r.rows[0].USUARIO, base: r.rows[0].BASE };
}

/** Cierra el pool */
async function cerrar() {
  if (pool) {
    await pool.close(5);
    pool = null;
  }
}

module.exports = { ejecutar, probar, cerrar };
