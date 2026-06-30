/* ============================================ validaciones.js - Validación de formularios del lado del cliente ============================================ */

var RiveraSound = RiveraSound || {};

/**
 * RiveraSound.validaciones - Sistema de validación de formularios en tiempo real.
 * Cada campo se valida al perder el foco (blur) y al escribir (input) si ya fue validado.
 * Las reglas de validación están definidas en el objeto `reglas` y se asocian por name o id del input.
 */
RiveraSound.validaciones = {

  /* ============ REGLAS DE VALIDACIÓN ============ */
  /** Cada función recibe el valor del campo y retorna un string de error (vacío si es válido). */
  reglas: {
    nombre: function (v) { return v.trim().length >= 2 ? '' : 'Mínimo 2 caracteres.'; },
    apellido: function (v) { return v.trim().length >= 2 ? '' : 'Mínimo 2 caracteres.'; },
    correo: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Correo inválido.'; },
    telefono: function (v) {
      if (!v.trim()) return '';                           // Teléfono es opcional
      return /^[0-9]{9}$/.test(v.trim()) ? '' : 'Debe tener 9 dígitos.'; // Formato peruano: 9 dígitos exactos
    },
    consulta: function (v) { return v ? '' : 'Selecciona una opción.'; },
    mensaje: function (v) { return v.trim().length >= 10 ? '' : 'Mínimo 10 caracteres.'; },
    password: function (v) { return v.length >= 6 ? '' : 'Mínimo 6 caracteres.'; }
  },

  /** validarCampo - Valida un campo individual y actualiza su UI (clases error/success y mensaje).
   *  @param {HTMLElement} input - Elemento input, select o textarea a validar.
   *  @returns {boolean} - true si es válido, false si hay error.
   */
  validarCampo: function (input) {
    var grupo = input.closest('.form-grupo');       // Contenedor del campo con clases de estilo
    if (!grupo) return true;
    var errEl = grupo.querySelector('.error-msg');  // Elemento donde se muestra el mensaje de error
    var fn = this.reglas[input.name] || this.reglas[input.id]; // Busca la regla por name o id del input
    if (!fn) return true;
    var error = fn(input.value);
    grupo.classList.remove('error', 'success');     // Limpia estados previos
    if (error) {
      grupo.classList.add('error');                 // Marca el grupo en rojo
      if (errEl) errEl.textContent = error;         // Muestra el mensaje de error
      return false;
    }
    grupo.classList.add('success');                 // Marca el grupo en verde
    return true;
  },

  /** initFormulario - Inicializa la validación en vivo para un formulario.
   *  Bindea blur (validar al salir del campo) e input (re-validar si ya tiene estado error/success).
   *  @param {string} formId - ID del formulario a inicializar.
   *  @returns {HTMLElement|null} - El formulario o null si no se encuentra.
   */
  initFormulario: function (formId) {
    var form = document.getElementById(formId);
    if (!form) return;

    var self = this;
    form.querySelectorAll('input, select, textarea').forEach(function (input) {
      input.addEventListener('blur', function () { self.validarCampo(this); });           // Valida al salir del campo
      input.addEventListener('input', function () {
        var g = this.closest('.form-grupo');
        if (g && (g.classList.contains('error') || g.classList.contains('success'))) {    // Solo re-valida si ya se había validado antes
          self.validarCampo(this);
        }
      });
    });

    return form;
  }
};
