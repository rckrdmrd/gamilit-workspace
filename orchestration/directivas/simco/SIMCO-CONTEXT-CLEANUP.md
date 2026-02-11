# SIMCO: CONTEXT CLEANUP

**Version:** 1.0.0
**Sistema:** SIMCO - NEXUS v4.1
**Proposito:** Protocolo de limpieza de contexto mid-session para evitar compactacion
**Fecha:** 2026-02-11
**Aplica a:** Todos los agentes operando en gamilit

---

## PRINCIPIO FUNDAMENTAL

> **Reference-Not-Content:** Cuando un archivo ya fue leido y procesado,
> reemplazar su contenido completo por una referencia de 1 linea.
> Esto libera tokens sin perder accesibilidad.

---

## 1. CLASIFICACION DE CONTEXTO

Todo contenido cargado en sesion se clasifica en 4 categorias:

```yaml
CLASIFICACION:
  ACTIVE:
    descripcion: "Necesario AHORA para la tarea actual"
    accion: "Mantener contenido completo"
    ejemplo: "Entity que estoy modificando, DDL de la tabla"

  REFERENCE:
    descripcion: "Ya leido, podria necesitarse de nuevo"
    accion: "Reemplazar por: path + resumen 1 linea"
    ejemplo: "Inventario ya consultado, ADR ya revisado"

  STALE:
    descripcion: "De tarea/subtarea anterior ya completada"
    accion: "Descartar completamente"
    ejemplo: "Codigo de modulo ya terminado en subtarea previa"

  OUTPUT:
    descripcion: "Resultado de operacion ya procesada"
    accion: "Mantener solo veredicto + metricas clave"
    ejemplo: "Resultado de build (solo pass/fail), resultado de grep"
```

---

## 2. TRIGGERS DE LIMPIEZA

| Trigger | Condicion | Accion |
|---------|-----------|--------|
| `post_5_files` | 5+ archivos leidos | Clasificar todos como ACTIVE/REFERENCE/STALE |
| `post_subtarea` | Subtarea completada | Purgar L3, mantener resultado |
| `contexto_50_pct` | >50% ventana usada | Inventariar + clasificar + purgar STALE |
| `pre_delegacion` | Antes de delegar | Limpiar para maximizar espacio subagente |
| `compactacion_inminente` | Sistema avisa compactacion | PROXIMA-ACCION + purga agresiva |

---

## 3. PROCEDIMIENTO DE LIMPIEZA (4 Pasos)

### Paso 1: Inventariar

```yaml
INVENTARIO:
  listar:
    - Todos los archivos leidos en sesion
    - Codigo inline en el contexto
    - Resultados de operaciones (builds, greps, diffs)
  formato:
    - "{path} | {tokens_estimados} | {ultima_vez_usado}"
```

### Paso 2: Clasificar

```yaml
CLASIFICAR:
  para_cada_item:
    pregunta_1: "Lo necesito para la tarea ACTUAL?"
    si: ACTIVE
    no:
      pregunta_2: "Podria necesitarlo pronto?"
      si: REFERENCE
      no: STALE
```

### Paso 3: Purgar

```yaml
PURGAR:
  STALE:
    accion: "Descartar completamente"
    tokens_liberados: "100% del contenido"

  REFERENCE:
    accion: "Reemplazar por referencia"
    formato: "Ver {path} - {resumen 1 linea}"
    tokens_liberados: "~90% del contenido"

  OUTPUT:
    accion: "Mantener solo veredicto"
    formato: "{operacion}: {pass|fail} ({metricas clave})"
    tokens_liberados: "~95% del contenido"
```

### Paso 4: Validar

```yaml
VALIDAR:
  - Contexto ACTIVE suficiente para continuar tarea
  - Referencias REFERENCE accesibles si se necesitan
  - No se perdio informacion critica para la tarea actual
  - Tokens liberados >= 20% del contexto pre-limpieza
```

---

## 4. FORMATO DE REFERENCIA COMPACTADA

### Archivo leido -> Referencia

```
ANTES (contenido completo):
  [2000 tokens de contenido del archivo user.entity.ts]

DESPUES (referencia):
  Ver apps/backend/src/modules/auth/entities/user.entity.ts - Entity User con 15 campos, relaciones a Profile, Tenant
  [~30 tokens]
```

### Resultado de operacion -> Veredicto

```
ANTES (output completo):
  [500 tokens de output de npm run build]

DESPUES (veredicto):
  Build backend: PASS (0 errors, 2 warnings triviales)
  [~15 tokens]
```

---

## 5. LIMPIEZA PRE-COMPACTACION (Emergencia)

Cuando el sistema indica compactacion inminente:

```yaml
EMERGENCIA:
  paso_1: "Guardar PROXIMA-ACCION.md inmediatamente"
  paso_2: "Purgar TODO excepto ACTIVE"
  paso_3: "Compactar ACTIVE a minimo viable"
  paso_4: "Verificar que PROXIMA-ACCION tiene toda la info para recovery"

PROXIMA_ACCION_DEBE_CONTENER:
  - Proyecto y tarea actual
  - Fase CAPVED actual
  - Archivos modificados en esta sesion
  - Siguiente paso concreto
  - Archivos a cargar para continuar
```

---

## 6. METRICAS

| Metrica | Objetivo | Alerta |
|---------|----------|--------|
| Archivos activos | < 5 | > 8 |
| Tokens de contexto | < 50% ventana | > 70% ventana |
| Limpiezas por sesion | 1-3 | > 5 (sesion demasiado larga) |
| Tokens liberados por limpieza | > 20% | < 10% (limpieza inefectiva) |

---

## 7. REFERENCIAS

| Documento | Proposito |
|-----------|-----------|
| `SIMCO-CONTROL-TOKENS.md` | Limites por modelo |
| `SIMCO-CONTEXT-MANAGEMENT-V2.md` | Sistema NEXUS v4.1 |
| `SIMCO-CONTEXT-ENGINEERING.md` | Teoria de contexto |
| `SIMCO-BOOTLOADER.md` | Protocolo de arranque |

---

**Version:** 1.0.0 | **Sistema:** SIMCO-NEXUS v4.1 | **Tipo:** Directiva de Limpieza
