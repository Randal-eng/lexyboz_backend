# Guía para crear reactivos - lexyboz_backend

El error "El contenido y sub_tipo_id son requeridos" indica que faltan campos obligatorios. Aquí están los requisitos por tipo de reactivo:

## 1. Reactivo de Lectura de Pseudopalabras

**Campos requeridos:**
```json
{
  "pseudopalabra": "texto_palabra",     // OBLIGATORIO: string 1-100 caracteres
  "id_sub_tipo": 123,                   // OBLIGATORIO: número entero válido
  "tiempo_duracion": 5000               // OPCIONAL: tiempo en ms (mínimo 1)
}
```

**Ejemplo de request:**
```json
POST /api/reactivos
{
  "pseudopalabra": "balera",
  "id_sub_tipo": 1,
  "tiempo_duracion": 3000
}
```

## 2. Reactivo de Imagen Correcta

**Campos requeridos:**
```json
{
  "id_sub_tipo": 7,                     // OBLIGATORIO: debe ser exactamente 7
  "tiempo_duracion": 5000,              // OBLIGATORIO: tiempo en ms (mínimo 1)
  "oracion": "Texto de la pregunta",    // OBLIGATORIO: string 5-255 caracteres
  "imagenes": [                         // OBLIGATORIO: exactamente 4 imágenes
    {
      "imagen_url": "https://...",      // OBLIGATORIO: URL válida
      "es_correcta": true               // OBLIGATORIO: true/false
    },
    {
      "imagen_url": "https://...",
      "es_correcta": false
    },
    {
      "imagen_url": "https://...",
      "es_correcta": false
    },
    {
      "imagen_url": "https://...",
      "es_correcta": false
    }
  ]
}
```

**Ejemplo de request:**
```json
POST /api/reactivos/imagen-correcta
{
  "id_sub_tipo": 7,
  "tiempo_duracion": 8000,
  "oracion": "¿Cuál imagen muestra un gato?",
  "imagenes": [
    {
      "imagen_url": "https://ejemplo.com/gato.jpg",
      "es_correcta": true
    },
    {
      "imagen_url": "https://ejemplo.com/perro.jpg",
      "es_correcta": false
    },
    {
      "imagen_url": "https://ejemplo.com/casa.jpg",
      "es_correcta": false
    },
    {
      "imagen_url": "https://ejemplo.com/arbol.jpg",
      "es_correcta": false
    }
  ]
}
```

## Obtener subtipos válidos

**Para ver qué id_sub_tipo están disponibles:**
```bash
GET /api/subtipos
```

**Respuesta típica:**
```json
{
  "subtipos": [
    {
      "id_sub_tipo": 1,
      "sub_tipo_nombre": "Pseudopalabras Cortas",
      "tipo_id": 1,
      "tipo_nombre": "Lectura"
    },
    {
      "id_sub_tipo": 7,
      "sub_tipo_nombre": "Selección de Imagen",
      "tipo_id": 2,
      "tipo_nombre": "Visual"
    }
  ]
}
```

## Validaciones importantes

### Para pseudopalabras:
- `pseudopalabra`: no puede estar vacía, máximo 100 caracteres
- `id_sub_tipo`: debe existir en la tabla sub_tipo
- `tiempo_duracion`: si se proporciona, debe ser >= 1 milisegundo

### Para imagen correcta:
- `id_sub_tipo`: DEBE ser exactamente 7 (hardcoded en validación)
- `oracion`: entre 5 y 255 caracteres
- `imagenes`: exactamente 4 elementos, no más ni menos
- Solo UNA imagen puede tener `es_correcta: true`
- Todas las URLs deben ser válidas

## Errores comunes

❌ **"El contenido y sub_tipo_id son requeridos"**
- Falta el campo `pseudopalabra` o `id_sub_tipo`

❌ **"Datos inválidos: id_sub_tipo is required"**  
- El campo `id_sub_tipo` no se envió o es null

❌ **"Algunos ejercicios no existen o están inactivos"**
- El `id_sub_tipo` no existe en la base de datos

❌ **"imagenes must contain exactly 4 items"**
- No se enviaron exactamente 4 imágenes

## Scripts de prueba

**Crear reactivo de pseudopalabra:**
```bash
curl -X POST http://localhost:3000/api/reactivos \
  -H "Content-Type: application/json" \
  -d '{
    "pseudopalabra": "maleta",
    "id_sub_tipo": 1,
    "tiempo_duracion": 4000
  }'
```

**Crear reactivo de imagen:**
```bash
curl -X POST http://localhost:3000/api/reactivos/imagen-correcta \
  -H "Content-Type: application/json" \
  -d '{
    "id_sub_tipo": 7,
    "tiempo_duracion": 6000,
    "oracion": "Selecciona la imagen del animal",
    "imagenes": [
      {"imagen_url": "https://via.placeholder.com/150/FF0000", "es_correcta": true},
      {"imagen_url": "https://via.placeholder.com/150/00FF00", "es_correcta": false},
      {"imagen_url": "https://via.placeholder.com/150/0000FF", "es_correcta": false},
      {"imagen_url": "https://via.placeholder.com/150/FFFF00", "es_correcta": false}
    ]
  }'
```