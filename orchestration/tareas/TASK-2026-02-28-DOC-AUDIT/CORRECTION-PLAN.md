---
titulo: Plan de Corrección - Enlaces Rotos
tipo: plan-de-accion
fecha: 2026-02-28
prioridad: BAJA
duracion_estimada: "2 minutos"
---

# Plan de Corrección de Enlaces Rotos

## Resumen

Se han identificado **2 enlaces rotos** en la documentación, ambos localizados en un único archivo: `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md`. Ambas correcciones son de una sola línea.

---

## Corrección #1: REACT-QUERY-MIGRATION-GUIDE.md

### Ubicación
- **Archivo:** `/c/Empresas/ISEM/gamilit-workspace/docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md`
- **Línea:** 917
- **Sección:** "### Guias Generales"

### Problema
La referencia apunta a una ruta incompleta que no incluye el subdirectorio `frontend/`.

```markdown
# Actual (INCORRECTO)
- [REACT-QUERY-MIGRATION-GUIDE.md](../../50-guides/REACT-QUERY-MIGRATION-GUIDE.md)
```

El archivo real se encuentra en:
```
docs/50-guides/frontend/REACT-QUERY-MIGRATION-GUIDE.md
```

### Solución

**Cambio a realizar:**
```diff
- [REACT-QUERY-MIGRATION-GUIDE.md](../../50-guides/REACT-QUERY-MIGRATION-GUIDE.md) - Guia de migracion a React Query
+ [REACT-QUERY-MIGRATION-GUIDE.md](../../50-guides/frontend/REACT-QUERY-MIGRATION-GUIDE.md) - Guia de migracion a React Query
```

### Verificación
Después de la corrección, validar:
```bash
cd /c/Empresas/ISEM/gamilit-workspace
test -f "docs/50-guides/frontend/REACT-QUERY-MIGRATION-GUIDE.md" && echo "✓ Archivo existe"
```

---

## Corrección #2: Referencia inconsistente a API docs

### Ubicación
- **Archivo:** `/c/Empresas/ISEM/gamilit-workspace/docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md`
- **Línea:** 903
- **Sección:** "### Documentacion de Referencia" (tabla)

### Problema
La referencia es inconsistente. Usa una ruta relativa simple que funcionaría desde `docs/40-api/` pero no desde `docs/60-portals/teacher/`. La corrección en línea 922 ya usa la forma correcta.

```markdown
# Línea 903 (INCONSISTENTE)
| [40-api/README.md](40-api/README.md) | Documentacion de endpoints del modulo teacher |

# Línea 922 (CORRECTO)
- [40-api/README.md](../../40-api/README.md) - Rutas API
```

### Solución

**Cambio a realizar:**
```diff
- | [40-api/README.md](40-api/README.md) | Documentacion de endpoints del modulo teacher |
+ | [40-api/README.md](../../40-api/README.md) | Documentacion de endpoints del modulo teacher |
```

### Verificación
Después de la corrección, validar:
```bash
cd /c/Empresas/ISEM/gamilit-workspace
test -f "docs/40-api/README.md" && echo "✓ Archivo existe"
```

---

## Secuencia de Corrección

### Opción A: Corrección Manual (Recomendado para audit trail)

1. Abrir archivo en editor:
   ```bash
   cd /c/Empresas/ISEM/gamilit-workspace
   code docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md
   ```

2. Ir a línea 903 (Ctrl+G en VS Code) y realizar cambio #2

3. Ir a línea 917 (Ctrl+G en VS Code) y realizar cambio #1

4. Guardar archivo (Ctrl+S)

5. Validar cambios:
   ```bash
   git diff docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md
   ```

6. Crear commit:
   ```bash
   git add docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md
   git commit -m "[GAM-DOC] Fix broken links in PORTAL-TEACHER-GUIDE.md

   - Fix line 903: 40-api/README.md relative path
   - Fix line 917: REACT-QUERY-MIGRATION-GUIDE.md missing frontend/ subdirectory

   Resolves TASK-2026-02-28-DOC-AUDIT"
   ```

### Opción B: Corrección Programada

Si se prefiere automatizar:

