-- Script para verificar y crear las tablas necesarias para reactivos

-- 1. Crear tabla reactivo_imagen_correcta si no existe
CREATE TABLE IF NOT EXISTS reactivo_imagen_correcta (
    id_reactivo SERIAL PRIMARY KEY,
    id_sub_tipo INTEGER NOT NULL,
    tiempo_duracion INTEGER NOT NULL,
    oracion VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla imagenes para reactivo_imagen_correcta si no existe
CREATE TABLE IF NOT EXISTS imagenes (
    id_imagen SERIAL PRIMARY KEY,
    reactivo_id INTEGER NOT NULL REFERENCES reactivo_imagen_correcta(id_reactivo) ON DELETE CASCADE,
    imagen_url VARCHAR(500) NOT NULL,
    es_correcta BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Verificar que las tablas existen
SELECT 'reactivo_imagen_correcta' as tabla, COUNT(*) as existe 
FROM information_schema.tables 
WHERE table_name = 'reactivo_imagen_correcta'

UNION ALL

SELECT 'imagenes' as tabla, COUNT(*) as existe 
FROM information_schema.tables 
WHERE table_name = 'imagenes';

-- 4. Ver estructura de las tablas
\d reactivo_imagen_correcta;
\d imagenes;