import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { validarRegistro } from '../midlewares/validad.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_ferreteria_2026';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario (asigna rol Cliente registrado por defecto)
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@correo.cl
 *               password:
 *                 type: string
 *                 example: clave123
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/register', validarRegistro, async (req, res) => {
  const { nombre, email, password } = req.body;
  const ROL_CLIENTE_REGISTRADO = 4;

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
      [nombre.trim(), email.toLowerCase(), passwordHash, ROL_CLIENTE_REGISTRADO]
    );

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      usuario: { ...result.rows[0], rol: 'Cliente registrado' },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@maestros.cl
 *               password:
 *                 type: string
 *                 example: Admin1234!
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso con token JWT
 *       400:
 *         description: Faltan credenciales
 *       401:
 *         description: Credenciales inválidas o usuario inactivo
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Debe ingresar correo y contraseña.' });
  }

  try {
    const query = `
      SELECT u.id, u.nombre, u.email, u.password_hash, u.activo, u.rol_id, r.nombre AS rol
      FROM usuarios u
      JOIN roles r ON u.rol_id = r.id
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const usuario = result.rows[0];

    if (!usuario.activo) {
      return res.status(401).json({ error: 'La cuenta se encuentra desactivada.' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const payload = {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
      rol_id: usuario.rol_id,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '4h' });

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        rol_id: usuario.rol_id,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

export default router;