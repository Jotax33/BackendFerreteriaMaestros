import  pool  from '../config/db.js';

export async function buscarPorCorreo(correo) {
  const { rows } = await pool.query(
    `SELECT correo, nombre, telefono, contrasenia_hash, rol, activo
     FROM usuarios WHERE correo = $1`, [correo]);
  return rows[0];
}
export async function buscarPerfil(correo) {
  const { rows } = await pool.query(
    `SELECT correo, nombre, telefono, rol, activo FROM usuarios WHERE correo = $1`, [correo]);
  return rows[0];
}
export async function crear({ nombre, correo, telefono, hash }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (correo, nombre, telefono, contrasenia_hash, rol)
     VALUES ($1,$2,$3,$4,'cliente')
     RETURNING correo, nombre, telefono, rol`,
    [correo, nombre, telefono ?? null, hash]);
  return rows[0];
}