-- =====================================================
-- TABLA PARA ASIGNACIÓN DE KITS A PACIENTES
-- =====================================================

-- Tabla para manejar las asignaciones de kits a pacientes
CREATE TABLE IF NOT EXISTS kits_asignados (
    id SERIAL PRIMARY KEY,
    kit_id INTEGER NOT NULL,
    paciente_id INTEGER NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'pendiente',
    
    -- Foreign Keys
    CONSTRAINT fk_kits_asignados_kit 
        FOREIGN KEY (kit_id) 
        REFERENCES kits(kit_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_kits_asignados_paciente 
        FOREIGN KEY (paciente_id) 
        REFERENCES Usuario(usuario_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraint para evitar asignaciones duplicadas del mismo kit al mismo paciente
    CONSTRAINT unique_kit_paciente 
        UNIQUE(kit_id, paciente_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_kits_asignados_kit_id 
    ON kits_asignados(kit_id);
    
CREATE INDEX IF NOT EXISTS idx_kits_asignados_paciente_id 
    ON kits_asignados(paciente_id);
    
CREATE INDEX IF NOT EXISTS idx_kits_asignados_estado 
    ON kits_asignados(estado);

-- Comentarios para documentar la tabla
COMMENT ON TABLE kits_asignados IS 'Tabla que registra la asignación de kits a pacientes';
COMMENT ON COLUMN kits_asignados.id IS 'ID único de la asignación';
COMMENT ON COLUMN kits_asignados.kit_id IS 'ID del kit asignado (FK a tabla kits)';
COMMENT ON COLUMN kits_asignados.paciente_id IS 'ID del paciente (FK a tabla users)';
COMMENT ON COLUMN kits_asignados.fecha_asignacion IS 'Fecha y hora cuando se asignó el kit';
COMMENT ON COLUMN kits_asignados.estado IS 'Estado de la asignación: pendiente, en_progreso, completado, cancelado';
    
CREATE INDEX IF NOT EXISTS idx_kits_asignados_kit 
    ON kits_asignados(kit_id);
    
CREATE INDEX IF NOT EXISTS idx_kits_asignados_estado 
    ON kits_asignados(estado);
    
CREATE INDEX IF NOT EXISTS idx_kits_asignados_fecha 
    ON kits_asignados(fecha_asignacion);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_kits_asignados_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kits_asignados_timestamp_trigger
    BEFORE UPDATE ON kits_asignados
    FOR EACH ROW
    EXECUTE FUNCTION update_kits_asignados_timestamp();

-- =====================================================
-- COMENTARIOS SOBRE LA ESTRUCTURA
-- =====================================================

/*
TABLA: kits_asignados

PROPÓSITO:
- Permite que los doctores asignen kits específicos a sus pacientes
- Rastrea el estado de cada asignación (asignado, en_progreso, completado, cancelado)
- Mantiene historial de asignaciones por paciente y doctor

CAMPOS:
- asignacion_id: Identificador único de la asignación
- kit_id: Kit que se asigna
- paciente_id: Paciente al que se asigna el kit
- doctor_id: Doctor que realiza la asignación
- estado: Estado actual (asignado, en_progreso, completado, cancelado)
- fecha_asignacion: Cuándo se asignó el kit
- fecha_completado: Cuándo el paciente completó el kit (opcional)
- notas: Notas adicionales del doctor sobre la asignación
- activo: Para soft delete

RELACIONES:
- kits_asignados -> kits (muchos a uno)
- kits_asignados -> Paciente (muchos a uno)  
- kits_asignados -> Usuario (doctor) (muchos a uno)

REGLAS DE NEGOCIO:
- Un paciente no puede tener asignado el mismo kit activo múltiples veces
- Los doctores solo pueden asignar kits a sus pacientes (verificación en aplicación)
- Se mantiene historial completo de asignaciones

ESTADOS POSIBLES:
- 'asignado': Kit asignado pero no iniciado
- 'en_progreso': Paciente ha comenzado el kit
- 'completado': Paciente terminó todos los ejercicios
- 'cancelado': Asignación cancelada por el doctor
*/
