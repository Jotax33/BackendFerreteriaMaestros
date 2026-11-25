import bcrypt from 'bcrypt';
import * as repo from '../repositories/usuariosRepository.js';
import { AppError } from '../utils/appError.js';

export const listar = () => repo.listar();

export async function actualizar(solicitante, emailObjetivo, datos) {
  const esAdmin = solicitante.rol === 'admin';
  const esUnoMismo = solicitante.email === emailObjetivo;
  const { password, ...resto } = datos;

  // Un cliente solo edita su propio nombre, teléfono y contraseña
  if (!esAdmin && ('rol' in resto || 'activo' in resto || 'email' in resto)) {
    throw new AppError(403, 'Solo un administrador puede cambiar correo, rol o estado');
  }
  // Evita que el admin se bloquee a sí mismo
  if (esUnoMismo && ('email' in resto || resto.rol === 'cliente' || resto.activo === false)) {
    throw new AppError(400, 'No puedes cambiar tu propio correo, rol ni estado');
  }

  const campos = { ...resto };
  if ('telefono' in campos && !campos.telefono) campos.telefono = null;
  if (password) campos.contrasenia_hash = await bcrypt.hash(password, 12);

  try {
    const usuario = await repo.actualizar(emailObjetivo, campos);
    if (!usuario) throw new AppError(404, 'Usuario no encontrado');
    return usuario;
  } catch (e) {
    if (e.code === '23505') throw new AppError(409, 'Ese correo ya está registrado');
    throw e;
  }
}

export async function eliminar(solicitante, emailObjetivo) {
  if (solicitante.email === emailObjetivo) {
    throw new AppError(400, 'No puedes eliminar tu propia cuenta');
  }
  try {
    if (!(await repo.eliminar(emailObjetivo))) throw new AppError(404, 'Usuario no encontrado');
  } catch (e) {
    if (e.code === '23503') {
      throw new AppError(409, 'El usuario tiene compras o registros asociados. Desactívalo en lugar de eliminarlo');
    }
    throw e;
  }
}