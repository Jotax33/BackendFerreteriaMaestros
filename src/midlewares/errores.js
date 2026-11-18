import { AppError } from '../utils/appError.js';

export function manejarErrores(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, detalles: err.details });
  }
  if (err.code === '23505') return res.status(409).json({ error: 'Registro duplicado' });
  if (err.code === '23503') return res.status(409).json({ error: 'La operación afecta registros relacionados' });
  console.error(err.message); 
  res.status(500).json({ error: 'Error interno del servidor' });
}