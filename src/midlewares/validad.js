import { AppError } from '../utils/AppError.js';
export const validar = (schema) => (req, res, next) => {  const r = schema.safeParse(req.body); 
     if (!r.success) return next(new AppError(400, 'Datos inválidos', r.error.issues)); 
      req.body = r.data;  next();};