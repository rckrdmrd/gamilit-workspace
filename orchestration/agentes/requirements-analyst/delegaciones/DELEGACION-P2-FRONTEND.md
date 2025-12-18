# DELEGACION: Frontend-Agent - Sprint P2

**Proyecto:** GAMILIT
**Fecha:** 2025-12-05
**De:** Requirements-Analyst
**Para:** Frontend-Agent
**Sprint:** P2-A, P2-B, P2-C

---

## CONTEXTO

El Sprint P1 ha sido completado exitosamente con ~12 componentes nuevos para el sistema de amigos. El proyecto ahora esta al 75% de completitud. Se requiere que Frontend-Agent complete las siguientes tareas para cerrar gaps criticos en portales Teacher y Admin.

## PREREQUISITOS COMPLETADOS

- [x] Sprint P1 - Componentes Friends implementados (7 componentes)
- [x] Sprint P1 - TeacherProgressPage mejorada
- [x] Sprint P1 - Avatar Upload implementado
- [x] Backend APIs disponibles para todas las tareas

---

## TAREAS ASIGNADAS

### Sprint P2-A (Prioridad P0/P1)

#### FE-P2-001 a FE-P2-010: Eliminar Mock-Teacher-ID
**Story:** US-P2-001
**SP:** 3
**Prioridad:** P0

**Archivos a modificar:**
1. `apps/frontend/src/features/teacher/pages/TeacherDashboardPage.tsx` (linea 45)
2. `apps/frontend/src/features/teacher/pages/TeacherStudentsPage.tsx` (linea 38)
3. `apps/frontend/src/features/teacher/pages/TeacherProgressPage.tsx` (linea 52)
4. `apps/frontend/src/features/teacher/pages/TeacherActivitiesPage.tsx` (linea 41)
5. `apps/frontend/src/features/teacher/pages/TeacherGamificationPage.tsx` (linea 47)
6. `apps/frontend/src/features/teacher/pages/TeacherNotificationsPage.tsx` (linea 35)
7. `apps/frontend/src/features/teacher/pages/TeacherCalendarPage.tsx` (linea 43)
8. `apps/frontend/src/features/teacher/pages/TeacherAnalyticsPage.tsx` (linea 56)
9. `apps/frontend/src/features/teacher/pages/TeacherMissionsPage.tsx` (linea 39)
10. `apps/frontend/src/features/teacher/pages/TeacherClassroomsPage.tsx` (linea 44)

**Patron de correccion:**
```typescript
// ANTES (incorrecto)
const userId = user?.id || 'mock-teacher-id';

// DESPUES (correcto)
const { user, isLoading } = useAuth();

if (isLoading) return <LoadingSpinner />;

if (!user?.id) {
  navigate('/login');
  return null;
}

const userId = user.id;
```

**Recomendacion:** Crear hook `useAuthenticatedUser()` reutilizable.

---

#### FE-P2-011 a FE-P2-014: Transformacion Snake/Camel
**Story:** US-P2-002
**SP:** 3
**Prioridad:** P0

**Archivos a crear:**
```
apps/frontend/src/utils/
├── transformKeys.ts
├── intervalToMinutes.ts
└── index.ts (actualizar)
```

**Implementacion transformKeys.ts:**
```typescript
export function snakeToCamel(obj: Record<string, any>): Record<string, any> {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamel);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = snakeToCamel(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
}

export function camelToSnake(obj: Record<string, any>): Record<string, any> {
  // Implementacion inversa
}
```

**Integrar en axios interceptors:**
```typescript
// apps/frontend/src/config/axios.config.ts
axios.interceptors.response.use((response) => {
  response.data = snakeToCamel(response.data);
  return response;
});

axios.interceptors.request.use((config) => {
  if (config.data) {
    config.data = camelToSnake(config.data);
  }
  return config;
});
```

---

#### FE-P2-015 a FE-P2-020: Tipos Canonicos
**Story:** US-P2-003
**SP:** 5
**Prioridad:** P0

**Archivos a crear/modificar:**

