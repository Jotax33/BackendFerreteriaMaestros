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
export async function listar() {
  const { rows } = await pool.query(
    `SELECT email, nombre, telefono, rol, activo
     FROM usuarios ORDER BY nombre ASC`
  );
  return rows;
}

// Solo estas columnas pueden actualizarse
const COLUMNAS_EDITABLES = ['nombre', 'email', 'telefono', 'contrasenia_hash', 'rol', 'activo'];

export async function actualizar(email, campos) {
  const claves = Object.keys(campos).filter((k) => COLUMNAS_EDITABLES.includes(k));
  if (claves.length === 0) return buscarPerfil(email);

  const sets = claves.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const valores = claves.map((k) => campos[k]);
  const { rows } = await pool.query(
    `UPDATE usuarios SET ${sets} WHERE email = $${claves.length + 1}
     RETURNING email, nombre, telefono, rol, activo`,
    [...valores, email]
  );
  return rows[0];
}

export async function eliminar(email) {
  const { rowCount } = await pool.query('DELETE FROM usuarios WHERE email = $1', [email]);
  return rowCount > 0;
}