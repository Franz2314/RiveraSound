/**
 * app.js
 * Configura Express: la API en /api/* y, además, sirve el frontend existente
 * (css, js, img, PaginasHTML) desde el mismo puerto. Así el sitio y la API
 * comparten origen y no hay problemas de CORS.
 */
const path = require('path');
const express = require('express');
const cors = require('cors');

const rutasInstrumentos = require('./rutas/instrumentos');
const rutasUsuarios = require('./rutas/usuarios');
const rutasPedidos = require('./rutas/pedidos');
const otras = require('./rutas/otros');
const { noEncontrado, manejarErrores } = require('./middlewares/errores');

const app = express();
const RAIZ_PROYECTO = path.resolve(__dirname, '..', '..'); // carpeta RiveraSound/

// --- Middlewares generales ---
app.use(cors());                          // permite abrir el frontend desde otro puerto (ej. Live Server)
app.use(express.json({ limit: '100kb' })); // lee cuerpos JSON

// --- API REST ---
app.use('/api/salud', otras.salud);
app.use('/api/instrumentos', rutasInstrumentos);
app.use('/api/usuarios', rutasUsuarios);
app.use('/api/pedidos', rutasPedidos);
app.use('/api/favoritos', otras.favoritos);
app.use('/api/mensajes', otras.mensajes);
app.use('/api/suscriptores', otras.suscriptores);
app.use('/api/reportes', otras.reportes);
app.use('/api', noEncontrado); // cualquier otra /api/... -> 404 en JSON

// --- Frontend estático ---
// Solo se publican estas carpetas: NUNCA la raíz completa, porque ahí está
// backend/.env con las contraseñas.
['css', 'js', 'img', 'PaginasHTML'].forEach((carpeta) => {
  app.use(`/${carpeta}`, express.static(path.join(RAIZ_PROYECTO, carpeta)));
});

// La página de inicio del SPA
app.get('/', (req, res) => res.redirect('/PaginasHTML/Index/Index.html'));

// --- Manejo de errores (siempre al final) ---
app.use(manejarErrores);

module.exports = app;
