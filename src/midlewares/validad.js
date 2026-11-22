export const validarRegistro = (req, res, next) => {
  const { nombre, email, password } = req.body;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    return res.status(400).json({ error: 'El nombre es obligatorio y debe tener al menos 3 caracteres.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ error: 'Debe proporcionar un correo electrónico válido.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña es obligatoria y debe tener al menos 6 caracteres.' });
  }

  next();
};

export const validarActualizacionUsuario = (req, res, next) => {
  const { nombre, email, password } = req.body;

  if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim().length < 3)) {
    return res.status(400).json({ error: 'El nombre debe tener al menos 3 caracteres.' });
  }

  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de correo electrónico inválido.' });
    }
  }

  if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
  }

  next();
};