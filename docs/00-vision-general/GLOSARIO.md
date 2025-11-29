# GLOSARIO DE TERMINOS - GAMILIT

**Versión:** 1.0.0
**Fecha:** 2025-11-29
**Audiencia:** Todos (desarrolladores, PMs, stakeholders)

---

## Terminos de Gamificacion

### Economía del Juego

| Término | Definición |
|---------|------------|
| **XP (Experience Points)** | Puntos de experiencia que determinan el rango del usuario. Se obtienen al completar ejercicios. |
| **ML Coins (Monedas Lectoras)** | Moneda virtual para comprar comodines y ayudas. |
| **Rango Maya** | Nivel jerárquico del usuario basado en XP acumulado. 7 niveles: Novato → Leyenda. |
| **Streak (Racha)** | Días consecutivos de actividad o ejercicios correctos consecutivos. |
| **Leaderboard** | Tabla de posiciones que muestra rankings de usuarios por diferentes métricas. |

### Comodines (Power-ups)

| Término | Definición |
|---------|------------|
| **Comodín** | Ayuda que el usuario puede comprar con ML Coins y usar durante ejercicios. |
| **Pista (Hint)** | Revela parte de la respuesta correcta. |
| **Visión Lectora (Time Freeze)** | Congela el temporizador durante 30 segundos. |
| **Segunda Oportunidad (Retry)** | Permite reintentar un ejercicio sin penalización. |
| **Skip** | Permite saltar un ejercicio sin penalización de XP. |

### Progresión

| Término | Definición |
|---------|------------|
| **Achievement (Logro)** | Reconocimiento otorgado al cumplir condiciones específicas. |
| **Mission (Misión)** | Objetivo asignado al usuario (diaria, semanal, o especial). |
| **Module Progress** | Porcentaje de avance en un módulo educativo. |
| **Rank Up** | Subida de rango al alcanzar umbral de XP requerido. |

---

## Terminos Educativos

### Modelo Cassany

| Término | Definición |
|---------|------------|
| **Comprensión Literal** | Nivel básico: localizar información explícita en el texto. |
| **Comprensión Inferencial** | Segundo nivel: deducir información implícita del texto. |
| **Comprensión Crítica** | Tercer nivel: evaluar, juzgar y opinar sobre el texto. |
| **Comprensión Digital** | Cuarto nivel: interpretar textos multimodales y digitales. |
| **Producción Creativa** | Quinto nivel: crear contenido original basado en la lectura. |

### Tipos de Ejercicio

| Término | Definición |
|---------|------------|
| **exercise_type** | Tipo específico de ejercicio (ej: crucigrama, detective_textual). |
| **exercise_mechanic** | Mecánica de interacción del ejercicio (drag & drop, selección múltiple). |
| **Validador** | Función de BD que valida respuestas de un tipo de ejercicio específico. |

### Evaluación

| Término | Definición |
|---------|------------|
| **CEFR** | Common European Framework of Reference. Niveles: A1, A2, B1, B2, C1, C2. |
| **Taxonomía de Bloom** | Niveles cognitivos: Remember, Understand, Apply, Analyze, Evaluate, Create. |
| **Score** | Puntuación de 0-100 obtenida en un ejercicio. |
| **Grading** | Proceso de calificación (automático o manual por maestro). |

---

## Terminos Tecnicos

### Base de Datos

| Término | Definición |
|---------|------------|
| **Schema** | Agrupación lógica de objetos de BD (tablas, funciones, vistas). |
| **DDL (Data Definition Language)** | SQL para definir estructura (CREATE, ALTER, DROP). |
| **RLS (Row Level Security)** | Seguridad a nivel de fila en PostgreSQL. |
| **Trigger** | Función que se ejecuta automáticamente ante eventos de BD. |
| **ENUM** | Tipo de dato con valores predefinidos (ej: user_role). |
| **JSONB** | Tipo de dato JSON binario en PostgreSQL para datos flexibles. |
| **Materialized View** | Vista pre-computada para mejor performance. |
| **Seed** | Script de datos iniciales para poblar tablas. |
| **Carga Limpia** | Recreación completa de BD desde DDL y seeds (sin migrations). |

### Backend (NestJS)

