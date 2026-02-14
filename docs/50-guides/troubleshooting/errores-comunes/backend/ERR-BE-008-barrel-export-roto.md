# ERR-BE-008: Barrel Export Referencia Archivo Inexistente

## Descripcion
Un archivo `index.ts` (barrel file) re-exporta desde un modulo que fue eliminado, renombrado o movido durante consolidacion o refactorizacion. Esto causa errores de compilacion TypeScript que pueden bloquear el build completo del backend o frontend.

## Sintomas
- Error de build: `Module not found: Can't resolve './deleted-file'`
- Error TypeScript: `TS2307: Cannot find module './nombre-archivo' or its corresponding type declarations`
- `npm run build` falla pero el IDE no siempre marca el error inmediatamente
- Imports que funcionaban dejan de funcionar despues de una consolidacion o cleanup
- Error en cadena: multiples archivos fallan porque todos importan del barrel roto
- CI/CD pipeline falla con error de modulo no encontrado

## Causa Raiz
1. **Archivo eliminado sin actualizar barrel:** Se elimina `some-feature.service.ts` pero `index.ts` aun tiene `export * from './some-feature.service'`
2. **Archivo renombrado sin actualizar barrel:** Se renombra `old-name.ts` a `new-name.ts` pero el barrel sigue exportando de `./old-name`
3. **Archivo movido a otro directorio:** Se mueve un archivo durante reorganizacion pero los barrels en el directorio original no se actualizan
4. **Consolidacion incompleta:** Durante merge de archivos duplicados, se elimina uno de los duplicados pero consumidores y barrels apuntan al eliminado
5. **Barrel en frontend apunta a API service inexistente:** El archivo `lib/api/index.ts` re-exporta de un API service que fue consolidado o eliminado

## Solucion

### 1. Identificar el barrel roto
```bash
# El error de build indicara la ruta exacta
# Ejemplo: Module not found: Can't resolve './educational.api' in '/app/src/lib/api'
# Esto significa: apps/frontend/src/lib/api/index.ts tiene export de educational.api
```

### 2. Eliminar la linea de export rota del barrel
```typescript
// ANTES (index.ts con export roto)
export * from './auth.api';
export * from './educational.api';  // ROTO: archivo eliminado
export * from './gamification.api';
export * from './progress.api';

// DESPUES (index.ts corregido)
export * from './auth.api';
// educational.api fue consolidado en modules.api y exercises.api
export * from './gamification.api';
export * from './progress.api';
```

### 3. Actualizar consumidores que importaban del barrel
```typescript
// ANTES: importaba symbol que venia del archivo eliminado
import { getEducationalModules } from '@/lib/api';

// DESPUES: importar del archivo correcto (el que absorbio la funcionalidad)
import { getEducationalModules } from '@/lib/api/modules.api';
// O si se movio a otro barrel:
import { getEducationalModules } from '@/lib/api';  // Si modules.api ahora exporta esto
```

### 4. Verificar que no hay mas barrels rotos
```bash
# Build completo para verificar
cd apps/backend && npm run build
cd apps/frontend && npm run build

# TypeScript check sin emitir (mas rapido)
cd apps/frontend && npx tsc --noEmit
cd apps/backend && npx tsc --noEmit
```

### 5. Para archivos con multiples exports, verificar cada symbol
```typescript
// Si el archivo eliminado exportaba multiples symbols:
// educational.api.ts exportaba: getModules, getExercises, getContent

// Verificar que cada symbol ahora existe en otro archivo
grep -rn "export.*getModules" apps/frontend/src/lib/api/
grep -rn "export.*getExercises" apps/frontend/src/lib/api/
grep -rn "export.*getContent" apps/frontend/src/lib/api/
```

## Prevencion

1. **Buscar imports antes de eliminar:** Antes de eliminar cualquier archivo, buscar todas las referencias con `grep -rn "nombre-archivo" apps/`
2. **Actualizar barrels atomicamente:** En el mismo commit que elimina o renombra un archivo, actualizar todos los barrels e imports que lo referencian
3. **Build verificacion post-cleanup:** Despues de cualquier refactorizacion, ejecutar `npm run build` en backend Y frontend antes de commit
4. **Usar IDE refactoring:** Las herramientas de rename/move del IDE (F2 en VS Code) actualizan imports automaticamente
5. **Evitar barrels profundos:** Limitar barrels a 1 nivel de profundidad; barrels que re-exportan de otros barrels crean cadenas fragiles

### Checklist para eliminar/renombrar archivo:
- [ ] Buscar todas las referencias al archivo: `grep -rn "nombre-archivo" apps/`
- [ ] Actualizar o eliminar cada referencia encontrada
- [ ] Actualizar barrels (`index.ts`) en el mismo directorio
- [ ] Actualizar barrels en directorios padre si existen
- [ ] Verificar que `npm run build` pasa en backend
- [ ] Verificar que `npm run build` pasa en frontend
- [ ] Verificar que `npm run typecheck` pasa en frontend
- [ ] Si hay tests que importan del archivo, actualizarlos

### Comando de verificacion
```bash
# Verificar barrels en backend: buscar exports de archivos que no existen
for barrel in $(find apps/backend/src -name "index.ts" -type f); do
  dir=$(dirname "$barrel")
  grep "export.*from '\.\/" "$barrel" | while read -r line; do
    # Extraer el path del export
    path=$(echo "$line" | sed "s/.*from '\.\///" | sed "s/'.*//")
    if [ ! -f "$dir/$path.ts" ] && [ ! -f "$dir/$path/index.ts" ]; then
      echo "BARREL ROTO: $barrel -> $path"
    fi
  done
done

# Verificacion rapida: build de ambos proyectos
cd apps/backend && npm run build && cd ../frontend && npm run build
```

## Ocurrencias

| Fecha | Archivo Barrel | Export Roto | Estado |
|-------|---------------|-------------|--------|
| 2026-02-13 | apps/frontend/src/lib/api/index.ts | `export * from './educational.api'` (archivo no existe) | Resuelto: linea eliminada, funciones migradas |
| 2026-01-30 | apps/backend/src/modules/social/index.ts | Export de service consolidado durante cleanup | Resuelto: barrel actualizado |

## Referencias

- **TypeScript Barrel Files:** https://basarat.gitbook.io/typescript/main-1/barrel
- **NestJS Module Exports:** https://docs.nestjs.com/modules#module-re-exporting
- **MEMORY.md:** "`lib/api/educational.api.ts` is a broken import (file doesn't exist)"
- **Backend build:** `cd apps/backend && npm run build`
- **Frontend build:** `cd apps/frontend && npm run build`
- **Frontend typecheck:** `cd apps/frontend && npm run typecheck`

---

**Severidad:** Critica (bloqueador de build - ni backend ni frontend compilan)
**Frecuencia:** 2+ ocurrencias (incrementa con cada refactorizacion o cleanup)
**Tiempo de resolucion:** 5-15 min (identificar barrel + eliminar export roto + actualizar consumidores)
**Ultimo update:** 2026-02-13
