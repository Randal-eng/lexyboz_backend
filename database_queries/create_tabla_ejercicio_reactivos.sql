-- Crear tabla intermedia para la relación muchos a muchos entre ejercicios y reactivos
-- Esta tabla permite que un ejercicio tenga múltiples reactivos y un reactivo pueda estar en múltiples ejercicios

CREATE TABLE IF NOT EXISTS ejercicio_reactivos (
    ejercicio_reactivo_id SERIAL PRIMARY KEY,
    ejercicio_id INTEGER NOT NULL,
    reactivo_id INTEGER NOT NULL,
    orden INTEGER DEFAULT 1,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    
    -- Foreign keys
    CONSTRAINT fk_ejercicio_reactivos_ejercicio 
        FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(ejercicio_id) ON DELETE CASCADE,
    CONSTRAINT fk_ejercicio_reactivos_reactivo 
        FOREIGN KEY (reactivo_id) REFERENCES reactivo_lectura_pseudopalabras(reactivo_id) ON DELETE CASCADE,
    
    -- Restricción única: un reactivo no puede estar duplicado en el mismo ejercicio
    CONSTRAINT uk_ejercicio_reactivo 
        UNIQUE (ejercicio_id, reactivo_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_ejercicio_reactivos_ejercicio ON ejercicio_reactivos(ejercicio_id);
CREATE INDEX IF NOT EXISTS idx_ejercicio_reactivos_reactivo ON ejercicio_reactivos(reactivo_id);
CREATE INDEX IF NOT EXISTS idx_ejercicio_reactivos_orden ON ejercicio_reactivos(ejercicio_id, orden);
CREATE INDEX IF NOT EXISTS idx_ejercicio_reactivos_activo ON ejercicio_reactivos(activo);

-- Función para validar que todos los reactivos de un ejercicio sean del mismo tipo
CREATE OR REPLACE FUNCTION validar_tipo_reactivos_ejercicio()
RETURNS TRIGGER AS $$
DECLARE
    ejercicio_tipos INTEGER[];
    nuevo_tipo INTEGER;
BEGIN
    -- Obtener tipos existentes en el ejercicio
    SELECT ARRAY_AGG(DISTINCT t.tipo_id) INTO ejercicio_tipos
    FROM ejercicio_reactivos er
    JOIN reactivo_lectura_pseudopalabras r ON er.reactivo_id = r.reactivo_id
    JOIN sub_tipo st ON r.sub_tipo_id = st.sub_tipo_id
    JOIN tipos t ON st.tipo_id = t.tipo_id
    WHERE er.ejercicio_id = NEW.ejercicio_id 
    AND er.activo = true 
    AND er.ejercicio_reactivo_id != COALESCE(NEW.ejercicio_reactivo_id, 0);
    
    -- Obtener el tipo del nuevo reactivo
    SELECT t.tipo_id INTO nuevo_tipo
    FROM reactivo_lectura_pseudopalabras r
    JOIN sub_tipo st ON r.sub_tipo_id = st.sub_tipo_id
    JOIN tipos t ON st.tipo_id = t.tipo_id
    WHERE r.reactivo_id = NEW.reactivo_id;
    
    -- Si hay tipos existentes y el nuevo tipo no coincide, rechazar
    IF ejercicio_tipos IS NOT NULL AND array_length(ejercicio_tipos, 1) > 0 THEN
        IF NOT (nuevo_tipo = ANY(ejercicio_tipos)) THEN
            RAISE EXCEPTION 'No se pueden mezclar tipos de reactivos en un ejercicio. Ejercicio tiene tipo(s): %, nuevo reactivo es tipo: %', 
                            ejercicio_tipos, nuevo_tipo;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validación de tipos
DROP TRIGGER IF EXISTS trigger_validar_tipo_reactivos ON ejercicio_reactivos;
CREATE TRIGGER trigger_validar_tipo_reactivos
    BEFORE INSERT OR UPDATE ON ejercicio_reactivos
    FOR EACH ROW
    WHEN (NEW.activo = true)
    EXECUTE FUNCTION validar_tipo_reactivos_ejercicio();

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp_ejercicio_reactivos()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para timestamps
CREATE TRIGGER trigger_timestamp_ejercicio_reactivos
    BEFORE UPDATE ON ejercicio_reactivos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_timestamp_ejercicio_reactivos();

-- Comentarios en la tabla
COMMENT ON TABLE ejercicio_reactivos IS 'Tabla intermedia para la relación muchos a muchos entre ejercicios y reactivos';
COMMENT ON COLUMN ejercicio_reactivos.ejercicio_id IS 'ID del ejercicio';
COMMENT ON COLUMN ejercicio_reactivos.reactivo_id IS 'ID del reactivo';
COMMENT ON COLUMN ejercicio_reactivos.orden IS 'Orden del reactivo dentro del ejercicio';
COMMENT ON COLUMN ejercicio_reactivos.activo IS 'Indica si la relación está activa (soft delete)';

-- Datos de ejemplo (opcional)
-- Estos datos se pueden usar para pruebas una vez que existan ejercicios y reactivos
/*
INSERT INTO ejercicio_reactivos (ejercicio_id, reactivo_id, orden) VALUES
    (1, 1, 1),
    (1, 2, 2),
    (1, 3, 3),
    (2, 4, 1),
    (2, 5, 2);
*/
