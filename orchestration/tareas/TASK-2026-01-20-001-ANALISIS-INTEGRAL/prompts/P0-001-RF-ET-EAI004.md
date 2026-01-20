# PROMPT: P0-001 - Crear RF/ET para EAI-004

## Metadata

```yaml
subagente_id: "P0-001"
nombre: "Crear Requerimientos y Especificaciones Tecnicas para EAI-004"
perfil: "general-purpose"
tipo_tool: "Task (subagent_type: general-purpose)"
fecha_ejecucion: "2026-01-20"
tarea_padre: "TASK-2026-01-20-001"
agent_id: "a8aa73b"
```

---

## Prompt Enviado

```
**TAREA P0-001: Crear Requerimientos y Especificaciones Técnicas para EAI-004 (Analytics)**

**Contexto:**
La EPIC EAI-004 (Analytics) tiene 0 requerimientos formales y 0 especificaciones técnicas, pero sí tiene 6 historias de usuario documentadas. Necesitas crear la documentación faltante.

**Ubicación:**
`/home/isem/workspace-v2/projects/gamilit/docs/01-fase-alcance-inicial/EAI-004-analytics/`

**Estructura actual (lee primero):**
- `historias-usuario/` - Contiene 6 US (US-ANA-001 a US-ANA-006)
- `_MAP.md` - Mapa de la EPIC
- `README.md` - Descripción de la EPIC

**Lo que debes crear:**

1. **Carpeta `requerimientos/`** con archivos:
   - `RF-ANA-001-visualizacion-progreso.md` - Visualización de progreso del estudiante
   - `RF-ANA-002-metricas-gamificacion.md` - Métricas de elementos de gamificación
   - `RF-ANA-003-reportes-docente.md` - Reportes para docentes/administradores

2. **Carpeta `especificaciones/`** con archivos:
   - `ET-ANA-001-dashboard-estudiante.md` - Especificación técnica del dashboard
   - `ET-ANA-002-api-metricas.md` - Especificación de endpoints de métricas
   - `ET-ANA-003-exportacion-datos.md` - Especificación de exportación

**Formato de Requerimiento (RF):**
```markdown
# RF-ANA-XXX: [Título]

## Descripción
[Descripción funcional]

## Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2

## Historias de Usuario Relacionadas
- US-ANA-XXX

## Prioridad
P1/P2/P3

## Estado
Documentado
```

**Formato de Especificación Técnica (ET):**
```markdown
# ET-ANA-XXX: [Título]

## Requerimiento Padre
RF-ANA-XXX

## Descripción Técnica
[Detalles técnicos de implementación]

## Componentes Afectados
- Backend: [services, controllers]
- Frontend: [components]
- Database: [tables]

## Endpoints (si aplica)
- GET /api/...
- POST /api/...

## Consideraciones
[Notas técnicas]
```

3. **Actualizar `_MAP.md`** agregando secciones de requerimientos y especificaciones

4. **Actualizar `TRACEABILITY.yml`** si existe, o crear uno básico en `implementacion/`

**Referencias para contexto:**
- Lee las 6 historias de usuario para entender qué funcionalidades cubrir
- Usa como modelo: `/home/isem/workspace-v2/projects/gamilit/docs/01-fase-alcance-inicial/EAI-003-gamificacion/` que está bien estructurada

**IMPORTANTE:** Crea los archivos reales usando la herramienta Write. No solo describas lo que harías.
```

---

## Contexto Adicional

```yaml
user_stories_existentes:
  - US-ANA-001: "Dashboard de progreso de clase"
  - US-ANA-002: "Tabla de progreso por estudiante"
  - US-ANA-003: "Vista individual de estudiante"
  - US-ANA-004: "Reporte basico de progreso"
  - US-ANA-005: "Timeline de actividad"
  - US-ANA-006: "Identificacion de estudiantes en riesgo"

modelo_referencia:
  epic: "EAI-003-gamificacion"
  archivos_ejemplo:
    - "requerimientos/RF-GAM-001-sistema-puntos.md"
    - "especificaciones/ET-GAM-001-puntos-mlcoins.md"
```

---

## Resultado Obtenido

```yaml
resultado:
  estado: "COMPLETADO"
  archivos_creados:
    requerimientos:
      - "RF-ANA-001-visualizacion-progreso.md"
      - "RF-ANA-002-metricas-gamificacion.md"
      - "RF-ANA-003-reportes-docente.md"
    especificaciones:
      - "ET-ANA-001-dashboard-estudiante.md"
      - "ET-ANA-002-api-metricas.md"
      - "ET-ANA-003-exportacion-datos.md"

  archivos_actualizados:
    - "_MAP.md"
    - "implementacion/TRACEABILITY.yml"

  trazabilidad_establecida:
    RF-ANA-001:
      spec: "ET-ANA-001"
      us: ["US-ANA-001", "US-ANA-002", "US-ANA-003"]
    RF-ANA-002:
      spec: "ET-ANA-002"
      us: ["US-ANA-005", "US-ANA-006"]
    RF-ANA-003:
      spec: "ET-ANA-003"
      us: ["US-ANA-004"]

  lineas_generadas: ~2000
```

---

## Archivos Creados (Resumen)

### RF-ANA-001-visualizacion-progreso.md
- Dashboard de clase con métricas agregadas
- Tabla de estudiantes con progreso
- Vista individual con detalle completo
- 5 criterios de aceptación

### RF-ANA-002-metricas-gamificacion.md
- Timeline de actividad gamificada
- Indicadores de participación
- Identificación de estudiantes en riesgo
- 4 criterios de aceptación

### RF-ANA-003-reportes-docente.md
- Reporte de progreso por módulo
- Exportación CSV
- Filtros por fecha y módulo
- 3 criterios de aceptación

### ET-ANA-001-dashboard-estudiante.md
- Endpoints: GET /teacher/classrooms/:id/stats
- Componentes: ClassroomProgressCard, StudentTable
- Hooks: useClassroomStats, useStudentProgress
- Código de ejemplo incluido

### ET-ANA-002-api-metricas.md
- Endpoints: GET /analytics/activity-timeline
- Algoritmo de detección de riesgo
- Tablas: activity_logs, module_progress
- Queries SQL de ejemplo

### ET-ANA-003-exportacion-datos.md
- Endpoints: GET /teacher/reports/export
- Formato CSV con BOM para Excel
- Streaming para archivos grandes
- Headers y Content-Type especificados

---

## Notas de Ejecución

- Subagente completó sin interrupciones
- Leyó 6 US para contexto
- Usó EAI-003 como modelo de estructura
- Generó código de ejemplo en ETs
- Actualizó TRACEABILITY.yml con mapeo completo

---

**Generado:** 2026-01-20
