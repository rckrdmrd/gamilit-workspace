# Glosario de Terminos - GAMILIT

**Version:** 2.0.0
**Fecha:** 2026-02-11
**Audiencia:** Todos (desarrolladores, PMs, stakeholders)
**SSOT:** orchestration/inventarios/MASTER_INVENTORY.yml

---

## Terminos de Gamificacion

### Economia del Juego

| Termino | Definicion |
|---------|------------|
| **XP (Experience Points)** | Puntos de experiencia que determinan el rango del usuario. Se obtienen al completar ejercicios. |
| **ML Coins (Maya Literacy Coins)** | Moneda virtual para comprar power-ups y items en la tienda. |
| **Rango Maya** | Nivel jerarquico del usuario basado en XP acumulado. 5 niveles: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan. |
| **Streak (Racha)** | Dias consecutivos de actividad o ejercicios correctos consecutivos. |
| **Leaderboard** | Tabla de posiciones con rankings por aula, escuela, global y por modulo. |
| **Temporada** | Periodo de competencia con reset de rankings y recompensas de cierre. |
| **Multiplicador** | Factor aplicado a earnings de ML Coins segun rango actual (1.00x a 1.25x). |

### Rangos Maya (5 Niveles — DB Seeds v2.1)

| Nivel | Rango | Titulo Maya | XP Min | XP Max | ML Bonus | Multiplicador |
|-------|-------|-------------|--------|--------|----------|---------------|
| 1 | Senor | Ajaw (Senor) | 0 | 499 | - | 1.00x |
| 2 | Capitan de Guerra | Nacom (Capitan de Guerra) | 500 | 999 | +100 ML | 1.10x |
| 3 | Sacerdote del Sol | Ah K'in (Sacerdote del Sol) | 1,000 | 1,499 | +250 ML | 1.15x |
| 4 | Hombre Verdadero | Halach Uinic (Hombre Verdadero) | 1,500 | 1,899 | +500 ML | 1.20x |
| 5 | Serpiente Emplumada | K'uk'ulkan (Serpiente Emplumada) | 1,900 | - | +1,000 ML | 1.25x |

### Power-ups (Comodines)

| Termino | Definicion | Costo |
|---------|------------|-------|
| **Pista (Hint)** | Revela parte de la respuesta correcta. | 15 ML Coins |
| **Vision Lectora** | Congela el temporizador durante 30 segundos. | 25 ML Coins |
| **Segunda Oportunidad** | Permite reintentar un ejercicio sin penalizacion. | 40 ML Coins |

### Progresion

| Termino | Definicion |
|---------|------------|
| **Achievement (Logro)** | Reconocimiento otorgado al cumplir condiciones especificas. 6 categorias: Progress, Streak, Completion, Mastery, Exploration, Special. |
| **Mission (Mision)** | Objetivo asignado al usuario: diarias (3/dia), semanales (5/semana), o quests especiales. |
| **Module Progress** | Porcentaje de avance en un modulo educativo. 70% minimo para desbloquear siguiente. |
| **Rank Up** | Subida de rango al alcanzar umbral de XP requerido. |

---

## Terminos Educativos

### Modelo de Comprension Lectora (5 Dimensiones)

| Termino | Definicion |
|---------|------------|
| **Comprension Literal** | Nivel basico: localizar informacion explicita en el texto. (Modulo 1, 5 ejercicios) |
| **Comprension Inferencial** | Segundo nivel: deducir informacion implicita del texto. (Modulo 2, 5 ejercicios) |
| **Comprension Critica** | Tercer nivel: evaluar, juzgar y opinar sobre el texto. (Modulo 3, 5 ejercicios) |
| **Lectura Digital** | Cuarto nivel: interpretar textos multimodales y digitales. (Modulo 4, 5 ejercicios) |
| **Produccion y Expresion** | Quinto nivel: crear contenido original basado en la lectura. (Modulo 5, 3 ejercicios) |

### Tipos de Ejercicio

| Termino | Definicion |
|---------|------------|
| **exercise_type** | Tipo especifico de ejercicio (ej: crucigrama, detective_textual). 23 tipos en total. |
| **exercise_mechanic** | Mecanica de interaccion del ejercicio (drag & drop, seleccion multiple). 30 mecanicas. |
| **Evaluacion Automatica** | Ejercicios evaluados por el sistema (M1, M2, Quiz TikTok de M4). |
| **Evaluacion Manual** | Ejercicios que requieren revision por maestro (M3, M4 parcial, M5). |
| **Spaced Repetition** | Motor de repeticion espaciada para reforzar aprendizaje. |

### Evaluacion

| Termino | Definicion |
|---------|------------|
| **Score** | Puntuacion de 0-100 obtenida en un ejercicio. |
| **Grading** | Proceso de calificacion (automatico o manual por maestro). |
| **Rubrica** | Criterios de evaluacion usados por maestros en revision manual. |

---

## Terminos Tecnicos

### Base de Datos

| Termino | Definicion |
|---------|------------|
| **Schema** | Agrupacion logica de objetos de BD (tablas, funciones, vistas). 18 schemas en gamilit. |
| **DDL (Data Definition Language)** | SQL para definir estructura (CREATE, ALTER, DROP). |
| **RLS (Row Level Security)** | Seguridad a nivel de fila en PostgreSQL. 207 policies activas. |
| **Trigger** | Funcion que se ejecuta automaticamente ante eventos de BD. 67 triggers. |
| **ENUM** | Tipo de dato con valores predefinidos (ej: user_role). 40 ENUMs. |
| **JSONB** | Tipo de dato JSON binario en PostgreSQL para datos flexibles. |
| **Materialized View** | Vista pre-computada para mejor performance. 7 MVs. |
| **Seed** | Script de datos iniciales para poblar tablas. |
| **Clean Load** | Recreacion completa de BD desde DDL y seeds (sin migrations). |

