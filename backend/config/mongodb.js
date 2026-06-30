/* ============================================ config/mongodb.js - Conexión a MongoDB (blog y reseñas) ============================================ */
/* Mongoose sobre MongoDB. Usada por blogController para artículos y reseñas de productos. */

const mongoose = require('mongoose');

/**
 * connectMongo - Intenta conectar a MongoDB con timeout de 5 s
 * URI configurable via MONGO_URI; fallback a localhost con autenticación admin
 * Devuelve true/false sin lanzar error
 */
async function connectMongo() {
  const uri = process.env.MONGO_URI || 'mongodb://root:example@localhost:27017/riverasound?authSource=admin';

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  // Timeout para encontrar servidor
      connectTimeoutMS: 5000,          // Timeout de conexión inicial
    });
    console.log('MongoDB conectado:', mongoose.connection.host);
    return true;
  } catch (err) {
    console.warn('MongoDB no disponible:', err.message);
    return false;
  }
}

// Eventos de conexión para monitoreo
mongoose.connection.on('error', (err) => {
  console.error('Error en MongoDB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB desconectado');
});

module.exports = { connectMongo, mongoose };
