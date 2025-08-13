-- Agregar campo ejercicio_id a la tabla de reactivos (relación 1:N)
ALTER TABLE reactivo_lectura_pseudopalabras 
ADD COLUMN IF NOT EXISTS ejercicio_id INTEGER,
ADD COLUMN IF NOT EXISTS orden_reactivo INTEGER DEFAULT 1;

-- Agregar foreign key constraint
ALTER TABLE reactivo_lectura_pseudopalabras
ADD CONSTRAINT fk_reactivo_ejercicio 
FOREIGN KEY (ejercicio_id) REFERENCES Ejercicios(ejercicio_id) ON DELETE SET NULL;

-- Agregar campo tipo_reactivo a ejercicios para identificación rápida del tipo
ALTER TABLE Ejercicios 
ADD COLUMN IF NOT EXISTS tipo_reactivo INTEGER;

-- Agregar foreign key constraint para tipo_reactivo
ALTER TABLE Ejercicios
ADD CONSTRAINT fk_ejercicio_tipo_reactivo 
FOREIGN KEY (tipo_reactivo) REFERENCES Tipos(id_tipo) ON DELETE RESTRICT;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_reactivos_ejercicio ON reactivo_lectura_pseudopalabras(ejercicio_id);
CREATE INDEX IF NOT EXISTS idx_reactivos_orden ON reactivo_lectura_pseudopalabras(ejercicio_id, orden_reactivo);
CREATE INDEX IF NOT EXISTS idx_ejercicios_tipo_reactivo ON Ejercicios(tipo_reactivo);

-- Función para validar que todos los reactivos del ejercicio sean del mismo tipo
CREATE OR REPLACE FUNCTION validar_tipo_reactivos_en_ejercicio()
RETURNS TRIGGER AS $$
DECLARE
    ejercicio_tipo INTEGER;
    reactivo_tipo INTEGER;
BEGIN
    -- Si no se asigna ejercicio, no validar
    IF NEW.ejercicio_id IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener el tipo del ejercicio
    SELECT tipo_reactivo INTO ejercicio_tipo 
    FROM Ejercicios 
    WHERE ejercicio_id = NEW.ejercicio_id;
    
    -- Si el ejercicio no tiene tipo definido, salir
    IF ejercicio_tipo IS NULL THEN
        RETURN NEW;
    END IF;
    
    -- Obtener el tipo del reactivo a través de sub_tipo -> tipo
    SELECT t.id_tipo INTO reactivo_tipo
    FROM Sub_tipo st 
    JOIN Tipos t ON st.tipo = t.id_tipo
    WHERE st.id_sub_tipo = NEW.id_sub_tipo;
    
    -- Validar que coincidan los tipos
    IF ejercicio_tipo != reactivo_tipo THEN
        RAISE EXCEPTION 'El reactivo de tipo "%" no puede agregarse al ejercicio que requiere tipo "%"', 
                        reactivo_tipo, ejercicio_tipo;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validación automática
DROP TRIGGER IF EXISTS trigger_validar_tipo_reactivos_ejercicio ON reactivo_lectura_pseudopalabras;
CREATE TRIGGER trigger_validar_tipo_reactivos_ejercicio
    BEFORE INSERT OR UPDATE ON reactivo_lectura_pseudopalabras
    FOR EACH ROW
    EXECUTE FUNCTION validar_tipo_reactivos_en_ejercicio();

-- Función para actualizar automáticamente el tipo_reactivo del ejercicio
-- basado en el primer reactivo que se le asigne
CREATE OR REPLACE FUNCTION auto_asignar_tipo_ejercicio()
RETURNS TRIGGER AS $$
DECLARE
    reactivo_tipo INTEGER;
BEGIN
    -- Solo si se está asignando un ejercicio y el ejercicio no tiene tipo
    IF NEW.ejercicio_id IS NOT NULL THEN
        -- Verificar si el ejercicio ya tiene tipo definido
        SELECT tipo_reactivo INTO reactivo_tipo 
        FROM Ejercicios 
        WHERE ejercicio_id = NEW.ejercicio_id AND tipo_reactivo IS NULL;
        
        -- Si el ejercicio no tiene tipo, asignar el tipo del reactivo
        IF FOUND THEN
            SELECT t.id_tipo INTO reactivo_tipo
            FROM Sub_tipo st 
            JOIN Tipos t ON st.tipo = t.id_tipo
            WHERE st.id_sub_tipo = NEW.id_sub_tipo;
            
            UPDATE Ejercicios 
            SET tipo_reactivo = reactivo_tipo 
            WHERE ejercicio_id = NEW.ejercicio_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para auto-asignación de tipo
CREATE TRIGGER trigger_auto_asignar_tipo_ejercicio
    AFTER INSERT ON reactivo_lectura_pseudopalabras
    FOR EACH ROW
    EXECUTE FUNCTION auto_asignar_tipo_ejercicio();
