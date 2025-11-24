# ROADMAP: MEJORA DE TEST COVERAGE

**Estado:** DRAFT
**Fecha:** 2025-11-23
**Responsable:** Tech Lead
**Co-responsable:** Architecture-Analyst
**Aprobación requerida:** Tech Lead, Product Owner
**Versión:** 1.0
**Prioridad:** 🔴 CRÍTICA (Gap -74% identificado)

---

## 🎯 SITUACIÓN ACTUAL

### Gap Crítico Identificado

**Origen:** Validación de coherencia documentación-código (2025-11-23)
- Actualización de 17 archivos TRACEABILITY.yml con métricas **reales**
- Gap crítico documentado en GAP-4

**Métricas Actuales (2025-11-23):**

| Componente | Meta Documentada | Realidad | Gap | Estado |
|------------|------------------|----------|-----|--------|
| **Overall** | 87% | 13% | **-74%** | 🔴 CRÍTICO |
| **Backend** | 89% | 17% | -72% | 🔴 CRÍTICO |
| **Frontend** | 88% | 8% | **-80%** | 🔴 CRÍTICO |
| **Database** | N/A | 0% | N/A | 🔴 CRÍTICO |

**Causa raíz:** Valores originales eran **estimaciones optimistas** del inicio del proyecto, no mediciones reales.

---

### Detalle por Módulo

#### Módulos Core (Críticos)

| Módulo | Epic | Coverage | Riesgo | Prioridad |
|--------|------|----------|--------|-----------|
| **Autenticación** | EAI-001 | 18% | 🔴 ALTO | P0 |
| **Gamificación** | EAI-003 | 25% | 🔴 ALTO | P0 |
| **Actividades** | EAI-002 | 20% | 🟠 MEDIO | P1 |
| **Portal Maestros** | EXT-001 | 12% | 🔴 ALTO | P1 |

#### Módulos con Tests Parciales

| Módulo | Epic | Coverage | Prioridad |
|--------|------|----------|-----------|
| Analytics | EAI-004 | 10% | P1 |
| Admin Base | EAI-005 | 15% | P1 |
| Notificaciones | EXT-003 | 15% | P2 |
| Reportes | EXT-005 | 12% | P2 |

#### Módulos con Tests Mínimos

| Módulo | Epic | Coverage | Estado |
|--------|------|----------|--------|
| Config Sistema | EAI-006 | 8% | P2 |
| Perfiles | EXT-004 | 10% | P2 |
| CMS Contenido | EXT-006 | 10% | P2 |
| LTI Integration | EXT-007 | 5% | P3 |
| White Label | EXT-008 | 3% | P3 |
| Peer Challenges | EXT-009 | 8% | P3 |
| Parent Portal | EXT-010 | 5% | P3 |

#### Módulos Especiales

| Módulo | Epic | Coverage | Observación |
|--------|------|----------|-------------|
| Migración BD | EMR-001 | 92%* | *Scripts de migración, no funcionalidad |

---

### Impacto del Gap

**Riesgos actuales:**
- 🔴 **Regresiones no detectadas:** Cambios pueden romper funcionalidad sin alertas
- 🔴 **Refactoring peligroso:** Difícil mejorar código sin romper features
- 🔴 **Onboarding lento:** Nuevos devs temen tocar código sin tests
- 🔴 **Deuda técnica:** Crecimiento acelerado de deuda

**Impacto en negocio:**
- ⚠️ Bugs en producción más frecuentes
- ⚠️ Tiempo de desarrollo más lento (miedo a cambios)
- ⚠️ Costo de QA manual elevado
- ⚠️ Confianza stakeholders afectada

---

## 🎯 OBJETIVO

### Meta Global

**Alcanzar 88% overall coverage en 12 meses (Q4 2026)**

