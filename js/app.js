/* Punto de Entrada Principal de la Aplicación */

// Escuchamos el evento 'DOMContentLoaded' para asegurarnos de que el HTML
// está listo y los elementos del DOM existen antes de ejecutar el JavaScript.
document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Inicializa el comportamiento del menú hamburguesa y navegación responsive
  RiveraSound.menu.init();
  
  // 2. Registra los escuchadores globales para abrir y cerrar ventanas modales
  RiveraSound.modal.init();
  
  // 3. Carga el carrito desde localStorage y sincroniza el badge numérico del header
  RiveraSound.carrito.init();
  
  // 4. Restaura la preferencia de tema (claro/oscuro) y bindea el botón de tema
  RiveraSound.theme.init();
  
  // 5. Arranca el enrutador SPA: lee el hash (#) actual en la barra de direcciones
  // e inyecta la vista dinámica correspondiente en el contenedor principal.
  RiveraSound.router.init();
  
});
