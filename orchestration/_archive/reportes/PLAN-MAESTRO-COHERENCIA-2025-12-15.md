# PLAN MAESTRO - ANÁLISIS Y CORRECCIÓN DE COHERENCIA
## Sistema de Gamificación - GAMILIT

**Fecha Inicio:** 2025-12-15
**Responsable:** Tech-Leader
**Estado:** EN PROGRESO

---

## ÍNDICE DE FASES

| Fase | Nombre | Estado | Documento |
|------|--------|--------|-----------|
| 1 | Planeación del Análisis | ✅ COMPLETADO | FASE-1-PLAN-ANALISIS.md |
| 2 | Ejecución del Análisis | ✅ COMPLETADO | FASE-2-CONSOLIDADO-HALLAZGOS.md |
| 3 | Planeación de Implementaciones | ✅ COMPLETADO | FASE-3-PLAN-CORRECCIONES.md |
| 4 | Validación de Planeación | ✅ COMPLETADO | FASE-4-VALIDACION-DEPENDENCIAS.md |
| 5 | Ejecución de Implementaciones | ✅ COMPLETADO | Database ✅, Frontend ✅, Backend ✅ |
| 6 | Validación Profunda | ✅ COMPLETADO | FASE-6-VALIDACION-PROFUNDA.md |

---

## FASE 1: PLANEACIÓN DEL ANÁLISIS

### 1.1 Objetivo
Definir el alcance, objetos a analizar, relaciones a validar y criterios de aceptación para el análisis de coherencia.

### 1.2 Alcance del Análisis