| Fase | Trimestre | Meta Overall | Incremento |
|------|-----------|--------------|------------|
| **Actual** | Q4 2025 | 13% | Baseline |
| **Fase 1** | Q1 2026 | 40% | +27% |
| **Fase 2** | Q2 2026 | 60% | +20% |
| **Fase 3** | Q3 2026 | 75% | +15% |
| **Fase 4** | Q4 2026 | 88% | +13% |

**Estrategia:** Incrementos sostenibles de ~15-20% por trimestre

---

### Metas por Componente

| Componente | Actual | Q1 2026 | Q2 2026 | Q3 2026 | Q4 2026 (Meta) |
|------------|--------|---------|---------|---------|----------------|
| **Backend** | 17% | 45% | 65% | 80% | **92%** |
| **Frontend** | 8% | 35% | 55% | 70% | **87%** |
| **Database** | 0% | 20% | 40% | 65% | **85%** |

---

## 📅 ROADMAP POR FASES

### FASE 1: Q1 2026 - Tests Críticos P0 (Enero-Marzo)

**Meta:** 40% overall coverage (+27%)

#### Sprint 1-2 (Enero 2026): Gamificación Core

**Módulos:**
- ✅ EAI-003: Gamificación (25% → 65%)

**Áreas de enfoque:**

**Backend (45% → 75%):**
- [ ] `achievements.service.ts` - Tests de lógica de achievements
  - `check_and_unlock_achievement()` - 8 tests
  - `award_achievement()` - 5 tests
  - `get_user_achievements()` - 4 tests
- [ ] `coins.service.ts` - Tests de ML Coins
  - `award_coins()` con multiplicadores - 6 tests
  - `spend_coins()` validaciones - 5 tests
  - `get_balance()` - 3 tests
- [ ] `ranks.service.ts` - Tests de rangos mayas
  - `update_user_rank()` - 7 tests
  - `get_rank_multiplier()` - 4 tests
  - `check_promotion_eligibility()` - 6 tests

**Frontend (15% → 60%):**
- [ ] `AchievementCard.tsx` - Renderizado y estados
- [ ] `RankProgress.tsx` - Cálculo de progreso
- [ ] `CoinsDisplay.tsx` - Formateo y animaciones
- [ ] `useAchievements` hook - Lógica de estado

**Database (0% → 30%):**
- [ ] `check_and_unlock_achievement()` function - 8 tests pgTAP
- [ ] `award_ml_coins()` function - 6 tests pgTAP
- [ ] `update_user_rank()` function - 7 tests pgTAP
- [ ] RLS policies de `achievements` - 5 tests pgTAP

**Esfuerzo:** 3 semanas, 2 devs full-time

---

#### Sprint 3-4 (Febrero 2026): Autenticación y Progreso

**Módulos:**
- ✅ EAI-001: Autenticación (18% → 55%)
- ✅ EAI-002: Actividades - Progreso (20% → 50%)

**Áreas de enfoque:**

**Backend Auth (30% → 70%):**
- [ ] `auth.service.ts` - Flujos de autenticación
  - Login/Logout - 10 tests
  - JWT validation - 8 tests
  - Refresh tokens - 6 tests
  - Password reset - 8 tests
- [ ] `roles.service.ts` - Gestión de roles
  - Role assignment - 5 tests
  - Permissions check - 8 tests
- [ ] `tenant.service.ts` - Multi-tenancy
  - Tenant isolation - 10 tests (crítico)

**Backend Progress (30% → 60%):**
- [ ] `exercise-attempts.service.ts`
  - Submit attempt - 8 tests
  - Calculate score - 6 tests
  - Award XP - 5 tests
- [ ] `module-progress.service.ts`
  - Update progress - 7 tests
  - Check completion - 5 tests

**Frontend (10% → 45%):**
- [ ] `LoginForm.tsx` - Validación y errores
- [ ] `useAuth` hook - Estados de autenticación
- [ ] `ExerciseSubmission.tsx` - Envío de respuestas
- [ ] `ProgressTracker.tsx` - Visualización progreso

