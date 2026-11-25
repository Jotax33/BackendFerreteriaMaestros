import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';

export function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) throw new AppError(401, 'Token no proporcionado');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  } catch {
    throw new AppError(401, 'Token inválido o expirado');
  }
  req.user = { correo: payload.sub, rol: payload.rol };
  next();
}

export const requerirRol = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.rol)) throw new AppError(403, 'Sin permisos');
  next();
};