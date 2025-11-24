# DELEGACIÓN: Tarea 4 - Fix Gamification Data en Wrappers

**Fecha:** 2025-11-23
**Delegado por:** Architecture-Analyst
**Delegado a:** Frontend-Developer
**Prioridad:** P1 - MEDIA (pero quick win)
**Estimación:** 4 horas (3.5 horas según plan)
**Estado:** INICIADO

---

## 📋 CONTEXTO

Como parte del plan de integración de APIs, se identificó que varios componentes "wrapper" (páginas que contienen otros componentes) tienen datos de gamificación hardcodeados para el usuario actual.

### Situación Actual

- **TeacherStudentsPage:** Objeto `gamificationData` hardcodeado con level, xp, mlCoins, rank
- **TeacherClassesPage:** Igual que anterior
- **AdminInstitutionsPage:** Objeto `gamificationData` hardcodeado

**Impacto:** Estos componentes muestran siempre los mismos datos fake, independientemente del usuario logueado.

**Hook Disponible:** Ya existe `useUserGamification(userId)` que consume API real

**Reporte de Análisis:** `/orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`

**Plan Completo:** `/orchestration/agentes/architecture-analyst/integracion-apis-2025-11-23/PLAN-DETALLADO-INTEGRACION-APIS.md`

---

## 🎯 OBJETIVO DE LA TAREA

Eliminar datos de gamificación hardcodeados en 3 componentes wrapper y conectarlos al hook `useUserGamification()` para mostrar datos reales del usuario logueado.

---

## 📂 ARCHIVOS A MODIFICAR

### 3 Archivos Existentes

1. **`apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx`**
   - Eliminar objeto `gamificationData` hardcodeado
   - Usar `useUserGamification(user?.id)`

2. **`apps/frontend/src/apps/teacher/pages/TeacherClassesPage.tsx`**
   - Eliminar objeto `gamificationData` hardcodeado
   - Usar `useUserGamification(user?.id)`

3. **`apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`**
   - Eliminar objeto `gamificationData` hardcodeado
   - Usar `useUserGamification(user?.id)`

**Nota:** `AdminGamificationPage.tsx` ya fue corregido en Tarea 1

---

## 🛠️ PASOS DE IMPLEMENTACIÓN

### Paso 1: Leer archivos actuales (30 min)

Primero, leer los 3 archivos para identificar:
- Líneas exactas con datos hardcodeados
- Imports existentes
- Estructura del componente
- Uso actual del objeto `gamificationData`

```bash
# Leer archivos
apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx
apps/frontend/src/apps/teacher/pages/TeacherClassesPage.tsx
apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx
```

---

### Paso 2: Modificar TeacherStudentsPage.tsx (30 min)

**Ubicación:** `apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx`

**Cambio esperado (líneas ~17-24):**

**ANTES:**
```typescript
const gamificationData = {
  level: 5,
  xp: 3200,
  mlCoins: 850,
  rank: 'Ah K\'in',
};
```

**DESPUÉS:**
```typescript
const { user } = useAuth();
const gamificationData = useUserGamification(user?.id);
```

**Imports a verificar/agregar:**
```typescript
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserGamification } from '@/shared/hooks/useUserGamification';
```

**Validación:**
```bash
# Verificar que no queda hardcode
grep -n "level: 5" apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx
# Debe retornar vacío

# Verificar import de hook
grep -n "useUserGamification" apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx
# Debe retornar la línea del import y del uso
```

---

### Paso 3: Modificar TeacherClassesPage.tsx (30 min)

**Ubicación:** `apps/frontend/src/apps/teacher/pages/TeacherClassesPage.tsx`

**Cambio:** Idéntico al Paso 2

**ANTES:**
```typescript
const gamificationData = {
  level: 5,
  xp: 3200,
  mlCoins: 850,
  rank: 'Ah K\'in',
};
```

**DESPUÉS:**
```typescript
const { user } = useAuth();
const gamificationData = useUserGamification(user?.id);
```

**Imports a verificar/agregar:** Los mismos que Paso 2

**Validación:**
```bash
# Verificar eliminación de hardcode
grep -n "level: 5" apps/frontend/src/apps/teacher/pages/TeacherClassesPage.tsx
# Debe retornar vacío
```

---

### Paso 4: Modificar AdminInstitutionsPage.tsx (30 min)

**Ubicación:** `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`

**Cambio esperado (líneas ~41-47):**

**ANTES:**
```typescript
const gamificationData = {
  level: 5,
  xp: 3200,
  mlCoins: 850,
  rank: 'Ah K\'in',
};
```

**DESPUÉS:**
```typescript
const { user } = useAuth();
const gamificationData = useUserGamification(user?.id);
```

