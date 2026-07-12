/* Módulos de Utilidades, Animaciones y Contadores */

// Declaramos el objeto global RiveraSound si no existe para evitar sobreescribir datos
var RiveraSound = RiveraSound || {};

/* Riversound.utils - funciones auxiliares del dom */
RiveraSound.utils = {

  /**
   * notificar: Muestra un aviso flotante (Toast) en la pantalla por 3 segundos.
   * @param {string} mensaje - El texto que se va a mostrar.
   * @param {string} tipo - El tipo de alerta ('exito', 'error', 'info').
   */
  notificar(mensaje, tipo = 'info') {
    // Creamos dinámicamente un elemento <div> en el DOM
    const n = document.createElement('div');
    
    // Le asignamos sus clases de estilo CSS
    n.className = `notificacion ${tipo}`;
    n.textContent = mensaje;
    
    // Lo agregamos directamente al cuerpo del documento (body)
    document.body.appendChild(n);
    
    // Programamos su remoción automática después de 3000ms (3 segundos)
    setTimeout(() => {
      if (n.parentNode) {
        n.parentNode.removeChild(n); // Lo eliminamos del DOM de manera segura
      }
    }, 3000);
  },

  /**
   * debounce: Retrasa la ejecución de una función hasta que haya pasado un tiempo.
   * Evita sobrecargar la web con ejecuciones múltiples en eventos rápidos (como escribir en búsquedas).
   * @param {function} fn - La función que queremos retrasar.
   * @param {number} ms - Milisegundos de espera (por defecto 300ms).
   * @returns {function} - La función envuelta lista para su uso.
   */
  debounce(fn, ms = 300) {
    let timer; // Almacenará la referencia del temporizador en curso
    return function (...args) {
      const ctx = this;
      clearTimeout(timer); // Cancelamos el temporizador anterior si se vuelve a presionar una tecla rápido
      timer = setTimeout(() => {
        fn.apply(ctx, args); // Ejecuta la función original una vez transcurrido el tiempo
      }, ms);
    };
  },

  /**
   * $: Atajo para seleccionar un único elemento del DOM (sustituye a document.querySelector).
   * @param {string} sel - Selector CSS (ej: '#id', '.clase').
   * @param {HTMLElement} ctx - Contexto de búsqueda opcional (por defecto document).
   * @returns {HTMLElement|null}
   */
  $(sel, ctx = document) {
    return ctx.querySelector(sel);
  },

  /**
   * $$: Atajo para seleccionar múltiples elementos del DOM (document.querySelectorAll).
   * @param {string} sel - Selector CSS.
   * @param {HTMLElement} ctx - Contexto de búsqueda opcional.
   * @returns {NodeList}
   */
  $$(sel, ctx = document) {
    return ctx.querySelectorAll(sel);
  },

  /**
   * crearElemento: Crea y retorna un nodo HTML con atributos y nodos hijos de forma sencilla.
   * @param {string} tag - Nombre de la etiqueta HTML (ej: 'div', 'h3').
   * @param {object} attrs - Atributos opcionales (className, textContent, style, etc.).
   * @param {Array} hijos - Array de nodos hijos (pueden ser strings o elementos DOM).
   * @returns {HTMLElement}
   */
  crearElemento(tag, attrs, hijos) {
    const el = document.createElement(tag);
    
    // Si se especificaron atributos, los recorremos y asignamos al elemento
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        if (k === 'className') {
          el.className = attrs[k]; // Asignación directa de clase
        } else if (k === 'textContent') {
          el.textContent = attrs[k]; // Asignación directa de texto plano
        } else if (k === 'innerHTML') {
          el.innerHTML = attrs[k]; // Asignación directa de contenido HTML
        } else {
          el.setAttribute(k, attrs[k]); // Atributos estándar de etiqueta
        }
      });
    }
    
    // Si hay elementos o textos hijos, los agregamos en orden
    if (hijos) {
      hijos.forEach((h) => {
        if (typeof h === 'string') {
          el.appendChild(document.createTextNode(h)); // Inyección de texto plano
        } else if (h) {
          el.appendChild(h); // Inyección de nodo HTML hijo
        }
      });
    }
    
    return el;
  },

  /**
   * formatearPrecio: Da formato monetario peruano a un número (ej: 2850 -> S/ 2,850.00).
   * @param {number} num - El valor numérico.
   * @returns {string}
   */
  formatearPrecio(num) {
    return 'S/ ' + num.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
};

/* Riversound.reveal - animaciones de scroll */
RiveraSound.reveal = {
  /**
   * iniciar: Busca elementos con la clase .reveal y los anima cuando entran en la pantalla.
   * Utiliza la API moderna IntersectionObserver. Si no es compatible, muestra las tarjetas de golpe.
   */
  iniciar() {
    const elementos = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    // Si el navegador soporta IntersectionObserver, observamos la visibilidad de los elementos
    if (elementos.length > 0 && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible'); // Activa la animación CSS (.visible)
            observer.unobserve(e.target);      // Deja de observar para mejorar el rendimiento del navegador
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }); // Comienza la animación al ver el 15% del elemento
      
      elementos.forEach((el) => observer.observe(el));
    } else {
      // Caso de respaldo (fallback) para navegadores antiguos: los mostramos inmediatamente
      elementos.forEach((el) => el.classList.add('visible'));
    }
  }
};

/* Riversound.contadores - números animados incrementales */
RiveraSound.contadores = {
  /**
   * iniciar: Anima textos con la clase .contador-numero para que suban desde 0
   * hasta el valor especificado en el atributo 'data-target'.
   */
  iniciar() {
    const contadores = document.querySelectorAll('.contador-numero');
    if (contadores.length === 0 || !('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target;
          const target = parseInt(el.getAttribute('data-target'), 10) || 0;
          const startTime = performance.now();
          const duracion = 2000; // Duración de la animación (2 segundos)
          
          function animar(currentTime) {
            const progreso = Math.min((currentTime - startTime) / duracion, 1);
            el.textContent = Math.floor(progreso * target).toLocaleString();
            
            if (progreso < 1) {
              requestAnimationFrame(animar); // Siguiente frame de animación
            } else {
              el.textContent = target.toLocaleString(); // Asegura el valor exacto final
            }
          }
          
          requestAnimationFrame(animar);
          observer.unobserve(el); // Deja de observar tras finalizar la animación
        }
      });
    }, { threshold: 0.5 }); // Inicia al ser visible el 50% del contador
    
    contadores.forEach((el) => observer.observe(el));
  }
};
