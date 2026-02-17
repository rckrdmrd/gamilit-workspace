# INDICE: Sistema de Triggers

**Sistema:** SAAD (Sistema de Activacion Automatica de Directivas)
**Version:** 1.4.0
**Fecha:** 2026-02-14
**Ubicacion:** `orchestration/directivas/triggers/`

---

## Descripcion General

Los Triggers son mecanismos automaticos que se activan cuando se detectan
ciertas condiciones durante el procesamiento de tareas. Cada trigger ejecuta
verificaciones especificas y genera reportes o acciones correspondientes.

---

## Triggers Disponibles

| Trigger | Fase | Proposito |
|---------|------|-----------|
| TRIGGER-ANTI-DUPLICACION | A | Prevenir creacion de objetos duplicados |
| TRIGGER-ANALISIS-DEPENDENCIAS | A | Analizar impacto antes de modificar |
| ~~TRIGGER-PROPAGACION-AUTOMATICA~~ | ~~D~~ | ~~PHANTOM — archivo no existe en disco (concepto absorbido por STANDALONE)~~ |
| ~~TRIGGER-DUPLICADOS~~ | ~~A~~ | ~~PHANTOM — archivo no existe en disco (funcionalidad en TRIGGER-ANTI-DUPLICACION)~~ |
| **TRIGGER-CIERRE-TAREA-OBLIGATORIO** | **D** | **Verificar checklist antes de marcar tarea completada** |
| TRIGGER-COHERENCIA-CAPAS | E/D | Validar coherencia DDL↔Backend↔Frontend |
| **TRIGGER-SSOT-SYNC** | **D** | **Verificar sincronizacion inventarios SSOT con codigo** |
| TRIGGER-INVENTARIOS-SINCRONIZADOS | D | Verificar inventarios actualizados |
| TRIGGER-FETCH-OBLIGATORIO | Pre-A | Fetch obligatorio antes de operaciones git |
| TRIGGER-INICIO-TAREA | Pre-C | Crear carpeta de tarea antes de ejecutar codigo |
| TRIGGER-FUNCTIONALITY-CHECK | E | Verificar funcionalidades nuevas, duplicados, coherencia |
| TRIGGER-DDL-RECREAR-BD-WSL | E | Recrear BD cuando se modifican archivos DDL |
| TRIGGER-DOCUMENTACION-OBLIGATORIA | D | Verificar documentacion antes de completar tarea |
| TRIGGER-COMMIT-PUSH-OBLIGATORIO | D | Asegurar commit/push antes de reportar tarea completada |
| **TRIGGER-QUALITY-GATE** | **Pre-E** | **Gate de calidad: lint, tests, build, coverage minima antes de ejecutar** |

---

## Cuando Se Activan

### TRIGGER-ANTI-DUPLICACION
```yaml
fase_capved: A (Analisis)
palabras_clave:
  - "crear"
  - "nuevo"
  - "agregar"
  - "implementar"
acciones:
  - Verificar catalogo global
  - Verificar inventario proyecto
  - Buscar archivos similares
```

### TRIGGER-ANALISIS-DEPENDENCIAS
```yaml
fase_capved: A (Analisis)
palabras_clave:
  - "modificar"
  - "cambiar"
  - "actualizar"
  - "refactorizar"
  - "eliminar"
acciones:
  - Identificar imports del archivo
  - Identificar archivos que lo importan
  - Evaluar impacto (ALTO/MEDIO/BAJO)
  - Generar plan de modificacion
```

### TRIGGER-PROPAGACION-AUTOMATICA
```yaml
fase_capved: D (Documentacion)
condiciones:
  - Tarea completada en proyecto con jerarquia
  - Cambio en erp-core
  - Cambio en shared/catalog
  - Security fix
acciones:
  - Evaluar tipo de cambio
  - Identificar proyectos destino
  - Generar tareas de propagacion o propagar
```

### TRIGGER-DUPLICADOS
```yaml
fase_capved: A (Analisis)
palabras_clave:
  - "duplicado"
  - "repetido"
  - "consolidar"
  - "merge"
acciones:
  - Comparar capacidades de objetos
  - Identificar dependientes de cada uno
  - Proponer plan de consolidacion
  - Generar checklist pre-eliminacion
```

