const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/carritoController');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  req.usuarioId = 1;
  next();
}

router.get('/', authMiddleware, ctrl.listar);
router.post('/', authMiddleware, ctrl.agregar);
router.put('/:id', authMiddleware, ctrl.actualizarCantidad);
router.delete('/:id', authMiddleware, ctrl.eliminar);
router.delete('/', authMiddleware, ctrl.vaciar);
router.get('/total', authMiddleware, ctrl.total);

module.exports = router;
