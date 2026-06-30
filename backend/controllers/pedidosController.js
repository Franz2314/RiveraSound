/* ============================================ controllers/pedidosController.js - Controlador de pedidos ============================================ */
/* Creación transaccional con verificación de stock, listado con paginación, detalle y cambio de estado. PostgreSQL + MongoDB (opcional). */

const pg = require('../config/postgres');
const mongodb = require('../config/mongodb');
const mongoose = mongodb.mongoose;

const pedidosController = {

  /* ============ crear - POST /api/pedidos ============ */

  /**
   * crear - Crea un pedido nuevo con transacción ACID en PostgreSQL
   * Flujo:
   *   1. Valida que items sea array no vacío
   *   2. BEGIN transacción
   *   3. Por cada item: SELECT ... FOR UPDATE (bloqueo pesimista de fila),
   *      verifica existencia y stock (si 'agotado' -> ROLLBACK + 400)
   *   4. Calcula total y arma array de detalles
   *   5. INSERT en pedidos y detalle_pedidos
   *   6. COMMIT
   *   7. (Opcional) Log en MongoDB si el modelo Resena existe
   * Si todo falla, ROLLBACK y 500
   */
  crear: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const { items, direccion_envio, notas } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'El pedido debe contener al menos un item' });
      }

      await pg.query('BEGIN');

      let total = 0;
      const detalles = [];

      for (const item of items) {
        /* SELECT ... FOR UPDATE: bloquea la fila del producto hasta el COMMIT
           para evitar condiciones de carrera sobre el stock */
        const prodResult = await pg.query(
          'SELECT id, nombre, precio, stock FROM productos WHERE id = $1 FOR UPDATE',
          [item.producto_id]
        );

        if (prodResult.rows.length === 0) {
          await pg.query('ROLLBACK');
          return res.status(404).json({ error: `Producto ${item.producto_id} no encontrado` });
        }

        const prod = prodResult.rows[0];

        if (prod.stock === 'agotado') {
          await pg.query('ROLLBACK');
          return res.status(400).json({ error: `${prod.nombre} está agotado` });
        }

        const cantidad = item.cantidad || 1;
        const subtotal = parseFloat(prod.precio) * cantidad;
        total += subtotal;

        detalles.push({
          producto_id: prod.id,
          nombre: prod.nombre,
          cantidad,
          precio_unitario: parseFloat(prod.precio),
          subtotal
        });
      }

      // Insertar cabecera del pedido
      const pedidoResult = await pg.query(
        `INSERT INTO pedidos (usuario_id, total, estado, direccion_envio, notas)
         VALUES ($1, $2, 'pendiente', $3, $4) RETURNING *`,
        [usuarioId, total, direccion_envio || '', notas || '']
      );

      const pedido = pedidoResult.rows[0];

      // Insertar cada línea de detalle
      for (const det of detalles) {
        await pg.query(
          `INSERT INTO detalle_pedidos (pedido_id, producto_id, nombre, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [pedido.id, det.producto_id, det.nombre, det.cantidad, det.precio_unitario, det.subtotal]
        );
      }

      await pg.query('COMMIT');

      // --- Log opcional a MongoDB (solo si la conexión está activa) ---
      try {
        if (mongoose.connection.readyState === 1) {
          const Resena = mongoose.model('Resena');
          // Log de pedido creado (placeholder)
        }
      } catch (_) {}

      res.status(201).json({
        exito: true,
        pedido: {
          id: pedido.id,
          total: pedido.total,
          estado: pedido.estado,
          creado_en: pedido.creado_en
        },
        mensaje: 'Pedido creado correctamente'
      });
    } catch (err) {
      await pg.query('ROLLBACK').catch(() => {});
      console.error('Error crear pedido:', err.message);
      res.status(500).json({ error: 'Error al crear pedido' });
    }
  },

  /* ============ listar - GET /api/pedidos ============ */

  /**
   * listar - Lista pedidos con JOIN a usuarios (nombre, correo) desde PostgreSQL
   * Filtro opcional por estado. Paginación con limite/offset (default 20/0)
   * Orden descendente por fecha de creación. Si falla, array vacío.
   */
  listar: async (req, res) => {
    try {
      const { estado, limite = 20, offset = 0 } = req.query;
      let sql = `
        SELECT p.*, u.nombre as usuario_nombre, u.correo as usuario_correo
        FROM pedidos p JOIN usuarios u ON u.id = p.usuario_id WHERE 1=1
      `;
      const params = [];
      let idx = 1;

      if (estado) {
        sql += ` AND p.estado = $${idx++}`;
        params.push(estado);
      }
      sql += ' ORDER BY p.creado_en DESC';
      sql += ` LIMIT $${idx++} OFFSET $${idx++}`;
      params.push(parseInt(limite), parseInt(offset));

      const result = await pg.query(sql, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Error listar pedidos:', err.message);
      res.json([]);
    }
  },

  /* ============ obtener - GET /api/pedidos/:id ============ */

  /**
   * obtener - Obtiene un pedido con sus items (detalle_pedidos) desde PostgreSQL
   * Dos consultas: cabecera + detalle. Combina en un solo objeto JSON.
   */
  obtener: async (req, res) => {
    try {
      const { id } = req.params;

      const pedidoResult = await pg.query('SELECT * FROM pedidos WHERE id = $1', [id]);
      if (pedidoResult.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      const detallesResult = await pg.query(
        'SELECT * FROM detalle_pedidos WHERE pedido_id = $1',
        [id]
      );

      res.json({
        ...pedidoResult.rows[0],
        items: detallesResult.rows
      });
    } catch (err) {
      console.error('Error obtener pedido:', err.message);
      res.status(500).json({ error: 'Error al obtener pedido' });
    }
  },

  /* ============ actualizarEstado - PATCH /api/pedidos/:id/estado ============ */

  /**
   * actualizarEstado - Cambia el estado de un pedido en PostgreSQL
   * Estados válidos: pendiente, confirmado, enviado, entregado, cancelado
   * Si el estado no está en la lista blanca, devuelve 400
   * Si el pedido no existe, 404
   */
  actualizarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosValidos = ['pendiente', 'confirmado', 'enviado', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: `Estado inválido. Válidos: ${estadosValidos.join(', ')}` });
      }

      const result = await pg.query(
        'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
        [estado, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Pedido no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error actualizar estado pedido:', err.message);
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  }
};

module.exports = pedidosController;
