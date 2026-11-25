import express from 'express';
import rateLimit from 'express-rate-limit';
import * as auth from '../services/auhServices.js';
import { autenticar } from '../midlewares/auth.js';
import { validarRegistro, validarLogin } from '../midlewares/validacionesAuth.js';

const router = express.Router();

const limitarLogin = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario (rol cliente por defecto)
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, password]
 *             properties:
 *               nombre: { type: string, example: Juan Pérez }
 *               correo: { type: string, example: juan@correo.cl }
 *               telefono: { type: string, example: "912345678" }
 *               password: { type: string, example: clave1234 }
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: El correo ya está registrado
 */
router.post('/register', validarRegistro, async (req, res) => {
  res.status(201).json(await auth.registrar(req.body));
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
 *             required: [correo, password]
 *             properties:
 *               correo: { type: string, example: admin@maestros.cl }
 *               password: { type: string, example: miClaveSegura }
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso (accessToken, tokenType, expiresIn)
 *       400:
 *         description: Datos de entrada inválidos
 *       401:
 *         description: Credenciales incorrectas o usuario inactivo
 *       429:
 *         description: Demasiados intentos
 */
router.post('/login', limitarLogin, validarLogin, async (req, res) => {
  res.json(await auth.login(req.body));
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil (correo, nombre, telefono, rol, activo)
 *       401:
 *         description: Token ausente, inválido o expirado
 */
router.get('/me', autenticar, async (req, res) => {
  res.json(await auth.perfil(req.user.correo));
});

export default router;