// Exportar controladores
const authController = require('./controllers/authController');
const adminController = require('./controllers/adminController');

// Exportar modelos
const User = require('./models/User');
const Admin = require('./models/Admin');

module.exports = {
  // Controladores
  authController,
  adminController,
  
  // Modelos
  User,
  Admin
};
