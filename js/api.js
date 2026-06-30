/* ============================================ api.js - Capa de comunicación con el backend REST ============================================ */

var RiveraSound = RiveraSound || {};

/**
 * RiveraSound.api - Cliente HTTP para consumir la API REST del backend.
 * Todas las peticiones se hacen a http://localhost:3000/api (backend en Node.js/Express).
 * Los errores de red o de respuesta se capturan y retornan null para evitar crasheos.
 */
RiveraSound.api = {

  BASE: 'http://localhost:3000/api', // URL base del backend. Cambiar en producción.

  /** fetchJSON - Helper genérico para peticiones fetch. Convierte la respuesta a JSON y captura errores.
   *  @param {string} url - URL completa del endpoint.
   *  @param {object} [options] - Opciones de fetch (method, headers, body, etc.).
   *  @returns {Promise<object|null>} - Datos parseados o null si hay error.
   */
  fetchJSON: function (url, options) {
    return fetch(url, options || {})
      .then(function (r) {
        if (r.status === 401) {
          return r.json().then(function (data) {
            RiveraSound.api.setToken(null);
            localStorage.removeItem('riverasound_usuario');
            return data;
          }).catch(function () {
            return { error: 'Sesión expirada' };
          });
        }
        if (!r.ok) {
          return r.json().catch(function () {
            return { error: 'Error ' + r.status };
          });
        }
        return r.json();
      });
  },

  /* ============ ENDPOINTS ============ */

  /** getProductos - Obtiene todos los productos del catálogo. GET /api/productos */
  getProductos: function () {
    return this.fetchJSON(this.BASE + '/productos');
  },

  /** getProducto - Obtiene un producto por su ID. GET /api/productos/:id */
  getProducto: function (id) {
    return this.fetchJSON(this.BASE + '/productos/' + id);
  },

  /** enviarContacto - Envía el formulario de contacto. POST /api/contacto */
  enviarContacto: function (data) {
    return this.fetchJSON(this.BASE + '/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  /** crearPedido - Crea un pedido con los items del carrito. POST /api/pedidos */
  crearPedido: function (data) {
    return this.fetchJSON(this.BASE + '/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  /** login - Autenticación de usuario. POST /api/usuarios/login */
  login: function (creds) {
    return this.fetchJSON(this.BASE + '/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds)
    });
  },

  /** registrar - Registro de nuevo usuario. POST /api/usuarios/registro */
  registrar: function (data) {
    return this.fetchJSON(this.BASE + '/usuarios/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  /** obtenerPerfil - GET /api/usuarios/perfil (requiere token) */
  obtenerPerfil: function () {
    return this.fetchJSON(this.BASE + '/usuarios/perfil', {
      headers: { 'Authorization': 'Bearer ' + this.getToken() }
    });
  },

  /* ============ CARRITO ============ */

  /** carritoListar - GET /api/carrito - Lista items del carrito */
  carritoListar: function () {
    return this.fetchJSON(this.BASE + '/carrito', {
      headers: { 'Authorization': 'Bearer ' + this.getToken() }
    });
  },

  /** carritoAgregar - POST /api/carrito - Agrega producto al carrito */
  carritoAgregar: function (productoId, cantidad) {
    return this.fetchJSON(this.BASE + '/carrito', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.getToken() },
      body: JSON.stringify({ producto_id: productoId, cantidad: cantidad || 1 })
    });
  },

  /** carritoActualizar - PUT /api/carrito/:id - Actualiza cantidad */
  carritoActualizar: function (id, cantidad) {
    return this.fetchJSON(this.BASE + '/carrito/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.getToken() },
      body: JSON.stringify({ cantidad: cantidad })
    });
  },

  /** carritoEliminar - DELETE /api/carrito/:id - Elimina item */
  carritoEliminar: function (id) {
    return this.fetchJSON(this.BASE + '/carrito/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + this.getToken() }
    });
  },

  /** carritoVaciar - DELETE /api/carrito - Vacía carrito */
  carritoVaciar: function () {
    return this.fetchJSON(this.BASE + '/carrito', {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + this.getToken() }
    });
  },

  /** carritoTotal - GET /api/carrito/total - Total del carrito */
  carritoTotal: function () {
    return this.fetchJSON(this.BASE + '/carrito/total', {
      headers: { 'Authorization': 'Bearer ' + this.getToken() }
    });
  },

  /* ============ TOKEN ============ */
  getToken: function () {
    return localStorage.getItem('riverasound_token') || '';
  },

  setToken: function (token) {
    if (token) localStorage.setItem('riverasound_token', token);
    else localStorage.removeItem('riverasound_token');
  }
};
