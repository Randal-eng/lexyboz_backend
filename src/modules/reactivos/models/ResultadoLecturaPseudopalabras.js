const db = require('../../../db/connection');

class ResultadoLecturaPseudopalabras {
  static async create({ usuario_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto, fecha_realizacion }) {
    const query = `
      INSERT INTO resultados_lectura_pseudopalabras
        (usuario_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto, fecha_realizacion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [usuario_id, id_reactivo, voz_usuario_url, tiempo_respuesta, es_correcto, fecha_realizacion];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}

module.exports = ResultadoLecturaPseudopalabras;
