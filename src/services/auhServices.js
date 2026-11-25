import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as repo from '../repositories/usuariosRepository.js';
import { AppError } from '../utils/appError.js';

export async function registrar({ nombre, correo, telefono, password }) {
  if (await repo.buscarPorCorreo(correo)) throw new AppError(409, 'El correo ya está registrado');
  const hash = await bcrypt.hash(password, 12);
  try {
    return await repo.crear({ nombre, correo, telefono, hash });
  } catch (e) {
    if (e.code === '23505') throw new AppError(409, 'El correo ya está registrado'); // carrera entre dos registros
    throw e;
  }
}

export async function login({ correo, password }) {
  const u = await repo.buscarPorCorreo(correo);
  const ok = u && u.activo && (await bcrypt.compare(password, u.contrasenia_hash));
  if (!ok) throw new AppError(401, 'Credenciales incorrectas'); // mensaje genérico
  const accessToken = jwt.sign({ rol: u.rol }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: u.correo,
    expiresIn: '1h',
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  });
  return { accessToken, tokenType: 'Bearer', expiresIn: 3600 };
}

export async function perfil(correo) {
  const u = await repo.buscarPerfil(correo);
  if (!u || !u.activo) throw new AppError(401, 'Cuenta no disponible');
  return u; // sin contrasenia_hash
}