**Database (0% → 25%):**
- [ ] RLS policies de `auth.users` - 10 tests (crítico)
- [ ] RLS policies de `exercise_attempts` - 8 tests
- [ ] `update_module_progress()` function - 7 tests
- [ ] Triggers de auditoría - 5 tests

**Esfuerzo:** 3 semanas, 2 devs full-time

---

#### Sprint 5-6 (Marzo 2026): Portal Maestros

**Módulos:**
- ✅ EXT-001: Portal Maestros (12% → 45%)

**Áreas de enfoque:**

**Backend (15% → 60%):**
- [ ] `assignments.service.ts`
  - Create assignment - 6 tests
  - Assign to students - 8 tests
  - Grade submissions - 10 tests
- [ ] `classroom.service.ts`
  - Manage students - 7 tests
  - Classroom stats - 5 tests

**Frontend (10% → 40%):**
- [ ] `AssignmentForm.tsx` - Creación asignaciones
- [ ] `StudentList.tsx` - Gestión estudiantes
- [ ] `GradingInterface.tsx` - Calificación

**Database (0% → 20%):**
- [ ] RLS policies de `assignments` - 8 tests
- [ ] RLS policies de `classrooms` - 6 tests
- [ ] `assign_to_students()` function - 5 tests

**Esfuerzo:** 3 semanas, 1 dev full-time

---

**Resumen Q1 2026:**
- **Coverage:** 13% → **40%** (+27%)
- **Backend:** 17% → **45%** (+28%)
- **Frontend:** 8% → **35%** (+27%)
- **Database:** 0% → **20%** (+20%)
- **Esfuerzo total:** 9 semanas-dev
- **Inversión:** ~2.5 devs full-time x 3 meses

---

### FASE 2: Q2 2026 - Tests Importantes P1 (Abril-Junio)

**Meta:** 60% overall coverage (+20%)

#### Sprint 7-8 (Abril 2026): Actividades Educativas

**Módulos:**
- ✅ EAI-002: Actividades completo (50% → 70%)
- ✅ EAI-004: Analytics (10% → 40%)

**Backend Actividades (60% → 80%):**
- [ ] Validadores de ejercicios
  - Multiple choice validator - 8 tests
  - True/False validator - 6 tests
  - Drag&Drop validator - 10 tests
  - Essay validator - 12 tests
- [ ] `exercise.service.ts`
  - Get exercise by type - 5 tests
  - Filter by difficulty - 6 tests
  - Exercise metadata - 4 tests

**Backend Analytics (15% → 50%):**
- [ ] `analytics.service.ts`
  - User stats calculation - 10 tests
  - Module completion rates - 8 tests
  - Time spent analytics - 6 tests
- [ ] `reports.service.ts`
  - Generate reports - 8 tests
  - Export functionality - 5 tests

**Frontend (35% → 55%):**
- [ ] Componentes de mecánicas de ejercicios (10 componentes)
- [ ] `AnalyticsDashboard.tsx`
- [ ] `ReportsView.tsx`

**Database (20% → 45%):**
- [ ] Validadores de ejercicios functions - 15 tests
- [ ] Analytics views - 8 tests
- [ ] Aggregation functions - 10 tests

**Esfuerzo:** 3 semanas, 2 devs

---

#### Sprint 9-10 (Mayo 2026): Admin y Notificaciones

**Módulos:**
- ✅ EAI-005: Admin Base (15% → 50%)
- ✅ EXT-003: Notificaciones (15% → 50%)

**Backend (20% → 65%):**
- [ ] `admin.service.ts` - Gestión sistema
- [ ] `notifications.service.ts` - Envío notificaciones
- [ ] `notification-queue.service.ts` - Queue management
- [ ] Email/SMS templates - Tests

**Frontend (10% → 45%):**
- [ ] Admin panels (5 componentes)
- [ ] Notification center
- [ ] Notification preferences

