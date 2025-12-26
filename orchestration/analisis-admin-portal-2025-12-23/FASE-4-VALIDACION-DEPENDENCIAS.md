# FASE 4: Validación de Dependencias y Objetos Impactados

**Fecha:** 2025-12-23
**Proyecto:** Gamilit - Portal Admin
**Fase:** Validación de Planeación

---

## 1. MATRIZ DE DEPENDENCIAS POR CORRECCIÓN

### Sprint 1: Correcciones Críticas

#### CRIT-001: Mapeo de Campos de Usuario

| Aspecto | Detalle |
|---------|---------|
| **Archivo Principal** | `useUserManagement.ts` |
| **Dependencias Directas** | `AdminUsersPage.tsx` |
| **Dependencias Indirectas** | `UserDetailModal.tsx`, `UserManagementTable.tsx` |
| **APIs Backend** | `GET /admin/users`, `GET /admin/users/:id` |
| **Validación Requerida** | Verificar estructura de respuesta del backend |
| **Riesgo de Regresión** | MEDIO - Afecta visualización de datos de usuario |

**Checklist de Impacto:**
- [ ] Verificar que AdminUsersPage muestre nombres correctamente
- [ ] Verificar que UserDetailModal muestre todos los campos
- [ ] Verificar que filtros sigan funcionando
- [ ] Verificar que paginación no se afecte

---

#### CRIT-002: Error Handling en Reports

| Aspecto | Detalle |
|---------|---------|
| **Archivo Principal** | `AdminReportsPage.tsx` |
| **Dependencias Directas** | Ninguna |
| **Dependencias Indirectas** | `useReports.ts` (ya tiene error handling) |
| **APIs Backend** | `POST /admin/reports/generate` |
| **Validación Requerida** | Simular error de API |
| **Riesgo de Regresión** | BAJO - Solo afecta mensajes de error |

**Checklist de Impacto:**
- [ ] Verificar toast de error se muestra correctamente
- [ ] Verificar que no se pierda funcionalidad de retry

---

#### CRIT-003: ConfirmDialog en Español

| Aspecto | Detalle |
|---------|---------|
| **Archivo Principal** | `FeatureFlagsPanel.tsx` |
| **Dependencias Directas** | Posible nuevo componente `ConfirmDialog.tsx` |
| **Dependencias Indirectas** | Ninguna |
| **APIs Backend** | `DELETE /admin/feature-flags/:key` |
| **Validación Requerida** | UX de confirmación |
| **Riesgo de Regresión** | BAJO - Solo UX |

**Checklist de Impacto:**
- [ ] Verificar que diálogo aparece en español
- [ ] Verificar que cancelar no elimina
- [ ] Verificar que confirmar sí elimina
- [ ] Verificar que escape cierra el diálogo

---

#### CRIT-004: ABTestingDashboard

| Aspecto | Detalle |
|---------|---------|
| **Archivo Principal** | `AdminAdvancedPage.tsx` |
| **Dependencias Directas** | `ABTestingDashboard.tsx` (existente o a crear) |
| **Dependencias Indirectas** | `UnderConstruction.tsx` |
| **APIs Backend** | Ninguna si es placeholder |
| **Validación Requerida** | Que no rompa el render |
| **Riesgo de Regresión** | BAJO |

**Checklist de Impacto:**
- [ ] Verificar que la página carga sin errores
- [ ] Verificar que los tabs funcionan
- [ ] Verificar mensaje de "Coming Soon" visible

---

#### CRIT-005: useSettings Mock Functions

| Aspecto | Detalle |
|---------|---------|
| **Archivo Principal** | `useSettings.ts` |
| **Dependencias Directas** | `AdminSettingsPage.tsx` |
| **Dependencias Indirectas** | `GeneralSettings.tsx`, `SecuritySettings.tsx` |
| **APIs Backend** | Ninguna actualmente (mock) |
| **Validación Requerida** | Que funciones deprecated no rompan |
| **Riesgo de Regresión** | MEDIO - Si se usa el hook en otro lugar |

**Checklist de Impacto:**
- [ ] Buscar usos de useSettings en todo el proyecto
- [ ] Verificar que AdminSettingsPage no depende de funciones mock
- [ ] Agregar warning en consola si se usa

**Búsqueda de Dependencias:**
```bash
grep -r "useSettings" apps/frontend/src --include="*.tsx" --include="*.ts"
```

---

