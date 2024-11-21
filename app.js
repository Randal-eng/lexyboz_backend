const express = require('express');
const cors = require('cors');
const adminRoutes = require('./src/routes/adminRoutes');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));

app.use('/api', adminRoutes);

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});