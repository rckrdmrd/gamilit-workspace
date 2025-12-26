# PLAN DE CORRECCIONES: CODIGO

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Fecha:** 2025-12-23
**Fase:** 3 - Planeacion de Implementaciones
**Basado en:** 14-RESUMEN-GAPS-IDENTIFICADOS.md

---

## RESUMEN EJECUTIVO

| Prioridad | Correcciones | Esfuerzo | Riesgo |
|-----------|--------------|----------|--------|
| P0 - Critica | 2 | 4h | Alto |
| P1 - Alta | 3 | 6h | Medio |
| P2 - Media | 4 | 10h | Bajo |
| **TOTAL** | **9** | **20h** | - |

---

## NOTA IMPORTANTE

Las correcciones de codigo requieren mayor cuidado que las de documentacion:
- Deben ejecutarse en ambiente de desarrollo
- Requieren pruebas antes de commit
- Pueden tener efectos secundarios no previstos

---

## 1. CORRECCIONES P0 - CRITICAS

### C-CODE-001: Implementar Stubs Auth Faltantes
**Ruta:** `apps/backend/src/modules/auth/`
**Problema:** Endpoints documentados no funcionales
**Esfuerzo:** 2h
**Riesgo:** ALTO (Seguridad)

#### Endpoints Afectados:
```yaml
Stubs no funcionales:
  - POST /auth/verify-email
  - POST /auth/reset-password
  - POST /auth/request-password-reset

Estado actual:
  - Devuelven 501 Not Implemented
  - Documentados como funcionales en API.md
```

#### Opciones de Correccion:
```yaml
Opcion A - Implementar:
  pros: Funcionalidad completa
  cons: Requiere integracion email, mas tiempo
  esfuerzo: 8-12h

Opcion B - Documentar como no implementado:
  pros: Rapido, honesto
  cons: Funcionalidad faltante
  esfuerzo: 30min

Opcion C - Eliminar del codigo:
  pros: Sin codigo muerto
  cons: Pierde la estructura
  esfuerzo: 1h

RECOMENDACION: Opcion B (actualizar docs) para P0
              Opcion A para sprint futuro
```

#### Dependencias:
- Servicio de email (si se implementa)
- Tokens de verificacion

#### Validacion:
- [ ] Comportamiento consistente con documentacion
- [ ] Tests unitarios actualizados
- [ ] No breaking changes en auth existente

---

### C-CODE-002: Reubicar Paginas Admin del Portal Student
**Ruta:** `apps/frontend/src/apps/student/pages/admin/`
**Problema:** Paginas admin en ubicacion incorrecta
**Esfuerzo:** 2h
**Riesgo:** MEDIO (Puede romper rutas)

#### Archivos a Mover:
```yaml
Origen:
  apps/frontend/src/apps/student/pages/admin/
    - AdminDashboard.tsx
    - AdminSettings.tsx
    - AdminUsers.tsx

Destino:
  apps/frontend/src/apps/admin/pages/
```

#### Pasos de Ejecucion:
1. Verificar si archivos ya existen en destino
2. Comparar contenido si hay duplicados
3. Mover archivos
4. Actualizar imports en router
5. Actualizar imports en otros componentes
6. Ejecutar tests
7. Verificar navegacion en browser

#### Dependencias:
- Router de Student app
- Router de Admin app
- Posibles imports cruzados

#### Validacion:
- [ ] Rutas admin funcionando
- [ ] Sin errores de import
- [ ] Navigation correcta
- [ ] Tests pasando

---

## 2. CORRECCIONES P1 - ALTAS

### C-CODE-003: Unificar Rutas Duplicadas Profile
**Ruta:** `apps/backend/src/modules/`
**Problema:** Duplicacion /auth/profile vs /users/profile
**Esfuerzo:** 2h
**Riesgo:** MEDIO (Breaking change potencial)

#### Rutas Duplicadas:
```yaml
Ruta 1: GET /auth/profile
  - Controlador: AuthController
  - Retorna: Usuario autenticado

Ruta 2: GET /users/profile
  - Controlador: UsersController (o ProfileController)
  - Retorna: Usuario autenticado

Diferencias:
  - Verificar si retornan misma estructura
  - Verificar si tienen mismos guards
```

#### Opcion Recomendada:
```yaml
Mantener: /auth/profile (estandar comun)
Deprecar: /users/profile (agregar deprecation warning)
Timeline:
  - Sprint actual: Agregar warning en /users/profile
  - Sprint +2: Eliminar /users/profile
```

#### Dependencias:
- Frontend: Verificar cual ruta usa actualmente
- Otros consumidores de API

#### Validacion:
- [ ] Una sola ruta canonica
- [ ] Frontend actualizado
- [ ] Warning de deprecacion en ruta vieja

---

### C-CODE-004: Resolver Duplicacion Paginas Teacher
**Ruta:** `apps/frontend/src/apps/teacher/pages/`
**Problema:** 11 pares de paginas duplicadas
**Esfuerzo:** 2h
**Riesgo:** BAJO

#### Archivos Duplicados:
```yaml
Par 1:
  - TeacherDashboard.tsx
  - TeacherDashboardPage.tsx

Par 2:
  - TeacherStudents.tsx
  - TeacherStudentsPage.tsx

# ... 9 pares mas
```

#### Analisis Requerido:
1. Verificar cual archivo esta referenciado en router
2. Comparar contenido de ambos archivos
3. Determinar si uno es wrapper del otro
4. Decidir convencion de nombres

