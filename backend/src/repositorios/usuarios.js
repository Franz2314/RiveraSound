/**
 * repositorios/usuarios.js
 * Registro, login y datos de envío. Las contraseñas se procesan DENTRO de
 * PostgreSQL (fn_registrar_usuario / fn_validar_login con pgcrypto): la API
 * nunca lee ni devuelve el hash.
 */
const { query } = require('../db/postgres');

// Columnas públicas del usuario (nunca incluir password_hash)
const COLUMNAS = 'nombre, apellido, correo, telefono, direccion, ciudad, rol';

/** Normaliza nulos a '' para que el frontend reciba lo mismo que antes */
function aFormatoFrontend(fila) {
  if (!fila) return null;
  return {
    nombre: fila.nombre,
    apellido: fila.apellido || '',
    correo: fila.correo,
    telefono: fila.telefono || '',
    direccion: fila.direccion || '',
    ciudad: fila.ciudad || '',
    rol: fila.rol
  };
}

/** Registra un usuario nuevo y lo devuelve */
async function registrar({ nombre, apellido, correo, password }) {
  await query('SELECT fn_registrar_usuario($1, $2, $3, $4)', [nombre, apellido, correo, password]);
  return obtenerPorCorreo(correo);
}

/** Devuelve el usuario si correo y contraseña son correctos; si no, null */
async function login(correo, password) {
  const { rows } = await query(`SELECT ${COLUMNAS} FROM fn_validar_login($1, $2)`, [correo, password]);
  return aFormatoFrontend(rows[0]);
}

/** Busca por correo (sin importar mayúsculas) */
async function obtenerPorCorreo(correo) {
  const { rows } = await query(
    `SELECT ${COLUMNAS} FROM usuarios WHERE lower(correo) = lower($1)`, [correo]);
  return aFormatoFrontend(rows[0]);
}

/** Actualiza teléfono, dirección y ciudad (lo que edita la pestaña Perfil) */
async function actualizarEnvio(correo, { telefono, direccion, ciudad }) {
  const { rows } = await query(
    `UPDATE usuarios
     SET telefono = $2, direccion = $3, ciudad = $4
     WHERE lower(correo) = lower($1)
     RETURNING ${COLUMNAS}`,
    [correo, telefono || null, direccion || null, ciudad || null]
  );
  return aFormatoFrontend(rows[0]);
}

module.exports = { registrar, login, obtenerPorCorreo, actualizarEnvio };
