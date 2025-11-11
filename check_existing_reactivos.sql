-- Verificar qué reactivos de pseudopalabras existen
SELECT reactivo_id, pseudopalabra, id_sub_tipo, activo
FROM reactivo_lectura_pseudopalabras 
ORDER BY reactivo_id;

-- Verificar si existe el reactivo 17
SELECT * FROM reactivo_lectura_pseudopalabras WHERE reactivo_id = 17;

-- Ver todos los reactivos disponibles
SELECT 
    'pseudopalabras' as tipo,
    reactivo_id as id,
    pseudopalabra as contenido,
    id_sub_tipo,
    activo
FROM reactivo_lectura_pseudopalabras
WHERE activo = true

UNION ALL

SELECT 
    'palabras_normales' as tipo,
    reactivo_id as id,
    palabra as contenido,
    id_sub_tipo,
    activo
FROM reactivo_lectura_palabras
WHERE activo = true

UNION ALL

SELECT 
    'imagen_correcta' as tipo,
    id_reactivo as id,
    oracion as contenido,
    id_sub_tipo,
    true as activo
FROM reactivo_imagen_correcta

ORDER BY tipo, id;