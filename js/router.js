/* ============================================ router.js - Sistema de enrutamiento SPA (Single Page Application) ============================================ */

var RiveraSound = RiveraSound || {};

/**
 * RiveraSound.router - Enrutador por fragmentos de URL (#)
 * Escucha cambios en el hash de la URL y carga el HTML correspondiente
 * sin recargar la página. Soporta rutas hijas (cuenta-login, cuenta-perfil, etc.).
 */
RiveraSound.router = {

  /* ============ MAPA DE RUTAS ============ */
  /** Mapea cada hash de URL a un nombre de ruta interno. Si un hash no está listado, se resuelve como '404'. */
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

  /** Mapea cada ruta al archivo HTML parcial dentro de PaginasHTML/ */
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

  currentRoute: null, // Almacena la ruta actual para evitar recargas innecesarias

  /* ============ INICIALIZACIÓN ============ */

  /** init - Punto de entrada: bindea eventos y resuelve la ruta inicial (útil cuando se carga la página con un hash ya presente). */
  init: function () {
    this.bindEvents();
    this.resolve();
  },

  /** bindEvents - Escucha cambios en el hash de la URL y captura clicks en enlaces internos (#). */
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

  /** resolve - Determina qué ruta debe cargarse según el hash actual. Establece data-page en body para CSS modular. */
  resolve: function () {
    var hash = window.location.hash || '#';
    var route = this.routeMap[hash] || '404';
    if (route === this.currentRoute && route !== 'carrito') return;
    this.currentRoute = route;
    document.body.setAttribute('data-page', route.replace(/^cuenta-.*$/, 'cuenta'));
    this.loadRoute(route, hash);
  },

  /* ============ CARGA DE RUTAS ============ */

  /** loadRoute - Carga el HTML de la ruta en <div id="app">. Para inicio y 404 renderiza inline. Para el resto hace fetch del partial HTML. */
  loadRoute: function (route, hash) {
    var app = document.getElementById('app');
    if (!app) return;

    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll suave al inicio al cambiar de página
    this.updateNav(route);                            // Marca el enlace activo en el menú de navegación

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

    /* --- Fetch del HTML parcial --- */
    var self = this;
    app.innerHTML = '<div class="carga-spinner"></div>'; // Muestra spinner de carga mientras se descarga el HTML

    fetch(file)
      .then(function (r) {
        if (!r.ok) throw new Error('Not found');
        return r.text();
      })
      .then(function (html) {
        app.innerHTML = html;
        self.postProcess(route, hash);  // Procesamiento post-carga (ej: tabs de cuenta)
        self.afterRender(route);        // Inicializa componentes como reveal, contadores, catálogo
      })
      .catch(function () {
        app.innerHTML = self.render404();
        self.afterRender(route);
      });
  },

  /** postProcess - Ejecuta lógica adicional después de cargar el HTML. Actualmente maneja las tabs de la sección cuenta. */
  postProcess: function (route, hash) {
    if (route === 'cuenta' || route === 'cuenta-login' || route === 'cuenta-registro' ||
        route === 'cuenta-perfil' || route === 'cuenta-pedidos') {
      this.initCuentaTabs(hash);
    }
  },

  /** afterRender - Inicializa componentes visuales después de renderizar la página: animaciones reveal, contadores, catálogo y carrito. */
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
          var data = {
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            correo: document.getElementById('correo').value,
            mensaje: document.getElementById('mensaje').value
          };
          RiveraSound.api.enviarContacto(data).then(function (resp) {
            if (resp && resp.exito) {
              document.getElementById('mensajeExito').style.display = 'block';
              formContacto.reset();
            } else {
              RiveraSound.utils.notificar('Error al enviar mensaje', 'error');
            }
          }).catch(function () {
            document.getElementById('mensajeExito').style.display = 'block';
            formContacto.reset();
            RiveraSound.utils.notificar('Mensaje enviado (modo offline)', 'exito');
          });
        });
      }
      /* --- Botón flotante de feedback --- */
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

  /* ============ NAVEGACIÓN ============ */

  /** updateNav - Actualiza la clase 'activo' en los enlaces del menú según la ruta actual. */
  updateNav: function (route) {
    /* --- Mapea rutas hijas (cuenta-*) a su menú padre (cuenta) para resaltar el enlace correcto --- */
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

  /* ============ MÓDULO CUENTA (TABS) ============ */

  /** initCuentaTabs - Inicializa el sistema de tabs en la página de cuenta (login, registro, perfil, pedidos).
   *  Bindea clicks en tabs, activa el tab por defecto según el hash, y asigna eventos a los formularios.
   *  También inicializa las validaciones en vivo de los formularios.
   */
  initCuentaTabs: function (hash) {
    try {
    RiveraSound.validaciones.initFormulario('formLogin');
    RiveraSound.validaciones.initFormulario('formRegistro');
    var tabs = document.querySelectorAll('.cuenta-tab');     // Botones de tab
    var panels = document.querySelectorAll('.cuenta-panel'); // Contenido de cada tab

    /* --- Función interna para activar un tab por su ID --- */
    var activar = function (tabId) {
      tabs.forEach(function (t) { t.classList.remove('activo'); });
      panels.forEach(function (p) { p.classList.remove('activo'); });
      var tab = document.querySelector('.cuenta-tab[data-tab="' + tabId + '"]');
      var panel = document.getElementById('cuentaPanel' + tabId);
      if (tab) tab.classList.add('activo');
      if (panel) panel.classList.add('activo');
    };

    /* --- Bindea clicks en cada tab para cambiar el hash --- */
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var t = this.getAttribute('data-tab');
        window.location.hash = 'cuenta-' + t;
      });
    });

    /* --- Mostrar/ocultar tabs según sesión --- */
    var haySesion = !!localStorage.getItem('riverasound_usuario');
    var tabsSesion = document.querySelectorAll('.cuenta-tab-sesion');
    var tabsPublicas = document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)');
    tabsSesion.forEach(function (t) { t.style.display = haySesion ? '' : 'none'; });
    tabsPublicas.forEach(function (t) { t.style.display = haySesion ? 'none' : ''; });

    /* --- Mapa de hash a ID de tab. Si no hay match, se muestra login por defecto. --- */
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

    /* --- Formulario de login: autenticación contra API --- */
    var formLogin = document.getElementById('formLogin');
    if (formLogin) {
      formLogin.addEventListener('submit', function (e) {
        e.preventDefault();
        var correo = document.getElementById('loginCorreo').value;
        var password = document.getElementById('loginPassword').value;
        var btn = formLogin.querySelector('button[type="submit"]');
        btn.textContent = 'Ingresando...';
        btn.disabled = true;
        RiveraSound.api.login({ correo: correo, password: password }).then(function (resp) {
          btn.textContent = 'Iniciar sesión';
          btn.disabled = false;
          if (resp && resp.exito) {
            RiveraSound.api.setToken(resp.token);
            localStorage.setItem('riverasound_usuario', JSON.stringify(resp.usuario));
            RiveraSound.utils.notificar('Bienvenido ' + resp.usuario.nombre + '!', 'exito');
            /* --- Mostrar tabs de sesión, ocultar públicas --- */
            document.querySelectorAll('.cuenta-tab-sesion').forEach(function (t) { t.style.display = ''; });
            document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)').forEach(function (t) { t.style.display = 'none'; });
            document.querySelectorAll('.cuenta-panel').forEach(function (p) { p.classList.remove('activo'); });
            var perfilPanel = document.getElementById('cuentaPanelPerfil');
            if (perfilPanel) {
              perfilPanel.classList.add('activo');
              var perfilHeader = perfilPanel.querySelector('h3');
              var perfilEmail = perfilPanel.querySelector('p');
              if (perfilHeader) perfilHeader.textContent = resp.usuario.nombre + ' ' + (resp.usuario.apellido || '');
              if (perfilEmail) perfilEmail.textContent = resp.usuario.correo;
            }
            window.location.hash = 'cuenta-perfil';
            RiveraSound.carrito.sincronizarDesdeAPI();
          } else {
            RiveraSound.utils.notificar(resp && resp.error ? resp.error : 'Credenciales inválidas', 'error');
          }
        }).catch(function () {
          btn.textContent = 'Iniciar sesión';
          btn.disabled = false;
          /* --- Fallback demo si el servidor no responde --- */
          if (correo === 'demo@riverasound.pe' && password === 'demo123') {
            var demoUser = { nombre: 'Usuario', apellido: 'Demo', correo: 'demo@riverasound.pe', token: 'demo-token' };
            localStorage.setItem('riverasound_usuario', JSON.stringify(demoUser));
            RiveraSound.utils.notificar('Bienvenido Demo! (modo offline)', 'exito');
            document.querySelectorAll('.cuenta-tab-sesion').forEach(function (t) { t.style.display = ''; });
            document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)').forEach(function (t) { t.style.display = 'none'; });
            document.querySelectorAll('.cuenta-panel').forEach(function (p) { p.classList.remove('activo'); });
            var perfilPanel = document.getElementById('cuentaPanelPerfil');
            if (perfilPanel) {
              perfilPanel.classList.add('activo');
              var perfilHeader = perfilPanel.querySelector('h3');
              var perfilEmail = perfilPanel.querySelector('p');
              if (perfilHeader) perfilHeader.textContent = 'Usuario Demo';
              if (perfilEmail) perfilEmail.textContent = 'demo@riverasound.pe';
            }
            window.location.hash = 'cuenta-perfil';
          } else {
            RiveraSound.utils.notificar('No se pudo conectar al servidor. Usa demo@riverasound.pe / demo123', 'error');
          }
        });
      });
    }
    /* --- Formulario de registro: registro contra API --- */
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
        RiveraSound.api.registrar({ nombre: nombre, apellido: apellido, correo: correo, password: password }).then(function (resp) {
          btn.textContent = 'Crear cuenta';
          btn.disabled = false;
          if (resp && resp.exito) {
            RiveraSound.utils.notificar('Registro exitoso. Inicia sesión!', 'exito');
            window.location.hash = 'cuenta-login';
          } else {
            RiveraSound.utils.notificar(resp && resp.error ? resp.error : 'Error al registrarse', 'error');
          }
        });
      });
    }

    /* --- Cargar datos de perfil si hay sesión activa --- */
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
        RiveraSound.api.setToken(null);
        localStorage.removeItem('riverasound_usuario');
        RiveraSound.utils.notificar('Sesión cerrada', 'info');
        /* --- Mostrar tabs públicas, ocultar de sesión --- */
        document.querySelectorAll('.cuenta-tab-sesion').forEach(function (t) { t.style.display = 'none'; });
        document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)').forEach(function (t) { t.style.display = ''; });
        window.location.hash = 'cuenta-login';
      });
    }
    } catch (_) {}
  },

  /* ============ RENDERIZADO INLINE ============ */

  /** renderInicio - Devuelve el HTML de la página de inicio como string.
   *  Se renderiza inline (sin fetch) para evitar tiempo de carga en la página principal.
   */
  renderInicio: function () {
    return '\
<section class="hero">\
  <div class="hero-contenido">\
    <h1>Descubre tu instrumento perfecto</h1>\
    <p>En RiveraSound encontrarás los mejores instrumentos musicales importados, con garantía de calidad y la asesoría que necesitas para comenzar tu viaje musical.</p>\
    <div class="hero-botones">\
      <a href="#instrumentos" class="btn btn-primario">Ver Catálogo</a>\
      <a href="#contacto" class="btn btn-secundario">Contáctanos</a>\
    </div>\
  </div>\
</section>\
<section style="background-color: #f8f5f0;">\
  <div class="contenedor">\
    <h2 class="titulo-seccion reveal">¿Por qué elegir RiveraSound?</h2>\
    <span class="linea-dorada reveal"></span>\
    <p class="subtitulo-seccion reveal">Importaciones Rivera lleva más de 15 años trayendo música de calidad al Perú</p>\
    <div class="grid-tarjetas">\
      <div class="tarjeta reveal"><div class="tarjeta-icono">🌍</div><h3>Importación Directa</h3><p>Traemos instrumentos directamente desde Europa, Asia y América del Norte.</p></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">✅</div><h3>Garantía Oficial</h3><p>Todos nuestros instrumentos cuentan con garantía del fabricante y soporte técnico.</p></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">🎓</div><h3>Asesoría Gratuita</h3><p>Músicos profesionales te ayudarán a encontrar el instrumento ideal.</p></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">🚚</div><h3>Envío a Todo el Perú</h3><p>Envíos seguros y asegurados a Lima y todas las regiones del país.</p></div>\
    </div>\
  </div>\
</section>\
<section>\
  <div class="contenedor">\
    <h2 class="titulo-seccion reveal">Instrumentos Destacados</h2>\
    <span class="linea-dorada reveal"></span>\
    <p class="subtitulo-seccion reveal">Nuestros productos más populares</p>\
    <div class="grid-tarjetas" id="destacadosGrid"></div>\
    <div class="text-center mt-20 reveal"><a href="#instrumentos" class="btn btn-primario">Ver catálogo completo</a></div>\
  </div>\
</section>\
<div class="banner-cta">\
  <h2>¿Buscas un instrumento específico?</h2>\
  <p>Podemos importarlo por pedido especial. ¡Consúltanos!</p>\
  <a href="#contacto" class="btn btn-secundario">Hacer un pedido especial</a>\
</div>\
<section style="background-color: #f8f5f0;">\
  <div class="contenedor">\
    <h2 class="titulo-seccion reveal">Nuestras Categorías</h2>\
    <span class="linea-dorada reveal"></span>\
    <div class="grid-tarjetas">\
      <div class="tarjeta reveal"><div class="tarjeta-icono">🎺</div><h3>Viento</h3><p>Saxofones, trompetas, flautas, clarinetes.</p><br><a href="#instrumentos" class="btn btn-secundario">Ver más</a></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">🎹</div><h3>Teclado</h3><p>Pianos digitales, MIDI, órganos, sintetizadores.</p><br><a href="#instrumentos" class="btn btn-secundario">Ver más</a></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">🎻</div><h3>Cuerda</h3><p>Guitarras, violines, cellos, bajos, ukeleles.</p><br><a href="#instrumentos" class="btn btn-secundario">Ver más</a></div>\
      <div class="tarjeta reveal"><div class="tarjeta-icono">🥁</div><h3>Percusión</h3><p>Baterías, cajones, congas, timbales.</p><br><a href="#instrumentos" class="btn btn-secundario">Ver más</a></div>\
    </div>\
  </div>\
</section>';
  },

  /** render404 - Devuelve el HTML de la página de error 404 (ruta no encontrada). */
  render404: function () {
    return '\
<section>\
  <div class="contenedor">\
    <div class="error-404">\
      <div class="error-numero">404</div>\
      <h2>Página no encontrada</h2>\
      <p>La página que buscas no existe o ha sido movida.</p>\
      <a href="#inicio" class="btn btn-primario">Volver al inicio</a>\
    </div>\
  </div>\
</section>';
  }
};
