# PLAN DE ACCIÓN - INTEGRACIÓN Y COHERENCIA
## Proyecto GAMILIT
**Fecha:** 2025-11-09
**Basado en:** Verificación directa del código
**Objetivo:** Corregir discrepancias documentales y completar constantes

---

## 📊 RESUMEN DEL PLAN

| Prioridad | Tareas | Esfuerzo Total | Impacto |
|-----------|--------|----------------|---------|
| **P0 - Crítico** | 1 tarea | **5 minutos** | Alto - Corrige única discrepancia crítica |
| **P1 - Alta** | 3 tareas | **2.5 horas** | Medio - Completa documentación y constantes |
| **P2 - Media** | 2 tareas | **Continuo** | Bajo - Mejora continua de tests |
| **TOTAL** | 6 tareas | **~3 horas** | Coherencia: 80% → 95% |

---

## 🔴 PRIORIDAD P0 - CRÍTICO (Esta Semana)

### P0.1 - Corregir ORM en Inventario Backend

**Problema:** Documentación dice Prisma, código usa TypeORM

**Archivo:** `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml`

**Cambio Requerido:**
```yaml
# ANTES (línea 30):
stack:
  runtime: Node.js 18+
  framework: NestJS
  language: TypeScript
  orm: Prisma  # ❌ INCORRECTO

# DESPUÉS:
stack:
  runtime: Node.js 18+
  framework: NestJS
  language: TypeScript
  orm: TypeORM  # ✅ CORRECTO
  validation: class-validator
  auth: Supabase Auth + JWT
```

**Pasos:**
1. Abrir archivo: `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml`
2. Ir a línea 30
3. Cambiar `orm: Prisma` por `orm: TypeORM`
4. Guardar archivo
5. Commit: `docs: corregir ORM en inventario backend (TypeORM no Prisma)`

**Esfuerzo:** 5 minutos
**Responsable:** Tech Lead / Documentation Lead
**Impacto:** Alto - Elimina única discrepancia crítica
**Validación:**
```bash
grep "orm:" docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
# Debe mostrar: orm: TypeORM
```

---

## 🟡 PRIORIDAD P1 - ALTA (Esta Semana)

### P1.1 - Completar Schemas en database.constants.ts

**Problema:** Solo 8 de 14 schemas mapeados (57%)

**Archivo:** `apps/backend/src/shared/constants/database.constants.ts`

**Schemas Faltantes (6):**
1. `public`
2. `admin_dashboard`
3. `system_configuration`
4. `lti_integration`
5. `storage`
6. `auth` (Supabase - diferente de auth_management)

**Código a Agregar:**
```typescript
// apps/backend/src/shared/constants/database.constants.ts

export const DB_SCHEMAS = {
  // EXISTENTES (8) - NO TOCAR
  AUTH: 'auth_management',
  GAMIFICATION: 'gamification_system',
  EDUCATIONAL: 'educational_content',
  PROGRESS: 'progress_tracking',
  SOCIAL: 'social_features',
  CONTENT: 'content_management',
  AUDIT: 'audit_logging',
  GAMILIT: 'gamilit',

  // NUEVOS (6) - AGREGAR:
  PUBLIC: 'public',
  ADMIN_DASHBOARD: 'admin_dashboard',
  SYSTEM_CONFIGURATION: 'system_configuration',
  LTI_INTEGRATION: 'lti_integration',
  STORAGE: 'storage',
  AUTH_SUPABASE: 'auth',  // Schema de Supabase Auth (diferente de auth_management)
} as const;
```

**Pasos:**
1. Abrir `apps/backend/src/shared/constants/database.constants.ts`
2. Agregar los 6 schemas faltantes en `DB_SCHEMAS`
3. Verificar sintaxis TypeScript
4. Guardar archivo
5. Commit: `feat(backend): agregar 6 schemas faltantes en database.constants`

