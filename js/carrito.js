/* Gestión del Carrito de Compras e Historial de Pedidos */

var RiveraSound = RiveraSound || {};

// Módulo encargado de gestionar el carrito de compras e historial de pedidos locales
RiveraSound.carrito = {
  
  // Clave utilizada para almacenar el carrito actual en localStorage
  key: 'riverasound_carrito',
  
  // Clave utilizada para almacenar el historial de pedidos en localStorage
  pedidosKey: 'riverasound_pedidos',
  
  // Array en memoria que contendrá los productos agregados
  items: [],

  /**
   * init: Inicializa el estado del carrito cargando datos previos de localStorage.
   */
  init() {
    this.cargar();
    this.actualizarBadge();
  },

  /**
   * cargar: Intenta leer y deserializar el carrito de compras guardado en el navegador.
   */
  cargar() {
    try {
      const datosGuardados = localStorage.getItem(this.key);
      this.items = datosGuardados ? JSON.parse(datosGuardados) : [];
    } catch (e) {
      this.items = []; // Caso de error por corrupción de datos o almacenamiento bloqueado
    }
  },

  /**
   * guardar: Serializa y escribe el carrito actual en localStorage, actualizando el badge del header.
   */
  guardar() {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.actualizarBadge(); // Refresca el indicador numérico del botón del carrito
  },

  /**
   * obtener: Retorna una copia superficial del listado de items para evitar manipulaciones indeseadas.
   */
  obtener() {
    return this.items.slice();
  },

  /**
   * agregar: Añade un instrumento al carrito. Incrementa cantidad si ya existía.
   * @param {object} producto - El objeto del producto a agregar.
   */
  agregar(producto) {
    let existente = null;
    
    // Buscamos si el producto ya está en el carrito para no duplicar filas
    this.items.forEach((item) => {
      if (item.id === producto.id) {
        existente = item;
      }
    });

    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1; // Incrementamos cantidad
    } else {
      producto.cantidad = 1; // Primer item agregado
      this.items.push(producto);
    }

    this.guardar();
    RiveraSound.utils.notificar(`${producto.nombre} agregado al carrito`, 'exito');
    this.renderSidebar();
    this.animarBadge(); // Animación de rebote del badge
  },

  /**
   * eliminar: Remueve un producto del carrito según su ID.
   * @param {string} id - ID del producto.
   */
  eliminar(id) {
    // Filtramos el array conservando únicamente los elementos que no coinciden con el ID
    this.items = this.items.filter((item) => item.id !== id);
    this.guardar();
    this.renderSidebar();
    
    // Si estamos en la página completa del carrito, la volvemos a renderizar
    if (document.getElementById('carritoPageItems')) {
      this.renderPagina();
    }
  },

  /**
   * vaciar: Elimina todos los items del carrito.
   */
  vaciar() {
    this.items = [];
    this.guardar();
    this.renderSidebar();
    
    if (document.getElementById('carritoPageItems')) {
      this.renderPagina();
    }
  },

  /**
   * total: Calcula la sumatoria del precio total de los items en el carrito.
   * @returns {number}
   */
  total() {
    let sumaTotal = 0;
    this.items.forEach((item) => {
      sumaTotal += (item.precio || item.price || 0) * (item.cantidad || 1);
    });
    return sumaTotal;
  },

  /**
   * cantidad: Retorna el total de unidades físicas de productos en el carrito.
   * @returns {number}
   */
  cantidad() {
    let totalUnidades = 0;
    this.items.forEach((item) => {
      totalUnidades += item.cantidad || 1;
    });
    return totalUnidades;
  },

  /**
   * actualizarBadge: Actualiza el globo numérico indicador (badge) del botón del carrito en el header.
   */
  actualizarBadge() {
    const badge = document.getElementById('carritoBadge');
    if (!badge) return;
    
    const c = this.cantidad();
    badge.textContent = c;
    badge.style.display = c > 0 ? 'flex' : 'none'; // Se oculta si no hay unidades
  },

  /**
   * animarBadge: Agrega animación de rebote al badge del carrito.
   */
  animarBadge() {
    const badge = document.getElementById('carritoBadge');
    if (!badge) return;
    badge.classList.remove('bounce');
    /* Forzamos reflow para reiniciar la animación */
    void badge.offsetWidth;
    badge.classList.add('bounce');
  },

  /**
   * renderSidebar: Genera dinámicamente las filas de productos en el menú lateral del carrito.
   */
  renderSidebar() {
    const contenedor = document.getElementById('carritoSidebarItems');
    const totalEl = document.getElementById('carritoSidebarTotal');
    if (!contenedor) return;

    // Si el carrito está vacío, mostramos un mensaje por defecto y reseteamos total
    if (this.items.length === 0) {
      contenedor.innerHTML = '<div class="carrito-vacio-msg"><div class="cv-icono">🛒</div><p>Carrito vacío</p></div>';
      if (totalEl) totalEl.textContent = 'S/ 0.00';
      return;
    }

    let html = '';
    this.items.forEach((item) => {
      html += `
        <div class="carrito-sidebar-item">
          <span class="cs-emoji">${item.emoji}</span>
          <div class="cs-info">
            <h4>${item.nombre}</h4>
            <p>${item.marca || ''} x${item.cantidad || 1}</p>
          </div>
          <span class="cs-precio">${RiveraSound.utils.formatearPrecio(item.precio * (item.cantidad || 1))}</span>
          <button class="cs-eliminar" data-id="${item.id}" aria-label="Eliminar">&times;</button>
        </div>
      `;
    });
    
    contenedor.innerHTML = html;
    if (totalEl) {
      totalEl.textContent = RiveraSound.utils.formatearPrecio(this.total());
    }

    // Bindeamos el click en el botón eliminar de cada item del sidebar
    contenedor.querySelectorAll('.cs-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.eliminar(btn.getAttribute('data-id'));
      });
    });
  },

  abrirSidebar() {
    const sb = document.getElementById('carritoSidebar');
    const overlay = document.getElementById('carritoOverlay');
    if (sb) sb.classList.add('abierto');
    if (overlay) overlay.classList.add('activo');
    this.renderSidebar();
  },

  cerrarSidebar() {
    const sb = document.getElementById('carritoSidebar');
    const overlay = document.getElementById('carritoOverlay');
    if (sb) sb.classList.remove('abierto');
    if (overlay) overlay.classList.remove('activo');
  },

  /* Pedidos (historial local) */
  
  /**
   * crearPedido: Crea un pedido formal con ID único a partir del carrito y limpia éste tras el éxito.
   * @param {object} detallesPago - Detalles del pago (metodo, cuotas, totalFinal, cuotaMonto).
   * @returns {Promise<object|boolean>} - El pedido creado, o false si no se pudo crear.
   */
  async crearPedido(detallesPago) {
    const usuarioStr = localStorage.getItem('riverasound_usuario');
    if (!usuarioStr) {
      RiveraSound.utils.notificar('Inicia sesión para poder realizar la compra', 'info');
      return false;
    }

    const usuario = JSON.parse(usuarioStr);
    
    // Validación de datos de envío (Dirección, Teléfono y Ciudad obligatorios para comprar)
    if (!usuario.telefono || !usuario.direccion || !usuario.ciudad) {
      RiveraSound.utils.notificar('Por favor, registra tu dirección y teléfono de envío en tu perfil para continuar.', 'error');
      
      // Redirigir al perfil de usuario tras 1.5 segundos
      setTimeout(() => {
        window.location.hash = 'cuenta-perfil';
      }, 1500);
      
      return false;
    }
    
    // Estructura del pedido clásico
    const pedido = {
      // Generamos un identificador legible y único basado en timestamp
      id: 'PED-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      fecha: new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: this.items.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        precio: item.precio,
        cantidad: item.cantidad || 1,
        emoji: item.emoji
      })),
      subtotal: this.total(),
      total: detallesPago.totalFinal,
      estado: 'Pendiente',
      metodoPago: detallesPago.metodo,
      cuotas: detallesPago.cuotas || 1,
      cuotaMonto: detallesPago.cuotaMonto || 0,
      usuario: usuario.correo // Vincula el pedido al correo en sesión normalizada
    };

    // CON BACKEND: el pedido se registra en PostgreSQL con fn_crear_pedido
    // (una transacción que valida stock y usa los precios de la base de datos).
    // Si la base lo rechaza (ej. instrumento agotado), no se vacía el carrito.
    if (RiveraSound.api.disponible) {
      try {
        const guardado = await RiveraSound.api.pedir('POST', '/pedidos', {
          id: pedido.id,
          correo: pedido.usuario,
          items: pedido.items.map((i) => ({ id: i.id, cantidad: i.cantidad })),
          metodoPago: pedido.metodoPago,
          cuotas: pedido.cuotas,
          total: pedido.total,
          cuotaMonto: pedido.cuotaMonto
        });
        Object.assign(pedido, guardado); // subtotal y fecha oficiales de la BD
      } catch (e) {
        RiveraSound.utils.notificar(e.message, 'error');
        return false;
      }
    }
    
    const pedidos = this.obtenerPedidos();
    pedidos.unshift(pedido); // Lo agregamos al inicio de la lista
    localStorage.setItem(this.pedidosKey, JSON.stringify(pedidos));
    return pedido;
  },

  /**
   * obtenerPedidos: Recupera la lista de compras del historial de localStorage.
   * @returns {Array}
   */
  obtenerPedidos() {
    try {
      const pedidosGuardados = localStorage.getItem(this.pedidosKey);
      return pedidosGuardados ? JSON.parse(pedidosGuardados) : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * actualizarEstadoPedido: Modifica el estado de un pedido en el historial.
   * @param {string} pedidoId - ID del pedido.
   * @param {string} nuevoEstado - El nuevo estado (ej: 'Entregado', 'Cancelado').
   */
  actualizarEstadoPedido(pedidoId, nuevoEstado) {
    // CON BACKEND: CALL sp_cambiar_estado_pedido en PostgreSQL
    RiveraSound.api.enviarSinEsperar('PATCH', `/pedidos/${encodeURIComponent(pedidoId)}/estado`, { estado: nuevoEstado });

    const pedidos = this.obtenerPedidos();
    pedidos.forEach((p) => {
      if (p.id === pedidoId) {
        p.estado = nuevoEstado;
      }
    });
    localStorage.setItem(this.pedidosKey, JSON.stringify(pedidos));
  },

  /* Página completa del carrito (#carrito) */
  
  /**
   * renderPagina: Genera y dibuja los elementos del carrito en la vista principal.
   */
  renderPagina() {
    const contenedor = document.getElementById('carritoPageItems');
    if (!contenedor) return;

    if (this.items.length === 0) {
      contenedor.innerHTML = `
        <div class="carrito-vacio">
          <div style="font-size:4rem;opacity:0.3;margin-bottom:16px;">🛒</div>
          <h2>Tu carrito de compras está vacío</h2>
          <p style="color:var(--color-gris);margin-bottom:20px;">Explora el catálogo y añade tus instrumentos favoritos.</p>
          <a href="#instrumentos" class="btn btn-primario">Explorar catálogo</a>
        </div>
      `;
      return;
    }

    let html = '';
    this.items.forEach((item) => {
      html += `
        <div class="carrito-item">
          <span class="item-emoji">${item.emoji}</span>
          <div class="item-info">
            <h4>${item.nombre}</h4>
            <p>${item.marca || ''}</p>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="btn btn-secundario" style="padding:4px 10px;font-size:0.8rem;" data-action="restar" data-id="${item.id}">-</button>
            <span class="item-cantidad">${item.cantidad || 1}</span>
            <button class="btn btn-secundario" style="padding:4px 10px;font-size:0.8rem;" data-action="sumar" data-id="${item.id}">+</button>
          </div>
          <span class="item-precio">${RiveraSound.utils.formatearPrecio(item.precio * (item.cantidad || 1))}</span>
          <button class="btn-eliminar" data-id="${item.id}" aria-label="Eliminar">&times;</button>
        </div>
      `;
    });

    html += `
      <div class="carrito-total">Total: <span>${RiveraSound.utils.formatearPrecio(this.total())}</span></div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:20px;justify-content:flex-end;">
        <button class="btn btn-secundario" id="vaciarCarrito">Vaciar carrito</button>
        <button class="btn btn-primario" id="checkoutCarrito">Realizar Compra</button>
      </div>
    `;

    contenedor.innerHTML = html;

    // Asignamos controladores de evento click para botones de eliminar
    contenedor.querySelectorAll('.btn-eliminar').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.eliminar(btn.getAttribute('data-id'));
      });
    });

    // Controlador para botón incrementar cantidad (+)
    contenedor.querySelectorAll('button[data-action="sumar"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = this.items.find((i) => i.id === id);
        if (item) {
          item.cantidad = (item.cantidad || 1) + 1;
          this.guardar();
          this.renderPagina();
          RiveraSound.carrito.renderSidebar();
        }
      });
    });

    // Controlador para botón decrementar cantidad (-)
    contenedor.querySelectorAll('button[data-action="restar"]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const item = this.items.find((i) => i.id === id);
        if (item && (item.cantidad || 1) > 1) {
          item.cantidad = (item.cantidad || 1) - 1;
          this.guardar();
          this.renderPagina();
          RiveraSound.carrito.renderSidebar();
        }
      });
    });

    // Vaciar Carrito
    const vaciarBtn = document.getElementById('vaciarCarrito');
    if (vaciarBtn) {
      vaciarBtn.addEventListener('click', () => {
        this.vaciar();
      });
    }

    // Checkout / Realizar compra
    const checkoutBtn = document.getElementById('checkoutCarrito');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const usuarioStr = localStorage.getItem('riverasound_usuario');
        if (!usuarioStr) {
          RiveraSound.utils.notificar('Inicia sesión para poder realizar la compra', 'info');
          window.location.hash = 'cuenta-login';
          return;
        }

        const usuario = JSON.parse(usuarioStr);
        if (!usuario.telefono || !usuario.direccion || !usuario.ciudad) {
          RiveraSound.utils.notificar('Por favor, registra tu dirección y teléfono de envío en tu perfil para continuar.', 'error');
          setTimeout(() => { window.location.hash = 'cuenta-perfil'; }, 1500);
          return;
        }

        const subtotal = this.total();

        const paymentHtml = `
          <div style="text-align:left;">
            <p style="color:var(--color-gris);margin-bottom:16px;font-size:0.9rem;">Selecciona tu método de pago y cuotas para el pedido:</p>
            <form id="formCheckoutPago" onsubmit="return false;">
              <div class="form-grupo" style="margin-bottom:14px;">
                <label for="checkoutMetodo" style="font-weight:bold;display:block;margin-bottom:6px;font-size:0.85rem;">Método de Pago</label>
                <select id="checkoutMetodo" style="width:100%;padding:8px;border-radius:4px;border:1px solid rgba(255,255,255,0.15);background:var(--color-principal);color:var(--color-texto);font-size:0.9rem;">
                  <option value="efectivo">Efectivo / Transferencia Bancaria (Sin recargo)</option>
                  <option value="visa">Tarjeta de Crédito Visa (10% int. anual)</option>
                  <option value="mastercard">Tarjeta de Crédito Mastercard (12% int. anual)</option>
                </select>
              </div>

              <!-- Opciones de cuotas (oculto por defecto para efectivo) -->
              <div id="checkoutCuotasGrupo" class="form-grupo" style="display:none;margin-bottom:14px;">
                <label for="checkoutCuotas" style="font-weight:bold;display:block;margin-bottom:6px;font-size:0.85rem;">Cantidad de Cuotas</label>
                <select id="checkoutCuotas" style="width:100%;padding:8px;border-radius:4px;border:1px solid rgba(255,255,255,0.15);background:var(--color-principal);color:var(--color-texto);font-size:0.9rem;">
                  <option value="1">1 cuota (sin interés)</option>
                  <option value="3">3 cuotas</option>
                  <option value="6">6 cuotas</option>
                  <option value="12">12 cuotas</option>
                </select>
              </div>

              <!-- Resumen dinámico de financiamiento -->
              <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:12px;margin-bottom:16px;font-size:0.85rem;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="color:var(--color-gris);">Subtotal Carrito:</span>
                  <span style="font-weight:bold;">${RiveraSound.utils.formatearPrecio(subtotal)}</span>
                </div>
                <div id="checkoutInteresFila" style="display:none;justify-content:space-between;margin-bottom:6px;color:var(--color-error);">
                  <span>Interés Aplicado:</span>
                  <span id="checkoutInteresValor">S/ 0.00</span>
                </div>
                <div id="checkoutCuotaFila" style="display:none;justify-content:space-between;margin-bottom:6px;color:var(--color-texto);">
                  <span>Valor de Cuota:</span>
                  <span id="checkoutCuotaValor" style="font-weight:bold;">S/ 0.00</span>
                </div>
                <div style="display:flex;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.1);padding-top:6px;font-weight:bold;font-size:1.1rem;color:var(--color-acento);">
                  <span>Total Final:</span>
                  <span id="checkoutTotalValor">${RiveraSound.utils.formatearPrecio(subtotal)}</span>
                </div>
              </div>

              <button type="submit" class="btn btn-primario" style="width:100%;padding:10px;font-size:0.95rem;">Confirmar Pago y Compra</button>
            </form>
          </div>
        `;

        RiveraSound.modal.abrir(paymentHtml, 'Método de Pago');

        // Lógica interactiva dentro del modal
        const metodoSelect = document.getElementById('checkoutMetodo');
        const cuotasGrupo = document.getElementById('checkoutCuotasGrupo');
        const cuotasSelect = document.getElementById('checkoutCuotas');
        const interesFila = document.getElementById('checkoutInteresFila');
        const interesValor = document.getElementById('checkoutInteresValor');
        const cuotaFila = document.getElementById('checkoutCuotaFila');
        const cuotaValor = document.getElementById('checkoutCuotaValor');
        const totalValor = document.getElementById('checkoutTotalValor');
        const formPago = document.getElementById('formCheckoutPago');

        const recalcularPago = () => {
          const metodo = metodoSelect.value;
          let totalFinal = subtotal;
          let interes = 0;
          let cuotas = 1;
          let cuotaMonto = subtotal;

          if (metodo === 'efectivo') {
            cuotasGrupo.style.display = 'none';
            interesFila.style.display = 'none';
            cuotaFila.style.display = 'none';
          } else {
            cuotasGrupo.style.display = 'block';
            cuotas = parseInt(cuotasSelect.value, 10);
            
            const interesAnual = metodo === 'visa' ? 0.10 : 0.12;
            if (cuotas > 1) {
              const tasaMensual = interesAnual / 12;
              const factorInteres = 1 + (tasaMensual * cuotas);
              totalFinal = subtotal * factorInteres;
              interes = totalFinal - subtotal;
            }

            cuotaMonto = totalFinal / cuotas;

            interesFila.style.display = 'flex';
            interesValor.textContent = `+ ${RiveraSound.utils.formatearPrecio(interes)}`;
            cuotaFila.style.display = 'flex';
            cuotaValor.textContent = `${cuotas}x ${RiveraSound.utils.formatearPrecio(cuotaMonto)}`;
          }

          totalValor.textContent = RiveraSound.utils.formatearPrecio(totalFinal);

          return {
            metodo: metodo === 'efectivo' ? 'Efectivo / Transferencia' : `Tarjeta de Crédito (${metodo === 'visa' ? 'Visa' : 'Mastercard'})`,
            cuotas,
            cuotaMonto,
            totalFinal
          };
        };

        if (metodoSelect && cuotasSelect) {
          metodoSelect.addEventListener('change', recalcularPago);
          cuotasSelect.addEventListener('change', recalcularPago);
        }

        if (formPago) {
          formPago.addEventListener('submit', async (e) => {
            e.preventDefault();
            const result = recalcularPago();

            // Evita doble clic mientras se espera la respuesta de la base de datos
            const btnConfirmar = formPago.querySelector('button[type="submit"]');
            if (btnConfirmar) {
              if (btnConfirmar.disabled) return;
              btnConfirmar.disabled = true;
            }
            const pedido = await this.crearPedido(result);
            if (btnConfirmar) btnConfirmar.disabled = false;
            if (pedido) {
              RiveraSound.modal.abrir(`
                <div style="text-align:center;">
                  <div style="font-size:4rem;margin-bottom:16px;">✅</div>
                  <h3 style="color:var(--color-exito);margin-bottom:12px;">¡Pedido confirmado!</h3>
                  <p style="color:var(--color-gris);margin-bottom:8px;">Código de pedido: <strong>${pedido.id}</strong></p>
                  <p style="color:var(--color-gris);margin-bottom:6px;">Método de pago: <strong>${pedido.metodoPago}</strong></p>
                  ${pedido.cuotas > 1 ? `<p style="color:var(--color-gris);margin-bottom:6px;">Financiado: <strong>${pedido.cuotas} cuotas de S/ ${pedido.cuotaMonto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>` : ''}
                  <p style="color:var(--color-gris);margin-bottom:20px;">Monto total: ${RiveraSound.utils.formatearPrecio(pedido.total)}</p>
                  <p style="color:var(--color-gris);margin-bottom:20px;">Estado actual: <strong>${pedido.estado}</strong></p>
                  <button class="btn btn-primario" onclick="RiveraSound.modal.cerrar()">Cerrar</button>
                </div>
              `, 'Compra exitosa');
              this.vaciar();
            }
          });
        }
      });
    }
  }
};
