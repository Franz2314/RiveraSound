/* Catálogo de Instrumentos, Ofertas, Blog y Destacados */

var RiveraSound = RiveraSound || {};

// Módulo encargado de gestionar el catálogo, las ofertas y los artículos de blog
RiveraSound.catalogo = {

  /* Base de datos local simulada */
  
  defaultInstrumentos: [
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
    { id: 'ukelele-kala', nombre: 'Ukelele', marca: 'Kala KA-C Caoba', categoria: 'cuerda', precio: 320, stock: 'disponible', emoji: '🪕', desc: 'Ukelele clásico de caoba.' },
    { id: 'bateria-pearl', nombre: 'Batería Completa', marca: 'Pearl Roadshow RS525', categoria: 'percusion', precio: 3200, stock: 'disponible', emoji: '🥁', desc: 'Set 5 piezas con herrajes.' },
    { id: 'bateria-electronica', nombre: 'Batería Electrónica', marca: 'Roland TD-07DMK', categoria: 'percusion', precio: 4800, stock: 'disponible', emoji: '🥁', desc: 'Silenciosa, ideal para departamento.' },
    { id: 'cajon-meinl', nombre: 'Cajón Peruano', marca: 'Meinl JC50B', categoria: 'percusion', precio: 480, stock: 'disponible', emoji: '🪘', desc: 'Cajón clásico peruano.' },
    { id: 'cajon-profesional', nombre: 'Cajón Profesional', marca: 'LP LP397', categoria: 'percusion', precio: 780, stock: 'disponible', emoji: '🪘', desc: 'Cajón con bordona ajustable.' },
    { id: 'congas-lp', nombre: 'Congas', marca: 'LP LP201AX', categoria: 'percusion', precio: 1600, stock: 'pedido', emoji: '🪘', desc: 'Par de congas de 11" y 11.75".' },
    { id: 'bongos-lp', nombre: 'Bongós', marca: 'LP LP395', categoria: 'percusion', precio: 520, stock: 'disponible', emoji: '🪘', desc: 'Bongós de madera con parches sintéticos.' },
    { id: 'timbaleta-pearl', nombre: 'Timbaleta', marca: 'Pearl PHP-925', categoria: 'percusion', precio: 2100, stock: 'pedido', emoji: '🥁', desc: 'Timbaleta profesional 14" y 15".' },
    { id: 'percusion-menor', nombre: 'Set Percusión Menor', marca: 'Meinl Pack', categoria: 'percusion', precio: 380, stock: 'disponible', emoji: '🪘', desc: 'Pandereta, maracas, claves y güiro.' },
    { id: 'piano-roland', nombre: 'Piano Digital', marca: 'Roland FP-30X', categoria: 'teclado', precio: 4100, stock: 'disponible', emoji: '🎹', desc: '88 teclas con acción de martillo.' },
    { id: 'piano-casio', nombre: 'Piano de Cola Digital', marca: 'Casio GP-510', categoria: 'teclado', precio: 12000, stock: 'pedido', emoji: '🎹', desc: 'Acción de cola real.' },
    { id: 'teclado-casio', nombre: 'Teclado 61 Teclas', marca: 'Casio CT-S300', categoria: 'teclado', precio: 590, stock: 'disponible', emoji: '🎹', desc: 'Portátil con 400 tonos.' },
    { id: 'teclado-yamaha', nombre: 'Teclado Arreglador', marca: 'Yamaha PSR-E373', categoria: 'teclado', precio: 850, stock: 'disponible', emoji: '🎹', desc: 'Con estilos de acompañamiento.' },
    { id: 'sintetizador-korg', nombre: 'Sintetizador', marca: 'Korg Minilogue', categoria: 'teclado', precio: 3800, stock: 'agotado', emoji: '🎹', desc: 'Sintetizador analógico polifónico.' },
    { id: 'sintetizador-moog', nombre: 'Sintetizador Modular', marca: 'Moog Subsequent 37', categoria: 'teclado', precio: 8500, stock: 'pedido', emoji: '🎹', desc: 'Sintetizador semi-modular.' },
    { id: 'controlador-novation', nombre: 'Controlador MIDI', marca: 'Novation Launchkey 49', categoria: 'teclado', precio: 1100, stock: 'disponible', emoji: '🎹', desc: '49 teclas con pads y perillas.' },
    { id: 'organo-hammond', nombre: 'Órgano Eléctrico', marca: 'Hammond XK-1C', categoria: 'teclado', precio: 6800, stock: 'pedido', emoji: '🎹', desc: 'Órgano portátil con ruedas tonewheel.' }
  ],

  // Getter y setter dinámicos para instrumentos persistidos en localStorage
  get instrumentos() {
    const guardados = localStorage.getItem('riverasound_instrumentos');
    if (guardados) {
      try {
        return JSON.parse(guardados);
      } catch (_) {
        return this.defaultInstrumentos;
      }
    }
    // Inicialización por primera vez en localStorage
    localStorage.setItem('riverasound_instrumentos', JSON.stringify(this.defaultInstrumentos));
    return this.defaultInstrumentos;
  },
  set instrumentos(val) {
    localStorage.setItem('riverasound_instrumentos', JSON.stringify(val));
  },

  // Artículos del blog
  blogs: [
    { emoji: '🎷', titulo: 'Cómo elegir tu primer saxofón', resumen: 'Guía completa para principiantes sobre tipos de saxofón, rangos de precio y recomendaciones.', fecha: '15 Mayo 2026', contenido: '<p>Elegir tu primer saxofón puede ser abrumador. Aquí te guiamos paso a paso: primero define tu presupuesto, luego el tipo (alto, tenor, soprano), y finalmente la marca. Los saxofones Yamaha YAS-280 son excelentes para empezar.</p><p>Recuerda que un buen saxofón debe tener llaves que se muevan suavemente, sin escapes de aire, y un sonido que te inspire a practicar.</p>' },
    { emoji: '🎸', titulo: 'Mantenimiento de guitarras acústicas', resumen: 'Consejos prácticos para mantener tu guitarra en óptimas condiciones.', fecha: '8 Mayo 2026', contenido: '<p>Cambia las cuerdas cada 3 meses, limpia el diapasón con aceite de limón, y guarda tu guitarra en un estuche con 45-55% de humedad. Evita cambios bruscos de temperatura.</p>' },
    { emoji: '🥁', titulo: 'Batería acústica vs electrónica', resumen: 'Ventajas y desventajas de cada tipo para ayudarte a decidir.', fecha: '1 Mayo 2026', contenido: '<p>Las baterías acústicas ofrecen sensación y sonido real, ideales para estudios y conciertos. Las electrónicas son silenciosas, ocupan menos espacio, y tienen miles de sonidos.</p><p>Tu elección depende de dónde tocarás y tu presupuesto.</p>' },
    { emoji: '🎹', titulo: 'Piano digital: guía de compra 2026', resumen: 'Todo lo que necesitas saber antes de invertir en un piano digital.', fecha: '22 Abril 2026', contenido: '<p>Busca 88 teclas con acción de martillo contrapesado, polifonía de al menos 128 notas, y buena conectividad (USB-MIDI, Bluetooth).</p><p>Roland FP-30X y Yamaha P-125 son las mejores opciones calidad-precio.</p>' },
    { emoji: '🪘', titulo: 'Historia del cajón peruano', resumen: 'Descubre los orígenes de este emblemático instrumento de percusión peruano.', fecha: '15 Abril 2026', contenido: '<p>El cajón peruano nació en la época colonial como una forma de expresión musical afroperuana. Los esclavos usaban cajones de madera como instrumentos de percusión.</p><p>Hoy es reconocido mundialmente como símbolo de la música peruana.</p>' },
    { emoji: '🎺', titulo: 'Cuidados básicos para tu trompeta', resumen: 'Limpieza, lubricación y almacenamiento para prolongar su vida.', fecha: '8 Abril 2026', contenido: '<p>Limpia el interior con un paño y varilla después de cada uso. Lubrica las válvulas semanalmente con aceite especial. Guarda la trompeta en su estuche, en un lugar seco y temperatura estable.</p>' }
  ],

  // Insignias en formato HTML según estado de disponibilidad
  badges: {
    disponible: '<span class="badge badge-disponible">Disponible</span>',
    agotado: '<span class="badge badge-agotado">Agotado</span>',
    pedido: '<span class="badge badge-pedido">Por pedido</span>'
  },

  // Etiquetas para la vista en tabla del catálogo
  badgeLabels: {
    viento: 'Viento', cuerda: 'Cuerda', percusion: 'Percusión', teclado: 'Teclado'
  },

  // Mapa de relación para asociar productos a archivos de imagen en /img
  imageMap: {
    // Viento
    'sax-alto-yamaha': 'SaxofonAlto.png',
    'sax-tenor-jupiter': 'SaxofonTenor.png',
    'sax-soprano-yamaha': 'SaxofonSoprano.png',
    'trompeta-bach': 'trompeta.png',
    'trompeta-yamaha': 'TrompetaProfesional.png',
    'clarinete-buffet': 'Clarinete.png',
    'flauta-yamaha': 'FlautaTraversa.png',
    'flauta-dulce': 'FlautaDulce.png',
    'trombon-bach': 'Trombon.png',
    'oboe-jupiter': 'Oboe.png',

    // Cuerda
    'guitarra-clasica-fender': 'GuitarraClasica.png',
    'guitarra-electrica-squier': 'GuitarraElectrica.png',
    'guitarra-acustica-taylor': 'GuitarraAcustica.png',
    'guitarra-electro-yamaha': 'GuitarraElectroacustica.png',
    'violin-mendini': 'Violin.png',
    'violin-profesional': 'ViolinProfesional.png',
    'violonchelo-cecilio': 'Violonchelo.png',
    'bajo-ibanez': 'BajoElectrico.png',
    'ukelele-kala': 'Ukelele.png',

    // Percusion
    'bateria-pearl': 'BateriaCompleta.png',
    'bateria-electronica': 'BateriaElectronica.png',
    'cajon-meinl': 'CajonPeruano.png',
    'cajon-profesional': 'CajonProfesional.jpg',
    'congas-lp': 'Congas.png',
    'bongos-lp': 'Bongos.jpg',
    'timbaleta-pearl': 'Timbales.png',
    'percusion-menor': 'PercusionMenor.jpg',

    // Teclado
    'piano-roland': 'PianoDigital.png',
    'piano-casio': 'PianoCola.jpg',
    'teclado-casio': 'Teclado61Teclas.png',
    'teclado-yamaha': 'TecladoArreglador.jpg',
    'sintetizador-korg': 'Sintetizador.png',
    'sintetizador-moog': 'SintetizadorModular.jpg',
    'controlador-novation': 'ControladorMidi.jpg',
    'organo-hammond': 'OrganoHammond.png'
  },

  /**
   * getImagen: Retorna la ruta física de la imagen del producto.
   * @param {string} itemId - ID del producto.
   * @returns {string|null}
   */
  getImagen(itemId) {
    const imgName = this.imageMap[itemId];
    return imgName ? `img/${imgName}` : null;
  },

  /**
   * crearTarjeta: Genera un elemento DOM completo que representa la tarjeta de un producto.
   * Agrega comportamiento para abrir un modal al hacer clic en ella (Mejora de UX).
   * @param {object} item - El objeto del producto.
   * @returns {HTMLElement} - El nodo HTML de la tarjeta listo para inyectar.
   */
  crearTarjeta(item) {
    const card = RiveraSound.utils.crearElemento('div', { className: 'tarjeta' });
    const imgSrc = this.getImagen(item.id);
    
    // Inyectamos la imagen si está disponible en nuestro mapa, sino mostramos el emoji gigante
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.alt = item.nombre;
      img.style.width = '100%';
      img.style.height = '160px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = 'var(--radio)';
      img.style.marginBottom = '12px';
      card.appendChild(img);
    } else {
      const icono = RiveraSound.utils.crearElemento('div', { className: 'tarjeta-icono', textContent: item.emoji });
      card.appendChild(icono);
    }

    const h3 = RiveraSound.utils.crearElemento('h3', { textContent: item.nombre });
    const p = RiveraSound.utils.crearElemento('p', { textContent: item.marca });
    const precio = RiveraSound.utils.crearElemento('p', { className: 'precio', textContent: RiveraSound.utils.formatearPrecio(item.precio) });
    const stockDiv = RiveraSound.utils.crearElemento('div', { style: 'margin-top:12px;' });
    stockDiv.innerHTML = this.badges[item.stock];

    card.appendChild(h3);
    card.appendChild(p);
    card.appendChild(precio);
    card.appendChild(stockDiv);

    /* Botón de corazón favoritos: se muestra siempre, cambia entre 🤍 vacío y ❤️ lleno */
    const btnFav = document.createElement('button');
    btnFav.className = 'btn-fav';
    btnFav.setAttribute('aria-label', 'Agregar a favoritos');
    /* Consulta el estado actual en favoritos para mostrar el icono correcto */
    btnFav.innerHTML = RiveraSound.favoritos.tiene(item.id) ? '❤️' : '🤍';
    /* Posiciona el botón en la esquina superior derecha de la tarjeta */
    btnFav.style.cssText = 'position:absolute;top:8px;right:8px;background:var(--color-principal);border:1px solid var(--color-borde);border-radius:50%;width:36px;height:36px;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;z-index:2;';
    /* Al hacer clic, alterna el estado y actualiza el icono sin propagar el evento al modal */
    btnFav.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Control de sesión: favoritos es exclusivo para usuarios logueados
      if (!localStorage.getItem('riverasound_usuario')) {
        RiveraSound.utils.notificar('Inicia sesión para guardar este instrumento en tus favoritos.', 'error');
        return;
      }

      const agregado = RiveraSound.favoritos.toggle({ id: item.id, nombre: item.nombre, marca: item.marca, precio: item.precio, emoji: item.emoji, stock: item.stock });
      if (agregado !== null) {
        btnFav.innerHTML = agregado ? '❤️' : '🤍';
        /* Animación de rebote en el corazón */
        btnFav.classList.remove('pop');
        void btnFav.offsetWidth;
        btnFav.classList.add('pop');
        RiveraSound.utils.notificar(agregado ? 'Agregado a favoritos' : 'Eliminado de favoritos', 'info');
      }
    });
    card.appendChild(btnFav);

    // Si el producto tiene stock, añadimos el botón para agregar al carrito
    if (item.stock !== 'agotado') {
      const btnAgregar = document.createElement('button');
      btnAgregar.className = 'btn btn-primario';
      btnAgregar.textContent = 'Agregar al carrito';
      btnAgregar.style.marginTop = '12px';
      btnAgregar.style.fontSize = '0.8rem';
      btnAgregar.style.padding = '8px 18px';
      
      btnAgregar.addEventListener('click', (e) => {
        e.stopPropagation(); // Evitamos que el click active la apertura del modal detalle
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

    // MEJORA DE UX: Clic en la tarjeta abre el modal de detalle del producto
    card.addEventListener('click', () => {
      const modalHtml = `
        <div style="display:flex;flex-direction:column;gap:16px;align-items:center;text-align:center;">
          ${imgSrc ? `<img src="${imgSrc}" alt="${item.nombre}" style="width:100%;max-height:220px;object-fit:cover;border-radius:var(--radio);"/>` : `<div style="font-size:5rem;">${item.emoji}</div>`}
          <div style="width:100%;">
            <p style="font-size:0.9rem;color:var(--color-gris);margin-bottom:4px;">${item.marca}</p>
            <p style="font-size:1.1rem;margin-bottom:12px;line-height:1.4;">${item.desc}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;background:var(--color-principal);border-radius:8px;margin-bottom:12px;">
              <span style="font-weight:bold;font-size:1.25rem;color:var(--color-acento);">${RiveraSound.utils.formatearPrecio(item.precio)}</span>
              ${this.badges[item.stock]}
            </div>
            
            <!-- Simulador de Financiamiento -->
            <div style="padding: 12px; border: 1px solid rgba(255,255,255,0.08); text-align: left; background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 12px;">
              <h4 style="color: var(--color-acento); margin-bottom: 8px; font-size: 0.85rem; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">Simulador de Crédito</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
                <div>
                  <label for="simTarjeta" style="font-size: 0.7rem; display: block; margin-bottom: 3px; color: var(--color-gris);">Tarjeta</label>
                  <select id="simTarjeta" style="width: 100%; padding: 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); background: var(--color-principal); color: var(--color-texto); font-size: 0.75rem;">
                    <option value="visa">Visa (10% int. anual)</option>
                    <option value="mastercard">Mastercard (12% int. anual)</option>
                  </select>
                </div>
                <div>
                  <label for="simCuotas" style="font-size: 0.7rem; display: block; margin-bottom: 3px; color: var(--color-gris);">Cuotas</label>
                  <select id="simCuotas" style="width: 100%; padding: 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.15); background: var(--color-principal); color: var(--color-texto); font-size: 0.75rem;">
                    <option value="1">1 cuota (sin interés)</option>
                    <option value="3">3 cuotas</option>
                    <option value="6">6 cuotas</option>
                    <option value="12">12 cuotas</option>
                  </select>
                </div>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); padding: 8px; border-radius: 4px; font-size: 0.8rem; border: 1px solid rgba(255,255,255,0.05);">
                <span id="simCuotaMonto" style="font-weight: bold; color: var(--color-texto);">1x S/ 0.00</span>
                <span id="simTotalMonto" style="color: var(--color-acento); font-weight: bold;">Total: S/ 0.00</span>
              </div>
            </div>
          </div>
          ${item.stock !== 'agotado' ? `
            <button class="btn btn-primario" id="modalAgregarBtn" style="width:100%;">Agregar al carrito</button>
          ` : ''}
        </div>
      `;
      RiveraSound.modal.abrir(modalHtml, item.nombre);

      // Vincular interactividad del simulador
      const simTarjeta = document.getElementById('simTarjeta');
      const simCuotas = document.getElementById('simCuotas');
      const simCuotaMonto = document.getElementById('simCuotaMonto');
      const simTotalMonto = document.getElementById('simTotalMonto');

      if (simTarjeta && simCuotas && simCuotaMonto && simTotalMonto) {
        const calcularCuotas = () => {
          const precio = item.precio;
          const cuotas = parseInt(simCuotas.value, 10);
          const tarjeta = simTarjeta.value;

          // Visa: 10% anual, Mastercard: 12% anual
          const interesAnual = tarjeta === 'visa' ? 0.10 : 0.12;
          
          let precioTotal = precio;
          if (cuotas > 1) {
            // Interés simple mensual proporcional al número de cuotas (interesAnual / 12)
            const tasaMensual = interesAnual / 12;
            const factorInteres = 1 + (tasaMensual * cuotas);
            precioTotal = precio * factorInteres;
          }

          const cuotaMonto = precioTotal / cuotas;

          simCuotaMonto.textContent = `${cuotas}x S/ ${cuotaMonto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          simTotalMonto.textContent = `Total: ${RiveraSound.utils.formatearPrecio(precioTotal)}`;
        };

        simTarjeta.addEventListener('change', calcularCuotas);
        simCuotas.addEventListener('change', calcularCuotas);
        calcularCuotas(); // Cálculo inicial
      }
      
      // Bindeamos el botón dentro del modal si es que existe
      const modalBtn = document.getElementById('modalAgregarBtn');
      if (modalBtn) {
        modalBtn.addEventListener('click', () => {
          RiveraSound.carrito.agregar({
            id: item.id,
            nombre: item.nombre,
            marca: item.marca,
            precio: item.precio,
            emoji: item.emoji,
            stock: item.stock
          });
          RiveraSound.modal.cerrar();
        });
      }
    });

    return card;
  },

  /* Renderizadores de vistas */

  /**
   * renderCatalogo: Genera el catálogo completo (tarjetas y tabla opcional) aplicando filtros y búsquedas en tiempo real.
   * @param {string} filtro - La categoría seleccionada ('todas', 'viento', 'cuerda', etc.).
   * @param {string} busqueda - Texto buscado (coincide con nombre o marca).
   */
  renderCatalogo(filtro, busqueda) {
    const cont = document.getElementById('catalogoDinamico');
    const tablaBody = document.getElementById('tablaCatalogoBody');
    if (!cont) return;

    // 1. Filtrado lógico de los elementos según criterios
    let items = this.instrumentos;
    if (filtro && filtro !== 'todas') {
      items = items.filter((i) => i.categoria === filtro);
    }
    if (busqueda) {
      const q = busqueda.toLowerCase().trim();
      items = items.filter((i) => i.nombre.toLowerCase().includes(q) || i.marca.toLowerCase().includes(q));
    }

    cont.innerHTML = '';

    /* Muestra contador de resultados */
    const contador = document.getElementById('resultadosContador');
    if (contador) {
      contador.textContent = `Mostrando ${items.length} de ${this.instrumentos.length} instrumentos`;
    }

    // Si no hay productos que coincidan, mostramos un aviso
    if (items.length === 0) {
      cont.innerHTML = '<div style="text-align:center;padding:40px;color:#888;grid-column:1/-1;">No se encontraron instrumentos.</div>';
      if (tablaBody) tablaBody.innerHTML = '';
      return;
    }

    // 2. Renderización escalonada de tarjetas en el grid
    items.forEach((item) => {
      cont.appendChild(this.crearTarjeta(item));
    });

    // Añade delay animado individual a cada tarjeta
    cont.querySelectorAll('.tarjeta').forEach((el, index) => {
      el.style.animationDelay = `${index * 0.08}s`;
    });

    // Scrollear suavemente hasta el grid de resultados
    cont.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // 3. Renderización en formato tabla alternativa si existe el elemento en el HTML
    if (tablaBody) {
      let thtml = '';
      items.forEach((item) => {
        const imgSrc = this.getImagen(item.id);
        const imgHtml = imgSrc 
          ? `<img src="${imgSrc}" alt="${item.nombre}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;display:inline-block;vertical-align:middle;margin-right:6px;">` 
          : `${item.emoji} `;
        
        const btn = item.stock !== 'agotado'
          ? `<button class="btn btn-primario btn-tabla-carrito" data-id="${item.id}" data-nombre="${item.nombre}" data-marca="${item.marca}" data-precio="${item.precio}" data-emoji="${item.emoji}" data-stock="${item.stock}" style="padding:4px 12px;font-size:0.75rem;">🛒</button>`
          : '<span class="badge badge-agotado">Agotado</span>';
          
        thtml += `
          <tr>
            <td>${imgHtml}${item.nombre}</td>
            <td>${item.marca}</td>
            <td>${this.badgeLabels[item.categoria] || item.categoria}</td>
            <td>${RiveraSound.utils.formatearPrecio(item.precio)}</td>
            <td>${this.badges[item.stock]}</td>
            <td>${btn}</td>
          </tr>
        `;
      });
      
      tablaBody.innerHTML = thtml;

      // Evento Click para los botones de compra rápidos dentro de la tabla
      tablaBody.querySelectorAll('.btn-tabla-carrito').forEach((btn) => {
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

  /**
   * renderOfertas: Filtra instrumentos con precio < S/1000 y stock disponible,
   * los inyecta en un carrusel horizontal con scroll y botones de navegación.
   */
  renderOfertas() {
    const track = document.getElementById('ofertasTrack');
    if (!track) return;

    /* Filtra ofertas: precio < S/1000 y stock disponible */
    const ofertas = this.instrumentos.filter((i) => i.precio < 1000 && i.stock === 'disponible');
    track.innerHTML = '';

    /* Renderiza cada tarjeta dentro del track del carrusel */
    ofertas.forEach((item) => {
      const card = this.crearTarjeta(item);
      card.style.flex = '0 0 280px';
      track.appendChild(card);
    });

    /* Agrega indicadores (puntos) debajo del carrusel */
    this._agregarIndicadoresCarrusel(track, ofertas.length);

    /* Botones de navegación del carrusel */
    this._vincularBotonesCarrusel(track);
  },

  /**
   * _agregarIndicadoresCarrusel: Crea puntos indicadores que reflejan la posición actual.
   */
  _agregarIndicadoresCarrusel(track, total) {
    if (total === 0) return;

    /* Elimina indicadores anteriores si existen */
    const contenedorViejo = document.querySelector('.carrusel-indicadores');
    if (contenedorViejo) contenedorViejo.remove();

    const contenedor = document.createElement('div');
    contenedor.className = 'carrusel-indicadores';

    for (let i = 0; i < total; i++) {
      const punto = document.createElement('button');
      punto.className = 'carrusel-indicador' + (i === 0 ? ' activo' : '');
      punto.dataset.indice = i;
      punto.addEventListener('click', () => {
        const card = track.children[i];
        if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      });
      contenedor.appendChild(punto);
    }

    track.parentElement.after(contenedor);
  },

  /**
   * _vincularBotonesCarrusel: Vincula botones prev/next, auto-slide y actualiza indicadores al scrollear.
   */
  _vincularBotonesCarrusel(track) {
    const prev = document.getElementById('ofertasPrev');
    const next = document.getElementById('ofertasNext');
    if (!prev || !next) return;

    let intervalo = null;

    /* Desplaza el carrusel automáticamente cada 4 segundos */
    const iniciarAutoSlide = () => {
      detenerAutoSlide();
      intervalo = setInterval(() => {
        const anchoCard = track.children[0]?.offsetWidth || 1;
        const gap = 20;
        /* Si llegó al final, vuelve al inicio */
        if (track.scrollLeft + track.offsetWidth >= track.scrollWidth - 10) {
          track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          track.scrollBy({ left: anchoCard + gap, behavior: 'smooth' });
        }
      }, 4000);
    };

    const detenerAutoSlide = () => {
      if (intervalo) clearInterval(intervalo);
      intervalo = null;
    };

    /* Pausa al hover y reanuda al salir */
    track.addEventListener('mouseenter', detenerAutoSlide);
    track.addEventListener('mouseleave', iniciarAutoSlide);

    /* Función para actualizar qué punto indicador está activo */
    const actualizarIndicador = () => {
      const puntos = document.querySelectorAll('.carrusel-indicador');
      if (!puntos.length) return;
      const anchoCard = track.children[0]?.offsetWidth || 1;
      const idx = Math.round(track.scrollLeft / (anchoCard + 20));
      puntos.forEach((p, i) => p.classList.toggle('activo', i === idx));
    };

    track.addEventListener('scroll', actualizarIndicador);

    /* Botón anterior: desplaza a la card anterior */
    prev.addEventListener('click', () => {
      detenerAutoSlide();
      const anchoCard = track.children[0]?.offsetWidth || 1;
      track.scrollBy({ left: -(anchoCard + 20), behavior: 'smooth' });
    });

    /* Botón siguiente: desplaza a la card siguiente */
    next.addEventListener('click', () => {
      detenerAutoSlide();
      const anchoCard = track.children[0]?.offsetWidth || 1;
      track.scrollBy({ left: anchoCard + 20, behavior: 'smooth' });
    });

    /* Arranca auto-slide */
    iniciarAutoSlide();
  },

  /**
   * renderBlog: Renderiza los artículos del blog. Abre un modal explicativo al hacer clic.
   */
  renderBlog() {
    const cont = document.getElementById('blogGrid');
    if (!cont) return;
    
    let html = '';
    this.blogs.forEach((post) => {
      html += `
        <div class="blog-tarjeta reveal">
          <div class="blog-tarjeta-body">
            <h3>${post.titulo}</h3>
            <p>${post.resumen}</p>
            <span class="blog-fecha">${post.fecha}</span>
          </div>
        </div>
      `;
    });
    
    cont.innerHTML = html;

    // Registra clic para abrir modal detallado de artículo de blog
    cont.querySelectorAll('.blog-tarjeta').forEach((el, index) => {
      el.addEventListener('click', () => {
        const post = this.blogs[index];
        if (post) {
          RiveraSound.modal.abrir(`
            <div class="modal-body">${post.contenido}</div>
            <p style="color:var(--color-gris);font-size:0.8rem;margin-top:16px;">Publicado: ${post.fecha}</p>
          `, `${post.titulo}`);
        }
      });
    });
  },

  /**
   * renderDestacados: Muestra una selección destacada fija de 3 instrumentos en el Home.
   */
  renderDestacados() {
    const cont = document.getElementById('destacadosGrid');
    if (!cont) return;
    
    // Filtramos manualmente 3 elementos emblemáticos del catálogo por ID
    const destacados = this.instrumentos.filter((i) => ['sax-alto-yamaha', 'guitarra-clasica-fender', 'bateria-pearl'].indexOf(i.id) !== -1);
    cont.innerHTML = '';
    
    destacados.forEach((item) => {
      cont.appendChild(this.crearTarjeta(item));
    });
  },

  /* Inicialización y eventos */

  /**
   * iniciar: Coordina el renderizado inicial de los componentes cargados en el DOM dinámicamente.
   */
  iniciar() {
    this.renderDestacados();

    const catalogoCont = document.getElementById('catalogoDinamico');
    if (catalogoCont) {
      const filtroActivo = document.querySelector('.btn-filtro.activo');
      const cat = filtroActivo ? (filtroActivo.getAttribute('data-categoria') || 'todas') : 'todas';
      this.renderCatalogo(cat, '');
      this.initFiltros();
    }

    /* Renderiza carrusel de ofertas si existe el track en la página */
    const ofertasTrack = document.getElementById('ofertasTrack');
    if (ofertasTrack) {
      this.renderOfertas();
    }

    const blogCont = document.getElementById('blogGrid');
    if (blogCont) {
      this.renderBlog();
    }
  },

  /**
   * initFiltros: Escucha clicks en los botones de categoría y escritura en búsqueda.
   * Usa event delegation con flag data-listener para no acumular listeners al recargar la página vía SPA.
   */
  initFiltros() {
    const filtros = document.getElementById('filtrosCategoria');
    const busqueda = document.getElementById('busquedaInstrumento');
    if (!filtros && !busqueda) return;

    /* Delegación: un solo listener en el contenedor, funciona aunque los botones se reemplacen */
    if (filtros && !filtros.hasAttribute('data-listener')) {
      filtros.setAttribute('data-listener', '1');
      filtros.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-filtro');
        if (!btn) return;
        filtros.querySelectorAll('.btn-filtro').forEach((b) => b.classList.remove('activo'));
        btn.classList.add('activo');
        const cat = btn.getAttribute('data-categoria') || 'todas';
        const busq = busqueda ? busqueda.value : '';
        this.renderCatalogo(cat, busq);
      });
    }

    if (busqueda && !busqueda.hasAttribute('data-listener')) {
      busqueda.setAttribute('data-listener', '1');
      busqueda.addEventListener('input', RiveraSound.utils.debounce(() => {
        const activeBtn = filtros ? filtros.querySelector('.btn-filtro.activo') : null;
        const cat = activeBtn ? (activeBtn.getAttribute('data-categoria') || 'todas') : 'todas';
        this.renderCatalogo(cat, busqueda.value);
      }, 300));
    }
  }
};