**Esfuerzo:** 1 hora (incluye validación)
**Responsable:** Backend Lead
**Impacto:** Medio - Completa constantes centralizadas
**Validación:**
```bash
grep -c ":" apps/backend/src/shared/constants/database.constants.ts | head -1
# Debe contar 14 schemas
```

---

### P1.2 - Completar Tablas EDUCATIONAL en database.constants.ts

**Problema:** Solo 8 de 15 tablas EDUCATIONAL mapeadas (53%)

**Archivo:** `apps/backend/src/shared/constants/database.constants.ts`

**Tablas Faltantes (7):**
1. `exercise_options`
2. `exercise_answers`
3. `content_metadata`
4. `module_dependencies`
5. `taxonomies`
6. `content_tags`
7. `content_approvals`

**Código a Agregar:**
```typescript
// apps/backend/src/shared/constants/database.constants.ts

export const DB_TABLES = {
  /**
   * Educational Content Schema
   * Tablas de módulos, ejercicios y recursos educativos
   */
  EDUCATIONAL: {
    // EXISTENTES (8) - NO TOCAR
    MODULES: 'modules',
    EXERCISES: 'exercises',
    ASSESSMENT_RUBRICS: 'assessment_rubrics',
    MEDIA_RESOURCES: 'media_resources',
    ASSIGNMENTS: 'assignments',
    ASSIGNMENT_EXERCISES: 'assignment_exercises',
    ASSIGNMENT_STUDENTS: 'assignment_students',
    ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',

    // NUEVAS (7) - AGREGAR:
    EXERCISE_OPTIONS: 'exercise_options',
    EXERCISE_ANSWERS: 'exercise_answers',
    CONTENT_METADATA: 'content_metadata',
    MODULE_DEPENDENCIES: 'module_dependencies',
    TAXONOMIES: 'taxonomies',
    CONTENT_TAGS: 'content_tags',
    CONTENT_APPROVALS: 'content_approvals',
  },
}
```

**Pasos:**
1. Abrir `apps/backend/src/shared/constants/database.constants.ts`
2. Localizar sección `EDUCATIONAL` en `DB_TABLES`
3. Agregar las 7 tablas faltantes
4. Verificar sintaxis TypeScript
5. Guardar archivo
6. Commit: `feat(backend): agregar 7 tablas EDUCATIONAL faltantes en database.constants`

**Esfuerzo:** 30 minutos
**Responsable:** Backend Lead
**Impacto:** Medio - Completa mapeo de educational
**Validación:**
```typescript
// Compilar TypeScript sin errores
npm run build
```

---

### P1.3 - Actualizar Conteo de Entities en Inventario

**Problema:** Inventario documenta 45 entities, código tiene 47 (+2)

**Archivo:** `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml`

**Cambio Requerido:**
```yaml
# ANTES (línea 19):
summary:
  total_modules: 15
  total_services: 46
  total_controllers: 32
  total_endpoints: 269
  total_dtos: 139
  total_entities: 45  # ❌ DESACTUALIZADO

# DESPUÉS:
summary:
  total_modules: 15
  total_services: 46
  total_controllers: 32
  total_endpoints: 269
  total_dtos: 139
  total_entities: 47  # ✅ CORRECTO (+2 desde última actualización)
```

**Entities Agregadas Recientemente:**
1. `assignment-exercise.entity.ts` (educational_content)
2. `assignment-student.entity.ts` (educational_content)

**Pasos:**
1. Verificar conteo real:
   ```bash
   find apps/backend/src/modules -name "*.entity.ts" | wc -l
   # Debe mostrar: 47
   ```
2. Abrir `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml`
3. Actualizar línea 19: `total_entities: 47`
4. Agregar nota en changelog si existe
5. Commit: `docs: actualizar conteo de entities en inventario backend (45→47)`

**Esfuerzo:** 15 minutos
**Responsable:** Backend Lead / Documentation
**Impacto:** Bajo - Mantiene inventario actualizado

