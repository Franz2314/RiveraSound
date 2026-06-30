document.addEventListener('DOMContentLoaded', function () {

  /* =============================================
     1. RESPONSIVE MENU
     ============================================= */
  const btnMenu = document.getElementById('btnMenu');
  const menuNav = document.getElementById('menuNav');

  if (btnMenu && menuNav) {
    btnMenu.addEventListener('click', function () {
      this.classList.toggle('activo');
      menuNav.classList.toggle('visible');
      const abierto = menuNav.classList.contains('visible');
      this.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
    });

            document.querySelectorAll('#menuNav a').forEach(function (link) {
          link.addEventListener('click', function (e) {
            // 💥 CONTROL: Si el enlace está dentro de nuestro menú desplegable, NO cierres la hamburguesa todavía
            if (link.closest('.menu-desplegable')) {
              // Si el enlace que tocaste es una de las subcategorías (ej. Viento), entonces ahí sí cerramos todo
              if (link.closest('.dropdown-contenido')) {
                menuNav.classList.remove('visible');
                btnMenu.classList.remove('activo');
                btnMenu.setAttribute('aria-label', 'Abrir menú');
              }
              return; // Detiene la ejecución para que no cierre el menú en el primer toque de "Instrumentos"
            }

            // Para todos los demás enlaces normales (Inicio, Nosotros, Contacto), se cierra como siempre
            menuNav.classList.remove('visible');
            btnMenu.classList.remove('activo');
            btnMenu.setAttribute('aria-label', 'Abrir menú');
          });
        });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('header') && menuNav.classList.contains('visible')) {
        menuNav.classList.remove('visible');
        btnMenu.classList.remove('activo');
        btnMenu.setAttribute('aria-label', 'Abrir menú');
      }
    });
  }

  /* =============================================
     2. SCROLL REVEAL ANIMATIONS
     ============================================= */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* =============================================
     3. FORM VALIDATION
     ============================================= */
  const form = document.getElementById('formularioContacto');
  const mensajeExito = document.getElementById('mensajeExito');

  if (form) {
    const validators = {
      nombre: function (val) {
        return val.trim().length >= 2 ? '' : 'El nombre debe tener al menos 2 caracteres.';
      },
      apellido: function (val) {
        return val.trim().length >= 2 ? '' : 'El apellido debe tener al menos 2 caracteres.';
      },
      correo: function (val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Ingresa un correo electrónico válido.';
      },
      telefono: function (val) {
        if (!val.trim()) return '';
        return /^[0-9]{9}$/.test(val.trim()) ? '' : 'El teléfono debe tener 9 dígitos.';
      },
      consulta: function (val) {
        return val ? '' : 'Selecciona un tipo de consulta.';
      },
      mensaje: function (val) {
        return val.trim().length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres.';
      }
    };

    function validarCampo(input) {
      const grupo = input.closest('.form-grupo');
      if (!grupo) return true;
      const errorMsg = grupo.querySelector('.error-msg');
      const validator = validators[input.name] || validators[input.id];
      if (!validator) return true;
      const error = validator(input.value);
      grupo.classList.remove('error', 'success');
      if (error) {
        grupo.classList.add('error');
        if (errorMsg) errorMsg.textContent = error;
        return false;
      } else {
        grupo.classList.add('success');
        return true;
      }
    }

    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('blur', function () {
        validarCampo(this);
      });
      input.addEventListener('input', function () {
        const grupo = this.closest('.form-grupo');
        if (grupo && (grupo.classList.contains('error') || grupo.classList.contains('success'))) {
          validarCampo(this);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      let valido = true;
      const campos = form.querySelectorAll('input[required], select[required], textarea[required]');
      campos.forEach(function (input) {
        if (!validarCampo(input)) {
          valido = false;
        }
      });
      if (!valido) {
        mostrarNotificacion('Por favor corrige los errores en el formulario.', 'error');
        const primerError = form.querySelector('.form-grupo.error input, .form-grupo.error select, .form-grupo.error textarea');
        if (primerError) primerError.focus();
        return;
      }
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Enviando...';
      setTimeout(function () {
        if (mensajeExito) {
          mensajeExito.style.display = 'block';
          mensajeExito.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        mostrarNotificacion('¡Mensaje enviado con éxito!', 'exito');
        form.reset();
        form.querySelectorAll('.form-grupo').forEach(function (g) {
          g.classList.remove('success', 'error');
        });
        btn.disabled = false;
        btn.textContent = 'Enviar mensaje';
      }, 1200);
    });

    form.querySelector('button[type="reset"]').addEventListener('click', function () {
      setTimeout(function () {
        form.querySelectorAll('.form-grupo').forEach(function (g) {
          g.classList.remove('success', 'error');
        });
        if (mensajeExito) mensajeExito.style.display = 'none';
      }, 50);
    });
  }

  /* =============================================
     4. NOTIFICATION SYSTEM
     ============================================= */
  function mostrarNotificacion(mensaje, tipo) {
    tipo = tipo || 'info';
    var notif = document.createElement('div');
    notif.className = 'notificacion ' + tipo;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    setTimeout(function () {
      if (notif.parentNode) notif.parentNode.removeChild(notif);
    }, 3000);
  }
  window.mostrarNotificacion = mostrarNotificacion;

  /* =============================================
     5. DYNAMIC CATALOG (Instrumentos page)
     ============================================= */
  var catalogoContainer = document.getElementById('catalogoDinamico');
  var filtrosContainer = document.getElementById('filtrosCategoria');
  var busquedaInput = document.getElementById('busquedaInstrumento');

  var instrumentosData = [
    { nombre: 'Saxofón Alto', marca: 'Yamaha YAS-280', categoria: 'viento', precio: 2850, stock: 'disponible', emoji: '🎷' },
    { nombre: 'Saxofón Tenor', marca: 'Jupiter JTS-700', categoria: 'viento', precio: 3400, stock: 'disponible', emoji: '🎷' },
    { nombre: 'Trompeta', marca: 'Bach TR300H2', categoria: 'viento', precio: 1750, stock: 'disponible', emoji: '🎺' },
    { nombre: 'Clarinete', marca: 'Buffet Crampon B12', categoria: 'viento', precio: 1200, stock: 'agotado', emoji: '🪗' },
    { nombre: 'Flauta Traversa', marca: 'Yamaha YFL-222', categoria: 'viento', precio: 980, stock: 'disponible', emoji: '🎶' },
    { nombre: 'Guitarra Clásica', marca: 'Fender CN-60S', categoria: 'cuerda', precio: 980, stock: 'disponible', emoji: '🎸' },
    { nombre: 'Guitarra Eléctrica', marca: 'Squier Stratocaster', categoria: 'cuerda', precio: 1350, stock: 'disponible', emoji: '🎸' },
    { nombre: 'Violín', marca: 'Mendini MV300', categoria: 'cuerda', precio: 450, stock: 'disponible', emoji: '🎻' },
    { nombre: 'Bajo Eléctrico', marca: 'Ibanez GSR200', categoria: 'cuerda', precio: 1100, stock: 'pedido', emoji: '🎸' },
    { nombre: 'Ukelele', marca: 'Kala KA-C Caoba', categoria: 'cuerda', precio: 320, stock: 'disponible', emoji: '🪕' },
    { nombre: 'Batería Completa', marca: 'Pearl Roadshow RS525', categoria: 'percusion', precio: 3200, stock: 'disponible', emoji: '🥁' },
    { nombre: 'Cajón Peruano', marca: 'Meinl JC50B', categoria: 'percusion', precio: 480, stock: 'disponible', emoji: '🪘' },
    { nombre: 'Congas', marca: 'LP LP201AX', categoria: 'percusion', precio: 1600, stock: 'pedido', emoji: '🪘' },
    { nombre: 'Piano Digital', marca: 'Roland FP-30X', categoria: 'teclado', precio: 4100, stock: 'disponible', emoji: '🎹' },
    { nombre: 'Teclado 61 Teclas', marca: 'Casio CT-S300', categoria: 'teclado', precio: 590, stock: 'disponible', emoji: '🎹' },
    { nombre: 'Sintetizador', marca: 'Korg Minilogue', categoria: 'teclado', precio: 3800, stock: 'agotado', emoji: '🎹' }
  ];

  var badges = {
    disponible: '<span class="badge badge-disponible">Disponible</span>',
    agotado: '<span class="badge badge-agotado">Agotado</span>',
    pedido: '<span class="badge badge-pedido">Por pedido</span>'
  };

  function renderCatalogo(filtroCategoria, busqueda) {
    if (!catalogoContainer) return;
    var items = instrumentosData;
    if (filtroCategoria && filtroCategoria !== 'todas') {
      items = items.filter(function (i) { return i.categoria === filtroCategoria; });
    }
    if (busqueda) {
      var q = busqueda.toLowerCase().trim();
      items = items.filter(function (i) {
        return i.nombre.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q);
      });
    }
    if (items.length === 0) {
      catalogoContainer.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">No se encontraron instrumentos con esos criterios.</div>';
      return;
    }
    var html = '';
    items.forEach(function (item) {
      html += '<div class="tarjeta">';
      html += '<div class="tarjeta-icono">' + item.emoji + '</div>';
      html += '<h3>' + item.nombre + '</h3>';
      html += '<p>' + item.marca + '</p>';
      html += '<p class="precio">S/ ' + item.precio.toLocaleString() + '</p>';
      html += '<div style="margin-top:12px;">' + badges[item.stock] + '</div>';
      html += '</div>';
    });
    catalogoContainer.innerHTML = html;
    catalogoContainer.querySelectorAll('.tarjeta').forEach(function (el, i) {
      el.style.setProperty('--anim-delay', (i * 0.08) + 's');
      el.style.animation = 'fadeInUp 0.5s ease both';
      el.style.animationDelay = (i * 0.08) + 's';
    });
  }

  if (catalogoContainer) {
    renderCatalogo('todas', '');

    if (filtrosContainer) {
      filtrosContainer.querySelectorAll('.btn-filtro').forEach(function (btn) {
        btn.addEventListener('click', function () {
          filtrosContainer.querySelectorAll('.btn-filtro').forEach(function (b) {
            b.classList.remove('activo');
          });
          this.classList.add('activo');
          var cat = this.getAttribute('data-categoria') || 'todas';
          var busq = busquedaInput ? busquedaInput.value : '';
          renderCatalogo(cat, busq);
        });
      });
    }

    if (busquedaInput) {
      var debounceTimer;
      busquedaInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          var cat = filtrosContainer ? (filtrosContainer.querySelector('.btn-filtro.activo')?.getAttribute('data-categoria') || 'todas') : 'todas';
          renderCatalogo(cat, busquedaInput.value);
        }, 300);
      });
    }
  }

  /* =============================================
     6. COUNTER ANIMATION (Nosotros page)
     ============================================= */
  var contadores = document.querySelectorAll('.contador-numero');
  if (contadores.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-target'), 10) || 0;
          var duracion = 2000;
          var inicio = performance.now();

          function actualizar(now) {
            var progreso = Math.min((now - inicio) / duracion, 1);
            var valor = Math.floor(progreso * target);
            el.textContent = valor.toLocaleString();
            if (progreso < 1) {
              requestAnimationFrame(actualizar);
            } else {
              el.textContent = target.toLocaleString();
            }
          }

          requestAnimationFrame(actualizar);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    contadores.forEach(function (c) { counterObserver.observe(c); });
  }

  /* =============================================
     7. PARALLAX EFFECT ON HERO (desktop only)
     ============================================= */
  var hero = document.querySelector('.hero');
  if (hero && window.innerWidth > 900) {
    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY;
      if (scrollY < hero.offsetHeight) {
        hero.style.backgroundPositionY = scrollY * 0.5 + 'px';
      }
    }, { passive: true });
  }

  /* ==============
   boton hacia arriba:
   ===============*/

   const botonSubir = document.getElementById("btn-subir");

