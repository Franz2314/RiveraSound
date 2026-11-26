/**
 * middlewares/errores.js
 * Traduce los errores (sobre todo los de PostgreSQL) a respuestas HTTP con
 * un mensaje en español que el frontend puede mostrar tal cual.
 */

// Mensajes amigables para restricciones conocidas del esquema
const MENSAJES_RESTRICCION = {
  uq_usuarios_correo: 'El correo ya está registrado. Inicia sesión.',
  chk_usuarios_correo: 'El correo no tiene un formato válido.',
  instrumentos_pkey: 'Ya existe un instrumento con ese id.',
  pedidos_pkey: 'Ya existe un pedido con ese código.',
  pedidos_estado_check: 'Estado de pedido no válido.',
  instrumentos_stock_check: 'El stock debe ser disponible, pedido o agotado.',
  instrumentos_precio_check: 'El precio debe ser mayor a 0.',
  mensajes_tipo_check: 'El tipo de mensaje debe ser contacto, importacion o feedback.'
};

// Código de error de PostgreSQL (SQLSTATE) -> código HTTP
const ESTADO_POR_CODIGO = {
  23505: 409, // unique_violation       -> conflicto (duplicado)
  23503: 400, // foreign_key_violation  -> referencia inexistente
  23502: 400, // not_null_violation     -> falta un dato (ej. categoría inválida)
  23514: 400, // check_violation        -> regla de negocio
  '22P02': 400, // invalid_text_representation (ej. texto donde va número)
  22003: 400, // numeric_value_out_of_range
  P0002: 404 // no_data_found (lanzado por nuestras funciones)
};

/** Middleware de Express para rutas inexistentes */
function noEncontrado(req, res) {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
}

/** Middleware final de errores de Express (lleva 4 parámetros) */
// eslint-disable-next-line no-unused-vars
function manejarErrores(error, req, res, next) {
  const status = error.status || ESTADO_POR_CODIGO[error.code] || 500;

  let mensaje = error.message;
  if (error.type === 'entity.parse.failed') {
    mensaje = 'El cuerpo de la petición no es un JSON válido.';
  } else if (error.constraint && MENSAJES_RESTRICCION[error.constraint]) {
    mensaje = MENSAJES_RESTRICCION[error.constraint];
  } else if (error.code === '23502' && error.column === 'categoria_id') {
    mensaje = 'La categoría debe ser viento, cuerda, percusion o teclado.';
  } else if (status === 500) {
    // No exponemos detalles internos; quedan en la consola del servidor
    console.error('[API] Error no controlado:', error);
    mensaje = 'Error interno del servidor';
  }

  res.status(status).json({ error: mensaje });
}

module.exports = { noEncontrado, manejarErrores };