**Database (20% → 50%):**
- [ ] `send_notification()` function - 8 tests
- [ ] `queue_notification()` function - 6 tests
- [ ] Notification triggers - 10 tests

**Esfuerzo:** 3 semanas, 2 devs

---

#### Sprint 11-12 (Junio 2026): Reportes y Perfiles

**Módulos:**
- ✅ EXT-005: Reportes (12% → 45%)
- ✅ EXT-004: Perfiles (10% → 45%)

**Backend (17% → 60%):**
- [ ] `reports.service.ts` completo
- [ ] `profiles.service.ts`
- [ ] Export/Import functionality
- [ ] PDF generation tests

**Frontend (8% → 40%):**
- [ ] Report builder
- [ ] Profile editor
- [ ] Export interfaces

**Database (40% → 60%):**
- [ ] Report generation functions - 12 tests
- [ ] Profile RLS policies - 8 tests
- [ ] Data aggregation - 10 tests

**Esfuerzo:** 3 semanas, 2 devs

---

**Resumen Q2 2026:**
- **Coverage:** 40% → **60%** (+20%)
- **Backend:** 45% → **65%** (+20%)
- **Frontend:** 35% → **55%** (+20%)
- **Database:** 20% → **40%** (+20%)
- **Esfuerzo total:** 9 semanas-dev
- **Inversión:** ~2 devs full-time x 3 meses

---

### FASE 3: Q3 2026 - Tests Avanzados P2 (Julio-Septiembre)

**Meta:** 75% overall coverage (+15%)

#### Sprint 13-14 (Julio 2026): Contenido y Config

**Módulos:**
- ✅ EAI-006: Config Sistema (8% → 40%)
- ✅ EXT-006: CMS Contenido (10% → 45%)

**Backend (20% → 70%):**
- [ ] `content-management.service.ts`
- [ ] `system-config.service.ts`
- [ ] Content versioning tests
- [ ] Configuration validation

**Frontend (10% → 50%):**
- [ ] Content editor
- [ ] System settings
- [ ] Configuration UI

**Database (40% → 70%):**
- [ ] Content CRUD functions - 15 tests
- [ ] Config validation functions - 10 tests
- [ ] Versioning triggers - 8 tests

**Esfuerzo:** 3 semanas, 2 devs

---

#### Sprint 15-16 (Agosto 2026): Integraciones

**Módulos:**
- ✅ EXT-007: LTI Integration (5% → 35%)
- ✅ EXT-008: White Label (3% → 35%)

**Backend (10% → 60%):**
- [ ] `lti.service.ts` - LTI 1.3 flows
- [ ] `white-label.service.ts` - Branding
- [ ] OAuth flows tests
- [ ] Multi-tenant styling

**Frontend (5% → 40%):**
- [ ] LTI launch components
- [ ] White label configuration
- [ ] Theme switcher

**Database (40% → 75%):**
- [ ] LTI integration tables tests - 12 tests
- [ ] White label config tests - 10 tests
- [ ] Tenant isolation RLS - 15 tests

**Esfuerzo:** 3 semanas, 2 devs

---

#### Sprint 17-18 (Septiembre 2026): Features Sociales

**Módulos:**
- ✅ EXT-009: Peer Challenges (8% → 40%)
- ✅ EXT-010: Parent Portal (5% → 40%)

**Backend (13% → 65%):**
- [ ] `challenges.service.ts`
- [ ] `parent-portal.service.ts`
- [ ] Challenge matchmaking
- [ ] Parent notifications

**Frontend (7% → 45%):**
- [ ] Challenge interface
- [ ] Parent dashboard
- [ ] Social features

**Database (70% → 85%):**
- [ ] Challenge functions - 15 tests
- [ ] Parent access RLS - 12 tests
- [ ] Social features tests - 10 tests

**Esfuerzo:** 3 semanas, 2 devs

---

