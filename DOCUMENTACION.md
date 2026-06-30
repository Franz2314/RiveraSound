# RiveraSound - Documentación del Proyecto

## 📋 Descripción General

RiveraSound es un sitio web de comercio electrónico para una tienda de instrumentos musicales (Importaciones Rivera S.A.C.). 
Es una Single Page Application (SPA) con backend en Node.js/Express y tres bases de datos.

---

## 🏗️ Estructura del Proyecto

```
RiveraSound/
├── Index.html                    # Punto de entrada SPA (carga header, footer, modales, scripts)
├── PaginasHTML/                  # Fragmentos HTML parciales inyectados por el router
│   ├── Index/Index.html          # (Archivo principal, no es snippet)
│   ├── Blog/blog.html            # Blog musical (artículos dinámicos)
│   ├── Catalogo/catalogo.html    # Catálogo de instrumentos con filtros
│   ├── Compras/carrito.html      # Carrito de compras
│   ├── Contacto/contacto.html    # Formulario de contacto + tabla de horarios
│   ├── Cuenta/cuenta.html        # Login, registro, perfil y pedidos (tabs)
│   ├── Nosotros/nosotros.html    # Información de la empresa con contadores
│   └── Ofertas/ofertas.html      # Productos en oferta (< S/1000)
├── css/
│   ├── style.css                 # Variables CSS, reset, layout, dark mode, responsive
│   ├── menu.css                  # Header, logo, menú responsive y hamburguesa
│   ├── modal.css                 # Modales, notificaciones toast, sidebar del carrito
│   ├── animaciones.css           # Keyframes, scroll reveal, hover effects
│   └── grid-flex.css             # Clases utilitarias Grid y Flexbox
├── js/
│   ├── utils.js                  # Utilidades: notificaciones, debounce, DOM helpers
│   ├── api.js                    # Capa de comunicación con el backend REST
│   ├── validaciones.js           # Validación de formularios en tiempo real
│   ├── carrito.js                # Gestión del carrito de compras (localStorage + API)
│   ├── modal.js                  # Sistema de modales (abrir/cerrar/Escape)
│   ├── menu.js                   # Menú hamburguesa responsive
│   ├── catalogo.js              # Catálogo, ofertas, blog y destacados
│   ├── router.js                 # Enrutador SPA por hash (#)
│   └── app.js                    # Punto de entrada: inicializa todo
├── img/                          # Imágenes de productos (descargadas de GitHub)
├── backend/
│   ├── server.js                 # Servidor Express + montaje de rutas
│   ├── package.json              # Dependencias Node.js
│   ├── Dockerfile                # Build para contenedor
│   ├── .env                      # Variables de entorno (BBDD, JWT, puerto)
│   ├── config/
│   │   ├── postgres.js           # Pool de conexiones PostgreSQL
│   │   ├── mongodb.js            # Conexión Mongoose MongoDB
│   │   └── cassandra.js          # Cliente Cassandra
│   ├── models/
│   │   ├── postgres/esquema.sql  # DDL completo (categorias, productos, usuarios, pedidos, carrito)
│   │   ├── mongo/modelos.js      # Schemas Mongoose (Producto, Blog, Resena)
│   │   └── cassandra/inicializacion.cql  # Keyspace y tablas Cassandra
│   ├── controllers/
│   │   ├── productosController.js
│   │   ├── usuariosController.js
│   │   ├── pedidosController.js
│   │   ├── blogController.js
│   │   └── carritoController.js
│   ├── routes/
│   │   ├── productos.js
│   │   ├── usuarios.js
│   │   ├── pedidos.js
│   │   ├── blog.js
│   │   └── carrito.js
│   └── data/
│       └── productosFallback.js  # Datos mock para cuando PostgreSQL no está disponible
├── docker-compose.yml            # Orquestación: Postgres + MongoDB + Cassandra + App
├── .env                          # API Keys (XAI, ANTHROPIC, OPENAI, etc.)
├── .gitignore
└── DOCUMENTACION.md              # Este archivo
```

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **HTML5** - Estructura semántica con meta tags, formularios, tablas, multimedia
- **CSS3** - Flexbox, Grid, animaciones, transiciones, diseño responsivo, dark mode
- **JavaScript (Vanilla)** - SPA Router, DOM manipulation, Fetch API, localStorage

