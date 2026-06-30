/* ============================================ catalogo.js - Catálogo de instrumentos, ofertas, blog y destacados ============================================ */

var RiveraSound = RiveraSound || {};

/**
 * RiveraSound.catalogo - Módulo principal que gestiona:
 * - Catálogo de instrumentos (con filtros por categoría y búsqueda)
 * - Página de ofertas (instrumentos < S/1000 y disponibles)
 * - Blog (artículos clickeables que abren modal)
 * - Destacados (selección manual en la página de inicio)
 * Los datos están hardcodeados (simulando una base de datos local).
 */
RiveraSound.catalogo = {

  /* ============ DATOS ============ */

  /** instrumentos - Array maestro con todos los productos del catálogo.
   *  Cada producto tiene: id, nombre, marca, categoria, precio, stock, emoji, desc.
   *  stock puede ser: 'disponible', 'agotado', 'pedido' (bajo pedido).
   *  La categoría se usa para filtros: 'viento', 'cuerda', 'percusion', 'teclado'.
   */
  instrumentos: [
    { id: 'sax-alto-yamaha', nombre: 'Saxofón Alto', marca: 'Yamaha YAS-280', categoria: 'viento', precio: 2850, stock: 'disponible', emoji: '🎷', desc: 'Ideal para principiantes. Sonido brillante.' },
    { id: 'sax-tenor-jupiter', nombre: 'Saxofón Tenor', marca: 'Jupiter JTS-700', categoria: 'viento', precio: 3400, stock: 'disponible', emoji: '🎷', desc: 'Potente sonido para intermedios.' },
    { id: 'sax-soprano-yamaha', nombre: 'Saxofón Soprano', marca: 'Yamaha YSS-475', categoria: 'viento', precio: 4200, stock: 'pedido', emoji: '🎷', desc: 'Recto, tono puro y afinación precisa.' },
    { id: 'trompeta-bach', nombre: 'Trompeta', marca: 'Bach TR300H2', categoria: 'viento', precio: 1750, stock: 'disponible', emoji: '🎺', desc: 'Sonido clásico y construcción robusta.' },
    { id: 'trompeta-yamaha', nombre: 'Trompeta Profesional', marca: 'Yamaha Xeno 8335', categoria: 'viento', precio: 5200, stock: 'pedido', emoji: '🎺', desc: 'Para músicos avanzados y profesionales.' },
    { id: 'clarinete-buffet', nombre: 'Clarinete', marca: 'Buffet Crampon B12', categoria: 'viento', precio: 1200, stock: 'agotado', emoji: '🪗', desc: 'Clarinete estudiante de alta calidad.' },
    { id: 'flauta-yamaha', nombre: 'Flauta Traversa', marca: 'Yamaha YFL-222', categoria: 'viento', precio: 980, stock: 'disponible', emoji: '🎶', desc: 'Flauta plateada con mécanica confiable.' },
    { id: 'flauta-dulce', nombre: 'Flauta Dulce', marca: 'Yamaha YRS-302B', categoria: 'viento', precio: 180, stock: 'disponible', emoji: '🎶', desc: 'Ideal para estudiantes de música.' },
    { id: 'trombon-bach', nombre: 'Trombón', marca: 'Bach TB502', categoria: 'viento', precio: 2100, stock: 'disponible', emoji: '🎺', desc: 'Trombón de vara con campana de 8".' },
    { id: 'oboe-jupiter', nombre: 'Oboe', marca: 'Jupiter JOB-700', categoria: 'viento', precio: 3600, stock: 'pedido', emoji: '🎺', desc: 'Oboe profesional con sistema conservatorio.' },
    { id: 'guitarra-clasica-fender', nombre: 'Guitarra Clásica', marca: 'Fender CN-60S', categoria: 'cuerda', precio: 980, stock: 'disponible', emoji: '🎸', desc: 'Tapa de abeto, cuerpo de caoba.' },
    { id: 'guitarra-electrica-squier', nombre: 'Guitarra Eléctrica', marca: 'Squier Stratocaster', categoria: 'cuerda', precio: 1350, stock: 'disponible', emoji: '🎸', desc: 'Clásico sonido Stratocaster.' },
    { id: 'guitarra-acustica-taylor', nombre: 'Guitarra Acústica', marca: 'Taylor GS Mini', categoria: 'cuerda', precio: 2900, stock: 'disponible', emoji: '🎸', desc: 'Sonido grande en cuerpo pequeño.' },
    { id: 'guitarra-electro-yamaha', nombre: 'Guitarra Electroacústica', marca: 'Yamaha APX600', categoria: 'cuerda', precio: 1200, stock: 'disponible', emoji: '🎸', desc: 'Perfecta para escenarios.' },
    { id: 'violin-mendini', nombre: 'Violín', marca: 'Mendini MV300', categoria: 'cuerda', precio: 450, stock: 'disponible', emoji: '🎻', desc: 'Kit completo para principiantes.' },
    { id: 'violin-profesional', nombre: 'Violín Profesional', marca: 'Yamaha V7SG', categoria: 'cuerda', precio: 3200, stock: 'pedido', emoji: '🎻', desc: 'Construcción artesanal.' },
    { id: 'violonchelo-cecilio', nombre: 'Violonchelo', marca: 'Cecilio CCO-500', categoria: 'cuerda', precio: 2800, stock: 'disponible', emoji: '🎻', desc: 'Sonido cálido y resonante.' },
    { id: 'bajo-ibanez', nombre: 'Bajo Eléctrico', marca: 'Ibanez GSR200', categoria: 'cuerda', precio: 1100, stock: 'pedido', emoji: '🎸', desc: 'Bajo versátil para cualquier género.' },
    { id: 'bajo-fender', nombre: 'Bajo Acústico', marca: 'Fender Kingman', categoria: 'cuerda', precio: 2100, stock: 'agotado', emoji: '🎸', desc: 'Bajo acústico con sonido profundo.' },
    { id: 'ukelele-kala', nombre: 'Ukelele', marca: 'Kala KA-C Caoba', categoria: 'cuerda', precio: 320, stock: 'disponible', emoji: '🪕', desc: 'Ukelele clásico de caoba.' },
    { id: 'arpa-lima', nombre: 'Arpa Criolla', marca: 'Lima Harps LH-100', categoria: 'cuerda', precio: 4500, stock: 'pedido', emoji: '🎑', desc: 'Arpa peruana de 36 cuerdas.' },
    { id: 'bateria-pearl', nombre: 'Batería Completa', marca: 'Pearl Roadshow RS525', categoria: 'percusion', precio: 3200, stock: 'disponible', emoji: '🥁', desc: 'Set 5 piezas con herrajes.' },
    { id: 'bateria-electronica', nombre: 'Batería Electrónica', marca: 'Roland TD-07DMK', categoria: 'percusion', precio: 4800, stock: 'disponible', emoji: '🥁', desc: 'Silenciosa, ideal para departamento.' },
    { id: 'cajon-meinl', nombre: 'Cajón Peruano', marca: 'Meinl JC50B', categoria: 'percusion', precio: 480, stock: 'disponible', emoji: '🪘', desc: 'Cajón clásico peruano.' },
    { id: 'cajon-profesional', nombre: 'Cajón Profesional', marca: 'LP LP397', categoria: 'percusion', precio: 780, stock: 'disponible', emoji: '🪘', desc: 'Cajón con bordona ajustable.' },
    { id: 'congas-lp', nombre: 'Congas', marca: 'LP LP201AX', categoria: 'percusion', precio: 1600, stock: 'pedido', emoji: '🪘', desc: 'Par de congas de 11" y 11.75".' },
    { id: 'bongos-lp', nombre: 'Bongós', marca: 'LP LP395', categoria: 'percusion', precio: 520, stock: 'disponible', emoji: '🪘', desc: 'Bongós de madera con parches sintéticos.' },
    { id: 'timbaleta-pearl', nombre: 'Timbaleta', marca: 'Pearl PHP-925', categoria: 'percusion', precio: 2100, stock: 'pedido', emoji: '🥁', desc: 'Timbaleta profesional 14" y 15".' },
    { id: 'percusion-menor', nombre: 'Set Percusión Menor', marca: 'Meinl Pack', categoria: 'percusion', precio: 380, stock: 'disponible', emoji: '🪘', desc: 'Pandereta, maracas, claves y güiro.' },
    { id: 'piano-roland', nombre: 'Piano Digital', marca: 'Roland FP-30X', categoria: 'teclado', precio: 4100, stock: 'disponible', emoji: '🎹', desc: '88 teclas con acción de martillo.' },
    { id: 'piano-yamaha', nombre: 'Piano Digital Portátil', marca: 'Yamaha P-125', categoria: 'teclado', precio: 3200, stock: 'disponible', emoji: '🎹', desc: 'Ligero, sonido de cola de concierto.' },
    { id: 'piano-casio', nombre: 'Piano de Cola Digital', marca: 'Casio GP-510', categoria: 'teclado', precio: 12000, stock: 'pedido', emoji: '🎹', desc: 'Acción de cola real.' },
    { id: 'teclado-casio', nombre: 'Teclado 61 Teclas', marca: 'Casio CT-S300', categoria: 'teclado', precio: 590, stock: 'disponible', emoji: '🎹', desc: 'Portátil con 400 tonos.' },
    { id: 'teclado-yamaha', nombre: 'Teclado Arreglador', marca: 'Yamaha PSR-E373', categoria: 'teclado', precio: 850, stock: 'disponible', emoji: '🎹', desc: 'Con estilos de acompañamiento.' },
    { id: 'sintetizador-korg', nombre: 'Sintetizador', marca: 'Korg Minilogue', categoria: 'teclado', precio: 3800, stock: 'agotado', emoji: '🎹', desc: 'Sintetizador analógico polifónico.' },
    { id: 'sintetizador-moog', nombre: 'Sintetizador Modular', marca: 'Moog Subsequent 37', categoria: 'teclado', precio: 8500, stock: 'pedido', emoji: '🎹', desc: 'Sintetizador semi-modular.' },
    { id: 'controlador-novation', nombre: 'Controlador MIDI', marca: 'Novation Launchkey 49', categoria: 'teclado', precio: 1100, stock: 'disponible', emoji: '🎹', desc: '49 teclas con pads y perillas.' },
    { id: 'organo-hammond', nombre: 'Órgano Eléctrico', marca: 'Hammond XK-1C', categoria: 'teclado', precio: 6800, stock: 'pedido', emoji: '🎹', desc: 'Órgano portátil con ruedas tonewheel.' }
  ],

  /** blogs - Array de artículos del blog. Se renderizan en tarjetas y se abren en modal al hacer click. */
  blogs: [
    { emoji: '🎷', titulo: 'Cómo elegir tu primer saxofón', resumen: 'Guía completa para principiantes sobre tipos de saxofón, rangos de precio y recomendaciones.', fecha: '15 Mayo 2026', contenido: '<p>Elegir tu primer saxofón puede ser abrumador. Aquí te guiamos paso a paso: primero define tu presupuesto, luego el tipo (alto, tenor, soprano), y finalmente la marca. Los saxofones Yamaha YAS-280 son excelentes para empezar.</p><p>Recuerda que un buen saxofón debe tener llaves que se muevan suavemente, sin escapes de aire, y un sonido que te inspire a practicar.</p>' },
    { emoji: '🎸', titulo: 'Mantenimiento de guitarras acústicas', resumen: 'Consejos prácticos para mantener tu guitarra en óptimas condiciones.', fecha: '8 Mayo 2026', contenido: '<p>Cambia las cuerdas cada 3 meses, limpia el diapasón con aceite de limón, y guarda tu guitarra en un estuche con 45-55% de humedad. Evita cambios bruscos de temperatura.</p>' },
    { emoji: '🥁', titulo: 'Batería acústica vs electrónica', resumen: 'Ventajas y desventajas de cada tipo para ayudarte a decidir.', fecha: '1 Mayo 2026', contenido: '<p>Las baterías acústicas ofrecen sensación y sonido real, ideales para estudios y conciertos. Las electrónicas son silenciosas, ocupan menos espacio, y tienen miles de sonidos.</p><p>Tu elección depende de dónde tocarás y tu presupuesto.</p>' },
    { emoji: '🎹', titulo: 'Piano digital: guía de compra 2026', resumen: 'Todo lo que necesitas saber antes de invertir en un piano digital.', fecha: '22 Abril 2026', contenido: '<p>Busca 88 teclas con acción de martillo contrapesado, polifonía de al menos 128 notas, y buena conectividad (USB-MIDI, Bluetooth).</p><p>Roland FP-30X y Yamaha P-125 son las mejores opciones calidad-precio.</p>' },
    { emoji: '🪘', titulo: 'Historia del cajón peruano', resumen: 'Descubre los orígenes de este emblemático instrumento de percusión peruano.', fecha: '15 Abril 2026', contenido: '<p>El cajón peruano nació en la época colonial como una forma de expresión musical afroperuana. Los esclavos usaban cajones de madera como instrumentos de percusión.</p><p>Hoy es reconocido mundialmente como símbolo de la música peruana.</p>' },
    { emoji: '🎺', titulo: 'Cuidados básicos para tu trompeta', resumen: 'Limpieza, lubricación y almacenamiento para prolongar su vida.', fecha: '8 Abril 2026', contenido: '<p>Limpia el interior con un paño y varilla después de cada uso. Lubrica las válvulas semanalmente con aceite especial. Guarda la trompeta en su estuche, en un lugar seco y temperatura estable.</p>' }
  ],

  /** badges - HTML pre-renderizado para cada estado de stock. Se usa con innerHTML para inyectar el badge correspondiente. */
  badges: {
    disponible: '<span class="badge badge-disponible">Disponible</span>',
    agotado: '<span class="badge badge-agotado">Agotado</span>',
    pedido: '<span class="badge badge-pedido">Por pedido</span>'
  },

  /** badgeLabels - Mapea nombres de categoría interna a etiquetas legibles para humanos (usado en tabla). */
  badgeLabels: {
    viento: 'Viento', cuerda: 'Cuerda', percusion: 'Percusión', teclado: 'Teclado'
  },

  /* ============ TARJETA DE PRODUCTO ============ */

  imageMap: {
    'sax-alto-yamaha': 'SaxofonAlto.png',
    'sax-tenor-jupiter': 'SaxofonTenor.png',
    'trompeta-bach': 'trompeta.png',
    'clarinete-buffet': 'Clarinete.png',
    'flauta-yamaha': 'FlautaTraversa.png',
    'guitarra-clasica-fender': 'GuitarraClasica.png',
    'guitarra-electrica-squier': 'GuitarraElectrica.png',
    'bajo-ibanez': 'BajoElectrico.png',
    'ukelele-kala': 'Ukelele.png',
    'violin-mendini': 'Violin.png',
    'bateria-pearl': 'BateriaCompleta.png',
    'cajon-meinl': 'CajonPeruano.png',
    'congas-lp': 'Congas.png',
    'piano-roland': 'PianoDigital.png',
    'teclado-casio': 'Teclado61Teclas.png',
    'sintetizador-korg': 'Sintetizador.png'
  },

  getImagen: function (itemId) {
    var imgName = this.imageMap[itemId];
    return imgName ? 'img/' + imgName : null;
  },

  /** crearTarjeta - Crea un elemento DOM con la estructura de tarjeta de producto.
   *  Incluye imagen (si existe), nombre, marca, precio, badge de stock y botón "Agregar al carrito".
   */
  crearTarjeta: function (item) {
    var card = RiveraSound.utils.crearElemento('div', { className: 'tarjeta' });
    var imgSrc = this.getImagen(item.id);
    if (imgSrc) {
      var img = document.createElement('img');
      img.src = imgSrc;
      img.alt = item.nombre;
      img.style.width = '100%';
      img.style.height = '160px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = 'var(--radio)';
      img.style.marginBottom = '12px';
      card.appendChild(img);
    } else {
      var icono = RiveraSound.utils.crearElemento('div', { className: 'tarjeta-icono', textContent: item.emoji });
      card.appendChild(icono);
    }
    var h3 = RiveraSound.utils.crearElemento('h3', { textContent: item.nombre });
    var p = RiveraSound.utils.crearElemento('p', { textContent: item.marca });
    var precio = RiveraSound.utils.crearElemento('p', { className: 'precio', textContent: RiveraSound.utils.formatearPrecio(item.precio) });
    var stockDiv = RiveraSound.utils.crearElemento('div', { style: 'margin-top:12px;' });
    stockDiv.innerHTML = this.badges[item.stock];
    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(precio);
    card.appendChild(stockDiv);
    if (item.stock !== 'agotado') {
      var btnAgregar = document.createElement('button');
      btnAgregar.className = 'btn btn-primario';
      btnAgregar.textContent = 'Agregar al carrito';
      btnAgregar.style.marginTop = '12px';
      btnAgregar.style.fontSize = '0.8rem';
      btnAgregar.style.padding = '8px 18px';
      btnAgregar.addEventListener('click', function (e) {
        e.stopPropagation();
        RiveraSound.carrito.agregar({
          id: item.id,
          nombre: item.nombre,
          marca: item.marca,
          precio: item.precio,
          emoji: item.emoji,
          stock: item.stock
        });
      });
      card.appendChild(btnAgregar);
    }
    return card;
  },

  /* ============ CATÁLOGO (VISTA PRINCIPAL) ============ */

  /** renderCatalogo - Renderiza las tarjetas de producto (y tabla si existe) aplicando filtros opcionales.
   *  @param {string} filtro - Categoría a filtrar ('todas' para mostrar todas).
   *  @param {string} busqueda - Texto de búsqueda (compara con nombre y marca, case insensitive).
   */
  renderCatalogo: function (filtro, busqueda) {
    var cont = document.getElementById('catalogoDinamico');
    var tablaBody = document.getElementById('tablaCatalogoBody');
    if (!cont) return;

    /* --- Filtrado de instrumentos --- */
    var items = this.instrumentos;
    if (filtro && filtro !== 'todas') items = items.filter(function (i) { return i.categoria === filtro; });
    if (busqueda) {
      var q = busqueda.toLowerCase().trim();
      items = items.filter(function (i) { return i.nombre.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q); });
    }

    cont.innerHTML = '';
    if (items.length === 0) {
      cont.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">No se encontraron instrumentos.</div>';
      if (tablaBody) tablaBody.innerHTML = '';
      return;
    }

    /* --- Renderiza tarjetas --- */
    var self = this;
    items.forEach(function (item) {
      cont.appendChild(self.crearTarjeta(item));
    });

    /* --- Animación escalonada: cada tarjeta aparece con un pequeño delay --- */
    cont.querySelectorAll('.tarjeta').forEach(function (el, i) {
      el.style.animationDelay = (i * 0.08) + 's';
    });

    /* --- Renderiza tabla si el contenedor existe (vista alternativa de catálogo) --- */
    if (tablaBody) {
      var thtml = '';
      items.forEach(function (item) {
        var imgSrc = self.getImagen(item.id);
        var imgHtml = imgSrc ? '<img src="' + imgSrc + '" alt="' + item.nombre + '" style="width:40px;height:40px;object-fit:cover;border-radius:4px;display:inline-block;vertical-align:middle;margin-right:6px;">' : item.emoji + ' ';
        var btn = item.stock !== 'agotado'
          ? '<button class="btn btn-primario btn-tabla-carrito" data-id="' + item.id + '" data-nombre="' + item.nombre + '" data-marca="' + item.marca + '" data-precio="' + item.precio + '" data-emoji="' + item.emoji + '" data-stock="' + item.stock + '" style="padding:4px 12px;font-size:0.75rem;">🛒</button>'
          : '<span class="badge badge-agotado">Agotado</span>';
        thtml += '<tr><td>' + imgHtml + item.nombre + '</td><td>' + item.marca + '</td><td>' + (self.badgeLabels[item.categoria] || item.categoria) + '</td><td>' + RiveraSound.utils.formatearPrecio(item.precio) + '</td><td>' + self.badges[item.stock] + '</td><td>' + btn + '</td></tr>';
      });
      tablaBody.innerHTML = thtml;

      tablaBody.querySelectorAll('.btn-tabla-carrito').forEach(function (btn) {
        btn.addEventListener('click', function () {
          RiveraSound.carrito.agregar({
            id: this.getAttribute('data-id'),
            nombre: this.getAttribute('data-nombre'),
            marca: this.getAttribute('data-marca'),
            precio: parseFloat(this.getAttribute('data-precio')),
            emoji: this.getAttribute('data-emoji'),
            stock: this.getAttribute('data-stock')
          });
        });
      });
    }
  },

  /* ============ OFERTAS ============ */

  /** renderOfertas - Renderiza productos menores a S/1000 y en stock 'disponible' en el grid de ofertas. */
  renderOfertas: function () {
    var cont = document.getElementById('ofertasGrid');
    if (!cont) return;
    var ofertas = this.instrumentos.filter(function (i) { return i.precio < 1000 && i.stock === 'disponible'; });
    cont.innerHTML = '';
    var self = this;
    ofertas.forEach(function (item) {
      cont.appendChild(self.crearTarjeta(item));
    });
  },

  /* ============ BLOG ============ */

  /** renderBlog - Renderiza tarjetas de blog y bindea clicks para abrir el artículo completo en un modal. */
  renderBlog: function () {
    var cont = document.getElementById('blogGrid');
    if (!cont) return;
    var html = '';
    this.blogs.forEach(function (post) {
      html += '<div class="blog-tarjeta reveal" data-blog="' + encodeURIComponent(post.titulo) + '">\
        <div class="blog-tarjeta-img" style="background:linear-gradient(135deg,var(--color-principal),var(--color-secundario));font-size:4rem;display:flex;align-items:center;justify-content:center;">' + post.emoji + '</div>\
        <div class="blog-tarjeta-body">\
          <h3>' + post.titulo + '</h3>\
          <p>' + post.resumen + '</p>\
          <span class="blog-fecha">' + post.fecha + '</span>\
        </div>\
      </div>';
    });
    cont.innerHTML = html;

    /* --- Click en tarjeta de blog: abre modal con contenido completo --- */
    var self = this;
    cont.querySelectorAll('.blog-tarjeta').forEach(function (el) {
      el.addEventListener('click', function () {
        var idx = Array.prototype.indexOf.call(cont.children, this); // Obtiene índice del elemento clickeado
        var post = self.blogs[idx];
        if (post) {
          RiveraSound.modal.abrir(
            '<div class="modal-body">' + post.contenido + '</div><p style="color:var(--color-gris);font-size:0.8rem;margin-top:16px;">' + post.fecha + '</p>',
            post.emoji + ' ' + post.titulo
          );
        }
      });
    });
  },

  /* ============ DESTACADOS (INICIO) ============ */

  /** renderDestacados - Renderiza una selección manual de productos destacados (por ID) en la página de inicio. */
  renderDestacados: function () {
    var cont = document.getElementById('destacadosGrid');
    if (!cont) return;
    var destacados = this.instrumentos.filter(function (i) { return ['sax-alto-yamaha', 'guitarra-clasica-fender', 'bateria-pearl'].indexOf(i.id) !== -1; });
    cont.innerHTML = '';
    var self = this;
    destacados.forEach(function (item) {
      cont.appendChild(self.crearTarjeta(item));
    });
  },

  /* ============ INICIALIZACIÓN GENERAL ============ */

  /** iniciar - Punto de entrada. Renderiza destacados, catálogo, ofertas y blog si sus contenedores existen en el HTML cargado. */
  iniciar: function () {
    this.renderDestacados();

    var catalogoCont = document.getElementById('catalogoDinamico');
    if (catalogoCont) {
      this.renderCatalogo('todas', '');
      this.initFiltros();
    }

    var ofertasCont = document.getElementById('ofertasGrid');
    if (ofertasCont) this.renderOfertas();

    var blogCont = document.getElementById('blogGrid');
    if (blogCont) this.renderBlog();
  },

  /* ============ FILTROS Y BÚSQUEDA ============ */

  /** initFiltros - Bindea eventos a los botones de filtro por categoría y al campo de búsqueda con debounce. */
  initFiltros: function () {
    var filtros = document.getElementById('filtrosCategoria');
    var busqueda = document.getElementById('busquedaInstrumento');
    if (!filtros && !busqueda) return;

    var self = this;

    /* --- Filtros por categoría (botones) --- */
    if (filtros) {
      filtros.querySelectorAll('.btn-filtro').forEach(function (btn) {
        btn.addEventListener('click', function () {
          filtros.querySelectorAll('.btn-filtro').forEach(function (b) { b.classList.remove('activo'); });
          this.classList.add('activo');
          var cat = this.getAttribute('data-categoria') || 'todas';
          var busq = busqueda ? busqueda.value : '';
          self.renderCatalogo(cat, busq);
        });
      });
    }

    /* --- Búsqueda por texto con debounce de 300ms para no disparar en cada tecla --- */
    if (busqueda) {
      busqueda.addEventListener('input', RiveraSound.utils.debounce(function () {
        var cat = filtros ? (filtros.querySelector('.btn-filtro.activo')?.getAttribute('data-categoria') || 'todas') : 'todas';
        self.renderCatalogo(cat, busqueda.value);
      }, 300));
    }
  }
};
