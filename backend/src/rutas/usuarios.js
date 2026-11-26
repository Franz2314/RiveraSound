/**
 * rutas/usuarios.js  ->  /api/usuarios
 *   POST /registro           { nombre, apellido, correo, password }
 *   POST /login              { correo, password }
 *   GET  /:correo
 *   PUT  /:correo/envio      { telefono, direccion, ciudad }
 */
const { Router } = require('express');
const repo = require('../repositorios/usuarios');
const { requerir, errorHttp, asincrono } = require('./validar');

const router = Router();

router.post('/registro', asincrono(async (req, res) => {
  requerir(req.body, ['nombre', 'correo', 'password']);
  res.status(201).json(await repo.registrar(req.body));
}));

router.post('/login', asincrono(async (req, res) => {
  requerir(req.body, ['correo', 'password']);
  const usuario = await repo.login(req.body.correo, req.body.password);
  if (!usuario) throw errorHttp(401, 'Correo o contraseña incorrectos');
  res.json(usuario);
}));

router.get('/:correo', asincrono(async (req, res) => {
  const usuario = await repo.obtenerPorCorreo(req.params.correo);
  if (!usuario) throw errorHttp(404, 'Usuario no encontrado');
  res.json(usuario);
}));

router.put('/:correo/envio', asincrono(async (req, res) => {
  const usuario = await repo.actualizarEnvio(req.params.correo, req.body);
  if (!usuario) throw errorHttp(404, 'Usuario no encontrado');
  res.json(usuario);
}));

module.exports = router;
