# ANALISIS DE IMPACTO

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Fecha:** 2025-12-23
**Fase:** 4 - Validacion de Planeacion
**Basado en:** 30-VALIDACION-DEPENDENCIAS.md

---

## RESUMEN DE IMPACTOS

| Nivel | Correcciones | Archivos Afectados | Riesgo |
|-------|--------------|-------------------|--------|
| Alto | 3 | 15+ | Requiere tests |
| Medio | 7 | 20+ | Verificacion manual |
| Bajo | 20 | 30+ | Minimo |

---

## 1. IMPACTOS DE ALTO NIVEL (Requieren Tests)

### I-001: Cambio de Rutas Profile
**Correccion:** C-CODE-003
**Tipo:** Breaking Change (con deprecation)

#### Archivos Impactados:
```yaml
Backend:
  - apps/backend/src/modules/auth/auth.controller.ts
  - apps/backend/src/modules/profile/profile.controller.ts
  - apps/backend/src/modules/users/users.controller.ts

Frontend:
  - apps/frontend/src/features/auth/api/authApi.ts
  - apps/frontend/src/features/auth/hooks/useAuth.ts
  - apps/frontend/src/apps/student/hooks/useProfile.ts
  - apps/frontend/src/apps/teacher/hooks/useProfile.ts
  - apps/frontend/src/apps/admin/hooks/useProfile.ts

Tests:
  - apps/backend/src/modules/auth/auth.controller.spec.ts
  - apps/frontend/src/**/*.test.ts (buscar /profile)
```

#### Plan de Mitigacion:
1. Agregar alias temporal en backend
2. Deprecation warning en ruta vieja
3. Actualizar frontend gradualmente
4. Monitorear uso de ruta vieja
5. Remover en sprint futuro

#### Validacion Requerida:
- [ ] Tests unitarios backend pasando
- [ ] Tests integracion auth flow
- [ ] Verificar en 3 portales
- [ ] Log de deprecation funcionando

---

### I-002: Reubicacion Paginas Admin
**Correccion:** C-CODE-002
**Tipo:** Restructuracion de Codigo

#### Archivos Impactados:
```yaml
Mover:
  - apps/frontend/src/apps/student/pages/admin/AdminDashboard.tsx
  - apps/frontend/src/apps/student/pages/admin/AdminSettings.tsx
  - apps/frontend/src/apps/admin/AdminUsers.tsx

Actualizar:
  - apps/frontend/src/apps/student/router.tsx
  - apps/frontend/src/apps/admin/router.tsx
  - apps/frontend/src/apps/admin/pages/index.ts

Verificar imports en:
  - apps/frontend/src/apps/admin/components/**
  - apps/frontend/src/shared/components/**
```

#### Plan de Mitigacion:
1. Verificar si archivos ya existen en destino
2. Comparar contenido si hay duplicados
3. Backup antes de mover
4. Actualizar imports paso a paso
5. Verificar build exitoso

#### Validacion Requerida:
- [ ] Build sin errores
- [ ] Navigation admin funcionando
- [ ] Rutas student limpias
- [ ] Tests E2E admin portal

---

### I-003: Limpieza Rutas Gamification
**Correccion:** C-CODE-005
**Tipo:** Estandarizacion API

#### Archivos Impactados:
```yaml
Backend (estandarizar):
  - apps/backend/src/modules/gamification/controllers/missions.controller.ts
  - apps/backend/src/modules/gamification/controllers/ranks.controller.ts
  - apps/backend/src/modules/gamification/controllers/rewards.controller.ts
  - apps/backend/src/modules/gamification/controllers/leaderboard.controller.ts

Frontend (actualizar):
  - apps/frontend/src/features/economy/api/missionsApi.ts
  - apps/frontend/src/features/ranks/api/ranksApi.ts
  - apps/frontend/src/features/social/api/leaderboardApi.ts

Tests:
  - apps/backend/src/modules/gamification/**/*.spec.ts
  - E2E tests de gamification
```

#### Plan de Mitigacion:
1. Identificar rutas inconsistentes exactas
2. Agregar aliases para backwards compat
3. Actualizar frontend a nuevas rutas
4. Deprecar rutas viejas
5. Remover aliases en sprint futuro

#### Validacion Requerida:
- [ ] Todas las rutas en kebab-case
- [ ] APIs frontend actualizados
- [ ] Aliases funcionando
- [ ] Tests pasando

---

## 2. IMPACTOS DE NIVEL MEDIO (Verificacion Manual)

### I-004: Resolucion Duplicados Teacher
**Correccion:** C-CODE-004

#### Archivos Afectados:
```yaml
Eliminar uno de cada par (11 archivos):
  - TeacherDashboard.tsx / TeacherDashboardPage.tsx
  - TeacherStudents.tsx / TeacherStudentsPage.tsx
  - ... (9 pares mas)

Actualizar:
  - apps/frontend/src/apps/teacher/router.tsx
  - apps/frontend/src/apps/teacher/pages/index.ts
```

#### Validacion:
- [ ] Un solo archivo por pagina
- [ ] Router actualizado
- [ ] Exports correctos
- [ ] Navigation funcionando

---

### I-005: Actualizacion Inventarios
**Correcciones:** C-DOC-010, C-DOC-015, C-DOC-019

#### Archivos Afectados:
```yaml
Actualizar:
  - orchestration/inventarios/MASTER_INVENTORY.yml
  - orchestration/inventarios/BACKEND_INVENTORY.yml
  - orchestration/inventarios/FRONTEND_INVENTORY.yml

Verificar coherencia:
  - docs/README.md
  - docs/90-transversal/features/FEATURES-IMPLEMENTADAS.md
```