**Imports a verificar/agregar:** Los mismos que anteriores

**Validación:**
```bash
# Verificar eliminación de hardcode
grep -n "level: 5" apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx
# Debe retornar vacío
```

---

### Paso 5: Validar TypeScript (30 min)

```bash
cd apps/frontend

# Compilar TypeScript
npx tsc --noEmit

# Verificar que no hay errores en los 3 archivos modificados
```

**Errores esperados:** 0 en los archivos modificados

**Si hay errores:**
- Verificar imports correctos
- Verificar que `useUserGamification` está exportado
- Verificar que `useAuth` está disponible

---

### Paso 6: Testing Manual (1.5 horas)

**6.1 Iniciar aplicación**

```bash
# Terminal 1: Backend
cd apps/backend
npm run dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

**6.2 Testing TeacherStudentsPage**

```bash
# 1. Login como teacher@gamilit.com / Test1234
# 2. Navegar a Teacher → Estudiantes
# 3. Verificar header/sidebar muestra datos reales de gamificación
```

**Validaciones:**
- [ ] Level muestra valor real del usuario (no hardcoded "5")
- [ ] XP muestra valor real (no hardcoded "3200")
- [ ] ML Coins muestra valor real (no hardcoded "850")
- [ ] Rank muestra valor real (no hardcoded "Ah K'in")
- [ ] Si API falla, muestra fallback apropiado
- [ ] Loading state funciona (spinner mientras carga)

**Verificar en DevTools → Network:**
- [ ] Se hace llamada a `/api/gamification/user/:userId/stats` o similar
- [ ] Respuesta tiene datos reales
- [ ] Status 200

**6.3 Testing TeacherClassesPage**

```bash
# Navegar a Teacher → Clases
# Repetir validaciones anteriores
```

**6.4 Testing AdminInstitutionsPage**

```bash
# 1. Logout
# 2. Login como admin@gamilit.com / Test1234
# 3. Navegar a Admin → Instituciones
# 4. Verificar header muestra datos reales del admin
```

**Validaciones:**
- [ ] Datos de gamificación corresponden al admin (no al teacher)
- [ ] Al cambiar de usuario, datos se actualizan
- [ ] Network request va al userId correcto

---

### Paso 7: Crear commits atómicos (30 min)

```bash
# Commit 1: TeacherStudentsPage
git add apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx
git commit -m "refactor(teacher): connect TeacherStudentsPage to real gamification API

- Remove hardcoded gamificationData object
- Use useUserGamification hook to fetch real data
- Add useAuth hook to get current user ID

Part of Tarea 4: Fix Gamification Data in Wrappers

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 2: TeacherClassesPage
git add apps/frontend/src/apps/teacher/pages/TeacherClassesPage.tsx
git commit -m "refactor(teacher): connect TeacherClassesPage to real gamification API

- Remove hardcoded gamificationData object
- Use useUserGamification hook to fetch real data
- Add useAuth hook to get current user ID

Part of Tarea 4: Fix Gamification Data in Wrappers

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Commit 3: AdminInstitutionsPage
git add apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx
git commit -m "refactor(admin): connect AdminInstitutionsPage to real gamification API

- Remove hardcoded gamificationData object
- Use useUserGamification hook to fetch real data
- Add useAuth hook to get current user ID

Part of Tarea 4: Fix Gamification Data in Wrappers

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 📊 CRITERIOS DE ACEPTACIÓN

### Funcionales

1. ✅ TeacherStudentsPage muestra datos reales de gamificación del usuario logueado
2. ✅ TeacherClassesPage muestra datos reales de gamificación del usuario logueado
3. ✅ AdminInstitutionsPage muestra datos reales de gamificación del usuario logueado
4. ✅ Al cambiar de usuario (logout/login), datos se actualizan correctamente
5. ✅ Loading states funcionan mientras carga API
6. ✅ Fallback funciona si API falla o usuario no tiene datos

### Técnicos

1. ✅ TypeScript compila sin errores
2. ✅ NO quedan objetos `gamificationData` hardcodeados
3. ✅ Imports de `useAuth` y `useUserGamification` correctos
4. ✅ Hook `useUserGamification` recibe `user?.id` (con optional chaining)
5. ✅ 3 commits atómicos creados con mensajes descriptivos

---

## 🚨 PUNTOS CRÍTICOS

### ⚠️ NO hacer

1. **NO modificar el hook `useUserGamification`** - Ya existe y funciona
2. **NO modificar componentes de UI** (Header, Sidebar) - Solo las páginas wrapper
3. **NO crear mocks** - Usar API real
4. **NO cambiar estructura de componentes** - Solo el origen de datos

### ✅ Sí hacer

