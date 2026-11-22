import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';
import { verificarToken, requiereRol, verificarPropietarioOAdmin } from '../midlewares/auth.js';
import { validarRegistro, validarActualizacionUsuario } from '../midlewares/validad.js';

const router = express.Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos los usuarios (Solo Administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de usuarios
 *       401:
 *         description: Token no proporcionado o inválido
 *       403:
 *         description: Requiere rol Administrador
 */
router.get('/', verificarToken, requiereRol('Administrador'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.nombre, u.email, u.activo, u.creado_en, u.rol_id, r.nombre AS rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      ORDER BY u.id ASC
    `);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error interno al obtener usuarios.' });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener detalle de un usuario por ID (Propio usuario o Administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Prohibido consultar el perfil de otro usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', verificarToken, verificarPropietarioOAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.activo, u.creado_en, u.rol_id, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.rol_id = r.id
       WHERE u.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error interno al consultar el usuario.' });
  }
});

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario con rol específico (Solo Administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password, rol_id]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Carlos Vendedor
 *               email:
 *                 type: string
 *                 example: carlos@maestros.cl
 *               password:
 *                 type: string
 *                 example: Vendedor123
 *               rol_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos o rol_id fuera de rango
 *       403:
 *         description: Requiere rol Administrador
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/', verificarToken, requiereRol('Administrador'), validarRegistro, async (req, res) => {
  const { nombre, email, password, rol_id } = req.body;
  const rolAsignado = rol_id ? Number(rol_id) : 4;

  if (![1, 2, 3, 4].includes(rolAsignado)) {
    return res.status(400).json({
      error: 'El rol_id debe ser 1 (Administrador), 2 (Vendedor), 3 (Contratista) o 4 (Cliente registrado).',
    });
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, nombre, email, rol_id, activo, creado_en`,
      [nombre.trim(), email.toLowerCase(), passwordHash, rolAsignado]
    );

    const rolNombre = await pool.query('SELECT nombre FROM roles WHERE id = $1', [rolAsignado]);

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente por el Administrador',
      usuario: { ...result.rows[0], rol: rolNombre.rows[0].nombre },
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno al crear el usuario.' });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar datos de un usuario (Bloquea cambio de rol si no es Administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rol_id:
 *                 type: integer
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permisos para editar este usuario o cambiar su rol
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', verificarToken, verificarPropietarioOAdmin, validarActualizacionUsuario, async (req, res) => {
  const { nombre, email, password, rol_id, activo } = req.body;
  const idUsuario = req.params.id;

  if (rol_id !== undefined && req.user.rol !== 'Administrador') {
    return res.status(403).json({
      error: 'Acceso prohibido. Solo un Administrador puede modificar el rol de un usuario.',
    });
  }

  if (rol_id !== undefined && ![1, 2, 3, 4].includes(Number(rol_id))) {
    return res.status(400).json({ error: 'El rol_id debe ser 1, 2, 3 o 4.' });
  }

  try {
    const actual = await pool.query('SELECT * FROM usuarios WHERE id = $1', [idUsuario]);
    if (actual.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const userActual = actual.rows[0];
    const nuevoNombre = nombre ? nombre.trim() : userActual.nombre;
    const nuevoEmail = email ? email.toLowerCase() : userActual.email;
    const nuevoHash = password ? await bcrypt.hash(password, 10) : userActual.password_hash;
    const nuevoRolId = req.user.rol === 'Administrador' && rol_id !== undefined ? Number(rol_id) : userActual.rol_id;
    const nuevoActivo = req.user.rol === 'Administrador' && activo !== undefined ? Boolean(activo) : userActual.activo;

    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = $1, email = $2, password_hash = $3, rol_id = $4, activo = $5
       WHERE id = $6
       RETURNING id, nombre, email, rol_id, activo`,
      [nuevoNombre, nuevoEmail, nuevoHash, nuevoRolId, nuevoActivo, idUsuario]
    );

    res.status(200).json({
      mensaje: 'Usuario actualizado correctamente',
      usuario: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El correo electrónico ya está en uso.' });
    }
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno al actualizar usuario.' });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}/rol:
 *   patch:
 *     summary: Cambiar el rol de un usuario (Solo Administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rol_id]
 *             properties:
 *               rol_id:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Rol actualizado
 *       400:
 *         description: rol_id inválido
 *       403:
 *         description: Requiere rol Administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.patch('/:id/rol', verificarToken, requiereRol('Administrador'), async (req, res) => {
  const { rol_id } = req.body;
  if (![1, 2, 3, 4].includes(Number(rol_id))) {
    return res.status(400).json({
      error: 'El rol_id debe ser 1 (Administrador), 2 (Vendedor), 3 (Contratista) o 4 (Cliente registrado).',
    });
  }

  try {
    const result = await pool.query(
      'UPDATE usuarios SET rol_id = $1 WHERE id = $2 RETURNING id, nombre, email, rol_id',
      [Number(rol_id), req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.status(200).json({ mensaje: 'Rol actualizado correctamente', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ error: 'Error interno al cambiar el rol.' });
  }
});

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario (Solo Administrador)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: Requiere rol Administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', verificarToken, requiereRol('Administrador'), async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id, email', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.status(200).json({ mensaje: 'Usuario eliminado correctamente', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno al eliminar usuario.' });
  }
});

export default router;