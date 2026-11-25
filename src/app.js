import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import  pool  from './config/db.js';
import { manejarErrores } from './midlewares/errores.js';
import authRoutes from './routes/auth.routes.js';
import swaggerUi from 'swagger-ui-express';
import spec from './docs/swagger.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/health', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ estado: 'ok' });
});

// aquí irán las rutas (pasos 9 y 10)
app.use('/api/auth', authRoutes);
app.use(manejarErrores);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));
export default app;