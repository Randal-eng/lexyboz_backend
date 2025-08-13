# 📋 ENDPOINTS TIPOS Y SUB-TIPOS - LEXYBOZ API

## 🎯 TIPOS DE EJERCICIOS

### Base URL: `/api/tipos`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/crear` | Crear nuevo tipo | ✅ |
| GET | `/listado` | Obtener todos los tipos | ✅ |
| GET | `/obtener/{id}` | Obtener tipo específico | ✅ |
| PUT | `/actualizar/{id}` | Actualizar tipo | ✅ |
| DELETE | `/eliminar/{id}` | Eliminar tipo | ✅ |
| GET | `/buscar` | Buscar tipos por nombre | ✅ |
| GET | `/estadisticas` | Estadísticas de tipos | ✅ |

### 📝 Ejemplos de Request Body:

**Crear tipo:**
```json
{
  "tipo_nombre": "Escritura Creativa"
}
```

**Actualizar tipo:**
```json
{
  "tipo_nombre": "Lectura Avanzada"
}
```

### 📤 Ejemplos de Response:

**Crear tipo (201):**
```json
{
  "success": true,
  "message": "Tipo creado exitosamente",
  "data": {
    "id_tipo": 6,
    "tipo_nombre": "Escritura Creativa",
    "created_at": "2024-01-15T14:30:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

**Listar tipos con sub-tipos (200):**
```json
{
  "success": true,
  "message": "Tipos obtenidos exitosamente",
  "count": 2,
  "data": [
    {
      "id_tipo": 1,
      "tipo_nombre": "Lectura",
      "tipo_created_at": "2024-01-15T10:30:00.000Z",
      "tipo_updated_at": "2024-01-15T10:30:00.000Z",
      "sub_tipos": [
        {
          "id_sub_tipo": 1,
          "sub_tipo_nombre": "Lectura de Palabras",
          "created_at": "2024-01-15T10:35:00.000Z",
          "updated_at": "2024-01-15T10:35:00.000Z"
        }
      ]
    }
  ]
}
```

### 🔍 Query Parameters:

- `GET /listado?include_subtipos=true` - Incluir sub-tipos
- `GET /obtener/{id}?include_subtipos=true` - Incluir sub-tipos
- `GET /buscar?q=lectura` - Búsqueda por término

---

## 🎯 SUB-TIPOS DE EJERCICIOS

### Base URL: `/api/subtipos`

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/crear` | Crear nuevo sub-tipo | ✅ |
| GET | `/listado` | Obtener todos los sub-tipos | ✅ |
| GET | `/obtener/{id}` | Obtener sub-tipo específico | ✅ |
| GET | `/por-tipo/{tipo_id}` | Sub-tipos de un tipo | ✅ |
| PUT | `/actualizar/{id}` | Actualizar sub-tipo | ✅ |
| DELETE | `/eliminar/{id}` | Eliminar sub-tipo | ✅ |
| GET | `/buscar` | Buscar sub-tipos | ✅ |
| GET | `/conteo-por-tipo` | Conteo por tipo | ✅ |
| GET | `/verificar-existencia` | Verificar duplicados | ✅ |
| GET | `/estadisticas` | Estadísticas detalladas | ✅ |

### 📝 Ejemplos de Request Body:

**Crear sub-tipo:**
```json
{
  "tipo": 1,
  "sub_tipo_nombre": "Lectura Comprensiva"
}
```

**Actualizar sub-tipo:**
```json
{
  "sub_tipo_nombre": "Lectura de Palabras Avanzada"
}
```

### 📤 Ejemplos de Response:

**Crear sub-tipo (201):**
```json
{
  "success": true,
  "message": "Sub-tipo creado exitosamente",
  "data": {
    "id_sub_tipo": 13,
    "tipo": 1,
    "sub_tipo_nombre": "Lectura Comprensiva",
    "created_at": "2024-01-15T14:30:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

**Listar sub-tipos (200):**
```json
{
  "success": true,
  "message": "Sub-tipos obtenidos exitosamente",
  "count": 3,
  "filtered_by_tipo": 1,
  "data": [
    {
      "id_sub_tipo": 1,
      "tipo": 1,
      "sub_tipo_nombre": "Lectura de Palabras",
      "created_at": "2024-01-15T10:35:00.000Z",
      "updated_at": "2024-01-15T10:35:00.000Z",
      "tipo_nombre": "Lectura"
    }
  ]
}
```

### 🔍 Query Parameters:

- `GET /listado?tipo=1` - Filtrar por tipo
- `GET /buscar?q=palabras&tipo=1` - Búsqueda con filtro
- `GET /verificar-existencia?sub_tipo_nombre=test&tipo=1&exclude_id=2`

---

## 🛡️ AUTENTICACIÓN

Todos los endpoints requieren autenticación Bearer Token:

```
Authorization: Bearer <jwt_token>
```

## 📊 CÓDIGOS DE ESTADO

- **200** - Operación exitosa
- **201** - Recurso creado
- **400** - Error de validación o restricción
- **401** - No autorizado
- **404** - Recurso no encontrado
- **500** - Error interno del servidor

## 🔗 SWAGGER DOCUMENTATION

Toda la documentación está disponible en Swagger UI con ejemplos completos de requests y responses.

---

## ✨ CARACTERÍSTICAS ESPECIALES

### Para TIPOS:
- **Relaciones**: Obtener tipos con sus sub-tipos incluidos
- **Búsqueda**: Buscar por nombre con coincidencias parciales
- **Estadísticas**: Resumen completo con conteos y promedios
- **Validaciones**: Control de duplicados y dependencias

### Para SUB-TIPOS:
- **Filtros**: Por tipo específico
- **Relaciones**: Información del tipo padre incluida
- **Verificación**: Endpoint para validar duplicados
- **Estadísticas**: Conteos por tipo y análisis detallado
- **Búsqueda avanzada**: Con filtros opcionales por tipo
