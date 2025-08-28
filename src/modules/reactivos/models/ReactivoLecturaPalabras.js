// Asigna reactivos de diferentes subtipos a un ejercicio
const agregarReactivosAEjercicioConSubTipoMultiple = async (ejercicioId, reactivosData) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ejercicioResult = await client.query(
      'SELECT ejercicio_id FROM ejercicios WHERE ejercicio_id = $1',
      [ejercicioId]
    );
    if (ejercicioResult.rows.length === 0) {
      throw new Error('Ejercicio no encontrado');
    }
    // Insertar relaciones
    const insertPromises = reactivosData.map(reactivo => {
      return client.query(
        'INSERT INTO ejercicio_reactivos (ejercicio_id, reactivo_id, orden) VALUES ($1, $2, $3) ON CONFLICT (ejercicio_id, reactivo_id) DO UPDATE SET orden = $3, activo = true, fecha_actualizacion = NOW() RETURNING *',
        [ejercicioId, reactivo.id_reactivo, reactivo.orden]
      );
    });
    const insertResults = await Promise.all(insertPromises);
    await client.query('COMMIT');
    return {
      ejercicio_id: ejercicioId,
      reactivos_agregados: insertResults.map(result => result.rows[0])
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('Error al asignar reactivos al ejercicio: ' + error.message);
  } finally {
    client.release();
  }
};
// Asigna reactivos de un solo subtipo a un ejercicio
const agregarReactivosAEjercicioConSubTipo = async (ejercicioId, reactivosData, subTipoId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ejercicioResult = await client.query(
      'SELECT ejercicio_id FROM ejercicios WHERE ejercicio_id = $1',
      [ejercicioId]
    );
    if (ejercicioResult.rows.length === 0) {
      throw new Error('Ejercicio no encontrado');
    }
    // Validar que todos los reactivos pertenezcan al subtipo
    const validos = await validarReactivosSubTipo(reactivosData.map(r => r.id_reactivo), subTipoId);
    if (!validos) {
      throw new Error('Uno o más reactivos no pertenecen al subtipo indicado');
    }
    // Insertar relaciones
    const insertPromises = reactivosData.map(reactivo => {
      return client.query(
        'INSERT INTO ejercicio_reactivos (ejercicio_id, reactivo_id, orden, sub_tipo_id) VALUES ($1, $2, $3, $4) ON CONFLICT (ejercicio_id, reactivo_id) DO UPDATE SET orden = $3, sub_tipo_id = $4, activo = true, fecha_actualizacion = NOW() RETURNING *',
        [ejercicioId, reactivo.id_reactivo, reactivo.orden, subTipoId]
      );
    });
    const insertResults = await Promise.all(insertPromises);
    await client.query('COMMIT');
    return {
      ejercicio_id: ejercicioId,
      reactivos_agregados: insertResults.map(result => result.rows[0])
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error('Error al asignar reactivos al ejercicio: ' + error.message);
  } finally {
    client.release();
  }
};
// FUNCIONES ADAPTADAS DEL MODELO DE PSEUDOPALABRAS

