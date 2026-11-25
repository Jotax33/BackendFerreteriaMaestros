import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const esquemaActualizar = z
  .object({
    nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
    email: z.string().trim().toLowerCase().email('Correo electrónico inválido'),
    telefono: z.string().trim().max(20).nullable(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
    rol: z.enum(['cliente', 'admin'], 'Rol inválido'),
    activo: z.boolean(),
  })
  .partial()
  .strict()
  .refine((d) => Object.keys(d).length > 0, 'No se enviaron datos para actualizar');

export function validarActualizacionUsuario(req, res, next) {
  const r = esquemaActualizar.safeParse(req.body);
  if (!r.success) {
    throw new AppError(
      400,
      'Datos inválidos',
      r.error.issues.map((i) => ({ campo: i.path.join('.'), mensaje: i.message }))
    );
  }
  req.body = r.data;
  next();
}