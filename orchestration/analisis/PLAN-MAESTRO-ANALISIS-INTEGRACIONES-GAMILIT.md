# PLAN MAESTRO DE ANALISIS DE INTEGRACIONES - GAMILIT

## Metadata

| Campo | Valor |
|-------|-------|
| **Version** | 1.0.0 |
| **Fecha** | 2026-01-10 |
| **Perfil Orquestador** | @PERFIL_ORQUESTADOR |
| **Directiva Base** | @TAREA + @CAPVED |
| **Proyecto** | GAMILIT v2.0 |
| **Estado** | EN_PROGRESO |

---

## 1. OBJETIVO GENERAL

Realizar un analisis exhaustivo y validacion completa de todas las integraciones del proyecto GAMILIT, comenzando desde la **Base de Datos**, propagandose al **Backend**, y finalmente al **Frontend**, asegurando:

1. **Consistencia de datos** entre capas (DDL ↔ Entities ↔ DTOs ↔ Types)
2. **Integridad referencial** en todas las relaciones
3. **Alineacion de documentacion** con la implementacion real
4. **Cumplimiento de estandares** SIMCO v3.8
5. **Trazabilidad completa** de dependencias

---

## 2. METODOLOGIA DE 7 FASES (F1-F7)

Cada tarea/modulo/funcionalidad seguira el siguiente ciclo:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CICLO DE 7 FASES POR TAREA                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  F1: ANALISIS INICIAL          → Entender alcance y contexto           │
│       ↓                                                                 │
│  F2: ANALISIS DETALLADO        → Mapear objetos y dependencias         │
│       ↓                                                                 │
│  F3: PLANEACION                → Disenar plan de validacion/cambios    │
│       ↓                                                                 │
│  F4: VALIDACION DE PLAN        → Verificar cumplimiento de requisitos  │
│       ↓                                                                 │
│  F5: REFINAMIENTO              → Ajustar plan segun hallazgos          │
│       ↓                                                                 │
│  F6: EJECUCION                 → Implementar cambios/validaciones      │
│       ↓                                                                 │
│  F7: VALIDACION DE EJECUCION   → Verificar resultado final             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 F1: ANALISIS INICIAL Y PLANEACION PARA ANALISIS DETALLADO

**Objetivo:** Comprender el alcance del modulo/funcionalidad antes del analisis profundo.

**Entregables:**
- [ ] Identificacion del modulo/funcionalidad objetivo
- [ ] Listado de archivos involucrados (estimado)
- [ ] Identificacion de capas afectadas (BD/Backend/Frontend)
- [ ] Dependencias conocidas (preliminar)
- [ ] Criterios de exito para el analisis

**Archivo de salida:** `F1-ANALISIS-INICIAL-{MODULO}-{FECHA}.md`

**Agente responsable:** @PERFIL_ORQUESTADOR o @PERFIL_ARCHITECT

---

### 2.2 F2: ANALISIS DETALLADO

**Objetivo:** Mapear exhaustivamente todos los objetos, relaciones y dependencias.

**Entregables:**
- [ ] Inventario completo de archivos por capa:
  - DDL (tablas, funciones, triggers, RLS)
  - Backend (entities, services, controllers, DTOs)
  - Frontend (types, hooks, components, pages)
- [ ] Matriz de dependencias cruzadas
- [ ] Inconsistencias detectadas
- [ ] Brechas entre documentacion y codigo
- [ ] Metricas del modulo (lineas, complejidad, coverage)

**Archivo de salida:** `F2-ANALISIS-DETALLADO-{MODULO}-{FECHA}.md`

**Agentes responsables:**
- BD: @PERFIL_DATABASE + @PERFIL_DATABASE_AUDITOR
- Backend: @PERFIL_BACKEND + @PERFIL_CODE_REVIEWER
- Frontend: @PERFIL_FRONTEND + @PERFIL_CODE_REVIEWER

---

### 2.3 F3: PLANEACION BASADA EN ANALISIS

**Objetivo:** Disenar plan de accion para resolver inconsistencias y validar integraciones.

