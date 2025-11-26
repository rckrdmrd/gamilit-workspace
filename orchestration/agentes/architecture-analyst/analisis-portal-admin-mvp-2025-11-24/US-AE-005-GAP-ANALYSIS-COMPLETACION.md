# US-AE-005: ANÁLISIS DE GAPS Y ESPECIFICACIÓN DE COMPLETACIÓN
## Configuración de Gamificación - Portal Admin

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Tipo:** Gap Analysis & Completion Specification
**Prioridad:** MEDIA (Post-MVP)

---

## TABLA DE CONTENIDO

1. [Estado Actual - Análisis Completo](#estado-actual-análisis-completo)
2. [Identificación de Gaps](#identificación-de-gaps)
3. [Especificación Técnica de Componentes Faltantes](#especificación-técnica-de-componentes-faltantes)
4. [Plan de Implementación](#plan-de-implementación)
5. [Wireframes y Mockups](#wireframes-y-mockups)
6. [Criterios de Aceptación](#criterios-de-aceptación)

---

## ESTADO ACTUAL - ANÁLISIS COMPLETO

### 1.1 Backend: 100% Implementado ✅

**Archivo:** `apps/backend/src/modules/admin/controllers/admin-gamification-config.controller.ts`
- **Líneas de código:** 605 líneas
- **Endpoints implementados:** 12 endpoints totales

#### Endpoints Disponibles:

**Settings (Bulk) - 4 endpoints:**
1. `GET /api/admin/gamification/settings` - Obtener configuración global
2. `PUT /api/admin/gamification/settings` - Actualizar configuración
3. `POST /api/admin/gamification/settings/preview` - Previsualizar impacto
4. `POST /api/admin/gamification/settings/restore-defaults` - Restaurar defaults

**Parameters (Individual) - 3 endpoints:**
5. `GET /api/admin/gamification/parameters` - Listar parámetros (con filtros)
6. `GET /api/admin/gamification/parameters/:id` - Obtener parámetro por ID
7. `PUT /api/admin/gamification/parameters/:id` - Actualizar parámetro

**Maya Ranks - 3 endpoints:**
8. `GET /api/admin/gamification/maya-ranks` - Listar rangos Maya
9. `GET /api/admin/gamification/maya-ranks/:rankName` - Obtener rango por nombre
10. `PUT /api/admin/gamification/maya-ranks/:rankName` - Actualizar umbral de rango

**Stats - 1 endpoint:**
11. `GET /api/admin/gamification/stats` - Estadísticas generales

**Validaciones implementadas:**
- ✅ Validación de rangos (min < max)
- ✅ Validación de multiplicadores (>= 1.0)
- ✅ Validación de umbrales en orden ascendente
- ✅ Protección contra modificación de settings readonly/system
- ✅ Auditoría con adminId en todas las modificaciones

**Swagger Documentation:** ✅ Completamente documentado

---

### 1.2 Frontend Hook: 100% Implementado ✅

**Archivo:** `apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts`
- **Líneas de código:** 202 líneas
- **Queries implementadas:** 5 queries (React Query)
- **Mutations implementadas:** 5 mutations (React Query)

#### Queries Disponibles:

```typescript
// 1. Listar parámetros con filtros opcionales
const { data: parameters } = useParameters({
  category: 'xp',
  isActive: true
});

// 2. Obtener parámetro específico
const { data: parameter } = useParameter('xp.base_per_exercise');

// 3. Listar rangos Maya
const { data: mayaRanks } = useMayaRanks();

// 4. Obtener rango específico
const { data: mayaRank } = useMayaRank('novice');

// 5. Obtener estadísticas
const { data: stats } = useStats();
```

#### Mutations Disponibles:

```typescript
// 1. Actualizar parámetro
updateParameter.mutate({
  key: 'xp.base_per_exercise',
  data: { value: 15 }
});

// 2. Resetear parámetro a default
resetParameter.mutate('xp.base_per_exercise');

// 3. Actualización masiva de parámetros
bulkUpdateParameters.mutate({
  updates: [
    { key: 'xp.base', value: 15 },
    { key: 'xp.multiplier', value: 2.0 }
  ]
});

// 4. Actualizar rango Maya
updateMayaRank.mutate({
  id: 'novice',
  data: { minXp: 0, maxXp: 150 }
});

// 5. Previsualizar impacto de cambios
previewImpact.mutate({
  xp: { base_per_exercise: 20 },
  sample_size: 1000
});
```

**Características:**
- ✅ Cache management con React Query
- ✅ Invalidación automática de queries relacionadas
- ✅ Toast notifications (éxito/error)
- ✅ Optimistic updates configurados
- ✅ Error handling robusto

---

### 1.3 Frontend UI: 60% Implementado ⚠️

**Archivo:** `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`
- **Líneas de código:** 388 líneas
- **Tabs implementadas:** 4 tabs (Rangos Maya, Logros, Economía ML Coins, Estadísticas)

#### Funcionalidades Implementadas:

**✅ Visualización Completa:**
1. **Tab "Rangos Maya":**
   - Lista de 5 rangos con validación Zod
   - Ordenamiento automático por nivel
   - Visualización de:
     - Nombre del rango (español)
     - Rango de XP (min-max)
     - Color representativo
     - Nivel jerárquico
     - Multiplicadores (XP y ML Coins)
     - Estado (activo/inactivo)
   - Filtrado de rangos inválidos

2. **Tab "Economía ML Coins":**
   - Estadísticas generales (total parámetros, activos, por categoría)
   - Lista de parámetros de economía con validación Zod
   - Visualización de:
     - Key del parámetro
     - Valor actual
     - Descripción
     - Valor por defecto
     - Tipo de dato (number, percentage, etc.)

3. **Tab "Estadísticas":**
   - Cards con métricas:
     - Total parámetros
     - Parámetros activos
     - Total rangos Maya
     - Rangos activos
   - Desglose por categorías (points, coins, levels, ranks, penalties, bonuses)

4. **Tab "Logros":**
   - Mensaje de "En desarrollo"
   - Placeholder funcional

**❌ Funcionalidades NO Implementadas:**

1. **Botón "Configurar Rangos"** (línea 151):
   ```typescript
   onClick={() => alert('Editar rangos - Funcionalidad próximamente')}
   ```

2. **Botón "Configurar Parámetros"** (línea 309):
   ```typescript
   onClick={() => alert('Edición de parámetros - Funcionalidad próximamente')}
   ```

3. **Botón "Nuevo Logro"** (línea 216):
   ```typescript
   onClick={() => alert('Funcionalidad en desarrollo')}
   ```

**Loading States:** ✅ Implementados con Loader2 de lucide-react
**Error Handling:** ✅ Validación inline con Zod
**Responsive Design:** ✅ Grid responsive (1/2/3/4/6 columnas)

---

## IDENTIFICACIÓN DE GAPS

### Gap 1: Formularios de Edición Faltantes

**Componentes NO implementados:**
1. `ParameterEditModal.tsx` - Editar parámetro individual
2. `MayaRankEditModal.tsx` - Editar rango Maya
3. `BulkUpdateDialog.tsx` - Actualización masiva de parámetros
4. `PreviewImpactDialog.tsx` - Previsualizar impacto de cambios
5. `RestoreDefaultsDialog.tsx` - Confirmar restauración a defaults

**Impacto:** Usuarios no pueden modificar configuración de gamificación desde UI

---

### Gap 2: Conexión Hook-UI

**Problema:**
- Hooks existen y están funcionales ✅
- Backend funciona correctamente ✅
- **PERO:** Mutations NO están conectadas a la UI

**Evidencia:**
```typescript
// Hook tiene la mutation:
const { updateParameter } = useGamificationConfig();

// Pero la UI solo muestra alert:
onClick={() => alert('Edición de parámetros - Funcionalidad próximamente')}
```

**Solución:** Crear modales y conectar con mutations existentes

---

### Gap 3: Validaciones UI

**Faltantes:**
- ✅ Validación de rangos de valores (min/max)
- ✅ Validación de tipos de datos
- ⚠️ Validación de impacto antes de guardar (opcional)
- ⚠️ Confirmación para cambios críticos

---

### Gap 4: Feedback Visual

**Faltantes:**
- ⚠️ Indicador visual de cambios sin guardar
- ⚠️ Preview de cómo afectará el cambio
- ⚠️ Historial de cambios recientes

---

## ESPECIFICACIÓN TÉCNICA DE COMPONENTES FALTANTES

### Componente 1: ParameterEditModal

**Ubicación:** `apps/frontend/src/apps/admin/components/gamification/ParameterEditModal.tsx`

**Props:**
```typescript
interface ParameterEditModalProps {
  parameter: Parameter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, value: any) => Promise<void>;
}
```

**Funcionalidad:**
- Form con validación para editar un parámetro
- Input type basado en `dataType` del parámetro:
  - `number`: input type="number" con min/max
  - `percentage`: input type="number" con suffix "%"
  - `string`: input type="text"
  - `boolean`: toggle switch
- Mostrar valor actual vs nuevo valor
- Botón "Guardar" deshabilitado si no hay cambios
- Botón "Restaurar Default" (opcional)

**Validaciones:**
- Respetar `minValue` y `maxValue` del parámetro
- No permitir valores negativos si aplica
- Validar formato según `dataType`

**Diseño:**
```
┌────────────────────────────────────────┐
│ Editar Parámetro               [X]     │
├────────────────────────────────────────┤
│                                        │
│ Nombre: Base XP por Ejercicio         │
│ Key: xp.base_per_exercise              │
│                                        │
│ Descripción:                           │
│ XP otorgado por completar un ejercicio │
│                                        │
│ Valor Actual: 10                       │
│                                        │
│ Nuevo Valor:                           │
│ ┌──────────────────┐                   │
│ │ 15               │ [Min: 1, Max: 100]│
│ └──────────────────┘                   │
│                                        │
│ Valor por Defecto: 10                  │
│                                        │
│ [Restaurar Default]  [Cancelar] [Guardar]│
└────────────────────────────────────────┘
```

**Estimación:** 4 horas

---

### Componente 2: MayaRankEditModal

**Ubicación:** `apps/frontend/src/apps/admin/components/gamification/MayaRankEditModal.tsx`

**Props:**
```typescript
interface MayaRankEditModalProps {
  rank: MayaRank | null;
  allRanks: MayaRank[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: UpdateMayaRankDto) => Promise<void>;
}
```

**Funcionalidad:**
- Form para editar umbrales de XP de un rango
- Validación automática de orden ascendente
- Warning si el cambio afectará a usuarios actuales
- Mostrar rango anterior y siguiente para contexto
- Preview de cómo quedaría la jerarquía completa

**Validaciones:**
- `minXp` del rango actual >= `maxXp` del rango anterior
- `maxXp` del rango actual <= `minXp` del rango siguiente
- No solapamiento de rangos
- Primer rango siempre inicia en 0

**Diseño:**
```
┌────────────────────────────────────────┐
│ Editar Rango Maya: Nacom       [X]     │
├────────────────────────────────────────┤
│                                        │
│ Rango Anterior: Ajaw (0-999 XP)       │
│                                        │
│ Configuración de Nacom:                │
│                                        │
│ XP Mínimo:                             │
│ ┌──────────────────┐                   │
│ │ 1000             │ (debe ser >= 1000)│
│ └──────────────────┘                   │
│                                        │
│ XP Máximo:                             │
│ ┌──────────────────┐                   │
│ │ 2999             │ (debe ser <= 2999)│
│ └──────────────────┘                   │
│                                        │
│ Rango Siguiente: Ah K'in (3000-5999)  │
│                                        │
│ ⚠️ Este cambio afectará a 150 usuarios│
│                                        │
│ Jerarquía Resultante:                  │
│ • Ajaw: 0-999                          │
│ • Nacom: 1000-2999 (editando)          │
│ • Ah K'in: 3000-5999                   │
│ • Halach Uinic: 6000-9999              │
│ • K'uk'ulkan: 10000+                   │
│                                        │
│         [Cancelar] [Guardar Cambios]   │
└────────────────────────────────────────┘
```

**Estimación:** 4 horas

---

### Componente 3: BulkUpdateDialog

**Ubicación:** `apps/frontend/src/apps/admin/components/gamification/BulkUpdateDialog.tsx`

**Props:**
```typescript
interface BulkUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: BulkUpdateParametersDto) => Promise<void>;
}
```

**Funcionalidad:**
- Seleccionar múltiples parámetros para actualizar
- Aplicar multiplicador global (ej: aumentar todos los XP en 20%)
- Aplicar valor fijo a categoría completa
- Preview de cambios antes de aplicar

**Diseño:**
```
┌────────────────────────────────────────┐
│ Actualización Masiva           [X]     │
├────────────────────────────────────────┤
│                                        │
│ Tipo de actualización:                 │
│ ● Multiplicador    ○ Valor fijo        │
│                                        │
│ Categoría:                             │
│ ┌────────────────────────┐             │
│ │ XP (points)       ▼    │             │
│ └────────────────────────┘             │
│                                        │
│ Multiplicador:                         │
│ ┌──────────────────┐                   │
│ │ 1.2x             │ (+20%)            │
│ └──────────────────┘                   │
│                                        │
│ Parámetros afectados: 8                │
│                                        │
│ Preview de cambios:                    │
│ • xp.base_per_exercise: 10 → 12        │
│ • xp.completion_multiplier: 1.5 → 1.8  │
│ • xp.first_attempt_bonus: 5 → 6        │
│ ... (ver todos)                        │
│                                        │
│         [Cancelar] [Aplicar Cambios]   │
└────────────────────────────────────────┘
```

**Estimación:** 6 horas

---

### Componente 4: PreviewImpactDialog

**Ubicación:** `apps/frontend/src/apps/admin/components/gamification/PreviewImpactDialog.tsx`

**Props:**
```typescript
interface PreviewImpactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  impactData: PreviewImpactResultDto | null;
}
```

**Funcionalidad:**
- Mostrar resultados de `POST /settings/preview`
- Visualizar cuántos usuarios serán afectados
- Mostrar cambios de rangos (promociones/demotions)
- Impacto en XP y ML Coins

**Diseño:**
```
┌────────────────────────────────────────┐
│ Vista Previa de Impacto        [X]     │
├────────────────────────────────────────┤
│                                        │
│ Usuarios Afectados: 850 / 1000        │
│                                        │
│ Cambios de Rangos:                     │
│ ┌────────────────────────────────────┐ │
│ │ Promociones: 85 usuarios           │ │
│ │ Degradaciones: 12 usuarios         │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Impacto en XP:                         │
│ ┌────────────────────────────────────┐ │
│ │ Promedio por usuario: +25.5 XP     │ │
│ │ Total sistema: +21,675 XP          │ │
│ └────────────────────────────────────┘ │
│                                        │
│ Impacto en ML Coins:                   │
│ ┌────────────────────────────────────┐ │
│ │ Promedio por usuario: +0 Coins     │ │
│ │ Total sistema: +0 Coins            │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ℹ️ Estos cambios son estimados basados│
│    en una muestra de 1000 usuarios     │
│                                        │
│ ¿Desea aplicar estos cambios?         │
│                                        │
│         [Cancelar] [Aplicar Cambios]   │
└────────────────────────────────────────┘
```

**Estimación:** 4 horas

---

### Componente 5: RestoreDefaultsDialog

**Ubicación:** `apps/frontend/src/apps/admin/components/gamification/RestoreDefaultsDialog.tsx`

**Props:**
```typescript
interface RestoreDefaultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}
```

**Funcionalidad:**
- Confirmación crítica para restaurar todos los valores a defaults
- Warning sobre impacto irreversible
- Lista de settings que serán restaurados
- Requerir confirmación escrita (escribir "RESTAURAR")

**Diseño:**
```
┌────────────────────────────────────────┐
│ ⚠️ Restaurar Valores por Defecto [X]   │
├────────────────────────────────────────┤
│                                        │
│ ⚠️ ADVERTENCIA CRÍTICA                 │
│                                        │
│ Esta acción NO se puede deshacer.      │
│ Todos los parámetros de gamificación   │
│ serán restaurados a sus valores        │
│ originales del sistema.                │
│                                        │
│ Settings que serán restaurados:        │
│ • gamification.xp.base_per_exercise    │
│ • gamification.xp.completion_multiplier│
│ • gamification.ranks.thresholds        │
│ • gamification.coins.welcome_bonus     │
│ • ... y 25 más                         │
│                                        │
│ Usuarios afectados: TODOS (1,250)      │
│                                        │
│ Para confirmar, escriba: RESTAURAR     │
│ ┌──────────────────┐                   │
│ │                  │                   │
│ └──────────────────┘                   │
│                                        │
│ [Cancelar]  [Restaurar Todo] (disabled)│
└────────────────────────────────────────┘
```

**Estimación:** 3 horas

---

## PLAN DE IMPLEMENTACIÓN

### Fase 1: Edición Básica de Parámetros (Sprint 1) - 1-2 SP

**Duración estimada:** 3-5 días
**Prioridad:** ALTA

**Tareas:**
1. Crear `ParameterEditModal.tsx` (4h)
2. Conectar con mutation `updateParameter` (2h)
3. Agregar validaciones de formulario (2h)
4. Implementar toast notifications (1h)
5. Testing manual (1h)
6. Actualizar documentación (1h)

**Entregables:**
- ✅ Admin puede editar parámetros individuales
- ✅ Validación de valores min/max
- ✅ Feedback visual (éxito/error)
- ✅ Botón "Restaurar Default" funcional

**Criterios de aceptación:**
- [ ] Modal se abre al hacer clic en "Editar parámetro"
- [ ] Input muestra valor actual
- [ ] Validación de min/max funciona
- [ ] Botón "Guardar" llama a mutation
- [ ] Cambio se refleja inmediatamente en la lista
- [ ] Toast de éxito aparece

---

### Fase 2: Edición de Rangos Maya (Sprint 1) - 1 SP

**Duración estimada:** 2-3 días
**Prioridad:** ALTA

**Tareas:**
1. Crear `MayaRankEditModal.tsx` (4h)
2. Implementar validación de orden ascendente (2h)
3. Conectar con mutation `updateMayaRank` (2h)
4. Agregar preview de jerarquía resultante (2h)
5. Testing manual (1h)

**Entregables:**
- ✅ Admin puede editar umbrales de rangos Maya
- ✅ Validación automática de no solapamiento
- ✅ Preview de jerarquía completa
- ✅ Warning de usuarios afectados

**Criterios de aceptación:**
- [ ] Modal se abre al hacer clic en "Editar rango"
- [ ] Validación de orden funciona
- [ ] No permite solapamiento de rangos
- [ ] Preview muestra jerarquía actualizada
- [ ] Cambio se refleja en lista
- [ ] Toast de éxito aparece

---

### Fase 3: Funcionalidades Avanzadas (Sprint 2) - 2 SP

**Duración estimada:** 5-7 días
**Prioridad:** MEDIA

**Tareas:**
1. Crear `BulkUpdateDialog.tsx` (6h)
2. Crear `PreviewImpactDialog.tsx` (4h)
3. Crear `RestoreDefaultsDialog.tsx` (3h)
4. Conectar mutations correspondientes (3h)
5. Testing end-to-end (3h)
6. Documentación completa (2h)

**Entregables:**
- ✅ Actualización masiva de parámetros
- ✅ Preview de impacto antes de aplicar
- ✅ Restaurar defaults con confirmación crítica

**Criterios de aceptación:**
- [ ] Bulk update funciona para múltiples parámetros
- [ ] Preview muestra usuarios afectados
- [ ] Restaurar defaults requiere confirmación escrita
- [ ] Todas las operaciones loguean auditoría

---

### Resumen de Esfuerzo Total:

| Fase | Story Points | Días | Horas |
|------|-------------|------|-------|
| Fase 1: Edición Básica | 1-2 SP | 3-5 días | 10-15h |
| Fase 2: Rangos Maya | 1 SP | 2-3 días | 8-12h |
| Fase 3: Avanzado | 2 SP | 5-7 días | 16-24h |
| **TOTAL** | **4-5 SP** | **10-15 días** | **34-51h** |

**Nota:** Asume 1 SP = 8 horas de trabajo efectivo

---

## WIREFRAMES Y MOCKUPS

### Wireframe 1: ParameterEditModal (Editar Parámetro XP)

```
┌──────────────────────────────────────────────────────────┐
│ Editar Parámetro: XP Base por Ejercicio          [X]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📋 Información del Parámetro                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Nombre: Base XP per Exercise                       │  │
│  │ Key: gamification.xp.base_per_exercise             │  │
│  │ Categoría: XP (points)                             │  │
│  │                                                    │  │
│  │ Descripción:                                       │  │
│  │ Base XP awarded for completing an exercise         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  💰 Valor Actual                                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │  10 XP                                             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ✏️ Nuevo Valor                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │  ┌────────────┐                                    │  │
│  │  │ 15         │ XP                                 │  │
│  │  └────────────┘                                    │  │
│  │                                                    │  │
│  │  Rango válido: 1 - 1000 XP                         │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  🔄 Valor por Defecto: 10 XP                             │
│                                                          │
│  ℹ️ Este cambio afectará a futuros ejercicios completados│
│                                                          │
│  ┌──────────────────────┐                               │
│  │ [↺] Restaurar Default │                              │
│  └──────────────────────┘                               │
│                                                          │
│                           [Cancelar]  [Guardar Cambios]  │
└──────────────────────────────────────────────────────────┘
```

---

### Wireframe 2: MayaRankEditModal (Editar Rango Nacom)

```
┌──────────────────────────────────────────────────────────┐
│ Editar Rango Maya: Nacom                          [X]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🏆 Información del Rango                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Nivel: 2                                           │  │
│  │ Color: #3B82F6 (azul)                              │  │
│  │ Multiplicador XP: 1.1x                             │  │
│  │ Multiplicador ML Coins: 1.05x                      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📊 Contexto de Jerarquía                                │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ⬆️ Rango Anterior: Ajaw (0 - 999 XP)                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ✏️ Configuración de Umbrales                            │
│  ┌────────────────────────────────────────────────────┐  │
│  │ XP Mínimo:                                         │  │
│  │ ┌────────────┐                                     │  │
│  │ │ 1000       │ XP  (debe ser >= 1000)              │  │
│  │ └────────────┘                                     │  │
│  │                                                    │  │
│  │ XP Máximo:                                         │  │
│  │ ┌────────────┐                                     │  │
│  │ │ 2999       │ XP  (debe ser < 3000)               │  │
│  │ └────────────┘                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ⬇️ Rango Siguiente: Ah K'in (3000 - 5999 XP)        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ⚠️ Impacto Estimado                                     │
│  ┌────────────────────────────────────────────────────┐  │
│  │ • 150 usuarios actualmente en este rango           │  │
│  │ • 12 usuarios podrían cambiar de rango             │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📋 Vista Previa de Jerarquía Resultante                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 1. Ajaw: 0 - 999 XP                                │  │
│  │ 2. Nacom: 1000 - 2999 XP ⬅️ Editando                │  │
│  │ 3. Ah K'in: 3000 - 5999 XP                         │  │
│  │ 4. Halach Uinic: 6000 - 9999 XP                    │  │
│  │ 5. K'uk'ulkan: 10000+ XP                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│                           [Cancelar]  [Guardar Cambios]  │
└──────────────────────────────────────────────────────────┘
```

---

### Wireframe 3: BulkUpdateDialog (Actualización Masiva)

```
┌──────────────────────────────────────────────────────────┐
│ Actualización Masiva de Parámetros                [X]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ⚙️ Configuración de Actualización                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Tipo de actualización:                             │  │
│  │ ● Multiplicador      ○ Valor fijo                  │  │
│  │                                                    │  │
│  │ Categoría a actualizar:                            │  │
│  │ ┌──────────────────────────────┐                  │  │
│  │ │ XP (points)              ▼   │                  │  │
│  │ └──────────────────────────────┘                  │  │
│  │                                                    │  │
│  │ Multiplicador:                                     │  │
│  │ ┌────────────┐                                     │  │
│  │ │ 1.2        │ x  (aumentar 20%)                   │  │
│  │ └────────────┘                                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📊 Parámetros Afectados: 8                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ┌──────────────────────────────────────────────┐  │  │
│  │ │ Parámetro                  Actual → Nuevo     │  │  │
│  │ ├──────────────────────────────────────────────┤  │  │
│  │ │ xp.base_per_exercise       10 → 12           │  │  │
│  │ │ xp.completion_multiplier   1.5 → 1.8         │  │  │
│  │ │ xp.first_attempt_bonus     5 → 6             │  │  │
│  │ │ xp.perfect_score_bonus     10 → 12           │  │  │
│  │ │ xp.streak_bonus            3 → 3.6           │  │  │
│  │ │ xp.daily_login_bonus       5 → 6             │  │  │
│  │ │ xp.module_completion       50 → 60           │  │  │
│  │ │ xp.challenge_win           20 → 24           │  │  │
│  │ └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ⚠️ Advertencia                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Esta acción actualizará 8 parámetros               │  │
│  │ simultáneamente. Los cambios serán permanentes.    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│                [Cancelar]  [Aplicar Actualización Masiva]│
└──────────────────────────────────────────────────────────┘
```

---

### Wireframe 4: PreviewImpactDialog (Vista Previa de Impacto)

```
┌──────────────────────────────────────────────────────────┐
│ Vista Previa de Impacto                           [X]     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Análisis de Impacto                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Sample analizado: 1,000 usuarios                   │  │
│  │ Usuarios afectados: 850 (85%)                      │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  🏆 Cambios de Rangos Maya                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ┌───────────────────────────────────┐              │  │
│  │ │ Promociones (rank up):        85  │ ⬆️           │  │
│  │ └───────────────────────────────────┘              │  │
│  │                                                    │  │
│  │ ┌───────────────────────────────────┐              │  │
│  │ │ Degradaciones (rank down):    12  │ ⬇️           │  │
│  │ └───────────────────────────────────┘              │  │
│  │                                                    │  │
│  │ Distribución de cambios:                           │  │
│  │ • Ajaw → Nacom: 50 usuarios                        │  │
│  │ • Nacom → Ah K'in: 25 usuarios                     │  │
│  │ • Ah K'in → Halach Uinic: 10 usuarios              │  │
│  │ • Nacom → Ajaw: 8 usuarios (degradación)           │  │
│  │ • Ah K'in → Nacom: 4 usuarios (degradación)        │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  💰 Impacto en XP                                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Promedio por usuario:        +25.5 XP              │  │
│  │ Total en el sistema:         +21,675 XP            │  │
│  │ Rango de cambio:             +5 a +50 XP           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  💎 Impacto en ML Coins                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Promedio por usuario:        +0 Coins              │  │
│  │ Total en el sistema:         +0 Coins              │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  ℹ️ Nota: Estas son estimaciones basadas en una muestra │
│     representativa. Los resultados reales pueden variar. │
│                                                          │
│  ❓ ¿Desea aplicar estos cambios de configuración?       │
│                                                          │
│                           [Cancelar]  [Aplicar Cambios]  │
└──────────────────────────────────────────────────────────┘
```

---

### Wireframe 5: RestoreDefaultsDialog (Restaurar Defaults)

```
┌──────────────────────────────────────────────────────────┐
│ ⚠️ Restaurar Valores por Defecto                   [X]    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  🚨 ADVERTENCIA CRÍTICA                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Esta acción NO se puede deshacer.                  │  │
│  │                                                    │  │
│  │ Todos los parámetros de gamificación serán         │  │
│  │ restaurados a sus valores originales del sistema.  │  │
│  │                                                    │  │
│  │ Se perderán todas las personalizaciones que        │  │
│  │ haya realizado hasta la fecha.                     │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  📋 Settings que serán restaurados                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │ ┌──────────────────────────────────────────────┐  │  │
│  │ │ • gamification.xp.base_per_exercise          │  │  │
│  │ │ • gamification.xp.completion_multiplier      │  │  │
│  │ │ • gamification.ranks.thresholds              │  │  │
│  │ │ • gamification.coins.welcome_bonus           │  │  │
│  │ │ • gamification.coins.daily_reward            │  │  │
│  │ │ • gamification.achievements.criteria         │  │  │
│  │ │ ... y 22 parámetros más                      │  │  │
│  │ └──────────────────────────────────────────────┘  │  │
│  │                                                    │  │
│  │ Total de parámetros: 28                            │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  👥 Impacto en Usuarios                                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Usuarios afectados: TODOS (1,250 usuarios)         │  │
│  │ Rangos que pueden cambiar: TODOS                   │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│  🔐 Confirmación Requerida                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Para confirmar esta acción crítica, por favor      │  │
│  │ escriba exactamente: RESTAURAR                     │  │
│  │                                                    │  │
│  │ ┌────────────────────────────────┐                │  │
│  │ │                                │                │  │
│  │ └────────────────────────────────┘                │  │
│  └────────────────────────────────────────────────────┘  │
│                                                          │
│       [Cancelar]  [Restaurar Todo] (⚠️ disabled hasta    │
│                                      escribir RESTAURAR) │
└──────────────────────────────────────────────────────────┘
```

---

## CRITERIOS DE ACEPTACIÓN

### Criterio General: US-AE-005 Completa

La historia de usuario US-AE-005 se considerará COMPLETADA cuando:

✅ **Backend:**
- [x] 12 endpoints implementados y documentados en Swagger
- [x] Validaciones robustas de datos
- [x] Auditoría de cambios con adminId
- [x] Tests unitarios de controllers y services

✅ **Frontend Hook:**
- [x] 5 queries implementadas (React Query)
- [x] 5 mutations implementadas (React Query)
- [x] Cache invalidation configurada
- [x] Toast notifications en todas las operaciones

⚠️ **Frontend UI (Pendiente):**
- [ ] Modal de edición de parámetros funcional
- [ ] Modal de edición de rangos Maya funcional
- [ ] Diálogo de actualización masiva funcional
- [ ] Diálogo de preview de impacto funcional
- [ ] Diálogo de restaurar defaults funcional

---

### Criterios de Aceptación por Componente

#### 1. ParameterEditModal

**Como** administrador
**Quiero** editar un parámetro de gamificación individual
**Para** ajustar la economía del sistema sin afectar otros valores

**Criterios:**
- [ ] Al hacer clic en botón "Editar" de un parámetro, se abre el modal
- [ ] Modal muestra información completa del parámetro (nombre, key, descripción)
- [ ] Input muestra el valor actual del parámetro
- [ ] Validación de min/max funciona (no permite valores fuera de rango)
- [ ] Validación de tipo de dato funciona (number, percentage, string, boolean)
- [ ] Botón "Guardar" está deshabilitado si no hay cambios
- [ ] Al guardar, se llama a mutation `updateParameter`
- [ ] Cambio se refleja inmediatamente en la lista (optimistic update)
- [ ] Toast de éxito aparece con mensaje "Parámetro actualizado correctamente"
- [ ] Toast de error aparece si falla (con mensaje específico del backend)
- [ ] Botón "Restaurar Default" llama a mutation `resetParameter`
- [ ] Botón "Cancelar" cierra el modal sin guardar cambios

---

#### 2. MayaRankEditModal

**Como** administrador
**Quiero** editar los umbrales de XP de un rango Maya
**Para** ajustar la progresión de rangos según el comportamiento de usuarios

**Criterios:**
- [ ] Al hacer clic en botón "Configurar" de rangos, se abre selector de rango
- [ ] Al seleccionar un rango, se abre el modal
- [ ] Modal muestra información completa del rango (nivel, color, multiplicadores)
- [ ] Muestra rango anterior con su rango de XP (contexto)
- [ ] Muestra rango siguiente con su rango de XP (contexto)
- [ ] Input de "XP Mínimo" tiene validación: debe ser >= maxXp del rango anterior
- [ ] Input de "XP Máximo" tiene validación: debe ser <= minXp del rango siguiente
- [ ] Validación automática de no solapamiento funciona
- [ ] Preview de jerarquía resultante se actualiza en tiempo real
- [ ] Warning de "usuarios afectados" se muestra (si aplica)
- [ ] Al guardar, se llama a mutation `updateMayaRank`
- [ ] Cambio se refleja en la lista de rangos
- [ ] Toast de éxito aparece
- [ ] Botón "Cancelar" cierra el modal sin guardar

---

#### 3. BulkUpdateDialog

**Como** administrador
**Quiero** actualizar múltiples parámetros de una categoría simultáneamente
**Para** hacer ajustes globales rápidos (ej: aumentar todos los XP en 20%)

**Criterios:**
- [ ] Al hacer clic en botón "Actualización Masiva", se abre el diálogo
- [ ] Selector de tipo funciona (Multiplicador / Valor fijo)
- [ ] Selector de categoría funciona (points, coins, levels, ranks, penalties, bonuses)
- [ ] Input de multiplicador acepta valores decimales (ej: 1.2)
- [ ] Lista de parámetros afectados se muestra dinámicamente
- [ ] Preview de cambios muestra "Actual → Nuevo" para cada parámetro
- [ ] Al cambiar multiplicador, preview se actualiza en tiempo real
- [ ] Warning de acción permanente se muestra
- [ ] Al hacer clic en "Aplicar", se llama a mutation `bulkUpdateParameters`
- [ ] Toast de éxito muestra cantidad de parámetros actualizados
- [ ] Lista de parámetros se refresca automáticamente
- [ ] Botón "Cancelar" cierra sin aplicar cambios

---

#### 4. PreviewImpactDialog

**Como** administrador
**Quiero** ver el impacto estimado de mis cambios antes de aplicarlos
**Para** tomar decisiones informadas sobre cambios en gamificación

**Criterios:**
- [ ] Al hacer clic en botón "Preview Impacto", se llama a API de preview
- [ ] Diálogo muestra cantidad de usuarios afectados (absoluto y %)
- [ ] Muestra cantidad de promociones de rango
- [ ] Muestra cantidad de degradaciones de rango
- [ ] Muestra distribución de cambios por rango
- [ ] Muestra impacto en XP (promedio, total, rango)
- [ ] Muestra impacto en ML Coins (promedio, total)
- [ ] Nota informativa sobre estimaciones se muestra
- [ ] Botón "Aplicar Cambios" ejecuta los cambios reales
- [ ] Botón "Cancelar" cierra sin aplicar
- [ ] Loading state se muestra mientras se calcula preview
- [ ] Error handling si preview falla

---

#### 5. RestoreDefaultsDialog

**Como** administrador
**Quiero** restaurar todos los parámetros a valores por defecto con confirmación crítica
**Para** poder resetear el sistema si algo sale mal

**Criterios:**
- [ ] Al hacer clic en botón "Restaurar Defaults", se abre diálogo de advertencia
- [ ] Advertencia crítica en rojo se muestra prominentemente
- [ ] Lista de settings a restaurar se muestra (primeros 5 + "... y N más")
- [ ] Cantidad total de parámetros se muestra
- [ ] Impacto en usuarios se muestra ("TODOS")
- [ ] Input de confirmación requiere escribir exactamente "RESTAURAR"
- [ ] Botón "Restaurar Todo" está deshabilitado hasta que se escriba correctamente
- [ ] Validación case-sensitive de texto de confirmación
- [ ] Al confirmar, se llama a mutation `restoreDefaults`
- [ ] Toast de éxito muestra cantidad de settings restaurados
- [ ] Lista completa de parámetros se refresca
- [ ] Botón "Cancelar" cierra sin restaurar

---

### Criterios de Aceptación de Testing

#### Tests Unitarios (Frontend):
- [ ] Tests de ParameterEditModal (renderizado, validación, submit)
- [ ] Tests de MayaRankEditModal (renderizado, validación, contexto)
- [ ] Tests de BulkUpdateDialog (selección, preview)
- [ ] Tests de PreviewImpactDialog (renderizado, datos)
- [ ] Tests de RestoreDefaultsDialog (confirmación crítica)
- [ ] Cobertura mínima: 80%

#### Tests de Integración:
- [ ] Test: Admin puede editar parámetro y cambio persiste
- [ ] Test: Admin puede editar rango Maya y jerarquía es correcta
- [ ] Test: Admin puede hacer actualización masiva
- [ ] Test: Preview de impacto muestra datos correctos
- [ ] Test: Restaurar defaults requiere confirmación y funciona

#### Tests E2E:
- [ ] Flujo completo: Login admin → Gamificación → Editar parámetro → Verificar cambio
- [ ] Flujo completo: Editar rango Maya → Verificar que usuarios se mueven de rango
- [ ] Flujo completo: Actualización masiva → Verificar múltiples parámetros cambian
- [ ] Flujo crítico: Restaurar defaults → Verificar todo vuelve a valores originales

---

### Criterios de Aceptación de Documentación

**Documentación Técnica:**
- [ ] README de US-AE-005 actualizado con componentes implementados
- [ ] JSDoc completo en todos los componentes
- [ ] Storybook stories para cada modal/diálogo
- [ ] Swagger documentation actualizada (ya existe ✅)

**Documentación de Usuario:**
- [ ] Manual de Portal Admin actualizado (Capítulo 7)
- [ ] Screenshots de cada modal agregados
- [ ] Tutorial paso a paso de edición de parámetros
- [ ] Tutorial paso a paso de edición de rangos Maya
- [ ] FAQ actualizado con casos comunes

---

## RESUMEN EJECUTIVO

### Estado Actual:
- **Backend:** ✅ 100% completo (12 endpoints, Swagger docs, validaciones)
- **Frontend Hook:** ✅ 100% completo (5 queries + 5 mutations)
- **Frontend UI:** ⚠️ 60% completo (visualización completa, edición pendiente)

### Gaps Identificados:
1. 5 componentes modales NO implementados (edición de parámetros, rangos, bulk, preview, restore)
2. Mutations existentes NO conectadas a UI
3. Botones muestran alerts "Próximamente"
4. Tests E2E de edición pendientes

### Esfuerzo de Completación:
- **Total:** 4-5 Story Points (34-51 horas)
- **Fase 1:** Edición básica (1-2 SP, 10-15h)
- **Fase 2:** Rangos Maya (1 SP, 8-12h)
- **Fase 3:** Avanzado (2 SP, 16-24h)

### Prioridad:
- **Edición de parámetros:** ALTA (funcionalidad core de US-AE-005)
- **Edición de rangos:** ALTA (funcionalidad core de US-AE-005)
- **Bulk update:** MEDIA (nice-to-have)
- **Preview impact:** MEDIA (nice-to-have)
- **Restore defaults:** BAJA (emergency feature)

### Recomendación:
✅ **Implementar Fase 1 y Fase 2 antes del cierre de MVP** (edición básica + rangos)
⏳ **Dejar Fase 3 para post-MVP** (funcionalidades avanzadas)

Esto permite cumplir con la historia de usuario US-AE-005 en su núcleo (edición de configuración), dejando features avanzadas para iteraciones futuras.

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Total páginas:** 18
