# POLITICA: SSOT (Single Source of Truth) para GAMILIT

**Version:** 1.0.0
**Estado:** VIGENTE
**Fecha Creacion:** 2026-01-30
**Revision:** Trimestral o cuando se agregue nueva fuente de datos
**Tarea Origen:** TASK-2026-01-30-CORRECCION-INTEGRAL

---

## Contexto

El proyecto Gamilit tiene multiples ubicaciones donde reside informacion:
- **Windows:** `C:\Empresas\ISEM\workspace-v2\projects\gamilit\` - Version ACTUAL de desarrollo
- **WSL Ubuntu:** `/home/isem/workspace-v2/projects/gamilit/` - BACKUP de referencia
- **workspace-v2:** `orchestration/inventarios/` - Agregados del workspace

La falta de definicion clara de SSOT causo:
1. Desincronizacion de inventarios (11 dias de diferencia)
2. Agentes leyendo metricas desactualizadas
3. Percepcion de "regresion" cuando en realidad habia avance

---

## Decision

### Jerarquia de SSOT para GAMILIT

| Tipo de Dato | SSOT (Fuente de Verdad) | Referencia/Backup |
|--------------|-------------------------|-------------------|
| **Codigo fuente** | Windows (`projects/gamilit/apps/`) | WSL (backup) |
| **DDL/Migraciones** | Windows (`apps/database/ddl/`) | WSL (backup) |
| **Inventarios proyecto** | Windows (`projects/gamilit/orchestration/inventarios/`) | workspace-v2 (agregado) |
| **Documentacion** | Windows (`projects/gamilit/docs/`) | WSL (backup) |
| **Metricas MVP** | Windows (`MASTER_INVENTORY.yml v5.1.0`) | N/A |
| **Trazas de tareas** | Windows (`projects/gamilit/orchestration/tareas/`) | workspace-v2 (copia) |

### Reglas de Operacion

1. **LECTURA de metricas:** SIEMPRE leer de `projects/gamilit/orchestration/inventarios/`
2. **ESCRITURA de codigo:** SIEMPRE escribir en `projects/gamilit/apps/`
3. **SINCRONIZACION:** Despues de cambios significativos, sincronizar a workspace-v2
4. **BACKUP WSL:** Sincronizar WSL solo para backups periodicos (no desarrollo activo)

### Direccion de Sincronizacion

```
SSOT (Windows gamilit local)
    |
    +---> workspace-v2/orchestration/inventarios/ (agregado)
    |
    +---> WSL Ubuntu (backup periodico)
```

**NUNCA** sincronizar en direccion inversa (WSL/workspace → gamilit) sin validacion explicita.

---

## Riesgos Aceptados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| WSL desactualizado | Alta | Bajo | Solo usar como backup, no como referencia |
| workspace-v2 desincronizado | Media | Medio | TRIGGER-SYNC-INVENTARIOS automatico |
| Confusion sobre ubicacion | Baja | Alto | Esta politica + RC5 en CLAUDE.md |

---

## Implementacion

### Alias de Acceso

```yaml
# Agregar a CLAUDE.md local de gamilit
@SSOT-INVENTARIOS: projects/gamilit/orchestration/inventarios/
@SSOT-CODIGO: projects/gamilit/apps/
@SSOT-DOCS: projects/gamilit/docs/
@BACKUP-WSL: /home/isem/workspace-v2/projects/gamilit/ (solo backup)
```

### Validacion

Antes de leer metricas del proyecto:
1. Verificar que se lee de `projects/gamilit/orchestration/inventarios/`
2. Si se necesita comparar con workspace, usar `workspace-v2/orchestration/inventarios/`
3. **NUNCA** asumir que workspace-v2 tiene las metricas actuales del proyecto

---

## Condiciones de Revision

Esta politica debe revisarse cuando:
1. Se agregue una nueva fuente de datos (nuevo entorno)
2. Se cambie la estructura de inventarios
3. Se detecte confusion sobre SSOT
4. Trimestralmente como parte de governance review

---

## Referencias

- **TASK-011:** Identifico desincronizacion inicial
- **TASK-2026-01-30-CORRECCION-INTEGRAL:** Establecio esta politica
- **RC5 CLAUDE.md:** Regla critica complementaria
- **TRIGGER-SYNC-INVENTARIOS:** Automatizacion de sincronizacion

---

*Sistema SIMCO v4.3.0*
*Fecha: 2026-01-30*
