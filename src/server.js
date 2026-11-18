import 'dotenv/config';
import app from './app.js';

app.listen(process.env.PORT, '0.0.0.0', () =>
  console.log(`API en puerto ${process.env.PORT}`));