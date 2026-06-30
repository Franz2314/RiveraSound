/* ============================================ config/cassandra.js - Conexión a Cassandra (logs de vistas) ============================================ */
/* Cliente Apache Cassandra para registrar visitas a productos (log de auditoría). Keyspace 'riverasound'. */

const cassandra = require('cassandra-driver');

let client = null; // Singleton: se crea una sola instancia del cliente

/**
 * getClient - Retorna el cliente Cassandra (creándolo si es primera vez)
 * Configura contact points, datacenter, keyspace, consistencia LOCAL_QUORUM y protocolo v4
 */
function getClient() {
  if (client) return client;

  const contactPoints = (process.env.CASSANDRA_CONTACT_POINTS || 'localhost').split(',');
  const port = parseInt(process.env.CASSANDRA_PORT) || 9042;
  const localDataCenter = process.env.CASSANDRA_DATACENTER || 'dc1';
  const keyspace = process.env.CASSANDRA_KEYSPACE || 'riverasound';

  client = new cassandra.Client({
    contactPoints: contactPoints.map(host => ({ host, port })),
    localDataCenter,
    keyspace,
    queryOptions: {
      consistency: cassandra.types.consistencies.localQuorum, // Consistencia fuerte local
    },
    protocolOptions: {
      maxVersion: 4,  // Protocolo nativo v4
    },
    pooling: {
      coreConnectionsPerHost: {
        [cassandra.types.distance.local]: 2, // 2 conexiones por host local
      },
    },
  });

  return client;
}

/**
 * testConnection - Verifica conectividad consultando release_version de system.local
 * Útil en el arranque del servidor para mostrar estado
 */
async function testConnection() {
  try {
    const c = getClient();
    await c.connect();
    const result = await c.execute('SELECT release_version FROM system.local');
    console.log('Cassandra conectado:', result.rows[0]?.release_version || 'OK');
    return true;
  } catch (err) {
    console.warn('Cassandra no disponible:', (err.message || err).toString().slice(0, 80));
    return false;
  }
}

/**
 * execute - Ejecuta un CQL (Cassandra Query Language) con parámetros y opciones
 * Wrapper sobre client.execute que relanza el error para que el controlador lo maneje
 */
async function execute(query, params, options) {
  try {
    const c = getClient();
    const result = await c.execute(query, params || [], options || {});
    return result;
  } catch (err) {
    console.error('Error en Cassandra query:', err.message);
    throw err;
  }
}

/**
 * close - Cierra la conexión con Cassandra de forma graceful
 */
async function close() {
  if (client) {
    await client.shutdown();
    client = null;
  }
}

module.exports = { getClient, testConnection, execute, close };
