# RiveraSound - Documentacion del Proyecto

## Descripcion General

RiveraSound es un sitio web de comercio electronico para una tienda de instrumentos musicales (Importaciones Rivera S.A.C.).
Es una Single Page Application (SPA) que funciona completamente del lado del cliente (frontend),
con persistencia de datos en localStorage del navegador. No requiere servidor backend ni bases de datos.

---

## Estructura del Proyecto

```
RiveraSound/
├── PaginasHTML/                  # Fragmentos HTML parciales inyectados por el router
│   ├── Index/Index.html          # Pagina principal del SPA (entry point)
│   ├── Blog/blog.html            # Blog musical (articulos dinamicos)
│   ├── Catalogo/catalogo.html    # Catalogo de instrumentos con filtros
│   ├── Compras/carrito.html      # Carrito de compras
│   ├── Contacto/contacto.html    # Formulario de contacto + tabla de horarios
│   ├── Cuenta/cuenta.html        # Login, registro, perfil y pedidos (tabs)
│   ├── Nosotros/nosotros.html    # Informacion de la empresa con contadores
│   └── Ofertas/ofertas.html      # Productos en oferta (< S/1000)
├── css/
│   ├── style.css                 # Variables CSS, reset, layout, dark mode, responsive
│   ├── menu.css                  # Header, logo, menu responsive y hamburguesa
│   ├── modal.css                 # Modales, notificaciones toast, sidebar del carrito
│   ├── animaciones.css           # Keyframes, scroll reveal, hover effects
│   └── grid-flex.css             # Clases utilitarias Grid y Flexbox
├── js/
│   ├── utils.js                  # Utilidades: notificaciones, debounce, DOM helpers
│   ├── validaciones.js           # Validacion de formularios en tiempo real
│   ├── carrito.js                # Gestion del carrito + historial de pedidos (localStorage)
│   ├── modal.js                  # Sistema de modales (abrir/cerrar/Escape)
│   ├── menu.js                   # Menu hamburguesa responsive
│   ├── catalogo.js               # Catalogo, ofertas, blog y destacados (datos hardcodeados)
│   ├── router.js                 # Enrutador SPA por hash (#) + login/registro local
│   ├── theme.js                  # Modo claro/oscuro y boton volver arriba
│   └── app.js                    # Punto de entrada: inicializa todo
├── img/                          # Imagenes de productos
├── DOCUMENTACION.md              # Este archivo
├── .gitignore
└── .idea/                        # Configuracion del IDE
```

---

## Tecnologias Utilizadas

### Frontend
- **HTML5** - Estructura semantica con meta tags, formularios, tablas
- **CSS3** - Flexbox, Grid, animaciones keyframes, transiciones, diseno responsivo, modo claro/oscuro
- **JavaScript (Vanilla)** - SPA Router, manipulacion del DOM, LocalStorage, Fetch API, Intersection Observer

### Persistencia
- **localStorage** - Almacenamiento local en el navegador para: carrito de compras, usuarios registrados,
  historial de pedidos y preferencia de tema (claro/oscuro)

---

## Sistema de CSS Modular

El CSS esta disenado para ser modular por pagina y por componente. Cada tarjeta,
titulo, boton o badge puede tener su propio color sin afectar a los demas.

### Variables Globales
```css
:root {
  --color-acento: #e8b84b;           /* Dorado global */
  --color-principal: #1a1a2e;        /* Fondo oscuro */
  --fuente-titulo: 'Georgia', serif;
}
```

### Personalizacion por Pagina
Se usa el atributo `data-page` en `<body>` para cambiar los colores por seccion:

```css
body[data-page="instrumentos"] { --card-border-color: #4a90d9; --page-acento: #4a90d9; }
body[data-page="ofertas"]     { --card-border-color: #e74c3c; --page-acento: #e74c3c; }
```

---

## Autenticacion (Login Local)

El sistema de login funciona 100% en el navegador usando localStorage:

1. **Usuario demo**: `demo@riverasound.pe` / `demo123` (hardcodeado)
2. **Registro**: Los nuevos usuarios se guardan en `localStorage` como `riverasound_usuarios`
3. **Sesion**: Al iniciar sesion, los datos del usuario se guardan en `riverasound_usuario`
4. **Persistencia**: La sesion se mantiene al recargar la pagina

Flujo:
```
Login → Validar contra localStorage → Guardar sesion → Mostrar perfil → Navegacion
```

---

## Carrito de Compras y Pedidos

