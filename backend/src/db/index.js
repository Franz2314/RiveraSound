/**
 * db/index.js
 * Punto único de acceso a las 4 bases de datos.
 * estadoConexiones() prueba cada una con un tiempo límite y nunca lanza error:
 * así la API arranca aunque MongoDB, Cassandra u Oracle no estén encendidos.
 */
const config = require('../config/env');
const postgres = require('./postgres');
const mongodb = require('./mongodb');
const cassandra = require('./cassandra');
const oracle = require('./oracle');

/** Corta una promesa que tarde más de `ms` milisegundos */
function conTiempoLimite(promesa, ms = 6000) {
  return Promise.race([
    promesa,
    new Promise((_, rechazar) => setTimeout(() => rechazar(new Error(`Sin respuesta en ${ms / 1000} s`)), ms))
  ]);
}

/** Prueba una base y devuelve { habilitado, conectado, detalle | error } */
async function probarUna(modulo, habilitado) {
  if (!habilitado) return { habilitado: false, conectado: false };
  try {
    const detalle = await conTiempoLimite(modulo.probar());
    return { habilitado: true, conectado: true, detalle };
  } catch (error) {
    // Solo la primera línea: algunos drivers (Cassandra) devuelven mensajes larguísimos
    return { habilitado: true, conectado: false, error: String(error.message).split('\n')[0] };
  }
}

/** Estado de las 4 conexiones (se usa en GET /api/salud y en npm run db:probar) */
async function estadoConexiones() {
  const [pg, mongo, cass, ora] = await Promise.all([
    probarUna(postgres, true), // PostgreSQL siempre es obligatorio
    probarUna(mongodb, config.mongo.habilitado),
    probarUna(cassandra, config.cassandra.habilitado),
    probarUna(oracle, config.oracle.habilitado)
  ]);
  return { postgres: pg, mongodb: mongo, cassandra: cass, oracle: ora };
}

/** Cierra todas las conexiones abiertas */
async function cerrarTodo() {
  await Promise.allSettled([postgres.cerrar(), mongodb.cerrar(), cassandra.cerrar(), oracle.cerrar()]);
}

module.exports = { postgres, mongodb, cassandra, oracle, estadoConexiones, cerrarTodo };