window.onscroll = function() {
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        botonSubir.style.display = "block";
    } else {
        botonSubir.style.display = "none";
    }
};

botonSubir.addEventListener("click", function() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
});


/* ==============
   boton modo dia/noche:
   ===============*/

  
const btn = document.getElementById('toggle-theme');

if (btn) { // Validamos que el botón exista en la página actual
    btn.addEventListener('click', (e) => {
        e.preventDefault(); 
        document.body.classList.toggle('light-mode');
        
        // Cambia el texto basándose únicamente en si la clase está activa
        if (document.body.classList.contains('light-mode')) {
            btn.textContent = "🌙 Modo Noche";
        } else {
            btn.textContent = "☀️ Modo Día";
        }
    });
}

    /* =============================================
   MENÚ DESPLEGABLE PARA CELULARES (CORREGIDO)
   ============================================= */
const enlaceInstrumentos = document.querySelector('.menu-desplegable > a');
const listaCategorias = document.querySelector('.dropdown-contenido');

// Revisa si estamos en un dispositivo móvil (pantalla menor o igual a 900px)
if (enlaceInstrumentos && window.innerWidth <= 900) {
    enlaceInstrumentos.addEventListener('click', function(e) {
        e.preventDefault(); // Detiene el viaje inmediato a instrumentos.html
        
        // Verificamos si la lista está oculta analizando su opacidad actual
        if (listaCategorias.style.opacity === '1') {
            // Si ya estaba abierta, la cerramos por completo
            listaCategorias.style.display = 'none';
            listaCategorias.style.opacity = '0';
            listaCategorias.style.pointerEvents = 'none';
        } else {
            // Si estaba oculta, la mostramos en formato columna vertical y la hacemos visible
            listaCategorias.style.display = 'flex';
            listaCategorias.style.flexDirection = 'column';
            listaCategorias.style.opacity = '1';
            listaCategorias.style.pointerEvents = 'auto';
        }
    });
}

});