// =============================================================================
// RiveraSound · MongoDB · Colecciones, validación, índices y usuario de la app
// -----------------------------------------------------------------------------
// Ejecutar en mongosh:     mongosh < inicializar.mongodb.js
// o en MongoDB Compass:    pestaña "Mongosh" (abajo) -> pegar el contenido.
//
// Uso en el proyecto: datos de forma flexible que no encajan bien en tablas.
//   resenas -> opiniones de clientes sobre cada instrumento (texto, fotos, etiquetas)
//   blog    -> artículos del blog (hoy están fijos en js/catalogo.js)
// =============================================================================

use('riverasound');

// --- Colección "resenas" con validación de esquema ($jsonSchema) -------------
db.resenas.drop();
db.createCollection('resenas', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['instrumentoId', 'correo', 'puntaje', 'fecha'],
      properties: {
        instrumentoId: { bsonType: 'string', description: 'id del instrumento en PostgreSQL' },
        correo:        { bsonType: 'string' },
        puntaje:       { bsonType: 'int', minimum: 1, maximum: 5 },
        texto:         { bsonType: 'string', maxLength: 1000 },
        etiquetas:     { bsonType: 'array', items: { bsonType: 'string' } },
        fecha:         { bsonType: 'date' }
      }
    }
  }
});

// Índice para listar rápido las reseñas de un instrumento, más recientes primero
db.resenas.createIndex({ instrumentoId: 1, fecha: -1 });
// Un cliente solo puede reseñar una vez cada instrumento
db.resenas.createIndex({ instrumentoId: 1, correo: 1 }, { unique: true });

db.resenas.insertMany([
  { instrumentoId: 'cajon-meinl', correo: 'cliente@riverasound.pe', puntaje: NumberInt(5),
    texto: 'Suena increíble, la bordona se nota mucho.', etiquetas: ['calidad', 'sonido'], fecha: new Date() },
  { instrumentoId: 'piano-roland', correo: 'cliente@riverasound.pe', puntaje: NumberInt(4),
    texto: 'Muy buena acción de teclas, el envío tardó un poco.', etiquetas: ['envio'], fecha: new Date() }
]);

// --- Colección "blog" ---------------------------------------------------------
db.blog.drop();
db.blog.insertOne({
  titulo: 'Cómo elegir tu primer saxofón',
  resumen: 'Guía completa para principiantes sobre tipos de saxofón y precios.',
  emoji: '🎷',
  fecha: new Date('2026-05-15'),
  etiquetas: ['viento', 'principiantes'],
  contenido: '<p>Elegir tu primer saxofón puede ser abrumador...</p>'
});
db.blog.createIndex({ fecha: -1 });

// --- Consultas de ejemplo -----------------------------------------------------
// Promedio de puntaje por instrumento
db.resenas.aggregate([
  { $group: { _id: '$instrumentoId', promedio: { $avg: '$puntaje' }, total: { $sum: 1 } } },
  { $sort: { promedio: -1 } }
]);

// --- Usuario de la aplicación (solo lectura/escritura en esta base) ----------
// Si ya existe, este comando da error: es normal, puedes ignorarlo.
db.createUser({ user: 'riverasound_app', pwd: 'mongo_app_123', roles: ['readWrite'] });
// Con este usuario, en backend/.env:
//   MONGO_URI=mongodb://riverasound_app:mongo_app_123@localhost:27017/?authSource=riverasound
