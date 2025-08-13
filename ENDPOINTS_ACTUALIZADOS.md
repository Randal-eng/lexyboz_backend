# 📋 ENDPOINTS API LEXYBOZ - VERSIÓN ACTUALIZADA
## Estructura Simplificada Kit → Ejercicio → Reactivos (1:N)

---

## 🏗️ **ARQUITECTURA ACTUALIZADA**

### **Cambios Principales:**
1. ✅ **Eliminada tabla `Ejercicio_Reactivos`** (junction table innecesaria)
2. ✅ **Agregado campo `ejercicio_id`** en tabla `reactivo_lectura_pseudopalabras`
3. ✅ **Agregado campo `orden_reactivo`** para ordenar reactivos dentro de ejercicios
4. ✅ **Agregado campo `tipo_reactivo`** requerido en tabla `ejercicios`
5. ✅ **Triggers automáticos** para validar consistencia de tipos
6. ✅ **Asignación automática** de tipo_reactivo al agregar primer reactivo

### **Relaciones:**
- **Kit** `1:N` **Ejercicio** (un kit puede tener múltiples ejercicios)
- **Ejercicio** `1:N` **Reactivo** (un ejercicio puede tener múltiples reactivos del mismo tipo)
- **Reactivo** `1:N` **Resultado** (un reactivo puede tener múltiples resultados de usuarios)

---

## 🎯 **ENDPOINTS DE EJERCICIOS**
**Base URL:** `http://localhost:3500/api/ejercicios`

### **1. POST /crear**
```bash
curl -X POST http://localhost:3500/api/ejercicios/crear \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "titulo": "Ejercicio de Pseudopalabras Básico",
    "descripcion": "Ejercicio para practicar lectura de pseudopalabras",
    "tipo_ejercicio": "Lectura",
    "tipo_reactivo": 1,
    "creado_por": 5
  }'
```

### **2. GET /listado**
```bash
curl -X GET "http://localhost:3500/api/ejercicios/listado?tipo_reactivo=1&creado_por=5" \
  -H "Authorization: Bearer TU_TOKEN"
```

### **3. GET /obtener/{id}**
```bash
curl -X GET http://localhost:3500/api/ejercicios/obtener/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

### **4. PUT /actualizar/{id}**
```bash
curl -X PUT http://localhost:3500/api/ejercicios/actualizar/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "titulo": "Ejercicio Actualizado",
    "descripcion": "Nueva descripción",
    "tipo_ejercicio": "Lectura Avanzada"
  }'
```

### **5. DELETE /eliminar/{id}**
```bash
curl -X DELETE http://localhost:3500/api/ejercicios/eliminar/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

### **6. GET /buscar**
```bash
curl -X GET "http://localhost:3500/api/ejercicios/buscar?termino=pseudopalabras" \
  -H "Authorization: Bearer TU_TOKEN"
```

### **7. GET /tipo/{tipo_reactivo}**
```bash
curl -X GET http://localhost:3500/api/ejercicios/tipo/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

### **8. GET /estadisticas**
```bash
curl -X GET http://localhost:3500/api/ejercicios/estadisticas \
  -H "Authorization: Bearer TU_TOKEN"
```

### **9. GET /{id}/reactivos** ⭐ NUEVO
```bash
curl -X GET http://localhost:3500/api/ejercicios/1/reactivos \
  -H "Authorization: Bearer TU_TOKEN"
```

### **10. GET /{id}/reactivos/aleatorios** ⭐ NUEVO
```bash
curl -X GET "http://localhost:3500/api/ejercicios/1/reactivos/aleatorios?cantidad=5" \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 🔬 **ENDPOINTS DE REACTIVOS ACTUALIZADOS**
**Base URL:** `http://localhost:3500/api/reactivos`

### **Endpoints Existentes (sin cambios):**
1. `POST /crear` - Crear reactivo
2. `GET /listado` - Listar reactivos
3. `GET /obtener/{id}` - Obtener reactivo por ID
4. `PUT /actualizar/{id}` - Actualizar reactivo
5. `DELETE /eliminar/{id}` - Eliminar reactivo
6. `GET /buscar` - Buscar reactivos
7. `GET /aleatorios` - Obtener reactivos aleatorios
8. `GET /estadisticas` - Estadísticas de reactivos

### **Endpoints NUEVOS para gestión de ejercicios:**

### **9. POST /asignar-ejercicio** ⭐ NUEVO
```bash
curl -X POST http://localhost:3500/api/reactivos/asignar-ejercicio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "reactivo_id": 1,
    "ejercicio_id": 5,
    "orden_reactivo": 1
  }'
```

### **10. POST /quitar-ejercicio** ⭐ NUEVO
```bash
curl -X POST http://localhost:3500/api/reactivos/quitar-ejercicio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "reactivo_id": 1
  }'
```

### **11. GET /libres** ⭐ NUEVO
```bash
curl -X GET "http://localhost:3500/api/reactivos/libres?tipo_reactivo=1" \
  -H "Authorization: Bearer TU_TOKEN"
```

