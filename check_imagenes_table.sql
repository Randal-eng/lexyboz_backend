-- Verificar si existe la tabla imagenes
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'imagenes'
ORDER BY ordinal_position;

-- Si no existe, crearla
CREATE TABLE IF NOT EXISTS imagenes (
    id_imagen SERIAL PRIMARY KEY,
    reactivo_id INTEGER NOT NULL REFERENCES reactivo_imagen_correcta(id_reactivo) ON DELETE CASCADE,
    imagen_url VARCHAR(500) NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verificar que se creó correctamente
\d imagenes;