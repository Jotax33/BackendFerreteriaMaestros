import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import  pool  from './config/db.js';
import { manejarErrores } from './midlewares/errores.js';
import swaggerUi from 'swagger-ui-express';
import spec from './docs/swagger.js';
import authRoutes from './routes/authRoutes.js';
import usuariosRoutes from './routes/usuariosRoutes.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ estado: 'ok' });
});


app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use(manejarErrores);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
export default app;