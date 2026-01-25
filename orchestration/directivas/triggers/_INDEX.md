# INDICE: Sistema de Triggers

**Sistema:** SAAD (Sistema de Activacion Automatica de Directivas)
**Version:** 1.1.0
**Fecha:** 2026-01-16
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
| TRIGGER-PROPAGACION-AUTOMATICA | D | Evaluar si cambio debe propagarse |
| TRIGGER-DUPLICADOS | A | Gestionar consolidacion de duplicados |
| **TRIGGER-CIERRE-TAREA-OBLIGATORIO** | **D** | **Verificar checklist antes de marcar tarea completada** |
| TRIGGER-COHERENCIA-CAPAS | E/D | Validar coherencia DDL↔Backend↔Frontend |
| TRIGGER-INVENTARIOS-SINCRONIZADOS | D | Verificar inventarios actualizados |

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
├── TRIGGER-PROPAGACION-AUTOMATICA.md      <- Propagacion entre proyectos
├── TRIGGER-DUPLICADOS.md                  <- Consolidacion de duplicados
├── TRIGGER-CIERRE-TAREA-OBLIGATORIO.md    <- Gate de cierre (NUEVO v1.1.0)
├── TRIGGER-COHERENCIA-CAPAS.md            <- Coherencia DDL↔BE↔FE
└── TRIGGER-INVENTARIOS-SINCRONIZADOS.md   <- Inventarios actualizados
```

---

## Flujo de Triggers por Modo

### MODE-FULL
```
Fase A:
  └─> TRIGGER-ANTI-DUPLICACION (si crear)
  └─> TRIGGER-ANALISIS-DEPENDENCIAS (si modificar)
  └─> TRIGGER-DUPLICADOS (si consolidar)

Fase E:
  └─> TRIGGER-COHERENCIA-CAPAS (al modificar objetos)

Fase D:
  └─> TRIGGER-INVENTARIOS-SINCRONIZADOS (siempre)
  └─> TRIGGER-PROPAGACION-AUTOMATICA (si jerarquia)
  └─> TRIGGER-CIERRE-TAREA-OBLIGATORIO (AL FINALIZAR - BLOQUEANTE)
```

### MODE-QUICK
```
Fase D:
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

---

## Changelog

### v1.1.0 (2026-01-16)
- Agregado TRIGGER-CIERRE-TAREA-OBLIGATORIO.md (gate de cierre)
- Agregado TRIGGER-COHERENCIA-CAPAS.md
- Agregado TRIGGER-INVENTARIOS-SINCRONIZADOS.md
- Actualizado flujo por modo para incluir nuevos triggers
- Total triggers: 7

### v1.0.0 (Original)
- 4 triggers originales (ANTI-DUPLICACION, ANALISIS-DEPENDENCIAS, PROPAGACION, DUPLICADOS)

---

*Sistema de Triggers v1.1.0 - Sistema SAAD - Actualizado 2026-01-16*
