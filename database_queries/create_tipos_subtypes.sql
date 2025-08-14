-- =====================================================
-- QUERIES PARA CREAR TABLAS TIPOS Y SUB-TIPOS
-- Estructura flexible para ejercicios
-- =====================================================

-- 1. Crear tabla TIPOS
CREATE TABLE IF NOT EXISTS tipos (
    id_tipo SERIAL PRIMARY KEY,
    tipo_nombre CHARACTER VARYING(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla SUB_TIPO
CREATE TABLE IF NOT EXISTS sub_tipo (
    id_sub_tipo SERIAL PRIMARY KEY,
    tipo INTEGER NOT NULL,
    sub_tipo_nombre CHARACTER VARYING(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key constraint
    CONSTRAINT fk_sub_tipo_tipos 
        FOREIGN KEY (tipo) 
        REFERENCES tipos(id_tipo) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Unique constraint para evitar duplicados
    CONSTRAINT uk_sub_tipo_nombre_por_tipo 
        UNIQUE (tipo, sub_tipo_nombre)
);

-- 3. Modificar el tipo de dato de tipo_ejercicio y agregar constraint
-- (La columna tipo_ejercicio existe pero es VARCHAR, necesita ser INTEGER)

-- Primero, eliminar constraint existente si existe
ALTER TABLE ejercicios DROP CONSTRAINT IF EXISTS fk_ejercicios_tipos;

-- OPCIÓN 1: Cambio directo (perderás datos existentes)
-- ALTER TABLE ejercicios 
-- ALTER COLUMN tipo_ejercicio TYPE INTEGER USING NULL;

-- OPCIÓN 2: Cambio más seguro - primero hacer backup de datos si existen
-- Verificar datos existentes:
-- SELECT DISTINCT tipo_ejercicio FROM ejercicios WHERE tipo_ejercicio IS NOT NULL;

-- Limpiar la columna si tiene datos que no se pueden convertir
UPDATE ejercicios SET tipo_ejercicio = NULL WHERE tipo_ejercicio IS NOT NULL;

-- Cambiar el tipo de dato
ALTER TABLE ejercicios 
ALTER COLUMN tipo_ejercicio TYPE INTEGER USING tipo_ejercicio::INTEGER;

-- Ahora agregar el constraint de foreign key
ALTER TABLE ejercicios 
ADD CONSTRAINT fk_ejercicios_tipos 
    FOREIGN KEY (tipo_ejercicio) 
    REFERENCES tipos(id_tipo) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- =====================================================
-- DATOS INICIALES DE EJEMPLO
-- =====================================================

-- Insertar algunos tipos de ejemplo
INSERT INTO tipos (tipo_nombre) VALUES 
    ('Lectura'),
    ('Escritura'),
    ('Visual');


-- Insertar algunos sub-tipos de ejemplo
INSERT INTO sub_tipo (tipo, sub_tipo_nombre) VALUES 
    (1, 'Densas'),        
    (1, 'Pseudopalabras'),     
    (1, 'Comprension'),        
    (2, 'Reordenamiento'),         
    (2, 'Imagen con Palabra'),           
    (3, 'Igual Diferente'),        
    (3, 'Imagen Correcta'),                
    (3, 'Palabra Mal Escrita');  
-- =====================================================
-- QUERIES PARA CONSULTAR LAS RELACIONES
-- =====================================================

-- Ver todos los tipos con sus sub-tipos
SELECT 
    t.id_tipo,
    t.tipo_nombre,
    st.id_sub_tipo,
    st.sub_tipo_nombre
FROM tipos t
LEFT JOIN sub_tipo st ON t.id_tipo = st.tipo
ORDER BY t.id_tipo, st.id_sub_tipo;

-- Ver ejercicios con su tipo
SELECT 
    e.ejercicio_id,
    e.titulo,
    e.descripcion,
    t.tipo_nombre
FROM ejercicios e
LEFT JOIN tipos t ON e.tipo_ejercicio = t.id_tipo
ORDER BY e.ejercicio_id;

-- =====================================================
-- QUERIES DE UTILIDAD
-- =====================================================

-- Contar sub-tipos por tipo
SELECT 
    t.tipo_nombre,
    COUNT(st.id_sub_tipo) as cantidad_subtipos
FROM tipos t
LEFT JOIN sub_tipo st ON t.id_tipo = st.tipo
GROUP BY t.id_tipo, t.tipo_nombre
ORDER BY t.tipo_nombre;

-- Buscar sub-tipos de un tipo específico
SELECT 
    st.id_sub_tipo,
    st.sub_tipo_nombre
FROM sub_tipo st
JOIN tipos t ON st.tipo = t.id_tipo
WHERE t.tipo_nombre = 'Lectura';
