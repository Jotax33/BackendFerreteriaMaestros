import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import * as service from '../services/auhServices.js';
import { validar } from '../middlewares/validar.js';
import { autenticar } from '../middlewares/auth.js';

const registroSchema = z.object({
    nombre: z.string().trim().min(2).max(100),
    correo: z.string().trim().toLowerCase().email().max(150),
    telefono: z.string().trim().regex(/^\+?[0-9 ]{8,15}$/, 'Teléfono inválido').optional(),
    password: z.string().min(8).max(72),
});
const loginSchema = z.object({
    correo: z.string().trim().toLowerCase().email(),
    password: z.string().min(1),
});

const limiteLogin = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 10,
    message: { error: 'Demasiados intentos, intenta más tarde' }
});

const router = Router();
router.post('/register', validar(registroSchema), async (req, res) =>
    res.status(201).json(await service.registrar(req.body)));
router.post('/login', limiteLogin, validar(loginSchema), async (req, res) =>
    res.json(await service.login(req.body)));
router.get('/me', autenticar, async (req, res) =>
    res.json(await service.perfil(req.user.correo)));
export default router;

/** * @openapi * 
 * /api/auth/login: * 
 *   post: *    
 *  summary: Inicia sesión *     
 * requestBody: *       
 * required: true *       content: *         application/json: *           schema: *             type: object *             properties: *               correo: { type: string, example: ana@test.cl } *               password: { type: string, example: clave12345 } *     responses: *       200: { description: Devuelve accessToken, tokenType y expiresIn } *       401: { description: Credenciales incorrectas } */