/* ============================================ routes/pedidos.js - Rutas de pedidos ============================================ */
/* CRUD de pedidos + actualización de estado. Operaciones transaccionales sobre PostgreSQL. */

const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/pedidosController');

// GET /api/pedidos - Lista pedidos con filtro opcional por estado y paginación (limite/offset)
router.get('/', ctrl.listar);

// GET /api/pedidos/:id - Obtiene un pedido con todos sus items (detalle_pedidos)
router.get('/:id', ctrl.obtener);

// POST /api/pedidos - Crea un nuevo pedido (transacción: valida stock, calcula total, inserta detalles)
router.post('/', ctrl.crear);

// PATCH /api/pedidos/:id/estado - Actualiza el estado de un pedido (pendiente, confirmado, enviado, entregado, cancelado)
router.patch('/:id/estado', ctrl.actualizarEstado);

module.exports = router;