**Resumen Q3 2026:**
- **Coverage:** 60% → **75%** (+15%)
- **Backend:** 65% → **80%** (+15%)
- **Frontend:** 55% → **70%** (+15%)
- **Database:** 40% → **65%** (+25%)
- **Esfuerzo total:** 9 semanas-dev
- **Inversión:** ~2 devs full-time x 3 meses

---

### FASE 4: Q4 2026 - Refinamiento y Meta (Octubre-Diciembre)

**Meta:** 88% overall coverage (+13%)

#### Sprint 19-20 (Octubre 2026): Completar Database

**Enfoque:** Database al 85%

**Database (65% → 85%):**
- [ ] Completar tests de funciones faltantes
- [ ] Tests exhaustivos de RLS policies (crítico)
- [ ] Tests de triggers y constraints
- [ ] Tests de índices y performance
- [ ] Tests de migraciones

**Áreas críticas:**
- [ ] All RLS policies (100% coverage)
- [ ] Audit logging functions
- [ ] Data integrity constraints
- [ ] Cascade delete behaviors

**Esfuerzo:** 3 semanas, 1 dev especializado DB

---

#### Sprint 21-22 (Noviembre 2026): Completar Frontend

**Enfoque:** Frontend al 87%

**Frontend (70% → 87%):**
- [ ] Tests de componentes faltantes
- [ ] Tests de hooks personalizados
- [ ] Tests de stores (Zustand)
- [ ] Tests de integración E2E
- [ ] Tests de accessibility

**Áreas críticas:**
- [ ] Flujos críticos de usuario
- [ ] Error boundaries
- [ ] Loading states
- [ ] Form validations
- [ ] Responsive behavior

**Esfuerzo:** 3 semanas, 2 devs frontend

---

#### Sprint 23-24 (Diciembre 2026): Completar Backend y E2E

**Enfoque:** Backend al 92% + E2E completos

**Backend (80% → 92%):**
- [ ] Completar services faltantes
- [ ] Edge cases y error handling
- [ ] Integration tests entre módulos
- [ ] Performance tests
- [ ] Security tests

**E2E (Cypress):**
- [ ] Flujo completo estudiante (registro → certificación)
- [ ] Flujo completo maestro (asignación → calificación)
- [ ] Flujo completo admin (configuración → reportes)
- [ ] Tests cross-browser
- [ ] Tests de regresión críticos

**Esfuerzo:** 3 semanas, 2 devs

---

**Resumen Q4 2026:**
- **Coverage:** 75% → **88%** (+13%)
- **Backend:** 80% → **92%** (+12%)
- **Frontend:** 70% → **87%** (+17%)
- **Database:** 65% → **85%** (+20%)
- **Esfuerzo total:** 9 semanas-dev
- **Inversión:** ~1.5 devs full-time x 3 meses

---

## 📊 INVERSIÓN TOTAL

### Recursos Requeridos

| Trimestre | Devs Full-Time Equiv. | Semanas | Total Semanas-Dev |
|-----------|----------------------|---------|-------------------|
| Q1 2026 | 2.5 | 12 | 30 |
| Q2 2026 | 2.0 | 12 | 24 |
| Q3 2026 | 2.0 | 12 | 24 |
| Q4 2026 | 1.5 | 12 | 18 |
| **TOTAL** | **- | 48 semanas | **96 semanas-dev** |

**Promedio:** 2 devs dedicados a testing durante 12 meses

---

### Presupuesto Estimado

**⚠️ A DEFINIR POR TECH LEAD Y PRODUCT OWNER**

**Estimación preliminar:**

