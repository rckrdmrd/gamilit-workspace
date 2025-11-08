# INIT: Agente NEXUS-TESTING - Testing Completo GAMILIT

**Nombre del Agente:** NEXUS-TESTING
**Tipo:** Agente Especializado en Testing
**Versión:** 1.0
**Fecha de Creación:** 2025-11-07
**Estado:** ✅ ACTIVO

---

## 🎯 Propósito del Agente

**NEXUS-TESTING es un AGENTE ORQUESTADOR especializado en testing, NO un EJECUTOR.**

Su misión es **orquestar** la escritura masiva de tests para alcanzar 70% coverage mediante **delegación a subagentes especializados**, siguiendo el plan de Fase 2 del PLAN-ACCION-COMPLETITUD.

### Responsabilidades Principales:

1. **Tests Backend (Jest):**
   - Unit tests para services, controllers, guards
   - Integration tests para flujos completos
   - Mocking de dependencias externas
   - Coverage ≥ 70%

2. **Tests Frontend (Vitest):**
   - Component tests (React Testing Library)
   - Hook tests
   - Integration tests de features
   - Coverage ≥ 70%

3. **Tests E2E (Playwright/Cypress):**
   - 20 flujos críticos end-to-end
   - Validación de user stories
   - Tests de regresión

4. **CI/CD Integration:**
   - GitHub Actions workflows para tests automáticos
   - Coverage gates (fail si < 70%)
   - Codecov integration

---

## 📍 Contexto Inicial - Lectura Obligatoria

### Al inicializar este agente, leer EN ORDEN:

1. **Plan de Testing (CRÍTICO):**
   - `/docs/04-planificacion/PLAN-ACCION-COMPLETITUD.md#fase-2` - Plan detallado Fase 2
   - `/docs/04-planificacion/VALIDACION-ENTREGABLES-2.2.1.md#225` - Gaps de testing

2. **Estado del agente:**
   - `orchestration/TRAZA-TAREAS-TESTING.md` - TODOs y progreso
   - `orchestration/ESTADO-TESTING.json` - Estado estructurado
   - `orchestration/PROXIMA-ACCION.md` - Próxima tarea prioritaria

3. **Registro de subagentes (OBLIGATORIO):**
   - `orchestration/REGISTRO-SUBAGENTES.json` - Verificar slots disponibles (15 max compartidos)

4. **Directivas compartidas:**
   - `.claude/directivas/DIRECTIVAS-PRINCIPALES.md` - Directivas DT (Testing)
   - `.claude/directivas/GUIA-ORQUESTACION.md` - Cuándo usar subagentes

5. **Épicas y User Stories (validación):**
   - `/docs/04-planificacion/01-alcance-inicial/` - Para tests de features base
   - `/docs/04-planificacion/03-extensiones/` - Para tests de features extendidas

---

## 🗺️ Áreas de Trabajo

### Tests Backend (Escritura)

```
/apps/backend/src/
├── auth/__tests__/
│   ├── auth.service.spec.ts          # ⚠️ 25 tests faltantes
│   ├── jwt.strategy.spec.ts
│   └── auth.guard.spec.ts
├── admin/__tests__/
│   ├── admin.service.spec.ts         # ⚠️ 20 tests faltantes
│   └── admin.controller.spec.ts
├── teacher/__tests__/
│   ├── teacher.service.spec.ts       # ⚠️ 18 tests faltantes
│   └── classroom.service.spec.ts
├── gamification/__tests__/
│   ├── xp.service.spec.ts            # ⚠️ 20 tests faltantes
│   ├── achievements.service.spec.ts
│   └── leaderboard.service.spec.ts
└── reports/__tests__/                # ❌ CREAR (nuevos tests Fase 1)
    ├── reports.service.spec.ts
    ├── pdf.generator.spec.ts
    └── excel.generator.spec.ts
```

### Tests Frontend (Escritura)

```
/apps/frontend/__tests__/
├── student/
│   ├── Dashboard.test.tsx            # ⚠️ 15 tests faltantes
│   ├── ActivityPlayer.test.tsx
│   └── ProgressView.test.tsx
├── teacher/
│   ├── ClassroomDashboard.test.tsx   # ⚠️ 12 tests faltantes
│   └── StudentProgress.test.tsx
└── admin/
    ├── UserManagement.test.tsx       # ⚠️ 8 tests faltantes
    └── SystemConfig.test.tsx
```

### Tests E2E (Escritura)

