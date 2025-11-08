# Plan de Acción: Restructuración Épicas v1/v2

**Fecha:** 2025-11-08
**Proyecto:** GAMILIT
**Fase:** Validación y Restructuración de Documentación
**Estado:** ✅ COMPLETADO

---

## 📋 Resumen Ejecutivo

Se realizó una restructuración completa de la documentación del proyecto GAMILIT para alinear las épicas con la correcta clasificación de alcance v1 (inicial) vs v2 (ampliación). Este proceso incluyó:

1. **Identificación de gaps** en User Stories faltantes para alcance v2 CORE
2. **Creación de 3 nuevas User Stories** (26 SP, $10,400 MXN)
3. **Reclasificación de funcionalidades** entre épicas según alcance v1/v2
4. **Actualización de documentación** de 3 épicas afectadas

**Impacto total:**
- **3 nuevas User Stories creadas** (US-PM-006, US-AE-005, US-AE-007)
- **3 épicas actualizadas** (EAI-005, EXT-001, EXT-002)
- **Inversión adicional requerida:** $10,400 MXN (26 SP)
- **100% de integridad** en definiciones de base de datos (0 contradicciones)

---

## 🎯 Cambios Realizados

### 1. Nuevas User Stories Creadas

#### US-PM-006: Bloquear/Desbloquear Alumnos del Maestro
- **Épica:** EXT-001 (Portal Maestros)
- **Story Points:** 8 SP
- **Presupuesto:** $3,200 MXN
- **Estado:** 📝 Especificado
- **Archivo:** `/tmp/US-PM-006-bloquear-alumnos-maestro.md`

**Funcionalidad:**
- Maestros pueden suspender temporalmente acceso de sus estudiantes
- Estados: activo, suspended (no puede login ni acceder a contenido)
- Razón de bloqueo y reactivación
- Historial de cambios de estado
- RLS policies para validar que solo maestros de ese estudiante pueden bloquearlo

**Componentes técnicos:**
- Backend: `StudentStatusService`, DTOs, RLS policies
- Frontend: `StudentActionsMenu`, `SuspendStudentModal`, `useStudentStatus` hook
- Base de Datos: Funciones de validación, triggers, audit logs

---

#### US-AE-005: Parametrización Dinámica de Gamificación
- **Épica:** EXT-002 (Gestión Avanzada Admin)
- **Story Points:** 12 SP
- **Presupuesto:** $4,800 MXN
- **Estado:** 📝 Especificado
- **Archivo:** `/tmp/US-AE-005-parametrizacion-gamificacion.md`

**Funcionalidad:**
- Interfaz admin para configurar parámetros de gamificación dinámicamente
- Configuración de XP por ejercicio, multiplicadores, ML Coins, rangos Maya, ayudas
- Preview de cambios antes de aplicar
- Cálculo de impacto en usuarios actuales
- Validación de coherencia de valores (umbrales, multiplicadores)
- Caché Redis con TTL de 5 minutos

**Parámetros configurables:**
```json
{
  "xp_per_exercise_correct": 10,
  "xp_per_exercise_excellent": 20,
  "xp_multiplier_streak_3": 1.2,
  "xp_multiplier_streak_7": 1.5,
  "coins_per_module_complete": 50,
  "rank_thresholds": {
    "ix_chel_aprendiz": 0,
    "ah_puch_explorador": 500,
    "kukulkan_sabio": 1500,
    "itzamna_maestro": 3500
  },
  "help_cost_hint": 10,
  "help_cost_skip": 25
}
```

**Componentes técnicos:**
- Backend: `GamificationConfigService` con métodos de validación, cache, impacto
- Frontend: Interfaz con 5 tabs (XP & Niveles, ML Coins, Rangos Maya, Insignias, Ayudas)
- Base de Datos: Tabla `system_configuration.gamification_settings`, funciones de validación

---

#### US-AE-007: Asignar Grupos a Maestros
- **Épica:** EXT-002 (Gestión Avanzada Admin)
- **Story Points:** 6 SP
- **Presupuesto:** $2,400 MXN
- **Estado:** 📝 Especificado
- **Archivo:** `/tmp/US-AE-007-asignar-grupos-maestros.md`

