/**
 * rutas/pedidos.js  ->  /api/pedidos
 *   GET   /                ?correo=cliente@x.pe   (sin correo: todos, para admin)
 *   GET   /:id
 *   POST  /                { id?, correo, items: [{id, cantidad}], metodoPago, cuotas, total, cuotaMonto }
 *   PATCH /:id/estado      { estado }
 */
const { Router } = require('express');
const repo = require('../repositorios/pedidos');
const { requerir, errorHttp, asincrono } = require('./validar');

const router = Router();

router.get('/', asincrono(async (req, res) => {
  res.json(await repo.listar(req.query.correo));
}));

router.get('/:id', asincrono(async (req, res) => {
  const pedido = await repo.obtener(req.params.id);
  if (!pedido) throw errorHttp(404, 'Pedido no encontrado');
  res.json(pedido);
}));

router.post('/', asincrono(async (req, res) => {
  requerir(req.body, ['correo', 'items', 'metodoPago']);
  if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
    throw errorHttp(400, 'El pedido no tiene productos');
  }
  res.status(201).json(await repo.crear(req.body));
}));

router.patch('/:id/estado', asincrono(async (req, res) => {
  requerir(req.body, ['estado']);
  res.json(await repo.cambiarEstado(req.params.id, req.body.estado));
}));

module.exports = router;
