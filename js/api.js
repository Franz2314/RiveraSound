/* Cliente de la API REST (backend/ con PostgreSQL) */

var RiveraSound = RiveraSound || {};

/**
 * RiveraSound.api
 * Puente entre el frontend y el backend. Funciona en "modo híbrido":
 *  - Si la API responde, los datos se leen y guardan en PostgreSQL, y el
 *    localStorage queda como copia local (caché) para que el resto del código
 *    siga funcionando sin cambios.
 *  - Si la API NO responde (por ejemplo, abriste el sitio con python -m
 *    http.server sin encender el backend), todo sigue funcionando como antes,
 *    solo con localStorage.
 */
RiveraSound.api = {

  /* URL base: mismo servidor si el sitio lo sirve el backend (puerto 3000);
     si no, se asume el backend en localhost:3000 */
  base: (location.port === '3000' || location.protocol === 'file:')
    ? '/api'
    : `${location.protocol}//${location.hostname}:3000/api`,

  /* true cuando el backend respondió correctamente a /api/salud */
  disponible: false,

  /**
   * verificar: comprueba si el backend y PostgreSQL están en línea.
   * Espera como máximo 2 segundos para no retrasar la carga del sitio.
   */
  async verificar() {
    const control = new AbortController();
    const temporizador = setTimeout(() => control.abort(), 2000);
    try {
      const res = await fetch(`${this.base}/salud`, { signal: control.signal });
      this.disponible = res.ok;
    } catch (_) {
      this.disponible = false;
    } finally {
      clearTimeout(temporizador);
    }
    return this.disponible;
  },

  /**
   * pedir: hace una petición JSON a la API.
   * Lanza un Error con el mensaje en español que devuelve el backend
   * (por ejemplo "El correo ya está registrado") y su código HTTP en .status.
   */
  async pedir(metodo, ruta, cuerpo) {
    const opciones = { method: metodo, headers: {} };
    if (cuerpo !== undefined) {
      opciones.headers['Content-Type'] = 'application/json';
      opciones.body = JSON.stringify(cuerpo);
    }
    const res = await fetch(`${this.base}${ruta}`, opciones);
    if (res.status === 204) return null;

    const datos = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(datos.error || `Error ${res.status} en la API`);
      error.status = res.status;
      throw error;
    }
    return datos;
  },

  /**
   * enviarSinEsperar: guarda algo en el backend sin bloquear la interfaz
   * (contacto, feedback, boletín, favoritos). Si falla, solo avisa en consola.
   */
  enviarSinEsperar(metodo, ruta, cuerpo) {
    if (!this.disponible) return;
    this.pedir(metodo, ruta, cuerpo).catch((e) => console.warn('[API]', ruta, e.message));
  },

  /**
   * sincronizarCatalogo: trae los instrumentos de PostgreSQL y los copia al
   * localStorage (que es de donde lee catalogo.js). Devuelve true si cambiaron.
   */
  async sincronizarCatalogo() {
    if (!this.disponible) return false;
    const lista = await this.pedir('GET', '/instrumentos');
    const antes = JSON.stringify(RiveraSound.catalogo.instrumentos);
    if (antes === JSON.stringify(lista)) return false;
    RiveraSound.catalogo.instrumentos = lista; // el setter guarda en localStorage
    return true;
  },

  /**
   * sincronizarUsuario: copia al localStorage los pedidos y favoritos que el
   * usuario tiene en PostgreSQL (se llama al iniciar sesión y al cargar el sitio).
   */
  async sincronizarUsuario(correo) {
    if (!this.disponible || !correo) return;
    const correoNorm = correo.trim().toLowerCase();

    // Pedidos: se reemplazan los de este usuario por los de la base de datos
    const pedidosApi = await this.pedir('GET', `/pedidos?correo=${encodeURIComponent(correoNorm)}`);
    const otros = RiveraSound.carrito.obtenerPedidos()
      .filter((p) => (p.usuario || '').trim().toLowerCase() !== correoNorm);
    localStorage.setItem(RiveraSound.carrito.pedidosKey, JSON.stringify(pedidosApi.concat(otros)));

    // Favoritos: misma clave que usa favoritos.js
    const favoritos = await this.pedir('GET', `/favoritos?correo=${encodeURIComponent(correoNorm)}`);
    localStorage.setItem('riverasound_favoritos_' + correoNorm, JSON.stringify(favoritos));
    try { RiveraSound.favoritos.cargar(); } catch (_) {}
  },

  /**
   * iniciar: se llama una vez desde app.js. Detecta el backend y sincroniza.
   * Si el catálogo cambió y el usuario está viendo productos, vuelve a dibujar.
   */
  async iniciar() {
    if (!(await this.verificar())) {
      console.info('[API] Backend no disponible: modo local (localStorage).');
      return;
    }
    console.info('[API] Conectado al backend: datos en PostgreSQL.');
    try {
      const cambio = await this.sincronizarCatalogo();

      const sesion = JSON.parse(localStorage.getItem('riverasound_usuario') || 'null');
      if (sesion) await this.sincronizarUsuario(sesion.correo);

      const vistasConProductos = ['inicio', 'instrumentos', 'catalogo', 'ofertas', 'favoritos', 'cuenta-pedidos', 'cuenta-admin'];
      if (cambio && vistasConProductos.includes(RiveraSound.router.currentRoute)) {
        RiveraSound.router.currentRoute = null; // fuerza a volver a dibujar la vista
        RiveraSound.router.resolve();
      }
    } catch (e) {
      console.warn('[API] No se pudo sincronizar:', e.message);
    }
  },

  /** esAdmin: true si el usuario en sesión es administrador */
  esAdmin(usuario) {
    if (!usuario) return false;
    return usuario.rol === 'admin' || usuario.correo === 'demo@riverasound.pe';
  }
};
