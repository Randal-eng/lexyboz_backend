-- =====================================================
-- QUERIES PARA CREAR TABLAS DE REACTIVOS Y RESULTADOS
-- Basado en el diagrama de relaciones proporcionado
-- =====================================================

-- =====================================================
-- 1. TABLA REACTIVO_LECTURA_PSEUDOPALABRAS
-- =====================================================
CREATE TABLE IF NOT EXISTS reactivo_lectura_pseudopalabras (
    id_reactivo SERIAL PRIMARY KEY,
    id_sub_tipo INTEGER NOT NULL,
    tiempo_duracion INTEGER, -- en milisegundos
    pseudopalabra CHARACTER VARYING(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key constraint con sub_tipo
    CONSTRAINT fk_reactivo_lectura_pseudopalabras_subtipo 
        FOREIGN KEY (id_sub_tipo) 
        REFERENCES sub_tipo(id_sub_tipo) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- =====================================================
-- 2. TABLA RESULTADOS_LECTURA_PSEUDOPALABRAS
-- =====================================================
CREATE TABLE IF NOT EXISTS resultados_lectura_pseudopalabras (
    resultado_reactivo_usuario_id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    id_reactivo INTEGER NOT NULL,
    voz_usuario_url CHARACTER VARYING(500), -- URL donde se almacena el audio de la respuesta
    tiempo_respuesta INTEGER, -- tiempo que tardó en responder (milisegundos)
    es_correcto BOOLEAN, -- si la respuesta fue correcta o no
    fecha_realizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key constraints
    CONSTRAINT fk_resultados_lectura_pseudopalabras_usuario 
        FOREIGN KEY (usuario_id) 
        REFERENCES Usuario(usuario_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_resultados_lectura_pseudopalabras_reactivo 
        FOREIGN KEY (id_reactivo) 
        REFERENCES reactivo_lectura_pseudopalabras(id_reactivo) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Índice único para evitar duplicados de usuario-reactivo
    CONSTRAINT uk_resultado_usuario_reactivo 
        UNIQUE (usuario_id, id_reactivo)
);

-- =====================================================
-- 3. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para la tabla de reactivos
CREATE INDEX IF NOT EXISTS idx_reactivo_lectura_pseudopalabras_subtipo 
    ON reactivo_lectura_pseudopalabras(id_sub_tipo);
CREATE INDEX IF NOT EXISTS idx_reactivo_lectura_pseudopalabras_pseudopalabra 
    ON reactivo_lectura_pseudopalabras(pseudopalabra);

-- Índices para la tabla de resultados
CREATE INDEX IF NOT EXISTS idx_resultados_lectura_pseudopalabras_usuario 
    ON resultados_lectura_pseudopalabras(usuario_id);
CREATE INDEX IF NOT EXISTS idx_resultados_lectura_pseudopalabras_reactivo 
    ON resultados_lectura_pseudopalabras(id_reactivo);
CREATE INDEX IF NOT EXISTS idx_resultados_lectura_pseudopalabras_fecha 
    ON resultados_lectura_pseudopalabras(fecha_realizacion);

-- =====================================================
-- 4. TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

-- Trigger para actualizar updated_at en reactivos
CREATE OR REPLACE FUNCTION update_reactivo_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_reactivo_timestamp 
    BEFORE UPDATE ON reactivo_lectura_pseudopalabras 
    FOR EACH ROW 
    EXECUTE FUNCTION update_reactivo_timestamp();

-- Trigger para actualizar updated_at en resultados
CREATE OR REPLACE FUNCTION update_resultados_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_resultados_timestamp 
    BEFORE UPDATE ON resultados_lectura_pseudopalabras 
    FOR EACH ROW 
    EXECUTE FUNCTION update_resultados_timestamp();

-- =====================================================
-- 5. COMENTARIOS SOBRE LA ESTRUCTURA
-- =====================================================

/*
RELACIONES CREADAS:

1. reactivo_lectura_pseudopalabras -> sub_tipo
   - Cada reactivo pertenece a un sub-tipo específico

2. resultados_lectura_pseudopalabras -> Usuario
   - Cada resultado pertenece a un usuario específico

3. resultados_lectura_pseudopalabras -> reactivo_lectura_pseudopalabras
   - Cada resultado está asociado a un reactivo específico

CARACTERÍSTICAS:
- Naming convention: snake_case (consistente con tu base de datos)
- Tipos CHARACTER VARYING (consistente con estructura existente)
- Timestamps automáticos con triggers
- Índices para optimizar consultas frecuentes
- Constraints para mantener integridad referencial
- Constraint único para evitar que un usuario haga el mismo reactivo múltiples veces
- Campos de auditoría (created_at, updated_at)
- Referencias a tablas existentes: Usuario, sub_tipo
*/

-- =====================================================
-- 6. QUERIES DE CONSULTA ÚTILES
-- =====================================================

-- Ver todos los reactivos con información del sub-tipo y tipo
/*
SELECT 
    r.id_reactivo,
    r.pseudopalabra,
    r.tiempo_duracion,
    r.created_at as reactivo_created_at,
    st.sub_tipo_nombre,
    t.tipo_nombre
FROM reactivo_lectura_pseudopalabras r
JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
JOIN tipos t ON st.tipo = t.id_tipo
ORDER BY r.id_reactivo;
*/

-- Ver resultados de un usuario específico
/*
SELECT 
    res.resultado_reactivo_usuario_id,
    res.usuario_id,
    r.pseudopalabra,
    res.voz_usuario_url,
    res.tiempo_respuesta,
    res.es_correcto,
    res.fecha_realizacion,
    st.sub_tipo_nombre,
    t.tipo_nombre
FROM resultados_lectura_pseudopalabras res
JOIN reactivo_lectura_pseudopalabras r ON res.id_reactivo = r.id_reactivo
JOIN sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
JOIN tipos t ON st.tipo = t.id_tipo
WHERE res.usuario_id = 1  -- Cambiar por ID del usuario
ORDER BY res.fecha_realizacion DESC;
*/
