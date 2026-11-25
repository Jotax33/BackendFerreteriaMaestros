import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';

const [nombre, correo, password] = process.argv.slice(2);
const hash = await bcrypt.hash(password, 12);
await pool.query(
  `INSERT INTO usuarios (correo, nombre, contrasenia_hash, rol)
   VALUES ($1,$2,$3,'admin')`, [correo.toLowerCase(), nombre, hash]);
console.log('Admin creado');
await pool.end();