### Backend
- **Node.js** + **Express 5** - API RESTful
- **PostgreSQL 16** - Datos transaccionales (productos, usuarios, pedidos, carrito)
- **MongoDB 7** - Documentos (blog, reseñas, catálogo extendido)
- **Cassandra 5** - Alta escritura (logs de vistas, sesiones, carritos abandonados)

### Infraestructura
- **Docker** + **Docker Compose** - Contenedores para desarrollo y producción
- **JWT** - Autenticación basada en tokens (pendiente implementación completa)

---

## 🎨 Sistema de CSS Modular

El CSS está diseñado para ser **modular por página y por componente**. Cada tarjeta, 
título, botón o badge puede tener su propio color sin afectar a los demás.

### Variables Globales
```css
:root {
  --color-acento: #e8b84b;           /* Dorado global */
  --color-principal: #1a1a2e;        /* Fondo oscuro */
  --fuente-titulo: 'Georgia', serif;
  /* ... más variables base ... */
}
```

### Variables Modulares por Componente
```css
:root {
  --page-acento: var(--color-acento);           /* Color de acento de la página actual */
  --card-border-color: var(--color-acento);     /* Borde superior de tarjetas */
  --card-titulo-color: var(--color-principal);  /* Color del título en tarjetas */
  --card-precio-color: var(--color-acento);     /* Color del precio */
  --card-hover-color: var(--color-acento);      /* Color al hacer hover */
  --section-title-color: var(--color-principal);/* Color del título de sección */
  --btn-primario-bg: var(--color-acento);       /* Fondo del botón primario */
  /* ... más variables ... */
}
```

### Personalización por Página
Se usa el atributo `data-page` en `<body>` para cambiar los colores por sección:

```css
/* Catálogo - Azul */
body[data-page="instrumentos"] {
  --card-border-color: #4a90d9;
  --page-acento: #4a90d9;
}

/* Ofertas - Rojo */
body[data-page="ofertas"] {
  --card-border-color: #e74c3c;
  --page-acento: #e74c3c;
}
```

### Personalización por Elemento (Inline)
Cada tarjeta/caja puede tener su propio color inline:
```html
<div class="tarjeta" style="--card-border-color: #ff6600; --card-hover-color: #ff6600;">
```

---

## 🗄️ Base de Datos

### PostgreSQL (Principal)
| Tabla | Descripción |
|-------|-------------|
| `categorias` | Categorías de instrumentos (viento, cuerda, percusión, teclado) |
| `productos` | Catálogo de instrumentos con precio, stock, marca |
| `usuarios` | Cuentas de usuario con hash PBKDF2 |
| `pedidos` | Cabecera de pedidos con estado y total |
| `detalle_pedidos` | Líneas de cada pedido (producto, cantidad, subtotal) |
| `carrito_items` | Carrito de compras por usuario (con FK a productos) |
| `stock_log` | Historial de cambios de stock |

### MongoDB (Documental)
| Colección | Descripción |
|-----------|-------------|
| `Producto` | Catálogo extendido con especificaciones, imágenes, tags |
| `Blog` | Artículos del blog con contenido HTML |
| `Resena` | Reseñas de productos con puntuación 1-5 |

### Cassandra (Alta escritura)
| Tabla | Descripción |
|-------|-------------|
| `sesiones` | Sesiones de usuario (token, expiración) |
| `logs_vistas_producto` | Logs de visitas a productos |
| `carritos_abandonados` | Carritos no finalizados |
| `notificaciones` | Notificaciones push |

---

## 🔐 Autenticación (Login)