#### Opciones:
```yaml
Opcion A - Mantener *Page.tsx:
  - Convencion clara
  - Eliminar archivos sin sufijo

Opcion B - Mantener sin sufijo:
  - Nombres mas cortos
  - Eliminar archivos con sufijo

RECOMENDACION: Opcion A (consistencia con otros portales)
```

#### Validacion:
- [ ] Solo un archivo por pagina
- [ ] Router actualizado
- [ ] Sin imports rotos

---

### C-CODE-005: Limpiar Rutas Inconsistentes Gamification
**Ruta:** `apps/backend/src/modules/gamification/`
**Problema:** Rutas con patrones inconsistentes
**Esfuerzo:** 2h
**Riesgo:** MEDIO

#### Inconsistencias Detectadas:
```yaml
Patron 1 (kebab-case):
  - /gamification/daily-missions
  - /gamification/maya-ranks

Patron 2 (camelCase):
  - /gamification/leaderBoard  # inconsistente

Patron 3 (snake_case):
  - /gamification/reward_history  # inconsistente
```

#### Correccion:
- Estandarizar a kebab-case (REST best practice)
- Agregar aliases temporales para backwards compatibility

#### Validacion:
- [ ] Todas las rutas en kebab-case
- [ ] Aliases funcionando
- [ ] Frontend actualizado

---

## 3. CORRECCIONES P2 - MEDIAS

### C-CODE-006: Implementar Mecanicas M5 Faltantes
**Ruta:** `apps/frontend/src/features/mechanics/module5/`
**Problema:** 2 mecanicas documentadas no implementadas
**Esfuerzo:** 4h (por mecanica)
**Riesgo:** BAJO (Nueva funcionalidad)

#### Mecanicas Faltantes:
```yaml
1. PodcastReflexivo:
   - Tipo: Audio recording/playback
   - Interaccion: Grabar reflexion de voz
   - Dependencias: Web Audio API

2. DiarioReflexivo:
   - Tipo: Rich text editor
   - Interaccion: Escritura libre con prompts
   - Dependencias: Editor WYSIWYG
```

#### Decision Requerida:
- Confirmar si estan en scope actual
- Si no, actualizar documentacion (ver C-DOC-014)

---

### C-CODE-007: Agregar Indices Faltantes Database
**Ruta:** `apps/database/ddl/schemas/*/indexes/`
**Problema:** Performance potencial
**Esfuerzo:** 2h
**Riesgo:** BAJO

#### Indices Sugeridos:
```sql
-- progress_tracking
CREATE INDEX idx_exercise_attempts_user_date
ON progress_tracking.exercise_attempts(user_id, attempted_at);

-- social_features
CREATE INDEX idx_friend_requests_status
ON social_features.friend_requests(status, created_at);

-- gamification_system
CREATE INDEX idx_daily_missions_user_date
ON gamification_system.daily_missions(user_id, date);
```

---

### C-CODE-008: Completar RLS Policies Faltantes
**Ruta:** `apps/database/ddl/schemas/*/rls-policies/`
**Problema:** Seguridad incompleta
**Esfuerzo:** 2h
**Riesgo:** MEDIO (Seguridad)

#### Tablas sin RLS completo:
- communication.messages
- gamification_system.item_shop
- progress_tracking.teacher_interventions

---

### C-CODE-009: Eliminar Codigo Muerto Teacher Module
**Ruta:** `apps/frontend/src/apps/teacher/`
**Problema:** Componentes no utilizados
**Esfuerzo:** 2h
**Riesgo:** BAJO

#### Analisis Requerido:
- Identificar componentes sin referencias
- Verificar que no sean lazy-loaded
- Eliminar de forma segura

---

## 4. MATRIZ DE DEPENDENCIAS CODIGO

```
C-CODE-001 (Auth stubs) ─────> Standalone

C-CODE-002 (Admin pages) ─┬─> C-CODE-004 (Teacher pages)
                          └─> Frontend Router updates

C-CODE-003 (Profile routes) ──> Frontend API calls update

C-CODE-004 (Teacher duplicates) ──> Frontend Router update

C-CODE-005 (Gamification routes) ──> Frontend API calls update
```

---

## 5. IMPACTO EN TESTS

### Tests a Actualizar:
```yaml
Backend:
  - auth.controller.spec.ts (si C-CODE-001)
  - gamification routes tests (si C-CODE-005)

Frontend:
  - Teacher pages tests (si C-CODE-004)
  - Admin pages tests (si C-CODE-002)

E2E:
  - Auth flow tests
  - Navigation tests
```

---

## 6. CHECKLIST PRE-IMPLEMENTACION

### Ambiente:
- [ ] Branch de desarrollo creado
- [ ] Base de datos de desarrollo disponible
- [ ] Tests pasando en estado actual

### Backup:
- [ ] Commit de referencia identificado
- [ ] Posibilidad de rollback

### Comunicacion:
- [ ] Cambios breaking documentados
- [ ] Plan de migracion si aplica

---

## 7. ORDEN DE EJECUCION RECOMENDADO

### Sprint 1 (Bajo riesgo):
1. C-CODE-004: Teacher duplicates (cleanup)
2. C-CODE-009: Codigo muerto (cleanup)

### Sprint 2 (Medio riesgo):
3. C-CODE-002: Admin pages location
4. C-CODE-005: Gamification routes

### Sprint 3 (Decisiones):
5. C-CODE-001: Auth stubs (decision requerida)
6. C-CODE-003: Profile routes (deprecation)

### Backlog:
7. C-CODE-006: Mecanicas M5 (si en scope)
8. C-CODE-007: Indices DB
9. C-CODE-008: RLS policies

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
