const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos (ajusta según tu configuración)
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'lexyboz',
    password: 'root',
    port: 5432,
});

async function aplicarActualizaciones() {
    try {
        console.log('Aplicando actualizaciones de estructura simplificada...');
        
        // Leer y ejecutar el script de actualización
        const sqlPath = path.join(__dirname, 'database_queries', 'create_ejercicio_reactivos.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await pool.query(sql);
        console.log('✅ Actualizaciones aplicadas exitosamente');
        
        // Verificar la nueva estructura
        const result = await pool.query(`
            SELECT 
                table_name, 
                column_name, 
                data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('ejercicios', 'reactivo_lectura_pseudopalabras')
            ORDER BY table_name, ordinal_position;
        `);
        
        console.log('\n📋 Nueva estructura de tablas:');
        console.table(result.rows);
        
    } catch (error) {
        console.error('❌ Error al aplicar actualizaciones:', error.message);
    } finally {
        await pool.end();
    }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
    aplicarActualizaciones();
}

module.exports = aplicarActualizaciones;
