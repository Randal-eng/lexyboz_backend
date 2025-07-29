# Tareas de Documentación Pendientes

Esta es una lista de las tareas de documentación recomendadas para completar en el proyecto `lexyboz`.

## 1. Completar Documentación de la API (Swagger)

Debes documentar todos los endpoints en tus archivos de rutas para que aparezcan en la página de Swagger (`/api-docs`).

- [x] Documentar `auth.routes.js`
- [x] Documentar `admin.routes.js`
- [x] Documentar `cita.routes.js`
- [x] Documentar `doctorPaciente.routes.js`
- [x] Documentar `kit.routes.js`
- [x] Documentar `kitsAsignados.routes.js`
- [x] Documentar `ejerciciosKits.routes.js`
- [x] Documentar todos los archivos de rutas de `ejercicios`
- [x] Documentar todos los archivos de rutas de `resultados`

**Ejemplo de cómo documentar una ruta (en `auth.routes.js`):**
```javascript
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               // Define aquí las propiedades que esperas en el body
 *               // Ejemplo:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *               contraseña:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en la solicitud
 */
router.post('/auth/register', authController.registerUser);
```

## 2. Completar Documentación a Nivel de Código (JSDoc)

Añade comentarios JSDoc a las funciones y métodos importantes en tus controladores y modelos para explicar su funcionamiento, parámetros y lo que retornan.

- [ ] Documentar controladores en `src/modules/auth/controllers/`
- [ ] Documentar controladores en `src/modules/citas/controllers/`
- [ ] Documentar controladores en `src/modules/ejercicios/controllers/`
- [ ] Documentar controladores en `src/modules/kits/controllers/`
- [ ] Documentar controladores en `src/modules/resultados/controllers/`
- [ ] Documentar los modelos en `src/modules/**/models/`

**Ejemplo de cómo documentar una función (en `authController.js`):**
```javascript
/**
 * Autentica a un usuario existente.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} req.body - El cuerpo con el correo y la contraseña.
 * @param {string} req.body.correo - Correo del usuario.
 * @param {string} req.body.contraseña - Contraseña del usuario.
 * @param {object} res - El objeto de respuesta de Express.
 * @returns {object} Retorna un mensaje de éxito y el usuario (sin contraseña) o un mensaje de error.
 */
const loginUser = async (req, res) => {
  // ... lógica de la función
};
```

## 3. Completar el Archivo `README.md`

Edita el archivo `README.md` para proporcionar una descripción más completa y detallada de tu proyecto.

- [ ] Añadir una descripción detallada del proyecto `lexyboz`.
- [ ] Verificar que las instrucciones de instalación y uso son correctas y están completas.
- [ ] Añadir cualquier otra sección que consideres importante (por ejemplo, "Estructura del Proyecto", "Variables de Entorno", etc.).
