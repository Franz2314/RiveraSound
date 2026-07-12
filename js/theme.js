/* Control del Botón Volver Arriba */

var RiveraSound = RiveraSound || {};

// Módulo encargado de gestionar el atajo de scroll
RiveraSound.theme = {
  
  /**
   * init: Inicializa el subsistema del botón flotante.
   */
  init() {
    this.initScrollTop();
  },

  /**
   * initScrollTop: Muestra y oculta el botón "Volver arriba" al hacer scroll
   */
  initScrollTop() {
    const btn = document.getElementById('btn-subir');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      const scrollActual = document.body.scrollTop || document.documentElement.scrollTop;
      
      if (scrollActual > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
};