| Concepto | Cantidad | Costo Unitario | Total |
|----------|----------|----------------|-------|
| **Desarrolladores (testing)** | 2 devs x 12 meses | [TBD]/mes | [TBD] |
| **QA Engineer (soporte)** | 1 QA x 6 meses | [TBD]/mes | [TBD] |
| **Herramientas Testing** | | | |
| - Jest/Vitest (incluido) | - | $0 | $0 |
| - Cypress Cloud | 12 meses | [TBD]/mes | [TBD] |
| - pgTAP setup | Una vez | [TBD] | [TBD] |
| **CI/CD adicional** | Compute time | [TBD] | [TBD] |
| **Capacitación** | Testing best practices | [TBD] | [TBD] |
| **Contingencia (15%)** | - | - | [TBD] |
| **TOTAL ESTIMADO** | **12 meses** | - | **[TBD]** |

---

## 🛠️ HERRAMIENTAS Y FRAMEWORKS

### Backend Testing

**Framework principal:** Jest
- Unit tests de services
- Integration tests de controllers
- Mocking de dependencies

**Herramientas adicionales:**
- Supertest (API testing)
- TypeORM test utilities
- Faker.js (test data)

---

### Frontend Testing

**Framework principal:** Vitest + React Testing Library
- Unit tests de componentes
- Unit tests de hooks
- Unit tests de stores (Zustand)

**E2E:** Cypress
- Flujos críticos de usuario
- Cross-browser testing
- Visual regression testing

**Herramientas adicionales:**
- @testing-library/user-event
- MSW (Mock Service Worker)
- Storybook (visual testing)

---

### Database Testing

**Framework:** pgTAP
- Tests de funciones PostgreSQL
- Tests de triggers
- Tests de RLS policies
- Tests de constraints

**Setup:**
```sql
CREATE EXTENSION pgtap;

-- Ejemplo test
SELECT plan(5);

SELECT has_table('gamification_system', 'achievements',
  'achievements table exists');

SELECT has_function('gamification_system', 'check_and_unlock_achievement',
  ARRAY['uuid', 'integer'], 'function exists with correct signature');

SELECT finish();
```

**CI/CD Integration:**
- Tests ejecutados en pipeline
- Test database separada
- Rollback automático post-tests

---

## 📏 MÉTRICAS Y KPIs

### Métricas Principales (Semanales)

1. **Coverage Overall** (meta: +2% por semana en promedio)
2. **Tests Agregados** (meta: 50-100 tests nuevos por semana)
3. **Tests Fallando** (meta: < 5% del total)
4. **Tiempo Ejecución Tests** (meta: < 10 minutos total)

### Métricas de Calidad (Mensuales)

5. **Bugs en Producción** (meta: -30% vs baseline)
6. **Bugs Detectados en Tests** (meta: +50% vs QA manual)
7. **Regresiones Detectadas** (meta: 100% antes de producción)
8. **Tiempo Promedio Fix Bug** (meta: -40%)

### Métricas de Proceso (Trimestrales)

9. **Velocity Desarrollo** (meta: +20% con tests)
10. **Confianza Desarrolladores** (meta: 8/10 en encuestas)
11. **Tiempo Onboarding** (meta: -30%)
12. **Refactoring Rate** (meta: +50%)

---

## 🚨 POLÍTICA DE COVERAGE PARA NUEVOS FEATURES

### Obligatorio (Enforceable en CI/CD)

**A partir de 2026-01-01:**

1. **Nuevos features:** Coverage mínimo **70%**
   - Backend services: ≥ 80%
   - Frontend components: ≥ 70%
   - Database functions: ≥ 85%

2. **Bug fixes críticos:** Test de regresión **obligatorio**
   - Test debe reproducir el bug
   - Test debe pasar después del fix
   - Test debe agregarse al suite permanente

3. **Refactoring:** Coverage **no puede disminuir**
   - Si coverage era 60%, debe permanecer ≥ 60%
   - Preferiblemente aumentar durante refactoring

4. **Pull Requests:**
   - CI/CD bloquea merge si coverage disminuye > 2%
   - Excepción requiere aprobación de Tech Lead
   - Comentario obligatorio justificando excepción

---

### Recomendado (Best Practices)

5. **TDD para lógica compleja**
   - Gamificación (cálculos de XP, rangos)
   - Validadores de ejercicios
   - Lógica de negocio crítica

