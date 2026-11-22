import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pool } from './config/db.js';
import { manejarErrores } from './midlewares/errores.js';
import authRoutes from './routes/authRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';
import setupSwagger from './docs/swagger.js';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ estado: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);

setupSwagger(app);

app.use(manejarErrores);

export default app;