**Entregables:**
- [ ] Lista de acciones correctivas priorizadas
- [ ] Estimacion de impacto por accion
- [ ] Secuencia de ejecucion (dependencias entre acciones)
- [ ] Recursos requeridos (agentes, herramientas)
- [ ] Criterios de aceptacion por accion

**Archivo de salida:** `F3-PLAN-DETALLADO-{MODULO}-{FECHA}.md`

**Agente responsable:** @PERFIL_ORQUESTADOR

---

### 2.4 F4: VALIDACION DE PLANEACION

**Objetivo:** Verificar que el plan cubre todos los requisitos del analisis.

**Entregables:**
- [ ] Checklist de cobertura (analisis vs plan)
- [ ] Validacion de dependencias entre archivos
- [ ] Analisis de archivos que seran modificados
- [ ] Impacto en archivos dependientes
- [ ] Riesgos identificados y mitigaciones

**Archivo de salida:** `F4-VALIDACION-PLAN-{MODULO}-{FECHA}.md`

**Agentes responsables:**
- @PERFIL_INTEGRATION_VALIDATOR
- @PERFIL_DOCUMENTATION_VALIDATOR

---

### 2.5 F5: REFINAMIENTO DEL PLAN

**Objetivo:** Ajustar el plan basado en la validacion y hallazgos adicionales.

**Entregables:**
- [ ] Plan refinado con ajustes
- [ ] Changelog de modificaciones al plan original
- [ ] Justificacion de cada cambio
- [ ] Plan final aprobado

**Archivo de salida:** `F5-REFINAMIENTO-PLAN-{MODULO}-{FECHA}.md`

**Agente responsable:** @PERFIL_ORQUESTADOR

---

### 2.6 F6: EJECUCION DEL PLAN

**Objetivo:** Implementar las acciones definidas en el plan refinado.

**Entregables:**
- [ ] Cambios implementados por capa
- [ ] Tests ejecutados y resultados
- [ ] Documentacion actualizada
- [ ] Inventarios actualizados
- [ ] Commits realizados (si aplica)

**Archivo de salida:** `F6-REPORTE-EJECUCION-{MODULO}-{FECHA}.md`

**Agentes responsables:** Segun dominio de la accion

---

### 2.7 F7: VALIDACION DE EJECUCION

**Objetivo:** Verificar que la ejecucion cumplio con todos los criterios de aceptacion.

**Entregables:**
- [ ] Checklist de criterios de aceptacion cumplidos
- [ ] Comparacion ANTES vs DESPUES
- [ ] Validacion de integridad entre capas
- [ ] Tests de regresion ejecutados
- [ ] Aprobacion final

**Archivo de salida:** `F7-VALIDACION-EJECUCION-{MODULO}-{FECHA}.md`

**Agentes responsables:**
- @PERFIL_TESTING
- @PERFIL_INTEGRATION_VALIDATOR

---

## 3. ESTRUCTURA DE CAPAS Y PROPAGACION

### 3.1 Flujo de Analisis (Bottom-Up)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE PROPAGACION                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   CAPA 1: BASE DE DATOS (PostgreSQL)                                   │
│   ├── Schemas (9): auth_management, educational_content, etc.          │
│   ├── Tablas (44): DDL completo                                        │
│   ├── Funciones (50+): PL/pgSQL                                        │
│   ├── Triggers (35+): Automatizaciones                                 │
│   └── RLS (159): Politicas de seguridad                                │
│       │                                                                 │
│       ▼                                                                 │
│   CAPA 2: BACKEND (NestJS/Express)                                     │
│   ├── Entities: Mapeo de tablas                                        │
│   ├── Services (13): Logica de negocio                                 │
│   ├── Controllers: Endpoints (470+)                                    │
│   ├── DTOs: Validacion de datos                                        │
│   └── Guards/Interceptors: Seguridad                                   │
│       │                                                                 │
│       ▼                                                                 │
│   CAPA 3: FRONTEND (React)                                             │
│   ├── Types: Sincronizados con DTOs                                    │
│   ├── Services/API: Clientes HTTP                                      │
│   ├── Hooks (40+): Logica reutilizable                                 │
│   ├── Components (180+): UI                                            │
│   └── Pages: Vistas completas                                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Puntos de Integracion Criticos