6. **Tests de integración para flujos críticos**
   - Login/Logout
   - Envío de ejercicio
   - Asignación de tareas

7. **E2E para happy paths**
   - Registro → Completar módulo → Certificación
   - Maestro crea asignación → Estudiante completa → Calificación

---

### CI/CD Configuration

```yaml
# .github/workflows/test-coverage.yml

name: Test Coverage Check

on: [pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Check coverage thresholds
        run: |
          npm run coverage:check
          # Fails if:
          # - Overall < 70% (nuevos features)
          # - Coverage decreased > 2%

      - name: Comment PR with coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-summary.json
```

---

## 🎓 CAPACITACIÓN Y SOPORTE

### Capacitación Inicial (Enero 2026)

**Workshop: Testing Best Practices (2 días)**

**Día 1: Backend Testing**
- Jest fundamentals
- Mocking strategies
- Integration testing
- Database testing con pgTAP

**Día 2: Frontend Testing**
- Vitest + React Testing Library
- Component testing patterns
- Hooks testing
- E2E con Cypress

**Materiales:**
- 📚 Guía interna de testing
- 🎥 Videos de referencia
- 💻 Ejemplos de código (repo samples)
- 📋 Checklists de testing

---

### Soporte Continuo

**Office Hours:** Semanal (1 hora)
- Tech Lead disponible para consultas
- Revisión de tests complejos
- Pair programming si necesario

**Code Reviews:**
- Enfoque en calidad de tests
- Feedback constructivo
- Compartir best practices

**Knowledge Sharing:**
- Lightning talks mensuales
- Compartir casos interesantes
- Documentar patterns comunes

---

## ⚠️ RIESGOS Y MITIGACIONES

### Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Resistencia del equipo** | Media | Alto | Capacitación, pair programming, celebrar wins |
| **Tiempo desarrollo aumenta** | Alta | Medio | Inicial sí, luego disminuye. Medir velocity |
| **Tests frágiles (flaky)** | Media | Medio | Code review estricto, retry logic, stability checks |
| **Mantenimiento tests costoso** | Media | Medio | DRY principles, factories, buenos naming |
| **CI/CD lento** | Media | Alto | Paralelización, caching, tests selectivos |
| **Coverage inflation** | Baja | Alto | Reviews manual, medir calidad no solo cantidad |
| **Recursos insuficientes** | Media | Alto | Priorizar P0/P1, hiring anticipado, contractors |

---

### Plan de Contingencia

**Si se retrasa Q1:**
- Extender Q1 a 4 meses (Abril)
- Posponer Q2 un mes
- Ajustar meta final a 85% (realistic)

**Si resistencia del equipo es alta:**
- Sesiones 1-on-1 con Tech Lead
- Incentivar contributions
- Mostrar beneficios concretos (menos bugs)

**Si CI/CD se vuelve muy lento (> 15 min):**
- Implementar test sharding
- Caching agresivo de dependencies
- Tests selectivos (solo archivos cambiados)

---

## 📊 DASHBOARD DE PROGRESO

### Métricas en Tiempo Real

**Herramienta:** Codecov / SonarQube

**Dashboard incluye:**
- 📈 Coverage overall trend (semanal)
- 📊 Coverage por módulo (comparación)
- 🎯 Progreso vs meta trimestral
- 🐛 Tests fallando actualmente
- ⏱️ Tiempo ejecución tests
- 📝 Tests agregados/eliminados por semana

**Acceso:** Público para todo el equipo

---

### Reportes Mensuales

**Responsable:** Tech Lead

**Contenido:**
- Estado actual vs meta
- Módulos con mayor progreso
- Módulos retrasados (y por qué)
- Bugs detectados por tests vs QA manual
- Velocity antes/después de tests
- Próximas prioridades

**Audiencia:** Tech Lead, Product Owner, Equipo de desarrollo

---

## 🎯 CRITERIOS DE ÉXITO

