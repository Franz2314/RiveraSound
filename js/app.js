/* ============================================ app.js - Punto de entrada principal de RiveraSound ============================================ */

/**
 * RiveraSound - Inicialización principal
 * Se ejecuta cuando el DOM está completamente cargado.
 * Orden de inicialización: menú → modal → carrito → router
 * El router es el último porque gestiona la navegación y las vistas dinámicas.
 */
document.addEventListener('DOMContentLoaded', function () {
  RiveraSound.menu.init();
  RiveraSound.modal.init();
  RiveraSound.carrito.init();
  RiveraSound.theme.init();
  RiveraSound.router.init();
});
