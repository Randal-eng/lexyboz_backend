-- Verificar qué sub_tipos existen
SELECT st.id_sub_tipo, st.sub_tipo_nombre, t.tipo_nombre
FROM sub_tipo st
JOIN tipos t ON st.tipo = t.id_tipo
ORDER BY st.id_sub_tipo;

-- Verificar específicamente el sub_tipo 7
SELECT * FROM sub_tipo WHERE id_sub_tipo = 7;