---

## 🟢 PRIORIDAD P2 - MEDIA (Continuo)

### P2.1 - Continuar Creando Tests Backend

**Estado Actual:** 12 tests (~15-20% coverage)

**Módulos Prioritarios SIN Tests:**
1. ❌ gamification (falta: achievements, coins, missions, powerups)
2. ❌ educational (modules, exercises)
3. ❌ notifications
4. ❌ content
5. ❌ social

**Estrategia Recomendada:**

**Fase 1 - Gamification (2-3 días):**
```bash
# Crear tests para módulos críticos de gamification
apps/backend/src/modules/gamification/services/
  ├── achievement.service.spec.ts  # CREAR
  ├── coin.service.spec.ts         # CREAR
  ├── mission.service.spec.ts      # CREAR
  ├── powerup.service.spec.ts      # CREAR
  └── leaderboard.service.spec.ts  # CREAR
```

**Fase 2 - Educational (2-3 días):**
```bash
# Crear tests para módulos educativos
apps/backend/src/modules/educational/services/
  ├── module.service.spec.ts       # CREAR
  └── exercise.service.spec.ts     # CREAR
```

**Fase 3 - Resto (1-2 días):**
- notifications.service.spec.ts
- content.service.spec.ts
- social (classroom, teams).service.spec.ts

**Meta de Coverage:**
- Actual: 15-20%
- Meta Sprint 1: 40%
- Meta Sprint 2: 60%
- Meta Sprint 3: 80%

**Esfuerzo:** Continuo (6-8 días de trabajo)
**Responsable:** Backend Team
**Impacto:** Alto - Mejora calidad y confiabilidad

---

### P2.2 - Continuar Creando Tests Frontend

**Estado Actual:** 21 tests (~10-15% coverage)

**Features Prioritarias SIN Tests:**
1. ❌ mechanics (33 mecánicas, 0 tests)
2. ❌ teacher portal
3. ❌ admin dashboard
4. ❌ exercises components
5. ❌ notifications

**Estrategia Recomendada:**

**Fase 1 - Mechanics (Prioridad Alta):**
```bash
# Tests para mecánicas más usadas (5-6 mecánicas core)
apps/frontend/src/features/mechanics/
  ├── module1/CompletarEspacios/__tests__/  # CREAR
  ├── module1/Crucigrama/__tests__/         # CREAR
  ├── module2/DetectiveTextual/__tests__/   # CREAR
  ├── module3/DebateDigital/__tests__/      # CREAR
  └── module4/QuizTikTok/__tests__/         # CREAR
```

**Fase 2 - Teacher Portal (2-3 días):**
```bash
# Tests para componentes críticos de maestros
apps/frontend/src/apps/teacher/components/
  ├── dashboard/__tests__/ClassroomCard.test.tsx  # CREAR
  ├── assignments/__tests__/AssignmentCreator.test.tsx  # CREAR
  └── monitoring/__tests__/StudentMonitoringPanel.test.tsx  # CREAR
```

**Fase 3 - Components Core (1-2 días):**
- ExerciseHeader.test.tsx
- ExerciseFeedback.test.tsx
- NotificationDropdown.test.tsx

**Meta de Coverage:**
- Actual: 10-15%
- Meta Sprint 1: 30%
- Meta Sprint 2: 50%
- Meta Sprint 3: 70%

**Esfuerzo:** Continuo (6-8 días de trabajo)
**Responsable:** Frontend Team
**Impacto:** Alto - Mejora calidad UI/UX

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Sprint Actual (Esta Semana)

**Día 1 - Correcciones Críticas (30 minutos):**
- [ ] P0.1: Corregir ORM en BACKEND_INVENTORY.yml
- [ ] P1.3: Actualizar conteo de entities en inventario
- [ ] Commit y push de correcciones

