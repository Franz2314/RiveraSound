/**
 * db/cassandra.js
 * Conexión a Apache Cassandra (base de columnas anchas).
 * Uso sugerido en RiveraSound: historial de actividad (qué instrumentos ve
 * cada usuario y cuándo), datos de escritura masiva ordenados por tiempo.
 * Keyspace y tablas de ejemplo: backend/sql/cassandra/esquema.cql
 *
 * Funciona igual con Cassandra en WSL/Ubuntu o en Docker: ambos exponen el
 * puerto 9042 en localhost.
 *
 * Ejemplo de uso:
 *   const { obtenerCliente } = require('../db/cassandra');
 *   const cliente = await obtenerCliente();
 *   await cliente.execute(
 *     'INSERT INTO vistas_por_usuario (correo, fecha, instrumento_id) VALUES (?, ?, ?)',
 *     [correo, new Date(), instrumentoId], { prepare: true });
 */
const cassandra = require('cassandra-driver');
const config = require('../config/env');

let cliente = null;

/** Crea (una sola vez) y devuelve el cliente conectado */
async function obtenerCliente() {
  if (!config.cassandra.habilitado) {
    throw new Error('Cassandra está deshabilitado (CASSANDRA_HABILITADO=false en .env)');
  }
  if (!cliente) {
    const c = config.cassandra;
    const opciones = {
      contactPoints: c.puntosContacto,
      protocolOptions: { port: c.puerto },
      localDataCenter: c.datacenter,                 // obligatorio en el driver 4.x
      socketOptions: { connectTimeout: 5000 }
    };
    // Solo si activaste PasswordAuthenticator en cassandra.yaml
    if (c.usuario) {
      opciones.authProvider = new cassandra.auth.PlainTextAuthProvider(c.usuario, c.clave);
    }
    const nuevo = new cassandra.Client(opciones);
    try {
      await nuevo.connect();
    } catch (error) {
      await nuevo.shutdown();   // libera recursos y permite reintentar luego
      throw error;
    }
    cliente = nuevo;
  }
  return cliente;
}

/** Prueba la conexión: versión del nodo y si el keyspace del proyecto existe */
async function probar() {
  const c = await obtenerCliente();
  const version = await c.execute('SELECT release_version FROM system.local');
  const ks = await c.execute(
    'SELECT keyspace_name FROM system_schema.keyspaces WHERE keyspace_name = ?',
    [config.cassandra.keyspace], { prepare: true });
  return {
    version: `Cassandra ${version.rows[0].release_version}`,
    keyspace: config.cassandra.keyspace,
    keyspaceExiste: ks.rowLength > 0
  };
}

/** Cierra la conexión */
async function cerrar() {
  if (cliente) {
    await cliente.shutdown();
    cliente = null;
  }
}

module.exports = { obtenerCliente, probar, cerrar };
