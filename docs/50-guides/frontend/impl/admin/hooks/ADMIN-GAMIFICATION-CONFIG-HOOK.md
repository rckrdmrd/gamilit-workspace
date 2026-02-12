# Hook: useGamificationConfig

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Ubicacion:** `apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts`

---

## PROPOSITO

Hook de React personalizado que gestiona toda la configuracion de gamificacion del sistema, proporcionando:
- Parametros de gamificacion (XP, coins, multiplicadores)
- Rangos Maya (niveles, multiplicadores, perks)
- Estadisticas del sistema
- Operaciones CRUD completas con cache inteligente mediante React Query

---

## API EXPUESTA

### Objeto Retornado

```typescript
const {
  // QUERIES
  useParameters,
  useParameter,
  useMayaRanks,
  useMayaRank,
  useStats,

  // MUTATIONS
  updateParameter,
  resetParameter,
  bulkUpdateParameters,
  updateMayaRank,
  previewImpact,
  restoreDefaults
} = useGamificationConfig();
```

---

## QUERIES

### useParameters(query?: ListParametersQuery)

Obtiene lista paginada de parametros de gamificacion.

```typescript
interface ListParametersQuery {
  page?: number;
  limit?: number;
  category?: 'points' | 'coins' | 'levels' | 'ranks' | 'penalties' | 'bonuses';
}

const { data, isLoading, error } = useParameters({ category: 'points' });

// Retorno
{
  data: Parameter[],
  total: number,
  page: number,
  limit: number
}
```

**Cache:** 5 minutos

### useParameter(key: string, enabled?: boolean)

Obtiene un parametro especifico por clave.

```typescript
const { data, isLoading, error } = useParameter('xp_per_exercise', true);
```

### useMayaRanks()

Obtiene todos los rangos Maya configurados.

```typescript
const { data, isLoading, error } = useMayaRanks();

// Retorno: MayaRankConfig[]
```

**Cache:** 10 minutos

### useMayaRank(id: string, enabled?: boolean)

Obtiene un rango Maya especifico.

```typescript
const { data, isLoading, error } = useMayaRank('rank-uuid', true);
```

### useStats()

Obtiene estadisticas del sistema de gamificacion.

```typescript
const { data, isLoading, error } = useStats();

// Retorno
{
  totalParameters: number,
  activeParameters: number,
  totalRanks: number,
  activeRanks: number,
  lastModified: string
}
```

**Cache:** 2 minutos

---

## MUTATIONS

### updateParameter

Actualiza un parametro individual.

```typescript
const { mutate, isPending, error } = updateParameter;

mutate({
  key: 'xp_per_exercise',
  data: {
    value: 50,
    reason: 'Ajuste de balanceo'
  }
});
```

**Efectos:**
- Invalida queries de parametros
- Invalida query de stats
- Toast de exito/error automatico

### resetParameter

Restaura un parametro a su valor por defecto.

```typescript
resetParameter.mutate('xp_per_exercise');
```

### bulkUpdateParameters

Actualiza multiples parametros en una sola operacion.

```typescript
bulkUpdateParameters.mutate({
  updates: [
    { key: 'xp_per_exercise', value: 50 },
    { key: 'coins_per_streak', value: 10 }
  ],
  reason: 'Rebalanceo de economia'
});
```

### updateMayaRank

Modifica umbrales de un rango Maya.

```typescript
updateMayaRank.mutate({
  id: 'rank-uuid',
  data: {
    minXp: 500,
    maxXp: 999
  }
});
```

### previewImpact

Genera preview del impacto de cambios sin aplicarlos.

```typescript
previewImpact.mutate({
  parameterKey: 'xp_multiplier',
  newValue: 1.5
});

// Retorno: Estadisticas de usuarios afectados
```

### restoreDefaults

Restaura TODOS los parametros a valores por defecto.

```typescript
restoreDefaults.mutate();

// Retorno: { restored_count: number }
```

**Efectos:**
- Invalida todas las queries bajo 'gamification'
- Requiere confirmacion del usuario (implementada en UI)

---

## CONFIGURACION DE REACT QUERY

| Query | staleTime | gcTime |
|-------|-----------|--------|
| parameters | 5 min | 10 min |
| parameter (single) | 5 min | 10 min |
| mayaRanks | 10 min | 15 min |
| stats | 2 min | 5 min |

---

## VALIDACION DEFENSIVA

El hook implementa validaciones robustas para manejar respuestas inesperadas del backend:

```typescript
// Ejemplo de validacion en useParameters
const data = response?.data;
if (!data || !Array.isArray(data.parameters)) {
  console.warn('Unexpected response structure');
  return { data: [], total: 0, page: 1, limit: 10 };
}
```

**Caracteristicas:**
- Valida estructura de objetos antes de usar
- Proporciona fallbacks sensatos (arrays vacios, valores por defecto)
- Log de advertencias en consola para debugging
- Maneja campos snake_case y camelCase del backend

---

## EJEMPLO DE USO

### En AdminGamificationPage

```typescript
import { useGamificationConfig } from '../hooks/useGamificationConfig';

function AdminGamificationPage() {
  const {
    useParameters,
    useMayaRanks,
    useStats,
    updateParameter,
    resetParameter
  } = useGamificationConfig();

  const { data: stats, isLoading: loadingStats } = useStats();
  const { data: parametersData, isLoading: loadingParams } = useParameters();
  const { data: mayaRanks, isLoading: loadingRanks } = useMayaRanks();

  const handleUpdateParameter = (key: string, value: any) => {
    updateParameter.mutate({
      key,
      data: { value, reason: 'Manual update' }
    });
  };

  if (loadingStats || loadingParams || loadingRanks) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <StatsCards stats={stats} />
      <ParametersList
        parameters={parametersData?.data || []}
        onUpdate={handleUpdateParameter}
      />
      <MayaRanksList ranks={mayaRanks || []} />
    </div>
  );
}
```

---

## DEPENDENCIAS

| Dependencia | Uso |
|-------------|-----|
| @tanstack/react-query | Gestion de estado y cache |
| @/services/api/admin/gamificationConfigApi | Cliente API |
| react-hot-toast | Notificaciones |
| @/types/admin/gamification.types | Tipos TypeScript |

---

## TIPOS RELACIONADOS

### Parameter

```typescript
interface Parameter {
  id: string;
  key: string;
  value: any;
  category: 'points' | 'coins' | 'levels' | 'ranks' | 'penalties' | 'bonuses';
  dataType: string;
  description?: string;
  defaultValue?: any;
  minValue?: number;
  maxValue?: number;
}
```

### MayaRankConfig

```typescript
interface MayaRankConfig {
  id: string;
  name: string;
  level: number;
  minXp: number;
  maxXp?: number | null;
  multiplierXp: number;
  multiplierMlCoins: number;
  bonusMlCoins: number;
  color: string;
  icon?: string | null;
  description?: string;
  perks?: string[];
  isActive: boolean;
  order?: number;
}
```

---

## REFERENCIAS

- `AdminGamificationPage.tsx` - Pagina que usa este hook
- `gamificationConfigApi.ts` - Cliente API
- `gamification.types.ts` - Definiciones de tipos

---

**Ultima actualizacion:** 2025-12-18
