/**
 * config/env.js
 * Lee las variables de entorno (archivo backend/.env) y las expone ya
 * convertidas a su tipo, con valores por defecto para desarrollo local.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

/** Convierte "true"/"1"/"si" en booleano */
function bool(valor, porDefecto = false) {
  if (valor === undefined || valor === '') return porDefecto;
  return ['true', '1', 'si', 'sí', 'yes'].includes(String(valor).toLowerCase());
}

/** Convierte a número entero con valor por defecto */
function num(valor, porDefecto) {
  const n = parseInt(valor, 10);
  return Number.isNaN(n) ? porDefecto : n;
}

const e = process.env;

module.exports = {
  puerto: num(e.PORT, 3000),

  postgres: {
    host: e.PG_HOST || 'localhost',
    port: num(e.PG_PORT, 5432),
    database: e.PG_DATABASE || 'riverasound',
    user: e.PG_USER || 'rs_app',
    password: e.PG_PASSWORD || 'rs_app_123',
    // Credenciales del superusuario (solo para scripts/inicializar-postgres.js)
    adminUser: e.PG_ADMIN_USER || 'postgres',
    adminPassword: e.PG_ADMIN_PASSWORD || ''
  },

  mongo: {
    habilitado: bool(e.MONGO_HABILITADO),
    uri: e.MONGO_URI || 'mongodb://localhost:27017',
    db: e.MONGO_DB || 'riverasound'
  },

  cassandra: {
    habilitado: bool(e.CASSANDRA_HABILITADO),
    puntosContacto: (e.CASSANDRA_PUNTOS_CONTACTO || '127.0.0.1').split(',').map((s) => s.trim()),
    puerto: num(e.CASSANDRA_PUERTO, 9042),
    datacenter: e.CASSANDRA_DATACENTER || 'datacenter1',
    keyspace: e.CASSANDRA_KEYSPACE || 'riverasound',
    usuario: e.CASSANDRA_USUARIO || '',
    clave: e.CASSANDRA_CLAVE || ''
  },

  oracle: {
    habilitado: bool(e.ORACLE_HABILITADO),
    usuario: e.ORACLE_USUARIO || 'riverasound',
    clave: e.ORACLE_CLAVE || '',
    cadena: e.ORACLE_CADENA || 'localhost:1521/XEPDB1'
  }
};
