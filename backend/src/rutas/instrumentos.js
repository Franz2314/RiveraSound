/**
 * rutas/instrumentos.js  ->  /api/instrumentos
 *   GET    /                ?categoria=viento&buscar=yamaha
 *   GET    /:id
 *   POST   /                (panel admin: crear)
 *   PUT    /:id             (panel admin: editar)
 *   DELETE /:id             (panel admin: borrado lógico)
 */
const { Router } = require('express');
const repo = require('../repositorios/instrumentos');
const { requerir, errorHttp, asincrono } = require('./validar');

const router = Router();
const CAMPOS = ['nombre', 'marca', 'categoria', 'precio'];

router.get('/', asincrono(async (req, res) => {
  res.json(await repo.listar({ categoria: req.query.categoria, buscar: req.query.buscar }));
}));

router.get('/:id', asincrono(async (req, res) => {
  const instrumento = await repo.obtener(req.params.id);
  if (!instrumento) throw errorHttp(404, 'Instrumento no encontrado');
  res.json(instrumento);
}));

router.post('/', asincrono(async (req, res) => {
  requerir(req.body, CAMPOS);
  res.status(201).json(await repo.crear(req.body));
}));

router.put('/:id', asincrono(async (req, res) => {
  requerir(req.body, CAMPOS);
  const instrumento = await repo.actualizar(req.params.id, req.body);
  if (!instrumento) throw errorHttp(404, 'Instrumento no encontrado');
  res.json(instrumento);
}));

router.delete('/:id', asincrono(async (req, res) => {
  const eliminado = await repo.eliminar(req.params.id);
  if (!eliminado) throw errorHttp(404, 'Instrumento no encontrado');
  res.status(204).end();
}));

module.exports = router;
