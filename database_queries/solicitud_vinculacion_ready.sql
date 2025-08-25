-- Este archivo está listo para ejecutar cuando tengas acceso a PostgreSQL
-- Mientras tanto, el sistema funcionará y la tabla se creará automáticamente cuando sea necesario

-- Crear tabla de solicitudes de vinculación
CREATE TABLE IF NOT EXISTS solicitud_vinculacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    mensaje TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE,
    
    -- Constraint para evitar solicitudes duplicadas pendientes
    UNIQUE(usuario_id, doctor_id, estado)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_solicitud_doctor_estado ON solicitud_vinculacion(doctor_id, estado);
CREATE INDEX IF NOT EXISTS idx_solicitud_usuario ON solicitud_vinculacion(usuario_id);
CREATE INDEX IF NOT EXISTS idx_solicitud_fecha ON solicitud_vinculacion(fecha_solicitud);

COMMENT ON TABLE solicitud_vinculacion IS 'Tabla para gestionar solicitudes de vinculación entre usuarios y doctores';
COMMENT ON COLUMN solicitud_vinculacion.estado IS 'Estado de la solicitud: pendiente, aceptada, rechazada';
