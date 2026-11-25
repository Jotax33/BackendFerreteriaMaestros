import 'dotenv/config';
import pg from 'pg';

console.log('usuario:', process.env.DB_USER, '| largo de la contraseña:', process.env.DB_PASSWORD?.length);

const c = new pg.Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

try {
  await c.connect();
  console.log('Conexión OK');
} catch (e) {
  console.log('ERROR:', e.message);
} finally {
  await c.end().catch(() => {});
}