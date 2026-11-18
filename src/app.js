import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool } from './config/db.js';
import { manejarErrores } from './midlewares/errores.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ estado: 'ok' });
});

// aquí irán las rutas (pasos 9 y 10)

app.use(manejarErrores);
export default app;