### **12. POST /actualizar-orden** ⭐ NUEVO
```bash
curl -X POST http://localhost:3500/api/reactivos/actualizar-orden \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "ejercicio_id": 5,
    "reactivos_orden": [
      {"reactivo_id": 1, "orden_reactivo": 1},
      {"reactivo_id": 3, "orden_reactivo": 2},
      {"reactivo_id": 5, "orden_reactivo": 3}
    ]
  }'
```

---

## 📊 **ENDPOINTS DE RESULTADOS**
**Base URL:** `http://localhost:3500/api/resultados`

### **Sin cambios - 11 endpoints disponibles:**
1. `POST /crear` - Crear resultado
2. `GET /listado` - Listar resultados
3. `GET /obtener/{id}` - Obtener resultado por ID
4. `PUT /actualizar/{id}` - Actualizar resultado
5. `DELETE /eliminar/{id}` - Eliminar resultado
6. `GET /usuario/{usuario_id}` - Resultados por usuario
7. `GET /reactivo/{reactivo_id}` - Resultados por reactivo
8. `GET /estadisticas/usuario/{usuario_id}` - Estadísticas de usuario
9. `GET /estadisticas/reactivo/{reactivo_id}` - Estadísticas de reactivo
10. `GET /ranking/usuarios` - Ranking de usuarios
11. `GET /estadisticas/generales` - Estadísticas generales

---

## 🏷️ **ENDPOINTS DE TIPOS Y SUBTIPOS**
**Base URL:** `http://localhost:3500/api/tipos` y `http://localhost:3500/api/subtipos`

### **Tipos (7 endpoints):**
1. `POST /crear` - Crear tipo
2. `GET /listado` - Listar tipos
3. `GET /obtener/{id}` - Obtener tipo por ID
4. `PUT /actualizar/{id}` - Actualizar tipo
5. `DELETE /eliminar/{id}` - Eliminar tipo
6. `GET /buscar` - Buscar tipos
7. `GET /estadisticas` - Estadísticas de tipos

### **Subtipos (9 endpoints):**
1. `POST /crear` - Crear subtipo
2. `GET /listado` - Listar subtipos
3. `GET /obtener/{id}` - Obtener subtipo por ID
4. `PUT /actualizar/{id}` - Actualizar subtipo
5. `DELETE /eliminar/{id}` - Eliminar subtipo
6. `GET /buscar` - Buscar subtipos
7. `GET /tipo/{tipo_id}` - Subtipos por tipo
8. `GET /verificar-nombre` - Verificar nombre único
9. `GET /estadisticas` - Estadísticas de subtipos

---

## 🎁 **ENDPOINTS DE KITS**
**Base URL:** `http://localhost:3500/api/kits`

### **Sin cambios - Gestión completa de kits disponible**

---

## 📈 **RESUMEN DE MEJORAS**

### **✅ Completado:**
1. **Estructura simplificada** de 1:N entre ejercicios y reactivos
2. **10 endpoints nuevos** para gestión de ejercicios
3. **4 endpoints nuevos** para gestión de reactivos con ejercicios
4. **Validación automática** de tipos de reactivos
5. **Orden configurable** de reactivos dentro de ejercicios
6. **Documentación Swagger** completa para todos los endpoints
7. **Gestión de reactivos libres** y asignados
8. **Reactivos aleatorios** por ejercicio

### **🎯 Total de Endpoints Disponibles:**
- **Ejercicios:** 10 endpoints
- **Reactivos:** 12 endpoints (8 existentes + 4 nuevos)
- **Resultados:** 11 endpoints
- **Tipos:** 7 endpoints
- **Subtipos:** 9 endpoints
- **Kits:** Múltiples endpoints
- **Auth y otros:** Múltiples endpoints

### **📝 Arquitectura Final:**
```
Kit (1:N) → Ejercicio (1:N) → Reactivo (1:N) → Resultado
```

### **🔐 Seguridad:**
- ✅ Todos los endpoints protegidos con JWT
- ✅ Validación de datos con Joi
- ✅ Manejo de errores consistente
- ✅ Logging de errores

### **📚 Documentación:**
- ✅ Swagger/OpenAPI completo
- ✅ Ejemplos de JSON para todos los endpoints
- ✅ Códigos de respuesta detallados
- ✅ Esquemas de validación documentados

---

## 🚀 **Próximos Pasos Recomendados:**

1. **Aplicar actualizaciones de BD:**
   ```bash
   node aplicar_actualizaciones.js
   ```

2. **Probar workflow completo:**
   - Crear tipo → Crear ejercicio → Asignar reactivos → Ejecutar ejercicio → Registrar resultados

3. **Testing de integración:**
   - Validar que todos los endpoints funcionan correctamente
   - Verificar consistencia de datos
   - Probar escenarios de error

4. **Optimizaciones futuras:**
   - Índices de BD para mejor rendimiento
   - Cache para consultas frecuentes
   - Paginación para listados grandes
