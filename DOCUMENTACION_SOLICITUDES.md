# Sistema de Solicitudes de Vinculación Doctor-Paciente

## Descripción General

El sistema de solicitudes permite que los usuarios envíen peticiones a doctores para convertirse en sus pacientes. Los doctores pueden aceptar o rechazar estas solicitudes, y cuando se acepta una solicitud, automáticamente se crea la relación doctor-paciente.

## Flujo del Proceso

1. **Usuario envía solicitud**: Un usuario solicita ser paciente de un doctor específico
2. **Doctor recibe notificación**: El doctor ve las solicitudes pendientes
3. **Doctor responde**: Acepta o rechaza la solicitud
4. **Vinculación automática**: Si acepta, se crea automáticamente la relación doctor-paciente
5. **Conversión de usuario**: El usuario se convierte automáticamente en paciente

## Endpoints Disponibles

### 1. Enviar Solicitud
```
POST /api/solicitudes/enviar
```
**Descripción**: Usuario envía solicitud para ser paciente de un doctor

**Body**:
```json
{
  "doctor_id": 7,
  "mensaje": "Hola Dr. García, me gustaría ser su paciente."
}
```

**Respuesta exitosa (201)**:
```json
{
  "message": "Solicitud enviada exitosamente al Dr. García",
  "solicitud": {
    "id": 15,
    "usuario_id": 12,
    "doctor_id": 7,
    "mensaje": "Hola Dr. García...",
    "estado": "pendiente",
    "fecha_solicitud": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Ver Solicitudes Pendientes (Doctor)
```
GET /api/solicitudes/doctor/{doctor_id}/pendientes
```
**Descripción**: Obtiene todas las solicitudes pendientes para un doctor

**Respuesta exitosa (200)**:
```json
{
  "message": "Solicitudes obtenidas exitosamente.",
  "solicitudes": [
    {
      "id": 15,
      "usuario_id": 12,
      "mensaje": "Hola Dr. García...",
      "fecha_solicitud": "2024-01-15T10:30:00Z",
      "usuario_nombre": "Juan Pérez",
      "usuario_correo": "juan@email.com",
      "usuario_imagen": "https://..."
    }
  ],
  "total": 1
}
```

### 3. Ver Mis Solicitudes (Usuario)
```
GET /api/solicitudes/mis-solicitudes
```
**Descripción**: Obtiene todas las solicitudes enviadas por el usuario autenticado

**Respuesta exitosa (200)**:
```json
{
  "message": "Solicitudes obtenidas exitosamente.",
  "solicitudes": [
    {
      "id": 15,
      "doctor_id": 7,
      "mensaje": "Hola Dr. García...",
      "estado": "pendiente",
      "fecha_solicitud": "2024-01-15T10:30:00Z",
      "fecha_respuesta": null,
      "doctor_nombre": "Dr. García",
      "doctor_especialidad": "Psicología"
    }
  ],
  "total": 1
}
```

### 4. Responder Solicitud (Doctor)
```
POST /api/solicitudes/{solicitud_id}/responder
```
**Descripción**: Doctor acepta o rechaza una solicitud

**Body**:
```json
{
  "respuesta": "aceptada"  // o "rechazada"
}
```

**Respuesta exitosa (200) - Aceptada**:
```json
{
  "message": "Solicitud aceptada. Juan Pérez es ahora tu paciente.",
  "solicitud": {
    "id": 15,
    "estado": "aceptada",
    "fecha_respuesta": "2024-01-15T11:00:00Z"
  },
  "vinculacion": {
    "id": 25,
    "paciente_id": 8,
    "doctor_id": 7
  }
}
```

### 5. Estadísticas del Doctor
```
GET /api/solicitudes/doctor/{doctor_id}/estadisticas
```
**Descripción**: Obtiene un resumen de todas las solicitudes del doctor

**Respuesta exitosa (200)**:
```json
{
  "message": "Estadísticas obtenidas exitosamente.",
  "estadisticas": {
    "pendientes": 5,
    "aceptadas": 12,
    "rechazadas": 3,
    "total": 20
  }
}
```

## Funcionalidades Clave

### 🔐 Seguridad
- Validación de tokens JWT
- Verificación de permisos (solo el doctor puede responder sus solicitudes)
- Prevención de solicitudes duplicadas

### 🔄 Automatización
- Conversión automática de usuario a paciente al aceptar solicitud
- Creación automática de la vinculación doctor-paciente
- Actualización del tipo de usuario en la base de datos

### ✅ Validaciones
- Verificación de existencia de doctor y usuario
- Prevención de solicitudes duplicadas pendientes
- Validación de estados permitidos
- Verificación de que el usuario no sea ya paciente del doctor

### 📧 Notificaciones (Preparado para futuro)
- Sistema preparado para envío de emails
- Notificaciones al doctor cuando recibe solicitud
- Notificaciones al usuario cuando se responde su solicitud

## Estados de Solicitud

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Solicitud enviada, esperando respuesta del doctor |
| `aceptada` | Doctor acepta la solicitud, se crea vinculación automáticamente |
| `rechazada` | Doctor rechaza la solicitud |

## Base de Datos

### Tabla: `solicitud_vinculacion`
```sql
CREATE TABLE solicitud_vinculacion (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id),
    doctor_id INTEGER NOT NULL REFERENCES doctor(id),
    mensaje TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_respuesta TIMESTAMP,
    UNIQUE(usuario_id, doctor_id, estado)
);
```

## Casos de Uso

### Para Usuarios
1. Buscar doctores disponibles
2. Enviar solicitud con mensaje personalizado
3. Seguir el estado de sus solicitudes
4. Recibir notificación cuando el doctor responde

### Para Doctores
1. Ver solicitudes pendientes con información del usuario
2. Aceptar o rechazar solicitudes
3. Ver estadísticas de solicitudes recibidas
4. Gestionar automáticamente sus pacientes

## Integración con Sistema Existente

Este sistema se integra perfectamente con:
- Sistema de autenticación JWT existente
- Módulo doctor-paciente para vinculaciones
- Sistema de emails para notificaciones
- API de citas médicas

## Próximos Pasos Sugeridos

1. **Frontend**: Crear interfaces para gestionar solicitudes
2. **Notificaciones**: Implementar sistema de emails automáticos
3. **Dashboard**: Panel de control para doctores
4. **Filtros**: Añadir filtros por fecha, estado, etc.
5. **Mensajería**: Sistema de chat entre doctor y paciente post-vinculación
