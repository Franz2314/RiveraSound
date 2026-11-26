/**
 * db/mongodb.js
 * Conexión a MongoDB (base documental).
 * Uso sugerido en RiveraSound: reseñas de instrumentos y artículos del blog,
 * datos de forma flexible que no encajan bien en tablas fijas.
 * Colecciones e índices de ejemplo: backend/sql/mongodb/inicializar.mongodb.js
 *
 * Ejemplo de uso desde un repositorio:
 *   const { obtenerDb } = require('../db/mongodb');
 *   const db = await obtenerDb();
 *   await db.collection('resenas').insertOne({ instrumentoId, puntaje: 5, texto });
 */
const { MongoClient } = require('mongodb');
const config = require('../config/env');

let cliente = null; // se crea la primera vez que se necesita (conexión perezosa)

/** Devuelve la base de datos conectada, conectando si aún no lo está */
async function obtenerDb() {
  if (!config.mongo.habilitado) {
    throw new Error('MongoDB está deshabilitado (MONGO_HABILITADO=false en .env)');
  }
  if (!cliente) {
    const nuevo = new MongoClient(config.mongo.uri, { serverSelectionTimeoutMS: 5000 });
    await nuevo.connect();   // si falla, `cliente` sigue en null y se reintenta luego
    cliente = nuevo;
  }
  return cliente.db(config.mongo.db);
}

/** Prueba la conexión con el comando ping y lista las colecciones */
async function probar() {
  const db = await obtenerDb();
  await db.command({ ping: 1 });
  const info = await db.admin().serverInfo();
  const colecciones = (await db.listCollections().toArray()).map((c) => c.name);
  return { version: `MongoDB ${info.version}`, base: config.mongo.db, colecciones };
}

/** Cierra la conexión */
async function cerrar() {
  if (cliente) {
    await cliente.close();
    cliente = null;
  }
}

module.exports = { obtenerDb, probar, cerrar };
