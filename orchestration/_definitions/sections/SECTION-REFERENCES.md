# SECCIÓN: REFERENCIAS ESTÁNDAR

> **Alias:** `@DEF_SEC_REFS`
> **Versión:** 1.0.0
> **Actualizado:** 2026-01-16

---

## Propósito

Template reutilizable para la sección REFERENCIAS de cualquier documento.
Garantiza consistencia y facilita navegación entre documentos relacionados.

---

## Template Base

```markdown
## Referencias

### Documentación Relacionada

| Documento | Alias | Propósito |
|-----------|-------|-----------|
| {nombre} | @{ALIAS} | {descripción breve} |

### Directivas Aplicables

- @{DIRECTIVA_1} - {descripción}
- @{DIRECTIVA_2} - {descripción}

### Recursos Externos (si aplica)

- [{nombre}]({url}) - {descripción}
```

---

## Categorías de Referencias

### 1. Para Perfiles de Agente

```markdown
## Referencias

### Directivas SIMCO

| Directiva | Cuándo Usar |
|-----------|-------------|
| @SIMCO-TAREA | Inicio de cualquier tarea |
| @SIMCO-{DOMINIO} | Operaciones en {dominio} |
| @SIMCO-VALIDAR | Antes de completar |

### Checklists

| Checklist | Momento |
|-----------|---------|
| @DEF_CHK_CREATE | Antes de crear objetos |
| @DEF_CHK_MODIFY | Antes de modificar |
| @DEF_CHK_POST | Al finalizar tarea |

### Validaciones

| Validación | Alias |
|------------|-------|
| {dominio} | @DEF_VAL_{DOMINIO} |

### Documentación del Proyecto

- `orchestration/` - Sistema SIMCO
- `docs/` - Documentación de usuario
- `{proyecto}/orchestration/` - Orquestación del proyecto
```

### 2. Para Directivas SIMCO

```markdown
## Referencias

### Directivas Relacionadas

| Directiva | Relación |
|-----------|----------|
| @{DIRECTIVA} | {complementa/extiende/depende} |

### Triggers Asociados

- @TRIGGER-{NOMBRE} - {descripción}

### Fuente de Verdad

- {ruta al documento canónico}
```

### 3. Para Documentación de Usuario (docs/)

```markdown
## Referencias

### Navegación

- [Anterior: {nombre}]({ruta})
- [Siguiente: {nombre}]({ruta})
- [Índice de sección](./_INDEX.md)

### Documentación Técnica

- `orchestration/{ruta}` - Definición completa (fuente de verdad)

### Ver También

- [{documento relacionado}]({ruta})
```

---

## Ejemplo Completo

```markdown
## Referencias

### Directivas SIMCO

| Directiva | Cuándo Usar |
|-----------|-------------|
| @SIMCO-TAREA | Inicio de cualquier tarea |
| @SIMCO-BACKEND | Operaciones en backend |
| @SIMCO-VALIDAR | Antes de completar |
| @SIMCO-MODIFICAR | Antes de modificar archivos |

### Checklists

| Checklist | Momento |
|-----------|---------|
| @DEF_CHK_CREATE | Antes de crear entities/services |
| @DEF_CHK_MODIFY | Antes de modificar código existente |
| @DEF_CHK_GOB | Antes de cerrar tarea |
| @DEF_CHK_POST | Al finalizar tarea |

### Validaciones

| Validación | Alias |
|------------|-------|
| Backend | @DEF_VAL_BE |
| Frontend | @DEF_VAL_FE |
| DDL | @DEF_VAL_DDL |

### Protocolos

| Protocolo | Alias | Uso |
|-----------|-------|-----|
| CCA | @DEF_CCA | Carga de contexto |
| Delegación | @DEF_DELEGATION | Cuando delegar |
| CAPVED | @DEF_CAPVED | Ciclo de vida |

### Documentación

| Recurso | Ruta |
|---------|------|
| Sistema SIMCO | `orchestration/` |
| Docs Usuario | `docs/` |
| Aliases | `orchestration/referencias/ALIASES.yml` |
```

---

## Formato de Alias

| Prefijo | Dominio | Ejemplo |
|---------|---------|---------|
| `@DEF_` | Definiciones canónicas | @DEF_CCA, @DEF_VAL_BE |
| `@WS_` | Recursos del workspace | @WS_TRACEABILITY |
| `@PROJ_` | Recursos de proyecto | @PROJ_INVENTORY |
| `@SIMCO-` | Directivas SIMCO | @SIMCO-BACKEND |
| `@TRIGGER-` | Triggers automáticos | @TRIGGER-COHERENCIA |

---

## Uso en Documentos

```markdown
## Referencias
> Definición: @DEF_SEC_REFS

[Referencias específicas del documento]
```

---

## Referencias

- `orchestration/referencias/ALIASES.yml` - Catálogo completo de aliases
- `orchestration/_definitions/_INDEX.yml` - Índice de definiciones
- `docs/_MAP.md` - Mapa de navegación de docs/
