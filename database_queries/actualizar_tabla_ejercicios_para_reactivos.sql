-- Actualizar estructura de la tabla ejercicios para usar relación muchos a muchos con reactivos
-- Eliminar la relación 1:1 antigua y usar la tabla intermedia ejercicio_reactivos

-- Eliminar el campo id_reactivo de la tabla ejercicios (ya no lo necesitamos)
ALTER TABLE ejercicios DROP COLUMN IF EXISTS id_reactivo;

-- Agregar campo tipo_ejercicio para identificar rápidamente el tipo de reactivos permitidos
ALTER TABLE ejercicios ADD COLUMN IF NOT EXISTS tipo_ejercicio INTEGER;

-- Agregar foreign key constraint para tipo_ejercicio
ALTER TABLE ejercicios
ADD CONSTRAINT fk_ejercicios_tipo_ejercicio 
FOREIGN KEY (tipo_ejercicio) REFERENCES tipos(tipo_id) ON DELETE RESTRICT;

-- Índice para optimizar consultas por tipo
CREATE INDEX IF NOT EXISTS idx_ejercicios_tipo ON ejercicios(tipo_ejercicio);

-- Función para auto-asignar el tipo del ejercicio basado en el primer reactivo
CREATE OR REPLACE FUNCTION auto_asignar_tipo_ejercicio()
RETURNS TRIGGER AS $$
DECLARE
    reactivo_tipo INTEGER;
    ejercicio_tipo_actual INTEGER;
BEGIN
    -- Solo si se está insertando una relación activa
    IF TG_OP = 'INSERT' AND NEW.activo = true THEN
        -- Obtener el tipo actual del ejercicio
        SELECT tipo_ejercicio INTO ejercicio_tipo_actual 
        FROM ejercicios 
        WHERE ejercicio_id = NEW.ejercicio_id;
        
        -- Si el ejercicio no tiene tipo asignado, asignar el tipo del reactivo
        IF ejercicio_tipo_actual IS NULL THEN
            -- Obtener el tipo del reactivo
            SELECT t.tipo_id INTO reactivo_tipo
            FROM reactivo_lectura_pseudopalabras r
            JOIN sub_tipo st ON r.sub_tipo_id = st.sub_tipo_id
            JOIN tipos t ON st.tipo_id = t.tipo_id
            WHERE r.reactivo_id = NEW.reactivo_id;
            
            -- Actualizar el ejercicio con el tipo del reactivo
            UPDATE ejercicios 
            SET tipo_ejercicio = reactivo_tipo 
            WHERE ejercicio_id = NEW.ejercicio_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para auto-asignación de tipo en ejercicios
DROP TRIGGER IF EXISTS trigger_auto_asignar_tipo_ejercicio ON ejercicio_reactivos;
CREATE TRIGGER trigger_auto_asignar_tipo_ejercicio
    AFTER INSERT ON ejercicio_reactivos
    FOR EACH ROW
    EXECUTE FUNCTION auto_asignar_tipo_ejercicio();

-- Función para limpiar el tipo del ejercicio cuando no quedan reactivos
CREATE OR REPLACE FUNCTION limpiar_tipo_ejercicio_sin_reactivos()
RETURNS TRIGGER AS $$
DECLARE
    reactivos_count INTEGER;
BEGIN
    -- Solo si se está eliminando/desactivando una relación
    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.activo = true AND NEW.activo = false) THEN
        -- Contar reactivos activos restantes en el ejercicio
        SELECT COUNT(*) INTO reactivos_count
        FROM ejercicio_reactivos 
        WHERE ejercicio_id = COALESCE(OLD.ejercicio_id, NEW.ejercicio_id) 
        AND activo = true;
        
        -- Si no quedan reactivos activos, limpiar el tipo del ejercicio
        IF reactivos_count = 0 THEN
            UPDATE ejercicios 
            SET tipo_ejercicio = NULL 
            WHERE ejercicio_id = COALESCE(OLD.ejercicio_id, NEW.ejercicio_id);
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para limpiar tipo cuando no hay reactivos
DROP TRIGGER IF EXISTS trigger_limpiar_tipo_ejercicio ON ejercicio_reactivos;
CREATE TRIGGER trigger_limpiar_tipo_ejercicio
    AFTER UPDATE OR DELETE ON ejercicio_reactivos
    FOR EACH ROW
    EXECUTE FUNCTION limpiar_tipo_ejercicio_sin_reactivos();

-- Comentarios
COMMENT ON COLUMN ejercicios.tipo_ejercicio IS 'Tipo de reactivos permitidos en este ejercicio (se asigna automáticamente)';

-- Vista para obtener ejercicios con información de sus reactivos
CREATE OR REPLACE VIEW vista_ejercicios_con_reactivos AS
SELECT 
    e.ejercicio_id,
    e.titulo,
    e.descripcion,
    e.creado_por,
    e.activo,
    e.created_at as fecha_creacion,
    e.updated_at as fecha_actualizacion,
    e.tipo_ejercicio,
    t.nombre as tipo_nombre,
    t.descripcion as tipo_descripcion,
    COUNT(er.reactivo_id) as total_reactivos,
    ARRAY_AGG(
        CASE WHEN er.activo = true THEN 
            JSON_BUILD_OBJECT(
                'reactivo_id', r.reactivo_id,
                'contenido', r.pseudopalabra,
                'orden', er.orden,
                'tiempo_limite', r.tiempo_duracion,
                'sub_tipo_id', r.id_sub_tipo,
                'sub_tipo_nombre', st.nombre
            )
        ELSE NULL END
        ORDER BY er.orden
    ) FILTER (WHERE er.activo = true) as reactivos
FROM ejercicios e
LEFT JOIN tipos t ON e.tipo_ejercicio = t.tipo_id
LEFT JOIN ejercicio_reactivos er ON e.ejercicio_id = er.ejercicio_id
LEFT JOIN reactivo_lectura_pseudopalabras r ON er.reactivo_id = r.reactivo_id
LEFT JOIN sub_tipo st ON r.id_sub_tipo = st.sub_tipo_id
WHERE e.activo = true
GROUP BY e.ejercicio_id, e.titulo, e.descripcion, e.creado_por, e.activo, 
         e.created_at, e.updated_at, e.tipo_ejercicio, t.nombre, t.descripcion;
