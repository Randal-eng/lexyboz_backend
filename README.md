# Lexyboz

*Completa aquí una descripción detallada de lo que hace tu proyecto.*

## Stack Tecnológico

*   **Backend:** Node.js, Express
*   **Base de Datos:** PostgreSQL (a través de `pg`)
*   **Autenticación:** bcrypt
*   **Validación:** Joi
*   **Documentación API:** Swagger

## Instalación

1.  Clona el repositorio:
    ```bash
    git clone <URL-del-repositorio>
    ```
2.  Navega al directorio del proyecto:
    ```bash
    cd lexyboz-backend/lexyboz
    ```
3.  Instala las dependencias:
    ```bash
    npm install
    ```
4.  Crea un archivo `.env` en la raíz del proyecto y configura las variables de entorno necesarias (puedes basarte en un archivo `.env.example` si lo tienes).

## Uso

*   Para iniciar el servidor en modo de producción:
    ```bash
    npm start
    ```
*   Para iniciar el servidor en modo de desarrollo con recarga automática (usando nodemon):
    ```bash
    npm run dev
    ```

## Documentación de la API

La documentación interactiva de la API se genera automáticamente con Swagger.

### Acceso rápido

- Una vez que el servidor está en funcionamiento, abre tu navegador y visita:
  [http://localhost:3500/api-docs](http://localhost:3500/api-docs)

### ¿Qué encontrarás?
- **Listado completo de endpoints** de todos los módulos (autenticación, citas, kits, ejercicios, resultados, etc.).
- **Detalles de cada endpoint**: método, parámetros, request body, respuestas y ejemplos.
- **Pruebas interactivas**: puedes probar los endpoints directamente desde la interfaz Swagger.

### Recomendaciones
- Si modificas o agregas endpoints, asegúrate de documentarlos con anotaciones Swagger en los archivos de rutas correspondientes.
- Si la documentación no aparece actualizada, reinicia el servidor.
- Para entornos distintos a desarrollo, cambia la URL base según la configuración del deployment.

---
