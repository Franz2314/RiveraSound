/* ============================================ config/postgres.js - Conexión a PostgreSQL (datos principales) ============================================ */
/* Usada por: productos, usuarios, pedidos. Pool de conexiones con pg. */

const { Pool } = require('pg');

/* --- Pool configurable vía variables de entorno con defaults locales --- */
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'riverasound',
  user: process.env.PG_USER || 'rivera_user',
  password: process.env.PG_PASSWORD || 'rivera_pass_2026',
  max: 20,                    // Máximo 20 conexiones simultáneas
  idleTimeoutMillis: 30000,   // Cierra conexiones inactivas tras 30 s
  connectionTimeoutMillis: 5000, // Timeout de conexión: 5 s
});

// Evento global de error del pool (conexiones perdidas, etc.)
pool.on('error', (err) => {
  console.error('Error inesperado en PostgreSQL pool:', err);
});

/**
 * testConnection - Verifica que PostgreSQL responda con SELECT NOW()
 * Devuelve boolean; no lanza error, solo warn si falla
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('PostgreSQL conectado:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.warn('PostgreSQL no disponible:', err.message);
    return false;
  }
}

/**
 * query - Wrapper para ejecutar queries con parámetros
 * Encapsula pool.query y relanza el error para que el controlador lo maneje
 */
async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('Error en query PostgreSQL:', err.message);
    throw err;
  }
}

module.exports = { pool, query, testConnection };
