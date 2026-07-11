/* ============================================ theme.js - Modo claro/oscuro y botón volver arriba ============================================ */

var RiveraSound = RiveraSound || {};

/**
 * RiveraSound.theme - Controla el cambio entre modo claro y oscuro,
 * y el botón flotante "Volver arriba".
 * El tema elegido se persiste en localStorage (riverasound_theme).
 */
RiveraSound.theme = {
  /** init - Inicializa ambos subsistemas: toggle de tema y botón scroll top. */
  init: function () {
    this.initToggle();
    this.initScrollTop();
  },

  /** initToggle - Configura el botón de cambio de tema claro/oscuro.
   *  Si el usuario ya eligió 'light' previamente, lo restaura al cargar la página.
   *  Persiste la preferencia en localStorage.
   */
  initToggle: function () {
    var btn = document.getElementById('toggle-theme');
    if (!btn) return;

    /* --- Restaurar tema guardado --- */
    try {
      if (localStorage.getItem('riverasound_theme') === 'light') {
        document.body.classList.add('light-mode');
        btn.textContent = '🌙 Modo Noche';
      }
    } catch (_) {}

    /* --- Click: alterna entre claro y oscuro --- */
    btn.addEventListener('click', function () {
      document.body.classList.toggle('light-mode');
      var esClaro = document.body.classList.contains('light-mode');
      btn.textContent = esClaro ? '🌙 Modo Noche' : '☀️ Modo Día';
      try { localStorage.setItem('riverasound_theme', esClaro ? 'light' : 'dark'); } catch (_) {}
    });
  },

  /** initScrollTop - Muestra/oculta el botón flotante "Volver arriba"
   *  según la posición del scroll (>300px). Al hacer click, desplaza
   *  suavemente al tope de la página.
   */
  initScrollTop: function () {
    var btn = document.getElementById('btn-subir');
    if (!btn) return;

    /* --- Mostrar botón al hacer scroll hacia abajo --- */
    window.addEventListener('scroll', function () {
      if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    /* --- Click: scroll suave al inicio --- */
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};
