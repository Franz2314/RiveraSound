/* ============================================ server.js - Punto de entrada del backend RiveraSound ============================================ */
/* Express + 3 BBDD (PostgreSQL, MongoDB, Cassandra) + rutas API REST + contacto + SPA */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const postgres = require('./config/postgres');
const mongodb = require('./config/mongodb');
const cassandra = require('./config/cassandra');

const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const pedidosRoutes = require('./routes/pedidos');
const blogRoutes = require('./routes/blog');
const carritoRoutes = require('./routes/carrito');

const app = express();

/* ============ Middlewares globales ============ */

// CORS configurable desde variable de entorno; permite métodos y headers típicos REST
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parseo de JSON con límite de 10 MB y datos URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos servidos desde la raíz del proyecto (para el frontend SPA)
// `index: false` evita que express.static sirva index.html/Index.html en la raíz,
// así el SPA fallback sirve PaginasHTML/Index/Index.html directamente (sin redirect).
app.use(express.static(path.join(__dirname, '..'), { index: false }));
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

/* ============ Montaje de rutas API ============ */

app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/carrito', carritoRoutes);

/* ============ Endpoint de contacto ============ */

// POST /api/contacto - Recibe consultas del formulario de contacto; solo log y respuesta
app.post('/api/contacto', (req, res) => {
  const { nombre, apellido, correo, mensaje } = req.body;
  console.log('Contacto:', { nombre, apellido, correo });
  res.json({ exito: true, mensaje: 'Mensaje recibido, te responderemos pronto.' });
});

/* ============ Fallback para SPA y 404 de API ============ */

// Si la ruta empieza con /api/ y no coincide, devuelve 404 JSON
// Cualquier otra ruta sirve el Index.html (SPA - client-side routing)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  res.sendFile(path.join(__dirname, '..', 'PaginasHTML', 'Index', 'Index.html'));
});

/* ============ Inicialización del servidor ============ */

const PORT = process.env.PORT || 3000;

// initDBs - Prueba conexión a las 3 BBDD de forma asíncrona al arrancar
async function initDBs() {
  console.log('Inicializando conexiones a bases de datos...');
  const pgOk = await postgres.testConnection();       // PostgreSQL (datos principales)
  const mongoOk = await mongodb.connectMongo();        // MongoDB (blog y reseñas)
  const cassOk = await cassandra.testConnection();     // Cassandra (logs de vistas)
  console.log(`PostgreSQL: ${pgOk ? '✅' : '❌'} | MongoDB: ${mongoOk ? '✅' : '❌'} | Cassandra: ${cassOk ? '✅' : '❌'}`);
  if (!pgOk) console.log('El servidor funcionará con datos de respaldo (fallback).');
}

// Arranque del servidor Express
app.listen(PORT, () => {
  console.log(`\n🎷 RiveraSound server`);
  console.log(`📍 http://localhost:${PORT}`);
  initDBs();
});
