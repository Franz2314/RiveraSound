/* Control del Modo Día y Botón Volver Arriba */

var RiveraSound = RiveraSound || {};

RiveraSound.theme = {

  init() {
    this.initModoDia();
    this.initScrollTop();
  },

  /* Alterna entre tema oscuro (default) y modo día claro */
  initModoDia() {
    const btn = document.getElementById('modoNocheBtn');
    const html = document.documentElement;
    if (!btn) return;

    /* Restaura preferencia guardada en localStorage */
    const modoGuardado = localStorage.getItem('riverasound_modo_dia');
    if (modoGuardado === 'true') {
      html.classList.add('modo-dia');
      btn.textContent = '☀️';  /* Sol = modo día activo */
      btn.setAttribute('aria-label', 'Modo día activo');
    }

    /* Al hacer clic cambia el tema y el ícono */
    btn.addEventListener('click', () => {
      const activo = html.classList.toggle('modo-dia');
      btn.textContent = activo ? '☀️' : '🌙';
      btn.setAttribute('aria-label', activo ? 'Modo día activo' : 'Modo oscuro');
      localStorage.setItem('riverasound_modo_dia', activo);
    });
  },

  /* Muestra/oculta botón para subir al inicio al hacer scroll */
  initScrollTop() {
    const btn = document.getElementById('btn-subir');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      const scrollActual = document.body.scrollTop || document.documentElement.scrollTop;
      btn.classList.toggle('visible', scrollActual > 300);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
};