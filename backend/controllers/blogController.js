/* ============================================ controllers/blogController.js - Controlador de blog y reseñas ============================================ */
/* Opera exclusivamente sobre MongoDB (colecciones Blog y Resena). Modelos lazy: se obtienen al primer uso. */

const mongodb = require('../config/mongodb');
const mongoose = mongodb.mongoose;

/* --- Variables para los modelos (carga lazy) --- */
let Blog = null;
let Resena = null;

/**
 * getModels - Retorna los modelos Blog y Resena si MongoDB está conectado
 * Los modelos se registran una sola vez (patrón singleton local)
 * Si mongoose no está conectado (readyState !== 1), retorna null
 * Los modelos deben estar registrados previamente en la aplicación (schema/model)
 */
function getModels() {
  if (mongoose.connection.readyState !== 1) return null;

  if (!Blog) {
    try {
      Blog = mongoose.model('Blog');
    } catch (_) {
      Blog = null;
    }
  }
  if (!Resena) {
    try {
      Resena = mongoose.model('Resena');
    } catch (_) {
      Resena = null;
    }
  }
  return { Blog, Resena };
}

const blogController = {

  /* ============ listarArticulos - GET /api/blog/articulos ============ */

  /**
   * listarArticulos - Obtiene artículos del blog desde MongoDB
   * Si MongoDB no está disponible (modelo null), devuelve fallback estático
   * con 3 artículos de ejemplo (hardcoded)
   * Si está disponible, trae hasta 20 artículos ordenados por fecha descendente
   */
  listarArticulos: async (req, res) => {
    const models = getModels();
    if (!models || !models.Blog) {
      return res.json([
        { titulo: 'Cómo elegir tu primer saxofón', emoji: '🎷', resumen: 'Guía completa para principiantes.', fecha: '15 Mayo 2026' },
        { titulo: 'Mantenimiento de guitarras acústicas', emoji: '🎸', resumen: 'Consejos prácticos.', fecha: '8 Mayo 2026' },
        { titulo: 'Batería acústica vs electrónica', emoji: '🥁', resumen: 'Ventajas y desventajas.', fecha: '1 Mayo 2026' }
      ]);
    }

    try {
      const articulos = await models.Blog.find().sort({ fecha: -1 }).limit(20);
      res.json(articulos);
    } catch (err) {
      console.error('Error listar blog:', err.message);
      res.json([]);
    }
  },

  /* ============ obtenerArticulo - GET /api/blog/articulos/:id ============ */

  /**
   * obtenerArticulo - Obtiene un artículo por su ObjectId de MongoDB
   * Si MongoDB no disponible, 404 con mensaje 'Blog no disponible'
   * Si el ID no es válido o no se encuentra, 404
   */
  obtenerArticulo: async (req, res) => {
    const models = getModels();
    if (!models || !models.Blog) {
      return res.status(404).json({ error: 'Blog no disponible' });
    }

    try {
      const articulo = await models.Blog.findById(req.params.id);
      if (!articulo) return res.status(404).json({ error: 'Artículo no encontrado' });
      res.json(articulo);
    } catch (err) {
      console.error('Error obtener artículo:', err.message);
      res.status(500).json({ error: 'Error al obtener artículo' });
    }
  },

  /* ============ crearArticulo - POST /api/blog/articulos ============ */

  /**
   * crearArticulo - Crea un nuevo artículo en MongoDB
   * Requiere: titulo, resumen, contenido. Opcionales: emoji (default 📝), autor (default RiveraSound)
   * Si MongoDB no disponible, 503 Service Unavailable
   */
  crearArticulo: async (req, res) => {
    const models = getModels();
    if (!models || !models.Blog) {
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }

    try {
      const { titulo, resumen, contenido, emoji, autor } = req.body;
      if (!titulo || !resumen || !contenido) {
        return res.status(400).json({ error: 'Título, resumen y contenido son requeridos' });
      }

      const articulo = new models.Blog({
        titulo, resumen, contenido,
        emoji: emoji || '📝',
        autor: autor || 'RiveraSound',
        fecha: new Date()
      });

      await articulo.save();
      res.status(201).json(articulo);
    } catch (err) {
      console.error('Error crear artículo:', err.message);
      res.status(500).json({ error: 'Error al crear artículo' });
    }
  },

  /* ============ listarResenas - GET /api/blog/resenas ============ */

  /**
   * listarResenas - Obtiene reseñas de productos desde MongoDB
   * Filtro opcional por producto_id (query param)
   * Orden descendente por fecha, límite 50. Si falla, array vacío.
   * Si MongoDB no disponible, devuelve [] directamente.
   */
  listarResenas: async (req, res) => {
    const models = getModels();
    if (!models || !models.Resena) {
      return res.json([]);
    }

    try {
      const { producto_id } = req.query;
      const filter = producto_id ? { producto_id } : {};
      const resenas = await models.Resena.find(filter).sort({ creado_en: -1 }).limit(50);
      res.json(resenas);
    } catch (err) {
      console.error('Error listar reseñas:', err.message);
      res.json([]);
    }
  },

  /* ============ crearResena - POST /api/blog/resenas ============ */

  /**
   * crearResena - Crea una reseña de producto en MongoDB
   * Requiere: producto_id, puntuacion (1-5). Opcionales: producto_nombre, comentario, usuario_nombre
   * Si MongoDB no disponible, 503
   * usuario_id se obtiene de req.usuarioId (authMiddleware) o 'anonimo'
   */
  crearResena: async (req, res) => {
    const models = getModels();
    if (!models || !models.Resena) {
      return res.status(503).json({ error: 'Base de datos no disponible' });
    }

    try {
      const { producto_id, producto_nombre, puntuacion, comentario } = req.body;

      if (!producto_id || !puntuacion) {
        return res.status(400).json({ error: 'producto_id y puntuación requeridos' });
      }

      if (puntuacion < 1 || puntuacion > 5) {
        return res.status(400).json({ error: 'Puntuación debe ser entre 1 y 5' });
      }

      const resena = new models.Resena({
        producto_id,
        producto_nombre: producto_nombre || '',
        usuario_id: req.usuarioId || 'anonimo',
        usuario_nombre: req.body.usuario_nombre || 'Anónimo',
        puntuacion,
        comentario: comentario || ''
      });

      await resena.save();
      res.status(201).json(resena);
    } catch (err) {
      console.error('Error crear reseña:', err.message);
      res.status(500).json({ error: 'Error al crear reseña' });
    }
  }
};

module.exports = blogController;
