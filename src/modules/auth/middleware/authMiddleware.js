/**
 * @fileoverview Middleware de autenticación y autorización JWT
 * @module AuthMiddleware
 * @requires jsonwebtoken
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar la validez del token JWT.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - Función para pasar al siguiente middleware.
 * @returns {void}
 * @throws {Error} Si el token no está presente o es inválido.
 * @example
 * // Uso en rutas:
 * router.get('/ruta-protegida', verifyToken, (req, res) => {
 *   // El token es válido, acceder a los datos del usuario:
 *   const userId = req.user.id;
 *   const userEmail = req.user.email;
 * });
 */
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
/**
 * Middleware para verificar el rol del usuario.
 * @param {string[]} roles - Array de roles permitidos.
 * @returns {function} Middleware de Express para verificación de roles.
 * @example
 * // Uso en rutas:
 * router.get('/admin-only', verifyToken, verifyRole(['admin']), (req, res) => {
 *   // Solo usuarios con rol 'admin' pueden acceder
 * });
 * 
 * // Múltiples roles:
 * router.get('/staff', verifyToken, verifyRole(['admin', 'doctor']), (req, res) => {
 *   // Solo admins y doctores pueden acceder
 * });
 */
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
