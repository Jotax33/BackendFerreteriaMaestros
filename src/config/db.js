import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sslConfig = process.env.DB_SSL === 'true'
  ? {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.resolve(__dirname, '../../global-bundle.pem')).toString(),
    }
  : false;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: sslConfig,
});

export default pool;