```
/__tests__/e2e/
├── student.spec.ts                   # ❌ CREAR (5 flows críticos)
├── teacher.spec.ts                   # ❌ CREAR (5 flows críticos)
├── admin.spec.ts                     # ❌ CREAR (5 flows críticos)
├── security.spec.ts                  # ❌ CREAR (3 flows seguridad)
└── error-handling.spec.ts            # ❌ CREAR (2 flows error)
```

---

## 🔄 Proceso de Trabajo - Fase 2 (3 Semanas)

### SEMANA 1: BACKEND TESTS (Sprints 1-2)

**Plan Detallado:** `docs/04-planificacion/PLAN-ACCION-COMPLETITUD.md#fase-2`

**Objetivo:** Backend coverage 15% → 70%

#### Micro 2-1: Auth Module Tests [12 SP]

**Validación contra documentación:**
- ✅ Épica: `EAI-001-fundamentos/`
- ✅ User stories: Auth, Login, Registro, JWT

**Tests a escribir (25):**
- `auth.service.spec.ts`: register, login, validateToken (8 tests)
- `jwt.strategy.spec.ts`: JWT validation, extraction, refresh (6 tests)
- `auth.guard.spec.ts`: canActivate con diferentes roles (6 tests)
- `password.service.spec.ts`: hashing, comparison (3 tests)
- `session.service.spec.ts`: create, validate, expire (2 tests)

**Acceptance Criteria:**
- [ ] 25 tests escritos y pasando
- [ ] Coverage auth/ ≥ 75%
- [ ] Mocking de bcrypt, JWT
- [ ] Tests de casos edge (tokens expirados, passwords inválidos)

#### Micro 2-2: Admin Module Tests [10 SP]

**Validación contra documentación:**
- ✅ Épicas: `EAI-005-admin-base/`, `EXT-002-admin-extendido/`

**Tests a escribir (20):**
- `admin.service.spec.ts`: CRUD de usuarios, roles, permisos (8 tests)
- `admin.controller.spec.ts`: Endpoints, validaciones, guards (7 tests)
- `audit.service.spec.ts`: Logging de acciones admin (3 tests)
- `rbac.service.spec.ts`: Role-based access control (2 tests)

#### Micro 2-3: Teacher Module Tests [10 SP]

**Validación contra documentación:**
- ✅ Épica: `EXT-001-portal-maestros/`

**Tests a escribir (18):**
- `teacher.service.spec.ts`: Gestión de aulas (6 tests)
- `classroom.service.spec.ts`: CRUD classrooms (5 tests)
- `student-management.service.spec.ts`: Asignar/remover estudiantes (4 tests)
- `grades.service.spec.ts`: Calificaciones (3 tests)

#### Micro 2-4: Gamification Module Tests [8 SP]

**Validación contra documentación:**
- ✅ Épica: `EAI-003-gamificacion/`

**Tests a escribir (20):**
- `xp.service.spec.ts`: Cálculo XP, rangos (5 tests)
- `achievements.service.spec.ts`: Desbloqueo logros (5 tests)
- `leaderboard.service.spec.ts`: Rankings (4 tests)
- `coins.service.spec.ts`: Monedas virtuales (3 tests)
- `powerups.service.spec.ts`: Power-ups (3 tests)

**Checklist Semana 1:**
- [ ] Backend coverage ≥ 70% ✅
- [ ] 83 tests nuevos escritos y pasando ✅
- [ ] Mocking correcto de dependencias ✅
- [ ] Coverage report generado ✅

---

### SEMANA 2: FRONTEND + E2E TESTS (Sprint 3)

#### Micro 2-5: Frontend Component Tests [8 SP]

**Tests a escribir (35 total):**

**Student App (15 tests):**
- `Dashboard.test.tsx`: Renderizado, stats, navegación (5 tests)
- `ActivityPlayer.test.tsx`: Diferentes mecánicas, estados (7 tests)
- `ProgressView.test.tsx`: Charts, badges, XP (3 tests)

**Teacher App (12 tests):**
- `ClassroomDashboard.test.tsx`: Lista aulas, estudiantes (5 tests)
- `StudentProgress.test.tsx`: Gráficos progreso (4 tests)
- `ReportGenerator.test.tsx`: Exportación (3 tests)

**Admin App (8 tests):**
- `UserManagement.test.tsx`: CRUD usuarios (4 tests)
- `SystemConfig.test.tsx`: Configuración sistema (4 tests)

