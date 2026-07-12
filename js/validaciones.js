/* Validación de Formularios en Tiempo Real */

var RiveraSound = RiveraSound || {};

// Objeto principal de validación de campos de formulario
RiveraSound.validaciones = {

  /* Reglas de validación */
  // Define una función de comprobación para cada campo según su atributo 'name' o 'id'
  // Si pasa la validación retorna un string vacío (''), de lo contrario retorna el mensaje de error.
  reglas: {
    nombre(v) {
      return v.trim().length >= 2 ? '' : 'El nombre debe tener al menos 2 caracteres.';
    },
    apellido(v) {
      return v.trim().length >= 2 ? '' : 'El apellido debe tener al menos 2 caracteres.';
    },
    correo(v) {
      // Expresión regular estándar para verificar el formato de correos
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regexCorreo.test(v.trim()) ? '' : 'Ingresa una dirección de correo válida.';
    },
    telefono(v) {
      if (!v.trim()) return ''; // El teléfono es un campo opcional (puede estar vacío)
      // Expresión regular para obligar a 9 dígitos exactos en Perú (formato de celular)
      const regexFono = /^[0-9]{9}$/;
      return regexFono.test(v.trim()) ? '' : 'El teléfono debe contener exactamente 9 números.';
    },
    consulta(v) {
      return v ? '' : 'Por favor, selecciona una opción.';
    },
    mensaje(v) {
      return v.trim().length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres.';
    },
    password(v) {
      return v.length >= 6 ? '' : 'La contraseña debe contener al menos 6 caracteres.';
    },
    newsletterCorreo(v) {
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regexCorreo.test(v.trim()) ? '' : 'Ingresa un correo válido.';
    },
    importNombre(v) {
      return v.trim().length >= 2 ? '' : 'El nombre debe tener al menos 2 caracteres.';
    },
    importCorreo(v) {
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regexCorreo.test(v.trim()) ? '' : 'Ingresa un correo válido.';
    },
    importInstrumento(v) {
      return v.trim().length >= 4 ? '' : 'Especifica el instrumento (mínimo 4 caracteres).';
    },
    importPresupuesto(v) {
      const p = parseFloat(v);
      return (!isNaN(p) && p >= 100) ? '' : 'El presupuesto mínimo es de S/. 100.';
    },
    importDetalles(v) {
      return v.trim().length >= 10 ? '' : 'Describe los detalles (mínimo 10 caracteres).';
    },
    perfilTelefono(v) {
      if (!v.trim()) return '';
      const regexFono = /^[0-9]{9}$/;
      return regexFono.test(v.trim()) ? '' : 'Debe tener exactamente 9 números.';
    },
    perfilDireccion(v) {
      if (!v.trim()) return '';
      return v.trim().length >= 5 ? '' : 'Ingresa una dirección válida (mínimo 5 caracteres).';
    },
    perfilCiudad(v) {
      if (!v.trim()) return '';
      return v.trim().length >= 3 ? '' : 'La ciudad debe tener al menos 3 caracteres.';
    }
  },

  /**
   * validarCampo: Comprueba las reglas de un campo de formulario individual
   * y actualiza su diseño visual en la pantalla para indicar validez o error.
   * @param {HTMLElement} input - El input, textarea o select a validar.
   * @returns {boolean} - true si es válido, false si contiene algún error.
   */
  validarCampo(input) {
    // Buscamos el contenedor padre del input con la clase '.form-grupo'
    const grupo = input.closest('.form-grupo');
    if (!grupo) return true;
    
    // Obtenemos el elemento donde se pintará el texto del mensaje de error
    const errEl = grupo.querySelector('.error-msg');
    
    // Obtenemos la regla asociada al input usando su atributo 'name' o en su defecto su 'id'
    const fnValidar = this.reglas[input.name] || this.reglas[input.id];
    if (!fnValidar) return true; // Si no hay regla declarada, asumimos que es válido
    
    // Ejecutamos la función validadora con el valor del input
    const mensajeError = fnValidar(input.value);
    
    // Reseteamos las clases CSS de estado previas del contenedor
    grupo.classList.remove('error', 'success');
    
    if (mensajeError) {
      // Si la regla retornó un mensaje, agregamos la clase '.error' (borde rojo)
      grupo.classList.add('error');
      if (errEl) {
        errEl.textContent = mensajeError; // Mostramos la alerta de texto
      }
      return false; // Retorna falso indicando fallo en validación
    }
    
    // Si no hubo errores, agregamos la clase '.success' (borde verde)
    grupo.classList.add('success');
    if (errEl) {
      errEl.textContent = ''; // Limpiamos cualquier texto de alerta anterior
    }
    return true; // Retorna verdadero indicando éxito
  },

  /**
   * initFormulario: Configura eventos en vivo en los campos de un formulario
   * (blur e input) para que se validen automáticamente sin necesidad de enviar el formulario.
   * @param {string} formId - El ID HTML del formulario.
   * @returns {HTMLElement|null}
   */
  initFormulario(formId) {
    const form = document.getElementById(formId);
    if (!form) return null;

    const self = this;
    
    // Buscamos todos los campos interactivos dentro del formulario
    form.querySelectorAll('input, select, textarea').forEach((input) => {
      
      // Evento blur: Se activa cuando el usuario sale del campo (pierde el foco)
      input.addEventListener('blur', function () {
        self.validarCampo(this);
      });
      
      // Evento input: Se activa al escribir en vivo (solo re-valida si el campo ya fue marcado antes)
      input.addEventListener('input', function () {
        if (this.type === 'tel' || this.id === 'telefono' || this.name === 'telefono' || this.name === 'perfilTelefono') {
          this.value = this.value.replace(/[^0-9]/g, '').slice(0, 9);
        }

        const g = this.closest('.form-grupo');
        if (g && (g.classList.contains('error') || g.classList.contains('success'))) {
          self.validarCampo(this);
        }
      });
    });

    return form;
  }
};
