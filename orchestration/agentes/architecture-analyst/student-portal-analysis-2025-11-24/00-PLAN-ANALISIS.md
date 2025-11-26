# Plan de Análisis - Portal de Estudiantes (Student)

**Fecha:** 2025-11-24
**Agente:** Architecture-Analyst
**Tipo:** Análisis de Coherencia y Estado de Desarrollo
**Alcance:** Portal Student completo (Frontend + Backend + Database)

---

## 🎯 OBJETIVO

Realizar un análisis exhaustivo del estado actual del portal de estudiantes para identificar:
1. **Funcionalidades implementadas vs documentadas**
2. **Datos hardcodeados vs consumo real de backend/BD**
3. **Gaps de implementación** (funcionalidades pendientes)
4. **Coherencia entre capas** (Frontend ↔ Backend ↔ Database)
5. **Estado de features críticas:**
   - Misiones (missions)
   - Actividades (activities)
   - Validación de rangos (rank progression)
   - Ejercicios completados (exercises)
   - Configuración de perfil (profile settings)
   - Sistema de recompensas (rewards)
   - Progreso del estudiante (progress tracking)

---

## 📋 ESTRATEGIA DE ANÁLISIS

### FASE 1: EXPLORACIÓN PARALELA (Agentes Independientes)

Lanzar 4 agentes en paralelo para maximizar eficiencia:

#### **Agente 1: Explore-Frontend-Student**
- **Tipo:** Explore Agent (subagent_type: "Explore")
- **Objetivo:** Mapear estructura completa del frontend student
- **Búsqueda:**
  - Páginas principales (`apps/frontend/src/apps/student/pages/`)
  - Componentes específicos (`apps/frontend/src/apps/student/components/`)
  - Features/módulos de student
  - Stores/estado global relacionado
  - Servicios API y llamadas al backend
  - Tipos TypeScript para student
- **Entregable:** Lista completa de archivos con descripción de responsabilidad

#### **Agente 2: Analyze-Frontend-Implementation**
- **Tipo:** General-purpose (actuar como Frontend-Agent)
- **Objetivo:** Analizar implementaciones concretas de features student
- **Análisis específico:**
  - ¿Cómo se obtienen las misiones? (API call vs hardcoded)
  - ¿Cómo se muestran actividades? (datos reales vs mock)
  - ¿Cómo se valida progreso de rangos? (lógica local vs backend)
  - ¿Perfil de usuario consume API o datos estáticos?
  - ¿Ejercicios se conectan a backend o están simulados?
  - Estado de componentes: completos, parciales, stubs
- **Entregable:** Reporte de implementación por feature con evidencia de código

#### **Agente 3: Analyze-Backend-Student-APIs**
- **Tipo:** General-purpose (actuar como Backend-Agent)
- **Objetivo:** Validar endpoints y servicios backend para student
- **Análisis específico:**
  - Endpoints disponibles para student (`/student/*`, `/missions/*`, etc.)
  - Services implementados (MissionsService, ActivitiesService, etc.)
  - Entities relacionadas con student
  - DTOs para comunicación frontend-backend
  - Validación de lógica de negocio (rank progression, rewards)
  - Controllers y sus métodos
  - Autenticación y autorización para student
- **Entregable:** Inventario de APIs student con estado (implementado/parcial/faltante)

#### **Agente 4: Analyze-Database-Student-Schema**
- **Tipo:** General-purpose (actuar como Database-Agent)
- **Objetivo:** Validar schema y datos relacionados con student
- **Análisis específico:**
  - Tablas relacionadas con student (usuarios, progreso, misiones, etc.)
  - Schema `educational_content` (missions, activities, exercises)
  - Schema `gamification` (ranks, rewards, progress)
  - Seeds existentes para student
  - RLS policies para student
  - Triggers y funciones relevantes
  - Integridad referencial
- **Entregable:** Mapa de base de datos student con cobertura de datos

### FASE 2: CONSOLIDACIÓN Y GAP ANALYSIS

Una vez completada Fase 1, consolidar hallazgos:

1. **Mapeo de coherencia:**
   - Frontend espera X → Backend provee Y → Database tiene Z
   - Identificar desalineaciones

2. **Clasificación de hallazgos:**
   - ✅ Implementado completamente
   - ⚠️ Implementado parcialmente (hardcoded, mock data)
   - ❌ No implementado (stub, pendiente)
   - 🔧 Implementado pero con bugs/inconsistencias