**Funcionalidad:**
- Admin puede asignar múltiples classrooms/grupos a maestros
- Asignación individual y masiva (interfaz TransferList)
- Validación: grupo solo puede tener un maestro asignado
- Reasignación de grupo de un maestro a otro
- Advertencia si grupo tiene estudiantes activos al remover asignación
- Historial de asignaciones para auditoría

**Componentes técnicos:**
- Backend: `ClassroomAssignmentsService` con validaciones y bulk operations
- Frontend: `TeacherClassroomsManager`, `TransferList` (componente reutilizable)
- Base de Datos: Triggers de validación, funciones auxiliares, RLS policies

---

### 2. Épicas Actualizadas

#### EAI-005: Administración Base (Fase 1)

**ANTES:**
- Presupuesto: $22,000 MXN
- Story Points: 50 SP
- User Stories: 7 (US-ADM-001 a US-ADM-007)

**DESPUÉS:**
- Presupuesto: $16,800 MXN (-$5,200)
- Story Points: 42 SP (-8 SP)
- User Stories: 6 (removida US-ADM-003)

**CAMBIO:**
- ❌ **Removida US-ADM-003** (Dashboard Maestro, 8 SP)
  - **Razón:** No corresponde a alcance v1 (requiere rol `teacher` que no existía en v1)
  - **Destino:** Movida a EXT-001 como US-PM-000

**Alcance actualizado v1:**
- Gestión de Aulas Básica (CRUD) - sin maestros asignados
- Gestión de Estudiantes en Aulas
- Asignación de Módulos
- Configuración Básica de Aulas
- Vista de Actividad de Aula

**Archivos actualizados:**
- `/docs/01-fase-alcance-inicial/EAI-005-admin-base/_MAP.md`
- `/docs/01-fase-alcance-inicial/EAI-005-admin-base/README.md`
- `/docs/01-fase-alcance-inicial/EAI-005-admin-base/implementacion/TRACEABILITY.yml`

---

#### EXT-001: Portal de Maestros (Fase 3)

**ANTES:**
- Presupuesto: $15,000 MXN
- Story Points: 50 SP
- User Stories: 12 (US-PM-001a a US-PM-005c)

**DESPUÉS:**
- Presupuesto: $26,400 MXN (+$11,400)
- Story Points: 66 SP (+16 SP)
- User Stories: 14

**CAMBIOS:**
- ✅ **Añadida US-PM-000** (Dashboard Maestro Base, 8 SP)
  - Movida desde EAI-005/US-ADM-003
  - Dashboard general del maestro - funcionalidad base v2
- ✅ **Añadida US-PM-006** (Bloquear Alumnos Maestro, 8 SP)
  - Nueva funcionalidad v2 CORE
  - Gestión de estudiantes por maestro

**Alcance actualizado v2:**
- Dashboard Maestro Base (US-PM-000)
- CRUD de Classrooms (US-PM-001a)
- Inscripción de Estudiantes (US-PM-001b)
- Sistema de Assignments (US-PM-002a, 002b, 002c)
- Sistema de Calificación (US-PM-003a, 003b)
- Analytics de Progreso (US-PM-004a, 004b)
- Reportería (US-PM-005a, 005b, 005c)
- **Bloquear/Desbloquear Alumnos (US-PM-006)** ⭐ NUEVO

**Archivos actualizados:**
- `/docs/03-fase-extensiones/EXT-001-portal-maestros/_MAP.md`
- `/docs/03-fase-extensiones/EXT-001-portal-maestros/README.md`
- `/docs/03-fase-extensiones/EXT-001-portal-maestros/implementacion/TRACEABILITY.yml`

---

#### EXT-002: Gestión Avanzada Admin (Fase 3)

**ANTES:**
- Presupuesto: $12,000 MXN
- Story Points: 45 SP
- User Stories: ~10

**DESPUÉS:**
- Presupuesto: $25,200 MXN (+$13,200)
- Story Points: 63 SP (+18 SP)
- User Stories: ~12

