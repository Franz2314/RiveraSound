var RiveraSound = RiveraSound || {};

RiveraSound.carrito = {
  key: 'riverasound_carrito',
  pedidosKey: 'riverasound_pedidos',
  items: [],

  init: function () {
    this.cargar();
    this.actualizarBadge();
  },

  cargar: function () {
    try {
      this.items = JSON.parse(localStorage.getItem(this.key)) || [];
    } catch (e) {
      this.items = [];
    }
  },

  guardar: function () {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.actualizarBadge();
  },

  obtener: function () {
    return this.items.slice();
  },

  agregar: function (producto) {
    var existente = null;
    this.items.forEach(function (item) {
      if (item.id === producto.id) existente = item;
    });
    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
      producto.cantidad = 1;
      this.items.push(producto);
    }
    this.guardar();
    RiveraSound.utils.notificar(producto.nombre + ' agregado al carrito', 'exito');
    this.renderSidebar();
  },

  eliminar: function (id) {
    this.items = this.items.filter(function (i) { return i.id !== id; });
    this.guardar();
    this.renderSidebar();
    if (document.getElementById('carritoPageItems')) this.renderPagina();
  },

  vaciar: function () {
    this.items = [];
    this.guardar();
    this.renderSidebar();
    if (document.getElementById('carritoPageItems')) this.renderPagina();
  },

  total: function () {
    var t = 0;
    this.items.forEach(function (i) { t += i.precio * (i.cantidad || 1); });
    return t;
  },

  cantidad: function () {
    var c = 0;
    this.items.forEach(function (i) { c += i.cantidad || 1; });
    return c;
  },

  actualizarBadge: function () {
    var badge = document.getElementById('carritoBadge');
    if (!badge) return;
    var c = this.cantidad();
    badge.textContent = c;
    badge.style.display = c > 0 ? 'flex' : 'none';
  },

  renderSidebar: function () {
    var contenedor = document.getElementById('carritoSidebarItems');
    var totalEl = document.getElementById('carritoSidebarTotal');
    if (!contenedor) return;

    if (this.items.length === 0) {
      contenedor.innerHTML = '<div class="carrito-vacio-msg"><div class="cv-icono">🛒</div><p>Carrito vacío</p></div>';
      if (totalEl) totalEl.textContent = 'S/ 0';
      return;
    }

    var html = '';
    var self = this;
    this.items.forEach(function (item) {
      html += '<div class="carrito-sidebar-item">\
        <span class="cs-emoji">' + item.emoji + '</span>\
        <div class="cs-info">\
          <h4>' + item.nombre + '</h4>\
          <p>' + (item.marca || '') + ' x' + (item.cantidad || 1) + '</p>\
        </div>\
        <span class="cs-precio">' + RiveraSound.utils.formatearPrecio(item.precio * (item.cantidad || 1)) + '</span>\
        <button class="cs-eliminar" data-id="' + item.id + '" aria-label="Eliminar">&times;</button>\
      </div>';
    });
    contenedor.innerHTML = html;
    if (totalEl) totalEl.textContent = RiveraSound.utils.formatearPrecio(this.total());

    contenedor.querySelectorAll('.cs-eliminar').forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.eliminar(this.getAttribute('data-id'));
      });
    });
  },

  abrirSidebar: function () {
    var sb = document.getElementById('carritoSidebar');
    var overlay = document.getElementById('carritoOverlay');
    if (sb) sb.classList.add('abierto');
    if (overlay) overlay.classList.add('activo');
    this.renderSidebar();
  },

  cerrarSidebar: function () {
    var sb = document.getElementById('carritoSidebar');
    var overlay = document.getElementById('carritoOverlay');
    if (sb) sb.classList.remove('abierto');
    if (overlay) overlay.classList.remove('activo');
  },

  /* ============ PEDIDOS (HISTORIAL LOCAL) ============ */

  obtenerPedidos: function () {
    try {
      return JSON.parse(localStorage.getItem(this.pedidosKey)) || [];
    } catch (e) {
      return [];
    }
  },

  crearPedido: function () {
    var usuario = localStorage.getItem('riverasound_usuario');
    if (!usuario) {
      RiveraSound.utils.notificar('Inicia sesión para comprar', 'info');
      return false;
    }
    var pedido = {
      id: 'PED-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
      fecha: new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      items: this.items.map(function (i) { return { id: i.id, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad || 1, emoji: i.emoji }; }),
      total: this.total(),
      estado: 'Pendiente',
      usuario: JSON.parse(usuario).correo
    };
    var pedidos = this.obtenerPedidos();
    pedidos.unshift(pedido);
    localStorage.setItem(this.pedidosKey, JSON.stringify(pedidos));
    return pedido;
  },

  actualizarEstadoPedido: function (pedidoId, nuevoEstado) {
    var pedidos = this.obtenerPedidos();
    pedidos.forEach(function (p) {
      if (p.id === pedidoId) p.estado = nuevoEstado;
    });
    localStorage.setItem(this.pedidosKey, JSON.stringify(pedidos));
  },

  /* ============ PÁGINA CARRITO ============ */

  renderPagina: function () {
    var contenedor = document.getElementById('carritoPageItems');
    if (!contenedor) return;

    if (this.items.length === 0) {
      contenedor.innerHTML = '\
        <div class="carrito-vacio">\
          <div style="font-size:4rem;opacity:0.3;margin-bottom:16px;">🛒</div>\
          <h2>Tu carrito está vacío</h2>\
          <p style="color:var(--color-gris);margin-bottom:20px;">Agrega instrumentos para empezar.</p>\
          <a href="#instrumentos" class="btn btn-primario">Explorar catálogo</a>\
        </div>';
      return;
    }

    var html = '', self = this;
    this.items.forEach(function (item) {
      html += '<div class="carrito-item">\
        <span class="item-emoji">' + item.emoji + '</span>\
        <div class="item-info">\
          <h4>' + item.nombre + '</h4>\
          <p>' + (item.marca || '') + '</p>\
        </div>\
        <div style="display:flex;align-items:center;gap:8px;">\
          <button class="btn btn-secundario" style="padding:4px 10px;font-size:0.8rem;" data-action="restar" data-id="' + item.id + '">-</button>\
          <span class="item-cantidad">' + (item.cantidad || 1) + '</span>\
          <button class="btn btn-secundario" style="padding:4px 10px;font-size:0.8rem;" data-action="sumar" data-id="' + item.id + '">+</button>\
        </div>\
        <span class="item-precio">' + RiveraSound.utils.formatearPrecio(item.precio * (item.cantidad || 1)) + '</span>\
        <button class="btn-eliminar" data-id="' + item.id + '" aria-label="Eliminar">&times;</button>\
      </div>';
    });

    html += '<div class="carrito-total">Total: <span>' + RiveraSound.utils.formatearPrecio(this.total()) + '</span></div>';

    html += '<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:20px;justify-content:flex-end;">\
      <button class="btn btn-secundario" id="vaciarCarrito">Vaciar carrito</button>\
      <button class="btn btn-primario" id="checkoutCarrito">Realizar Compra</button>\
    </div>';

    contenedor.innerHTML = html;

    contenedor.querySelectorAll('.btn-eliminar').forEach(function (btn) {
      btn.addEventListener('click', function () { self.eliminar(this.getAttribute('data-id')); });
    });

    contenedor.querySelectorAll('[data-action="sumar"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        self.items.forEach(function (item) {
          if (item.id === id) item.cantidad = (item.cantidad || 1) + 1;
        });
        self.guardar();
        self.renderPagina();
        self.renderSidebar();
      });
    });

    contenedor.querySelectorAll('[data-action="restar"]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        var found = false;
        self.items.forEach(function (item) {
          if (item.id === id) {
            if (item.cantidad > 1) { item.cantidad--; found = true; }
            else { self.eliminar(id); found = true; }
          }
        });
        if (found) {
          self.guardar();
          self.renderPagina();
          self.renderSidebar();
        }
      });
    });

    var vaciarBtn = document.getElementById('vaciarCarrito');
    if (vaciarBtn) vaciarBtn.addEventListener('click', function () { self.vaciar(); });

    var checkoutBtn = document.getElementById('checkoutCarrito');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function () {
        var pedido = self.crearPedido();
        if (pedido) {
          RiveraSound.modal.abrir(
            '<div style="text-align:center;">' +
            '<div style="font-size:4rem;margin-bottom:16px;">&#9989;</div>' +
            '<h3 style="color:var(--color-exito);margin-bottom:12px;">&#161;Pedido confirmado!</h3>' +
            '<p style="color:var(--color-gris);margin-bottom:8px;">Tu pedido <strong>#' + pedido.id + '</strong></p>' +
            '<p style="color:var(--color-gris);margin-bottom:20px;">Total: ' + RiveraSound.utils.formatearPrecio(pedido.total) + '</p>' +
            '<p style="color:var(--color-gris);margin-bottom:20px;">Estado: <strong>' + pedido.estado + '</strong></p>' +
            '<button class="btn btn-primario" onclick="RiveraSound.modal.cerrar()">Cerrar</button>' +
            '</div>',
            'Compra exitosa'
          );
          self.vaciar();
        }
      });
    }
  }
};