3. **Generación de matriz de gaps:**
   ```yaml
   gaps:
     - id: STUDENT-GAP-001
       feature: missions
       categoria: integracion
       severidad: alta/media/baja
       frontend_status: implementado/parcial/faltante
       backend_status: implementado/parcial/faltante
       database_status: implementado/parcial/faltante
       descripcion: "..."
       evidencia: "..."
       impacto: "..."
       recomendacion: "..."
   ```

### FASE 3: PLAN DE CORRECCIONES/IMPLEMENTACIONES

Basado en gaps identificados:

1. **Priorización:**
   - P0 (Crítico): Features core sin implementar
   - P1 (Alto): Hardcoded que debe consumir backend
   - P2 (Medio): Mejoras de coherencia
   - P3 (Bajo): Optimizaciones

2. **Plan de acción:**
   - Para cada gap: especificar QUÉ, DÓNDE, CÓMO implementar
   - Identificar dependencias entre correcciones
   - Estimar complejidad (baja/media/alta)
   - Asignar agente responsable (Frontend/Backend/Database)

3. **Especificaciones técnicas:**
   - Crear documentos detallados para cada corrección
   - Listas para ser orquestadas o delegadas

---

## 🤖 AGENTES A ORQUESTAR

### Fase 1: Exploración (PARALELO)

| Agente | Tool | Subagent Type | Dependencias | Tiempo Est. |
|--------|------|---------------|--------------|-------------|
| Explore-Frontend-Student | Task | Explore | Ninguna | 3-5 min |
| Analyze-Frontend-Implementation | Task | general-purpose | Ninguna | 5-8 min |
| Analyze-Backend-Student-APIs | Task | general-purpose | Ninguna | 5-8 min |
| Analyze-Database-Student-Schema | Task | general-purpose | Ninguna | 5-8 min |

**Ejecución:** Los 4 agentes se lanzan en PARALELO en un solo mensaje (multiple tool calls).

### Fase 2: Consolidación (SECUENCIAL)

| Tarea | Responsable | Dependencias |
|-------|-------------|--------------|
| Consolidar hallazgos | Architecture-Analyst | Fase 1 completa |
| Generar matriz de gaps | Architecture-Analyst | Consolidación |
| Crear reporte de coherencia | Architecture-Analyst | Matriz de gaps |

### Fase 3: Planeación (SECUENCIAL)

| Tarea | Responsable | Dependencias |
|-------|-------------|--------------|
| Priorizar correcciones | Architecture-Analyst | Reporte coherencia |
| Crear especificaciones técnicas | Architecture-Analyst | Priorización |
| Actualizar trazas y documentación | Architecture-Analyst | Plan completo |

---

## 📊 ENTREGABLES

### 1. Reportes de Exploración
- `01-FRONTEND-EXPLORATION.md` (Agente 1)
- `02-FRONTEND-IMPLEMENTATION.md` (Agente 2)
- `03-BACKEND-APIS.md` (Agente 3)
- `04-DATABASE-SCHEMA.md` (Agente 4)

### 2. Análisis Consolidado
- `05-CONSOLIDACION-HALLAZGOS.md`
- `06-MATRIZ-GAPS.yml`
- `07-REPORTE-COHERENCIA.md`

### 3. Plan de Acción
- `08-PLAN-CORRECCIONES.md`
- `09-ESPECIFICACIONES-TECNICAS/` (directorio con specs por gap)
- `10-PRIORIZACION-IMPLEMENTACIONES.md`

### 4. Actualización de Trazas
- `orchestration/trazas/TRAZA-ANALISIS-ARQUITECTURA.md`
- `orchestration/trazas/TRAZA-STUDENT-PORTAL.md` (nueva)

---

## ✅ CRITERIOS DE ÉXITO

- [ ] Todas las features críticas de student analizadas
- [ ] Coherencia Frontend-Backend-Database validada
- [ ] Gaps identificados y clasificados por severidad
- [ ] Plan de correcciones priorizado y especificado
- [ ] Documentación completa y trazable
- [ ] Especificaciones técnicas listas para orquestar/delegar

---

## 🚀 INICIO DE EJECUCIÓN

**Siguiente paso:** Lanzar 4 agentes de Fase 1 en PARALELO.

**Comando:** Usar Tool: Task 4 veces en un solo mensaje.

**Tiempo estimado total:**
- Fase 1: 8-10 minutos (paralelo)
- Fase 2: 15-20 minutos (secuencial)
- Fase 3: 10-15 minutos (secuencial)
- **TOTAL: ~35-45 minutos**

---

**Plan creado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Estado:** Listo para ejecución