1. **SÍ eliminar TODO el objeto hardcodeado** `gamificationData`
2. **SÍ usar optional chaining** `user?.id` para evitar errores
3. **SÍ verificar que imports están correctos**
4. **SÍ hacer testing manual** en ambos portales (Teacher y Admin)
5. **SÍ crear commits separados** por archivo modificado

---

## 🔍 VALIDACIÓN DE CALIDAD

### Checklist por Archivo

**TeacherStudentsPage.tsx:**
- [ ] Objeto hardcodeado eliminado
- [ ] Import `useAuth` agregado
- [ ] Import `useUserGamification` agregado
- [ ] Llamada a `useAuth()` agregada
- [ ] Llamada a `useUserGamification(user?.id)` agregada
- [ ] TypeScript compila sin errores
- [ ] Testing manual OK

**TeacherClassesPage.tsx:**
- [ ] Objeto hardcodeado eliminado
- [ ] Import `useAuth` agregado
- [ ] Import `useUserGamification` agregado
- [ ] Llamada a `useAuth()` agregada
- [ ] Llamada a `useUserGamification(user?.id)` agregada
- [ ] TypeScript compila sin errores
- [ ] Testing manual OK

**AdminInstitutionsPage.tsx:**
- [ ] Objeto hardcodeado eliminado
- [ ] Import `useAuth` agregado
- [ ] Import `useUserGamification` agregado
- [ ] Llamada a `useAuth()` agregada
- [ ] Llamada a `useUserGamification(user?.id)` agregada
- [ ] TypeScript compila sin errores
- [ ] Testing manual OK

---

## 📚 RECURSOS DE REFERENCIA

### Documentación

- **Plan Detallado (Sección 4):** Líneas 1973-2047 del archivo `PLAN-DETALLADO-INTEGRACION-APIS.md`
- **Reporte de Análisis:** `/orchestration/reportes/REPORTE-CONSOLIDADO-PORTALES-ADMIN-TEACHER-2025-11-23.md`

### Hook Existente

- **`useUserGamification`:** `apps/frontend/src/shared/hooks/useUserGamification.ts`
  - Ya implementado y funcional
  - Recibe `userId` como parámetro
  - Retorna objeto con: `level`, `xp`, `mlCoins`, `rank`, `isLoading`, `error`

### Componentes Modificados Anteriormente

- **`AdminGamificationPage.tsx`:** Ya corregido en Tarea 1 (ejemplo de referencia)
  - Ver commit `f943533` para ver cómo se hizo el cambio

---

## ⏱️ TIMELINE DETALLADO

| Hora | Actividad | Entregable |
|------|-----------|------------|
| 0-0.5h | Leer archivos actuales | Ubicación de hardcode identificada |
| 0.5-1h | Modificar TeacherStudentsPage | Archivo actualizado |
| 1-1.5h | Modificar TeacherClassesPage | Archivo actualizado |
| 1.5-2h | Modificar AdminInstitutionsPage | Archivo actualizado |
| 2-2.5h | Validar TypeScript | Compilación OK |
| 2.5-4h | Testing manual (3 páginas) | Validación completa |
| 4-4.5h | Crear commits | 3 commits con SHAs |

**Total: 4.5 horas**

---

## 🎯 PRÓXIMOS PASOS POST-TAREA-4

Una vez completada la Tarea 4, se procederá con:

**Opción A: Validación Intermedia**
- Testing manual de Tareas 1, 2, 4
- Screenshots/evidencia
- Reporte de validación

**Opción B: Continuar con Tarea 3**
- UI Classroom-Teacher (3 días)
- Requiere aprobación de PO

**Opción C: Cerrar plan**
- Generar reporte final
- Documentar gaps restantes
- Entregar MVP parcial

**Decisión:** Esperar indicación de Architecture-Analyst

---

## 📞 CONTACTO Y SOPORTE

**Delegado por:** Architecture-Analyst
**Para dudas:** Consultar plan detallado o escalar
**Validación:** Architecture-Analyst revisará al completar

---

## 🎯 DEFINICIÓN DE DONE

La tarea se considera COMPLETA cuando:

1. ✅ 3 archivos modificados correctamente
2. ✅ 0 objetos `gamificationData` hardcodeados en esos archivos
3. ✅ TypeScript compila sin errores
4. ✅ Testing manual completado en 3 páginas
5. ✅ 3 commits creados con SHAs
6. ✅ Datos de gamificación muestran valores reales del usuario logueado
7. ✅ Architecture-Analyst valida y aprueba

---

**FIN DE LA DELEGACIÓN**

**Fecha:** 2025-11-23
**Estado:** INICIADO - Esperando ejecución de Frontend-Developer
**Próxima Revisión:** Al completar testing manual
