-- Tabla para manejar solicitudes de vinculación usuario-doctor
CREATE TABLE solicitud_vinculacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    mensaje TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
    fecha_solicitud TIMESTAMP DEFAULT NOW(),
    fecha_respuesta TIMESTAMP,
    respondido_por INTEGER, -- quien respondió (normalmente el doctor)
    
    -- Foreign keys
    FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctor(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (respondido_por) REFERENCES usuario(usuario_id) ON DELETE SET NULL,
    
    -- Evitar solicitudes duplicadas pendientes
    UNIQUE(usuario_id, doctor_id, estado)
);

-- Crear índices por separado para mejor rendimiento
CREATE INDEX idx_solicitud_doctor_estado ON solicitud_vinculacion(doctor_id, estado);
CREATE INDEX idx_solicitud_usuario_estado ON solicitud_vinculacion(usuario_id, estado);
CREATE INDEX idx_solicitud_fecha ON solicitud_vinculacion(fecha_solicitud);

-- Comentarios para documentación
COMMENT ON TABLE solicitud_vinculacion IS 'Tabla que maneja las solicitudes de vinculación entre usuarios y doctores';
COMMENT ON COLUMN solicitud_vinculacion.usuario_id IS 'Usuario que solicita convertirse en paciente';
COMMENT ON COLUMN solicitud_vinculacion.doctor_id IS 'Doctor al que se le solicita la vinculación';
COMMENT ON COLUMN solicitud_vinculacion.estado IS 'Estado actual de la solicitud';
COMMENT ON COLUMN solicitud_vinculacion.mensaje IS 'Mensaje opcional del usuario al doctor';