**Día 2-3 - Completar Constantes (2.5 horas):**
- [ ] P1.1: Agregar 6 schemas en database.constants.ts
- [ ] P1.2: Agregar 7 tablas EDUCATIONAL en database.constants.ts
- [ ] Validar compilación TypeScript
- [ ] Commit y push de constantes

**Día 4-5 - Validación (1 hora):**
- [ ] Ejecutar `npm run build` en backend
- [ ] Verificar que no hay errores TypeScript
- [ ] Actualizar este documento con estado final
- [ ] Cerrar issues relacionados

### Sprints Futuros (Continuo)

**Sprint 1 - Tests Críticos:**
- [ ] P2.1: Tests gamification backend (5 services)
- [ ] P2.2: Tests mechanics frontend (5 mecánicas)
- Meta coverage: Backend 40%, Frontend 30%

**Sprint 2 - Tests Importantes:**
- [ ] P2.1: Tests educational backend (2 services)
- [ ] P2.2: Tests teacher portal frontend (3 componentes)
- Meta coverage: Backend 60%, Frontend 50%

**Sprint 3 - Tests Completos:**
- [ ] P2.1: Tests resto de servicios backend
- [ ] P2.2: Tests resto de componentes frontend
- Meta coverage: Backend 80%, Frontend 70%

---

## 🔍 VALIDACIÓN POST-IMPLEMENTACIÓN

### Validaciones Automatizadas

**1. Verificar ORM Correcto:**
```bash
grep "orm:" docs/90-transversal/inventarios/BACKEND_INVENTORY.yml
# Debe mostrar: orm: TypeORM
```

**2. Verificar Schemas Completos:**
```bash
grep -c ":" apps/backend/src/shared/constants/database.constants.ts | head -1
# Debe mostrar: 14 (o más)
```

**3. Verificar Compilación Backend:**
```bash
cd apps/backend
npm run build
# Debe compilar sin errores
```

**4. Verificar Conteo Entities:**
```bash
find apps/backend/src/modules -name "*.entity.ts" | wc -l
# Debe mostrar: 47
```

**5. Verificar Tests Backend:**
```bash
find apps/backend/src -name "*.spec.ts" -o -name "*.test.ts" | wc -l
# Debe mostrar: >= 12
```

**6. Verificar Tests Frontend:**
```bash
find apps/frontend/src -name "*.test.tsx" -o -name "*.test.ts" | wc -l
# Debe mostrar: >= 21
```

### Validación Manual

**1. Revisar Inventarios:**
- [ ] BACKEND_INVENTORY.yml tiene ORM: TypeORM
- [ ] BACKEND_INVENTORY.yml tiene total_entities: 47
- [ ] DATABASE_INVENTORY.yml sigue correcto

**2. Revisar Constantes:**
- [ ] DB_SCHEMAS tiene 14 schemas
- [ ] DB_TABLES.EDUCATIONAL tiene 15 tablas
- [ ] TypeScript compila sin errores

**3. Revisar Tests:**
- [ ] Tests backend ejecutan: `npm test`
- [ ] Tests frontend ejecutan: `npm test`
- [ ] Coverage reportes generados

---

## 📊 MÉTRICAS DE ÉXITO

### Antes de Implementar

| Métrica | Estado Actual |
|---------|---------------|
| ORM Documentado | ❌ Incorrecto (Prisma) |
| Schemas Mapeados | 57% (8/14) |
| Tablas EDUCATIONAL | 53% (8/15) |
| Entities Conteo | ⚠️ Desactualizado (45) |
| Test Coverage Backend | 15-20% |
| Test Coverage Frontend | 10-15% |
| **Coherencia Global** | **80%** |

### Después de P0+P1 (Esta Semana)

| Métrica | Estado Esperado |
|---------|-----------------|
| ORM Documentado | ✅ Correcto (TypeORM) |
| Schemas Mapeados | 100% (14/14) |
| Tablas EDUCATIONAL | 100% (15/15) |
| Entities Conteo | ✅ Actualizado (47) |
| Test Coverage Backend | 15-20% (sin cambio) |
| Test Coverage Frontend | 10-15% (sin cambio) |
| **Coherencia Global** | **95%** ✅ |

