/* ============================================ utils.js - Utilidades generales, animaciones reveal y contadores ============================================ */

var RiveraSound = RiveraSound || {};

/* ============ RIVERSOUND.UTILS - Funciones auxiliares ============ */

/**
 * RiveraSound.utils - Utilidades generales para todo el frontend.
 * Incluye notificaciones, debounce, selectores abreviados, creador de elementos DOM y formateo de precios.
 */
RiveraSound.utils = {

  /** notificar - Muestra una notificación toast flotante que desaparece tras 3 segundos.
   *  @param {string} mensaje - Texto a mostrar.
   *  @param {string} [tipo='info'] - Clase CSS: 'exito', 'error', 'info', 'warning'.
   */
  notificar: function (mensaje, tipo) {
    tipo = tipo || 'info';
    var n = document.createElement('div');
    n.className = 'notificacion ' + tipo;
    n.textContent = mensaje;
    document.body.appendChild(n);
    setTimeout(function () {
      if (n.parentNode) n.parentNode.removeChild(n);
    }, 3000);
  },

  /** debounce - Limita la frecuencia de ejecución de una función (útil para búsqueda en tiempo real, resize, etc.).
   *  @param {function} fn - Función a ejecutar.
   *  @param {number} [ms=300] - Milisegundos de espera.
   *  @returns {function} - Función con debounce.
   */
  debounce: function (fn, ms) {
    var timer;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(ctx, args); }, ms || 300);
    };
  },

  /** $ - Atajo para document.querySelector. */
  $: function (sel, ctx) { return (ctx || document).querySelector(sel); },

  /** $$ - Atajo para document.querySelectorAll. */
  $$: function (sel, ctx) { return (ctx || document).querySelectorAll(sel); },

  /** crearElemento - Crea un elemento DOM con atributos e hijos de forma declarativa.
   *  @param {string} tag - Etiqueta HTML (ej: 'div', 'h3').
   *  @param {object} [attrs] - Atributos del elemento (className, textContent, innerHTML, etc.).
   *  @param {Array} [hijos] - Array de nodos hijos (strings o HTMLElements).
   *  @returns {HTMLElement}
   */
  crearElemento: function (tag, attrs, hijos) {
    var el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === 'className') el.className = attrs[k];
        else if (k === 'textContent') el.textContent = attrs[k];
        else if (k === 'innerHTML') el.innerHTML = attrs[k];
        else el.setAttribute(k, attrs[k]);
      });
    }
    if (hijos) {
      hijos.forEach(function (h) {
        if (typeof h === 'string') el.appendChild(document.createTextNode(h));
        else if (h) el.appendChild(h);
      });
    }
    return el;
  },

  /** formatearPrecio - Formatea un número como precio en soles peruanos (S/ 1,234).
   *  @param {number} num - Valor numérico.
   *  @returns {string}
   */
  formatearPrecio: function (num) {
    return 'S/ ' + num.toLocaleString('es-PE');
  }
};

/* ============ RIVERSOUND.REVEAL - Animaciones de aparición al hacer scroll ============ */

/**
 * RiveraSound.reveal - Activa animaciones de entrada (fade-in/deslizamiento)
 * cuando los elementos con clase .reveal, .reveal-left o .reveal-right entran al viewport.
 * Usa IntersectionObserver para eficiencia. Si no hay soporte, los muestra todos de una vez.
 */
RiveraSound.reveal = {
  iniciar: function () {
    var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (els.length > 0 && 'IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');  // Activa la animación CSS
            obs.unobserve(e.target);             // Deja de observar para mejorar performance
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }); // Aparece cuando el 15% del elemento es visible
      els.forEach(function (el) { obs.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add('visible'); }); // Fallback: muestra todo si no hay soporte
    }
  }
};

/* ============ RIVERSOUND.CONTADORES - Animación de números incrementales ============ */

/**
 * RiveraSound.contadores - Anima elementos con clase .contador-numero
 * haciendo que el número aumente desde 0 hasta su valor data-target cuando son visibles.
 * La animación dura 2 segundos.
 */
RiveraSound.contadores = {
  iniciar: function () {
    var els = document.querySelectorAll('.contador-numero');
    if (els.length === 0 || !('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          var target = parseInt(el.getAttribute('data-target'), 10) || 0;
          var start = performance.now();
          function tick(now) {
            var p = Math.min((now - start) / 2000, 1); // Progreso de 0 a 1 en 2 segundos
            el.textContent = Math.floor(p * target).toLocaleString();
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target.toLocaleString(); // Valor final exacto
          }
          requestAnimationFrame(tick);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.5 }); // El 50% del elemento debe estar visible para iniciar
    els.forEach(function (el) { obs.observe(el); });
  }
};