#### Validacion:
- [ ] Valores numericos correctos
- [ ] Formato YAML valido
- [ ] Consistencia entre archivos

---

### I-006: Documentacion API
**Correcciones:** C-DOC-003, C-DOC-006, C-DOC-009

#### Archivos Afectados:
```yaml
Crear:
  - docs/90-transversal/api/API-TEACHER-MODULE.md
  - docs/90-transversal/api/API-ADMIN-MODULE.md

Actualizar:
  - docs/90-transversal/api/API.md
  - docs/90-transversal/api/README.md
```

#### Validacion:
- [ ] Endpoints documentados vs implementados
- [ ] DTOs referenciados existen
- [ ] Links funcionando

---

### I-007: Documentacion Database
**Correcciones:** C-DOC-005, C-DOC-011, C-DOC-012

#### Archivos Afectados:
```yaml
Crear/Actualizar:
  - docs/database/inventarios-database/TABLAS-NUEVAS.md
  - docs/database/inventarios-database/SCHEMA-COMMUNICATION.md
  - docs/database/inventarios-database/INVENTARIO-TRIGGERS.md
```

#### Validacion:
- [ ] Tablas vs DDL
- [ ] Triggers contados correctamente
- [ ] Relaciones documentadas

---

### I-008: Documentacion Frontend
**Correcciones:** C-DOC-004, C-DOC-007, C-DOC-008

#### Archivos Afectados:
```yaml
Crear:
  - docs/frontend/student/README.md
  - docs/frontend/student/PAGES-STUDENT.md

Actualizar:
  - docs/frontend/teacher/README.md
  - docs/frontend/ESTRUCTURA.md
```

#### Validacion:
- [ ] Todas las paginas listadas
- [ ] Estructura correcta documentada
- [ ] Convencion de nombres clara

---

### I-009: Documentacion Mecanicas
**Correcciones:** C-DOC-013, C-DOC-014, C-DOC-017

#### Archivos Afectados:
```yaml
Actualizar:
  - docs/frontend/mechanics/MODULE1.md
  - docs/frontend/mechanics/MODULE2.md
  - docs/frontend/mechanics/MODULE5.md
```

#### Validacion:
- [ ] Mecanicas extra documentadas
- [ ] Estado M5 clarificado
- [ ] Consistencia con codigo

---

### I-010: Features Implementadas
**Correccion:** C-DOC-001

#### Archivos Afectados:
```yaml
Actualizar:
  - docs/90-transversal/features/FEATURES-IMPLEMENTADAS.md

Verificar coherencia con:
  - docs/README.md
  - orchestration/inventarios/MASTER_INVENTORY.yml
```

#### Validacion:
- [ ] Metricas actualizadas
- [ ] Fecha de version actual
- [ ] Changelog interno

---

## 3. IMPACTOS DE BAJO NIVEL (Minimo Riesgo)

### Documentacion Standalone:
- C-DOC-002: README.md metrics
- C-DOC-016: Social module docs
- C-DOC-018: Components docs
- C-DOC-020: Views docs
- C-DOC-021: Auth routes docs

### Codigo Cleanup:
- C-CODE-009: Codigo muerto Teacher

---

## 4. MATRIZ DE IMPACTO CRUZADO

```
+---------------+--------+--------+--------+--------+--------+
| Correccion    | Auth   | Router | API    | Tests  | Docs   |
+---------------+--------+--------+--------+--------+--------+
| C-CODE-002    |        | HIGH   |        | MEDIUM |        |
| C-CODE-003    | HIGH   |        | HIGH   | HIGH   | LOW    |
| C-CODE-004    |        | MEDIUM |        | LOW    |        |
| C-CODE-005    |        |        | MEDIUM | MEDIUM |        |
| C-DOC-001     |        |        |        |        | HIGH   |
| C-DOC-003     |        |        | REF    |        | HIGH   |
+---------------+--------+--------+--------+--------+--------+
```

---

## 5. AREAS SIN IMPACTO (Seguras)

Los siguientes componentes NO seran afectados:

- **Backend Modules:** educational, content, assignments, progress
- **Frontend Apps:** Logica de negocios en portales
- **Database:** Estructura de tablas existentes
- **Gamification Core:** Sistema de rangos, puntos, misiones
- **Auth Core:** Login, JWT, sessions

---

## 6. PLAN DE ROLLBACK

### Por Nivel de Riesgo:

#### Alto (C-CODE-002, C-CODE-003, C-CODE-005):
```yaml
Preparacion:
  - Commit de referencia antes de cambios
  - Branch feature separado
  - Tests snapshot antes

Rollback:
  - git revert para cada commit
  - Restaurar router original
  - Verificar tests pasando
```

#### Medio (C-CODE-004):
```yaml
Rollback:
  - Restaurar archivos eliminados desde git
  - Revertir cambios en router
```

#### Bajo (Documentacion):
```yaml
Rollback:
  - git checkout para archivos modificados
  - No requiere accion adicional
```

---

## 7. CONCLUSION

### Riesgos Aceptables:
- Impactos altos tienen plan de mitigacion
- Rollback definido para cada nivel
- Tests cubren areas criticas

### Recomendaciones:
1. Ejecutar C-CODE-* en branch feature
2. Review obligatorio para cambios de router
3. Tests E2E antes de merge a main
4. Documentacion puede ir directo a main

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
