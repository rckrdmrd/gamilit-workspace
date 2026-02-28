---
titulo: Error FE-003 Import Barrel Roto
tipo: guia
dominio: troubleshooting
ultima_actualizacion: 2026-02-27
---

# ERR-FE-003: Import Barrel Roto

### Descripcion
Los archivos barrel (`index.ts`) que re-exportan desde archivos eliminados o renombrados causan fallos en el build de Vite y errores de importacion en cascada. Esto ocurre frecuentemente durante consolidacion de utilidades o refactorizacion de la estructura de archivos.

### Sintomas
- Error de Vite: `[vite] Internal server error: Failed to resolve import "./archivo-eliminado" from "src/shared/utils/index.ts"`
- Error de build: `Module not found: Error: Can't resolve './archivo' in '/src/lib/api'`
- Dev server de Vite se reinicia en loop al guardar archivos
- TypeScript compila sin errores pero Vite falla (porque TS puede resolver tipos pero Vite necesita el archivo fisico)
- Errores en cascada: multiples componentes fallan porque todos importan desde el mismo barrel roto

### Causa Raiz
1. Se elimina o renombra un archivo (ej: `educational.api.ts`) pero el barrel `index.ts` sigue exportando `export * from './educational.api'`
2. Se consolidan dos archivos (ej: `cn.ts` absorbido en `cn.util.ts`) sin actualizar el barrel
3. Se mueve un archivo a otra carpeta sin actualizar re-exports
4. Se genera un barrel automaticamente (con herramientas) sin verificar que todos los archivos existan

### Solucion

### 1. Identificar el barrel roto
```bash
# El error de Vite indica la ruta exacta:
# Failed to resolve import "./educational.api" from "src/lib/api/index.ts"
# → Archivo: src/lib/api/index.ts
# → Export roto: ./educational.api
```

### 2. Verificar que archivos exportados existen
```bash
# Listar todos los exports de un barrel y verificar que los archivos existan
cd apps/frontend
grep "export.*from" src/shared/utils/index.ts | \
  sed "s/.*from ['\"]\.\/\(.*\)['\"].*/\1/" | \
  while read f; do
    if [ ! -f "src/shared/utils/${f}.ts" ] && [ ! -f "src/shared/utils/${f}.tsx" ]; then
      echo "ROTO: ${f} no existe en src/shared/utils/"
    fi
  done
```

### 3. Remover el export roto
```typescript
// ANTES (roto): src/lib/api/index.ts
export * from './auth.api';
export * from './educational.api';  // Este archivo fue eliminado
export * from './users.api';

// DESPUES (corregido): src/lib/api/index.ts
export * from './auth.api';
// educational.api.ts consolidado en services/api/educational.service.ts
export * from './users.api';
```

### 4. Actualizar consumidores que importaban desde el barrel
```typescript
// ANTES: importaba desde barrel (ahora roto)
import { getModules } from '@/lib/api';

// DESPUES: importar desde ubicacion correcta
import { getModules } from '@/services/api/educational.service';
```

### 5. Verificar que el build pasa
```bash
cd apps/frontend && npm run build && npm run typecheck
```

### Prevencion

1. **Regla de eliminacion**: Al eliminar/renombrar un archivo, SIEMPRE buscar y actualizar todos los barrels que lo referencian
2. **Script de validacion**: Ejecutar verificacion de barrels antes de commit
3. **Importaciones directas**: Preferir importaciones directas sobre barrels para archivos que cambian frecuentemente
4. **Revision pre-commit**: Verificar que ningun barrel exporte desde archivo inexistente

### Checklist al eliminar/renombrar archivos:
- [ ] Buscar todas las referencias al archivo en barrels (`index.ts`)
- [ ] Actualizar o remover exports rotos
- [ ] Buscar importaciones directas al archivo eliminado en otros componentes
- [ ] Verificar `npm run build` y `npm run typecheck`
- [ ] Verificar que Vite dev server arranca sin errores

### Verificacion automatica
```bash
# Verificar TODOS los barrels del frontend
cd apps/frontend
find src -name "index.ts" -o -name "index.tsx" | while read barrel; do
  dir=$(dirname "$barrel")
  grep "from '\.\/" "$barrel" 2>/dev/null | \
    sed "s/.*from ['\"]\.\/\(.*\)['\"].*/\1/" | \
    while read f; do
      base="${f%.js}"
      if [ ! -f "${dir}/${base}.ts" ] && [ ! -f "${dir}/${base}.tsx" ] && [ ! -d "${dir}/${base}" ]; then
        echo "BARREL ROTO: ${barrel} exporta '${f}' que no existe"
      fi
    done
done
```

### Ocurrencias

| Fecha | Barrel | Export Roto | Causa | Estado |
|-------|--------|------------|-------|--------|
| 2026-02-13 | src/lib/api/index.ts | educational.api | Archivo eliminado en consolidacion | Resuelto |
| 2026-02-13 | src/shared/utils/index.ts | cn | Consolidado en cn.util.ts | Resuelto |

### Referencias

- **Estructura frontend:** `apps/frontend/src/`
- **Vite docs resolving:** https://vite.dev/guide/dep-pre-bundling
- **Inventario Frontend:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- **MEMORY.md:** `lib/api/educational.api.ts` documentado como broken import

---

**Severidad:** Critica
**Frecuencia:** 2+ ocurrencias
**Tiempo de resolucion:** 10-20 min
**Ultimo update:** 2026-02-13
