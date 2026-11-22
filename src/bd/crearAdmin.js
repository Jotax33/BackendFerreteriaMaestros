import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

dotenv.config();

async function crearAdminInicial() {
  const nombre = 'Administrador Maestros';
  const email = 'admin@maestros.cl';
  const passwordPlana = 'Admin1234!';
  const rolAdminId = 1;

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordPlana, saltRounds);

    const query = `
      INSERT INTO usuarios (nombre, email, password_hash, rol_id, activo)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, nombre, email, rol_id;
    `;

    const result = await pool.query(query, [nombre, email, passwordHash, rolAdminId]);

    if (result.rows.length > 0) {
      console.log('Usuario Administrador creado con éxito:', result.rows[0]);
    } else {
      console.log('El usuario Administrador ya existía en la base de datos.');
    }
  } catch (error) {
    console.error('Error al crear el administrador:', error);
  } finally {
    await pool.end();
  }
}

crearAdminInicial();