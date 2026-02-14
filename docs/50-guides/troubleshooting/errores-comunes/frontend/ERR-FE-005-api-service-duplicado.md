# ERR-FE-005: API Service Duplicado entre lib/ y services/

## Descripcion
El frontend tiene servicios API duplicados en dos ubicaciones: `src/lib/api/` (version inicial) y `src/services/api/` (version estandar). Ambos archivos hacen las mismas llamadas HTTP pero con patrones de error handling, tipado, y transformacion diferentes, causando inconsistencias en la aplicacion. Se han identificado 6 pares duplicados.

## Sintomas
- Un componente usa `lib/api/achievements.api.ts` y otro usa `services/api/achievements.service.ts` para la misma operacion
- Error handling inconsistente: un servicio muestra toast de error, el otro falla silenciosamente
- Tipos de retorno diferentes para la misma llamada API (uno transforma snake_case, el otro no)
- Al corregir un bug en un servicio API, el bug persiste en componentes que usan la otra copia
- Confusion en code review: "de donde deberia importar este endpoint?"

## Causa Raiz
1. Desarrollo inicial coloco servicios API en `src/lib/api/` sin convencion clara
2. Posteriormente se establecio `src/services/api/` como ubicacion canonica con patrones estandarizados
3. Los servicios en `lib/api/` no fueron eliminados despues de crear sus equivalentes en `services/api/`
4. Diferentes desarrolladores/agentes usan diferentes ubicaciones segun lo que encuentran primero

## Solucion

### 1. Identificar todos los pares duplicados
```bash
cd apps/frontend

# Listar archivos en ambas ubicaciones
echo "=== lib/api/ ==="
ls src/lib/api/*.ts 2>/dev/null

echo "=== services/api/ ==="
ls src/services/api/*.ts 2>/dev/null

# Comparar nombres para encontrar pares
comm -12 \
  <(ls src/lib/api/ 2>/dev/null | sed 's/\.api\.ts//' | sort) \
  <(ls src/services/api/ 2>/dev/null | sed 's/\.service\.ts//; s/\.api\.ts//' | sort)
```

### Pares duplicados conocidos (6):

| lib/api/ | services/api/ | Canonico |
|----------|---------------|----------|
| `lti.api.ts` | `lti.service.ts` | services/api/ |
| `achievements.api.ts` | `achievements.service.ts` | services/api/ |
| `progress.api.ts` | `progress.service.ts` | services/api/ |
| `reviews.api.ts` | `reviews.service.ts` | services/api/ |
| `content.api.ts` | `content.service.ts` | services/api/ |
| `auth.api.ts` | `auth.service.ts` | services/api/ |

### 2. Comparar exports de cada par
```bash
# Para cada par, comparar funciones exportadas
diff <(grep "export" src/lib/api/achievements.api.ts | sort) \
     <(grep "export" src/services/api/achievements.service.ts | sort)
```

### 3. Consolidar en services/api/ (canonico)
```typescript
// Paso 1: Verificar que services/api/ tiene TODAS las funciones de lib/api/
// Si lib/api/ tiene funciones que services/api/ no tiene, migrarlas

// Paso 2: Buscar todos los consumidores del archivo lib/api/
// grep -r "from.*lib/api/achievements" src/ --include="*.ts" --include="*.tsx"

// Paso 3: Actualizar importaciones
// ANTES
import { getAchievements } from '@/lib/api/achievements.api';

// DESPUES
import { getAchievements } from '@/services/api/achievements.service';
```

### 4. Eliminar archivo duplicado en lib/api/
```bash
# Solo despues de migrar TODOS los consumidores
git rm src/lib/api/achievements.api.ts

# Actualizar barrel si existe
# Remover export del archivo eliminado de src/lib/api/index.ts
```

### 5. Repetir para cada par y verificar
```bash
cd apps/frontend && npm run build && npm run typecheck
```

## Prevencion

1. **Ubicacion canonica**: Todos los servicios API van en `src/services/api/` exclusivamente
2. **Eliminar lib/api/**: Una vez migrados todos los pares, eliminar el directorio `src/lib/api/` completamente
3. **Template de servicio**: Usar el template estandar en `services/api/` para nuevos servicios
4. **Code review**: Rechazar PRs que creen archivos en `lib/api/`

### Checklist de migracion por par:
- [ ] Comparar exports: `services/api/` tiene todo lo de `lib/api/`
- [ ] Buscar consumidores: `grep -r "lib/api/nombre" src/`
- [ ] Actualizar importaciones en cada consumidor
- [ ] Eliminar archivo de `lib/api/`
- [ ] Actualizar barrel `lib/api/index.ts`
- [ ] `npm run build` + `npm run typecheck` exitosos

### Patron canonico de servicio API
```typescript
// src/services/api/feature.service.ts
import { apiClient } from '@/config/api.client';
import { API_ENDPOINTS } from '@/config/api.config';
import type { FeatureResponse, CreateFeatureDto } from '@/types/api/feature.types';

export const featureService = {
  getAll: () => apiClient.get<FeatureResponse[]>(API_ENDPOINTS.feature.list),
  getById: (id: string) => apiClient.get<FeatureResponse>(API_ENDPOINTS.feature.get(id)),
  create: (data: CreateFeatureDto) => apiClient.post<FeatureResponse>(API_ENDPOINTS.feature.create, data),
  update: (id: string, data: Partial<CreateFeatureDto>) => apiClient.put<FeatureResponse>(API_ENDPOINTS.feature.update(id), data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.feature.delete(id)),
};
```

### Verificacion automatica
```bash
# Detectar si lib/api/ todavia tiene archivos con equivalente en services/api/
cd apps/frontend
for f in src/lib/api/*.ts; do
  base=$(basename "$f" .api.ts)
  if ls src/services/api/${base}.service.ts 2>/dev/null || ls src/services/api/${base}.api.ts 2>/dev/null; then
    echo "DUPLICADO: $f tiene equivalente en services/api/"
  fi
done
```

## Ocurrencias

| Fecha | Par Duplicado | Consumidores Afectados | Estado |
|-------|---------------|------------------------|--------|
| 2026-02-13 | auth (lib vs services) | 8+ componentes | Documentado |
| 2026-02-13 | achievements (lib vs services) | 5+ componentes | Documentado |
| 2026-02-13 | progress (lib vs services) | 6+ componentes | Documentado |
| 2026-02-13 | reviews (lib vs services) | 3+ componentes | Documentado |
| 2026-02-13 | content (lib vs services) | 4+ componentes | Documentado |
| 2026-02-13 | lti (lib vs services) | 2+ componentes | Documentado |

## Referencias

- **Servicios canonicos:** `apps/frontend/src/services/api/`
- **Servicios legacy:** `apps/frontend/src/lib/api/`
- **API Config:** `apps/frontend/src/config/api.config.ts`
- **Inventario Frontend:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- **MEMORY.md:** 6 duplicate API service pairs documentados

---

**Severidad:** Alta
**Frecuencia:** 6 pares identificados
**Tiempo de resolucion:** 20-30 min por par
**Ultimo update:** 2026-02-13
