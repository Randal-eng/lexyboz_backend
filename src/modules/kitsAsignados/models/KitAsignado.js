const pool = require('../../../db/connection');

class KitAsignado {
  
  // Asignar un kit a un paciente
  static async asignarKit(kitId, pacienteId) {
    const query = `
      INSERT INTO kits_asignados (kit_id, paciente_id, estado)
      VALUES ($1, $2, 'pendiente')
      RETURNING *
    `;
    
    try {
      const result = await pool.query(query, [kitId, pacienteId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al asignar kit:', error);
      throw error;
    }
  }

  // Obtener todas las asignaciones de un paciente
  static async obtenerAsignacionesPorPaciente(pacienteId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        ka.id,
        ka.kit_id,
        ka.paciente_id,
        ka.fecha_asignacion,
        ka.estado,
        k.name as kit_nombre,
        k.descripcion as kit_descripcion
      FROM kits_asignados ka
      INNER JOIN kits k ON ka.kit_id = k.kit_id
      WHERE ka.paciente_id = $1
      ORDER BY ka.fecha_asignacion DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM kits_asignados ka
      WHERE ka.paciente_id = $1
    `;

    try {
      const [result, countResult] = await Promise.all([
        pool.query(query, [pacienteId, limit, offset]),
        pool.query(countQuery, [pacienteId])
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        asignaciones: result.rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Error al obtener asignaciones por paciente:', error);
      throw error;
    }
  }

  // Obtener una asignación específica
  static async obtenerAsignacionPorId(id) {
    const query = `
      SELECT 
        ka.id,
        ka.kit_id,
        ka.paciente_id,
        ka.fecha_asignacion,
        ka.estado,
        k.name as kit_nombre,
        k.descripcion as kit_descripcion,
        k.imagen_portada as kit_imagen,
        u.nombre as paciente_nombre,
        u.correo as paciente_email
      FROM kits_asignados ka
      INNER JOIN kits k ON ka.kit_id = k.kit_id
      INNER JOIN Usuario u ON ka.paciente_id = u.usuario_id
      WHERE ka.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al obtener asignación por ID:', error);
      throw error;
    }
  }

  // Actualizar estado de una asignación
  static async actualizarEstado(id, nuevoEstado) {
    const query = `
      UPDATE kits_asignados 
      SET estado = $1
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [nuevoEstado, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al actualizar estado de asignación:', error);
      throw error;
    }
  }

  // Eliminar una asignación
  static async eliminarAsignacion(id) {
    const query = `
      DELETE FROM kits_asignados 
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      throw error;
    }
  }

  // Verificar si un kit ya está asignado a un paciente
  static async verificarAsignacionExistente(kitId, pacienteId) {
    const query = `
      SELECT * FROM kits_asignados 
      WHERE kit_id = $1 AND paciente_id = $2
    `;

    try {
      const result = await pool.query(query, [kitId, pacienteId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al verificar asignación existente:', error);
      throw error;
    }
  }

  // Obtener todas las asignaciones con paginación
  static async obtenerTodasLasAsignaciones(page = 1, limit = 20, estado = null) {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        ka.id,
        ka.kit_id,
        ka.paciente_id,
        ka.fecha_asignacion,
        ka.estado,
        k.name as kit_nombre,
        k.descripcion as kit_descripcion,
        u.nombre as paciente_nombre,
        u.correo as paciente_email
      FROM kits_asignados ka
      INNER JOIN kits k ON ka.kit_id = k.kit_id
      INNER JOIN Usuario u ON ka.paciente_id = u.usuario_id
    `;

    let countQuery = `
      SELECT COUNT(*) as total
      FROM kits_asignados ka
      INNER JOIN kits k ON ka.kit_id = k.kit_id
      INNER JOIN Usuario u ON ka.paciente_id = u.usuario_id
    `;

    const params = [];
    if (estado) {
      query += ` WHERE ka.estado = $1`;
      countQuery += ` WHERE ka.estado = $1`;
      params.push(estado);
    }

    query += ` ORDER BY ka.fecha_asignacion DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    try {
      const [result, countResult] = await Promise.all([
        pool.query(query, params),
        pool.query(countQuery, estado ? [estado] : [])
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        asignaciones: result.rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      console.error('Error al obtener todas las asignaciones:', error);
      throw error;
    }
  }
}

module.exports = KitAsignado;
