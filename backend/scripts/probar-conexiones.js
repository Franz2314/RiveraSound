/**
 * scripts/probar-conexiones.js   ->   npm run db:probar
 * Prueba las 4 bases de datos y muestra el resultado de cada una.
 * Solo prueba MongoDB, Cassandra y Oracle si están habilitadas en .env.
 */
const { estadoConexiones, cerrarTodo } = require('../src/db');

(async () => {
  const estado = await estadoConexiones();
  for (const [nombre, e] of Object.entries(estado)) {
    console.log(`\n■ ${nombre.toUpperCase()}`);
    if (!e.habilitado) console.log('  deshabilitada (pon *_HABILITADO=true en .env para probarla)');
    else if (e.conectado) console.log('  CONECTADA', JSON.stringify(e.detalle, null, 2).replace(/\n/g, '\n  '));
    else console.log('  ERROR:', e.error);
  }
  await cerrarTodo();
  process.exit(estado.postgres.conectado ? 0 : 1);
})();
