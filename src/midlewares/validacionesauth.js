import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const correo = z.string().trim().toLowerCase().email('Correo electrónico inválido');

const esquemaRegistro = z.object({
  nombre: z.string().trim().min(3, 'El nombre debe tener al menos 3 caracteres').max(100),
  correo,
  telefono: z.string().trim().max(20).optional(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(72),
});

const esquemaLogin = z.object({
  correo,
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
  req.body = r.data; // ya viene limpio (trim y correo en minúsculas)
  next();
};

export const validarRegistro = validar(esquemaRegistro);
export const validarLogin = validar(esquemaLogin);