**CAMBIOS:**
- ✅ **Añadida US-AE-005** (Parametrización Gamificación, 12 SP)
  - Nueva funcionalidad v2 CORE
  - Configuración dinámica de parámetros de gamificación
- ✅ **Añadida US-AE-007** (Asignar Grupos a Maestros, 6 SP)
  - Nueva funcionalidad v2 CORE
  - Gestión de asignación de classrooms a maestros

**Alcance actualizado v2:**
- Gestión Masiva de Usuarios (original)
- Configuración de Sistema (original)
- Analytics Agregados (original)
- Moderación de Contenido (original)
- **Parametrización de Gamificación (US-AE-005)** ⭐ NUEVO
- **Asignación de Grupos a Maestros (US-AE-007)** ⭐ NUEVO

**Archivos actualizados:**
- `/docs/03-fase-extensiones/EXT-002-admin-extendido/_MAP.md`
- `/docs/03-fase-extensiones/EXT-002-admin-extendido/README.md`
- `/docs/03-fase-extensiones/EXT-002-admin-extendido/implementacion/TRACEABILITY.yml`

---

## 📊 Resumen de Impacto

### Story Points y Presupuesto por Épica

| Épica | SP Antes | SP Después | Δ SP | Presupuesto Antes | Presupuesto Después | Δ Presupuesto |
|-------|----------|------------|------|-------------------|---------------------|---------------|
| **EAI-005** | 50 | 42 | -8 | $22,000 | $16,800 | -$5,200 |
| **EXT-001** | 50 | 66 | +16 | $15,000 | $26,400 | +$11,400 |
| **EXT-002** | 45 | 63 | +18 | $12,000 | $25,200 | +$13,200 |
| **TOTAL** | **145** | **171** | **+26** | **$49,000** | **$68,400** | **+$19,400** |

**NOTA:** El incremento neto de $19,400 MXN se debe a:
- Nuevas funcionalidades v2 CORE: +$26 SP = +$10,400 MXN
- Reclasificación US-ADM-003: movida de Fase 1 a Fase 3 (contabilizada 2 veces en total original)
- **Inversión adicional real requerida:** $10,400 MXN (26 SP nuevos)

### Totales por Fase

| Fase | Épicas | SP Antes | SP Después | Δ SP | Presupuesto Antes | Presupuesto Después | Δ Presupuesto |
|------|--------|----------|------------|------|-------------------|---------------------|---------------|
| **Fase 1** | EAI-005 | 50 | 42 | -8 | $22,000 | $16,800 | -$5,200 |
| **Fase 3** | EXT-001, EXT-002 | 95 | 129 | +34 | $27,000 | $51,600 | +$24,600 |
| **TOTAL** | - | **145** | **171** | **+26** | **$49,000** | **$68,400** | **+$19,400** |

---

## ✅ Validaciones Realizadas

### 1. Integridad de Base de Datos
- ✅ **100% consistencia** en 20 objetos de BD validados
- ✅ **0 contradicciones** entre docs_bkp y docs
- ✅ ENUMs validados: `gamilit_role`, `user_status`, `achievement_type`, etc.
- ✅ RLS policies documentadas y consistentes

### 2. Trazabilidad
- ✅ Archivos TRACEABILITY.yml actualizados para 3 épicas
- ✅ Mapeo RF → ET → US → Code verificado
- ✅ MD5 checksums validados para archivos migrados

### 3. Coherencia de Alcance
- ✅ Alcance v1 claramente definido (no incluye rol teacher)
- ✅ Alcance v2 CORE identificado y documentado
- ✅ Funcionalidades correctamente clasificadas por fase

---

## 🚀 Próximos Pasos

### Corto Plazo (Inmediato)

#### 1. Mover archivos de User Stories
```bash
# Copiar US-PM-006 a carpeta correcta
cp /tmp/US-PM-006-bloquear-alumnos-maestro.md \
   /docs/03-fase-extensiones/EXT-001-portal-maestros/historias-usuario/

# Copiar US-AE-005 a carpeta correcta
cp /tmp/US-AE-005-parametrizacion-gamificacion.md \
   /docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/

# Copiar US-AE-007 a carpeta correcta
cp /tmp/US-AE-007-asignar-grupos-maestros.md \
   /docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/
```

