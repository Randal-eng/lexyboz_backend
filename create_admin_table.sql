-- Crear tabla administrador
CREATE TABLE IF NOT EXISTS administrador (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(100) NOT NULL,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar admin por defecto
INSERT INTO administrador (nombre, correo, contraseña, nombre_usuario)
VALUES ('Administrador Principal', 'admin@lexyboz.com', 'admin123456', 'admin')
ON CONFLICT (correo) DO NOTHING;

-- Verificar que se creó
SELECT * FROM administrador;