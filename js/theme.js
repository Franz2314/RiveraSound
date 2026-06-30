var RiveraSound = RiveraSound || {};

RiveraSound.theme = {
  init: function () {
    this.initToggle();
    this.initScrollTop();
  },

  initToggle: function () {
    var btn = document.getElementById('toggle-theme');
    if (!btn) return;

    try {
      if (localStorage.getItem('riverasound_theme') === 'light') {
        document.body.classList.add('light-mode');
        btn.textContent = '🌙 Modo Noche';
      }
    } catch (_) {}

    btn.addEventListener('click', function () {
      document.body.classList.toggle('light-mode');
      var esClaro = document.body.classList.contains('light-mode');
      btn.textContent = esClaro ? '🌙 Modo Noche' : '☀️ Modo Día';
      try { localStorage.setItem('riverasound_theme', esClaro ? 'light' : 'dark'); } catch (_) {}
    });
  },

  initScrollTop: function () {
    var btn = document.getElementById('btn-subir');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};
