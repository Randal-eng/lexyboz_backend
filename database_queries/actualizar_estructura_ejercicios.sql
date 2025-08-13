-- Script para actualizar la estructura de ejercicios y reactivos
-- Ejecutar paso a paso para evitar problemas

-- 1. Crear tabla de relación ejercicio_reactivos
CREATE TABLE IF NOT EXISTS ejercicio_reactivos (
    id_ejercicio_reactivo SERIAL PRIMARY KEY,
    ejercicio_id INTEGER NOT NULL,
    reactivo_id INTEGER NOT NULL,
    orden_reactivo INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_ejercicio_reactivos_ejercicio 
        FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(ejercicio_id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_ejercicio_reactivos_reactivo 
        FOREIGN KEY (reactivo_id) REFERENCES reactivo_lectura_pseudopalabras(id_reactivo) 
        ON DELETE CASCADE,
    
    -- Constraint para evitar duplicados
    CONSTRAINT uk_ejercicio_reactivo UNIQUE (ejercicio_id, reactivo_id),
    
    -- Constraint para orden único por ejercicio
    CONSTRAINT uk_ejercicio_orden UNIQUE (ejercicio_id, orden_reactivo)
);

-- 2. Migrar datos existentes de reactivo_lectura_pseudopalabras que tienen ejercicio_id
INSERT INTO ejercicio_reactivos (ejercicio_id, reactivo_id, orden_reactivo)
SELECT 
    ejercicio_id, 
    id_reactivo, 
    COALESCE(orden_reactivo, 1) as orden_reactivo
FROM reactivo_lectura_pseudopalabras 
WHERE ejercicio_id IS NOT NULL;

-- 3. Eliminar columnas innecesarias de la tabla ejercicios
ALTER TABLE ejercicios 
DROP COLUMN IF EXISTS tipo,
DROP COLUMN IF EXISTS tipo_ejercicio,
DROP COLUMN IF EXISTS tipo_reactivo;

-- 4. Eliminar columnas de relación directa de reactivo_lectura_pseudopalabras
ALTER TABLE reactivo_lectura_pseudopalabras 
DROP COLUMN IF EXISTS ejercicio_id,
DROP COLUMN IF EXISTS orden_reactivo;

-- 5. Agregar índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_ejercicio_reactivos_ejercicio_id 
    ON ejercicio_reactivos(ejercicio_id);
CREATE INDEX IF NOT EXISTS idx_ejercicio_reactivos_reactivo_id 
    ON ejercicio_reactivos(reactivo_id);
CREATE INDEX IF NOT EXISTS idx_ejercicio_reactivos_orden 
    ON ejercicio_reactivos(ejercicio_id, orden_reactivo);

-- 6. Comentarios para documentar la estructura
COMMENT ON TABLE ejercicio_reactivos IS 'Tabla de relación muchos a muchos entre ejercicios y reactivos';
COMMENT ON COLUMN ejercicio_reactivos.orden_reactivo IS 'Orden de presentación del reactivo en el ejercicio';
