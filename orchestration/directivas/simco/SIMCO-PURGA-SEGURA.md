# SIMCO-PURGA-SEGURA

> **Alias:** `@SIMCO-PURGA`
> **Versión:** 1.0.0
> **Actualizado:** 2026-01-16
> **Estado:** ACTIVO

---

## Propósito

Protocolo seguro para eliminar archivos, código o documentación evitando pérdida de contenido único y referencias rotas.

---

## Cuándo Aplicar

- Eliminar archivos duplicados
- Limpiar código muerto
- Consolidar documentación
- Refactorizar estructuras

---

## Protocolo de Purga Segura

### FASE 1: Verificar Referencias

**Antes de eliminar CUALQUIER archivo:**

```bash
# Buscar referencias al archivo
grep -rn "nombre_archivo" docs/ orchestration/ --include="*.md" --include="*.yml"

# Buscar imports (para código)
grep -rn "from.*nombre" src/ --include="*.ts" --include="*.tsx"

# Buscar en ALIASES.yml
grep "nombre" orchestration/referencias/ALIASES.yml
```

**Si hay referencias:**
1. DETENER purga
2. Listar archivos que referencian
3. Planificar actualización de referencias ANTES de eliminar

### FASE 2: Verificar Contenido Único

**Comparar archivo a eliminar con supuesto "original":**

| Aspecto | Verificación | Acción si Existe |
|---------|--------------|------------------|
| Diagramas | ¿Tiene ASCII art o diagramas únicos? | PRESERVAR en destino |
| Matrices | ¿Tiene tablas de decisión únicas? | PRESERVAR en destino |
| Ejemplos | ¿Tiene ejemplos no presentes en otro? | MIGRAR a destino |
| Contexto | ¿Tiene explicaciones únicas para audiencia? | Evaluar si resumen legítimo |

**Comando para comparar:**

```bash
# Comparar contenido significativo
diff <(grep -vE '^$|^#|^>' archivo1.md | sort) \
     <(grep -vE '^$|^#|^>' archivo2.md | sort)
```

**Si hay contenido único:**
1. DETENER purga
2. Migrar contenido único al archivo destino
3. O convertir a índice con disclaimer

### FASE 3: Crear Backup

**SIEMPRE antes de eliminar:**

```bash
# Backup individual
cp archivo_a_eliminar.md /tmp/backup-purga-$(date +%Y%m%d)/

# O usar git tag
git tag backup-pre-purge-$(date +%Y%m%d)
```

### FASE 4: Actualizar Referencias

**ANTES de eliminar, actualizar todos los archivos que referencian:**

1. Cambiar rutas de import/referencia
2. Actualizar ALIASES.yml si aplica
3. Validar que referencias nuevas funcionan

### FASE 5: Eliminar

**SOLO después de completar fases 1-4:**

```bash
# Eliminar con confirmación
rm -i archivo_a_eliminar.md

# O usar git
git rm archivo_a_eliminar.md
```

### FASE 6: Validar

```bash
# Ejecutar validación de referencias
./scripts/validation/validate-references.sh

# Verificar build si es código
npm run build
```

---

## Tipos de Purga

### Tipo A: Duplicado Puro (>90% igual)

```
VERIFICAR refs → ACTUALIZAR refs → ELIMINAR → VALIDAR
```

Tiempo: ~15 minutos

### Tipo B: Duplicado Parcial (50-90% igual)

```
VERIFICAR refs → MIGRAR contenido único → ACTUALIZAR refs → ELIMINAR → VALIDAR
```

Tiempo: ~30-60 minutos

### Tipo C: Resumen Legítimo (<50% igual)

```
VERIFICAR propósito → AGREGAR disclaimer → MANTENER (no eliminar)
```

**Formato disclaimer:**
```markdown
> **NOTA:** Resumen ejecutivo para usuarios.
> **Fuente de verdad:** `ruta/al/original`
> **Sincronizado:** YYYY-MM-DD
```

---

## Checklist Pre-Purga

- [ ] Referencias verificadas (grep)
- [ ] Contenido único identificado
- [ ] Backup creado (tag o copia)
- [ ] Referencias actualizadas
- [ ] Validación planificada

---

## Errores Comunes a Evitar

| Error | Consecuencia | Prevención |
|-------|--------------|------------|
| Eliminar sin verificar refs | Referencias rotas | SIEMPRE grep primero |
| Eliminar contenido único | Pérdida de información | SIEMPRE comparar contenido |
| Eliminar sin backup | Sin rollback posible | SIEMPRE git tag antes |
| Eliminar docs/ completo | Pérdida de resúmenes para usuarios | docs/ tiene propósito diferente |

---

## Ejemplo: Purga de TRIGGERS-AUTOMATICOS.md

```bash
# 1. Verificar referencias
grep -rn "TRIGGERS-AUTOMATICOS" docs/ orchestration/
# Resultado: Referencias en PRINCIPIOS-FUNDAMENTALES.md

# 2. Verificar contenido único
diff docs/30-directivas/TRIGGERS-AUTOMATICOS.md \
     orchestration/directivas/triggers/_INDEX.md
# Resultado: 75% duplicado, sin contenido único

# 3. Backup
git tag backup-pre-purge-20260116

# 4. Actualizar referencias (editar PRINCIPIOS-FUNDAMENTALES.md)
# Cambiar link de TRIGGERS-AUTOMATICOS.md a orchestration/directivas/triggers/

# 5. Eliminar
rm docs/30-directivas/TRIGGERS-AUTOMATICOS.md

# 6. Validar
./scripts/validation/validate-references.sh
```

---

## Referencias

- `@TRIGGER-ANTI-DUPLICACION` - Prevenir duplicados
- `./scripts/validation/detect-duplicates.sh` - Detectar duplicados
- `./scripts/validation/validate-references.sh` - Validar referencias
- `orchestration/DEPENDENCY-GRAPH.yml` - Dependencias entre archivos