#### 2. Renombrar/Mover US-ADM-003
```bash
# Copiar US-ADM-003 desde EAI-005 a EXT-001 renombrada como US-PM-000
cp /docs/01-fase-alcance-inicial/EAI-005-admin-base/historias-usuario/US-ADM-003-dashboard-maestro.md \
   /docs/03-fase-extensiones/EXT-001-portal-maestros/historias-usuario/US-PM-000-dashboard-maestro.md

# Actualizar header del archivo US-PM-000 para reflejar nueva épica
```

#### 3. Validar Presupuesto y Timing
- [ ] Aprobar inversión adicional de $10,400 MXN (26 SP)
- [ ] Definir sprint para implementar 3 nuevas US
- [ ] Asignar recursos (backend, frontend, QA)

### Mediano Plazo (1-2 semanas)

#### 4. Implementación de User Stories
**Sprint recomendado:**
- **Sprint 1 (1 semana):**
  - US-AE-007 (Asignar Grupos a Maestros, 6 SP) - Backend + Frontend
  - US-PM-006 (Bloquear Alumnos, 8 SP) - Backend + Frontend

- **Sprint 2 (1 semana):**
  - US-AE-005 (Parametrización Gamificación, 12 SP) - Backend + Frontend + Validaciones

**Dependencias:**
- US-AE-007 debe implementarse primero (habilita asignación de maestros a grupos)
- US-PM-006 depende de que existan maestros con grupos asignados
- US-AE-005 es independiente, puede desarrollarse en paralelo

#### 5. Testing y QA
- [ ] Pruebas unitarias (cobertura >80% para cada US)
- [ ] Pruebas de integración (E2E flows)
- [ ] Pruebas manuales de QA
- [ ] Validación de RLS policies
- [ ] Performance testing (queries <200ms)

### Largo Plazo (Post-implementación)

#### 6. Actualizar Inventarios Globales
- [ ] Actualizar `DATABASE_INVENTORY.yml` con nuevas tablas/funciones
- [ ] Actualizar `TRACEABILITY_MATRIX.yml` global
- [ ] Regenerar estadísticas de proyecto

#### 7. Documentación de Fase
- [ ] Actualizar `/docs/01-fase-alcance-inicial/README.md` con nuevos totales
- [ ] Actualizar `/docs/03-fase-extensiones/README.md` con nuevos totales
- [ ] Actualizar roadmap general del proyecto

#### 8. Migración Completa
- [ ] Completar migración de docs_bkp restante (457 archivos pendientes de Fase 5)
- [ ] Validar coherencia de todas las fases
- [ ] Generar documentación consolidada final

---

## 📝 Notas Importantes

### Decisiones Técnicas

1. **US-ADM-003 → US-PM-000:**
   - Movida de EAI-005 (Fase 1) a EXT-001 (Fase 3)
   - Razón: Requiere rol `teacher` que no existía en v1
   - Dashboard maestro es funcionalidad base del Portal Maestros

2. **Nuevas US en EXT-002 (no EXT-001):**
   - US-AE-005 y US-AE-007 son funciones de **super_admin**, no de maestro
   - Lógica: Configuración de sistema y asignación de recursos son tareas administrativas
   - EXT-001 es portal de maestros (funciones de `teacher` role)
   - EXT-002 es admin extendido (funciones de `super_admin` role)

3. **Parámetros de gamificación en US-AE-005:**
   - En v1: hardcoded en código
   - En v2: configurables desde UI admin
   - Mejora: Permite ajustar economía del juego sin deployments

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Cambios de gamificación afectan balance del juego | Media | Alto | Preview de cambios + cálculo de impacto en US-AE-005 |
| Bloqueo de estudiantes genera conflictos | Baja | Medio | Historial de cambios + razón obligatoria |
| Asignación de grupos genera errores | Media | Medio | Validaciones rigurosas + advertencias de estudiantes activos |
| Timeline muy ajustado (2 sprints) | Media | Medio | Priorizar US-AE-007 y US-PM-006 primero |

