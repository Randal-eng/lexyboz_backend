const userModel = require('../models/User');

/**
 * Obtiene todos los doctores.
 */
const getDoctors = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;
    const { rows, total } = await userModel.getAllDoctors({ limit, offset });
    if (!rows || rows.length === 0) {
      return res.status(200).json({ page, limit, total, count: 0, doctors: [], message: 'No hay doctores registrados.' });
    }
    res.status(200).json({ page, limit, total, count: rows.length, doctors: rows });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener doctores', error: error.message });
  }
};

/**
 * Obtiene todos los pacientes.
 */
const getPatients = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;
    const { rows, total } = await userModel.getAllPatients({ limit, offset });
    if (!rows || rows.length === 0) {
      return res.status(200).json({ page, limit, total, count: 0, patients: [], message: 'No hay pacientes registrados.' });
    }
    res.status(200).json({ page, limit, total, count: rows.length, patients: rows });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pacientes', error: error.message });
  }
};

/**
 * Obtiene vínculos doctor-paciente con info básica de ambos.
 */
const getDoctorPatientLinks = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;
    const { rows, total } = await userModel.getDoctorPatientLinks({ limit, offset });
    if (!rows || rows.length === 0) {
      return res.status(200).json({ page, limit, total, count: 0, links: [], message: 'No hay vínculos doctor-paciente registrados.' });
    }
    res.status(200).json({ page, limit, total, count: rows.length, links: rows });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener vínculos', error: error.message });
  }
};

// Nuevo: todos los usuarios con paginación
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;
    const { rows, total } = await userModel.getAllUsers({ limit, offset });
    if (!rows || rows.length === 0) {
      return res.status(200).json({ page, limit, total, count: 0, users: [], message: 'No hay usuarios registrados.' });
    }
    res.status(200).json({ page, limit, total, count: rows.length, users: rows });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
};

module.exports = { getDoctors, getPatients, getDoctorPatientLinks, getAllUsers };
