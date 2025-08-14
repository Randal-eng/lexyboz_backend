const KitAsignado = require('../models/KitAsignado');

class KitAsignadoController {

  // Asignar un kit a un paciente
  static async asignarKit(req, res) {
    try {
      const { kitId, pacienteId } = req.body;

      // Validar datos requeridos
      if (!kitId || !pacienteId) {
        return res.status(400).json({
          message: 'Kit ID y Paciente ID son requeridos',
          error: 'Datos incompletos'
        });
      }

      // Verificar si ya existe una asignación
      const asignacionExistente = await KitAsignado.verificarAsignacionExistente(kitId, pacienteId);
      if (asignacionExistente) {
        return res.status(409).json({
          message: 'Este kit ya está asignado a este paciente',
          asignacion: asignacionExistente
        });
      }

      // Crear la asignación
      const nuevaAsignacion = await KitAsignado.asignarKit(kitId, pacienteId);

      res.status(201).json({
        message: 'Kit asignado exitosamente',
        asignacion: nuevaAsignacion
      });

    } catch (error) {
      console.error('Error en asignarKit:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Obtener asignaciones de un paciente específico
  static async obtenerAsignacionesPorPaciente(req, res) {
    try {
      const { pacienteId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      if (!pacienteId) {
        return res.status(400).json({
          message: 'Paciente ID es requerido'
        });
      }

      const resultado = await KitAsignado.obtenerAsignacionesPorPaciente(pacienteId, page, limit);

      res.json({
        message: 'Asignaciones del paciente obtenidas exitosamente',
        data: resultado.asignaciones,
        pagination: resultado.pagination
      });

    } catch (error) {
      console.error('Error en obtenerAsignacionesPorPaciente:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Obtener una asignación específica por ID
  static async obtenerAsignacionPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: 'ID de asignación es requerido'
        });
      }

      const asignacion = await KitAsignado.obtenerAsignacionPorId(id);

      if (!asignacion) {
        return res.status(404).json({
          message: 'Asignación no encontrada'
        });
      }

      res.json({
        message: 'Asignación obtenida exitosamente',
        asignacion
      });

    } catch (error) {
      console.error('Error en obtenerAsignacionPorId:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Obtener todas las asignaciones
  static async obtenerTodasLasAsignaciones(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const estado = req.query.estado || null;

      const resultado = await KitAsignado.obtenerTodasLasAsignaciones(page, limit, estado);

      res.json({
        message: 'Asignaciones obtenidas exitosamente',
        data: resultado.asignaciones,
        pagination: resultado.pagination
      });

    } catch (error) {
      console.error('Error en obtenerTodasLasAsignaciones:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Actualizar estado de una asignación
  static async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!id || !estado) {
        return res.status(400).json({
          message: 'ID y estado son requeridos'
        });
      }

      // Validar estados permitidos
      const estadosValidos = ['pendiente', 'en_progreso', 'completado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          message: 'Estado no válido',
          estadosPermitidos: estadosValidos
        });
      }

      const asignacionActualizada = await KitAsignado.actualizarEstado(id, estado);

      if (!asignacionActualizada) {
        return res.status(404).json({
          message: 'Asignación no encontrada'
        });
      }

      res.json({
        message: 'Estado de asignación actualizado exitosamente',
        asignacion: asignacionActualizada
      });

    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Eliminar una asignación
  static async eliminarAsignacion(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          message: 'ID de asignación es requerido'
        });
      }

      const asignacionEliminada = await KitAsignado.eliminarAsignacion(id);

      if (!asignacionEliminada) {
        return res.status(404).json({
          message: 'Asignación no encontrada'
        });
      }

      res.json({
        message: 'Asignación eliminada exitosamente',
        asignacion: asignacionEliminada
      });

    } catch (error) {
      console.error('Error en eliminarAsignacion:', error);
      res.status(500).json({
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}

module.exports = KitAsignadoController;
