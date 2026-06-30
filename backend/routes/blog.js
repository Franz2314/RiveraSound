/* ============================================ routes/blog.js - Rutas de blog y reseñas ============================================ */
/* Artículos del blog y reseñas de productos. Ambas entidades viven en MongoDB. */

const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/blogController');

// GET /api/blog/articulos - Lista artículos del blog (con fallback estático si MongoDB no responde)
router.get('/articulos', ctrl.listarArticulos);

// GET /api/blog/articulos/:id - Obtiene un artículo por su ObjectId de MongoDB
router.get('/articulos/:id', ctrl.obtenerArticulo);

// POST /api/blog/articulos - Crea un nuevo artículo (requiere título, resumen, contenido)
router.post('/articulos', ctrl.crearArticulo);

// GET /api/blog/resenas - Lista reseñas de productos, opcionalmente filtradas por producto_id
router.get('/resenas', ctrl.listarResenas);

// POST /api/blog/resenas - Crea una reseña de producto (requiere producto_id y puntuación 1-5)
router.post('/resenas', ctrl.crearResena);

module.exports = router;
