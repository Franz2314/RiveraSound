/**
 * scripts/inicializar-postgres.js   ->   npm run db:init
 *
 * Crea TODO en PostgreSQL ejecutando los scripts de backend/sql/postgres:
 *   00_crear_base.sql  como superusuario (solo si rs_app / riverasound no existen)
 *   01_esquema.sql     como rs_app   (BORRA y recrea las tablas)
 *   02_funciones.sql   como rs_app
 *   03_datos.sql       como rs_app
 *   04_seguridad.sql   como superusuario
 *
 * Requiere en backend/.env: PG_ADMIN_USER y PG_ADMIN_PASSWORD (tu clave de postgres).
 * Equivale a ejecutar los .sql uno por uno en pgAdmin, pero sin copiar y pegar.
 */
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const config = require('../src/config/env');

const CARPETA_SQL = path.resolve(__dirname, '..', 'sql', 'postgres');
const pg = config.postgres;

/** Lee un archivo .sql */
function leer(archivo) {
  return fs.readFileSync(path.join(CARPETA_SQL, archivo), 'utf8');
}

/** Abre una conexión, ejecuta el trabajo y la cierra */
async function conConexion(opciones, trabajo) {
  const cliente = new Client({ host: pg.host, port: pg.port, ...opciones });
  await cliente.connect();
  try {
    return await trabajo(cliente);
  } finally {
    await cliente.end();
  }
}

async function main() {
  if (!pg.adminPassword) {
    console.warn('Aviso: PG_ADMIN_PASSWORD está vacío en .env; se intentará sin contraseña.');
  }
  const admin = { user: pg.adminUser, password: pg.adminPassword };

  // Paso 0: rol y base de datos (solo si faltan, para poder re-ejecutar el script)
  await conConexion({ ...admin, database: 'postgres' }, async (c) => {
    const rol = await c.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [pg.user]);
    const base = await c.query('SELECT 1 FROM pg_database WHERE datname = $1', [pg.database]);
    if (rol.rowCount && base.rowCount) {
      console.log(`· 00_crear_base.sql  omitido: el rol ${pg.user} y la base ${pg.database} ya existen`);
      return;
    }
    // Cada sentencia por separado: CREATE DATABASE no puede ir en un bloque
    const sentencias = leer('00_crear_base.sql')
      .split('\n').filter((l) => !l.trim().startsWith('--')).join('\n')
      .split(';').map((s) => s.trim()).filter(Boolean);
    for (const sql of sentencias) {
      if (rol.rowCount && /^CREATE ROLE/i.test(sql)) continue;
      if (base.rowCount && /^CREATE DATABASE/i.test(sql)) continue;
      await c.query(sql);
    }
    console.log('✓ 00_crear_base.sql');
  });

  // Pasos 1 a 3: como dueño de la base (rs_app)
  await conConexion({ user: pg.user, password: pg.password, database: pg.database }, async (c) => {
    for (const archivo of ['01_esquema.sql', '02_funciones.sql', '03_datos.sql']) {
      await c.query(leer(archivo));
      console.log(`✓ ${archivo}`);
    }
  });

  // Paso 4: roles y permisos (requiere superusuario)
  await conConexion({ ...admin, database: pg.database }, async (c) => {
    await c.query(leer('04_seguridad.sql'));
    console.log('✓ 04_seguridad.sql');
  });

  console.log(`\nListo. Base "${pg.database}" creada con datos de ejemplo.`);
  console.log('Usuarios de prueba: demo@riverasound.pe / demo123 (admin)  ·  cliente@riverasound.pe / cliente123');
}

main().catch((error) => {
  console.error('\nERROR al inicializar PostgreSQL:', error.message);
  if (error.code === '28P01') console.error('→ Revisa PG_ADMIN_PASSWORD / PG_PASSWORD en backend/.env');
  if (error.code === 'ECONNREFUSED') console.error('→ ¿Está encendido el servicio de PostgreSQL?');
  process.exit(1);
});
