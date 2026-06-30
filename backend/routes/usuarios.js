/* ============================================ routes/usuarios.js - Rutas de usuarios y autenticación ============================================ */
/* Registro, login, perfil y pedidos del usuario autenticado. Middleware de token simulado. */

const { Router } = require('express');
const router = Router();
const ctrl = require('../controllers/usuariosController');

/* ============ Middleware de autenticación (placeholder) ============ */

/**
 * authMiddleware - Extrae token Bearer del header Authorization
 * Si no hay token, responde 401. Por ahora asigna usuarioId=1 (simulado).
 * En producción debería validar JWT contra la BD.
 */
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  req.usuarioId = 1;
  next();
}

/* ============ Rutas públicas ============ */

// POST /api/usuarios/registro - Registra un nuevo usuario (nombre, apellido, correo, password)
router.post('/registro', ctrl.registrar);

// POST /api/usuarios/login - Inicia sesión con correo y contraseña; devuelve token
router.post('/login', ctrl.login);

/* ============ Rutas protegidas (requieren autenticación) ============ */

// GET /api/usuarios/perfil - Obtiene datos del perfil del usuario autenticado
router.get('/perfil', authMiddleware, ctrl.perfil);

// PUT /api/usuarios/perfil - Actualiza nombre, apellido, teléfono y/o dirección
router.put('/perfil', authMiddleware, ctrl.actualizarPerfil);

// GET /api/usuarios/pedidos - Lista los pedidos del usuario autenticado con sus items
router.get('/pedidos', authMiddleware, ctrl.listarPedidos);

module.exports = router;
