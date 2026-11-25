import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';

export function autenticar(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new AppError(401, 'Token ausente o inválido');
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
    req.user = { email: payload.sub, correo: payload.sub, rol: payload.rol };
    next();
  } catch {
    throw new AppError(401, 'Token inválido o expirado');
  }
}

export const verificarToken = autenticar;

export function requiereRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      throw new AppError(403, 'No tienes permisos para acceder a este recurso');
    }
    next();
  };
}

export const autorizar = requiereRol;

export function verificarPropietarioOAdmin(req, res, next) {
  if (!req.user) {
    throw new AppError(401, 'No autenticado');
  }
  const paramIdentificador = req.params.email || req.params.correo || req.params.id;
  const esAdmin = req.user.rol === 'admin';
  const esPropietario = paramIdentificador && (
    paramIdentificador === req.user.email ||
    paramIdentificador === req.user.correo
  );

  if (!esAdmin && !esPropietario) {
    throw new AppError(403, 'No tienes permisos para modificar este recurso');
  }
  next();
}