const obtenerReactivosPorSubTipo = async (idSubTipo, filtros = {}) => {
  const { limit = 20, offset = 0 } = filtros;
  try {
    const query = `
      SELECT 
        r.id_reactivo,
        r.palabra,
        r.id_sub_tipo,
        r.tiempo_duracion
      FROM reactivo_lectura_palabras r
      WHERE r.id_sub_tipo = $1
      ORDER BY r.id_reactivo ASC
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reactivo_lectura_palabras r
      WHERE r.id_sub_tipo = $1
    `;
    const [reactivosResult, countResult] = await Promise.all([
      pool.query(query, [idSubTipo, limit, offset]),
      pool.query(countQuery, [idSubTipo])
    ]);
    return {
      reactivos: reactivosResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  } catch (error) {
    throw new Error(`Error al obtener reactivos por sub tipo: ${error.message}`);
  }
};

const obtenerReactivosPorTipo = async (tipoId, filtros = {}) => {
  const { limit = 20, offset = 0 } = filtros;
  try {
    const query = `
      SELECT 
        r.id_reactivo,
        r.palabra,
        r.id_sub_tipo,
        r.tiempo_duracion
      FROM reactivo_lectura_palabras r
      LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
      WHERE st.tipo = $1
      ORDER BY r.id_reactivo ASC
      LIMIT $2 OFFSET $3
    `;
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reactivo_lectura_palabras r
      LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
      WHERE st.tipo = $1
    `;
    const [reactivosResult, countResult] = await Promise.all([
      pool.query(query, [tipoId, limit, offset]),
      pool.query(countQuery, [tipoId])
    ]);
    return {
      reactivos: reactivosResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  } catch (error) {
    throw new Error(`Error al obtener reactivos por tipo: ${error.message}`);
  }
};

const verificarCompatibilidadTipo = async (ejercicioId, tipoId = null) => {
  try {
    const reactivosExistentes = await pool.query(`
      SELECT COUNT(*) as total_reactivos
      FROM ejercicio_reactivos er
      WHERE er.ejercicio_id = $1 AND er.activo = true
    `, [ejercicioId]);
    const totalReactivos = parseInt(reactivosExistentes.rows[0].total_reactivos);
    if (totalReactivos === 0) {
      return { compatible: true, mensaje: 'El ejercicio no tiene reactivos, se puede agregar cualquier tipo' };
    }
    return { compatible: true, mensaje: `El ejercicio ya tiene ${totalReactivos} reactivos. Se pueden agregar más.` };
  } catch (error) {
    throw new Error(`Error al verificar compatibilidad: ${error.message}`);
  }
};

const agregarReactivosAEjercicio = async (ejercicioId, reactivosData) => {
  const { error, value } = reactivosEjercicioSchema.validate({ reactivos: reactivosData });
  if (error) {
    throw new Error(`Datos inválidos: ${error.details[0].message}`);
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ejercicioResult = await client.query(
      'SELECT ejercicio_id FROM ejercicios WHERE ejercicio_id = $1',
      [ejercicioId]
    );
    if (ejercicioResult.rows.length === 0) {
      throw new Error('Ejercicio no encontrado');
    }
    const reactivoIds = value.reactivos.map(r => r.id_reactivo);
    const reactivosResult = await client.query(`
      SELECT r.id_reactivo, r.palabra
      FROM reactivo_lectura_palabras r
      WHERE r.id_reactivo = ANY($1)
    `, [reactivoIds]);
    if (reactivosResult.rows.length !== reactivoIds.length) {
      throw new Error('Algunos reactivos no existen');
    }
    const compatibilidad = await verificarCompatibilidadTipo(ejercicioId);
    if (!compatibilidad.compatible) {
      throw new Error(compatibilidad.mensaje);
    }
    const insertPromises = value.reactivos.map(reactivo => {
      return client.query(`
        INSERT INTO ejercicio_reactivos (ejercicio_id, reactivo_id, orden)
        VALUES ($1, $2, $3)
        ON CONFLICT (ejercicio_id, reactivo_id) 
        DO UPDATE SET orden = $3, activo = true, fecha_actualizacion = NOW()
        RETURNING *
      `, [ejercicioId, reactivo.id_reactivo, reactivo.orden]);
    });
    const insertResults = await Promise.all(insertPromises);
    await client.query('COMMIT');
    return {
      ejercicio_id: ejercicioId,
      reactivos_agregados: insertResults.map(result => result.rows[0]),
      total_reactivos: insertResults.length
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error al agregar reactivos al ejercicio: ${error.message}`);
  } finally {
    client.release();
  }
};

const obtenerReactivosDeEjercicio = async (ejercicioId) => {
  try {
    const result = await pool.query(`
      SELECT 
        er.ejercicio_reactivo_id,
        er.ejercicio_id,
        er.reactivo_id,
        er.orden,
        er.activo,
        r.palabra,
        r.tiempo_duracion
      FROM ejercicio_reactivos er
      JOIN reactivo_lectura_palabras r ON er.reactivo_id = r.id_reactivo
      WHERE er.ejercicio_id = $1 AND er.activo = true
      ORDER BY er.orden ASC
    `, [ejercicioId]);
    return result.rows;
  } catch (error) {
    throw new Error(`Error al obtener reactivos del ejercicio: ${error.message}`);
  }
};

const removerReactivoDeEjercicio = async (ejercicioId, reactivoId) => {
  try {
    const result = await pool.query(`
      UPDATE ejercicio_reactivos 
      SET activo = false, fecha_actualizacion = NOW()
      WHERE ejercicio_id = $1 AND reactivo_id = $2
      RETURNING *
    `, [ejercicioId, reactivoId]);
    if (result.rows.length === 0) {
      throw new Error('Relación ejercicio-reactivo no encontrada');
    }
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al remover reactivo del ejercicio: ${error.message}`);
  }
};

const reordenarReactivosEnEjercicio = async (ejercicioId, nuevosOrdenes) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const updatePromises = nuevosOrdenes.map(({ reactivo_id, orden }) => {
      return client.query(`
        UPDATE ejercicio_reactivos 
        SET orden = $1, fecha_actualizacion = NOW()
        WHERE ejercicio_id = $2 AND reactivo_id = $3 AND activo = true
        RETURNING *
      `, [orden, ejercicioId, reactivo_id]);
    });
    const updateResults = await Promise.all(updatePromises);
    await client.query('COMMIT');
    return updateResults.map(result => result.rows[0]).filter(Boolean);
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Error al reordenar reactivos: ${error.message}`);
  } finally {
    client.release();
  }
};
const obtenerReactivosPalabra = async (filtros = {}) => {
  const { 
    limit = 20, 
    offset = 0, 
    id_sub_tipo = null,
    buscar = null 
  } = filtros;

  try {
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (id_sub_tipo) {
      paramCount++;
      whereConditions.push(`r.id_sub_tipo = $${paramCount}`);
      queryParams.push(id_sub_tipo);
    }
    if (buscar) {
      paramCount++;
      whereConditions.push(`r.palabra ILIKE $${paramCount}`);
      queryParams.push(`%${buscar}%`);
    }
    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    const reactivosQuery = `
      SELECT 
        r.id_reactivo,
        r.palabra,
        r.id_sub_tipo,
        r.tiempo_duracion
      FROM reactivo_lectura_palabras r
      ${whereClause}
      ORDER BY r.id_reactivo DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    queryParams.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM reactivo_lectura_palabras r
      ${whereClause}
    `;

    const [reactivosResult, countResult] = await Promise.all([
      pool.query(reactivosQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, paramCount))
    ]);

    return {
      reactivos: reactivosResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  } catch (error) {
    throw new Error(`Error al obtener reactivos: ${error.message}`);
  }
};