### TRIGGER-CIERRE-TAREA-OBLIGATORIO (NUEVO v1.1.0)
```yaml
fase_capved: D (Documentacion) - AL FINALIZAR TAREA
palabras_clave:
  - "completada"
  - "finalizada"
  - "terminada"
  - "Done"
  - "DONE"
  - "tarea cerrada"
condiciones:
  - Agente intenta marcar tarea como completada
  - Agente termina la ultima subtarea del plan
  - Agente declara "Done" o variantes
acciones:
  - DETENER (no marcar completada aun)
  - CARGAR @DEF_CHK_POST (checklist post-tarea)
  - EJECUTAR checklist completo
  - Solo si TODO pasa: marcar completada
  - Si FALLA: mantener EN PROGRESO
referencia: "@TRIGGER_CIERRE"
```

### TRIGGER-COHERENCIA-CAPAS
```yaml
fase_capved: E/D (Ejecucion/Documentacion)
condiciones:
  - Cambio en DDL (tablas, columnas)
  - Cambio en Backend (entities, services)
  - Cambio en Frontend (types, components)
acciones:
  - Verificar DDL ↔ Backend coherente
  - Verificar Backend ↔ Frontend coherente
  - Documentar excepciones si aplica
referencia: "@TRIGGER_COHERENCIA"
```

### TRIGGER-SSOT-SYNC (NUEVO v1.2.0)
```yaml
fase_capved: D (Documentacion) - POST-CAMBIO
condiciones:
  - Cambio en DDL (tablas, vistas, funciones, triggers)
  - Cambio en Backend (entities, services, controllers, DTOs)
  - Cambio en Frontend (componentes, hooks, stores, paginas, rutas)
  - Cambio en inventarios directamente
acciones:
  - Verificar inventario de dominio refleja codigo
  - Verificar MASTER_INVENTORY sincronizado
  - Verificar CLAUDE.md metricas coinciden
  - Validar no hay metricas aspiracionales
referencia: "@TRIGGER_SSOT_SYNC"
```

### TRIGGER-QUALITY-GATE (NUEVO v1.4.0)
```yaml
fase_capved: Pre-E (antes de Ejecucion)
condiciones:
  - Tarea implica modificacion de codigo (backend, frontend, DDL)
  - Cambio requiere validacion de build antes de merge
acciones:
  - Ejecutar lint (eslint) en archivos modificados
  - Ejecutar tests unitarios del modulo afectado
  - Verificar build exitoso (npm run build)
  - Validar coverage minima (80% objetivo)
  - Si FALLA: DETENER ejecucion, reportar errores
  - Si PASA: continuar a Fase E
referencia: "@TRIGGER_QUALITY_GATE"
```

### TRIGGER-INVENTARIOS-SINCRONIZADOS
```yaml
fase_capved: D (Documentacion)
condiciones:
  - Cualquier tarea que modifique codigo
acciones:
  - Verificar DATABASE_INVENTORY.yml actualizado
  - Verificar BACKEND_INVENTORY.yml actualizado
  - Verificar FRONTEND_INVENTORY.yml actualizado
  - Verificar MASTER_INVENTORY.yml actualizado
referencia: "@TRIGGER_INVENTARIOS"
```

---

## Archivos en Este Directorio

