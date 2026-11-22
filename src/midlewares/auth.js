import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_ferreteria_2026';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

export const requiereRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        error: 'Acceso prohibido. No tienes permisos suficientes para realizar esta acción.',
      });
    }
    next();
  };
};

export const verificarPropietarioOAdmin = (req, res, next) => {
  const idSolicitado = parseInt(req.params.id, 10);
  if (isNaN(idSolicitado)) {
    return res.status(400).json({ error: 'El ID de usuario debe ser numérico.' });
  }

  if (req.user.rol === 'Administrador' || req.user.id === idSolicitado) {
    return next();
  }

  return res.status(403).json({
    error: 'Acceso prohibido. No puedes consultar ni modificar el perfil de otro usuario.',
  });
};