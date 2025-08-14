const pool = require('../../../db/connection');

class SubTipo {
    // Obtener todos los subtipos con información del tipo
    static async obtenerTodos() {
        try {
            const query = `
                SELECT 
                    st.id_sub_tipo,
                    st.sub_tipo_nombre,
                    st.created_at,
                    st.updated_at,
                    st.tipo as tipo_id,
                    t.tipo_nombre
                FROM sub_tipo st
                INNER JOIN tipos t ON st.tipo = t.id_tipo
                ORDER BY t.tipo_nombre ASC, st.sub_tipo_nombre ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener subtipos:', error);
            throw error;
        }
    }

    // Obtener subtipo por ID
    static async obtenerPorId(id) {
        try {
            const query = `
                SELECT 
                    st.id_sub_tipo,
                    st.sub_tipo_nombre,
                    st.created_at,
                    st.updated_at,
                    st.tipo as tipo_id,
                    t.tipo_nombre
                FROM sub_tipo st
                INNER JOIN tipos t ON st.tipo = t.id_tipo
                WHERE st.id_sub_tipo = $1
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener subtipo por ID:', error);
            throw error;
        }
    }

    // Obtener subtipos por tipo
    static async obtenerPorTipo(tipoId) {
        try {
            const query = `
                SELECT 
                    st.id_sub_tipo,
                    st.sub_tipo_nombre,
                    st.created_at,
                    st.updated_at,
                    st.tipo as tipo_id,
                    t.tipo_nombre
                FROM sub_tipo st
                INNER JOIN tipos t ON st.tipo = t.id_tipo
                WHERE st.tipo = $1
                ORDER BY st.sub_tipo_nombre ASC
            `;
            const result = await pool.query(query, [tipoId]);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener subtipos por tipo:', error);
            throw error;
        }
    }

    // Crear nuevo subtipo
    static async crear(tipoId, subTipoNombre) {
        try {
            const query = `
                INSERT INTO sub_tipo (tipo, sub_tipo_nombre)
                VALUES ($1, $2)
                RETURNING id_sub_tipo, tipo, sub_tipo_nombre, created_at, updated_at
            `;
            const result = await pool.query(query, [tipoId, subTipoNombre]);
            return result.rows[0];
        } catch (error) {
            console.error('Error al crear subtipo:', error);
            throw error;
        }
    }

    // Actualizar subtipo
    static async actualizar(id, subTipoNombre) {
        try {
            const query = `
                UPDATE sub_tipo 
                SET sub_tipo_nombre = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id_sub_tipo = $2
                RETURNING id_sub_tipo, tipo, sub_tipo_nombre, created_at, updated_at
            `;
            const result = await pool.query(query, [subTipoNombre, id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al actualizar subtipo:', error);
            throw error;
        }
    }

    // Eliminar subtipo
    static async eliminar(id) {
        try {
            const query = `
                DELETE FROM sub_tipo 
                WHERE id_sub_tipo = $1
                RETURNING id_sub_tipo, sub_tipo_nombre
            `;
            const result = await pool.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error al eliminar subtipo:', error);
            throw error;
        }
    }

    // Buscar subtipos por nombre
    static async buscarPorNombre(termino) {
        try {
            const query = `
                SELECT 
                    st.id_sub_tipo,
                    st.sub_tipo_nombre,
                    st.created_at,
                    st.updated_at,
                    st.tipo as tipo_id,
                    t.tipo_nombre
                FROM sub_tipo st
                INNER JOIN tipos t ON st.tipo = t.id_tipo
                WHERE st.sub_tipo_nombre ILIKE $1
                ORDER BY t.tipo_nombre ASC, st.sub_tipo_nombre ASC
            `;
            const result = await pool.query(query, [`%${termino}%`]);
            return result.rows;
        } catch (error) {
            console.error('Error al buscar subtipos:', error);
            throw error;
        }
    }

    // Obtener conteo de subtipos por tipo
    static async conteoSubtiposPorTipo() {
        try {
            const query = `
                SELECT 
                    t.id_tipo,
                    t.tipo_nombre,
                    COUNT(st.id_sub_tipo) as total_subtipos
                FROM tipos t
                LEFT JOIN sub_tipo st ON t.id_tipo = st.tipo
                GROUP BY t.id_tipo, t.tipo_nombre
                ORDER BY total_subtipos DESC, t.tipo_nombre ASC
            `;
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error al obtener conteo de subtipos por tipo:', error);
            throw error;
        }
    }

    // Verificar si existe un subtipo por nombre y tipo
    static async existePorNombreYTipo(nombre, tipoId, excluirId = null) {
        try {
            let query = `
                SELECT id_sub_tipo 
                FROM sub_tipo 
                WHERE sub_tipo_nombre = $1 AND tipo = $2
            `;
            let params = [nombre, tipoId];

            if (excluirId) {
                query += ` AND id_sub_tipo != $3`;
                params.push(excluirId);
            }

            const result = await pool.query(query, params);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error al verificar existencia de subtipo:', error);
            throw error;
        }
    }

    // Verificar si existe un tipo
    static async tipoExiste(tipoId) {
        try {
            const query = `
                SELECT id_tipo 
                FROM tipos 
                WHERE id_tipo = $1
            `;
            const result = await pool.query(query, [tipoId]);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error al verificar existencia de tipo:', error);
            throw error;
        }
    }

    // Obtener estadísticas de subtipos
    static async obtenerEstadisticas() {
        try {
            const query = `
                SELECT 
                    COUNT(st.id_sub_tipo) as total_subtipos,
                    COUNT(DISTINCT st.tipo) as tipos_con_subtipos,
                    AVG(subtype_count.count) as promedio_subtipos_por_tipo,
                    MAX(subtype_count.count) as max_subtipos_por_tipo,
                    MIN(subtype_count.count) as min_subtipos_por_tipo
                FROM sub_tipo st
                LEFT JOIN (
                    SELECT tipo, COUNT(*) as count
                    FROM sub_tipo
                    GROUP BY tipo
                ) subtype_count ON st.tipo = subtype_count.tipo
            `;
            const result = await pool.query(query);
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener estadísticas de subtipos:', error);
            throw error;
        }
    }
}

module.exports = SubTipo;
