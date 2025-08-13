-- =====================================================
-- QUERIES PARA CREAR TABLAS DE REACTIVOS Y RESULTADOS
-- Estructura para reactivos de lectura de pseudopalabras
-- =====================================================

-- 1. Crear tabla REACTIVO_LECTURA_PSEUDOPALABRAS
CREATE TABLE reactivo_lectura_pseudopalabras (
    id_reactivo SERIAL PRIMARY KEY,
    id_sub_tipo INTEGER NOT NULL,
    tiempo_duracion INTEGER, -- en segundos o milisegundos
    pseudopalabra VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key constraint con Sub_tipo
    CONSTRAINT fk_reactivo_lectura_pseudopalabras_subtipo 
        FOREIGN KEY (id_sub_tipo) 
        REFERENCES Sub_tipo(id_sub_tipo) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- 2. Crear tabla RESULTADOS_LECTURA_PSEUDOPALABRAS
CREATE TABLE Resultados_Lectura_Pseudopalabras (
    resultado_reactivo_usuario_ID SERIAL PRIMARY KEY,
    usuario_ID INTEGER NOT NULL,
    id_reactivo INTEGER NOT NULL,
    voz_usuario_URL VARCHAR(500), -- URL donde se almacena el audio de la respuesta
    tiempo_respuesta INTEGER, -- tiempo que tardó en responder (milisegundos)
    es_correcto BOOLEAN, -- si la respuesta fue correcta o no
    fecha_realizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key constraints
    CONSTRAINT fk_resultados_lectura_pseudopalabras_usuario 
        FOREIGN KEY (usuario_ID) 
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
        UNIQUE (usuario_ID, id_reactivo)
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para la tabla de reactivos
CREATE INDEX idx_reactivo_lectura_pseudopalabras_subtipo ON reactivo_lectura_pseudopalabras(id_sub_tipo);
CREATE INDEX idx_reactivo_lectura_pseudopalabras_pseudopalabra ON reactivo_lectura_pseudopalabras(pseudopalabra);

-- Índices para la tabla de resultados
CREATE INDEX idx_resultados_lectura_pseudopalabras_usuario ON Resultados_Lectura_Pseudopalabras(usuario_ID);
CREATE INDEX idx_resultados_lectura_pseudopalabras_reactivo ON Resultados_Lectura_Pseudopalabras(id_reactivo);
CREATE INDEX idx_resultados_lectura_pseudopalabras_fecha ON Resultados_Lectura_Pseudopalabras(fecha_realizacion);
CREATE INDEX idx_resultados_lectura_pseudopalabras_correcto ON Resultados_Lectura_Pseudopalabras(es_correcto);

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Insertar reactivos de pseudopalabras (asumiendo que existe sub-tipo de Pseudopalabras con id=2)
INSERT INTO reactivo_lectura_pseudopalabras (id_sub_tipo, tiempo_duracion, pseudopalabra) VALUES 
    (2, 5000, 'gloro'),       -- 5 segundos para leer "gloro"
    (2, 5200, 'peima'),       -- 5.2 segundos para leer "peima"
    (2, 5300, 'pueña'),       -- 5.3 segundos para leer "pueña"
    (2, 5800, 'ciergo'),      -- 5.8 segundos para leer "ciergo"
    (2, 5900, 'erpisa'),      -- 5.9 segundos para leer "erpisa"
    (2, 5100, 'fueme'),       -- 5.1 segundos para leer "fueme"
    (2, 6500, 'giranco'),     -- 6.5 segundos para leer "giranco"
    (2, 5700, 'cuerla'),      -- 5.7 segundos para leer "cuerla"
    (2, 5800, 'trollo'),      -- 5.8 segundos para leer "trollo"
    (2, 5900, 'blansa'),      -- 5.9 segundos para leer "blansa"
    (2, 5800, 'vienca'),      -- 5.8 segundos para leer "vienca"
    (2, 5700, 'muepla'),      -- 5.7 segundos para leer "muepla"
    (2, 5800, 'lienca'),      -- 5.8 segundos para leer "lienca"
    (2, 6200, 'crispol'),     -- 6.2 segundos para leer "crispol"
    (2, 5900, 'ascuso'),      -- 5.9 segundos para leer "ascuso"
    (2, 5800, 'huelte'),      -- 5.8 segundos para leer "huelte"
    (2, 5700, 'sodiro'),      -- 5.7 segundos para leer "sodiro"
    (2, 5200, 'genso'),       -- 5.2 segundos para leer "genso"
    (2, 6800, 'triundol'),    -- 6.8 segundos para leer "triundol"
    (2, 7200, 'prejonta'),    -- 7.2 segundos para leer "prejonta"
    (2, 5000, 'tatan'),       -- 5 segundos para leer "tatan"
    (2, 5100, 'plafo'),       -- 5.1 segundos para leer "plafo"
    (2, 5800, 'liegra'),      -- 5.8 segundos para leer "liegra"
    (2, 6500, 'tincoro'),     -- 6.5 segundos para leer "tincoro"
    (2, 6200, 'pelcafo'),     -- 6.2 segundos para leer "pelcafo"
    (2, 6800, 'escrilla'),    -- 6.8 segundos para leer "escrilla"
    (2, 5200, 'pulda'),       -- 5.2 segundos para leer "pulda"
    (2, 7000, 'trondeja'),    -- 7 segundos para leer "trondeja"
    (2, 6500, 'escodia'),     -- 6.5 segundos para leer "escodia"
    (2, 6200, 'graliza');     -- 6.2 segundos para leer "graliza"

-- =====================================================
-- QUERIES DE CONSULTA Y UTILIDAD
-- =====================================================

-- Ver todos los reactivos con información del sub-tipo y tipo
SELECT 
    r.id_reactivo,
    r.pseudopalabra,
    r.tiempo_duracion,
    r.created_at as reactivo_created_at,
    st.sub_tipo_nombre,
    t.tipo_nombre
FROM reactivo_lectura_pseudopalabras r
JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
JOIN Tipos t ON st.tipo = t.id_tipo
ORDER BY r.id_reactivo;

-- Ver resultados de un usuario específico
SELECT 
    res.resultado_reactivo_usuario_ID,
    res.usuario_ID,
    r.pseudopalabra,
    res.voz_usuario_URL,
    res.tiempo_respuesta,
    res.es_correcto,
    res.fecha_realizacion,
    st.sub_tipo_nombre,
    t.tipo_nombre
FROM Resultados_Lectura_Pseudopalabras res
JOIN reactivo_lectura_pseudopalabras r ON res.id_reactivo = r.id_reactivo
JOIN Sub_tipo st ON r.id_sub_tipo = st.id_sub_tipo
JOIN Tipos t ON st.tipo = t.id_tipo
WHERE res.usuario_ID = 1  -- Cambiar por ID del usuario
ORDER BY res.fecha_realizacion DESC;

-- Estadísticas de un reactivo específico
SELECT 
    r.pseudopalabra,
    COUNT(res.resultado_reactivo_usuario_ID) as total_intentos,
    COUNT(CASE WHEN res.es_correcto = true THEN 1 END) as respuestas_correctas,
    COUNT(CASE WHEN res.es_correcto = false THEN 1 END) as respuestas_incorrectas,
    ROUND(
        (COUNT(CASE WHEN res.es_correcto = true THEN 1 END) * 100.0 / 
         NULLIF(COUNT(res.resultado_reactivo_usuario_ID), 0)), 2
    ) as porcentaje_acierto,
    AVG(res.tiempo_respuesta) as tiempo_promedio_respuesta
FROM reactivo_lectura_pseudopalabras r
LEFT JOIN Resultados_Lectura_Pseudopalabras res ON r.id_reactivo = res.id_reactivo
WHERE r.id_reactivo = 1  -- Cambiar por ID del reactivo
GROUP BY r.id_reactivo, r.pseudopalabra;

-- Estadísticas por usuario
SELECT 
    res.usuario_ID,
    u.nombre,
    COUNT(res.resultado_reactivo_usuario_ID) as total_ejercicios_realizados,
    COUNT(CASE WHEN res.es_correcto = true THEN 1 END) as respuestas_correctas,
    ROUND(
        (COUNT(CASE WHEN res.es_correcto = true THEN 1 END) * 100.0 / 
         NULLIF(COUNT(res.resultado_reactivo_usuario_ID), 0)), 2
    ) as porcentaje_acierto_general,
    AVG(res.tiempo_respuesta) as tiempo_promedio_respuesta
FROM Resultados_Lectura_Pseudopalabras res
JOIN Usuario u ON res.usuario_ID = u.usuario_id
GROUP BY res.usuario_ID, u.nombre
ORDER BY porcentaje_acierto_general DESC;

-- Reactivos más difíciles (menor porcentaje de acierto)
SELECT 
    r.id_reactivo,
    r.pseudopalabra,
    r.tiempo_duracion,
    COUNT(res.resultado_reactivo_usuario_ID) as total_intentos,
    ROUND(
        (COUNT(CASE WHEN res.es_correcto = true THEN 1 END) * 100.0 / 
         NULLIF(COUNT(res.resultado_reactivo_usuario_ID), 0)), 2
    ) as porcentaje_acierto
FROM reactivo_lectura_pseudopalabras r
LEFT JOIN Resultados_Lectura_Pseudopalabras res ON r.id_reactivo = res.id_reactivo
GROUP BY r.id_reactivo, r.pseudopalabra, r.tiempo_duracion
HAVING COUNT(res.resultado_reactivo_usuario_ID) > 0
ORDER BY porcentaje_acierto ASC, total_intentos DESC;

-- =====================================================
-- DATOS DE EJEMPLO PARA RESULTADOS
-- =====================================================

-- Insertar resultados de ejemplo para diferentes usuarios y reactivos
-- Asumiendo que existen usuarios con IDs del 1 al 5

-- Resultados para Usuario 1 (buen rendimiento)
INSERT INTO Resultados_Lectura_Pseudopalabras 
(usuario_ID, id_reactivo, voz_usuario_URL, tiempo_respuesta, es_correcto, fecha_realizacion) VALUES 
(1, 1, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo1_gloro.mp3', 4200, true, '2024-01-15 10:30:00'),
(1, 2, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo2_peima.mp3', 4500, true, '2024-01-15 10:31:00'),
(1, 3, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo3_pueña.mp3', 4800, true, '2024-01-15 10:32:00'),
(1, 4, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo4_ciergo.mp3', 5200, false, '2024-01-15 10:33:00'),
(1, 5, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo5_erpisa.mp3', 5500, true, '2024-01-15 10:34:00'),
(1, 6, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo6_fueme.mp3', 4100, true, '2024-01-15 10:35:00'),
(1, 7, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo7_giranco.mp3', 6200, true, '2024-01-15 10:36:00'),
(1, 8, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo8_cuerla.mp3', 5400, true, '2024-01-15 10:37:00'),

-- Resultados para Usuario 2 (rendimiento promedio)
(2, 1, 'https://storage.cloudinary.com/lexyboz/audio/user2_reactivo1_gloro.mp3', 5800, true, '2024-01-15 11:15:00'),
(2, 2, 'https://storage.cloudinary.com/lexyboz/audio/user2_reactivo2_peima.mp3', 6200, false, '2024-01-15 11:16:00'),
(2, 3, 'https://storage.cloudinary.com/lexyboz/audio/user2_reactivo3_pueña.mp3', 5900, true, '2024-01-15 11:17:00'),
(2, 4, 'https://storage.cloudinary.com/lexyboz/audio/user2_reactivo4_ciergo.mp3', 6500, false, '2024-01-15 11:18:00'),
(2, 5, 'https://storage.cloudinary.com/lexyboz/audio/user2_reactivo5_erpisa.mp3', 6800, true, '2024-01-15 11:19:00'),
(2, 9, 'https://storage.cloudinary.com/lexyboz/audio/user2_reactivo9_trollo.mp3', 5500, true, '2024-01-15 11:20:00'),
(2, 10, 'https://storage.cloudinary.com/lexyboz/audio/user2_reactivo10_blansa.mp3', 6100, false, '2024-01-15 11:21:00'),

-- Resultados para Usuario 3 (rendimiento bajo)
(3, 1, 'https://storage.cloudinary.com/lexyboz/audio/user3_reactivo1_gloro.mp3', 7200, false, '2024-01-15 14:20:00'),
(3, 2, 'https://storage.cloudinary.com/lexyboz/audio/user3_reactivo2_peima.mp3', 7500, false, '2024-01-15 14:21:00'),
(3, 3, 'https://storage.cloudinary.com/lexyboz/audio/user3_reactivo3_pueña.mp3', 6800, true, '2024-01-15 14:22:00'),
(3, 6, 'https://storage.cloudinary.com/lexyboz/audio/user3_reactivo6_fueme.mp3', 6500, true, '2024-01-15 14:23:00'),
(3, 21, 'https://storage.cloudinary.com/lexyboz/audio/user3_reactivo21_tatan.mp3', 5800, true, '2024-01-15 14:24:00'),
(3, 22, 'https://storage.cloudinary.com/lexyboz/audio/user3_reactivo22_plafo.mp3', 6200, false, '2024-01-15 14:25:00'),

-- Resultados para Usuario 4 (excelente rendimiento)
(4, 11, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo11_vienca.mp3', 4800, true, '2024-01-15 16:10:00'),
(4, 12, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo12_muepla.mp3', 4900, true, '2024-01-15 16:11:00'),
(4, 13, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo13_lienca.mp3', 5100, true, '2024-01-15 16:12:00'),
(4, 14, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo14_crispol.mp3', 5800, true, '2024-01-15 16:13:00'),
(4, 15, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo15_ascuso.mp3', 5200, true, '2024-01-15 16:14:00'),
(4, 16, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo16_huelte.mp3', 5000, true, '2024-01-15 16:15:00'),
(4, 17, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo17_sodiro.mp3', 4700, true, '2024-01-15 16:16:00'),
(4, 18, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo18_genso.mp3', 4600, true, '2024-01-15 16:17:00'),
(4, 19, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo19_triundol.mp3', 6200, true, '2024-01-15 16:18:00'),
(4, 20, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo20_prejonta.mp3', 6800, false, '2024-01-15 16:19:00'),

-- Resultados para Usuario 5 (rendimiento variable)
(5, 23, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo23_liegra.mp3', 5900, true, '2024-01-16 09:00:00'),
(5, 24, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo24_tincoro.mp3', 7200, false, '2024-01-16 09:01:00'),
(5, 25, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo25_pelcafo.mp3', 6800, true, '2024-01-16 09:02:00'),
(5, 26, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo26_escrilla.mp3', 7500, false, '2024-01-16 09:03:00'),
(5, 27, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo27_pulda.mp3', 5200, true, '2024-01-16 09:04:00'),
(5, 28, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo28_trondeja.mp3', 8000, false, '2024-01-16 09:05:00'),
(5, 29, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo29_escodia.mp3', 7100, true, '2024-01-16 09:06:00'),
(5, 30, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo30_graliza.mp3', 6900, true, '2024-01-16 09:07:00'),

-- Algunos resultados adicionales para análisis más completo
(1, 15, 'https://storage.cloudinary.com/lexyboz/audio/user1_reactivo15_ascuso_2.mp3', 5100, true, '2024-01-16 15:30:00'),
(2, 20, 'https://storage.cloudinary.com/lexyboz/audio/user2_reactivo20_prejonta.mp3', 7800, false, '2024-01-16 15:31:00'),
(3, 10, 'https://storage.cloudinary.com/lexyboz/audio/user3_reactivo10_blansa.mp3', 6900, true, '2024-01-16 15:32:00'),
(4, 25, 'https://storage.cloudinary.com/lexyboz/audio/user4_reactivo25_pelcafo.mp3', 5800, true, '2024-01-16 15:33:00'),
(5, 5, 'https://storage.cloudinary.com/lexyboz/audio/user5_reactivo5_erpisa.mp3', 6200, true, '2024-01-16 15:34:00');
