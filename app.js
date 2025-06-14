const express = require('express');
const cors = require('cors');
const adminRoutes = require('./src/routes/adminRoutes');
const authRoutes = require('./src/routes/authRoutes');
const doctorPacienteRoutes = require('./src/routes/doctorPacienteRoutes');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/api', adminRoutes);
app.use('/api', authRoutes);
app.use('/api/doctor-paciente', doctorPacienteRoutes);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});