const obtenerReactivoPalabraPorId = async (idReactivo) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.id_reactivo,
        r.palabra,
        r.id_sub_tipo,
        r.tiempo_duracion
      FROM reactivo_lectura_palabras r
      WHERE r.id_reactivo = $1
    `, [idReactivo]);
    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Error al obtener reactivo: ${error.message}`);
  }
};

const actualizarReactivoPalabra = async (idReactivo, datosActualizacion) => {
  const { error, value } = actualizarReactivoPalabraSchema.validate(datosActualizacion);
  if (error) {
    throw new Error(`Datos inválidos: ${error.details[0].message}`);
  }
  const campos = Object.keys(value);
  if (campos.length === 0) {
    throw new Error('No se proporcionaron datos para actualizar');
  }
  try {
    const setClauses = campos.map((campo, index) => `${campo} = $${index + 2}`);
    const query = `
      UPDATE reactivo_lectura_palabras 
      SET ${setClauses.join(', ')}
      WHERE id_reactivo = $1 
      RETURNING *
    `;
    const valores = [idReactivo, ...campos.map(campo => value[campo])];
    const result = await pool.query(query, valores);
    if (result.rows.length === 0) {
      throw new Error('Reactivo no encontrado');
    }
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al actualizar reactivo: ${error.message}`);
  }
};

const eliminarReactivoPalabra = async (idReactivo) => {
  try {
    const result = await pool.query(`
      DELETE FROM reactivo_lectura_palabras 
      WHERE id_reactivo = $1 
      RETURNING *
    `, [idReactivo]);
    if (result.rows.length === 0) {
      throw new Error('Reactivo no encontrado');
    }
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al eliminar reactivo: ${error.message}`);
  }
};

const pool = require('../../../db/connection');
const Joi = require('joi');

// =====================================================
// SCHEMAS DE VALIDACIÓN
// =====================================================

const reactivoPalabraSchema = Joi.object({
  palabra: Joi.string().required().min(1).max(100),
  id_sub_tipo: Joi.number().integer().required(),
  tiempo_duracion: Joi.number().integer().min(1).optional()
});

const actualizarReactivoPalabraSchema = Joi.object({
  palabra: Joi.string().min(1).max(100).optional(),
  id_sub_tipo: Joi.number().integer().optional(),
  tiempo_duracion: Joi.number().integer().min(1).optional()
});

const reactivosEjercicioSchema = Joi.object({
  reactivos: Joi.array().items(
    Joi.object({
      id_reactivo: Joi.number().integer().required(),
      orden: Joi.number().integer().min(1).default(1)
    })
  ).min(1).required()
});

// =====================================================
// FUNCIONES DEL MODELO
// =====================================================

const crearReactivoPalabra = async (datosReactivo) => {
  const { error, value } = reactivoPalabraSchema.validate(datosReactivo);
  if (error) {
    throw new Error(`Datos inválidos: ${error.details[0].message}`);
  }
  const { palabra, id_sub_tipo, tiempo_duracion } = value;
  try {
    const result = await pool.query(`
      INSERT INTO reactivo_lectura_palabras 
      (palabra, id_sub_tipo, tiempo_duracion) 
      VALUES ($1, $2, $3) 
      RETURNING *
    `, [palabra, id_sub_tipo, tiempo_duracion || null]);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Error al crear reactivo: ${error.message}`);
  }
};

// Valida que todos los reactivos pertenezcan al subtipo indicado
const validarReactivosSubTipo = async (reactivoIds, subTipoId) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) AS total FROM reactivo_lectura_palabras WHERE id_reactivo = ANY($1) AND id_sub_tipo = $2',
      [reactivoIds, subTipoId]
    );
    // Devuelve true si todos los reactivos pertenecen al subtipo
    return parseInt(result.rows[0].total) === reactivoIds.length;
  } catch (error) {
    throw new Error('Error al validar subtipos de reactivos: ' + error.message);
  }
};

module.exports = {
  crearReactivoPalabra,
  obtenerReactivosPalabra,
  obtenerReactivoPalabraPorId,
  actualizarReactivoPalabra,
  eliminarReactivoPalabra,
  obtenerReactivosPorSubTipo,
  obtenerReactivosPorTipo,
  verificarCompatibilidadTipo,
  agregarReactivosAEjercicio,
  obtenerReactivosDeEjercicio,
  removerReactivoDeEjercicio,
  reordenarReactivosEnEjercicio,
  validarReactivosSubTipo,
  agregarReactivosAEjercicioConSubTipo,
  agregarReactivosAEjercicioConSubTipoMultiple
  };
