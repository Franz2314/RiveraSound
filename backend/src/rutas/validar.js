/**
 * rutas/validar.js
 * Ayudas pequeñas para validar el cuerpo de las peticiones y envolver
 * funciones async (para que sus errores lleguen al middleware de errores).
 */

/** Lanza 400 si falta alguno de los campos indicados */
function requerir(cuerpo, campos) {
  const faltan = campos.filter((c) => cuerpo[c] === undefined || cuerpo[c] === null || cuerpo[c] === '');
  if (faltan.length) {
    const error = new Error(`Faltan datos obligatorios: ${faltan.join(', ')}`);
    error.status = 400;
    throw error;
  }
}

/** Crea un error con código HTTP */
function errorHttp(status, mensaje) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

/** Envuelve un handler async: cualquier error va a next() */
function asincrono(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

module.exports = { requerir, errorHttp, asincrono };