| Término | Definición |
|---------|------------|
| **Entity** | Clase TypeScript que mapea a tabla de BD (TypeORM). |
| **DTO (Data Transfer Object)** | Objeto para validar y transferir datos entre capas. |
| **Service** | Clase con lógica de negocio. |
| **Controller** | Clase que maneja endpoints HTTP. |
| **Guard** | Middleware para autorización (ej: RolesGuard). |
| **Decorator** | Anotación que modifica comportamiento (ej: @Roles()). |
| **Module** | Unidad de organización en NestJS. |

### Frontend (React)

| Término | Definición |
|---------|------------|
| **Component** | Elemento de UI reutilizable. |
| **Hook** | Función para manejar estado y efectos (useEffect, useState). |
| **Store** | Estado global de la aplicación (Zustand). |
| **Feature** | Carpeta que agrupa funcionalidad relacionada. |
| **Page** | Componente que representa una ruta. |
| **API Client** | Servicio para comunicación con backend. |

### Arquitectura

| Término | Definición |
|---------|------------|
| **Monorepo** | Repositorio único que contiene múltiples proyectos. |
| **SSOT (Single Source of Truth)** | Fuente única de verdad para datos/definiciones. |
| **Multi-tenant** | Arquitectura que soporta múltiples organizaciones aisladas. |
| **Dual-Table Pattern** | Separación de workflow (submissions) y recompensas (attempts). |
| **Feature-Sliced Design** | Organización de código por funcionalidad, no por tipo. |

---

## Acronimos

| Acrónimo | Significado |
|----------|-------------|
| **GLIT** | GAMILIT (nombre corto) |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token (autenticación) |
| **CRUD** | Create, Read, Update, Delete |
| **RPC** | Remote Procedure Call |
| **ADR** | Architecture Decision Record |
| **MVP** | Minimum Viable Product |
| **QA** | Quality Assurance |
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **FE** | Frontend |
| **BE** | Backend |
| **DB** | Database |

---

## Roles de Usuario

| Rol | Definición | Permisos |
|-----|------------|----------|
| **student** | Estudiante que completa ejercicios | Ver módulos, completar ejercicios, ver progreso |
| **teacher** | Maestro que supervisa estudiantes | Crear tareas, ver progreso de alumnos, calificar |
| **admin_teacher** | Maestro con permisos administrativos | + Gestionar aulas, reportes |
| **admin_school** | Administrador de escuela | + Gestionar maestros, configuración |
| **super_admin** | Administrador de plataforma | Acceso total |

---

## Portales

| Portal | Audiencia | Funcionalidad Principal |
|--------|-----------|------------------------|
| **Student Portal** | Estudiantes | Ejercicios, progreso, gamificación |
| **Teacher Portal** | Maestros | Dashboard, tareas, calificación, alertas |
| **Admin Portal** | Administradores | Usuarios, organizaciones, sistema |
| **Parent Portal** | Padres (backlog) | Ver progreso de hijos |

---

## Estados de Ejercicio

| Estado | Contexto | Significado |
|--------|----------|-------------|
| **draft** | exercise_submissions | Guardado pero no enviado |
| **submitted** | exercise_submissions | Enviado, pendiente de calificación |
| **graded** | exercise_submissions | Calificado por maestro o sistema |
| **in_progress** | user_achievements | Logro parcialmente completado |
| **completed** | user_achievements | Logro completado, listo para reclamar |
| **claimed** | user_achievements | Recompensa reclamada |

---

## Schemas de Base de Datos

| Schema | Propósito |
|--------|-----------|
| **auth** | Autenticación Supabase (users base) |
| **auth_management** | Perfiles, roles, membresías, tenants |
| **educational_content** | Módulos, ejercicios, assignments |
| **gamification_system** | Achievements, rangos, ML coins, comodines |
| **progress_tracking** | Intentos, submissions, progreso de módulos |
| **social_features** | Escuelas, aulas, equipos, amistades |
| **notifications** | Notificaciones multi-canal |
| **content_management** | Templates, media, contenido Marie Curie |
| **audit_logging** | Logs y auditoría del sistema |
| **system_configuration** | Configuración, feature flags |
| **admin_dashboard** | Vistas para dashboard administrativo |
| **lti_integration** | Learning Tools Interoperability |
| **communication** | Mensajería maestro-estudiante |
| **gamilit** | Funciones globales y triggers |

---

**Última actualización:** 2025-11-29
**Mantenido por:** Architecture-Analyst
