var RiveraSound = RiveraSound || {};

RiveraSound.carrito = {
  key: 'riverasound_carrito',
  items: [],
  modo: 'local',

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
    if (RiveraSound.api.getToken()) {
      this.sincronizarDesdeAPI();
    }
  },

  sincronizarDesdeAPI: function () {
    var self = this;
    RiveraSound.api.carritoListar().then(function (items) {
      if (items && items.length > 0) {
        self.items = items.map(function (i) {
          return {
            id: i.producto_id,
            carritoId: i.id,
            nombre: i.nombre,
            marca: i.marca,
            precio: parseFloat(i.precio),
            emoji: i.emoji,
            cantidad: i.cantidad,
            stock: i.stock
          };
        });
        self.modo = 'api';
        self.guardar();
      }
    });
  },

  guardar: function () {
    localStorage.setItem(this.key, JSON.stringify(this.items));
    this.actualizarBadge();
  },

  obtener: function () {
    return this.items.slice();
  },

  agregar: function (producto) {
    var self = this;
    var existente = null;
    this.items.forEach(function (item) {
      if (item.id === producto.id) existente = item;
    });

    if (self.modo === 'api' && RiveraSound.api.getToken()) {
      RiveraSound.api.carritoAgregar(producto.id, 1).then(function (resp) {
        if (resp && resp.exito) {
          self.sincronizarDesdeAPI();
        } else {
          self.agregarLocal(producto, existente);
        }
      });
    } else {
      this.agregarLocal(producto, existente);
    }

    RiveraSound.utils.notificar(producto.nombre + ' agregado al carrito', 'exito');
    this.renderSidebar();
  },

  agregarLocal: function (producto, existente) {
    if (existente) {
      existente.cantidad = (existente.cantidad || 1) + 1;
    } else {
      producto.cantidad = 1;
      this.items.push(producto);
    }
    this.guardar();
  },

  eliminar: function (id) {
    var self = this;
    var item = this.items.filter(function (i) { return i.id === id; })[0];

    if (self.modo === 'api' && item && item.carritoId && RiveraSound.api.getToken()) {
      RiveraSound.api.carritoEliminar(item.carritoId).then(function () {
        self.items = self.items.filter(function (i) { return i.id !== id; });
        self.guardar();
        self.renderSidebar();
        if (document.getElementById('carritoPageItems')) self.renderPagina();
      });
    } else {
      this.items = this.items.filter(function (i) { return i.id !== id; });
      this.guardar();
      this.renderSidebar();
      if (document.getElementById('carritoPageItems')) this.renderPagina();
    }
  },

  vaciar: function () {
    var self = this;
    if (self.modo === 'api' && RiveraSound.api.getToken()) {
      RiveraSound.api.carritoVaciar().then(function () {
        self.items = [];
        self.guardar();
        self.renderSidebar();
        if (document.getElementById('carritoPageItems')) self.renderPagina();
      });
    } else {
      this.items = [];
      this.guardar();
      this.renderSidebar();
      if (document.getElementById('carritoPageItems')) this.renderPagina();
    }
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
      <button class="btn btn-primario" id="checkoutCarrito">Proceder al pago</button>\
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
        if (RiveraSound.api.getToken()) {
          var pedidoData = {
            items: self.items.map(function (i) {
              return { producto_id: i.id, cantidad: i.cantidad || 1 };
            })
          };
          RiveraSound.api.crearPedido(pedidoData).then(function (resp) {
            if (resp && resp.exito) {
              RiveraSound.modal.abrir(
                '<div style="text-align:center;">' +
                '<div style="font-size:4rem;margin-bottom:16px;">&#9989;</div>' +
                '<h3 style="color:var(--color-exito);margin-bottom:12px;">&#161;Pedido confirmado!</h3>' +
                '<p style="color:var(--color-gris);margin-bottom:20px;">Tu pedido #' + (resp.pedido_id || '---') + ' ha sido registrado. Te contactaremos pronto.</p>' +
                '<button class="btn btn-primario" onclick="RiveraSound.modal.cerrar()">Cerrar</button>' +
                '</div>',
                'Compra exitosa'
              );
              self.vaciar();
            } else {
              RiveraSound.utils.notificar('Error al crear pedido. Inicia sesión.', 'error');
            }
          });
        } else {
          RiveraSound.utils.notificar('Inicia sesión para comprar', 'info');
        }
      });
    }
  }
};
