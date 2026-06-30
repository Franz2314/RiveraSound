/* ============================================ routes/productos.js - Rutas de productos ============================================ */
/* CRUD completo de productos + consulta de categorías. Todos los endpoints bajo /api/productos. */

const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/productosController');

// GET /api/productos - Lista todos los productos con filtros opcionales (categoría, búsqueda, stock)
router.get('/', ctrl.listar);

// GET /api/productos/categorias - Devuelve las categorías agrupadas con su conteo de productos
router.get('/categorias', ctrl.obtenerCategorias);

// GET /api/productos/:id - Obtiene un producto por su ID (slug string)
router.get('/:id', ctrl.obtener);

// POST /api/productos - Crea un nuevo producto (requiere nombre, marca, categoría, precio)
router.post('/', ctrl.crear);

// PUT /api/productos/:id - Actualiza parcial o totalmente un producto
router.put('/:id', ctrl.actualizar);

// DELETE /api/productos/:id - Elimina un producto por ID
router.delete('/:id', ctrl.eliminar);

module.exports = router;
