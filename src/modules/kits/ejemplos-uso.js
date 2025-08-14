// =====================================================
// EJEMPLOS DE USO DE LA API DE KITS
// Este archivo contiene ejemplos de cómo usar todos los endpoints
// =====================================================

/**
 * ANTES DE USAR ESTOS EJEMPLOS:
 * 1. Asegúrate de tener un token de autenticación válido
 * 2. Reemplaza {BASE_URL} con tu URL base (ej: http://localhost:3000)
 * 3. Reemplaza {AUTH_TOKEN} con tu token JWT
 * 4. Ejecuta las queries de creación de tablas primero
 */

// =====================================================
// 1. CREAR UN NUEVO KIT
// POST /api/kits
// =====================================================
const ejemploCrearKit = {
    method: 'POST',
    url: '{BASE_URL}/api/kits',
    headers: {
        'Authorization': 'Bearer {AUTH_TOKEN}',
        'Content-Type': 'application/json'
    },
    body: {
        "name": "Kit de Lectura Básica",
        "descripcion": "Kit introductorio para ejercicios de lectura y comprensión básica"
    }
};

// =====================================================
// 2. OBTENER TODOS LOS KITS CON FILTROS
// GET /api/kits
// =====================================================
const ejemploObtenerKits = {
    method: 'GET',
    url: '{BASE_URL}/api/kits?page=1&limit=10&activo=true&buscar=lectura',
    headers: {
        'Authorization': 'Bearer {AUTH_TOKEN}'
    }
};

// =====================================================
// 3. OBTENER UN KIT ESPECÍFICO CON SUS EJERCICIOS
// GET /api/kits/:id
// =====================================================
const ejemploObtenerKitPorId = {
    method: 'GET',
    url: '{BASE_URL}/api/kits/1',
    headers: {
        'Authorization': 'Bearer {AUTH_TOKEN}'
    }
};

// =====================================================
// 4. ACTUALIZAR UN KIT
// PUT /api/kits/:id
// =====================================================
const ejemploActualizarKit = {
    method: 'PUT',
    url: '{BASE_URL}/api/kits/1',
    headers: {
        'Authorization': 'Bearer {AUTH_TOKEN}',
        'Content-Type': 'application/json'
    },
    body: {
        "name": "Kit de Lectura Básica Actualizado",
        "descripcion": "Descripción actualizada del kit",
        "activo": true
    }
};

// =====================================================
// 5. AGREGAR EJERCICIO A UN KIT
// POST /api/kits/:id/ejercicios
// =====================================================
const ejemploAgregarEjercicio = {
    method: 'POST',
    url: '{BASE_URL}/api/kits/1/ejercicios',
    headers: {
        'Authorization': 'Bearer {AUTH_TOKEN}',
        'Content-Type': 'application/json'
    },
    body: {
        "ejercicio_id": 5,
        "orden_en_kit": 1
    }
};

// =====================================================
// 6. REMOVER EJERCICIO DE UN KIT
// DELETE /api/kits/:id/ejercicios/:ejercicio_id
// =====================================================
const ejemploRemoverEjercicio = {
    method: 'DELETE',
    url: '{BASE_URL}/api/kits/1/ejercicios/5',
    headers: {
        'Authorization': 'Bearer {AUTH_TOKEN}'
    }
};

// =====================================================
// 7. REORDENAR EJERCICIOS EN UN KIT
// PUT /api/kits/:id/reordenar
// =====================================================
const ejemploReordenarEjercicios = {
    method: 'PUT',
    url: '{BASE_URL}/api/kits/1/reordenar',
    headers: {
        'Authorization': 'Bearer {AUTH_TOKEN}',
        'Content-Type': 'application/json'
    },
    body: {
        "nuevos_ordenes": [
            { "ejercicio_id": 5, "orden_en_kit": 2 },
            { "ejercicio_id": 3, "orden_en_kit": 1 },
            { "ejercicio_id": 7, "orden_en_kit": 3 }
        ]
    }
};

// =====================================================
// 8. ELIMINAR UN KIT (SOFT DELETE)
// DELETE /api/kits/:id
// =====================================================
const ejemploEliminarKit = {
    method: 'DELETE',
    url: '{BASE_URL}/api/kits/1',
    headers: {
        'Authorization': 'Bearer {AUTH_TOKEN}'
    }
};

// =====================================================
// EJEMPLOS DE RESPUESTAS ESPERADAS
// =====================================================

const respuestaCrearKit = {
    "message": "Kit creado exitosamente",
    "kit": {
        "kit_id": 1,
        "name": "Kit de Lectura Básica",
        "descripcion": "Kit introductorio para ejercicios de lectura y comprensión básica",
        "creado_por": 123,
        "fecha_creacion": "2025-08-13T18:30:00.000Z",
        "updated_at": "2025-08-13T18:30:00.000Z",
        "activo": true
    }
};

const respuestaObtenerKits = {
    "message": "Kits obtenidos exitosamente",
    "data": [
        {
            "kit_id": 1,
            "name": "Kit de Lectura Básica",
            "descripcion": "Kit introductorio...",
            "creado_por": 123,
            "fecha_creacion": "2025-08-13T18:30:00.000Z",
            "updated_at": "2025-08-13T18:30:00.000Z",
            "activo": true,
            "creador_nombre": "Juan Pérez",
            "creador_correo": "juan@ejemplo.com",
            "total_ejercicios": 5
        }
    ],
    "pagination": {
        "current_page": 1,
        "total_pages": 3,
        "total_items": 25,
        "items_per_page": 10
    }
};

const respuestaKitDetallado = {
    "message": "Kit obtenido exitosamente",
    "kit": {
        "kit_id": 1,
        "name": "Kit de Lectura Básica",
        "descripcion": "Kit introductorio...",
        "creado_por": 123,
        "fecha_creacion": "2025-08-13T18:30:00.000Z",
        "updated_at": "2025-08-13T18:30:00.000Z",
        "activo": true,
        "creador_nombre": "Juan Pérez",
        "creador_correo": "juan@ejemplo.com",
        "ejercicios": [
            {
                "ejercicio_id": 5,
                "titulo": "Ejercicio de Pseudopalabras",
                "descripcion": "Lectura de palabras inventadas",
                "creado_por": 123,
                "created_at": "2025-08-13T18:25:00.000Z",
                "activo": true,
                "orden_en_kit": 1,
                "creador_ejercicio_nombre": "María González"
            }
        ]
    }
};

// =====================================================
// COMANDO CURL DE EJEMPLO
// =====================================================

/*
# Crear un kit
curl -X POST http://localhost:3000/api/kits \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kit de Prueba",
    "descripcion": "Kit creado desde curl"
  }'

# Obtener kits
curl -X GET "http://localhost:3000/api/kits?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Obtener kit específico
curl -X GET http://localhost:3000/api/kits/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
*/

module.exports = {
    ejemploCrearKit,
    ejemploObtenerKits,
    ejemploObtenerKitPorId,
    ejemploActualizarKit,
    ejemploAgregarEjercicio,
    ejemploRemoverEjercicio,
    ejemploReordenarEjercicios,
    ejemploEliminarKit,
    respuestaCrearKit,
    respuestaObtenerKits,
    respuestaKitDetallado
};
