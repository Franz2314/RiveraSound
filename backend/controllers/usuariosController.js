/* ============================================ controllers/usuariosController.js - Controlador de usuarios ============================================ */
/* Registro, login, perfil y pedidos del usuario. Todo sobre PostgreSQL. Hashing con PBKDF2 + salt. */

const pg = require('../config/postgres');
const crypto = require('crypto');

/* ============ Funciones auxiliares de hash ============ */

/**
 * hashPassword - Genera hash PBKDF2 con salt aleatorio de 16 bytes
 * Formato almacenado: "salt:hash" (separado por :), 1000 iteraciones, SHA-512, 64 bytes
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * verifyPassword - Compara contraseña plana contra el hash almacenado
 * Extrae salt del formato "salt:hash" y recalcula el hash para comparar
 */
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verify;
}

const usuariosController = {

  /* ============ registrar - POST /api/usuarios/registro ============ */

  /**
   * registrar - Crea un usuario nuevo en PostgreSQL
   * Validación: todos los campos obligatorios
   * Verifica que el correo no exista ya (409 si duplicado)
   * Hash de contraseña con PBKDF2 antes de insertar
   * Devuelve el usuario sin el password_hash
   */
  registrar: async (req, res) => {
    try {
      const { nombre, apellido, correo, password } = req.body;

      if (!nombre || !apellido || !correo || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Verificar correo único
      const existente = await pg.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
      if (existente.rows.length > 0) {
        return res.status(409).json({ error: 'El correo ya está registrado' });
      }

      // Hash y creación del usuario
      const hashed = hashPassword(password);
      const result = await pg.query(
        `INSERT INTO usuarios (nombre, apellido, correo, password_hash)
         VALUES ($1, $2, $3, $4) RETURNING id, nombre, apellido, correo, creado_en`,
        [nombre, apellido, correo, hashed]
      );

      res.status(201).json({
        exito: true,
        usuario: result.rows[0],
        mensaje: 'Usuario registrado correctamente'
      });
    } catch (err) {
      console.error('Error registrar usuario:', err.message);
      res.status(500).json({ error: 'Error al registrar' });
    }
  },

  /* ============ login - POST /api/usuarios/login ============ */

  /**
   * login - Autentica usuario por correo y contraseña en PostgreSQL
   * Si PostgreSQL no está disponible, permite acceso con demo@riverasound.pe / demo123
   */
  login: async (req, res) => {
    try {
      const { correo, password } = req.body;

      if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña requeridos' });
      }

      try {
        const result = await pg.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        if (result.rows.length === 0) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const usuario = result.rows[0];

        if (!verifyPassword(password, usuario.password_hash)) {
          return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = crypto.randomBytes(32).toString('hex');

        return res.json({
          exito: true,
          token,
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo
          }
        });
      } catch (dbErr) {
        console.warn('PostgreSQL no disponible, usando fallback demo:', dbErr.message);
        if (correo === 'demo@riverasound.pe' && password === 'demo123') {
          const token = crypto.randomBytes(32).toString('hex');
          return res.json({
            exito: true,
            token,
            usuario: { id: 1, nombre: 'Demo', apellido: 'Rivera', correo: 'demo@riverasound.pe' }
          });
        }
        return res.status(401).json({ error: 'BD no disponible. Usa demo@riverasound.pe / demo123' });
      }
    } catch (err) {
      console.error('Error login:', err.message);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  },

  /* ============ perfil - GET /api/usuarios/perfil ============ */

  /**
   * perfil - Obtiene datos del perfil del usuario autenticado (desde req.usuarioId)
   * Excluye password_hash; incluye teléfono y dirección
   * Si no existe el usuario (raro), 404
   */
  perfil: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const result = await pg.query(
        'SELECT id, nombre, apellido, correo, telefono, direccion, creado_en FROM usuarios WHERE id = $1',
        [usuarioId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error perfil:', err.message);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  },

  /* ============ actualizarPerfil - PUT /api/usuarios/perfil ============ */

  /**
   * actualizarPerfil - Actualiza datos del perfil en PostgreSQL (UPDATE dinámico)
   * Campos editables: nombre, apellido, telefono, direccion
   * Construye SET dinámicamente; si no hay campos, 400
   */
  actualizarPerfil: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const { nombre, apellido, telefono, direccion } = req.body;

      const campos = [];
      const params = [];
      let idx = 1;

      if (nombre !== undefined) { campos.push(`nombre = $${idx++}`); params.push(nombre); }
      if (apellido !== undefined) { campos.push(`apellido = $${idx++}`); params.push(apellido); }
      if (telefono !== undefined) { campos.push(`telefono = $${idx++}`); params.push(telefono); }
      if (direccion !== undefined) { campos.push(`direccion = $${idx++}`); params.push(direccion); }

      if (campos.length === 0) {
        return res.status(400).json({ error: 'No hay campos para actualizar' });
      }

      params.push(usuarioId);
      const sql = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${idx} RETURNING id, nombre, apellido, correo, telefono, direccion`;
      const result = await pg.query(sql, params);

      res.json(result.rows[0]);
    } catch (err) {
      console.error('Error actualizar perfil:', err.message);
      res.status(500).json({ error: 'Error al actualizar perfil' });
    }
  },

  /* ============ listarPedidos - GET /api/usuarios/pedidos ============ */

  /**
   * listarPedidos - Obtiene los pedidos del usuario autenticado desde PostgreSQL
   * JOIN con detalle_pedidos y agregación JSON con json_agg + json_build_object
   * Cada pedido incluye array "items" con producto_id, nombre, cantidad, precio
   * Ordenados por fecha descendente. Si falla, devuelve array vacío.
   */
  listarPedidos: async (req, res) => {
    try {
      const usuarioId = req.usuarioId;
      const result = await pg.query(
        `SELECT p.id, p.total, p.estado, p.creado_en,
                json_agg(json_build_object(
                  'producto_id', dp.producto_id,
                  'nombre', dp.nombre,
                  'cantidad', dp.cantidad,
                  'precio', dp.precio_unitario
                )) as items
         FROM pedidos p
         LEFT JOIN detalle_pedidos dp ON dp.pedido_id = p.id
         WHERE p.usuario_id = $1
         GROUP BY p.id
         ORDER BY p.creado_en DESC`,
        [usuarioId]
      );

      res.json(result.rows);
    } catch (err) {
      console.error('Error listar pedidos:', err.message);
      res.json([]);
    }
  }
};

module.exports = usuariosController;
