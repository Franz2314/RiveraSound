const pg = require('../config/postgres');

const carritoController = {
  listar: async (req, res) => {
    try {
      const result = await pg.query(
        `SELECT ci.id, ci.producto_id, ci.cantidad,
                p.nombre, p.marca, p.precio, p.stock, p.emoji,
                (p.precio * ci.cantidad) as subtotal
         FROM carrito_items ci
         JOIN productos p ON p.id = ci.producto_id
         WHERE ci.usuario_id = $1
         ORDER BY ci.creado_en DESC`,
        [req.usuarioId]
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error listar carrito:', err.message);
      res.json([]);
    }
  },

  agregar: async (req, res) => {
    try {
      const { producto_id, cantidad } = req.body;
      if (!producto_id) return res.status(400).json({ error: 'producto_id requerido' });

      const prodResult = await pg.query('SELECT id, stock FROM productos WHERE id = $1', [producto_id]);
      if (prodResult.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      if (prodResult.rows[0].stock === 'agotado') return res.status(400).json({ error: 'Producto agotado' });

      const q = cantidad || 1;
      const existente = await pg.query(
        'SELECT id, cantidad FROM carrito_items WHERE usuario_id = $1 AND producto_id = $2',
        [req.usuarioId, producto_id]
      );

      if (existente.rows.length > 0) {
        const nuevaCant = existente.rows[0].cantidad + q;
        await pg.query(
          'UPDATE carrito_items SET cantidad = $1, actualizado_en = NOW() WHERE id = $2',
          [nuevaCant, existente.rows[0].id]
        );
      } else {
        await pg.query(
          'INSERT INTO carrito_items (usuario_id, producto_id, cantidad) VALUES ($1, $2, $3)',
          [req.usuarioId, producto_id, q]
        );
      }

      res.json({ exito: true, mensaje: 'Producto agregado al carrito' });
    } catch (err) {
      console.error('Error agregar al carrito:', err.message);
      res.status(500).json({ error: 'Error al agregar al carrito' });
    }
  },

  actualizarCantidad: async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;
      if (!cantidad || cantidad < 1) return res.status(400).json({ error: 'Cantidad debe ser >= 1' });

      const result = await pg.query(
        'UPDATE carrito_items SET cantidad = $1, actualizado_en = NOW() WHERE id = $2 AND usuario_id = $3 RETURNING *',
        [cantidad, id, req.usuarioId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Item no encontrado' });
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error actualizar cantidad:', err.message);
      res.status(500).json({ error: 'Error al actualizar cantidad' });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pg.query(
        'DELETE FROM carrito_items WHERE id = $1 AND usuario_id = $2 RETURNING id',
        [id, req.usuarioId]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Item no encontrado' });
      res.json({ mensaje: 'Producto eliminado del carrito' });
    } catch (err) {
      console.error('Error eliminar del carrito:', err.message);
      res.status(500).json({ error: 'Error al eliminar del carrito' });
    }
  },

  vaciar: async (req, res) => {
    try {
      await pg.query('DELETE FROM carrito_items WHERE usuario_id = $1', [req.usuarioId]);
      res.json({ mensaje: 'Carrito vaciado' });
    } catch (err) {
      console.error('Error vaciar carrito:', err.message);
      res.status(500).json({ error: 'Error al vaciar carrito' });
    }
  },

  total: async (req, res) => {
    try {
      const result = await pg.query(
        `SELECT COALESCE(SUM(p.precio * ci.cantidad), 0) as total,
                COUNT(ci.id) as items,
                SUM(ci.cantidad) as unidades
         FROM carrito_items ci
         JOIN productos p ON p.id = ci.producto_id
         WHERE ci.usuario_id = $1`,
        [req.usuarioId]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error total carrito:', err.message);
      res.json({ total: 0, items: 0, unidades: 0 });
    }
  }
};

module.exports = carritoController;
