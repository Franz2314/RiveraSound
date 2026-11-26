# RiveraSound · Backend y bases de datos

API REST en **Node.js + Express** que conecta el sitio de RiveraSound con **4 motores de base de datos**:

| Base de datos | Estado | Qué guarda en el proyecto | Por qué ese motor |
| --- | --- | --- | --- |
| **PostgreSQL** | ✅ Completa y conectada al sitio | Catálogo, usuarios, pedidos, favoritos, mensajes, boletín | Datos relacionales con transacciones (un pedido se guarda completo o no se guarda) |
| **MongoDB** | 🔌 Conexión lista + script | Reseñas de instrumentos y artículos del blog | Documentos de forma flexible (texto, etiquetas, fotos) |
| **Cassandra** | 🔌 Conexión lista + script | Historial de actividad (qué instrumentos ve cada usuario) | Muchas escrituras ordenadas por tiempo |
| **Oracle** | 🔌 Conexión lista + script | Réplica del catálogo para reportes | Comparar sintaxis Oracle vs PostgreSQL |

El sitio funciona en **modo híbrido**: si el backend está encendido, todo se guarda en PostgreSQL; si está apagado, el sitio sigue funcionando como antes con `localStorage`.

---

## 1. Estructura

```
backend/
├── package.json              Dependencias y comandos (npm start, npm run db:init...)
├── .env.example              Plantilla de configuración (copiar como .env)
├── src/
│   ├── server.js             Arranca el servidor y muestra el estado de las 4 BD
│   ├── app.js                Rutas /api/* y publica el sitio (css, js, img, PaginasHTML)
│   ├── config/env.js         Lee el archivo .env
│   ├── db/                   ← CONEXIONES
│   │   ├── postgres.js       Pool de conexiones, consultas y transacciones
│   │   ├── mongodb.js        Cliente de MongoDB
│   │   ├── cassandra.js      Cliente de Cassandra (WSL o Docker)
│   │   ├── oracle.js         Pool de Oracle (modo Thin, sin Instant Client)
│   │   └── index.js          Prueba las 4 conexiones a la vez
│   ├── repositorios/         Consultas SQL de PostgreSQL por entidad
│   ├── rutas/                Endpoints de la API
│   └── middlewares/errores.js  Traduce errores de PostgreSQL a mensajes en español
├── scripts/
│   ├── inicializar-postgres.js   npm run db:init  → crea todo PostgreSQL
│   └── probar-conexiones.js      npm run db:probar → prueba las 4 BD
└── sql/
    ├── postgres/             00 a 04: base, esquema, funciones, datos y seguridad
    ├── mongodb/              inicializar.mongodb.js (mongosh / Compass)
    ├── cassandra/            esquema.cql (cqlsh)
    └── oracle/               01_esquema.sql (SQL*Plus / SQL Developer / APEX)
```

El frontend solo tiene un archivo nuevo, `js/api.js`. Además se agregaron unas pocas líneas marcadas con `CON BACKEND` en `router.js`, `carrito.js`, `admin.js` y `favoritos.js`.

---

## 2. Puesta en marcha (Windows)

### Paso 1 · Requisitos
- **Node.js 18 o superior**: `node -v` en la terminal.
- **PostgreSQL** instalado y con el servicio encendido. Necesitas saber la contraseña del usuario `postgres`.

### Paso 2 · Instalar dependencias
```powershell
cd RiveraSound\backend
npm install
```

### Paso 3 · Configurar
```powershell
copy .env.example .env
```
Abre `.env` y pon tu contraseña de PostgreSQL en `PG_ADMIN_PASSWORD`. Lo demás puede quedar igual.

### Paso 4 · Crear la base de datos (una sola vez)
```powershell
npm run db:init
```
Ejecuta en orden los scripts de `sql/postgres/`. Debe terminar con `Listo. Base "riverasound" creada...`.

> **Ojo:** volver a ejecutarlo **borra los datos** y deja solo los de ejemplo.

<details>
<summary>Alternativa: hacerlo a mano en pgAdmin</summary>

1. Query Tool sobre la base **postgres** (como `postgres`): ejecuta `00_crear_base.sql`.
2. Conéctate a la base **riverasound** con el usuario `rs_app` (clave `rs_app_123`) y ejecuta en orden `01_esquema.sql`, `02_funciones.sql` y `03_datos.sql`.
3. En **riverasound** como `postgres`: ejecuta `04_seguridad.sql`.
</details>

### Paso 5 · Encender el servidor
```powershell
npm start
```
En la consola verás:
```
RiveraSound corriendo en http://localhost:3000

Estado de las bases de datos:
  postgres   OK  PostgreSQL 16...
  mongodb    — deshabilitada en .env
  cassandra  — deshabilitada en .env
  oracle     — deshabilitada en .env
```

### Paso 6 · Abrir el sitio
Ve a **http://localhost:3000**. Si abres la consola del navegador (F12), debe decir `[API] Conectado al backend: datos en PostgreSQL.`

También funciona si abres el sitio con Live Server o `python -m http.server`, siempre que el backend esté encendido en el puerto 3000.

**Usuarios de prueba**

| Correo | Contraseña | Rol |
| --- | --- | --- |
| `demo@riverasound.pe` | `demo123` | admin (ve el panel de Administración) |
| `cliente@riverasound.pe` | `cliente123` | cliente (ya tiene 2 pedidos y datos de envío) |

---

## 3. Lo que hace PostgreSQL (para la exposición)

