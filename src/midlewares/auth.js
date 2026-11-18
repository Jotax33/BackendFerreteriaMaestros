import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';

export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) return next(new AppError(401, 'Token requerido'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
    req.user = { correo: payload.sub, rol: payload.rol };
    next();
  } catch {
    next(new AppError(401, 'Token inválido o vencido'));
  }
}

export const requerirRol = (...roles) => (req, res, next) =>
  roles.includes(req.user.rol) ? next() : next(new AppError(403, 'No tienes permiso para esta acción'));