var RiveraSound = RiveraSound || {};

RiveraSound.router = {

  routeMap: {
    '': 'inicio', '#': 'inicio', '#inicio': 'inicio',
    '#instrumentos': 'instrumentos',
    '#catalogo': 'catalogo',
    '#ofertas': 'ofertas',
    '#nosotros': 'nosotros',
    '#contacto': 'contacto',
    '#blog': 'blog',
    '#carrito': 'carrito',
    '#cuenta': 'cuenta',
    '#cuenta-login': 'cuenta-login',
    '#cuenta-registro': 'cuenta-registro',
    '#cuenta-perfil': 'cuenta-perfil',
    '#cuenta-pedidos': 'cuenta-pedidos'
  },

  pageFiles: {
    'inicio': '',
    'instrumentos': 'PaginasHTML/Catalogo/catalogo.html',
    'catalogo': 'PaginasHTML/Catalogo/catalogo.html',
    'ofertas': 'PaginasHTML/Ofertas/ofertas.html',
    'nosotros': 'PaginasHTML/Nosotros/nosotros.html',
    'contacto': 'PaginasHTML/Contacto/contacto.html',
    'blog': 'PaginasHTML/Blog/blog.html',
    'carrito': 'PaginasHTML/Compras/carrito.html',
    'cuenta': 'PaginasHTML/Cuenta/cuenta.html',
    'cuenta-login': 'PaginasHTML/Cuenta/cuenta.html',
    'cuenta-registro': 'PaginasHTML/Cuenta/cuenta.html',
    'cuenta-perfil': 'PaginasHTML/Cuenta/cuenta.html',
    'cuenta-pedidos': 'PaginasHTML/Cuenta/cuenta.html'
  },

  currentRoute: null,

  init: function () {
    this.bindEvents();
    this.resolve();
  },

  bindEvents: function () {
    var self = this;
    window.addEventListener('hashchange', function () { self.resolve(); });
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      e.preventDefault();
      var filtro = link.getAttribute('data-filtro');
      if (filtro) {
        self._filtroActivo = filtro;
      }
      window.location.hash = link.getAttribute('href').slice(1);
    });
  },

  resolve: function () {
    var hash = window.location.hash || '#';
    var route = this.routeMap[hash] || '404';
    if (route === this.currentRoute && route !== 'carrito') return;
    this.currentRoute = route;
    document.body.setAttribute('data-page', route.replace(/^cuenta-.*$/, 'cuenta'));
    this.loadRoute(route, hash);
  },

  loadRoute: function (route, hash) {
    var app = document.getElementById('app');
    if (!app) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.updateNav(route);

    if (route === 'inicio') {
      app.innerHTML = this.renderInicio();
      this.afterRender(route);
      return;
    }

    if (route === '404') {
      app.innerHTML = this.render404();
      this.afterRender(route);
      return;
    }

    var file = this.pageFiles[route];
    if (!file) {
      app.innerHTML = this.render404();
      this.afterRender(route);
      return;
    }

    var self = this;
    app.innerHTML = '<div class="carga-spinner"></div>';

    fetch(file)
      .then(function (r) {
        if (!r.ok) throw new Error('Not found');
        return r.text();
      })
      .then(function (html) {
        app.innerHTML = html;
        self.postProcess(route, hash);
        self.afterRender(route);
      })
      .catch(function () {
        app.innerHTML = self.render404();
        self.afterRender(route);
      });
  },

  postProcess: function (route, hash) {
    if (route === 'cuenta' || route === 'cuenta-login' || route === 'cuenta-registro' ||
        route === 'cuenta-perfil' || route === 'cuenta-pedidos') {
      this.initCuentaTabs(hash);
    }
  },

  afterRender: function (route) {
    try { RiveraSound.reveal.iniciar(); } catch (_) {}
    try { RiveraSound.contadores.iniciar(); } catch (_) {}
    try { RiveraSound.catalogo.iniciar(); } catch (_) {}
    try { RiveraSound.carrito.renderSidebar(); } catch (_) {}

    if (route === 'instrumentos' || route === 'catalogo') {
      if (this._filtroActivo) {
        RiveraSound.catalogo.renderCatalogo(this._filtroActivo, '');
        this._filtroActivo = null;
      }
    }

    if (route === 'carrito') {
      RiveraSound.carrito.renderPagina();
    }

    if (route === 'contacto') {
      RiveraSound.validaciones.initFormulario('formularioContacto');
      var formContacto = document.getElementById('formularioContacto');
      if (formContacto && !formContacto.hasAttribute('data-handler')) {
        formContacto.setAttribute('data-handler', '1');
        formContacto.addEventListener('submit', function (e) {
          e.preventDefault();
          document.getElementById('mensajeExito').style.display = 'block';
          formContacto.reset();
          RiveraSound.utils.notificar('Mensaje enviado con éxito', 'exito');
        });
      }
      if (!document.getElementById('btnFeedback')) {
        var feedbackBtn = document.createElement('button');
        feedbackBtn.id = 'btnFeedback';
        feedbackBtn.className = 'btn-feedback';
        feedbackBtn.title = 'Dejar feedback';
        feedbackBtn.innerHTML = '&#128172; Feedback';
        feedbackBtn.addEventListener('click', function () {
          var feedbackHtml =
            '<div style="text-align:center;">' +
            '<div style="font-size:3rem;margin-bottom:12px;">&#128172;</div>' +
            '<p style="color:var(--color-gris);margin-bottom:16px;">Ayúdanos a mejorar. Déjanos tu opinión:</p>' +
            '<form id="formFeedback" onsubmit="return false;">' +
            '<div class="form-grupo">' +
            '<label for="feedbackNombre">Nombre</label>' +
            '<input type="text" id="feedbackNombre" placeholder="Tu nombre" required>' +
            '</div>' +
            '<div class="form-grupo">' +
            '<label for="feedbackMensaje">Comentario</label>' +
            '<textarea id="feedbackMensaje" rows="4" placeholder="Escribe tu feedback aquí..." required></textarea>' +
            '</div>' +
            '<button type="submit" class="btn btn-primario" id="btnEnviarFeedback">Enviar feedback</button>' +
            '</form>' +
            '</div>';
          RiveraSound.modal.abrir(feedbackHtml, 'Feedback');
          setTimeout(function () {
            var formFb = document.getElementById('formFeedback');
            if (formFb) {
              formFb.addEventListener('submit', function (ev) {
                ev.preventDefault();
                var fbMsg = document.getElementById('feedbackMensaje');
                if (fbMsg && fbMsg.value.trim().length >= 3) {
                  RiveraSound.utils.notificar('Gracias por tu feedback!', 'exito');
                  RiveraSound.modal.cerrar();
                } else {
                  RiveraSound.utils.notificar('Escribe un comentario de al menos 3 caracteres.', 'error');
                }
              });
            }
          }, 100);
        });
        document.body.appendChild(feedbackBtn);
      }
    }
  },

  updateNav: function (route) {
    var map = {
      inicio: 'inicio', instrumentos: 'instrumentos', catalogo: 'catalogo',
      ofertas: 'ofertas', nosotros: 'nosotros', contacto: 'contacto',
      blog: 'blog', carrito: 'carrito', cuenta: 'cuenta',
      'cuenta-login': 'cuenta', 'cuenta-registro': 'cuenta',
      'cuenta-perfil': 'cuenta', 'cuenta-pedidos': 'cuenta',
      '404': 'inicio'
    };
    var active = map[route] || 'inicio';
    document.querySelectorAll('#menuNav a').forEach(function (a) {
      a.classList.remove('activo');
      if (a.getAttribute('href') === '#' + active) a.classList.add('activo');
    });
  },

  /* ============ CUENTA TABS ============ */

  initCuentaTabs: function (hash) {
    try {
    RiveraSound.validaciones.initFormulario('formLogin');
    RiveraSound.validaciones.initFormulario('formRegistro');
    var tabs = document.querySelectorAll('.cuenta-tab');
    var panels = document.querySelectorAll('.cuenta-panel');

    var activar = function (tabId) {
      tabs.forEach(function (t) { t.classList.remove('activo'); });
      panels.forEach(function (p) { p.classList.remove('activo'); });
      var tab = document.querySelector('.cuenta-tab[data-tab="' + tabId + '"]');
      var panel = document.getElementById('cuentaPanel' + tabId);
      if (tab) tab.classList.add('activo');
      if (panel) panel.classList.add('activo');
    };

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var t = this.getAttribute('data-tab');
        window.location.hash = 'cuenta-' + t;
      });
    });

    var haySesion = !!localStorage.getItem('riverasound_usuario');
    var tabsSesion = document.querySelectorAll('.cuenta-tab-sesion');
    var tabsPublicas = document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)');
    tabsSesion.forEach(function (t) { t.style.display = haySesion ? '' : 'none'; });
    tabsPublicas.forEach(function (t) { t.style.display = haySesion ? 'none' : ''; });

    var tabMap = {
      'cuenta': 'login',
      'cuenta-login': 'login',
      'cuenta-registro': 'registro',
      'cuenta-perfil': 'perfil',
      'cuenta-pedidos': 'pedidos'
    };
    var hashClean = hash.replace(/^#/, '');
    var defaultTab = tabMap[hashClean] || (haySesion ? 'perfil' : 'login');
    activar(defaultTab);

    /* --- FORMULARIO DE LOGIN (local) --- */
    var formLogin = document.getElementById('formLogin');
    if (formLogin) {
      formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        var correo = document.getElementById('loginCorreo').value;
        var password = document.getElementById('loginPassword').value;
        var btn = formLogin.querySelector('button[type="submit"]');
        btn.textContent = 'Ingresando...';
        btn.disabled = true;

        var usuarios = [];
        try { usuarios = JSON.parse(localStorage.getItem('riverasound_usuarios')) || []; } catch (_) {}

        var usuarioValido = null;
        if (correo === 'demo@riverasound.pe' && password === 'demo123') {
          usuarioValido = { nombre: 'Usuario', apellido: 'Demo', correo: 'demo@riverasound.pe' };
        } else {
          usuarios.forEach(function (u) {
            if (u.correo === correo && u.password === password) {
              usuarioValido = { nombre: u.nombre, apellido: u.apellido, correo: u.correo };
            }
          });
        }

        btn.textContent = 'Iniciar sesión';
        btn.disabled = false;

        if (usuarioValido) {
          localStorage.setItem('riverasound_usuario', JSON.stringify(usuarioValido));
          RiveraSound.utils.notificar('Bienvenido ' + usuarioValido.nombre + '!', 'exito');
          document.querySelectorAll('.cuenta-tab-sesion').forEach(function (t) { t.style.display = ''; });
          document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)').forEach(function (t) { t.style.display = 'none'; });
          document.querySelectorAll('.cuenta-panel').forEach(function (p) { p.classList.remove('activo'); });
          var perfilPanel = document.getElementById('cuentaPanelPerfil');
          if (perfilPanel) {
            perfilPanel.classList.add('activo');
            var perfilHeader = perfilPanel.querySelector('h3');
            var perfilEmail = perfilPanel.querySelector('p');
            if (perfilHeader) perfilHeader.textContent = usuarioValido.nombre + ' ' + (usuarioValido.apellido || '');
            if (perfilEmail) perfilEmail.textContent = usuarioValido.correo;
          }
          window.location.hash = 'cuenta-perfil';
        } else {
          RiveraSound.utils.notificar('Credenciales inválidas. Usa demo@riverasound.pe / demo123', 'error');
        }
      });
    }

    /* --- FORMULARIO DE REGISTRO (local) --- */
    var formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
      formRegistro.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = formRegistro.querySelector('button[type="submit"]');
        btn.textContent = 'Registrando...';
        btn.disabled = true;
        var nombre = document.getElementById('regNombre').value;
        var apellido = document.getElementById('regApellido').value;
        var correo = document.getElementById('regCorreo').value;
        var password = document.getElementById('regPassword').value;

        var usuarios = [];
        try { usuarios = JSON.parse(localStorage.getItem('riverasound_usuarios')) || []; } catch (_) {}

        var existe = false;
        usuarios.forEach(function (u) { if (u.correo === correo) existe = true; });

        if (existe) {
          btn.textContent = 'Crear cuenta';
          btn.disabled = false;
          RiveraSound.utils.notificar('El correo ya está registrado. Inicia sesión.', 'error');
          return;
        }

        usuarios.push({ nombre: nombre, apellido: apellido, correo: correo, password: password });
        localStorage.setItem('riverasound_usuarios', JSON.stringify(usuarios));

        btn.textContent = 'Crear cuenta';
        btn.disabled = false;
        RiveraSound.utils.notificar('Registro exitoso. Inicia sesión!', 'exito');
        window.location.hash = 'cuenta-login';
      });
    }

    /* --- CARGAR PERFIL --- */
    var usuarioGuardado = localStorage.getItem('riverasound_usuario');
    var btnCerrar = document.getElementById('btnCerrarSesion');
    if (usuarioGuardado) {
      var userData = JSON.parse(usuarioGuardado);
      var perfilHeader = document.querySelector('#cuentaPanelPerfil h3');
      var perfilEmail = document.querySelector('#cuentaPanelPerfil p');
      if (perfilHeader) perfilHeader.textContent = userData.nombre + ' ' + (userData.apellido || '');
      if (perfilEmail) perfilEmail.textContent = userData.correo;
      if (btnCerrar) btnCerrar.style.display = 'block';
    }
    if (btnCerrar) {
      btnCerrar.addEventListener('click', function () {
        localStorage.removeItem('riverasound_usuario');
        RiveraSound.utils.notificar('Sesión cerrada', 'info');
        document.querySelectorAll('.cuenta-tab-sesion').forEach(function (t) { t.style.display = 'none'; });
        document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)').forEach(function (t) { t.style.display = ''; });
        window.location.hash = 'cuenta-login';
      });
    }

    /* --- PEDIDOS: renderizar historial --- */
    if (hashClean === 'cuenta-pedidos' || hashClean === 'pedidos') {
      this.renderPedidos();
    }
    var hashListener = function () {
      if (window.location.hash === '#cuenta-pedidos') {
        RiveraSound.router.renderPedidos();
      }
    };
    window.removeEventListener('hashchange', hashListener);
    window.addEventListener('hashchange', hashListener);

    } catch (_) {}
  },

  /* ============ HISTORIAL DE PEDIDOS ============ */

  renderPedidos: function () {
    var pedidos = RiveraSound.carrito.obtenerPedidos();
    var usuario = localStorage.getItem('riverasound_usuario');
    if (!usuario) return;
    var correo = JSON.parse(usuario).correo;
    var pedidosUsuario = pedidos.filter(function (p) { return p.usuario === correo; });
    var panel = document.getElementById('cuentaPanelPedidos');
    if (!panel) return;

    if (pedidosUsuario.length === 0) {
      panel.innerHTML = '\
        <div style="text-align:center;padding:40px 0;">\
          <div style="font-size:3rem;opacity:0.3;margin-bottom:12px;">&#128230;</div>\
          <h3 style="color:var(--color-principal);">No tienes pedidos aún</h3>\
          <p style="color:var(--color-gris);">Los pedidos que realices aparecerán aquí.</p>\
          <a href="#instrumentos" class="btn btn-primario" style="margin-top:12px;">Explorar catálogo</a>\
        </div>';
      return;
    }

    var estados = ['Pendiente', 'En envío', 'Entregado', 'Recogido en tienda', 'Cancelado'];
    var html = '<div style="max-width:700px;margin:0 auto;">';
    pedidosUsuario.forEach(function (p) {
      var itemsHtml = '';
      p.items.forEach(function (item) {
        itemsHtml += '<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;font-size:0.85rem;">\
          <span>' + item.emoji + ' ' + item.nombre + ' x' + item.cantidad + '</span>\
          <span>' + RiveraSound.utils.formatearPrecio(item.precio * item.cantidad) + '</span>\
        </div>';
      });
      var opcionesEstado = '';
      estados.forEach(function (est) {
        var sel = est === p.estado ? 'selected' : '';
        opcionesEstado += '<option value="' + est + '" ' + sel + '>' + est + '</option>';
      });
      html += '\
        <div style="background:var(--color-blanco);border-radius:var(--radio);box-shadow:var(--sombra-suave);padding:20px;margin-bottom:16px;">\
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">\
            <div>\
              <strong style="font-size:1rem;">#' + p.id + '</strong>\
              <span style="color:var(--color-gris);font-size:0.8rem;margin-left:10px;">' + p.fecha + '</span>\
            </div>\
            <div style="display:flex;align-items:center;gap:8px;">\
              <select class="estado-pedido-select" data-pedido="' + p.id + '" style="padding:4px 8px;border-radius:4px;border:1px solid #ccc;font-size:0.8rem;">' + opcionesEstado + '</select>\
            </div>\
          </div>\
          ' + itemsHtml + '\
          <div style="text-align:right;margin-top:10px;font-weight:bold;font-size:1.1rem;">Total: ' + RiveraSound.utils.formatearPrecio(p.total) + '</div>\
        </div>';
    });
    html += '</div>';
    panel.innerHTML = html;

    panel.querySelectorAll('.estado-pedido-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var pedidoId = this.getAttribute('data-pedido');
        var nuevoEstado = this.value;
        RiveraSound.carrito.actualizarEstadoPedido(pedidoId, nuevoEstado);
        RiveraSound.utils.notificar('Pedido actualizado a: ' + nuevoEstado, 'exito');
      });
    });
  },

  /* ============ RENDER INLINE ============ */

  renderInicio: function () {
    return '\
<section class="hero">\
  <div class="hero-contenido">\
    <h1>Descubre tu instrumento perfecto</h1>\
    <p>En RiveraSound encontraras los mejores instrumentos musicales importados, con garantia de calidad y la asesoria que necesitas para comenzar tu viaje musical.</p>\
    <div class="hero-botones">\
      <a href="#instrumentos" class="btn btn-primario">Ver Catalogo</a>\
      <a href="#contacto" class="btn btn-secundario">Contactanos</a>\
    </div>\
  </div>\
</section>\
<section style="background-color: #f8f5f0;">\
  <div class="contenedor">\
    <h2 class="titulo-seccion reveal">?Por que elegir RiveraSound?</h2>\
    <span class="linea-dorada reveal"></span>\
    <p class="subtitulo-seccion reveal">Importaciones Rivera lleva mas de 15 anos trayendo musica de calidad al Peru</p>\
    <div class="grid-tarjetas">\
      <div class="tarjeta reveal"><div class="tarjeta-icono">&#127758;</div><h3>Importacion Directa</h3><p>Traemos instrumentos directamente desde Europa, Asia y America del Norte.</p></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">&#10004;&#65039;</div><h3>Garantia Oficial</h3><p>Todos nuestros instrumentos cuentan con garantia del fabricante y soporte tecnico.</p></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">&#127891;</div><h3>Asesoria Gratuita</h3><p>Musicos profesionales te ayudaran a encontrar el instrumento ideal.</p></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">&#128666;</div><h3>Envio a Todo el Peru</h3><p>Envios seguros y asegurados a Lima y todas las regiones del pais.</p></div>\
    </div>\
  </div>\
</section>\
<section>\
  <div class="contenedor">\
    <h2 class="titulo-seccion reveal">Instrumentos Destacados</h2>\
    <span class="linea-dorada reveal"></span>\
    <p class="subtitulo-seccion reveal">Nuestros productos mas populares</p>\
    <div class="grid-tarjetas" id="destacadosGrid"></div>\
    <div class="text-center mt-20 reveal"><a href="#instrumentos" class="btn btn-primario">Ver catalogo completo</a></div>\
  </div>\
</section>\
<div class="banner-cta">\
  <h2>?Buscas un instrumento especifico?</h2>\
  <p>Podemos importarlo por pedido especial. !Consultanos!</p>\
  <a href="#contacto" class="btn btn-secundario">Hacer un pedido especial</a>\
</div>\
<section style="background-color: #f8f5f0;">\
  <div class="contenedor">\
    <h2 class="titulo-seccion reveal">Nuestras Categorias</h2>\
    <span class="linea-dorada reveal"></span>\
    <div class="grid-tarjetas">\
      <div class="tarjeta reveal"><div class="tarjeta-icono">&#127930;</div><h3>Viento</h3><p>Saxofones, trompetas, flautas, clarinetes.</p><br><a href="#instrumentos" class="btn btn-secundario">Ver mas</a></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">&#127927;</div><h3>Teclado</h3><p>Pianos digitales, MIDI, organos, sintetizadores.</p><br><a href="#instrumentos" class="btn btn-secundario">Ver mas</a></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">&#127943;</div><h3>Cuerda</h3><p>Guitarras, violines, cellos, bajos, ukeleles.</p><br><a href="#instrumentos" class="btn btn-secundario">Ver mas</a></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">&#129341;</div><h3>Percusion</h3><p>Baterias, cajones, congas, timbales.</p><br><a href="#instrumentos" class="btn btn-secundario">Ver mas</a></div>\
    </div>\
  </div>\
</section>';
  },

  render404: function () {
    return '\
<section>\
  <div class="contenedor">\
    <div class="error-404">\
      <div class="error-numero">404</div>\
      <h2>Pagina no encontrada</h2>\
      <p>La pagina que buscas no existe o ha sido movida.</p>\
      <a href="#inicio" class="btn btn-primario">Volver al inicio</a>\
    </div>\
  </div>\
</section>';
  }
};
