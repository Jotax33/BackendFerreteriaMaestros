import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const email = z.string().trim().toLowerCase().email('Correo electrónico inválido');

const esquemaRegistro = z.object({
  nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  email,
  telefono: z.string().trim().max(20).optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
});

const esquemaLogin = z.object({
  email,
  password: z.string().min(1, 'La contraseña es obligatoria').max(72),
});

const validar = (esquema) => (req, res, next) => {
  const r = esquema.safeParse(req.body);
  if (!r.success) {
    throw new AppError(
      400,
      'Datos inválidos',
      r.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }))
    );
  }
  req.body = r.data; // ya viene limpio (trim y email en minúsculas)
  next();
};

export const validarRegistro = validar(esquemaRegistro);
export const validarLogin = validar(esquemaLogin);

const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  email: z.string().email('Correo electrónico inválido').optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  rol_id: z.number().int().min(1).max(4).optional(),
  activo: z.boolean().optional(),
});

export function validarActualizacionUsuario(req, res, next) {
  const resultado = actualizarUsuarioSchema.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({
      error: 'Datos de actualización inválidos',
      detalles: resultado.error.flatten().fieldErrors,
    });
  }
  req.body = resultado.data;
  next();
}