### Backend (NestJS 11)

| Termino | Definicion |
|---------|------------|
| **Entity** | Clase TypeScript que mapea a tabla de BD (TypeORM). 152 entities. |
| **DTO (Data Transfer Object)** | Objeto para validar y transferir datos entre capas. 399 DTOs. |
| **Service** | Clase con logica de negocio. 170 services. |
| **Controller** | Clase que maneja endpoints HTTP. 107 controllers. |
| **Guard** | Middleware para autorizacion (ej: JwtAuthGuard, RolesGuard, TenantGuard). 15 guards. |
| **Decorator** | Anotacion que modifica comportamiento (ej: @Roles()). 18 decorators. |
| **Module** | Unidad de organizacion en NestJS. 22 modulos. |

### Frontend (React 19)

| Termino | Definicion |
|---------|------------|
| **Component** | Elemento de UI reutilizable. 475 componentes. |
| **Hook** | Funcion para manejar estado y efectos. 102 hooks. |
| **Store** | Estado global de la aplicacion (Zustand). 14 stores. |
| **Page** | Componente que representa una ruta. 68 paginas. |
| **API Service** | Servicio para comunicacion con backend. 52 API services. |

### Arquitectura

| Termino | Definicion |
|---------|------------|
| **Monorepo** | Repositorio unico que contiene backend, frontend y database. |
| **SSOT (Single Source of Truth)** | Fuente unica de verdad para datos/definiciones. |
| **Multi-tenant** | Arquitectura que soporta multiples escuelas aisladas via RLS. |
| **Strategy+Factory** | Patrones usados en el motor de evaluacion de ejercicios. |

---

## Terminos de Gobernanza (SIMCO)

| Termino | Definicion |
|---------|------------|
| **SIMCO** | Sistema Integral de Mando y Control. Directivas para agentes IA (v4.0.0). |
| **CAPVED** | Ciclo de vida: Contexto, Analisis, Planificacion, Validacion, Ejecucion, Documentacion. |
| **NEXUS** | Sistema de gestion de contexto de 4 niveles (L0-L3) para modelos IA (v4.1). |
| **SAAD** | Sistema de Activacion Automatica de Directivas (v1.0.0). |
| **Perfil de Agente** | Definicion de herramientas, dominio y directivas para un tipo de agente IA. 35 perfiles. |
| **Trigger** | Verificacion automatica que se activa pre/post tarea. 11 triggers. |
| **Inventario** | Archivo YAML con conteo y estado de artefactos por capa. 4 inventarios principales. |
| **Traza** | Log de ejecucion de tareas por dominio (database, backend, frontend). |

---

## Acronimos

| Acronimo | Significado |
|----------|-------------|
| **GLIT** | GAMILIT (nombre corto) |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token (autenticacion) |
| **CRUD** | Create, Read, Update, Delete |
| **RLS** | Row Level Security |
| **ADR** | Architecture Decision Record |
| **MVP** | Minimum Viable Product |
| **SIMCO** | Sistema Integral de Mando y Control |
| **CAPVED** | Contexto, Analisis, Planificacion, Validacion, Ejecucion, Documentacion |
| **NEXUS** | Sistema de gestion de contexto para agentes IA |
| **SAAD** | Sistema de Activacion Automatica de Directivas |
| **SSOT** | Single Source of Truth |
| **SP** | Story Points |
| **FE** | Frontend |
| **BE** | Backend |
| **DB** | Database |

---

## Roles de Usuario

| Rol | Definicion | Portal |
|-----|------------|--------|
| **student** | Estudiante que completa ejercicios | Portal Estudiante |
| **teacher** | Maestro que supervisa estudiantes | Portal Maestro |
| **admin** | Administrador de escuela/plataforma | Portal Admin |
| **parent** | Padre/tutor de estudiante | Portal Padres |

---

## Portales

| Portal | Audiencia | Completitud | Funcionalidad Principal |
|--------|-----------|-------------|------------------------|
| **Student Portal** | Estudiantes | ~100% | Ejercicios, progreso, gamificacion |
| **Teacher Portal** | Maestros | ~95% | Dashboard, asignacion, calificacion, alertas |
| **Admin Portal** | Administradores | ~90% | Usuarios, organizaciones, contenido, sistema |
| **Parent Portal** | Padres | 100% | Progreso de hijos, notificaciones, comunicacion |

---

## Schemas de Base de Datos (18)

| Schema | Proposito |
|--------|-----------|
| **auth_management** | Usuarios, perfiles, roles, membresías, tenants |
| **educational_content** | Modulos, ejercicios, assignments |
| **gamification_system** | Achievements, rangos, ML coins, comodines |
| **progress_tracking** | Intentos, submissions, progreso de modulos |
| **social_features** | Escuelas, aulas, equipos, amistades, guilds |
| **notifications** | Notificaciones multi-canal |
| **content_management** | Templates, media, contenido educativo |
| **audit_logging** | Logs y auditoria del sistema |
| **system_configuration** | Configuracion, feature flags |
| **admin_dashboard** | Vistas para dashboard administrativo |
| **lti_integration** | Learning Tools Interoperability |
| **communication** | Mensajeria maestro-padre |
| **store_system** | Tienda virtual, items, transacciones |
| **missions_system** | Misiones diarias, semanales, quests |
| **leaderboard_system** | Rankings, temporadas |
| **reports_system** | Reportes, exportaciones |
| **gamilit** | Funciones globales y triggers |
| **public** | Schema por defecto PostgreSQL |

---

*GAMILIT - Glosario de Terminos*
*Actualizado: 2026-02-11*
