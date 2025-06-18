const express = require('express');
const cors = require('cors');
const adminRoutes = require('./src/routes/adminRoutes');
const authRoutes = require('./src/routes/authRoutes');
const doctorPacienteRoutes = require('./src/routes/doctorPacienteRoutes');
const citaRoutes = require('./src/routes/citaRoutes');
const kitRoutes = require('./src/routes/kitRoutes');
const ejercicioRoutes = require('./src/routes/ejercicioRoutes');
const ejerciciosKitsRoutes = require('./src/routes/ejerciciosKitsRoutes');
const kitsAsignadosRoutes = require('./src/routes/kitsAsignadosRoutes');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/api', adminRoutes);
app.use('/api', authRoutes);
app.use('/api/doctor-paciente', doctorPacienteRoutes);
app.use('/api/citas', citaRoutes);
app.use('/api/kits', kitRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/ejercicios-kits', ejerciciosKitsRoutes);
app.use('/api/kits-asignados', kitsAsignadosRoutes);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});