```bash
cd /c/Empresas/ISEM/gamilit-workspace

# Corrección 1: Línea 917
sed -i '917s|../../50-guides/REACT-QUERY-MIGRATION-GUIDE.md|../../50-guides/frontend/REACT-QUERY-MIGRATION-GUIDE.md|' \
  docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md

# Corrección 2: Línea 903
sed -i "903s|40-api/README.md)|../../40-api/README.md)|" \
  docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md

# Validar
git diff docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md

# Commit
git add docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md
git commit -m "[GAM-DOC] Fix broken links in PORTAL-TEACHER-GUIDE.md"
```

---

## Validación Post-Corrección

Ejecutar después de realizar los cambios:

### Test 1: Verificar archivos existen
```bash
test -f "docs/50-guides/frontend/REACT-QUERY-MIGRATION-GUIDE.md" && echo "✓ REACT-QUERY file OK"
test -f "docs/40-api/README.md" && echo "✓ API-REFERENCE file OK"
```

### Test 2: Verificar cambios en git
```bash
git diff HEAD docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md
# Debe mostrar exactamente 2 líneas cambiadas
```

### Test 3: Validación de enlace con grep
```bash
grep -n "../../50-guides/frontend/REACT-QUERY-MIGRATION-GUIDE.md" \
  docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md
# Debe encontrar línea 917

grep -n "../../40-api/README.md" docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md
# Debe encontrar línea 903 y 922
```

---

## Checklist de Implementación

- [ ] Abierto archivo `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md`
- [ ] Línea 903 actualizada: `40-api/README.md` → `../../40-api/README.md`
- [ ] Línea 917 actualizada: `50-guides/` → `50-guides/frontend/`
- [ ] Cambios guardados
- [ ] `git diff` muestra exactamente 2 líneas modificadas
- [ ] Archivos destino existen (validados)
- [ ] Commit creado con mensaje descriptivo
- [ ] `git push origin master` ejecutado (si aplica)

---

## Impacto de la Corrección

### Antes
- ❌ Usuarios siguiendo enlaces desde PORTAL-TEACHER-GUIDE.md reciben 404
- ❌ Documentación navegable: 99.6%

### Después
- ✓ Todos los enlaces funcionan correctamente
- ✓ Documentación navegable: 100%
- ✓ Consistencia de rutas relativas verificada

---

## Prevención Futura

### Implementar validación en CI/CD

Crear archivo `.github/workflows/doc-links.yml`:

```yaml
name: Validate Documentation Links

on: [push, pull_request]

jobs:
  validate-links:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Validate markdown links
        run: |
          for file in $(find docs -name "*.md"); do
            grep -oP '\[([^\]]+)\]\((?!https?://|#)([^)#]+)\)' "$file" | \
            while read -r match; do
              link=$(echo "$match" | sed 's/.*(\(.*\)).*/\1/')
              if [ ! -z "$link" ] && [ ! -f "$link" ]; then
                echo "BROKEN: $file -> $link"
                exit 1
              fi
            done
          done
```

### Documentar patrones de enlace

Agregar a `docs/40-standards/ESTANDAR-DOCUMENTACION.md`:

```markdown
## Enlaces Relativos

- Use siempre rutas relativas desde el archivo actual
- Desde `docs/60-portals/teacher/`: use `../../<target>`
- Desde `docs/50-guides/frontend/impl/`: use `../../<target>`
- Nunca use rutas absolutas (`/docs/...`)
```

---

## Estimación de Tiempo

| Tarea | Tiempo |
|-------|--------|
| Realizar correcciones | 1 min |
| Validar cambios | 30 seg |
| Crear commit | 30 seg |
| **Total** | **2 min** |

---

## Contacto y Escalación

- **Responsable:** Equipo de Documentación
- **Severidad:** BAJA (2 enlaces rotos en ~650, impacto mínimo)
- **Urgencia:** NO (puede incluirse en commit rutinario)
- **Bloqueo:** NO (documentación sigue siendo operacional)

---

*Plan generado: 2026-02-28*
*Task: TASK-2026-02-28-DOC-AUDIT*
*Estado: LISTO PARA IMPLEMENTAR*
