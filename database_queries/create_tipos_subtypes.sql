-- =====================================================
-- QUERIES PARA CREAR TABLAS TIPOS Y SUB-TIPOS
-- Estructura flexible para ejercicios
-- =====================================================

-- 1. Crear tabla TIPOS
CREATE TABLE Tipos (
    id_tipo SERIAL PRIMARY KEY,
    tipo_nombre VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla SUB_TIPO
CREATE TABLE Sub_tipo (
    id_sub_tipo SERIAL PRIMARY KEY,
    tipo INTEGER NOT NULL,
    sub_tipo_nombre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key constraint
    CONSTRAINT fk_sub_tipo_tipos 
        FOREIGN KEY (tipo) 
        REFERENCES Tipos(id_tipo) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    
    -- Unique constraint para evitar duplicados
    CONSTRAINT uk_sub_tipo_nombre_por_tipo 
        UNIQUE (tipo, sub_tipo_nombre)
);

-- 3. Modificar el tipo de dato de Tipo_Ejercicio y agregar constraint
-- (La columna Tipo_Ejercicio existe pero es VARCHAR, necesita ser INTEGER)

-- Primero, eliminar constraint existente si existe
ALTER TABLE Ejercicios DROP CONSTRAINT IF EXISTS fk_ejercicios_tipos;

-- OPCIÓN 1: Cambio directo (perderás datos existentes)
-- ALTER TABLE Ejercicios 
-- ALTER COLUMN Tipo_Ejercicio TYPE INTEGER USING NULL;

-- OPCIÓN 2: Cambio más seguro - primero hacer backup de datos si existen
-- Verificar datos existentes:
-- SELECT DISTINCT Tipo_Ejercicio FROM Ejercicios WHERE Tipo_Ejercicio IS NOT NULL;

-- Limpiar la columna si tiene datos que no se pueden convertir
UPDATE Ejercicios SET Tipo_Ejercicio = NULL WHERE Tipo_Ejercicio IS NOT NULL;

-- Cambiar el tipo de dato
ALTER TABLE Ejercicios 
ALTER COLUMN Tipo_Ejercicio TYPE INTEGER USING Tipo_Ejercicio::INTEGER;

-- Ahora agregar el constraint de foreign key
ALTER TABLE Ejercicios 
ADD CONSTRAINT fk_ejercicios_tipos 
    FOREIGN KEY (Tipo_Ejercicio) 
    REFERENCES Tipos(id_tipo) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE;

-- =====================================================
-- DATOS INICIALES DE EJEMPLO
-- =====================================================

-- Insertar algunos tipos de ejemplo
INSERT INTO Tipos (tipo_nombre) VALUES 
    ('Lectura'),
    ('Escritura'),
    ('Visual');


-- Insertar algunos sub-tipos de ejemplo
INSERT INTO Sub_tipo (tipo, sub_tipo_nombre) VALUES 
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
FROM Tipos t
LEFT JOIN Sub_tipo st ON t.id_tipo = st.tipo
ORDER BY t.id_tipo, st.id_sub_tipo;

-- Ver ejercicios con su tipo
SELECT 
    e.ejercicio_id,
    e.titulo,
    e.descripcion,
    t.tipo_nombre
FROM Ejercicios e
LEFT JOIN Tipos t ON e.Tipo_Ejercicio = t.id_tipo
ORDER BY e.ejercicio_id;

-- =====================================================
-- QUERIES DE UTILIDAD
-- =====================================================

-- Contar sub-tipos por tipo
SELECT 
    t.tipo_nombre,
    COUNT(st.id_sub_tipo) as cantidad_subtipos
FROM Tipos t
LEFT JOIN Sub_tipo st ON t.id_tipo = st.tipo
GROUP BY t.id_tipo, t.tipo_nombre
ORDER BY t.tipo_nombre;

-- Buscar sub-tipos de un tipo específico
SELECT 
    st.id_sub_tipo,
    st.sub_tipo_nombre
FROM Sub_tipo st
JOIN Tipos t ON st.tipo = t.id_tipo
WHERE t.tipo_nombre = 'Lectura';