```
triggers/
├── _INDEX.md                              <- Este archivo
├── TRIGGER-ANTI-DUPLICACION.md            <- Prevencion de duplicados
├── TRIGGER-ANALISIS-DEPENDENCIAS.md       <- Analisis de impacto
├── [PHANTOM] TRIGGER-PROPAGACION-AUTOMATICA.md  <- NO EXISTE en disco (concepto STANDALONE)
├── [PHANTOM] TRIGGER-DUPLICADOS.md              <- NO EXISTE en disco (absorbido por ANTI-DUPLICACION)
├── TRIGGER-CIERRE-TAREA-OBLIGATORIO.md    <- Gate de cierre (NUEVO v1.1.0)
├── TRIGGER-COHERENCIA-CAPAS.md            <- Coherencia DDL↔BE↔FE
├── TRIGGER-SSOT-SYNC.md                   <- Sincronizacion SSOT (NUEVO v1.2.0)
├── TRIGGER-INVENTARIOS-SINCRONIZADOS.md   <- Inventarios actualizados
├── TRIGGER-FETCH-OBLIGATORIO.md           <- Fetch antes de git ops (NUEVO v1.3.0)
├── TRIGGER-INICIO-TAREA.md               <- Crear carpeta tarea (NUEVO v1.3.0)
├── TRIGGER-FUNCTIONALITY-CHECK.md         <- Verificar funcionalidades (NUEVO v1.3.0)
├── TRIGGER-DDL-RECREAR-BD-WSL.md          <- Recrear BD tras DDL (NUEVO v1.3.0)
├── TRIGGER-DOCUMENTACION-OBLIGATORIA.md   <- Docs obligatorias (NUEVO v1.3.0)
├── TRIGGER-COMMIT-PUSH-OBLIGATORIO.md     <- Commit/push obligatorio (NUEVO v1.3.0)
└── TRIGGER-QUALITY-GATE.md                <- Gate de calidad pre-ejecucion (NUEVO v1.4.0)
```

---

## Flujo de Triggers por Modo

### MODE-FULL
```
Pre-A:
  └─> TRIGGER-FETCH-OBLIGATORIO (antes de git ops)

Pre-C:
  └─> TRIGGER-INICIO-TAREA (crear carpeta de tarea)

Fase A:
  └─> TRIGGER-ANTI-DUPLICACION (si crear)
  └─> TRIGGER-ANALISIS-DEPENDENCIAS (si modificar)
  └─> TRIGGER-DUPLICADOS (si consolidar)

Pre-E:
  └─> TRIGGER-QUALITY-GATE (lint, tests, build, coverage minima)

Fase E:
  └─> TRIGGER-COHERENCIA-CAPAS (al modificar objetos)
  └─> TRIGGER-FUNCTIONALITY-CHECK (verificar funcionalidades)
  └─> TRIGGER-DDL-RECREAR-BD-WSL (si DDL modificado)

Fase D:
  └─> TRIGGER-DOCUMENTACION-OBLIGATORIA (verificar docs)
  └─> TRIGGER-SSOT-SYNC (post-cambio, verificar inventarios)
  └─> TRIGGER-INVENTARIOS-SINCRONIZADOS (siempre)
  └─> TRIGGER-PROPAGACION-AUTOMATICA (si jerarquia)
  └─> TRIGGER-COMMIT-PUSH-OBLIGATORIO (antes de reportar completada)
  └─> TRIGGER-CIERRE-TAREA-OBLIGATORIO (AL FINALIZAR - BLOQUEANTE)
```

### MODE-QUICK
```
Pre-A:
  └─> TRIGGER-FETCH-OBLIGATORIO (antes de git ops)

Fase D:
  └─> TRIGGER-COMMIT-PUSH-OBLIGATORIO (antes de reportar completada)
  └─> TRIGGER-CIERRE-TAREA-OBLIGATORIO (checklist reducido)

(Escalar a FULL si build falla)
```

### MODE-ANALYSIS
```
Fase A:
  └─> TRIGGER-ANALISIS-DEPENDENCIAS (para reporte)

(No hay fase D - sin cierre)
```

### MODE-PROPAGATION
```
Fase A (por cada proyecto):
  └─> TRIGGER-ANALISIS-DEPENDENCIAS

Fase E:
  └─> TRIGGER-COHERENCIA-CAPAS (por proyecto)

Fase D:
  └─> TRIGGER-INVENTARIOS-SINCRONIZADOS (por proyecto)
  └─> TRIGGER-PROPAGACION-AUTOMATICA (registro)
  └─> TRIGGER-CIERRE-TAREA-OBLIGATORIO (consolidado)
```

---

## Formato de Reporte de Triggers

Cada trigger genera un reporte con formato estandar:

