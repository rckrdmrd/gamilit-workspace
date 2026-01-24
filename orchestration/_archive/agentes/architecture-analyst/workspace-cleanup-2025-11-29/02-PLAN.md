# PLAN DE REORGANIZACION DEL WORKSPACE

**Tarea:** Limpieza y reorganizacion del workspace de documentacion
**Fecha:** 2025-11-29
**Agente:** Architecture-Analyst
**Estado:** FASE 2 - PLANEACION

---

## 1. RESUMEN DEL PLAN

### 1.1 Objetivo
Limpiar y reorganizar el workspace moviendo documentacion a sus ubicaciones correctas, archivando contenido historico y eliminando archivos temporales.

### 1.2 Alcance
- 8 archivos en raiz del proyecto
- 13+ carpetas de trabajo historico en orchestration/agentes/
- Documentacion dispersa en apps/

---

## 2. TAREAS DETALLADAS

### GRUPO 1: Archivos en Raiz (P0 - Inmediato)

#### Tarea 1.1: Mover reportes de fase a orchestration/reportes/
```yaml
archivos:
  - origen: "ANALISIS-FASE2-2025-11-28.md"
    destino: "orchestration/reportes/ANALISIS-FASE2-2025-11-28.md"
  - origen: "HALLAZGOS-TABLA-FASE2.md"
    destino: "orchestration/reportes/HALLAZGOS-TABLA-FASE2.md"
  - origen: "INDICE-REPORTES-FASE2.md"
    destino: "orchestration/reportes/INDICE-REPORTES-FASE2.md"
  - origen: "RESUMEN-EJECUTIVO-FASE2.md"
    destino: "orchestration/reportes/RESUMEN-EJECUTIVO-FASE2.md"
```

#### Tarea 1.2: Mover documentacion tecnica websocket a docs/
```yaml
archivos:
  - origen: "WEBSOCKET_EVENT_FLOW.md"
    destino: "docs/95-guias-desarrollo/websocket/WEBSOCKET_EVENT_FLOW.md"
  - origen: "WEBSOCKET_LEADERBOARD_IMPLEMENTATION.md"
    destino: "docs/95-guias-desarrollo/websocket/WEBSOCKET_LEADERBOARD_IMPLEMENTATION.md"
nota: "Crear directorio docs/95-guias-desarrollo/websocket/ si no existe"
```

#### Tarea 1.3: Archivar archivos temporales
```yaml
archivos:
  - origen: "IMPLEMENTATION-SUMMARY-AUTOSAVE.md"
    destino: "orchestration/.archive/autosave-files/"
  - origen: "P1-005_SUMMARY.md"
    destino: "orchestration/.archive/task-summaries/"
```

### GRUPO 2: Carpetas de Trabajo Historico (P1)

#### Tarea 2.1: Archivar carpetas de 2025-11-26
```yaml
carpetas_a_archivar:
  - "orchestration/agentes/architecture-analyst/PLAN-IMPLEMENTACION-P2-2025-11-26"
  - "orchestration/agentes/architecture-analyst/admin-portal-analysis-2025-11-26"
  - "orchestration/agentes/architecture-analyst/gamification-integration-analysis-2025-11-26"
  - "orchestration/agentes/architecture-analyst/backlog-corrections-2025-11-26"
  - "orchestration/agentes/architecture-analyst/ANALISIS-PORTAL-TEACHER-2025-11-26"
  - "orchestration/agentes/architecture-analyst/admin-portal-comprehensive-analysis-2025-11-26"
  - "orchestration/agentes/architecture-analyst/teacher-portal-analysis-2025-11-26"
  - "orchestration/agentes/architecture-analyst/VALIDACION-PORTAL-TEACHER-2025-11-26"
  - "orchestration/agentes/architecture-analyst/useMissions-error-analysis-2025-11-26"
  - "orchestration/agentes/architecture-analyst/CORRECCION-ISSUES-TEACHER-2025-11-26"
  - "orchestration/agentes/backend/TASK-2025-11-26-filtro-classroom-modules"
  - "orchestration/agentes/workspace-manager/cleanup-2025-11-26"

archivo_destino: "orchestration/.archive/work-folders-2025-11-26.tar.gz"
accion: "Comprimir y eliminar originales"
```

#### Tarea 2.2: Archivar carpetas de 2025-11-28
```yaml
carpetas_a_archivar:
  - "orchestration/agentes/database/DB-VALIDATE-MAPA-EMPAREJAMIENTO-2025-11-28"

archivo_destino: "orchestration/.archive/work-folders-2025-11-28.tar.gz"
```

---

## 3. ORDEN DE EJECUCION

```
FASE 1: Preparacion
├── Crear directorios destino (docs/95-guias-desarrollo/websocket/)
└── Verificar permisos

FASE 2: Mover archivos de raiz (GRUPO 1)
├── Tarea 1.1: Reportes → orchestration/reportes/
├── Tarea 1.2: Websocket docs → docs/95-guias-desarrollo/websocket/
└── Tarea 1.3: Temporales → .archive/

FASE 3: Archivar trabajo historico (GRUPO 2)
├── Tarea 2.1: Carpetas 2025-11-26
└── Tarea 2.2: Carpetas 2025-11-28

FASE 4: Validacion
├── Verificar que raiz solo tiene README.md, CONTRIBUTING.md, CHANGELOG.md
├── Verificar que archivos movidos estan en destino
└── Verificar que .archive tiene nuevos archivos comprimidos
```

---

## 4. CRITERIOS DE ACEPTACION

### 4.1 Raiz del Proyecto
- [ ] Solo contiene: README.md, CONTRIBUTING.md, CHANGELOG.md (y archivos de config)
- [ ] No hay archivos de reporte (.md) sueltos
- [ ] No hay archivos temporales o autosave

### 4.2 orchestration/reportes/
- [ ] Contiene los 4 reportes de fase movidos
- [ ] Archivos mantienen su contenido intacto

### 4.3 docs/95-guias-desarrollo/
- [ ] Existe subcarpeta websocket/
- [ ] Contiene los 2 archivos de documentacion websocket

### 4.4 orchestration/.archive/
- [ ] Contiene nuevos archivos comprimidos
- [ ] Archivos temporales archivados

### 4.5 orchestration/agentes/
- [ ] Carpetas historicas de 2025-11-26 eliminadas (archivadas)
- [ ] Carpetas historicas de 2025-11-28 eliminadas (archivadas)

---

## 5. AGENTES A ORQUESTAR

### 5.1 Workspace-Manager (Ejecucion Principal)
```yaml
agente: "Workspace-Manager"
prompt_base: "PROMPT-WORKSPACE-MANAGER.md"
subagent_type: "general-purpose"
tareas:
  - Ejecutar GRUPO 1 (archivos en raiz)
  - Ejecutar GRUPO 2 (carpetas historicas)
  - Validar resultado
```

---

## 6. RESTRICCIONES

1. **NO eliminar archivos** - Solo mover o archivar
2. **NO modificar contenido** - Solo reubicar
3. **PRESERVAR archivos de config** en raiz (package.json, tsconfig.json, etc.)
4. **COMPRIMIR antes de eliminar** carpetas historicas
5. **ACTUALIZAR trazas** con cambios realizados

---

## 7. ROLLBACK

En caso de error:
1. Los archivos originales estan en .archive/ como backup
2. Restaurar desde backup si es necesario
3. Documentar en traza el problema encontrado

---

## 8. SIGUIENTE FASE

Proceder a **FASE 3: VALIDACION DE PLANEACION** para verificar que el plan cubre todos los hallazgos del analisis.
