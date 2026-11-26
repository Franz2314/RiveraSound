/**
 * rutas/otros.js
 *   /api/favoritos     GET ?correo= | POST { correo, instrumentoId } | DELETE /:instrumentoId?correo=
 *   /api/mensajes      POST { tipo, nombre, correo?, telefono?, asunto?, presupuesto?, mensaje } | GET ?tipo=
 *   /api/suscriptores  POST { correo }
 *   /api/reportes      GET /ventas-por-categoria | GET /top-instrumentos?limite=5
 *   /api/salud         GET  -> estado de las 4 bases de datos
 */
const { Router } = require('express');
const repo = require('../repositorios/otros');
const { estadoConexiones } = require('../db');
const { requerir, errorHttp, asincrono } = require('./validar');

/* ------------------------------- Favoritos ------------------------------- */
const favoritos = Router();

favoritos.get('/', asincrono(async (req, res) => {
  requerir(req.query, ['correo']);
  res.json(await repo.listarFavoritos(req.query.correo));
}));

favoritos.post('/', asincrono(async (req, res) => {
  requerir(req.body, ['correo', 'instrumentoId']);
  const agregado = await repo.agregarFavorito(req.body.correo, req.body.instrumentoId);
  res.status(agregado ? 201 : 200).json({ agregado });
}));

favoritos.delete('/:instrumentoId', asincrono(async (req, res) => {
  requerir(req.query, ['correo']);
  const quitado = await repo.quitarFavorito(req.query.correo, req.params.instrumentoId);
  if (!quitado) throw errorHttp(404, 'Ese instrumento no estaba en favoritos');
  res.status(204).end();
}));

/* ------------------------------- Mensajes -------------------------------- */
const mensajes = Router();

mensajes.post('/', asincrono(async (req, res) => {
  requerir(req.body, ['tipo', 'nombre', 'mensaje']);
  res.status(201).json(await repo.crearMensaje(req.body));
}));

mensajes.get('/', asincrono(async (req, res) => {
  res.json(await repo.listarMensajes(req.query.tipo));
}));

/* ----------------------------- Suscriptores ------------------------------ */
const suscriptores = Router();

suscriptores.post('/', asincrono(async (req, res) => {
  requerir(req.body, ['correo']);
  const nuevo = await repo.suscribir(req.body.correo);
  res.status(nuevo ? 201 : 200).json({ suscrito: true, nuevo });
}));

/* ------------------------------- Reportes -------------------------------- */
const reportes = Router();

reportes.get('/ventas-por-categoria', asincrono(async (req, res) => {
  res.json(await repo.ventasPorCategoria());
}));

reportes.get('/top-instrumentos', asincrono(async (req, res) => {
  const limite = Math.min(parseInt(req.query.limite, 10) || 5, 50);
  res.json(await repo.topInstrumentos(limite));
}));

/* -------------------------------- Salud ---------------------------------- */
const salud = Router();

salud.get('/', asincrono(async (req, res) => {
  const estado = await estadoConexiones();
  // 200 si PostgreSQL (la base principal) responde; 503 si no
  res.status(estado.postgres.conectado ? 200 : 503).json(estado);
}));

module.exports = { favoritos, mensajes, suscriptores, reportes, salud };