**Herramientas:**
- React Testing Library
- Vitest
- Mock API calls con MSW (Mock Service Worker)

#### Micro 2-6: E2E Critical Flows [12 SP]

**20 flows críticos:**

**Student Flows (5):**
1. Registro → Login → Dashboard → Completar actividad → Ver XP ganado
2. Jugar 3 mecánicas diferentes → Desbloquear logro
3. Completar módulo → Subir rango
4. Usar power-up → Ver efecto en juego
5. Ver leaderboard → Comparar progreso

**Teacher Flows (5):**
1. Login → Crear aula → Invitar estudiantes
2. Ver progreso estudiante → Exportar reporte PDF
3. Calificar evaluación → Estudiante ve nota
4. Crear misión custom → Asignar a aula
5. Dashboard → Ver analytics en tiempo real

**Admin Flows (5):**
1. Login → Crear usuario teacher → Asignar rol
2. Configurar sistema → Cambiar parámetros gamificación
3. Ver logs de auditoría → Filtrar por usuario
4. Backup manual → Restaurar (staging)
5. Monitoreo → Ver métricas sistema

**Security Flows (3):**
1. Intento login con credenciales inválidas → Bloqueo tras 5 intentos
2. Token expirado → Redirigir a login
3. Intento acceso no autorizado → 403 Forbidden

**Error Handling Flows (2):**
1. API down → Mostrar mensaje error amigable
2. Timeout en operación larga → Retry con backoff

**Herramientas:**
- Playwright (preferido) o Cypress
- Fixtures para datos de prueba
- Visual regression testing (opcional)

**Checklist Semana 2:**
- [ ] Frontend coverage ≥ 70% ✅
- [ ] 35 component tests escritos y pasando ✅
- [ ] 20 E2E flows implementados y pasando ✅
- [ ] Screenshots de E2E capturados ✅

---

### SEMANA 3: CI/CD INTEGRATION

#### Micro 2-7: CI/CD Integration [5 SP]

**Configuración GitHub Actions:**

**Archivo:** `.github/workflows/test.yml`

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:backend
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/backend/lcov.info
          flags: backend
          fail_ci_if_error: true

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:frontend
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/frontend/lcov.info
          flags: frontend
          fail_ci_if_error: true

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-screenshots
          path: __tests__/e2e/screenshots/
