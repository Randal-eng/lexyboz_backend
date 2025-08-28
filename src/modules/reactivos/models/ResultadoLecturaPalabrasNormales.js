const db = require('../../../db/connection');

class ResultadoLecturaPalabrasNormales {
  static async create({ usuario_ID, id_reactivo, voz_usuario_URL }) {
    const query = `
      INSERT INTO resultados_lectura_palabras_normales
        (usuario_ID, id_reactivo, voz_usuario_URL)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [usuario_ID, id_reactivo, voz_usuario_URL];
    const { rows } = await db.query(query, values);
    return rows[0];
  }
}

module.exports = ResultadoLecturaPalabrasNormales;