```markdown
## {NOMBRE_TRIGGER} ACTIVADO

### Condicion de Activacion
- {razon}

### Analisis Realizado
{detalle_analisis}

### Resultado
- Estado: {PROCEDER | DETENER | CONSULTAR}
- Razon: {explicacion}

### Acciones Requeridas
1. {accion_1}
2. {accion_2}
...
```

---

## Interaccion con Operaciones Seguras

Los aliases de operaciones seguras (@CREATE-SAFE, @MODIFY-SAFE, @DELETE-SAFE)
activan triggers automaticamente:

| Alias | Trigger Activado |
|-------|------------------|
| @CREATE-SAFE | TRIGGER-ANTI-DUPLICACION |
| @MODIFY-SAFE | TRIGGER-ANALISIS-DEPENDENCIAS + TRIGGER-COHERENCIA-CAPAS |
| @DELETE-SAFE | TRIGGER-DUPLICADOS + TRIGGER-ANALISIS-DEPENDENCIAS |
| (Al completar) | TRIGGER-CIERRE-TAREA-OBLIGATORIO (automatico) |

---

## Trigger de Cierre (Especial)

El `TRIGGER-CIERRE-TAREA-OBLIGATORIO` es diferente a los demas:

- **Se activa automaticamente** cuando un agente intenta cerrar una tarea
- **Es BLOQUEANTE**: Si el checklist falla, la tarea NO puede marcarse completada
- **Aplica a TODOS los modos** (con checklist adaptado para MODE-QUICK)
- **Referencia:** `@TRIGGER_CIERRE`, `@DEF_CHK_POST`

---

## Lectura Recomendada

1. Leer cada trigger para entender su funcionamiento completo
2. Leer `../modos/MODE-FULL.md` para ver integracion con fases
3. Leer `../../referencias/ALIASES.yml` para aliases relacionados
4. Leer `TRIGGER-CIERRE-TAREA-OBLIGATORIO.md` para gate de cierre
5. Para auditorias de consistencia por flujo: `../simco/SIMCO-AUDITORIA-FLUJOS-E2E.md`
6. Para ejecucion full de cobertura total: `../../tareas/TASK-2026-02-17-CIERRE-RIESGOS-RESIDUALES-FULL/`

---

## Changelog

### v1.4.0 (2026-02-14)
- Agregado TRIGGER-QUALITY-GATE.md (gate de calidad pre-ejecucion: lint, tests, build, coverage)
- Agregado Pre-E al flujo MODE-FULL para QUALITY-GATE
- Total triggers: 13 en disco (2 phantoms: PROPAGACION-AUTOMATICA, DUPLICADOS)

### v1.3.0 (2026-02-13)
- Agregados 6 triggers existentes en disco no documentados: FETCH-OBLIGATORIO, INICIO-TAREA, FUNCTIONALITY-CHECK, DDL-RECREAR-BD-WSL, DOCUMENTACION-OBLIGATORIA, COMMIT-PUSH-OBLIGATORIO
- Actualizado flujo MODE-FULL con Pre-A, Pre-C, y triggers en fases E y D
- Actualizado flujo MODE-QUICK con FETCH-OBLIGATORIO y COMMIT-PUSH-OBLIGATORIO
- Total triggers: 14

### v1.2.0 (2026-02-13)
- Agregado TRIGGER-SSOT-SYNC.md (sincronizacion inventarios SSOT)
- Actualizado flujo MODE-FULL para incluir SSOT-SYNC en Fase D
- Total triggers: 8

### v1.1.0 (2026-01-16)
- Agregado TRIGGER-CIERRE-TAREA-OBLIGATORIO.md (gate de cierre)
- Agregado TRIGGER-COHERENCIA-CAPAS.md
- Agregado TRIGGER-INVENTARIOS-SINCRONIZADOS.md
- Actualizado flujo por modo para incluir nuevos triggers
- Total triggers: 7

### v1.0.0 (Original)
- 4 triggers originales (ANTI-DUPLICACION, ANALISIS-DEPENDENCIAS, PROPAGACION, DUPLICADOS)

---

*Sistema de Triggers v1.4.0 - Sistema SAAD - Actualizado 2026-02-14*
