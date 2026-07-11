/* ============================================ menu.js - Menú de navegación responsive con hamburguesa y dropdown ============================================ */

var RiveraSound = RiveraSound || {};

/**
 * RiveraSound.menu - Controla el menú de navegación responsive.
 * En móvil (≤600px): muestra un botón hamburguesa que despliega/oculta
 * el menú como panel deslizante. En tablets (≤900px): los dropdowns
 * del menú se abren con click en lugar de hover.
 * También cierra el menú al hacer click fuera del header.
 */
RiveraSound.menu = {
  /** init - Bindea eventos del botón hamburguesa, enlaces, botones y click fuera del menú. */
  init: function () {
    var btn = document.getElementById('btnMenu');
    var nav = document.getElementById('menuNav');
    if (!btn || !nav) return;

    /* --- Botón hamburguesa: toggle del menú visible/oculto y actualización del aria-label --- */
    btn.addEventListener('click', function () {
      this.classList.toggle('activo');
      nav.classList.toggle('visible');
      var abierto = nav.classList.contains('visible');
      this.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      if (!abierto) {
        document.querySelectorAll('.dropdown-contenido').forEach(function (d) {
          d.classList.remove('mostrar');
        });
      }
    });

    /* --- Enlaces del menú: navegación + dropdown táctil en tablets --- */
    document.querySelectorAll('#menuNav a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var dd = link.closest('.menu-desplegable');
        /* En tablets (≤900px): el dropdown padre abre/cierra su contenido con click */
        if (dd && !link.closest('.dropdown-contenido') && window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();
          var contenido = dd.querySelector('.dropdown-contenido');
          if (contenido) {
            contenido.classList.toggle('mostrar');
          }
          return;
        }
        /* Enlaces normales o dentro de dropdown: cierra el menú después de navegar */
        if (link.closest('.dropdown-contenido') || !link.closest('.menu-desplegable')) {
          nav.classList.remove('visible');
          btn.classList.remove('activo');
          btn.setAttribute('aria-label', 'Abrir menú');
          document.querySelectorAll('.dropdown-contenido').forEach(function (d) {
            d.classList.remove('mostrar');
          });
        }
      });
    });

    /* --- Botones dentro del menú (ej: toggle theme): cierran el menú al hacer click --- */
    document.querySelectorAll('#menuNav button').forEach(function (b) {
      b.addEventListener('click', function () {
        nav.classList.remove('visible');
        btn.classList.remove('activo');
        btn.setAttribute('aria-label', 'Abrir menú');
        document.querySelectorAll('.dropdown-contenido').forEach(function (d) {
          d.classList.remove('mostrar');
        });
      });
    });

    /* --- Click fuera del header: cierra el menú si está abierto --- */
    document.addEventListener('click', function (e) {
      if (!e.target.closest('header') && nav.classList.contains('visible')) {
        nav.classList.remove('visible');
        btn.classList.remove('activo');
        btn.setAttribute('aria-label', 'Abrir menú');
        document.querySelectorAll('.dropdown-contenido').forEach(function (d) {
          d.classList.remove('mostrar');
        });
      }
    });
  }
};