### Por Fase

**Q1 2026 Exitoso si:**
- ✅ Coverage overall ≥ 40%
- ✅ Módulos críticos (auth, gamificación) ≥ 65%
- ✅ Database coverage ≥ 20%
- ✅ Zero regresiones críticas en producción

**Q2 2026 Exitoso si:**
- ✅ Coverage overall ≥ 60%
- ✅ Backend ≥ 65%
- ✅ Frontend ≥ 55%
- ✅ Bugs en producción -20% vs baseline

**Q3 2026 Exitoso si:**
- ✅ Coverage overall ≥ 75%
- ✅ Database ≥ 65%
- ✅ Todos los módulos core ≥ 70%
- ✅ Velocity desarrollo +15%

**Q4 2026 Exitoso si:**
- ✅ **Coverage overall ≥ 88%** (meta alcanzada)
- ✅ Backend ≥ 92%
- ✅ Frontend ≥ 87%
- ✅ Database ≥ 85%
- ✅ Política de 70% para nuevos features enforced

---

### Métricas de Negocio

**Al finalizar 2026:**
- 📉 Bugs en producción: -50% vs 2025
- 📈 Velocity desarrollo: +25% vs inicio
- ⏱️ Tiempo promedio fix bug: -40%
- 👥 Satisfacción equipo: 8/10
- 💰 Costo QA manual: -30%

---

## 📎 REFERENCIAS

### Documentación Interna

- **Gap Analysis:** REPORTE-COHERENCIA-DOCUMENTACION-CODIGO-2025-11-23.md
- **Gap-4 Detail:** REPORTE-ACTUALIZACION-TEST-COVERAGE-GAP4-2025-11-23.md
- **17 TRACEABILITY.yml:** Métricas actualizadas con coverage real

### Best Practices

- **Jest Best Practices:** https://jestjs.io/docs/tutorial-async
- **React Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **pgTAP Documentation:** https://pgtap.org/documentation.html
- **Cypress Best Practices:** https://docs.cypress.io/guides/references/best-practices

### Herramientas

- **Codecov:** https://about.codecov.io/
- **SonarQube:** https://www.sonarqube.org/
- **Cypress Cloud:** https://www.cypress.io/cloud

---

## 🔄 CHANGELOG

### [1.0] - 2025-11-23

**Creado por:** Architecture-Analyst + Tech Lead (pendiente)

**Contenido inicial:**
- Situación actual documentada (gap -74%)
- Roadmap 12 meses (Q1-Q4 2026)
- Metas por fase definidas
- Inversión estimada (96 semanas-dev)
- Política de coverage para nuevos features
- Herramientas y frameworks especificados
- Métricas y KPIs establecidos
- Riesgos identificados con mitigaciones

**Referencias:**
- GAP-4: Test coverage metrics incorrectos
- REPORTE-ACTUALIZACION-TEST-COVERAGE-GAP4-2025-11-23.md
- 17 TRACEABILITY.yml con métricas reales

**Estado:** DRAFT - Pendiente de aprobación por Tech Lead y Product Owner

---

## ✅ PRÓXIMOS PASOS INMEDIATOS

1. **Tech Lead:** Revisar y aprobar roadmap
2. **Tech Lead + Product Owner:** Definir presupuesto y priorizar vs otros proyectos
3. **Tech Lead:** Asignar 2 devs para Q1 2026 (Enero inicio)
4. **Architecture-Analyst:** Programar capacitación (Workshop 2 días - Enero)
5. **Tech Lead:** Configurar CI/CD con thresholds de coverage
6. **Tech Lead:** Crear dashboard de progreso (Codecov/SonarQube)

---

**Versión:** 1.0 DRAFT
**Próxima revisión:** Tras aprobación de Tech Lead
**Aprobación pendiente:** Tech Lead, Product Owner
**Prioridad:** 🔴 CRÍTICA

---

**FIN DEL ROADMAP**
