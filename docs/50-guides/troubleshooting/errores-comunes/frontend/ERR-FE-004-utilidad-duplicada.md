---
titulo: Error FE-004 Archivo Utility Duplicado
tipo: guia
dominio: troubleshooting
ultima_actualizacion: 2026-02-27
---

# ERR-FE-004: Archivo Utility Duplicado

## Descripcion
Existen dos o mas archivos que exportan la misma funcion o utilidad, causando confusion sobre cual importar y riesgo de comportamiento inconsistente si las implementaciones divergen con el tiempo. Esto es particularmente problematico en un codebase con 580 componentes que pueden importar de cualquiera de las copias.

## Sintomas
- Dos archivos con nombres similares en el mismo directorio o directorios adyacentes (ej: `cn.ts` y `cn.util.ts`)
- Componentes diferentes importan la misma funcion desde rutas distintas
- Al modificar una utilidad, los cambios no se reflejan en todos los consumidores (porque algunos usan la otra copia)
- Busqueda de codigo muestra definiciones duplicadas de la misma funcion
- Confusion en code review: "cual archivo es el correcto?"

## Causa Raiz
1. Un desarrollador crea una copia del archivo en vez de importar desde el original
2. Se renombra un archivo (ej: `cn.ts` a `cn.util.ts`) pero la version anterior no se elimina
3. Se mueve una utilidad de `shared/utils/` a `lib/` (o viceversa) sin eliminar el original
4. Refactorizacion parcial que crea la nueva version pero no limpia la anterior

## Solucion

### 1. Identificar archivos duplicados
```bash
cd apps/frontend

# Buscar archivos con nombres similares
find src -name "*.ts" -o -name "*.tsx" | \
  sed 's/.*\///' | sort | uniq -d

# Buscar funciones exportadas duplicadas
grep -rh "export function\|export const\|export default" src/shared/ src/lib/ --include="*.ts" | \
  sort | uniq -d
```

### 2. Determinar cual es el archivo canonico
```bash
# Ver cual tiene mas importaciones (ese es el canonico)
grep -r "from.*cn.util" src/ --include="*.ts" --include="*.tsx" | wc -l
grep -r "from.*cn'" src/ --include="*.ts" --include="*.tsx" | wc -l

# Ver cual es mas reciente (git log)
git log --oneline -3 -- src/shared/utils/cn.ts
git log --oneline -3 -- src/shared/utils/cn.util.ts
```

### 3. Consolidar en el archivo canonico
```typescript
// Paso 1: Verificar que las implementaciones son identicas
// Si difieren, merge las funcionalidades en el archivo canonico

// Paso 2: Actualizar barrel export (index.ts)
// ANTES
export { cn } from './cn';        // duplicado
export { cn } from './cn.util';   // canonico

// DESPUES
export { cn } from './cn.util';   // unico punto de exportacion
```

### 4. Actualizar importaciones directas
```bash
# Buscar y reemplazar importaciones al archivo eliminado
grep -rl "from.*['\"].*\/cn['\"]" src/ --include="*.ts" --include="*.tsx"
# Actualizar cada uno para importar desde cn.util o desde el barrel
```

### 5. Eliminar el archivo duplicado
```bash
# Solo despues de actualizar TODAS las referencias
git rm src/shared/utils/cn.ts
```

### 6. Verificar
```bash
cd apps/frontend && npm run build && npm run typecheck
```

## Prevencion

1. **Buscar antes de crear**: Antes de crear un archivo utility, buscar si ya existe uno con funcionalidad similar
2. **Convencion de nombres**: Usar sufijo `.util.ts` para utilidades, `.helper.ts` para helpers, `.constant.ts` para constantes
3. **Barrels como punto unico**: Importar siempre desde barrel (`@/shared/utils`) en vez de archivo directo
4. **Limpieza en refactorizacion**: Al renombrar, eliminar el archivo anterior en el MISMO commit

### Checklist al crear utilidad nueva:
- [ ] Verificar que no existe una utilidad similar (`grep -r "export.*nombreFuncion" src/`)
- [ ] Si existe similar, extender esa en vez de crear nueva
- [ ] Agregar export al barrel `index.ts` correspondiente
- [ ] Usar convencion de nombres (`.util.ts`, `.helper.ts`, etc.)

### Verificacion automatica
```bash
# Detectar archivos .ts con nombres base duplicados (ignorando sufijos)
cd apps/frontend
find src -name "*.ts" -o -name "*.tsx" | \
  sed 's/\.\(util\|helper\|service\|constant\)//; s/\.tsx\?$//' | \
  sort | uniq -d | while read dup; do
    echo "Posible duplicado: $(find src -path "*${dup}*" -name "*.ts" -o -name "*.tsx")"
  done
```

## Ocurrencias

| Fecha | Archivos Duplicados | Funcion | Resolucion | Estado |
|-------|---------------------|---------|------------|--------|
| 2026-02-13 | cn.ts / cn.util.ts | cn() (class merge utility) | Consolidado en cn.util.ts | Resuelto |
| 2026-02-13 | shared/utils/cn.ts (segunda copia) | cn() | Identificado como duplicado adicional | Pendiente |

## Referencias

- **Estructura utilidades:** `apps/frontend/src/shared/utils/`
- **Convencion de nombres:** `docs/40-standards/FRONTEND-NAMING-CONVENTIONS.md`
- **Inventario Frontend:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- **MEMORY.md:** `shared/utils/cn.ts is duplicate of cn.util.ts`

---

**Severidad:** Media
**Frecuencia:** 2+ ocurrencias
**Tiempo de resolucion:** 15-25 min
**Ultimo update:** 2026-02-13