| Script | Contenido |
| --- | --- |
| `01_esquema.sql` | 8 tablas con PK, FK, `CHECK`, `UNIQUE` sin importar mayúsculas e índices |
| `02_funciones.sql` | `fn_registrar_usuario` y `fn_validar_login` (contraseña con **bcrypt** vía `pgcrypto`), `fn_crear_pedido` (**transacción**: valida stock, usa precios de la BD y si algo falla no guarda nada), procedimiento `sp_cambiar_estado_pedido`, **trigger** `actualizado_en` y 3 **vistas** de reportes |
| `03_datos.sql` | Los 35 instrumentos de `catalogo.js`, 2 usuarios y 2 pedidos de ejemplo |
| `04_seguridad.sql` | Rol de grupo `rs_lector` (solo lectura, **sin** acceso a `password_hash`) y usuario `rs_reportes` que lo hereda |

Para comprobarlo en psql o pgAdmin:
```sql
SELECT * FROM v_ventas_por_categoria;
SELECT * FROM fn_validar_login('demo@riverasound.pe', 'demo123');
CALL sp_cambiar_estado_pedido('PED-DEMO0001-AAAA', 'En envío');
SELECT left(password_hash, 7) FROM usuarios;   -- $2a$06$ → bcrypt, nunca texto plano
```

**Backup y restauración** (en la carpeta `bin` de PostgreSQL o con pgAdmin → Backup):
```powershell
pg_dump -U postgres -F c -f riverasound.backup riverasound
pg_restore -U postgres -d riverasound --clean riverasound.backup
```

---

## 4. Endpoints de la API

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/api/salud` | Estado de las 4 bases de datos |
| GET | `/api/instrumentos?categoria=viento&buscar=yamaha` | Catálogo con filtros |
| GET · POST · PUT · DELETE | `/api/instrumentos[/:id]` | CRUD del panel admin (DELETE = borrado lógico) |
| POST | `/api/usuarios/registro` · `/api/usuarios/login` | Registro e inicio de sesión |
| PUT | `/api/usuarios/:correo/envio` | Teléfono, dirección y ciudad |
| GET · POST | `/api/pedidos[?correo=]` | Listar y crear pedidos |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado (llama al procedimiento) |
| GET · POST · DELETE | `/api/favoritos` | Lista de deseos |
| GET · POST | `/api/mensajes` | Contacto, importación y feedback |
| POST | `/api/suscriptores` | Boletín |
| GET | `/api/reportes/ventas-por-categoria` · `/api/reportes/top-instrumentos` | Reportes (vistas) |

---

## 5. Activar MongoDB, Cassandra y Oracle

Las tres conexiones ya están programadas. Solo hay que encender cada motor, crear sus objetos y habilitarlo en `.env`. Después, **`npm run db:probar`** te dice si conectó.

### MongoDB
1. Con MongoDB encendido, ejecuta `sql/mongodb/inicializar.mongodb.js`. En Compass: pestaña **Mongosh** → pegar el contenido.
2. En `.env`: `MONGO_HABILITADO=true`.

### Cassandra (WSL/Ubuntu o Docker)
1. Enciende Cassandra:
   - WSL: `sudo systemctl start cassandra`
   - Docker: `docker start cassandra-node`
2. Ejecuta el esquema:
   - WSL: `cqlsh -f esquema.cql`
   - Docker: `docker cp esquema.cql cassandra-node:/esquema.cql` y luego `docker exec -it cassandra-node cqlsh -f /esquema.cql`
3. En `.env`: `CASSANDRA_HABILITADO=true`. Si activaste usuarios en `cassandra.yaml`, llena también `CASSANDRA_USUARIO` y `CASSANDRA_CLAVE`.

> Si Cassandra está en WSL y Windows no lo alcanza en `127.0.0.1`, pon en `CASSANDRA_PUNTOS_CONTACTO` la IP que muestra `hostname -I` dentro de Ubuntu.

### Oracle
1. Con Oracle XE encendido, ejecuta `sql/oracle/01_esquema.sql`: la parte 1 como SYSTEM y la parte 2 como `riverasound`.
2. En `.env`: `ORACLE_HABILITADO=true`. Revisa `ORACLE_CADENA`: es `XEPDB1` en XE 21c y `FREEPDB1` en Oracle 23ai Free.

Para usarlas desde el código, cada archivo de `src/db/` trae un ejemplo en su comentario inicial.

---

## 6. Limitaciones conocidas

- **La API no tiene autenticación por token.** Cualquiera que conozca la URL puede llamar a los endpoints de administración. Para un proyecto académico en `localhost` es aceptable; para publicarlo habría que agregar JWT o sesiones.
- **MongoDB, Cassandra y Oracle:** las conexiones y scripts están escritos pero **no se probaron contra un servidor real**. Lo que sí se comprobó es que cargan bien y que, si el motor está apagado, la API sigue funcionando y muestra un error claro.
- **Hadoop** (unidad 4 del sílabo) no está incluido.

---

## 7. Problemas comunes

| Mensaje | Solución |
| --- | --- |
| `password authentication failed` | Revisa `PG_ADMIN_PASSWORD` (paso 4) o `PG_PASSWORD` en `.env` |
| `ECONNREFUSED ...:5432` | El servicio de PostgreSQL está apagado (Servicios de Windows → postgresql) |
| `EADDRINUSE :3000` | Ya hay un servidor en el puerto 3000: ciérralo o cambia `PORT` en `.env` |
| La consola del navegador dice "modo local" | El backend no está encendido: el sitio usa `localStorage` |