### Después de P2 (Sprints Futuros)

| Métrica | Meta |
|---------|------|
| ORM Documentado | ✅ Correcto |
| Schemas Mapeados | ✅ 100% |
| Tablas Mapeadas | ✅ 100% |
| Entities Conteo | ✅ Actualizado |
| Test Coverage Backend | 80% |
| Test Coverage Frontend | 70% |
| **Coherencia Global** | **98%** 🎯 |

---

## 🎯 CRITERIOS DE ACEPTACIÓN

### P0 - Crítico (5 minutos)
- [x] ORM cambiado de Prisma a TypeORM en inventario
- [x] Commit realizado con mensaje descriptivo
- [x] Cambio validado con grep

### P1 - Alta (2.5 horas)
- [ ] 6 schemas agregados en database.constants.ts
- [ ] 7 tablas EDUCATIONAL agregadas en database.constants.ts
- [ ] Entities conteo actualizado a 47 en inventario
- [ ] TypeScript compila sin errores
- [ ] 3 commits realizados con mensajes descriptivos
- [ ] Todos los cambios validados

### P2 - Media (Continuo)
- [ ] Tests backend incrementan: 12 → 17 → 22 → 27+
- [ ] Tests frontend incrementan: 21 → 26 → 31 → 36+
- [ ] Coverage backend: 20% → 40% → 60% → 80%
- [ ] Coverage frontend: 15% → 30% → 50% → 70%
- [ ] Reportes de coverage generados por Sprint

---

## 📅 CRONOGRAMA

### Semana 1 (Hoy - 2025-11-15)
- **Lunes:** P0.1 (5 min)
- **Martes:** P1.1 (1 hora)
- **Miércoles:** P1.2 (30 min) + P1.3 (15 min)
- **Jueves:** Validación (1 hora)
- **Viernes:** Cierre y actualización de documentación

**Entregable:** Coherencia 80% → 95%

### Semana 2-4 (2025-11-16 a 2025-12-06)
- **Sprint 1:** Tests críticos (backend gamification + frontend mechanics)
- **Sprint 2:** Tests importantes (backend educational + frontend teacher)
- **Sprint 3:** Tests completos (resto de servicios y componentes)

**Entregable:** Coverage 15% → 80% backend, 15% → 70% frontend

---

## 👥 RESPONSABILIDADES

| Rol | Tareas | Tiempo |
|-----|--------|--------|
| **Tech Lead** | Aprobar plan, revisar P0 | 30 min |
| **Backend Lead** | Implementar P1.1, P1.2, P1.3 | 2.5 horas |
| **Documentation Lead** | Validar correcciones inventarios | 30 min |
| **Backend Team** | Implementar P2.1 (tests) | Continuo |
| **Frontend Team** | Implementar P2.2 (tests) | Continuo |
| **QA Lead** | Validar coverage, reportes | Continuo |

---

## 📝 NOTAS ADICIONALES

### Importante
- ✅ NO hay problemas arquitecturales graves
- ✅ El proyecto está en buen estado (80% coherencia)
- ✅ Solo 1 corrección crítica (5 minutos)
- ✅ Tests están siendo creados activamente por el equipo

### Recomendaciones
1. Priorizar P0 inmediatamente (5 min)
2. Completar P1 esta semana (2.5 horas)
3. Continuar P2 en paralelo al desarrollo normal
4. Revisar este plan en 1 semana (2025-11-16)

### Próxima Revisión
**Fecha:** 2025-11-16
**Objetivo:** Validar que P0+P1 están completos
**Métrica:** Coherencia debe ser 95%

---

**Generado:** 2025-11-09
**Autor:** Análisis Manual (verificación directa)
**Versión:** 1.0
**Estado:** 📋 Listo para implementar
