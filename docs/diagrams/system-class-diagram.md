# System diagrams for lexyboz_backend

Below are two Mermaid diagrams you can view directly in GitHub or VS Code Markdown Preview.

## High-level module view

```mermaid
flowchart LR
  subgraph API[Express API]
    AUTH[auth]
    CITAS[citas]
    EJERCICIOS[ejercicios]
    KITS[kits]
    ASIGN[kitsAsignados]
    REACTIVOS[reactivos]
    TIPOS[tipos]
    SUBTIPOS[subtipos]
  end

  AUTH --> DB[(PostgreSQL)]
  CITAS --> DB
  EJERCICIOS --> DB
  KITS --> DB
  ASIGN --> DB
  REACTIVOS --> DB
  TIPOS --> DB
  SUBTIPOS --> DB

  KITS -- uses --> EJERCICIOS
  EJERCICIOS -- uses --> REACTIVOS
  REACTIVOS -- categorised by --> SUBTIPOS
  SUBTIPOS -- belongs to --> TIPOS
  CITAS -- link --> AUTH
  ASIGN -- assigns --> KITS
```

## Entity-Relationship (ER) diagram

```mermaid
erDiagram
  USUARIO {
    int usuario_id PK
    string nombre
    string correo
    string contrasenia
    date fecha_de_nacimiento
    string numero_telefono
    string sexo
    string tipo  "Usuario | Doctor | Paciente"
    string imagen_url
    string imagen_id
    string domicilio
    string codigo_postal
    string reset_token
    datetime reset_token_expiry
  }

  DOCTOR {
    int doctor_id PK
    int usuario_id FK
    string especialidad
    string domicilio
    string codigo_postal
  }

  PACIENTE {
    int paciente_id PK
    int usuario_id FK
    string escolaridad
    string domicilio
    string codigo_postal
    bool is_active
  }

  DOCTOR_PACIENTE {
    int doctor_id FK
    int paciente_id FK
  }

  CITAS {
    int cita_id PK
    int doctor_id FK
    int paciente_id FK
    datetime fecha_cita
    string estado "Programada|Completada|Cancelada|Reprogramada"
  }

  SOLICITUD_VINCULACION {
    int id PK
    int usuario_id FK
    int doctor_id FK
    string estado "pendiente|aceptada|rechazada"
    string mensaje
    datetime fecha_solicitud
    datetime fecha_respuesta
    string respondido_por
  }

  TIPOS {
    int id_tipo PK
    string tipo_nombre
    datetime created_at
    datetime updated_at
  }

  SUB_TIPO {
    int id_sub_tipo PK
    int tipo FK
    string sub_tipo_nombre
    datetime created_at
    datetime updated_at
  }

  EJERCICIOS {
    int ejercicio_id PK
    string titulo
    string descripcion
    int creado_por FK
    int tipo_ejercicio FK
    datetime created_at
    datetime updated_at
    bool activo
  }

  EJERCICIO_REACTIVOS {
    int ejercicio_id FK
    int reactivo_id FK
    int orden
    bool activo
    datetime fecha_actualizacion
  }

  KITS {
    int kit_id PK
    string name
    string descripcion
    int creado_por FK
    datetime fecha_creacion
    datetime updated_at
    bool activo
    string imagen_portada
  }

  EJERCICIOS_KITS {
    int kit_id FK
    int ejercicio_id FK
    int orden_en_kit
    bool activo
    datetime fecha_actualizacion
  }

  KITS_ASIGNADOS {
    int id PK
    int kit_id FK
    int paciente_id FK
    datetime fecha_asignacion
    string estado "pendiente|en_progreso|completado"
  }

  REACTIVO_LECTURA_PSEUDOPALABRAS {
    int id_reactivo PK
    string pseudopalabra
    int id_sub_tipo FK
    int tiempo_duracion
    datetime created_at
    datetime updated_at
  }

  REACTIVO_IMAGEN_CORRECTA {
    int id_reactivo PK
    int id_sub_tipo FK
    int tiempo_duracion
    string oracion
  }

  IMAGENES {
    int imagen_id PK
    int reactivo_id FK
    string imagen_url
    bool es_correcta
  }

  RESULTADOS_LECTURA_PSEUDOPALABRAS {
    int resultado_id PK
    int usuario_id FK
    int id_reactivo FK
    string voz_usuario_url
    int tiempo_respuesta
    bool es_correcto
    datetime fecha_realizacion
  }

  RESULTADOS_ESCOGER_IMAGEN_CORRECTA {
    int resultado_reactivo_usuario_id PK
    int usuario_id FK
    int id_reactivo FK
    int imagen_seleccionada_id FK
    datetime tiempo_inicio_reactivo
    datetime tiempo_terminar_reactivo
  }

  USUARIO ||--o{ DOCTOR : "tiene"
  USUARIO ||--o{ PACIENTE : "tiene"

  DOCTOR ||--o{ DOCTOR_PACIENTE : "vincula"
  PACIENTE ||--o{ DOCTOR_PACIENTE : "vincula"

  DOCTOR ||--o{ CITAS : "atiende"
  PACIENTE ||--o{ CITAS : "agenda"

  USUARIO ||--o{ SOLICITUD_VINCULACION : "envia"
  DOCTOR ||--o{ SOLICITUD_VINCULACION : "recibe"

  TIPOS ||--o{ SUB_TIPO : "agrupa"
  SUB_TIPO ||--o{ REACTIVO_LECTURA_PSEUDOPALABRAS : "clasifica"
  SUB_TIPO ||--o{ REACTIVO_IMAGEN_CORRECTA : "clasifica"

  USUARIO ||--o{ EJERCICIOS : "crea"
  TIPOS ||--o{ EJERCICIOS : "tipo"

  EJERCICIOS ||--o{ EJERCICIO_REACTIVOS : "contiene"
  REACTIVO_LECTURA_PSEUDOPALABRAS ||--o{ EJERCICIO_REACTIVOS : "incluido"
  REACTIVO_IMAGEN_CORRECTA ||--o{ EJERCICIO_REACTIVOS : "incluido"

  KITS ||--o{ EJERCICIOS_KITS : "incluye"
  EJERCICIOS ||--o{ EJERCICIOS_KITS : "pertenece"

  USUARIO ||--o{ KITS : "crea"
  KITS ||--o{ KITS_ASIGNADOS : "asignado"
  USUARIO ||--o{ KITS_ASIGNADOS : "recibe"

  REACTIVO_IMAGEN_CORRECTA ||--o{ IMAGENES : "tiene"

  USUARIO ||--o{ RESULTADOS_LECTURA_PSEUDOPALABRAS : "realiza"
  REACTIVO_LECTURA_PSEUDOPALABRAS ||--o{ RESULTADOS_LECTURA_PSEUDOPALABRAS : "evalua"

  USUARIO ||--o{ RESULTADOS_ESCOGER_IMAGEN_CORRECTA : "realiza"
  REACTIVO_IMAGEN_CORRECTA ||--o{ RESULTADOS_ESCOGER_IMAGEN_CORRECTA : "evalua"
  IMAGENES ||--o{ RESULTADOS_ESCOGER_IMAGEN_CORRECTA : "seleccion"
```

Notes:
- Some column names may vary slightly in your DB; this reflects what the code references today.
- Table and relationship names are uppercased here for readability; your physical names use snake_case.
- If you want PNG/SVG export, you can use the Mermaid CLI or VS Code Mermaid extension to render.
