/* Sistema de Ventanas Flotantes (Modales) */

var RiveraSound = RiveraSound || {};

// Módulo encargado de gestionar las vistas de ventanas modales
RiveraSound.modal = {

  /**
   * abrir: Muestra el overlay modal y le inyecta el contenido indicado.
   * @param {string|HTMLElement} htmlContent - Contenido HTML plano en string o elemento DOM.
   * @param {string} titulo - Título opcional que aparecerá en la parte superior del modal.
   */
  abrir(htmlContent, titulo) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (!overlay || !content) return; // Evita errores de ejecución si no existen en el HTML

    content.innerHTML = ''; // Resetea el contenido interno anterior
    
    // Si se especificó un título, creamos un elemento <h3> y lo añadimos
    if (titulo) {
      content.appendChild(RiveraSound.utils.crearElemento('h3', { 
        className: 'modal-titulo', 
        textContent: titulo 
      }));
    }
    
    // Inyectamos el contenido según su formato (Texto HTML o Elemento del DOM)
    if (typeof htmlContent === 'string') {
      content.insertAdjacentHTML('beforeend', htmlContent); // Inyección de string HTML
    } else if (htmlContent instanceof HTMLElement) {
      content.appendChild(htmlContent); // Inyección directa de nodo del DOM
    }
    
    overlay.classList.add('activo'); // Muestra la ventana flotante agregando la clase activa
    document.body.style.overflow = 'hidden'; // Bloquea el scroll del fondo para no perder la posición
  },

  /**
   * cerrar: Oculta la ventana modal y restablece el scroll de la página.
   */
  cerrar() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;
    
    overlay.classList.remove('activo'); // Oculta el modal removiendo la clase activa
    document.body.style.overflow = '';   // Reactiva el scroll de la página principal
  },

  /**
   * init: Bindea los eventos interactivos de cierre (clic fuera del modal y tecla Escape)
   */
  init() {
    const overlay = document.getElementById('modalOverlay');
    if (!overlay) return;

    // 1. Cerrar al hacer clic en el fondo gris (overlay) fuera del recuadro blanco de contenido
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        RiveraSound.modal.cerrar();
      }
    });

    // 2. Cerrar inmediatamente al presionar la tecla física 'Escape' del teclado
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        RiveraSound.modal.cerrar();
      }
    });

    // 3. Cerrar al hacer clic en el botón X de cierre
    const btnCerrar = document.getElementById('modalCerrar');
    if (btnCerrar) {
      btnCerrar.addEventListener('click', () => {
        RiveraSound.modal.cerrar();
      });
    }
  }
};