### Sprint 2: Correcciones Altas

#### HIGH-001: Dependencia Circular en Filtros

| Aspecto | Detalle |
|---------|---------|
| **Archivo Principal** | `useUserManagement.ts` |
| **Dependencias Directas** | `AdminUsersPage.tsx` |
| **Dependencias Indirectas** | Componentes de filtro |
| **Riesgo de Regresión** | ALTO - Podría afectar filtrado |

**Checklist de Impacto:**
- [ ] Verificar que filtros actualizan correctamente
- [ ] Verificar que no hay loops infinitos
- [ ] Medir performance antes/después

---

#### HIGH-002: Mapeo Inconsistente de Campos

| Aspecto | Detalle |
|---------|---------|
| **Archivo Principal** | `useOrganizations.ts` |
| **Dependencias Directas** | `AdminInstitutionsPage.tsx` |
| **Dependencias Indirectas** | `InstitutionsTable.tsx`, `InstitutionDetailModal.tsx` |
| **Riesgo de Regresión** | MEDIO |

**Checklist de Impacto:**
- [ ] Verificar que plan se muestra correctamente
- [ ] Verificar que userCount se muestra
- [ ] Verificar que features se cargan bien

---

## 2. ANÁLISIS DE IMPACTO CRUZADO

### Componentes Compartidos Afectados

| Componente | Correcciones que lo Afectan | Orden de Corrección |
|------------|----------------------------|---------------------|
| `AdminLayout.tsx` | Ninguna directamente | N/A |
| `DetectiveCard.tsx` | Ninguna directamente | N/A |
| `DetectiveButton.tsx` | Ninguna directamente | N/A |
| `useUserGamification.ts` | MED-015 (fallback) | Sprint 3 |
| `Toast notifications` | LOW-009 (duración) | Sprint 4 |

### Hooks con Múltiples Consumidores

| Hook | Páginas que lo Usan | Precauciones |
|------|---------------------|--------------|
| `useUserManagement` | AdminUsersPage | Probar todas las operaciones CRUD |
| `useOrganizations` | AdminInstitutionsPage | Probar CRUD y features |
| `useAlerts` | AdminAlertsPage, AdminMonitoringPage | Probar en ambas páginas |
| `useUserGamification` | TODAS las páginas admin | Cambios de fallback afectan todo |

---

## 3. DEPENDENCIAS CON BACKEND

### Endpoints Críticos a Validar

| Endpoint | Frontend | Validar |
|----------|----------|---------|
| `GET /admin/users` | useUserManagement | Estructura de `raw_user_meta_data` |
| `GET /admin/organizations/:id/stats` | useOrganizations | Nombres de campos |
| `DELETE /admin/feature-flags/:key` | FeatureFlagsPanel | Respuesta de error |
| `GET /admin/gamification/stats` | AdminGamificationPage | Campo `totalUsers` |

### Contratos de API a Documentar

```typescript
// Estructura esperada de Usuario
interface UserFromBackend {
  id: string;
  email: string;
  name?: string;  // Puede no existir
  raw_user_meta_data?: {
    full_name?: string;
    display_name?: string;
    avatar_url?: string;
  };
  // NO usar: metadata (deprecated)
}

// Estructura esperada de Organización
interface OrganizationFromBackend {
  id: string;
  name: string;
  tier: string;  // Backend usa tier
  users: number;  // Backend usa users, no userCount
  // Frontend debe mapear: tier -> plan, users -> userCount
}
```

---

## 4. OBJETOS QUE FALTAN EN EL PLAN

### Componentes Faltantes

| Componente | Necesario Para | Acción |
|------------|----------------|--------|
| `ConfirmDialog.tsx` | CRIT-003 | Crear si no existe |
| `ExercisePreview.tsx` | MED-004 | Crear para vista previa |
| `LoadingSpinner.tsx` | MED-003 | Verificar que existe |

### Types/Interfaces Faltantes

```typescript
// Agregar a types/admin/users.types.ts
interface UserMetadata {
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
}

// Agregar a types/admin/organizations.types.ts
interface OrganizationPlan {
  name: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  userLimit: number;
}
```

### Utilidades Faltantes

```typescript
// Agregar a shared/utils/error.ts
export const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  return 'Error desconocido';
};
```

---

## 5. ORDEN DE IMPLEMENTACIÓN VALIDADO

### Dependencias entre Correcciones