| Capa Origen | Capa Destino | Punto de Integracion | Validacion Requerida |
|-------------|--------------|---------------------|----------------------|
| DDL | Backend Entity | Nombres de columnas | Exactitud 1:1 |
| DDL | Backend Entity | Tipos de datos | Mapeo TypeScript ↔ PostgreSQL |
| DDL FK | Backend Relations | Relaciones | OneToMany, ManyToOne |
| DDL RLS | Backend Guards | Politicas de seguridad | Consistencia |
| Backend DTO | Frontend Type | Estructura de datos | Sincronizacion |
| Backend Route | Frontend API | Endpoints | URLs y metodos |
| Backend Response | Frontend Hook | Datos retornados | Tipado correcto |

---

## 4. MODULOS A ANALIZAR

### 4.1 Modulos por Schema de BD

| # | Schema | Modulo Backend | Feature Frontend | Prioridad |
|---|--------|---------------|------------------|-----------|
| 1 | auth_management | auth | auth | CRITICA |
| 2 | educational_content | educational | exercises | CRITICA |
| 3 | gamification_system | gamification | gamification | ALTA |
| 4 | progress_tracking | progress | progress | ALTA |
| 5 | social_features | social | - | MEDIA |
| 6 | content_management | content | content | MEDIA |
| 7 | audit_logging | - | - | BAJA |
| 8 | notifications | notifications | notifications | MEDIA |
| 9 | system_configuration | admin | admin | ALTA |

### 4.2 Epicas de Documentacion (Fase Alcance Inicial)

| # | Epica | Descripcion | Estado | Prioridad |
|---|-------|-------------|--------|-----------|
| 1 | EAI-001 | Fundamentos | Completo | CRITICA |
| 2 | EAI-002 | Actividades | Completo | CRITICA |
| 3 | EAI-003 | Gamificacion | Completo | ALTA |
| 4 | EAI-004 | Analytics | Completo | MEDIA |
| 5 | EAI-005 | Admin Base | Completo | ALTA |
| 6 | EAI-006 | Config Sistema | Completo | MEDIA |
| 7 | EAI-007 | Modulos M4-M5 | En progreso | ALTA |
| 8 | EAI-008 | Portal Admin | Completo | ALTA |

---

## 5. TAREAS INICIALES (Generacion Automatica)

### 5.1 TAREA-001: Validacion Schema auth_management

**Objetivo:** Analizar y validar integracion completa del modulo de autenticacion.

**Alcance:**
- DDL: Schema auth_management (12 tablas)
- Backend: Modulo auth (login, registro, JWT, refresh)
- Frontend: Feature auth (login, registro, recovery)

**Fases:**
- F1: Mapear estructura actual
- F2: Inventariar tablas, entities, types
- F3: Plan de validacion
- F4-F7: Ciclo completo

---

### 5.2 TAREA-002: Validacion Schema educational_content

**Objetivo:** Analizar integracion del contenido educativo (27 mecanicas).

**Alcance:**
- DDL: Schema educational_content (8 tablas)
- Backend: Modulo educational (ejercicios, modulos)
- Frontend: Feature exercises (27 mecanicas)

---

### 5.3 TAREA-003: Validacion Schema gamification_system

**Objetivo:** Analizar sistema de gamificacion (rangos, coins, achievements).

**Alcance:**
- DDL: Schema gamification_system (13 tablas)
- Backend: Modulo gamification
- Frontend: Feature gamification

---

### 5.4 TAREA-004: Validacion Schema progress_tracking

**Objetivo:** Analizar tracking de progreso de estudiantes.

**Alcance:**
- DDL: Schema progress_tracking (6 tablas)
- Backend: Modulo progress
- Frontend: Feature progress

---

## 6. MATRIZ DE DEPENDENCIAS ENTRE TAREAS

