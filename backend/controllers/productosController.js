/* ============================================ controllers/productosController.js - Controlador de productos ============================================ */
/* CRUD de productos sobre PostgreSQL. Logs de vistas a Cassandra. Fallback a datos mock si PG caído. */

const pg = require('../config/postgres');
const cassandra = require('../config/cassandra');

const productosController = {

  /* ============ listar - GET /api/productos ============ */

  /**
   * listar - Obtiene productos de PostgreSQL con filtros opcionales; fallback a datos mock si BD caída
   * Filtros: categoria (excluye 'todas'), busqueda (ILIKE sobre nombre y marca), stock
   * Tras la consulta, registra un log en Cassandra (tabla logs_vistas_producto) como evento asíncrono
   * Si PostgreSQL falla, importa y devuelve productosFallback.js (datos estáticos)
   */
  listar: async (req, res) => {
    try {
      const { categoria, busqueda, stock } = req.query;
      let sql = 'SELECT * FROM productos WHERE 1=1';
      const params = [];
      let idx = 1;

      // Filtro por categoría (si no es 'todas')
      if (categoria && categoria !== 'todas') {
        sql += ` AND categoria = $${idx++}`;
        params.push(categoria);
      }
      // Búsqueda textual insensible a mayúsculas sobre nombre y marca
      if (busqueda) {
        sql += ` AND (nombre ILIKE $${idx} OR marca ILIKE $${idx})`;
        params.push(`%${busqueda}%`);
        idx++;
      }
      // Filtro por estado de stock ('disponible' o 'agotado')
      if (stock) {
        sql += ` AND stock = $${idx++}`;
        params.push(stock);
      }
      sql += ' ORDER BY nombre ASC';

      const result = await pg.query(sql, params);

      // --- Log asíncrono a Cassandra: registro de vista de listado ---
      // No crítico: si Cassandra falla, se silencia con .catch(() => {})
      await cassandra.execute(
        'INSERT INTO logs_vistas_producto (producto_id, usuario_id, timestamp) VALUES (?, ?, ?)',
        ['listado', 'sistema', new Date()],
        { prepare: true }
      ).catch(() => {});

      res.json(result.rows);
    } catch (err) {
      console.error('Error listar productos:', err.message);
      // Fallback: si PostgreSQL no responde, devuelve datos mock
      const fallback = require('../data/productosFallback');
      res.json(fallback);
    }
  },

  /* ============ obtener - GET /api/productos/:id ============ */

  /**
   * obtener - Busca un producto por su ID (string) en PostgreSQL
   * Si no existe, 404. Si existe, registra la vista en Cassandra (log con ID del producto y usuario)
   */
  obtener: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pg.query('SELECT * FROM productos WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      // Log de vista individual en Cassandra (no crítico)
      await cassandra.execute(
        'INSERT INTO logs_vistas_producto (producto_id, usuario_id, timestamp) VALUES (?, ?, ?)',
        [id, req.usuarioId || 'anonimo', new Date()],
        { prepare: true }
      ).catch(() => {});

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error obtener producto:', err.message);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  },

  /* ============ crear - POST /api/productos ============ */

  /**
   * crear - Inserta un nuevo producto en PostgreSQL
   * Validación: nombre, marca, categoria y precio son obligatorios
   * stock por defecto 'disponible', descripción vacía, emoji 🎵
   * Devuelve el registro creado con RETURNING *
   */
  crear: async (req, res) => {
    try {
      const { nombre, marca, categoria, precio, stock, descripcion, emoji } = req.body;

      if (!nombre || !marca || !categoria || !precio) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      const result = await pg.query(
        `INSERT INTO productos (nombre, marca, categoria, precio, stock, descripcion, emoji)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [nombre, marca, categoria, precio, stock || 'disponible', descripcion || '', emoji || '🎵']
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error crear producto:', err.message);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  },

  /* ============ actualizar - PUT /api/productos/:id ============ */

  /**
   * actualizar - Actualización parcial de producto en PostgreSQL
   * Construye SET dinámico: solo incluye los campos presentes en el body
   * Si no hay campos para actualizar, devuelve 400
   * Si el ID no existe, devuelve 404
   */
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, marca, categoria, precio, stock, descripcion, emoji } = req.body;

      const campos = [];
      const params = [];
      let idx = 1;

      // Construcción dinámica de la cláusula SET con parámetros indexados
      if (nombre !== undefined) { campos.push(`nombre = $${idx++}`); params.push(nombre); }
      if (marca !== undefined) { campos.push(`marca = $${idx++}`); params.push(marca); }
      if (categoria !== undefined) { campos.push(`categoria = $${idx++}`); params.push(categoria); }
      if (precio !== undefined) { campos.push(`precio = $${idx++}`); params.push(precio); }
      if (stock !== undefined) { campos.push(`stock = $${idx++}`); params.push(stock); }
      if (descripcion !== undefined) { campos.push(`descripcion = $${idx++}`); params.push(descripcion); }
      if (emoji !== undefined) { campos.push(`emoji = $${idx++}`); params.push(emoji); }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      params.push(id);
      const sql = `UPDATE productos SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`;
      const result = await pg.query(sql, params);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error actualizar producto:', err.message);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  },

  /* ============ eliminar - DELETE /api/productos/:id ============ */

  /**
   * eliminar - Borra un producto de PostgreSQL por ID
   * RETURNING id para confirmar la eliminación; si no existe, 404
   */
  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pg.query('DELETE FROM productos WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }

      res.json({ mensaje: 'Producto eliminado correctamente', id });
    } catch (err) {
      console.error('Error eliminar producto:', err.message);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  },

  /* ============ obtenerCategorias - GET /api/productos/categorias ============ */

  /**
   * obtenerCategorias - Agrupa productos por categoría con su conteo en PostgreSQL
   * Útil para poblar filtros en el frontend. Si falla, devuelve array vacío.
   */
  obtenerCategorias: async (req, res) => {
    try {
      const result = await pg.query(
        'SELECT categoria, COUNT(*) as total FROM productos GROUP BY categoria ORDER BY categoria'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error obtener categorias:', err.message);
      res.json([]);
    }
  }
};

module.exports = productosController;