### Carrito
- Usa `localStorage` con clave `riverasound_carrito`
- Array de objetos con: id, nombre, marca, precio, emoji, cantidad
- Operaciones: agregar, eliminar, sumar/restar cantidad, vaciar
- Total calculado como: `sum(precio * cantidad)`

### Pedidos (Historial Local)
- Al realizar una compra, se genera un pedido con:
  - ID unico (ej: `PED-XXXX-XXXX`)
  - Fecha, items, total
  - Estado inicial: "Pendiente"
- Se guarda en `localStorage` como `riverasound_pedidos`
- Se pueden cambiar los estados: Pendiente, En envío, Entregado, Recogido en tienda, Cancelado
- Visibles en "Mis Pedidos" dentro de la seccion Cuenta

---

## Enrutamiento SPA

El router (`js/router.js`) escucha cambios en el hash de la URL (`#`) y carga el
HTML parcial correspondiente dentro de `<div id="app">` sin recargar la pagina.

| Hash | Vista | Archivo HTML |
|------|-------|-------------|
| `#inicio` | Pagina principal | Renderizado inline |
| `#instrumentos` | Catalogo | `PaginasHTML/Catalogo/catalogo.html` |
| `#ofertas` | Ofertas | `PaginasHTML/Ofertas/ofertas.html` |
| `#nosotros` | Nosotros | `PaginasHTML/Nosotros/nosotros.html` |
| `#contacto` | Contacto | `PaginasHTML/Contacto/contacto.html` |
| `#blog` | Blog | `PaginasHTML/Blog/blog.html` |
| `#carrito` | Carrito | `PaginasHTML/Compras/carrito.html` |
| `#cuenta` | Mi Cuenta | `PaginasHTML/Cuenta/cuenta.html` |
| `#cuenta-login` | Login | `PaginasHTML/Cuenta/cuenta.html` (tab login) |
| `#cuenta-registro` | Registro | `PaginasHTML/Cuenta/cuenta.html` (tab registro) |
| `#cuenta-perfil` | Perfil | `PaginasHTML/Cuenta/cuenta.html` (tab perfil) |
| `#cuenta-pedidos` | Pedidos | `PaginasHTML/Cuenta/cuenta.html` (tab pedidos) |

---

## Instalacion y Ejecucion

### Opcion 1: Servidor HTTP (Python)
```bash
cd RiveraSound
python3 -m http.server 8080
# Abrir: http://localhost:8080/PaginasHTML/Index/Index.html
```

### Opcion 2: Servidor HTTP (Node.js)
```bash
cd RiveraSound
npx serve .
# Abrir: http://localhost:3000
```

### Opcion 3: Abrir directamente
Solo funciona con servidor HTTP (no usar file://). El SPA necesita fetch() para cargar los partials HTML.

---

## Funcionalidades Principales

- **Catalogo interactivo**: 38 productos en 4 categorias (Viento, Cuerda, Percusion, Teclado) con filtros y busqueda en tiempo real
- **Carrito de compras**: Sidebar deslizante, badge con contador, persistencia en localStorage
- **Autenticacion**: Login con usuario demo y registro de nuevos usuarios (todo local)
- **Historial de pedidos**: Visualizacion y cambio de estados (Pendiente, En envio, Entregado, Recogido, Cancelado)
- **Modo claro/oscuro**: Alternable con persistencia de preferencia
- **Formularios con validacion**: Validacion en tiempo real con feedback visual (clases .error y .success)
- **Blog**: Articulos musicales con apertura en modal
- **Diseno responsivo**: 4 breakpoints (1401, 900, 600, 400px) con menu hamburguesa en movil
- **Animaciones**: Scroll reveal, contadores incrementales, hover effects, transiciones
- **Feedback**: Boton flotante en pagina de contacto para enviar comentarios
- **Modal de compra**: Confirmacion visual al realizar un pedido

---

## Notas Adicionales

### Sobre las Imagenes
Las imagenes de productos se almacenan en `/img/` y se mapean por ID del producto en `catalogo.js`.

### Sobre el Dark Mode
El sitio detecta automaticamente la preferencia del sistema (`prefers-color-scheme`)
y adapta los colores. El boton de cambio de tema permite alternar manualmente.

### Sobre los Contadores Animados
En la pagina "Nosotros", los contadores numericos (anos, instrumentos vendidos, etc.)
usan IntersectionObserver para animarse desde 0 hasta su valor objetivo cuando
son visibles en pantalla.

### Sobre el Scroll Reveal
Los elementos con clase `.reveal` aparecen con animacion fade-in cuando
entran al viewport, usando IntersectionObserver para eficiencia.
