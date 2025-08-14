-- =====================================================
-- QUERIES PARA CREAR TABLAS DEL SISTEMA DE KITS Y EJERCICIOS
-- Basado en el diagrama de relaciones y estructura existente
-- =====================================================

-- =====================================================
-- 1. TABLA KITS
-- =====================================================
CREATE TABLE IF NOT EXISTS kits (
    kit_id SERIAL PRIMARY KEY,
    name CHARACTER VARYING(255) NOT NULL,
    descripcion TEXT,
    creado_por INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    
    -- Foreign Key al usuario que creó el kit
    CONSTRAINT fk_kits_creado_por 
        FOREIGN KEY (creado_por) 
        REFERENCES Usuario(usuario_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- =====================================================
-- 2. TABLA EJERCICIOS (si no existe o necesita actualización)
-- =====================================================
CREATE TABLE IF NOT EXISTS ejercicios (
    ejercicio_id SERIAL PRIMARY KEY,
    titulo CHARACTER VARYING(255) NOT NULL,
    descripcion TEXT,
    creado_por INTEGER NOT NULL,
    id_reactivo INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    
    -- Foreign Keys
    CONSTRAINT fk_ejercicios_creado_por 
        FOREIGN KEY (creado_por) 
        REFERENCES Usuario(usuario_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_ejercicios_reactivo 
        FOREIGN KEY (id_reactivo) 
        REFERENCES reactivo_lectura_pseudopalabras(id_reactivo) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- =====================================================
-- 3. TABLA EJERCICIOS_KITS (Tabla de relación muchos a muchos)
-- =====================================================
CREATE TABLE IF NOT EXISTS ejercicios_kits (
    id SERIAL PRIMARY KEY,
    kit_id INTEGER NOT NULL,
    ejercicio_id INTEGER NOT NULL,
    orden_en_kit INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_ejercicios_kits_kit 
        FOREIGN KEY (kit_id) 
        REFERENCES kits(kit_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
        
    CONSTRAINT fk_ejercicios_kits_ejercicio 
        FOREIGN KEY (ejercicio_id) 
        REFERENCES ejercicios(ejercicio_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Constraints para evitar duplicados y mantener orden único
    CONSTRAINT uk_kit_ejercicio UNIQUE (kit_id, ejercicio_id),
    CONSTRAINT uk_kit_orden UNIQUE (kit_id, orden_en_kit)
);

-- =====================================================
-- 4. ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

-- Índices para la tabla kits
CREATE INDEX IF NOT EXISTS idx_kits_creado_por ON kits(creado_por);
CREATE INDEX IF NOT EXISTS idx_kits_fecha_creacion ON kits(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_kits_activo ON kits(activo);

-- Índices para la tabla ejercicios
CREATE INDEX IF NOT EXISTS idx_ejercicios_creado_por ON ejercicios(creado_por);
CREATE INDEX IF NOT EXISTS idx_ejercicios_reactivo ON ejercicios(id_reactivo);
CREATE INDEX IF NOT EXISTS idx_ejercicios_activo ON ejercicios(activo);

-- Índices para la tabla ejercicios_kits
CREATE INDEX IF NOT EXISTS idx_ejercicios_kits_kit_id ON ejercicios_kits(kit_id);
CREATE INDEX IF NOT EXISTS idx_ejercicios_kits_ejercicio_id ON ejercicios_kits(ejercicio_id);
CREATE INDEX IF NOT EXISTS idx_ejercicios_kits_orden ON ejercicios_kits(kit_id, orden_en_kit);

-- =====================================================
-- 5. TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =====================================================

-- Trigger para actualizar updated_at en kits
CREATE OR REPLACE FUNCTION update_kits_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_kits_timestamp 
    BEFORE UPDATE ON kits 
    FOR EACH ROW 
    EXECUTE FUNCTION update_kits_timestamp();

-- Trigger para actualizar updated_at en ejercicios
CREATE OR REPLACE FUNCTION update_ejercicios_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_ejercicios_timestamp 
    BEFORE UPDATE ON ejercicios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_ejercicios_timestamp();

-- =====================================================
-- 6. DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Insertar algunos kits de ejemplo (descomenta si necesitas datos de prueba)
/*
INSERT INTO kits (name, descripcion, creado_por) VALUES
('Kit Básico de Lectura', 'Kit introductorio para ejercicios de lectura básica', 1),
('Kit Avanzado de Comprensión', 'Kit para ejercicios avanzados de comprensión lectora', 1),
('Kit de Pseudopalabras', 'Kit especializado en ejercicios con pseudopalabras', 1);

-- Insertar algunos ejercicios de ejemplo
INSERT INTO ejercicios (titulo, descripcion, creado_por) VALUES
('Ejercicio de Reconocimiento', 'Ejercicio básico de reconocimiento de palabras', 1),
('Ejercicio de Comprensión', 'Ejercicio de comprensión de textos cortos', 1),
('Ejercicio de Pseudopalabras', 'Ejercicio con palabras inventadas', 1);

-- Relacionar ejercicios con kits
INSERT INTO ejercicios_kits (kit_id, ejercicio_id, orden_en_kit) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 2, 1),
(2, 3, 2),
(3, 3, 1);
*/

-- =====================================================
-- 7. COMENTARIOS SOBRE LA ESTRUCTURA
-- =====================================================

/*
RELACIONES CREADAS (siguiendo la estructura existente):

1. kits (1) -> (N) ejercicios_kits
   - Un kit puede contener múltiples ejercicios

2. ejercicios (1) -> (N) ejercicios_kits  
   - Un ejercicio puede estar en múltiples kits

3. ejercicios_kits
   - Tabla de relación muchos a muchos entre kits y ejercicios
   - Incluye campo 'orden_en_kit' para mantener el orden de ejercicios en cada kit

4. ejercicios -> reactivo_lectura_pseudopalabras
   - Relación con la tabla de reactivos existente

5. kits y ejercicios -> Usuario
   - Relación con el usuario que creó el kit/ejercicio (usando tabla Usuario existente)

CARACTERÍSTICAS:
- Uso de SERIAL para IDs auto-incrementales
- Naming convention: snake_case (consistente con tu base de datos)
- Tipos CHARACTER VARYING (consistente con estructura existente)
- Timestamps automáticos con triggers
- Índices para optimizar consultas frecuentes
- Constraints para mantener integridad referencial
- Campo 'activo' para soft delete
- Campos de auditoría (created_at, updated_at, creado_por)
- Referencias a tabla 'Usuario' existente con usuario_id

ESTRUCTURA DE COLUMNAS COHERENTE CON TU SISTEMA:
- Usa 'usuario_id' como FK (igual que paciente_id en tu tabla Paciente)
- Usa 'character varying' en lugar de VARCHAR
- Nombres de tablas en minúsculas
- Nombres de columnas en snake_case
*/