El sistema de login usa:
1. **Frontend**: Formulario en `cuenta.html` → JS llama a `POST /api/usuarios/login`
2. **Backend**: `usuariosController.login` verifica hash PBKDF2 contra PostgreSQL
3. **Token**: Se genera token aleatorio de 32 bytes (pendiente migrar a JWT)
4. **Sesión**: El token se guarda en `localStorage` como `riverasound_token`
5. **Perfil**: Los datos del usuario se cachean en `localStorage` como `riverasound_usuario`

Flujo:
```
Login → API (verificar hash) → Token → localStorage → Badge carrito → Navegación
```

---

## 🛒 Carrito de Compras

### Funcionamiento
1. **Modo Local (sin login)**: Usa `localStorage` con clave `riverasound_carrito`
2. **Modo API (con login)**: Sincroniza con `carrito_items` en PostgreSQL vía REST API
3. **Transición**: Cuando el usuario inicia sesión, el carrito local se sincroniza con el del servidor

### Endpoints API
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/carrito` | Lista todos los items del carrito del usuario |
| POST | `/api/carrito` | Agrega un producto (body: `{producto_id, cantidad}`) |
| PUT | `/api/carrito/:id` | Actualiza cantidad de un item |
| DELETE | `/api/carrito/:id` | Elimina un item del carrito |
| DELETE | `/api/carrito` | Vacía todo el carrito |
| GET | `/api/carrito/total` | Obtiene total, items y unidades |

### Array List
El carrito maneja un array de objetos con la siguiente estructura:
```javascript
{
  id: "sax-alto-yamaha",     // ID del producto (slug)
  carritoId: 5,               // ID en la tabla carrito_items (cuando usa API)
  nombre: "Saxofón Alto",     // Nombre del producto
  marca: "Yamaha YAS-280",    // Marca / modelo
  precio: 2850,               // Precio unitario
  emoji: "🎷",                // Emoji representativo
  cantidad: 2,                // Cantidad seleccionada
  stock: "disponible"         // Estado del stock
}
```
El total se calcula como: `sum(precio * cantidad)` de cada item.

---

## 🌐 Enrutamiento SPA

El router (`js/router.js`) escucha cambios en el hash de la URL (`#`) y carga el 
HTML parcial correspondiente dentro de `<div id="app">` sin recargar la página.

| Hash | Vista | Archivo HTML |
|------|-------|-------------|
| `#inicio` | Página principal | Renderizado inline |
| `#instrumentos` | Catálogo | `PaginasHTML/Catalogo/catalogo.html` |
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

## ⚙️ Instalación y Ejecución

### Desarrollo (con Docker)
```bash
# Clonar repositorio
git clone https://github.com/Franz2314/Proyectito-1.git
cd RiveraSound

# Iniciar todos los servicios
docker compose up -d

# Acceder
# Frontend: http://localhost:3000
# API: http://localhost:3000/api
```

### Desarrollo (sin Docker)
```bash
# Requisitos: Node.js 20+, PostgreSQL 16+, MongoDB 7+, Cassandra 5+

# Instalar dependencias
cd backend && npm install

# Configurar .env (ver backend/.env.example)
# Iniciar servidor
npm start
```

---

## 📝 Notas Adicionales

### Sobre las Imágenes
Las imágenes de productos se almacenan en `/img/` y se sirven como estáticas 
desde la raíz del proyecto. Se mapean por ID del producto en `catalogo.js`.

### Sobre el Dark Mode
El sitio detecta automáticamente la preferencia del sistema (`prefers-color-scheme`)
y adapta los colores. Los elementos con `--card-fondo`, `--color-blanco`, etc.
se ajustan con el media query correspondiente.

### Sobre los Contadores Animados
En la página "Nosotros", los contadores numéricos (años, instrumentos vendidos, etc.)
usan IntersectionObserver para animarse desde 0 hasta su valor objetivo cuando
son visibles en pantalla.

### Sobre el Scroll Reveal
Los elementos con clase `.reveal` aparecen con animación fade-in cuando
entran al viewport, usando IntersectionObserver para eficiencia.
