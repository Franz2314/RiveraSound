/* ============================================ modal.js - Sistema de modales ============================================ */

var RiveraSound = RiveraSound || {};

/**
 * RiveraSound.modal - Control de ventanas modales superpuestas (overlay).
 * Permite abrir modales con contenido HTML o elementos DOM, cerrarlos con
 * click fuera del modal o con la tecla Escape.
 */
RiveraSound.modal = {

  /** abrir - Muestra el overlay modal con el contenido especificado.
   *  @param {string|HTMLElement} htmlContent - Contenido HTML (string) o elemento DOM a mostrar.
   *  @param {string} [titulo] - Título opcional que se muestra en un <h3> dentro del modal.
   */
  abrir: function (htmlContent, titulo) {
    var overlay = document.getElementById('modalOverlay');
    var content = document.getElementById('modalContent');
    if (!overlay || !content) return;

    content.innerHTML = '';
    if (titulo) {
      content.appendChild(RiveraSound.utils.crearElemento('h3', { className: 'modal-titulo', textContent: titulo }));
    }
    if (typeof htmlContent === 'string') {
      content.insertAdjacentHTML('beforeend', htmlContent); // Inserta HTML string
    } else if (htmlContent instanceof HTMLElement) {
      content.appendChild(htmlContent);                     // Adjunta elemento DOM
    }
    overlay.classList.add('activo');
    document.body.style.overflow = 'hidden'; // Previene scroll del body mientras el modal está abierto
  },

  /** cerrar - Oculta el overlay modal y restaura el scroll del body. */
  cerrar: function () {
    var overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    overlay.classList.remove('activo');
    document.body.style.overflow = '';
  },

  /** init - Bindea eventos: click fuera del modal (en el overlay) lo cierra, y tecla Escape lo cierra. */
  init: function () {
    var overlay = document.getElementById('modalOverlay');
    if (!overlay) return;

    /* --- Click en el overlay (fuera del contenido) cierra el modal --- */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) RiveraSound.modal.cerrar();
    });

    /* --- Tecla Escape cierra el modal --- */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') RiveraSound.modal.cerrar();
    });
  }
};
