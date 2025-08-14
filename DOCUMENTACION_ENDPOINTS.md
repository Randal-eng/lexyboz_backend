# 📚 DOCUMENTACIÓN COMPLETA DE ENDPOINTS

## 🚀 **KITS Y EJERCICIOS - API REST**

### **Base URL:** `http://localhost:3500`

---

## 📋 **1. ENDPOINTS DE KITS**

### **1.1 Crear Kit Básico (Sin Ejercicios)**
```http
POST /api/kits
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body Ejemplo:**
```json
{
  "name": "Kit de Lectura Básica",
  "descripcion": "Kit para evaluar habilidades básicas de lectura",
  "creado_por": 1
}
```

**Respuesta (201):**
```json
{
  "message": "Kit creado exitosamente",
  "kit": {
    "kit_id": 1,
    "name": "Kit de Lectura Básica",
    "descripcion": "Kit para evaluar habilidades básicas de lectura",
    "creado_por": 1,
    "activo": true,
    "fecha_creacion": "2025-08-13T10:30:00Z",
    "creador_nombre": "Juan Pérez",
    "total_ejercicios": 0
  }
}
```

---

### **1.2 Crear Kit Con Ejercicios ⭐ (NUEVO)**
```http
POST /api/kits/con-ejercicios
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body Ejemplo:**
```json
{
  "name": "Kit Completo de Pseudopalabras",
  "descripcion": "Kit completo con ejercicios de lectura de pseudopalabras",
  "creado_por": 1,
  "ejercicios": [
    {
      "ejercicio_id": 1,
      "orden": 1
    },
    {
      "ejercicio_id": 2,
      "orden": 2
    },
    {
      "ejercicio_id": 3,
      "orden": 3
    }
  ]
}
```

**Respuesta (201):**
```json
{
  "message": "Kit creado exitosamente con ejercicios",
  "kit": {
    "kit_id": 1,
    "name": "Kit Completo de Pseudopalabras",
    "descripcion": "Kit completo con ejercicios de lectura de pseudopalabras",
    "creado_por": 1,
    "activo": true,
    "fecha_creacion": "2025-08-13T10:30:00Z",
    "creador_nombre": "Juan Pérez",
    "total_ejercicios": 3
  },
  "ejercicios_agregados": [
    {
      "kit_id": 1,
      "ejercicio_id": 1,
      "orden_en_kit": 1,
      "activo": true,
      "fecha_creacion": "2025-08-13T10:30:00Z"
    },
    {
      "kit_id": 1,
      "ejercicio_id": 2,
      "orden_en_kit": 2,
      "activo": true,
      "fecha_creacion": "2025-08-13T10:30:00Z"
    },
    {
      "kit_id": 1,
      "ejercicio_id": 3,
      "orden_en_kit": 3,
      "activo": true,
      "fecha_creacion": "2025-08-13T10:30:00Z"
    }
  ],
  "total_ejercicios": 3
}
```

---