```
TAREA-001 (auth) ──────────────────────────────────────────────┐
     │                                                          │
     ▼                                                          │
TAREA-002 (educational) ─────────────────────────┐              │
     │                                            │              │
     ▼                                            ▼              │
TAREA-003 (gamification) ◄──── TAREA-004 (progress)             │
     │                              │                           │
     └──────────────────────────────┴───────────────────────────┘
                                    │
                                    ▼
                        TAREA-005 (social_features)
                                    │
                                    ▼
                        TAREA-006 (notifications)
                                    │
                                    ▼
                        TAREA-007 (admin/config)
```

---

## 7. ARCHIVOS DE SOPORTE

### 7.1 Inventarios Requeridos

| Inventario | Ubicacion | Estado |
|------------|-----------|--------|
| DATABASE_INVENTORY.yml | orchestration/inventarios/ | Por crear |
| BACKEND_INVENTORY.yml | orchestration/inventarios/ | Por crear |
| FRONTEND_INVENTORY.yml | orchestration/inventarios/ | Por crear |
| DEPENDENCIES_MATRIX.yml | orchestration/inventarios/ | Por crear |

### 7.2 Trazas de Tareas

| Traza | Ubicacion | Estado |
|-------|-----------|--------|
| TRAZA-TAREAS-DATABASE.md | orchestration/trazas/ | Por crear |
| TRAZA-TAREAS-BACKEND.md | orchestration/trazas/ | Por crear |
| TRAZA-TAREAS-FRONTEND.md | orchestration/trazas/ | Por crear |
| TRAZA-INTEGRACIONES.md | orchestration/trazas/ | Por crear |

---

## 8. CRITERIOS DE EXITO GLOBAL

### 8.1 Metricas de Cobertura

| Metrica | Objetivo | Actual |
|---------|----------|--------|
| Tablas validadas | 44/44 (100%) | 0/44 |
| Entities alineadas | 44/44 (100%) | Por medir |
| Types sincronizados | 100% | Por medir |
| Endpoints documentados | 470/470 (100%) | Por medir |
| Tests coverage | 70% | 14% |

### 8.2 Checklist de Validacion Global

- [ ] Todas las tablas tienen Entity correspondiente
- [ ] Todos los ENUMs sincronizados (BD ↔ Backend ↔ Frontend)
- [ ] Todas las relaciones FK mapeadas correctamente
- [ ] RLS policies consistentes con Guards
- [ ] DTOs validan todos los campos
- [ ] Types de Frontend reflejan DTOs
- [ ] Endpoints documentados en Swagger
- [ ] _MAP.md actualizados en todas las carpetas
- [ ] Inventarios YAML completos
- [ ] Tests cubren paths criticos

---

## 9. PROXIMOS PASOS

1. **INMEDIATO:** Iniciar TAREA-001 (auth_management) con F1
2. **PARALELO:** Crear inventarios base por capa
3. **CONTINUO:** Documentar hallazgos en trazas
4. **VALIDACION:** Ejecutar @SYNC_BD para verificar alineacion

---

## 10. ANEXOS

### 10.1 Referencias a Directivas SIMCO

| Alias | Directiva | Uso |
|-------|-----------|-----|
| @SYNC_BD | SIMCO-SINCRONIZACION-BD.md | Validar BD ↔ Codigo ↔ Docs |
| @ALINEACION | SIMCO-ALINEACION.md | DDL ↔ Entity ↔ DTO |
| @INVENTARIOS | SIMCO-INVENTARIOS.md | Crear inventarios YAML |
| @CHK_SYNC_BD | CHECKLIST-SINCRONIZACION-BD.md | 70 items de validacion |

### 10.2 Perfiles de Agentes Asignados

| Perfil | Responsabilidad en este Plan |
|--------|------------------------------|
| @PERFIL_ORQUESTADOR | Coordinacion general, F1, F3, F5 |
| @PERFIL_DATABASE | Analisis DDL, F2, F6 (BD) |
| @PERFIL_BACKEND | Analisis Backend, F2, F6 (Backend) |
| @PERFIL_FRONTEND | Analisis Frontend, F2, F6 (Frontend) |
| @PERFIL_INTEGRATION_VALIDATOR | F4, F7 |
| @PERFIL_TESTING | F7 |

---

**Documento generado por:** ORQUESTADOR
**Fecha de creacion:** 2026-01-10
**Proxima revision:** Despues de completar TAREA-001