1. `apps/frontend/src/types/userStats.ts` (nuevo)
```typescript
export interface UserStats {
  id: string;
  userId: string;
  totalXp: number;
  totalMlCoins: number;
  currentRank: MayaRank;
  currentLevel: number;
  exercisesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
  studyTimeMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

2. `apps/frontend/src/types/classroom.ts` (actualizar)
- Agregar campos: maxStudents, isActive, metadata, createdBy, academicYear

3. `apps/frontend/src/types/user.ts` (actualizar)
- Agregar campos: lastLogin, metadata, isVerified

4. `apps/frontend/src/types/exerciseSubmission.ts` (nuevo)
- Crear discriminated unions por tipo de ejercicio

5. `apps/frontend/src/types/achievement.ts` (actualizar)
- Estandarizar naming: unlockedAt (no dateUnlocked)

---

#### FE-ADMIN-001 a FE-ADMIN-005: AdminRolesPage
**Story:** US-ADMIN-P2-001
**SP:** 8
**Prioridad:** P1

**Componentes a crear:**
```
apps/frontend/src/apps/admin/components/roles/
├── RolesTable.tsx
├── RoleEditor.tsx
├── PermissionMatrix.tsx
└── index.ts
```

**Hooks a usar:** `useRoles`, `useRolePermissions` (ya existen)

**Endpoints:**
- GET /admin/roles
- GET /admin/roles/:id
- POST /admin/roles
- PUT /admin/roles/:id
- DELETE /admin/roles/:id

---

#### FE-ADMIN-006 a FE-ADMIN-010: AdminInstitutionsPage
**Story:** US-ADMIN-P2-002
**SP:** 8
**Prioridad:** P1

**Componentes a crear:**
```
apps/frontend/src/apps/admin/components/institutions/
├── InstitutionsTable.tsx
├── InstitutionFilters.tsx
├── InstitutionDetailModal.tsx
├── InstitutionStats.tsx
└── index.ts
```

**Hook a usar:** `useOrganizations` (ya existe)

---

### Sprint P2-B (Prioridad P1)

#### FE-TEACHER-001: Habilitar TeacherCommunicationPage
**Story:** US-TEACHER-P2-001
**SP:** 3

**Acciones:**
1. Modificar `apps/frontend/src/features/teacher/constants/featureFlags.ts`
2. Cambiar `SHOW_COMMUNICATION: true`
3. Verificar que componentes funcionan correctamente
4. Agregar tests basicos

---

#### FE-TEACHER-002: Habilitar TeacherContentPage
**Story:** US-TEACHER-P2-002
**SP:** 3

**Acciones:**
1. Cambiar `SHOW_CONTENT: true` en featureFlags.ts
2. Verificar integracion con backend
3. Agregar tests basicos

---

#### FE-TEACHER-003: Implementar TeacherResourcesPage
**Story:** US-TEACHER-P2-003
**SP:** 8

**Componentes a crear:**
```
apps/frontend/src/features/teacher/pages/TeacherResourcesPage/
├── TeacherResourcesPage.tsx
├── ResourcesGrid.tsx
├── ResourceUploader.tsx
├── ResourceCard.tsx
└── index.ts
```

**Funcionalidades:**
- Subir archivos (PDF, DOCX, imágenes)
- Organizar por carpetas/categorias
- Compartir con estudiantes/aulas
- Preview de documentos

---

#### FE-ADMIN-011 a FE-ADMIN-016: AdminAdvancedPage
**Story:** US-ADMIN-P2-003
**SP:** 13

**Componentes a crear:**
```
apps/frontend/src/apps/admin/components/advanced/
├── FeatureFlagsPanel.tsx
├── FeatureFlagEditor.tsx
├── RolloutSlider.tsx
├── TargetingConfig.tsx
├── ABTestingDashboard.tsx
└── index.ts
```

**Hook a crear:** `useFeatureFlags`

---

### Sprint P2-C (Prioridad P2)

#### FE-M4-001: Drag-Drop Infografia
**Story:** US-M4-P2-002
**SP:** 5

**Archivo:** `apps/frontend/src/features/mechanics/module4/InfografiaInteractiva.tsx`

**Acciones:**
1. Reemplazar click-to-reveal con drag-drop
2. Usar libreria como @dnd-kit/core
3. Mantener fallback para dispositivos tactiles

---

#### FE-M4-002: Penalizacion Tiempo Quiz
**Story:** US-M4-P2-003
**SP:** 3

**Archivo:** `apps/frontend/src/features/mechanics/module4/QuizTikTok.tsx`
**Linea:** 145

**Acciones:**
1. Implementar penalizacion de puntuacion por tiempo
2. Formula: score = baseScore * (1 - timeElapsed/totalTime * 0.5)
3. Mostrar indicador visual de penalizacion

---

#### FE-M5-001: Secciones Cronometradas Video
**Story:** US-M5-P2-002
**SP:** 5

**Archivo:** `apps/frontend/src/features/mechanics/module5/VideoCartaCurie.tsx`

**Acciones:**
1. Dividir grabacion en 4 secciones
2. Introduccion: 30s
3. Mensaje Principal: 90s
4. Reflexiones: 45s
5. Cierre: 15s
6. Mostrar timer por seccion

---

## RESUMEN DE TAREAS

| ID | Tarea | SP | Sprint | Prioridad |
|----|-------|-----|--------|-----------|
| FE-P2-001-010 | Eliminar mocks | 3 | P2-A | P0 |
| FE-P2-011-014 | Transform snake/camel | 3 | P2-A | P0 |
| FE-P2-015-020 | Tipos canonicos | 5 | P2-A | P0 |
| FE-ADMIN-001-005 | AdminRolesPage | 8 | P2-A | P1 |
| FE-ADMIN-006-010 | AdminInstitutionsPage | 8 | P2-A | P1 |
| FE-TEACHER-001 | Communication Page | 3 | P2-B | P1 |
| FE-TEACHER-002 | Content Page | 3 | P2-B | P1 |
| FE-TEACHER-003 | Resources Page | 8 | P2-B | P1 |
| FE-ADMIN-011-016 | AdminAdvancedPage | 13 | P2-B | P1 |
| FE-M4-001 | Drag-drop infografia | 5 | P2-C | P2 |
| FE-M4-002 | Penalizacion tiempo | 3 | P2-C | P2 |
| FE-M5-001 | Secciones video | 5 | P2-C | P2 |

**Total Frontend P2:** 67 SP

---

## ARCHIVOS DE REFERENCIA

- Analisis completo: `orchestration/agentes/requirements-analyst/ANALISIS-ALCANCES-P2-POST-SPRINT-P1-2025-12-05.md`
- Historias P0: `orchestration/agentes/requirements-analyst/historias-usuario/US-P2-CRITICAS.md`
- Historias Admin: `orchestration/agentes/requirements-analyst/historias-usuario/US-P2-ADMIN.md`

---

## CRITERIOS DE ACEPTACION GENERALES

- [ ] Componentes con TypeScript estricto
- [ ] Tests unitarios para componentes criticos
- [ ] Responsive design verificado
- [ ] Accesibilidad basica (ARIA labels)
- [ ] Sin errores en npm run lint
- [ ] Build exitoso

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Revision:** Despues de Sprint P2-A
