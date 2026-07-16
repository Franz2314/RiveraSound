/* Enrutador SPA, Autenticación Local e Historial de Pedidos */

var RiveraSound = RiveraSound || {};

// Objeto enrutador de RiveraSound
RiveraSound.router = {

  /**
   * routeMap: Asocia los hashes de la barra de direcciones con nombres lógicos de ruta.
   */
  routeMap: {
    '': 'inicio', '#': 'inicio', '#inicio': 'inicio',
    '#instrumentos': 'instrumentos',
    '#catalogo': 'catalogo',
    '#ofertas': 'ofertas',
    '#nosotros': 'nosotros',
    '#contacto': 'contacto',
    '#blog': 'blog',
    '#carrito': 'carrito',
    '#favoritos': 'favoritos',
    '#cuenta': 'cuenta',
    '#cuenta-login': 'cuenta-login',
    '#cuenta-registro': 'cuenta-registro',
    '#cuenta-perfil': 'cuenta-perfil',
    '#cuenta-pedidos': 'cuenta-pedidos'
  },

  /**
   * pageFiles: Mapea cada nombre de ruta con la ubicación física de su HTML parcial.
   * 'inicio' y '404' no cargan archivos externos; se inyectan como plantillas de texto.
   */
  pageFiles: {
    'inicio': '',
    'instrumentos': 'PaginasHTML/Catalogo/catalogo.html',
    'catalogo': 'PaginasHTML/Catalogo/catalogo.html',
    'ofertas': 'PaginasHTML/Ofertas/ofertas.html',
    'nosotros': 'PaginasHTML/Nosotros/nosotros.html',
    'contacto': 'PaginasHTML/Contacto/contacto.html',
    'blog': 'PaginasHTML/Blog/blog.html',
    'carrito': 'PaginasHTML/Compras/carrito.html',
    'favoritos': 'PaginasHTML/Favoritos/favoritos.html',
    'cuenta': 'PaginasHTML/Cuenta/cuenta.html',
    'cuenta-login': 'PaginasHTML/Cuenta/cuenta.html',
    'cuenta-registro': 'PaginasHTML/Cuenta/cuenta.html',
    'cuenta-perfil': 'PaginasHTML/Cuenta/cuenta.html',
    'cuenta-pedidos': 'PaginasHTML/Cuenta/cuenta.html'
  },

  // Almacena la ruta que se encuentra visible actualmente
  currentRoute: null,

  /**
   * init: Punto de arranque del enrutador. Asigna eventos de clics e inicia la resolución.
   */
  init() {
    this.bindEvents();
    this.resolve();
    this.initNewsletterForm();
  },

  initNewsletterForm() {
    RiveraSound.validaciones.initFormulario('formNewsletter');
    const formNews = document.getElementById('formNewsletter');
    if (formNews && !formNews.hasAttribute('data-handler')) {
      formNews.setAttribute('data-handler', '1');
      formNews.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletterCorreo');
        if (RiveraSound.validaciones.validarCampo(emailInput)) {
          RiveraSound.utils.notificar('¡Te has suscrito con éxito al boletín!', 'exito');
          formNews.reset();
          const grupo = emailInput.closest('.form-grupo');
          if (grupo) grupo.classList.remove('success');
        } else {
          RiveraSound.utils.notificar('Por favor, ingresa un correo válido.', 'error');
        }
      });
    }
  },

  /**
   * bindEvents: Configura la detección de cambios en la barra de direcciones (hashchange)
   * e intercepta todos los enlaces que inician con '#' para evitar la recarga clásica del navegador.
   */
  bindEvents() {
    window.addEventListener('hashchange', () => { this.resolve(); });
    
    document.addEventListener('click', (e) => {
      /* Clic en tarjeta de categoría en la home (data-categoria): navega al catálogo y filtra */
      const card = e.target.closest('.tarjeta[data-categoria]');
      if (card) {
        e.preventDefault();
        this._filtroActivo = card.getAttribute('data-categoria');
        window.location.hash = 'instrumentos';
        return;
      }

      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      
      e.preventDefault();
      
      const filtro = link.getAttribute('data-filtro');
      if (filtro) {
        this._filtroActivo = filtro;
      }
      
      window.location.hash = link.getAttribute('href').slice(1);
    });
  },

  /**
   * resolve: Lee la URL física y decide qué contenido inyectar.
   * Evita re-solicitar archivos si la ruta destino es la misma que la actual (excepto el carrito).
   */
  resolve() {
    const hash = window.location.hash || '#';
    const route = this.routeMap[hash] || '404';
    
    // Evitamos re-solicitar el archivo si es el mismo, excepto para carrito para forzar refresco
    if (route === this.currentRoute && route !== 'carrito') return;
    this.currentRoute = route;
    
    // Cambiamos un atributo data-page en el body para aplicar diseños CSS modularizados por sección
    document.body.setAttribute('data-page', route.replace(/^cuenta-.*$/, 'cuenta'));
    
    this.loadRoute(route, hash);
  },

  /**
   * loadRoute: Inserta el HTML en el contenedor central `<div id="app">`.
   * Si es 'inicio' o '404' renderiza plantillas dinámicas en memoria. Si no,
   * utiliza la API moderna `fetch` para descargar el fragmento HTML e inyectarlo.
   */
  loadRoute(route, hash) {
    const app = document.getElementById('app');
    if (!app) return;

    window.scrollTo({ top: 0, behavior: 'smooth' }); // Desplazamiento automático al inicio de pantalla
    this.updateNav(route); // Actualiza la apariencia visual del menú activo

    /* Transición de fade suave entre páginas */
    app.classList.remove('fade-out');

    /* Función auxiliar para inyectar contenido con fade-in */
    const inyectar = (html, cb) => {
      app.innerHTML = html;
      /* Pequeño retraso para activar la transición CSS */
      requestAnimationFrame(() => {
        app.classList.remove('fade-out');
      });
      if (cb) cb();
    };

    /* 1. Carga de vistas en memoria rápida */
    if (route === 'inicio') {
      inyectar(this.renderInicio(), () => this.afterRender(route));
      return;
    }

    if (route === '404') {
      inyectar(this.render404(), () => this.afterRender(route));
      return;
    }

    /* 2. Carga de fragmentos HTML por red (Fetch) */
    const file = this.pageFiles[route];
    if (!file) {
      inyectar(this.render404(), () => this.afterRender(route));
      return;
    }

    /* Mostramos un spinner animado de CSS mientras se descarga la plantilla */
    inyectar('<div class="carga-spinner"></div>');

    fetch(file)
      .then((r) => {
        if (!r.ok) throw new Error('Fragmento HTML no encontrado');
        return r.text();
      })
      .then((html) => {
        inyectar(html);
        this.postProcess(route, hash); // Ejecuta configuraciones previas a la interacción
        this.afterRender(route); // Dispara la inicialización de interactividad
      })
      .catch(() => {
        inyectar(this.render404(), () => this.afterRender(route));
      });
  },

  /**
   * postProcess: Lógica previa a la renderización interactiva (ej: inicializar pestañas de cuenta).
   */
  postProcess(route, hash) {
    if (['cuenta', 'cuenta-login', 'cuenta-registro', 'cuenta-perfil', 'cuenta-pedidos'].indexOf(route) !== -1) {
      this.initCuentaTabs(hash);
    }
  },

  /**
   * afterRender: Asigna lógica interactiva o scripts tras inyectar la vista en la pantalla.
   */
  /* Activa interactividad tras inyectar HTML en la SPA */
  afterRender(route) {
    /* Si venimos del menú desplegable (Viento/Cuerda/etc.), marcamos el filtro antes de renderizar */
    if (route === 'instrumentos' || route === 'catalogo') {
      if (this._filtroActivo) {
        const btnActivo = document.querySelector(`.btn-filtro[data-categoria="${this._filtroActivo}"]`);
        if (btnActivo) {
          document.querySelectorAll('.btn-filtro').forEach((b) => b.classList.remove('activo'));
          btnActivo.classList.add('activo');
        }
      }
    }

    /* iniciar() lee el filtro activo y renderiza con esa categoría */
    try { RiveraSound.catalogo.iniciar(); } catch (_) {}
    try { RiveraSound.reveal.iniciar(); } catch (_) {}
    try { RiveraSound.contadores.iniciar(); } catch (_) {}
    try { RiveraSound.carrito.renderSidebar(); } catch (_) {}

    if (route === 'instrumentos' || route === 'catalogo') {
      this._filtroActivo = null; /* Limpia el filtro temporal del menú */
    }

    if (route === 'carrito') {
      RiveraSound.carrito.renderPagina();
    }

    if (route === 'favoritos') {
      RiveraSound.favoritos.renderPagina();
    }

    // Configuración específica de la página de contacto y formulario
    if (route === 'contacto') {
      // Inicializamos validaciones automáticas al escribir
      RiveraSound.validaciones.initFormulario('formularioContacto');
      
      const formContacto = document.getElementById('formularioContacto');
      if (formContacto && !formContacto.hasAttribute('data-handler')) {
        formContacto.setAttribute('data-handler', '1');
        formContacto.addEventListener('submit', (e) => {
          e.preventDefault();
          
          // Comprobamos la validación de cada campo antes de enviar
          let esValido = true;
          formContacto.querySelectorAll('input, select, textarea').forEach((input) => {
            if (!RiveraSound.validaciones.validarCampo(input)) esValido = false;
          });
          
          if (!esValido) {
            RiveraSound.utils.notificar('Por favor, ingresa los datos correctamente', 'error');
            return;
          }
          
          document.getElementById('mensajeExito').style.display = 'block';
          formContacto.reset();
          RiveraSound.utils.notificar('Mensaje enviado con éxito', 'exito');
        });
      }

      RiveraSound.validaciones.initFormulario('formularioImportacion');
      const formImport = document.getElementById('formularioImportacion');
      if (formImport && !formImport.hasAttribute('data-handler')) {
        formImport.setAttribute('data-handler', '1');
        formImport.addEventListener('submit', (e) => {
          e.preventDefault();
          let esValido = true;
          formImport.querySelectorAll('input, textarea').forEach((input) => {
            if (!RiveraSound.validaciones.validarCampo(input)) esValido = false;
          });
          
          if (!esValido) {
            RiveraSound.utils.notificar('Por favor, ingresa los datos correctamente', 'error');
            return;
          }
          
          document.getElementById('importExito').style.display = 'block';
          formImport.reset();
          formImport.querySelectorAll('.form-grupo').forEach((g) => g.classList.remove('success', 'error'));
          RiveraSound.utils.notificar('Solicitud de importación registrada', 'exito');
        });
      }

      // Creamos dinámicamente el botón flotante de "Feedback" si no está presente
      if (!document.getElementById('btnFeedback')) {
        const feedbackBtn = document.createElement('button');
        feedbackBtn.id = 'btnFeedback';
        feedbackBtn.className = 'btn-feedback';
        feedbackBtn.title = 'Dejar feedback';
        feedbackBtn.innerHTML = '&#128172; Feedback';
        
        feedbackBtn.addEventListener('click', () => {
          const feedbackHtml = `
            <div style="text-align:center;">
              <div style="font-size:3rem;margin-bottom:12px;">💬</div>
              <p style="color:var(--color-gris);margin-bottom:16px;">Ayúdanos a mejorar. Déjanos tu opinión:</p>
              <form id="formFeedback" onsubmit="return false;">
                <div class="form-grupo">
                  <label for="feedbackNombre">Nombre</label>
                  <input type="text" id="feedbackNombre" placeholder="Tu nombre" required>
                </div>
                <div class="form-grupo">
                  <label for="feedbackMensaje">Comentario</label>
                  <textarea id="feedbackMensaje" rows="4" placeholder="Escribe tu feedback aquí..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primario" id="btnEnviarFeedback" style="width:100%;">Enviar feedback</button>
              </form>
            </div>
          `;
          RiveraSound.modal.abrir(feedbackHtml, 'Feedback');
          
          setTimeout(() => {
            const formFb = document.getElementById('formFeedback');
            if (formFb) {
              formFb.addEventListener('submit', (ev) => {
                ev.preventDefault();
                const fbMsg = document.getElementById('feedbackMensaje');
                if (fbMsg && fbMsg.value.trim().length >= 3) {
                  RiveraSound.utils.notificar('¡Gracias por tu feedback!', 'exito');
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

  /**
   * updateNav: Pone la clase .activo en el menú superior según la sección visitada.
   */
  updateNav(route) {
    const map = {
      inicio: 'inicio', instrumentos: 'instrumentos', catalogo: 'catalogo',
      ofertas: 'ofertas', nosotros: 'nosotros', contacto: 'contacto',
      blog: 'blog', carrito: 'carrito', favoritos: 'favoritos', cuenta: 'cuenta',
      'cuenta-login': 'cuenta', 'cuenta-registro': 'cuenta',
      'cuenta-perfil': 'cuenta', 'cuenta-pedidos': 'cuenta',
      '404': 'inicio'
    };
    const active = map[route] || 'inicio';
    document.querySelectorAll('#menuNav a').forEach((a) => {
      a.classList.remove('activo');
      if (a.getAttribute('href') === `#${active}`) {
        a.classList.add('activo');
      }
    });
  },

  /* Pestañas de cuenta (login, registro, perfil, pedidos) */

  /**
   * initCuentaTabs: Inicializa las pestañas lógicas de la cuenta, controlando
   * el inicio de sesión y registro de forma local con localStorage.
   */
  initCuentaTabs(hash) {
    try {
      RiveraSound.validaciones.initFormulario('formLogin');
      RiveraSound.validaciones.initFormulario('formRegistro');
      
      const tabs = document.querySelectorAll('.cuenta-tab');
      const panels = document.querySelectorAll('.cuenta-panel');

      // Función local para mostrar el panel activo y pintar su pestaña correspondiente
      const activar = (tabId) => {
        tabs.forEach((t) => t.classList.remove('activo'));
        panels.forEach((p) => p.classList.remove('activo'));
        
        const tab = document.querySelector(`.cuenta-tab[data-tab="${tabId}"]`);
        const panel = document.getElementById(`cuentaPanel${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
        
        if (tab) tab.classList.add('activo');
        if (panel) panel.classList.add('activo');
      };

      tabs.forEach((tab) => {
        tab.addEventListener('click', function () {
          const t = this.getAttribute('data-tab');
          window.location.hash = `cuenta-${t}`; // Modifica URL para gatillar enrutador
        });
      });

      // Validamos si hay sesión activa leyendo el valor en localStorage
      const haySesion = !!localStorage.getItem('riverasound_usuario');
      const tabsSesion = document.querySelectorAll('.cuenta-tab-sesion');
      const tabsPublicas = document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)');
      
      // Ocultamos pestañas de autenticación si ya hay sesión y viceversa
      tabsSesion.forEach((t) => { t.style.display = haySesion ? '' : 'none'; });
      tabsPublicas.forEach((t) => { t.style.display = haySesion ? 'none' : ''; });

      const tabMap = {
        'cuenta': 'login',
        'cuenta-login': 'login',
        'cuenta-registro': 'registro',
        'cuenta-perfil': 'perfil',
        'cuenta-pedidos': 'pedidos'
      };
      
      const hashClean = hash.replace(/^#/, '');
      const defaultTab = tabMap[hashClean] || (haySesion ? 'perfil' : 'login');
      activar(defaultTab);

      /* --- INICIO DE SESIÓN LOCAL --- */
      const formLogin = document.getElementById('formLogin');
      if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
          e.preventDefault();
          const correoInput = document.getElementById('loginCorreo');
          const passwordInput = document.getElementById('loginPassword');
          const btn = formLogin.querySelector('button[type="submit"]');
          
          btn.textContent = 'Ingresando...';
          btn.disabled = true;

          // VALIDACIÓN DE SEGURIDAD (Submit validation)
          let esValido = true;
          if (!RiveraSound.validaciones.validarCampo(correoInput)) esValido = false;
          if (!RiveraSound.validaciones.validarCampo(passwordInput)) esValido = false;

          if (!esValido) {
            btn.textContent = 'Iniciar sesión';
            btn.disabled = false;
            RiveraSound.utils.notificar('Por favor, ingresa tus datos correctamente', 'error');
            return;
          }

          // NORMALIZACIÓN DE CORREOS (Case-insensitivity)
          const correo = correoInput.value.trim().toLowerCase();
          const password = passwordInput.value;

          let usuarios = [];
          try { usuarios = JSON.parse(localStorage.getItem('riverasound_usuarios')) || []; } catch (_) {}

          let usuarioValido = null;
          
          // Verificamos si corresponde a la cuenta Demo académica o a un usuario registrado
          if (correo === 'demo@riverasound.pe' && password === 'demo123') {
            usuarioValido = {
              nombre: 'Usuario',
              apellido: 'Demo',
              correo: 'demo@riverasound.pe',
              telefono: '',
              direccion: '',
              ciudad: ''
            };
            usuarios.forEach((u) => {
              if (u.correo.toLowerCase() === 'demo@riverasound.pe') {
                usuarioValido.telefono = u.telefono || '';
                usuarioValido.direccion = u.direccion || '';
                usuarioValido.ciudad = u.ciudad || '';
              }
            });
          } else {
            usuarios.forEach((u) => {
              if (u.correo.trim().toLowerCase() === correo && u.password === password) {
                usuarioValido = {
                  nombre: u.nombre,
                  apellido: u.apellido,
                  correo: u.correo.trim().toLowerCase(),
                  telefono: u.telefono || '',
                  direccion: u.direccion || '',
                  ciudad: u.ciudad || ''
                };
              }
            });
          }

          btn.textContent = 'Iniciar sesión';
          btn.disabled = false;

          if (usuarioValido) {
            localStorage.setItem('riverasound_usuario', JSON.stringify(usuarioValido));
            RiveraSound.utils.notificar(`¡Bienvenido ${usuarioValido.nombre}!`, 'exito');
            
            // Re-organiza visibilidad de pestañas
            document.querySelectorAll('.cuenta-tab-sesion').forEach((t) => { t.style.display = ''; });
            document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)').forEach((t) => { t.style.display = 'none'; });
            document.querySelectorAll('.cuenta-panel').forEach((p) => p.classList.remove('activo'));
            
            const perfilPanel = document.getElementById('cuentaPanelPerfil');
            if (perfilPanel) {
              perfilPanel.classList.add('activo');
              const perfilHeader = perfilPanel.querySelector('h3');
              const perfilEmail = perfilPanel.querySelector('p');
              if (perfilHeader) perfilHeader.textContent = `${usuarioValido.nombre} ${usuarioValido.apellido || ''}`;
              if (perfilEmail) perfilEmail.textContent = usuarioValido.correo;
            }
            window.location.hash = 'cuenta-perfil';
          } else {
            RiveraSound.utils.notificar('Credenciales inválidas. Usa demo@riverasound.pe / demo123', 'error');
          }
        });
      }

      /* --- REGISTRO DE USUARIOS LOCAL --- */
      const formRegistro = document.getElementById('formRegistro');
      if (formRegistro) {
        formRegistro.addEventListener('submit', (e) => {
          e.preventDefault();
          const btn = formRegistro.querySelector('button[type="submit"]');
          btn.textContent = 'Registrando...';
          btn.disabled = true;

          const nombreInput = document.getElementById('regNombre');
          const apellidoInput = document.getElementById('regApellido');
          const correoInput = document.getElementById('regCorreo');
          const passwordInput = document.getElementById('regPassword');

          // VALIDACIÓN DE SEGURIDAD
          let esValido = true;
          if (!RiveraSound.validaciones.validarCampo(nombreInput)) esValido = false;
          if (!RiveraSound.validaciones.validarCampo(apellidoInput)) esValido = false;
          if (!RiveraSound.validaciones.validarCampo(correoInput)) esValido = false;
          if (!RiveraSound.validaciones.validarCampo(passwordInput)) esValido = false;

          if (!esValido) {
            btn.textContent = 'Crear cuenta';
            btn.disabled = false;
            RiveraSound.utils.notificar('Por favor, corrige los errores en el formulario', 'error');
            return;
          }

          // NORMALIZACIÓN
          const nombre = nombreInput.value.trim();
          const apellido = apellidoInput.value.trim();
          const correo = correoInput.value.trim().toLowerCase();
          const password = passwordInput.value;

          let usuarios = [];
          try { usuarios = JSON.parse(localStorage.getItem('riverasound_usuarios')) || []; } catch (_) {}

          let existe = false;
          usuarios.forEach((u) => {
            if (u.correo.trim().toLowerCase() === correo) existe = true;
          });

          if (existe) {
            btn.textContent = 'Crear cuenta';
            btn.disabled = false;
            RiveraSound.utils.notificar('El correo ya está registrado. Inicia sesión.', 'error');
            return;
          }

          // Guardamos el nuevo usuario en el array de localStorage
          usuarios.push({ nombre, apellido, correo, password });
          localStorage.setItem('riverasound_usuarios', JSON.stringify(usuarios));

          btn.textContent = 'Crear cuenta';
          btn.disabled = false;
          RiveraSound.utils.notificar('Registro exitoso. ¡Inicia sesión!', 'exito');
          
          window.location.hash = 'cuenta-login'; // Redirecciona al login
        });
      }

      /* --- CARGAR DATOS DE SESIÓN EN PERFIL --- */
      const usuarioGuardado = localStorage.getItem('riverasound_usuario');
      const btnCerrar = document.getElementById('btnCerrarSesion');
      
      if (usuarioGuardado) {
        const userData = JSON.parse(usuarioGuardado);
        const perfilHeader = document.querySelector('#cuentaPanelPerfil h3');
        const perfilEmail = document.querySelector('#cuentaPanelPerfil p');
        if (perfilHeader) perfilHeader.textContent = `${userData.nombre} ${userData.apellido || ''}`;
        if (perfilEmail) perfilEmail.textContent = userData.correo;
        if (btnCerrar) btnCerrar.style.display = 'block';

        const tInput = document.getElementById('perfilTelefono');
        const dInput = document.getElementById('perfilDireccion');
        const cInput = document.getElementById('perfilCiudad');
        if (tInput) tInput.value = userData.telefono || '';
        if (dInput) dInput.value = userData.direccion || '';
        if (cInput) cInput.value = userData.ciudad || '';
      }

      RiveraSound.validaciones.initFormulario('formPerfilDatos');
      const formPerfil = document.getElementById('formPerfilDatos');
      if (formPerfil && !formPerfil.hasAttribute('data-handler')) {
        formPerfil.setAttribute('data-handler', '1');
        formPerfil.addEventListener('submit', (e) => {
          e.preventDefault();
          let esValido = true;
          formPerfil.querySelectorAll('input').forEach((input) => {
            if (!RiveraSound.validaciones.validarCampo(input)) esValido = false;
          });

          if (!esValido) {
            RiveraSound.utils.notificar('Por favor, ingresa los datos correctamente', 'error');
            return;
          }

          const usuario = JSON.parse(localStorage.getItem('riverasound_usuario'));
          if (usuario) {
            usuario.telefono = document.getElementById('perfilTelefono').value.trim();
            usuario.direccion = document.getElementById('perfilDireccion').value.trim();
            usuario.ciudad = document.getElementById('perfilCiudad').value.trim();
            localStorage.setItem('riverasound_usuario', JSON.stringify(usuario));

            let usuarios = [];
            try { usuarios = JSON.parse(localStorage.getItem('riverasound_usuarios')) || []; } catch (_) {}
            let encontrado = false;
            usuarios = usuarios.map((u) => {
              if (u.correo.toLowerCase() === usuario.correo.toLowerCase()) {
                u.telefono = usuario.telefono;
                u.direccion = usuario.direccion;
                u.ciudad = usuario.ciudad;
                encontrado = true;
              }
              return u;
            });
            if (!encontrado) {
              usuarios.push({
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                correo: usuario.correo.toLowerCase(),
                password: usuario.correo.toLowerCase() === 'demo@riverasound.pe' ? 'demo123' : '',
                telefono: usuario.telefono,
                direccion: usuario.direccion,
                ciudad: usuario.ciudad
              });
            }
            localStorage.setItem('riverasound_usuarios', JSON.stringify(usuarios));

            formPerfil.querySelectorAll('.form-grupo').forEach((g) => g.classList.remove('success'));
            RiveraSound.utils.notificar('Datos de envío guardados', 'exito');
          }
        });
      }

      if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
          localStorage.removeItem('riverasound_usuario');
          RiveraSound.utils.notificar('Sesión cerrada con éxito', 'info');
          
          // Oculta/Muestra pestañas según cierre de sesión
          document.querySelectorAll('.cuenta-tab-sesion').forEach((t) => { t.style.display = 'none'; });
          document.querySelectorAll('.cuenta-tab:not(.cuenta-tab-sesion)').forEach((t) => { t.style.display = ''; });
          
          window.location.hash = 'cuenta-login';
        });
      }

      // Renderiza los pedidos históricos si el usuario está en ese panel
      if (hashClean === 'cuenta-pedidos' || hashClean === 'pedidos') {
        this.renderPedidos();
      }

      // PREVENCIÓN DE FUGA DE MEMORIA: Enlazamos con una referencia única estática
      if (!RiveraSound.router._hashListener) {
        RiveraSound.router._hashListener = () => {
          if (window.location.hash === '#cuenta-pedidos') {
            RiveraSound.router.renderPedidos();
          }
        };
      }
      window.removeEventListener('hashchange', RiveraSound.router._hashListener);
      window.addEventListener('hashchange', RiveraSound.router._hashListener);

    } catch (e) {
      // Manejo silencioso de excepciones en la vista
    }
  },

  /* Historial de pedidos */

  /**
   * renderPedidos: Obtiene los pedidos creados por el usuario activo
   * y los dibuja en forma de lista detallada, permitiendo cambiar su estado.
   */
  renderPedidos() {
    const pedidos = RiveraSound.carrito.obtenerPedidos();
    const usuario = localStorage.getItem('riverasound_usuario');
    if (!usuario) return;
    
    const correo = JSON.parse(usuario).correo;
    // Filtramos solo los pedidos del usuario logueado en sesión activa
    const pedidosUsuario = pedidos.filter((p) => p.usuario.trim().toLowerCase() === correo.trim().toLowerCase());
    
    const panel = document.getElementById('cuentaPanelPedidos');
    if (!panel) return;

    if (pedidosUsuario.length === 0) {
      panel.innerHTML = `
        <div style="text-align:center;padding:40px 0;">
          <div style="font-size:3rem;opacity:0.3;margin-bottom:12px;">📦</div>
          <h3 style="color:var(--color-primario);">No tienes pedidos registrados</h3>
          <p style="color:var(--color-gris);">Los pedidos que realices aparecerán aquí.</p>
          <a href="#instrumentos" class="btn btn-primario" style="margin-top:12px;">Explorar catálogo</a>
        </div>
      `;
      return;
    }

    const estados = ['Pendiente', 'En envío', 'Entregado', 'Recogido en tienda', 'Cancelado'];
    let html = '<div style="max-width:700px;margin:0 auto;">';

    pedidosUsuario.forEach((p) => {
      let itemsHtml = '';
      p.items.forEach((item) => {
        itemsHtml += `
          <div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #eee;font-size:0.85rem;">
            <span>${item.emoji} ${item.nombre} x${item.cantidad}</span>
            <span>${RiveraSound.utils.formatearPrecio(item.precio * item.cantidad)}</span>
          </div>
        `;
      });

      let opcionesEstado = '';
      estados.forEach((est) => {
        const seleccionado = est === p.estado ? 'selected' : '';
        opcionesEstado += `<option value="${est}" ${seleccionado}>${est}</option>`;
      });

      html += `
        <div style="background:var(--color-blanco);border-radius:var(--radio);box-shadow:0 2px 4px rgba(0, 0, 0, 0.1);padding:20px;margin-bottom:16px;border:1px solid #eee;">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
            <div>
              <strong style="font-size:1rem;">#${p.id}</strong>
              <span style="color:var(--color-gris);font-size:0.8rem;margin-left:10px;">${p.fecha}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <select class="estado-pedido-select" data-pedido="${p.id}" style="padding:4px 8px;border-radius:4px;border:1px solid #ccc;font-size:0.8rem;">
                ${opcionesEstado}
              </select>
            </div>
          </div>
          ${itemsHtml}
          <div style="text-align:right;margin-top:10px;font-weight:bold;font-size:1.1rem;">Total: ${RiveraSound.utils.formatearPrecio(p.total)}</div>
        </div>
      `;
    });

    html += '</div>';
    panel.innerHTML = html;

    // Asignamos controladores al select de estado de pedidos (Admin simulator local)
    panel.querySelectorAll('.estado-pedido-select').forEach((sel) => {
      sel.addEventListener('change', function () {
        const pedidoId = this.getAttribute('data-pedido');
        const nuevoEstado = this.value;
        RiveraSound.carrito.actualizarEstadoPedido(pedidoId, nuevoEstado);
        RiveraSound.utils.notificar(`Pedido actualizado a: ${nuevoEstado}`, 'exito');
      });
    });
  },

  /* Plantillas html de vistas en memoria */

  /**
   * renderInicio: Genera el string HTML de la página de inicio (Landing page).
   * @returns {string} - HTML.
   */
  renderInicio() {
    return `
      <section class="hero">
        <div class="hero-contenido">
          <h1>Descubre tu instrumento perfecto</h1>
          <p>En RiveraSound encontrarás los mejores instrumentos musicales importados, con garantía de calidad y la asesoría que necesitas para comenzar tu viaje musical.</p>
          <div class="hero-botones">
            <a href="#instrumentos" class="btn btn-primario">Ver Catálogo</a>
            <a href="#contacto" class="btn btn-secundario">Contáctanos</a>
          </div>
        </div>
        <div class="scroll-indicator" onclick="document.getElementById('porque-elegir').scrollIntoView({behavior:'smooth'})">
          <span>Descubre más</span>
          <span>↓</span>
        </div>
      </section>
      
      <section id="porque-elegir" style="background-color: var(--color-fondo);">
        <div class="contenedor">
          <h2 class="titulo-seccion reveal">¿Por qué elegir RiveraSound?</h2>
          <span class="linea-dorada reveal"></span>
          <p class="subtitulo-seccion reveal">Importaciones Rivera lleva más de 15 años trayendo música de calidad al Perú</p>
          
          <div class="grid-tarjetas">
            <div class="tarjeta reveal">
              <div class="tarjeta-icono">🌍</div>
              <h3>Importación Directa</h3>
              <p>Traemos instrumentos directamente desde Europa, Asia y América del Norte.</p>
            </div>
            <div class="tarjeta reveal">
              <div class="tarjeta-icono">✔️</div>
              <h3>Garantía Oficial</h3>
              <p>Todos nuestros instrumentos cuentan con garantía oficial y soporte técnico especializado.</p>
            </div>
            <div class="tarjeta reveal">
              <div class="tarjeta-icono">🎓</div>
              <h3>Asesoría Gratuita</h3>
              <p>Músicos profesionales te ayudarán en el proceso de encontrar tu instrumento ideal.</p>
            </div>
            <div class="tarjeta reveal">
              <div class="tarjeta-icono">🚚</div>
              <h3>Envío a Todo el Perú</h3>
              <p>Envíos totalmente seguros y asegurados a Lima Metropolitana y regiones.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section>
        <div class="contenedor">
          <h2 class="titulo-seccion reveal">Instrumentos Destacados</h2>
          <span class="linea-dorada reveal"></span>
          <p class="subtitulo-seccion reveal">Nuestros productos más populares y solicitados</p>
          
          <div class="grid-tarjetas" id="destacadosGrid"></div>
          
          <div class="text-center mt-20 reveal" style="margin-top: 30px;">
            <a href="#instrumentos" class="btn btn-primario">Ver catálogo completo</a>
          </div>
        </div>
      </section>
      
      <div class="banner-cta">
        <div class="contenedor">
          <h2>¿Buscas un instrumento específico?</h2>
          <p>Podemos importarlo bajo pedido especial desde distribuidores autorizados. ¡Consúltanos!</p>
          <a href="#contacto" class="btn btn-secundario">Hacer un pedido especial</a>
        </div>
      </div>
      
      <!-- Sección de categorías: cada tarjeta tiene data-categoria para filtrar al hacer clic -->
      <section style="background-color: var(--color-fondo);">
        <div class="contenedor">
          <h2 class="titulo-seccion reveal">Nuestras Categorías</h2>
          <span class="linea-dorada reveal"></span>
          
          <div class="grid-tarjetas">
            <div class="tarjeta reveal" data-categoria="viento" style="cursor:pointer;">
              <div class="tarjeta-icono">📯</div>
              <h3>Viento</h3>
              <p>Saxofones, trompetas, flautas traversas y clarinetes.</p>
              <br>
              <a href="#instrumentos" class="btn btn-secundario">Ver más</a>
            </div>
            <div class="tarjeta reveal" data-categoria="teclado" style="cursor:pointer;">
              <div class="tarjeta-icono">🎹</div>
              <h3>Teclado</h3>
              <p>Pianos digitales, controladores MIDI, sintetizadores.</p>
              <br>
              <a href="#instrumentos" class="btn btn-secundario">Ver más</a>
            </div>
            <div class="tarjeta reveal" data-categoria="cuerda" style="cursor:pointer;">
              <div class="tarjeta-icono">🎸</div>
              <h3>Cuerda</h3>
              <p>Guitarras, violines, violonchelos, bajos, ukeleles.</p>
              <br>
              <a href="#instrumentos" class="btn btn-secundario">Ver más</a>
            </div>
            <div class="tarjeta reveal" data-categoria="percusion" style="cursor:pointer;">
              <div class="tarjeta-icono">🥁</div>
              <h3>Percusión</h3>
              <p>Baterías, cajones peruanos, congas y bongós.</p>
              <br>
              <a href="#instrumentos" class="btn btn-secundario">Ver más</a>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  /**
   * render404: Genera el string HTML para rutas inexistentes.
   * @returns {string} - HTML.
   */
  render404() {
    return `
      <section>
        <div class="contenedor">
          <div class="error-404">
            <div class="error-numero">404</div>
            <h2>Página no encontrada</h2>
            <p>La dirección que estás buscando no existe o ha sido movida permanentemente.</p>
            <a href="#inicio" class="btn btn-primario" style="margin-top:20px;">Volver al inicio</a>
          </div>
        </div>
      </section>
    `;
  }
};
