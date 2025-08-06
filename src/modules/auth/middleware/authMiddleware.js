const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ 
      message: 'Acceso denegado. Token no proporcionado.' 
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({ 
      message: 'Token inválido o expirado.' 
    });
  }
};

// Middleware para verificar roles específicos
const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Usuario no autenticado.' 
      });
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ 
        message: 'No tienes permiso para acceder a este recurso.' 
      });
    }
  };
};

module.exports = {
  verifyToken,
  verifyRole
};