#### 1.2.1 Capas a Analizar
```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPAS DEL SISTEMA                             │
├─────────────────────────────────────────────────────────────────┤
│  CAPA 1: DATABASE (PostgreSQL)                                   │
│  ├── DDL (schemas, tables, views, functions, triggers, enums)   │
│  ├── Seeds (dev, prod, staging)                                  │
│  └── Scripts (create, migrate, recreate)                        │
├─────────────────────────────────────────────────────────────────┤
│  CAPA 2: BACKEND (NestJS)                                        │
│  ├── Entities (TypeORM mappings)                                │
│  ├── Services (business logic, SQL queries)                     │
│  ├── DTOs (data transfer objects)                               │
│  ├── Constants (enums, database constants)                      │
│  └── Controllers (API endpoints)                                │
├─────────────────────────────────────────────────────────────────┤
│  CAPA 3: FRONTEND (React)                                        │
│  ├── Types (TypeScript interfaces)                              │
│  ├── API Services (HTTP calls)                                  │
│  ├── Stores (Zustand state management)                          │
│  └── Components (UI rendering)                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 1.2.2 Schemas de Base de Datos en Alcance
| Schema | Prioridad | Razón |
|--------|-----------|-------|
| gamification_system | P0 | Sistema de achievements en implementación |
| progress_tracking | P0 | Dependencia directa de achievements |
| auth_management | P1 | Profiles y tenants referenciados |
| educational_content | P1 | Modules y exercises referenciados |
| social_features | P1 | Classrooms para condiciones sociales |

#### 1.2.3 Módulos Backend en Alcance
| Módulo | Prioridad | Razón |
|--------|-----------|-------|
| gamification | P0 | AchievementsService, UserStatsEntity |
| progress | P0 | ExerciseAttemptService, ExerciseSubmissionService |
| auth | P1 | UserEntity |
| educational | P1 | ModulesService |

#### 1.2.4 Features Frontend en Alcance
| Feature | Prioridad | Razón |
|---------|-----------|-------|
| gamification/social | P0 | Achievements components |
| gamification/ranks | P0 | Rank system |
| gamification/economy | P1 | ML Coins |
| progress | P1 | Module progress |

### 1.3 Tipos de Validación

#### 1.3.1 Validaciones de Estructura
- [ ] DDL Columns vs Entity Fields (nombre, tipo, nullable, default)
- [ ] ENUM Values (DDL vs Backend vs Frontend)
- [ ] Foreign Keys (existencia de tablas/columnas referenciadas)
- [ ] Indexes (columnas existen en tabla)
- [ ] Constraints (CHECK, UNIQUE validez)

#### 1.3.2 Validaciones de Lógica
- [ ] Functions SQL (columnas referenciadas existen)
- [ ] Triggers (tablas y columnas referenciadas)
- [ ] RLS Policies (funciones helper existen)
- [ ] Seeds (FKs válidos, ENUMs válidos)

#### 1.3.3 Validaciones de Integración
- [ ] Backend Queries (columnas/tablas existen en DDL)
- [ ] Entity Relations (FKs válidas)
- [ ] Frontend Types vs Backend DTOs
- [ ] API Contracts consistency

### 1.4 Subagentes Requeridos

| Subagente | Especialidad | Fase de Uso |
|-----------|--------------|-------------|
| Database-Auditor | Análisis DDL, funciones SQL, seeds | Fase 2 |
| Backend-Auditor | Análisis entities, services, queries | Fase 2 |
| Frontend-Auditor | Análisis types, stores, API calls | Fase 2 |
| Architecture-Analyst | Análisis cross-capa, dependencias | Fase 2, 4 |
| Requirements-Analyst | Validación completitud | Fase 4 |

### 1.5 Entregables del Análisis

| Entregable | Descripción | Formato |
|------------|-------------|---------|
| MATRIZ-DDL-ENTITY.md | Comparación columna por columna | Tabla Markdown |
| MATRIZ-ENUM-ALIGNMENT.md | Comparación valores ENUM | Tabla Markdown |
| MATRIZ-FUNCTIONS-DEPENDENCIES.md | Dependencias de funciones SQL | Tabla + Diagrama |
| MATRIZ-SEEDS-VALIDATION.md | Validación de seeds | Tabla Markdown |
| MATRIZ-FRONTEND-BACKEND.md | Tipos Frontend vs Backend | Tabla Markdown |
| INVENTARIO-DISCREPANCIAS.yml | Lista estructurada de problemas | YAML |

### 1.6 Criterios de Aceptación

#### Para pasar a Fase 2:
- [ ] Alcance documentado y aprobado
- [ ] Subagentes identificados con prompts definidos
- [ ] Formato de entregables definido
- [ ] Criterios de severidad establecidos

#### Severidad de Hallazgos:
| Severidad | Criterio | Acción |
|-----------|----------|--------|
| P0-CRÍTICO | Errores que impiden funcionamiento | Corrección obligatoria |
| P1-ALTO | Errores que causan comportamiento incorrecto | Corrección recomendada |
| P2-MEDIO | Inconsistencias sin impacto funcional | Corrección opcional |
| P3-BAJO | Mejoras de alineación/documentación | Informativo |

---

## FASE 2: EJECUCIÓN DEL ANÁLISIS

### 2.1 Objetivo
Ejecutar el análisis según el plan de Fase 1 usando subagentes especializados.

### 2.2 Orden de Ejecución
1. Database-Auditor: Análisis completo de DDL
2. Backend-Auditor: Análisis de entities y services
3. Frontend-Auditor: Análisis de types y components
4. Architecture-Analyst: Análisis cross-capa

### 2.3 Entregables
- Matrices de comparación completadas
- Inventario de discrepancias actualizado
- Reporte consolidado de hallazgos

---

## FASE 3: PLANEACIÓN DE IMPLEMENTACIONES

### 3.1 Objetivo
Crear plan detallado de correcciones basado en hallazgos del análisis.

### 3.2 Estructura del Plan
Para cada corrección:
- ID único (CORR-XXX)
- Severidad (P0/P1/P2/P3)
- Descripción del problema
- Archivos a modificar
- Cambios específicos (antes/después)
- Dependencias (otras correcciones que deben ir primero)
- Impacto en otros componentes

### 3.3 Entregables
- PLAN-CORRECCIONES.md con todas las correcciones ordenadas
- Diagrama de dependencias entre correcciones
- Estimación de archivos impactados

---

## FASE 4: VALIDACIÓN DE PLANEACIÓN

### 4.1 Objetivo
Validar que el plan de correcciones sea completo y no falten dependencias.

### 4.2 Checklist de Validación
- [ ] Todas las discrepancias P0/P1 tienen corrección asignada
- [ ] Orden de ejecución respeta dependencias
- [ ] No hay ciclos en dependencias
- [ ] Todos los archivos impactados están identificados
- [ ] Seeds actualizados si es necesario
- [ ] Scripts de BD incluyen cambios
- [ ] No hay objetos huérfanos post-corrección

### 4.3 Entregables
- VALIDACION-PLAN.md con resultado de checklist
- Lista de gaps identificados (si hay)
- Plan actualizado con correcciones adicionales

---

## FASE 5: EJECUCIÓN DE IMPLEMENTACIONES

### 5.1 Objetivo
Ejecutar las correcciones según el plan validado.

### 5.2 Proceso
1. Crear backup de archivos a modificar
2. Ejecutar correcciones en orden de dependencias
3. Validar compilación (TypeScript, SQL syntax)
4. Ejecutar tests si existen
5. Documentar cambios realizados

### 5.3 Entregables
- Archivos corregidos
- REPORTE-EJECUCION.md con resumen de cambios
- Inventarios actualizados
- Changelog actualizado

---

## DOCUMENTOS RELACIONADOS

| Documento | Ubicación |
|-----------|-----------|
| Análisis previo | `COHERENCE-ANALYSIS-BD-BACKEND-FRONTEND-2025-12-15.md` |
| Implementación Achievements | `IMPL-ACHIEVEMENTS-2025-12-15.md` |
| Inventario Database | `inventarios/DATABASE_INVENTORY.yml` |
| Inventario Backend | `inventarios/BACKEND_INVENTORY.yml` |
| Inventario Frontend | `inventarios/FRONTEND_INVENTORY.yml` |

---

**Estado Actual:** FASE 1 - Planeación del Análisis
**Próximo Paso:** Definir prompts para subagentes y ejecutar análisis