```
CRIT-002 → Ninguna dependencia (implementar primero)
    ↓
CRIT-003 → Puede necesitar ConfirmDialog
    ↓
CRIT-004 → Ninguna dependencia
    ↓
CRIT-001 → Depende de validar estructura backend
    ↓
CRIT-005 → Depende de buscar usos

HIGH-002 → Ninguna dependencia
    ↓
HIGH-004 → Ninguna dependencia
    ↓
HIGH-001 → Depende de CRIT-001 (mismo hook)
    ↓
HIGH-003 → Depende de date-fns instalado
    ↓
HIGH-005 → Depende de backend feature flag
```

### Orden Final Recomendado

1. **Primero (sin dependencias):**
   - CRIT-002 (error handling)
   - CRIT-004 (placeholder ABTesting)
   - HIGH-002 (mapeo campos orgs)
   - HIGH-004 (filtros assignments)

2. **Segundo (crear componentes):**
   - CRIT-003 (crear ConfirmDialog si falta)
   - Crear ExercisePreview para MED-004

3. **Tercero (validar backend):**
   - CRIT-001 (validar estructura usuarios)
   - HIGH-003 (agregar validación fechas)

4. **Cuarto (buscar dependencias):**
   - CRIT-005 (buscar usos useSettings)
   - HIGH-001 (refactor useUserManagement)

5. **Quinto (feature flags backend):**
   - HIGH-005 (usar FF del backend)

---

## 6. CHECKLIST DE VALIDACIÓN PRE-IMPLEMENTACIÓN

### Antes de Empezar Cada Sprint

- [ ] Verificar que todos los archivos existen
- [ ] Verificar que no hay conflictos de merge
- [ ] Verificar estructura de respuesta del backend
- [ ] Verificar que tests existentes pasan
- [ ] Crear rama de feature

### Antes de Cada Corrección

- [ ] Leer el código actual
- [ ] Identificar todos los imports del archivo
- [ ] Identificar todos los exports del archivo
- [ ] Buscar otros archivos que importan este
- [ ] Verificar que la corrección no rompe nada

### Después de Cada Corrección

- [ ] Compilar sin errores
- [ ] Ejecutar tests existentes
- [ ] Probar manualmente la funcionalidad
- [ ] Probar funcionalidades relacionadas
- [ ] Verificar que no hay warnings en consola

---

## 7. RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Backend devuelve estructura diferente a esperada | ALTA | ALTO | Verificar con llamada real antes |
| useSettings está usado en lugares no documentados | MEDIA | MEDIO | Buscar exhaustivamente |
| ConfirmDialog ya existe con diferente API | MEDIA | BAJO | Verificar primero |
| Cambios en useUserManagement rompen filtros | MEDIA | ALTO | Tests exhaustivos |
| HIGH-005 requiere cambios en backend | ALTA | MEDIO | Verificar si endpoint existe |

---

## 8. DEPENDENCIAS EXTERNAS

### Librerías NPM

| Librería | Versión | Necesaria Para |
|----------|---------|----------------|
| `date-fns` | Existente | HIGH-003 (validación fechas) |
| `react-query` | Existente | Todos los hooks |
| `framer-motion` | Existente | Animaciones |
| `lucide-react` | Existente | Iconos |

### Servicios Backend

| Servicio | Endpoint | Estado |
|----------|----------|--------|
| AdminUsersService | GET /admin/users | ✅ Implementado |
| AdminOrganizationsService | GET /admin/organizations | ✅ Implementado |
| FeatureFlagsService | DELETE /admin/feature-flags/:key | ✅ Implementado |
| GamificationStatsService | GET /admin/gamification/stats | ✅ Implementado |

---

## 9. CONCLUSIÓN DE VALIDACIÓN

### Validación Completada ✅

- Todas las correcciones tienen archivos identificados
- Las dependencias están mapeadas
- Los riesgos están documentados
- El orden de implementación está validado
- Los objetos faltantes están identificados

### Objetos Adicionales Requeridos

1. **Crear si no existe:** `ConfirmDialog.tsx`
2. **Crear nuevo:** `ExercisePreview.tsx`
3. **Crear utilidad:** `getErrorMessage()` en shared/utils
4. **Agregar types:** UserMetadata, OrganizationPlan

### Siguiente Paso

Proceder a **FASE 5: Ejecución de Implementaciones** siguiendo el orden validado.

---

**Validación aprobada por:** Análisis automatizado
**Fecha:** 2025-12-23
