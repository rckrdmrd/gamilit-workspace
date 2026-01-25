# SIMCO-NOMENCLATURA-TAREAS.md

**Sistema:** SIMCO v4.0.0
**Version:** 1.0.0
**Fecha:** 2026-01-24
**Mejora:** M-001 del Plan de Integracion

---

## 1. Proposito

Esta directiva establece la nomenclatura estandar para identificadores de tareas
en el workspace. El nuevo formato incluye el **tipo de tarea** para clasificacion
rapida y mejor organizacion.

---

## 2. Formato Nuevo

```
TASK-{YYYY-MM-DD}-{TIPO}-{NNN}[-{DESCRIPTOR}]

Donde:
- YYYY-MM-DD: Fecha de creacion
- TIPO: Codigo de 3 letras (ver tabla)
- NNN: Secuencial del dia (001, 002, etc.)
- DESCRIPTOR: (Opcional) Nombre corto descriptivo
```

### 2.1 Codigos de Tipo

| Codigo | Tipo | Descripcion | Ejemplo |
|--------|------|-------------|---------|
| **FEA** | Feature | Nueva funcionalidad | TASK-2026-01-24-FEA-001 |
| **BUG** | Bug Fix | Correccion de errores | TASK-2026-01-24-BUG-001 |
| **REF** | Refactor | Mejora de codigo sin cambiar funcionalidad | TASK-2026-01-24-REF-001 |
| **DOC** | Documentation | Documentacion | TASK-2026-01-24-DOC-001 |
| **ANL** | Analysis | Analisis o investigacion | TASK-2026-01-24-ANL-001 |
| **MIG** | Migration | Migracion de datos o sistema | TASK-2026-01-24-MIG-001 |
| **SEC** | Security | Correccion de seguridad | TASK-2026-01-24-SEC-001 |
| **REM** | Remediation | Remediacion de gaps o deuda tecnica | TASK-2026-01-24-REM-001 |

### 2.2 Ejemplos Completos

```
# Sin descriptor
TASK-2026-01-24-FEA-001
TASK-2026-01-24-BUG-002
TASK-2026-01-24-ANL-001

# Con descriptor (recomendado para tareas importantes)
TASK-2026-01-24-FEA-001-NEXUS-V4
TASK-2026-01-24-BUG-001-AUTH-FIX
TASK-2026-01-24-ANL-001-MULTI-AGENT
```

---

## 3. Formato Anterior (Deprecado)

```
TASK-{YYYY-MM-DD}-{NNN}
TASK-{YYYY-MM-DD}-{NOMBRE}

Ejemplos:
- TASK-2026-01-24-001
- TASK-2026-01-24-MULTI-AGENT-OPT
```

**Nota:** Las tareas existentes con formato anterior seguiran funcionando.
No es necesario migrar tareas completadas.

---

## 4. Reglas de Aplicacion

### 4.1 Para Tareas Nuevas (OBLIGATORIO)

A partir de 2026-01-24, toda tarea nueva DEBE usar el formato nuevo:
```
TASK-{YYYY-MM-DD}-{TIPO}-{NNN}[-{DESCRIPTOR}]
```

### 4.2 Seleccion de Tipo

```
¿Agrega funcionalidad nueva?           → FEA
¿Corrige un error existente?           → BUG
¿Mejora codigo sin cambiar funcion?    → REF
¿Solo documentacion?                   → DOC
¿Investigacion sin implementacion?     → ANL
¿Mueve datos o actualiza sistema?      → MIG
¿Corrige vulnerabilidad?               → SEC
¿Cierra gap o deuda tecnica?          → REM
```

### 4.3 Secuencial del Dia

- Inicia en 001 cada dia
- Incrementa por cada tarea nueva del mismo tipo ese dia
- Si hay duda, consultar `_INDEX.yml` para el ultimo secuencial

### 4.4 Descriptor Opcional

**Usar cuando:**
- Tarea es de alta prioridad (P0, P1)
- Tarea abarca multiples sprints
- Tarea es referenciada frecuentemente

**Reglas del descriptor:**
- Maximo 20 caracteres
- Solo mayusculas, numeros y guiones
- Sin espacios ni caracteres especiales

---

## 5. Estructura de Carpetas

### 5.1 Organizacion Actual (mantener)
```
orchestration/tareas/
├── _templates/
├── _INDEX.yml
└── TASK-{ID}/
```

### 5.2 Organizacion Futura (M-002)
```
orchestration/tareas/
├── _templates/
├── _INDEX.yml
├── 2026/
│   └── 01/
│       ├── TASK-2026-01-24-FEA-001/
│       └── TASK-2026-01-24-ANL-001-MULTI-AGENT/
```

---

## 6. Actualizacion de _INDEX.yml

Al crear una tarea con el nuevo formato, registrar en `_INDEX.yml`:

```yaml
historial_por_fecha:
  "2026-01":
    - task_id: "TASK-2026-01-24-FEA-001-NEXUS-V4"
      titulo: "Implementar Sistema NEXUS v4.0"
      tipo: "feature"  # Nuevo campo
      # ... resto de campos
```

---

## 7. Impacto en Commits

Los commits deben usar el ID completo:

```bash
# Correcto
git commit -m "[TASK-2026-01-24-FEA-001] feat: Add user authentication"

# Incorrecto (formato antiguo)
git commit -m "[TASK-2026-01-24-001] feat: Add user authentication"
```

---

## 8. Migracion

### Tareas Existentes
- NO migrar tareas completadas
- Las tareas en progreso pueden mantener formato antiguo hasta completarse

### Tareas Nuevas
- DEBEN usar formato nuevo desde 2026-01-24
- Validar en TRIGGER-INICIO-TAREA.md

---

## 9. Validacion

### Script de Validacion
```bash
# Validar formato de ID
echo "TASK-2026-01-24-FEA-001" | grep -E "^TASK-[0-9]{4}-[0-9]{2}-[0-9]{2}-(FEA|BUG|REF|DOC|ANL|MIG|SEC|REM)-[0-9]{3}(-[A-Z0-9-]{1,20})?$"
```

### En TRIGGER-INICIO-TAREA.md
Agregar validacion de formato antes de crear carpeta.

---

## 10. Referencias

- `@TAREAS` - Directorio de tareas
- `@NUEVA-TAREA` - Templates para crear tarea
- `@TRIGGER-INICIO` - Trigger de inicio de tarea
- `orchestration/tareas/_INDEX.yml` - Indice de tareas

---

*SIMCO-NOMENCLATURA-TAREAS.md - Estandar de nombres para tareas*
*Efectivo desde: 2026-01-24*