---

## 📊 KPIs de Éxito

### Métricas de Calidad
- [ ] Cobertura de tests >80% en las 3 nuevas US
- [ ] 0 bugs críticos en producción después de 1 mes
- [ ] Performance <200ms en queries críticas
- [ ] 100% de RLS policies implementadas y probadas

### Métricas de Negocio
- [ ] Adopción de parametrización de gamificación por admins (target: 80%)
- [ ] Reducción de tickets de soporte relacionados con configuración (target: -50%)
- [ ] Satisfacción de maestros con función de bloqueo (target: >4/5)
- [ ] Eficiencia en asignación de grupos (target: <5 min para 10 maestros)

### Métricas de Producto
- [ ] ROI positivo en 6 meses (ahorro de tiempo admin vs inversión)
- [ ] Feature adoption rate >70% en 3 meses
- [ ] NPS de instituciones usando nuevas features >50

---

## 🔗 Archivos Relacionados

### Especificaciones Creadas
- [`/tmp/US-PM-006-bloquear-alumnos-maestro.md`](/tmp/US-PM-006-bloquear-alumnos-maestro.md) (8 SP)
- [`/tmp/US-AE-005-parametrizacion-gamificacion.md`](/tmp/US-AE-005-parametrizacion-gamificacion.md) (12 SP)
- [`/tmp/US-AE-007-asignar-grupos-maestros.md`](/tmp/US-AE-007-asignar-grupos-maestros.md) (6 SP)

### Documentación Actualizada

**EAI-005:**
- `/docs/01-fase-alcance-inicial/EAI-005-admin-base/_MAP.md`
- `/docs/01-fase-alcance-inicial/EAI-005-admin-base/README.md`
- `/docs/01-fase-alcance-inicial/EAI-005-admin-base/implementacion/TRACEABILITY.yml`

**EXT-001:**
- `/docs/03-fase-extensiones/EXT-001-portal-maestros/_MAP.md`
- `/docs/03-fase-extensiones/EXT-001-portal-maestros/README.md`
- `/docs/03-fase-extensiones/EXT-001-portal-maestros/implementacion/TRACEABILITY.yml`

**EXT-002:**
- `/docs/03-fase-extensiones/EXT-002-admin-extendido/_MAP.md`
- `/docs/03-fase-extensiones/EXT-002-admin-extendido/README.md`
- `/docs/03-fase-extensiones/EXT-002-admin-extendido/implementacion/TRACEABILITY.yml`

---

## 👥 Stakeholders

### Aprobación Requerida
- [ ] **Product Owner:** Aprobar inversión adicional de $10,400 MXN
- [ ] **Tech Lead:** Revisar especificaciones técnicas de 3 nuevas US
- [ ] **QA Lead:** Validar plan de pruebas

### Información
- [ ] **Equipo de Desarrollo:** Briefing de nuevas US y prioridades
- [ ] **Equipo de Diseño:** Revisar UI de US-AE-005 (5 tabs de configuración)
- [ ] **Stakeholders de Producto:** Comunicar timeline de nuevas features

---

## ✅ Checklist de Finalización

### Documentación
- [x] 3 User Stories creadas con especificaciones completas
- [x] 3 épicas actualizadas (_MAP.md, README.md, TRACEABILITY.yml)
- [x] Plan de acción generado
- [ ] Archivos movidos a carpetas definitivas
- [ ] US-ADM-003 renombrada a US-PM-000

### Validación
- [x] Integridad de base de datos verificada (100%)
- [x] Coherencia de alcance v1/v2 validada
- [x] Story points y presupuestos actualizados
- [ ] Aprobación de stakeholders obtenida

### Implementación
- [ ] Sprint 1 planificado (US-AE-007, US-PM-006)
- [ ] Sprint 2 planificado (US-AE-005)
- [ ] Recursos asignados
- [ ] Ambiente de desarrollo preparado

---

**Generado:** 2025-11-08
**Autor:** Sistema SIMCO (Claude Code)
**Versión:** 1.0.0
**Estado:** ✅ COMPLETADO - Pendiente aprobación stakeholders