### **1.3 Agregar Ejercicios a Kit Existente**
```http
POST /api/kits/{kit_id}/ejercicios
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body Ejemplo:**
```json
{
  "ejercicios": [
    {
      "ejercicio_id": 4,
      "orden": 1
    },
    {
      "ejercicio_id": 5,
      "orden": 2
    }
  ]
}
```

**Respuesta (201):**
```json
{
  "message": "Ejercicios agregados al kit exitosamente",
  "resultado": {
    "kit_id": 5,
    "ejercicios_agregados": [
      {
        "kit_id": 5,
        "ejercicio_id": 4,
        "orden_en_kit": 1,
        "activo": true,
        "fecha_creacion": "2025-08-13T10:30:00Z"
      },
      {
        "kit_id": 5,
        "ejercicio_id": 5,
        "orden_en_kit": 2,
        "activo": true,
        "fecha_creacion": "2025-08-13T10:30:00Z"
      }
    ],
    "total_ejercicios": 2
  }
}
```

---

### **1.4 Obtener Todos los Kits**
```http
GET /api/kits?page=1&limit=10&activo=true
Authorization: Bearer {jwt_token}
```

**Respuesta (200):**
```json
{
  "message": "Kits obtenidos exitosamente",
  "kits": [
    {
      "kit_id": 1,
      "name": "Kit de Lectura Básica",
      "descripcion": "Kit para evaluar habilidades básicas de lectura",
      "creado_por": 1,
      "activo": true,
      "fecha_creacion": "2025-08-13T10:30:00Z",
      "creador_nombre": "Juan Pérez",
      "total_ejercicios": 3
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 1,
    "total_items": 1,
    "items_per_page": 10
  }
}
```

---

### **1.5 Obtener Kit Específico**
```http
GET /api/kits/{kit_id}
Authorization: Bearer {jwt_token}
```

---

### **1.6 Obtener Ejercicios de un Kit**
```http
GET /api/kits/{kit_id}/ejercicios?page=1&limit=20&activo=true
Authorization: Bearer {jwt_token}
```

**Respuesta (200):**
```json
{
  "message": "Ejercicios del kit obtenidos exitosamente",
  "ejercicios": [
    {
      "ejercicio_id": 1,
      "titulo": "Ejercicio de Pseudopalabras",
      "descripcion": "Ejercicio para evaluar lectura de pseudopalabras",
      "orden_en_kit": 1,
      "activo_en_kit": true,
      "fecha_agregado": "2025-08-13T10:30:00Z",
      "creador_nombre": "Ana García"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0,
  "page": 1,
  "totalPages": 1
}
```

---

### **1.7 Remover Ejercicios de un Kit**
```http
DELETE /api/kits/{kit_id}/ejercicios
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body Ejemplo:**
```json
{
  "ejercicios_ids": [1, 2, 3]
}
```

---

## 📋 **2. ENDPOINTS DE EJERCICIOS**

### **2.1 Crear Ejercicio Básico**
```http
POST /api/ejercicios
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body Ejemplo:**
```json
{
  "titulo": "Ejercicio de Pseudopalabras Básico",
  "descripcion": "Ejercicio para evaluar lectura de pseudopalabras",
  "tipo_ejercicio": 1,
  "creado_por": 1
}
```

---

### **2.2 Crear Ejercicio Con Reactivos**
```http
POST /api/ejercicios/con-reactivos
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body Ejemplo:**
```json
{
  "titulo": "Ejercicio de Pseudopalabras Avanzado",
  "descripcion": "Ejercicio para evaluar lectura de pseudopalabras complejas",
  "tipo_ejercicio": 1,
  "creado_por": 1,
  "reactivos": [
    {
      "id_reactivo": 1,
      "orden": 1
    },
    {
      "id_reactivo": 2,
      "orden": 2
    }
  ]
}
```

---

### **2.3 Agregar Reactivos a Ejercicio Existente**
```http
POST /api/ejercicios/{ejercicio_id}/reactivos
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body Ejemplo:**
```json
{
  "reactivos": [
    {
      "id_reactivo": 3,
      "orden": 1
    },
    {
      "id_reactivo": 4,
      "orden": 2
    }
  ]
}
```

---

### **2.4 Obtener Kits que Contienen un Ejercicio**
```http
GET /api/ejercicios/{ejercicio_id}/kits?page=1&limit=20&activo=true
Authorization: Bearer {jwt_token}
```

---

## 📋 **3. ENDPOINTS DE REACTIVOS**

### **3.1 Crear Reactivo**
```http
POST /api/reactivos
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Body Ejemplo:**
```json
{
  "pseudopalabra": "BLANTO",
  "id_sub_tipo": 1,
  "tiempo_duracion": 3000
}
```

---

### **3.2 Obtener Reactivos**
```http
GET /api/reactivos?page=1&limit=20&id_sub_tipo=1&buscar=BLAN
Authorization: Bearer {jwt_token}
```

---

### **3.3 Obtener Reactivos por Tipo**
```http
GET /api/reactivos/tipo/{tipo_id}
Authorization: Bearer {jwt_token}
```

---

### **3.4 Obtener Reactivos por Subtipo**
```http
GET /api/reactivos/sub-tipo/{sub_tipo_id}
Authorization: Bearer {jwt_token}
```

---

## 🔧 **4. CÓDIGOS DE RESPUESTA**

### **Éxito:**
- `200` - OK (GET requests)
- `201` - Created (POST requests)

### **Errores del Cliente:**
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (sin autenticación)
- `403` - Forbidden (sin permisos)
- `404` - Not Found (recurso no encontrado)

### **Errores del Servidor:**
- `500` - Internal Server Error

---

## 🎯 **5. ORDEN SUGERIDO PARA PRUEBAS**

1. **Crear algunos ejercicios básicos**
2. **Crear algunos reactivos**
3. **Crear kit con ejercicios** (endpoint 1.2)
4. **Obtener el kit creado** (endpoint 1.5)
5. **Ver los ejercicios del kit** (endpoint 1.6)
6. **Agregar más ejercicios al kit** (endpoint 1.3)
7. **Crear ejercicio con reactivos**
8. **Ver kits que contienen un ejercicio**

---

## 🔑 **6. AUTENTICACIÓN**

Todos los endpoints requieren un JWT token en el header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

El campo `creado_por` es opcional en el JSON si el usuario está autenticado (se toma del token JWT).

---

## 📱 **7. HERRAMIENTAS RECOMENDADAS**

- **Postman** - Para probar endpoints
- **Insomnia** - Para probar endpoints  
- **Swagger UI** - Disponible en `http://localhost:3500/api-docs`
- **Thunder Client** (VS Code Extension)

---

## ⚠️ **8. NOTAS IMPORTANTES**

- Todas las fechas están en formato ISO 8601
- Los IDs son números enteros
- Los campos `activo` por defecto son `true`
- Las relaciones usan tablas intermedias (`ejercicios_kits`, `ejercicio_reactivos`)
- Se usa soft delete (campo `activo = false`)
- Todas las operaciones de múltiples elementos usan transacciones para consistencia

---

## 🛠️ **9. ESTRUCTURA DE BASE DE DATOS**

### **Tablas Principales:**
- `kits` - Información de kits
- `ejercicios` - Información de ejercicios  
- `reactivo_lectura_pseudopalabras` - Reactivos
- `tipos` - Tipos de ejercicios
- `sub_tipo` - Subtipos de reactivos

### **Tablas de Relación:**
- `ejercicios_kits` - Relación Kit ↔ Ejercicios (1:N)
- `ejercicio_reactivos` - Relación Ejercicio ↔ Reactivos (1:N)

---

¡Todo listo para usar! 🚀
