import express from 'express';
import * as usuarios from '../services/usuariosServices.js';
import { autenticar, requiereRol, verificarPropietarioOAdmin } from '../midlewares/auth.js';
import { validarActualizacionUsuario } from '../midlewares/validacionesUsuarios.js';

const router = express.Router();

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar usuarios (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       403:
 *         description: Requiere rol admin
 */
router.get('/', autenticar, requiereRol('admin'), async (req, res) => {
  res.json(await usuarios.listar());
});

/**
 * @swagger
 * /api/usuarios/{email}:
 *   put:
 *     summary: Editar un usuario (admin cualquiera; cliente solo a sí mismo)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El correo ya está registrado
 */
router.put('/:email', autenticar, verificarPropietarioOAdmin, validarActualizacionUsuario, async (req, res) => {
  res.json(await usuarios.actualizar(req.user, req.params.email.toLowerCase(), req.body));
});

/**
 * @swagger
 * /api/usuarios/{email}:
 *   delete:
 *     summary: Eliminar un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Usuario eliminado
 *       400:
 *         description: No puedes eliminarte a ti mismo
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Tiene compras asociadas
 */
router.delete('/:email', autenticar, requiereRol('admin'), async (req, res) => {
  await usuarios.eliminar(req.user, req.params.email.toLowerCase());
  res.status(204).end();
});

export default router;