/* Control del Menú de Navegación Responsive y Dropdowns */

var RiveraSound = RiveraSound || {};

// Módulo encargado de gestionar el menú principal y barra de navegación
RiveraSound.menu = {
  
  /**
   * init: Configura los escuchadores de eventos para la interacción del menú
   */
  init() {
    const btn = document.getElementById('btnMenu');
    const nav = document.getElementById('menuNav');
    if (!btn || !nav) return; // Validación preventiva para evitar errores si no existen los elementos

    // 1. Botón hamburguesa: Alterna clases y actualiza accesibilidad (aria-label) al hacer click
    btn.addEventListener('click', function () {
      this.classList.toggle('activo'); // Alterna clase .activo en el botón (cambia aspecto de la hamburguesa)
      nav.classList.toggle('visible'); // Muestra/oculta el menú nav en la pantalla móvil
      
      const abierto = nav.classList.contains('visible');
      this.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
      
      // Si cerramos el menú, también colapsamos cualquier submenú dropdown abierto
      if (!abierto) {
        document.querySelectorAll('.dropdown-contenido').forEach((d) => {
          d.classList.remove('mostrar');
        });
      }
    });

    // 2. Enlaces del menú: Navegación y gestión de submenús táctiles en tabletas
    document.querySelectorAll('#menuNav a').forEach((link) => {
      link.addEventListener('click', (e) => {
        const dd = link.closest('.menu-desplegable');
        
        // En pantallas tipo tablet (ancho <= 900px): El primer clic en el enlace padre 
        // despliega su dropdown en lugar de navegar, simulando el comportamiento hover de PC
        if (dd && !link.closest('.dropdown-contenido') && window.innerWidth <= 900) {
          e.preventDefault();  // Detiene la navegación automática del enlace
          e.stopPropagation(); // Evita que el clic se propague y cierre otros menús
          
          const contenido = dd.querySelector('.dropdown-contenido');
          if (contenido) {
            contenido.classList.toggle('mostrar'); // Muestra/oculta las subcategorías
          }
          return;
        }
        
        // Al hacer clic en un enlace normal o dentro del dropdown, cerramos el panel móvil automáticamente
        if (link.closest('.dropdown-contenido') || !link.closest('.menu-desplegable')) {
          nav.classList.remove('visible');
          btn.classList.remove('activo');
          btn.setAttribute('aria-label', 'Abrir menú');
          
          // Limpiamos los submenús abiertos
          document.querySelectorAll('.dropdown-contenido').forEach((d) => {
            d.classList.remove('mostrar');
          });
        }
      });
    });

    // 3. Botones dentro de la navegación (ej: botón Modo Día/Noche): 
    // Cierran el menú móvil al hacer click
    document.querySelectorAll('#menuNav button').forEach((b) => {
      b.addEventListener('click', () => {
        nav.classList.remove('visible');
        btn.classList.remove('activo');
        btn.setAttribute('aria-label', 'Abrir menú');
        
        document.querySelectorAll('.dropdown-contenido').forEach((d) => {
          d.classList.remove('mostrar');
        });
      });
    });

    // 4. Cierre por fuera: Si se hace clic en cualquier parte fuera de la cabecera,
    // cerramos la barra móvil automáticamente para mejor facilidad de uso
    document.addEventListener('click', (e) => {
      if (!e.target.closest('header') && nav.classList.contains('visible')) {
        nav.classList.remove('visible');
        btn.classList.remove('activo');
        btn.setAttribute('aria-label', 'Abrir menú');
        
        document.querySelectorAll('.dropdown-contenido').forEach((d) => {
          d.classList.remove('mostrar');
        });
      }
    });
  }
};
