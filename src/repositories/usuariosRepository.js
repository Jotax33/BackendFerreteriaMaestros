import pool from '../config/db.js';

export async function buscarPorCorreo(email) {
  const { rows } = await pool.query(
    `SELECT email, nombre, telefono, contrasenia_hash, rol, activo
     FROM usuarios WHERE email = $1`,
    [email]
  );
  return rows[0];
}

export async function buscarPerfil(email) {
  const { rows } = await pool.query(
    `SELECT email, nombre, telefono, rol, activo
     FROM usuarios WHERE email = $1`,
    [email]
  );
  return rows[0];
}

export async function crear({ nombre, email, correo, telefono, hash }) {
  const emailFinal = email || correo;
  const { rows } = await pool.query(
    `INSERT INTO usuarios (email, nombre, telefono, contrasenia_hash, rol)
     VALUES ($1, $2, $3, $4, 'cliente')
     RETURNING email, nombre, telefono, rol`,
    [emailFinal, nombre, telefono ?? null, hash]
  );
  return rows[0];
}