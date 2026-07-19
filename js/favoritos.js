/* Gestión de Favoritos / Wishlist */

var RiveraSound = RiveraSound || {};

RiveraSound.favoritos = {

  /* Clave única en localStorage para persistir los favoritos */
  key: 'riverasound_favoritos',
  /* Arreglo en memoria con los ítems guardados como favoritos */
  items: [],

  /* Inicializa el módulo cargando los datos guardados */
  init() {
    this.cargar();
  },

  /* Obtiene la clave de almacenamiento específica para el usuario en sesión */
  obtenerClave() {
    const usuario = localStorage.getItem('riverasound_usuario');
    if (!usuario) return null;
    try {
      const parsed = JSON.parse(usuario);
      return 'riverasound_favoritos_' + parsed.correo.toLowerCase();
    } catch (_) {
      return null;
    }
  },

  /* Lee la lista de favoritos desde localStorage; si no existe, inicia vacía */
  cargar() {
    const clave = this.obtenerClave();
    if (!clave) {
      this.items = [];
      return;
    }
    try {
      const datos = localStorage.getItem(clave);
      this.items = datos ? JSON.parse(datos) : [];
    } catch (e) {
      this.items = [];
    }
  },

  /* Persiste el arreglo actual de favoritos en localStorage */
  guardar() {
    const clave = this.obtenerClave();
    if (clave) {
      localStorage.setItem(clave, JSON.stringify(this.items));
    }
  },

  /* Agrega un ítem si no existe, o lo elimina si ya está; retorna true si se agregó */
  toggle(item) {
    const clave = this.obtenerClave();
    if (!clave) return null; // No logueado

    this.cargar(); // Carga de forma fresca
    const idx = this.items.findIndex((i) => i.id === item.id);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      this.guardar();
      return false;
    } else {
      this.items.push({ id: item.id, nombre: item.nombre, marca: item.marca, precio: item.precio, emoji: item.emoji, stock: item.stock });
      this.guardar();
      return true;
    }
  },

  /* Verifica si un ID específico está en favoritos */
  tiene(id) {
    const clave = this.obtenerClave();
    if (!clave) return false;
    this.cargar();
    return this.items.some((i) => i.id === id);
  },

  /* Retorna una copia del arreglo de favoritos */
  obtener() {
    this.cargar();
    return this.items.slice();
  },

  /* Renderiza la página completa de favoritos (#favoritos) */
  renderPagina() {
    const cont = document.getElementById('favoritosGrid');
    if (!cont) return;

    const clave = this.obtenerClave();
    if (!clave) {
      cont.innerHTML = `
        <div class="carrito-vacio">
          <div style="font-size:4rem;opacity:0.3;margin-bottom:16px;">🔒</div>
          <h2>Acceso Restringido</h2>
          <p style="color:var(--color-gris);margin-bottom:20px;">Debes iniciar sesión para poder guardar y ver tus favoritos.</p>
          <a href="#cuenta-login" class="btn btn-primario">Iniciar Sesión</a>
        </div>
      `;
      return;
    }

    this.cargar();

    /* Si no hay favoritos, muestra un estado vacío amigable */
    if (this.items.length === 0) {
      cont.innerHTML = `
        <div class="carrito-vacio">
          <div style="font-size:4rem;opacity:0.3;margin-bottom:16px;">🤍</div>
          <h2>No tienes favoritos aún</h2>
          <p style="color:var(--color-gris);margin-bottom:20px;">Guarda tus instrumentos favoritos con el corazón ❤️</p>
          <a href="#instrumentos" class="btn btn-primario">Explorar catálogo</a>
        </div>
      `;
      return;
    }

    /* Busca los datos completos de cada favorito en el catálogo */
    const todos = RiveraSound.catalogo.instrumentos;
    let html = '<div class="grid-tarjetas tarjetas-fav">';
    this.items.forEach((fav) => {
      const item = todos.find((i) => i.id === fav.id);
      if (!item) return;
      const imgSrc = RiveraSound.catalogo.getImagen(item.id);
      /* Construye una tarjeta compacta con imagen, nombre, precio, badge y botones */
      html += `
        <div class="tarjeta tarjeta-fav" data-id="${item.id}">
          ${imgSrc ? `<img src="${imgSrc}" alt="${item.nombre}" class="tarjeta-fav-img">` : `<div class="tarjeta-icono" style="font-size:2rem;">${item.emoji}</div>`}
          <h3 style="font-size:0.9rem;">${item.nombre}</h3>
          <p style="font-size:0.75rem;opacity:0.7;">${item.marca}</p>
          <p class="precio" style="font-size:0.9rem;">${RiveraSound.utils.formatearPrecio(item.precio)}</p>
          <div style="margin:6px 0;">${RiveraSound.catalogo.badges[item.stock]}</div>
          <div class="tarjeta-fav-acciones">
            <button class="btn btn-primario btn-fav-agregar" data-id="${item.id}" ${item.stock === 'agotado' ? 'disabled' : ''}>🛒</button>
            <button class="btn-fav-quitar" data-id="${item.id}">❤️</button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    cont.innerHTML = html;

    /* Botón agregar al carrito desde favoritos */
    cont.querySelectorAll('.btn-fav-agregar').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = todos.find((i) => i.id === btn.getAttribute('data-id'));
        if (item) RiveraSound.carrito.agregar(item);
      });
    });

    /* Botón quitar de favoritos: elimina del arreglo, guarda y re-renderiza */
    cont.querySelectorAll('.btn-fav-quitar').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.items = this.items.filter((i) => i.id !== id);
        this.guardar();
        this.renderPagina();
        RiveraSound.utils.notificar('Eliminado de favoritos', 'info');
      });
    });
  }
};