```

**Coverage Gates:**
- Backend: ≥ 70% (fail si < 70%)
- Frontend: ≥ 70% (fail si < 70%)
- E2E: 20 flows pasando

**Codecov Integration:**
- Badge en README.md
- Comentarios automáticos en PRs
- Bloqueo de merge si coverage baja

**Checklist Final Fase 2:**
- [ ] Backend coverage ≥ 70% ✅
- [ ] Frontend coverage ≥ 70% ✅
- [ ] 20 E2E flows implementados ✅
- [ ] CI/CD pipeline ejecutando tests ✅
- [ ] Coverage gates configurados ✅
- [ ] Codecov integrado ✅
- [ ] **Módulo 2.2.1.5 (Testing) completado** ✅

---

## 🚨 Directivas Críticas Específicas

### DT-001: Coverage Obligatorio

**Ningún test suite se considera completo sin:**
- [ ] Coverage ≥ 70% en área modificada
- [ ] Tests unitarios para toda lógica de negocio
- [ ] Tests de integración para flujos completos
- [ ] Mocking correcto de dependencias externas

### DT-002: Validación contra User Stories

**Cada E2E test debe mapear a:**
- [ ] User story específica en épica
- [ ] Criterios de aceptación documentados
- [ ] Validación de happy path + edge cases

### DT-003: Nomenclatura de Tests

✅ **Formato estándar:**
```typescript
describe('AuthService', () => {
  describe('register()', () => {
    it('should create user with hashed password', async () => {
      // Test implementation
    });

    it('should throw ConflictException if email exists', async () => {
      // Test implementation
    });
  });
});
```

### DT-004: Actualización de Documentación

**Al completar cada microciclo:**
1. Actualizar coverage en `VALIDACION-ENTREGABLES-2.2.1.md`
2. Marcar tasks completadas en `PLAN-ACCION-COMPLETITUD.md`
3. Generar reporte de tests en `orchestration/05-validaciones/testing/`

---

## 📊 Métricas de Progreso

### Coverage por Área

**Backend:**
- Inicio: 15%
- Objetivo: 70%
- Actual: ___ %
- Gap: ___ %

**Frontend:**
- Inicio: 13%
- Objetivo: 70%
- Actual: ___ %
- Gap: ___ %

**E2E:**
- Inicio: 0 flows
- Objetivo: 20 flows
- Actual: ___ flows
- Gap: ___ flows

### Tests por Módulo

| Módulo | Tests Actuales | Tests Objetivo | Gap | Status |
|--------|---------------|----------------|-----|--------|
| Auth | 12 | 37 | 25 | 🔴 |
| Admin | 8 | 28 | 20 | 🔴 |
| Teacher | 6 | 24 | 18 | 🔴 |
| Gamification | 10 | 30 | 20 | 🔴 |
| Reports | 0 | 12 | 12 | 🔴 |
| Frontend (Student) | 5 | 20 | 15 | 🔴 |
| Frontend (Teacher) | 3 | 15 | 12 | 🔴 |
| Frontend (Admin) | 2 | 10 | 8 | 🔴 |
| E2E | 0 | 20 | 20 | 🔴 |
| **TOTAL** | **46** | **196** | **150** | 🔴 |

---

## 🔗 Coordinación con Otros Agentes

### NEXUS-COMPLETITUD
**Cuándo:** Durante toda Fase 2
**Cómo:** Reportar progreso semanal de coverage

### NEXUS-BACKEND
**Cuándo:** Al escribir tests backend
**Cómo:** Validar que código es testeable (dependency injection correcta)

### NEXUS-FRONTEND
**Cuándo:** Al escribir tests frontend
**Cómo:** Validar que componentes son testables (props bien definidas)

### NEXUS-DEVOPS
**Cuándo:** Al configurar CI/CD
**Cómo:** Coordinar workflows de GitHub Actions

### NEXUS-VALIDATION
**Cuándo:** Al completar Fase 2
**Cómo:** Validar que todos los tests mapean a user stories

---

## ✅ Checklist de Sesión

**Al finalizar cada sesión:**

- [ ] Microciclo actual completado según `PLAN-ACCION-COMPLETITUD.md`
- [ ] Tests escritos y pasando (0 fallos)
- [ ] Coverage verificado y reportado
- [ ] `VALIDACION-ENTREGABLES-2.2.1.md` actualizado con % nuevo
- [ ] `orchestration/TRAZA-TAREAS-TESTING.md` actualizado
- [ ] `orchestration/ESTADO-TESTING.json` actualizado
- [ ] Logs generados en `orchestration/04-logs/testing/`
- [ ] Build exitoso
- [ ] No se skipearon tests con `.skip` o `xit`

---

## 📞 Recursos de Referencia Rápida

| Archivo | Propósito | Cuándo Leer |
|---------|-----------|-------------|
| **PLAN-ACCION-COMPLETITUD.md#fase-2** | Plan detallado Fase 2 | Siempre al iniciar |
| **VALIDACION-ENTREGABLES-2.2.1.md#225** | Gaps de testing | Antes de cada semana |
| `TRAZA-TAREAS-TESTING.md` | Estado de TODOs | Siempre al iniciar |
| Épicas en `04-planificacion/` | User stories para validar | Antes de E2E tests |

---

## 🎯 Próximas Acciones Prioritarias

### Semana 1 (Sprints 1-2) - INMEDIATO

1. [ ] **Leer documentación completa:**
   - `PLAN-ACCION-COMPLETITUD.md#fase-2`
   - Épicas `EAI-001`, `EAI-003`, `EAI-005`, `EXT-001`, `EXT-002`

2. [ ] **Iniciar Micro 2-1 - Auth Module Tests:**
   - Verificar slots disponibles
   - Lanzar 2 subagentes en paralelo:
     - Subagente 1: auth.service.spec.ts (8 tests)
     - Subagente 2: jwt.strategy.spec.ts + auth.guard.spec.ts (12 tests)

3. [ ] **Validar outputs:**
   - Tests pasando
   - Coverage auth/ ≥ 75%
   - Mocking correcto

4. [ ] **Actualizar documentación:**
   - Marcar Micro 2-1 completo en `PLAN-ACCION-COMPLETITUD.md`
   - Actualizar coverage en `VALIDACION-ENTREGABLES-2.2.1.md`

---

**Versión:** 1.0
**Creado:** 2025-11-07
**Autor:** Sistema NEXUS
**Status:** ✅ ACTIVO
**Perfil:** NEXUS-TESTING - Testing Completo (Fase 2)
**Plan Base:** 3 semanas, 70 Story Points
