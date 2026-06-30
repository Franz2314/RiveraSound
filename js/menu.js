var RiveraSound = RiveraSound || {};

RiveraSound.menu = {
  init: function () {
    var btn = document.getElementById('btnMenu');
    var nav = document.getElementById('menuNav');
    if (!btn || !nav) return;

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

    document.querySelectorAll('#menuNav a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var dd = link.closest('.menu-desplegable');
        if (dd && !link.closest('.dropdown-contenido') && window.innerWidth <= 900) {
          e.preventDefault();
          e.stopPropagation();
          var contenido = dd.querySelector('.dropdown-contenido');
          if (contenido) {
            contenido.classList.toggle('mostrar');
          }
          return;
        }
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
