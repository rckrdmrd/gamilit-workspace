# Especificacion: AdminGamificationPage

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`

---

## PROPOSITO

Pagina de administracion para gestionar la configuracion del sistema de gamificacion, incluyendo parametros, rangos Maya y estadisticas.

---

## ESTRUCTURA DE PAGINA

```
┌─────────────────────────────────────────────────────────┐
│                      HEADER                              │
│  [Trophy Icon] Configuracion de Gamificacion            │
│  Ultima modificacion: 15 dic 2025, 14:30                │
└─────────────────────────────────────────────────────────┘
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                  STATS CARDS                     │   │
│  │  [Total Params] [Activos] [Rangos] [Modificados]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                    TABS                          │   │
│  │  [Rangos] [Logros] [Economia] [Estadisticas]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │               TAB CONTENT                        │   │
│  │  (varies by selected tab)                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## TABS

### Tab: Rangos Maya

**Contenido:**
- Lista de 5 rangos Maya con:
  - Nombre y descripcion
  - Umbrales XP (min/max)
  - Multiplicador XP
  - Bonus ML Coins
  - Perks (lista expandible)
  - Color identificador
- Boton "Editar" por rango

**Modal:** MayaRankEditModal
- Campos: minXp, maxXp
- Validacion: maxXp > minXp

### Tab: Logros

**Contenido:**
- Lista de logros/achievements
- Estado activo/inactivo
- Condiciones de desbloqueo
- Recompensas asociadas

### Tab: Economia

**Stats Cards (3):**
- Total ML Coins en circulacion
- Promedio coins por usuario
- Coins otorgadas hoy

**Parametros:**
- coins_per_exercise
- coins_per_streak
- coins_per_rank_up
- ml_coins_daily_limit

### Tab: Estadisticas

**Stats Cards (4):**
- Usuarios activos (24h)
- Promedio XP diario
- Promociones de rango (semana)
- Tiempo promedio sesion

**Graficos:**
- Distribucion de usuarios por rango
- Tendencia de XP semanal

---

## HOOKS UTILIZADOS

| Hook | Proposito |
|------|-----------|
| useGamificationConfig | Queries y mutations |
| useUserGamification | Stats de usuarios |

---

## MODALES

### ParameterEditModal

**Props:**
```typescript
{
  parameter: Parameter | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string, value: any, reason?: string) => void;
}
```

**Campos:**
- Valor actual (input dinamico segun dataType)
- Razon del cambio (textarea opcional)

### MayaRankEditModal

**Props:**
```typescript
{
  rank: MayaRankConfig | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: { minXp: number; maxXp: number }) => void;
}
```

### BulkUpdateDialog

**Proposito:** Actualizar multiples parametros simultaneamente.

**Campos:**
- Lista de parametros seleccionados
- Nuevos valores
- Razon global del cambio

### RestoreDefaultsDialog

**Proposito:** Restaurar todos los parametros a valores por defecto.

**Confirmacion:**
- Texto de advertencia
- Input de confirmacion ("RESTAURAR")
- Contador de parametros afectados

### PreviewImpactDialog

**Proposito:** Previsualizar impacto de cambios antes de aplicar.

**Muestra:**
- Usuarios afectados
- Cambios en rankings
- Proyeccion de economia

---

## VALIDACION DEFENSIVA

```typescript
// Validacion de datos de rangos
const safeRanks = useMemo(() => {
  if (!mayaRanks || !Array.isArray(mayaRanks)) return [];
  return mayaRanks.filter(rank =>
    rank && typeof rank.name === 'string' && typeof rank.minXp === 'number'
  );
}, [mayaRanks]);
```

---

## ESTADOS

| Estado | Indicador Visual |
|--------|------------------|
| Loading | Skeleton cards + spinner |
| Error | Banner de error con retry |
| Empty | Mensaje informativo |
| Success | Toast de confirmacion |

---

## PERMISOS

**Requiere:** Rol `super_admin` o `admin`

---

## REFERENCIAS

- [ADMIN-GAMIFICATION-CONFIG-HOOK.md](../hooks/ADMIN-GAMIFICATION-CONFIG-HOOK.md)
- [MIGRACION-MAYA-RANKS-v2.1.md](../../../90-transversal/migraciones/MIGRACION-MAYA-RANKS-v2.1.md)

---

**Ultima actualizacion:** 2025-12-18
