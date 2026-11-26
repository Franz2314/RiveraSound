/**
 * server.js
 * Punto de entrada: arranca el servidor HTTP y muestra el estado de las
 * 4 bases de datos en la consola. Uso:  npm start
 */
const app = require('./app');
const config = require('./config/env');
const { estadoConexiones, cerrarTodo } = require('./db');

/** Imprime una línea por base de datos */
function mostrarEstado(estado) {
  console.log('\nEstado de las bases de datos:');
  for (const [nombre, e] of Object.entries(estado)) {
    let texto;
    if (!e.habilitado) texto = '— deshabilitada en .env';
    else if (e.conectado) texto = `OK  ${e.detalle.version}`;
    else texto = `ERROR  ${e.error}`;
    console.log(`  ${nombre.padEnd(10)} ${texto}`);
  }
  console.log('');
}

const servidor = app.listen(config.puerto, async () => {
  console.log(`RiveraSound corriendo en http://localhost:${config.puerto}`);
  mostrarEstado(await estadoConexiones());
});

// Cierre ordenado con Ctrl+C: libera las conexiones antes de salir
async function apagar() {
  console.log('\nCerrando conexiones...');
  servidor.close();
  await cerrarTodo();
  process.exit(0);
}
process.on('SIGINT', apagar);
process.on('SIGTERM', apagar);
