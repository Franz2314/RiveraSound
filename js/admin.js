/* Panel de Administración del Catálogo (CRUD) */

var RiveraSound = RiveraSound || {};

// Módulo encargado de gestionar el CRUD del catálogo de instrumentos
RiveraSound.admin = {

  // Referencias a los elementos clave de la interfaz
  elementos: {
    tablaBody: null,
    modalForm: null,
    btnNuevo: null,
    btnCerrarForm: null,
    formCrud: null,
    formTitulo: null,
    inputId: null,
    inputNombre: null,
    inputMarca: null,
    inputCategoria: null,
    inputPrecio: null,
    inputStock: null,
    inputEmoji: null,
    inputDesc: null
  },

  /**
   * init: Inicializa el módulo asociando referencias y eventos del DOM.
   */
  init() {
    this.asociarReferencias();
    this.asociarEventos();
    this.renderTabla();
  },

  /**
   * asociarReferencias: Captura y guarda las referencias a elementos del DOM.
   */
  asociarReferencias() {
    const el = this.elementos;
    el.tablaBody = document.getElementById('tablaCrudBody');
    el.modalForm = document.getElementById('modalFormInstrumento');
    el.btnNuevo = document.getElementById('btnNuevoInstrumento');
    el.btnCerrarForm = document.getElementById('btnCloseModalForm');
    el.formCrud = document.getElementById('formInstrumentoCrud');
    el.formTitulo = document.getElementById('formInstrumentoTitulo');
    
    // Inputs del formulario
    el.inputId = document.getElementById('crudId');
    el.inputNombre = document.getElementById('crudNombre');
    el.inputMarca = document.getElementById('crudMarca');
    el.inputCategoria = document.getElementById('crudCategoria');
    el.inputPrecio = document.getElementById('crudPrecio');
    el.inputStock = document.getElementById('crudStock');
    el.inputEmoji = document.getElementById('crudEmoji');
    el.inputDesc = document.getElementById('crudDesc');
  },

  /**
   * asociarEventos: Asigna manejadores de eventos (clicks, submits) a la UI.
   */
  asociarEventos() {
    const el = this.elementos;
    if (!el.formCrud) return;

    // Abrir modal para nuevo producto
    if (el.btnNuevo && !el.btnNuevo.hasAttribute('data-binded')) {
      el.btnNuevo.setAttribute('data-binded', '1');
      el.btnNuevo.addEventListener('click', () => {
        this.abrirFormularioLimpio();
      });
    }

    // Cerrar modal
    if (el.btnCerrarForm && !el.btnCerrarForm.hasAttribute('data-binded')) {
      el.btnCerrarForm.setAttribute('data-binded', '1');
      el.btnCerrarForm.addEventListener('click', () => {
        this.cerrarFormulario();
      });
    }

    // Submit del formulario CRUD
    if (!el.formCrud.hasAttribute('data-binded')) {
      el.formCrud.setAttribute('data-binded', '1');
      el.formCrud.addEventListener('submit', (e) => {
        e.preventDefault();
        this.guardarRegistro();
      });

      // Validaciones rápidas al escribir
      el.formCrud.querySelectorAll('input, select, textarea').forEach((input) => {
        input.addEventListener('input', function() {
          const grupo = this.closest('.form-grupo');
          if (grupo) {
            grupo.classList.remove('error', 'success');
            const errorSpan = grupo.querySelector('.error-msg');
            if (errorSpan) errorSpan.textContent = '';
          }
        });
      });
    }
  },

  /**
   * renderTabla: Genera dinámicamente las filas de la tabla de instrumentos.
   */
  renderTabla() {
    const el = this.elementos;
    if (!el.tablaBody) return;

    // Limpiamos contenido anterior
    el.tablaBody.innerHTML = '';

    const productos = RiveraSound.catalogo.instrumentos;

    if (productos.length === 0) {
      el.tablaBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 20px; color: var(--color-gris);">
            No hay productos en el catálogo.
          </td>
        </tr>
      `;
      return;
    }

    // Inyectamos cada producto en la tabla
    productos.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
      tr.style.transition = 'transform var(--transicion)';
      
      const imgSrc = RiveraSound.catalogo.getImagen(item.id);
      const iconHtml = imgSrc 
        ? `<img src="${imgSrc}" alt="${item.nombre}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); display: block; margin: 0 auto;">`
        : `<span style="font-size: 1.4rem;">${item.emoji}</span>`;

      tr.innerHTML = `
        <td style="padding: 12px; text-align: center; vertical-align: middle;">${iconHtml}</td>
        <td style="padding: 12px; font-weight: bold; color: var(--color-texto); vertical-align: middle;">${item.nombre}</td>
        <td style="padding: 12px; color: var(--color-gris); vertical-align: middle;">${item.marca}</td>
        <td style="padding: 12px; text-transform: capitalize; color: var(--color-gris); vertical-align: middle;">${item.categoria}</td>
        <td style="padding: 12px; font-weight: bold; color: var(--color-acento); vertical-align: middle;">${RiveraSound.utils.formatearPrecio(item.precio)}</td>
        <td style="padding: 12px; vertical-align: middle;">${RiveraSound.catalogo.badges[item.stock]}</td>
        <td style="padding: 12px; text-align: center; vertical-align: middle;">
          <div style="display: flex; gap: 8px; justify-content: center;">
            <button class="btn btn-secundario btn-editar" data-id="${item.id}" style="padding: 6px 12px; font-size: 0.8rem;">Editar</button>
            <button class="btn btn-secundario btn-eliminar" data-id="${item.id}" style="padding: 6px 12px; font-size: 0.8rem; border-color: var(--color-error); color: var(--color-error);">Eliminar</button>
          </div>
        </td>
      `;

      // Evento de Editar
      tr.querySelector('.btn-editar').addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.cargarParaEditar(id);
      });

      // Evento de Eliminar
      tr.querySelector('.btn-eliminar').addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.confirmarEliminar(id);
      });

      el.tablaBody.appendChild(tr);
    });
  },

  /**
   * abrirFormularioLimpio: Abre el modal preparado para registrar un nuevo producto.
   */
  abrirFormularioLimpio() {
    const el = this.elementos;
    el.formTitulo.textContent = 'Agregar Instrumento';
    el.inputId.value = '';
    el.formCrud.reset();
    
    // Limpiamos estilos de validación previos
    el.formCrud.querySelectorAll('.form-grupo').forEach((g) => {
      g.classList.remove('error', 'success');
      const err = g.querySelector('.error-msg');
      if (err) err.textContent = '';
    });

    el.modalForm.style.display = 'flex';
  },

  /**
   * cargarParaEditar: Carga los datos de un instrumento en el formulario para editarlo.
   */
  cargarParaEditar(id) {
    const el = this.elementos;
    const productos = RiveraSound.catalogo.instrumentos;
    const item = productos.find((p) => p.id === id);
    if (!item) return;

    el.formTitulo.textContent = 'Editar Instrumento';
    el.inputId.value = item.id;
    el.inputNombre.value = item.nombre;
    el.inputMarca.value = item.marca;
    el.inputCategoria.value = item.categoria;
    el.inputPrecio.value = item.precio;
    el.inputStock.value = item.stock;
    el.inputEmoji.value = item.emoji;
    el.inputDesc.value = item.desc;

    // Limpiamos estilos de validación previos
    el.formCrud.querySelectorAll('.form-grupo').forEach((g) => {
      g.classList.remove('error', 'success');
      const err = g.querySelector('.error-msg');
      if (err) err.textContent = '';
    });

    el.modalForm.style.display = 'flex';
  },

  /**
   * cerrarFormulario: Cierra la ventana modal del formulario CRUD.
   */
  cerrarFormulario() {
    const el = this.elementos;
    if (el.modalForm) {
      el.modalForm.style.display = 'none';
    }
  },

  /**
   * validarFormulario: Comprueba las validaciones básicas de los campos.
   * @returns {boolean} - true si pasa la validación.
   */
  validarFormulario() {
    const el = this.elementos;
    let valido = true;

    const marcarError = (input, msg) => {
      valido = false;
      const grupo = input.closest('.form-grupo');
      if (grupo) {
        grupo.classList.add('error');
        const span = grupo.querySelector('.error-msg');
        if (span) span.textContent = msg;
      }
    };

    const marcarExito = (input) => {
      const grupo = input.closest('.form-grupo');
      if (grupo) {
        grupo.classList.add('success');
      }
    };

    // Reseteamos clases
    el.formCrud.querySelectorAll('.form-grupo').forEach((g) => g.classList.remove('error', 'success'));

    // Validación: Nombre
    if (el.inputNombre.value.trim().length < 3) {
      marcarError(el.inputNombre, 'El nombre debe tener al menos 3 caracteres.');
    } else {
      marcarExito(el.inputNombre);
    }

    // Validación: Marca
    if (el.inputMarca.value.trim().length < 3) {
      marcarError(el.inputMarca, 'La marca o modelo debe tener al menos 3 caracteres.');
    } else {
      marcarExito(el.inputMarca);
    }

    // Validación: Categoría
    if (!el.inputCategoria.value) {
      marcarError(el.inputCategoria, 'Por favor, selecciona una categoría.');
    } else {
      marcarExito(el.inputCategoria);
    }

    // Validación: Precio
    const precioVal = parseFloat(el.inputPrecio.value);
    if (isNaN(precioVal) || precioVal <= 0) {
      marcarError(el.inputPrecio, 'El precio debe ser un número mayor a 0.');
    } else {
      marcarExito(el.inputPrecio);
    }

    // Validación: Emoji
    if (!el.inputEmoji.value.trim()) {
      marcarError(el.inputEmoji, 'Escribe un emoji representativo.');
    } else {
      marcarExito(el.inputEmoji);
    }

    // Validación: Descripción
    if (el.inputDesc.value.trim().length < 10) {
      marcarError(el.inputDesc, 'La descripción debe tener al menos 10 caracteres.');
    } else {
      marcarExito(el.inputDesc);
    }

    return valido;
  },

  /**
   * guardarRegistro: Guarda el instrumento nuevo o editado en el array persistido.
   */
  async guardarRegistro() {
    if (!this.validarFormulario()) {
      RiveraSound.utils.notificar('Por favor, completa los campos obligatorios correctamente.', 'error');
      return;
    }

    const el = this.elementos;
    const productos = [...RiveraSound.catalogo.instrumentos];
    const idEdicion = el.inputId.value;

    const itemMod = {
      id: idEdicion || this.generarId(el.inputNombre.value, el.inputMarca.value),
      nombre: el.inputNombre.value.trim(),
      marca: el.inputMarca.value.trim(),
      categoria: el.inputCategoria.value,
      precio: parseFloat(el.inputPrecio.value),
      stock: el.inputStock.value,
      emoji: el.inputEmoji.value.trim(),
      desc: el.inputDesc.value.trim()
    };

    // Con backend: primero se guarda en PostgreSQL. Si la base de datos lo
    // rechaza (precio inválido, id duplicado...), se avisa y no se cambia nada.
    if (RiveraSound.api.disponible) {
      try {
        const guardado = idEdicion
          ? await RiveraSound.api.pedir('PUT', `/instrumentos/${encodeURIComponent(idEdicion)}`, itemMod)
          : await RiveraSound.api.pedir('POST', '/instrumentos', itemMod);
        itemMod.id = guardado.id; // por si el backend generó el id
      } catch (e) {
        RiveraSound.utils.notificar(e.message, 'error');
        return;
      }
    }

    if (idEdicion) {
      // Modo Edición: actualizamos el objeto existente en el array
      const idx = productos.findIndex((p) => p.id === idEdicion);
      if (idx !== -1) {
        productos[idx] = itemMod;
        RiveraSound.utils.notificar('¡Instrumento modificado con éxito!', 'exito');
      }
    } else {
      // Modo Creación: añadimos al array
      productos.push(itemMod);
      RiveraSound.utils.notificar('¡Nuevo instrumento agregado con éxito!', 'exito');
    }

    // Guardar los cambios (el setter escribe automáticamente en localStorage)
    RiveraSound.catalogo.instrumentos = productos;

    // Cerramos el formulario y actualizamos la vista
    this.cerrarFormulario();
    this.renderTabla();
  },

  /**
   * confirmarEliminar: Pide confirmación al usuario antes de eliminar un registro.
   */
  async confirmarEliminar(id) {
    const productos = RiveraSound.catalogo.instrumentos;
    const item = productos.find((p) => p.id === id);
    if (!item) return;

    const seguro = confirm(`¿Estás seguro de eliminar el instrumento "${item.nombre} - ${item.marca}"?`);
    if (seguro) {
      // Con backend: borrado lógico en PostgreSQL (los pedidos antiguos lo conservan)
      if (RiveraSound.api.disponible) {
        try {
          await RiveraSound.api.pedir('DELETE', `/instrumentos/${encodeURIComponent(id)}`);
        } catch (e) {
          // 404 = solo existía en este navegador: se borra igual de la copia local
          if (e.status !== 404) {
            RiveraSound.utils.notificar(e.message, 'error');
            return;
          }
        }
      }
      const filtrados = productos.filter((p) => p.id !== id);
      RiveraSound.catalogo.instrumentos = filtrados; // Guarda en localStorage
      this.renderTabla();
      RiveraSound.utils.notificar('Instrumento eliminado del catálogo.', 'info');
    }
  },

  /**
   * generarId: Crea un identificador estilo kebab-case único.
   */
  generarId(nombre, marca) {
    const combinacion = `${nombre}-${marca}`;
    return combinacion
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Quita caracteres extraños
      .replace(/\s+/g, '-')         // Espacios a guiones
      .replace(/-+/g, '-');         // Limpia guiones duplicados
  }
};
