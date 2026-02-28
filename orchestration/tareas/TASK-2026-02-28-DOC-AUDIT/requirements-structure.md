---
titulo: Evaluación Estructura 10-requirements
tipo: reporte
fecha_creacion: 2026-02-28
autor: claude-sonnet-4-6
tarea: TASK-2026-02-28-DOC-AUDIT
---

# Evaluación Estructura 10-requirements

## Resumen

| Metrica | Valor |
|---------|-------|
| Total archivos | 1,648 |
| Total directorios | 1,045 |
| TASK-* dirs (activos en epics/) | 596 |
| Epics activas (EPIC-GAM-F*) | 23 |
| Epics wave-3-technical (todas completadas) | 11 |
| Legacy dirs con propósito puente | 3 (02-desarrollo/base-de-datos, 04-fase-backlog, testing-guides) |
| Archivos en _archived/ (raíz) | 18 |
| Archivos en _wave-3-technical/ | 70 |
| Nivel de profundidad máximo | 7 niveles (epics/EPIC/user-stories/US/tasks/TASK-dir/TASK.md) |

---

## Hallazgos

### 1. Directorios Legacy (03-desarrollo, 04-fase-backlog)

Los directorios `03-desarrollo/` y `04-fase-backlog/` **no existen al nivel raíz** de `docs/10-requirements/`. Existen únicamente dentro de `docs/10-requirements/epics/`:

**`docs/10-requirements/epics/03-desarrollo/`**
- Contiene: `base-de-datos/MAPEO-requirements-IMPLEMENTACION.md`
- Contenido: documento "Ruta Legacy" con YAML frontmatter `estado: activo`
- Función real: puntero/bridge hacia `docs/20-architecture/schema-reference/` y `EPIC-GAM-F1-GAMIFICATION`
- Conclusion: **documento puente, no hay contenido original** — fue consolidado durante remediacion documental (2026-02-17)

**`docs/10-requirements/epics/04-fase-backlog/`**
- Contiene: `FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md` + `README.md`
- Ambos son documentos "Ruta Legacy" que apuntan a los epics F3 y al `_INDEX.md` maestro
- Conclusion: **documentos puente, no hay contenido original** — integrado en epics funcionales

**`docs/10-requirements/testing-guides/`**
- Contiene: únicamente un `README.md`
- El README indica `[MOVED]` — contenido relocado a `docs/50-guides/testing/exercise-guides/`
- Conclusion: **directorio vacío de facto** con solo un puntero redirect

Estos 3 directorios legacy sirven exclusivamente como redirects para navegadores con paths anteriores. Su propósito es SEO/navegabilidad documental, no contenido activo.

---

### 2. _wave-3-technical

**Estado:** COMPLETADO (todas las 11 EPICs marcadas `completed`)

**Estructura observada:**
```
epics/_wave-3-technical/
  _INDEX.md                        <- índice de wave 3, todos completed
  EPIC-GAM-ARCHITECTURE/           <- 2 archivos (EPIC.md + _INDEX.md)
  EPIC-GAM-BACKEND/                <- 16 archivos + _archived/ (32 archivos duplicados)
  EPIC-GAM-DATABASE/               <- 2 archivos
  EPIC-GAM-DEVOPS/                 <- 2 archivos
  EPIC-GAM-DOCS/                   <- 2 archivos
  EPIC-GAM-FRONTEND/               <- 1 archivo + _archived/ (12 archivos)
  EPIC-GAM-INTEGRATION/            <- 2 archivos
  EPIC-GAM-K8S/                    <- 2 archivos
  EPIC-GAM-REQUIREMENTS/           <- 2 archivos
  EPIC-GAM-SCAFFOLD/               <- 2 archivos
  EPIC-GAM-TESTING/                <- 2 archivos
  user-stories/README.md           <- stub de redirect
```

**Total:** 70 archivos .md en `_wave-3-technical/`

**Anomalia detectada: doble presencia en EPIC-GAM-BACKEND y EPIC-GAM-FRONTEND**

`EPIC-GAM-BACKEND` contiene los user stories tanto en la raíz del epic como dentro de `_archived/EPIC-GAM-BACKEND/` — hay duplicacion exacta de los mismos archivos (US-GAM-ANALYTICS-01.md, US-GAM-ANL-01.md, etc.) en dos rutas paralelas. Mismo patrón en `EPIC-GAM-FRONTEND`.

**Actividad:** No hay evidencia de modificaciones recientes más allá de la remediacion documental de 2026-02-17 (actualización de `ultima_actualizacion`). El `_INDEX.md` del wave-3 fue actualizado 2026-02-28 pero solo para agregar frontmatter.

**Conclusion:** `_wave-3-technical/` es archivo histórico válido. Todas las EPICs estan completadas. El `_INDEX.md` raíz de epics las referencia correctamente. No interfiere con el trabajo activo (F3, F4). Sin embargo, la duplicación de user stories dentro de EPIC-GAM-BACKEND y EPIC-GAM-FRONTEND entre la raíz y `_archived/` es redundante.

---

### 3. TASK-* Explosion

**Conteo total de TASK-* directories:** 596

**Patron de organización:**
Cada TASK-* es un directorio que contiene exactamente 1 archivo `.md` con el mismo nombre que el directorio:
```
tasks/TASK-ANA-001-F1-BACKEND-01/
  TASK-ANA-001-F1-BACKEND-01.md   <- único archivo
```

**Patron de densidad por US (US-ANA-001 como muestra):**
- F0-DATABASE: 2 TASK dirs
- F1-BACKEND: 6 TASK dirs
- F2-FRONTEND: 6 TASK dirs
- F4-TEST: 4 TASK dirs
- **Total por US:** ~18 TASK dirs

**Profundidad de jerarquía resultante:**
```
docs/10-requirements/
  epics/                                          <- nivel 1
    EPIC-GAM-F1-ANALYTICS/                        <- nivel 2
      user-stories/                               <- nivel 3
        US-ANA-001/                               <- nivel 4
          tasks/                                  <- nivel 5
            TASK-ANA-001-F1-BACKEND-01/           <- nivel 6
              TASK-ANA-001-F1-BACKEND-01.md       <- nivel 7 (archivo)
```

**Análisis del patron:**
El patrón TASK-dir/TASK.md (directorio wrapping un único archivo) genera 596 directorios donde la mayoría contienen exactamente 1 archivo .md. Esta estructura fue diseñada para permitir que cada TASK tenga sub-artefactos (evidencias, screenshots, archivos adicionales) pero en la práctica todos los TAX dirs contienen solo 1 archivo.

**Excepcion notable:** `US-VAL-008` en EPIC-GAM-F4-VALIDATION no sigue el patrón `tasks/TASK-*/` sino que coloca los TASK dirs directamente dentro del directorio de la US (1 nivel menos de profundidad). Los 3 TASK dirs de VAL-008 están al mismo nivel que `US-VAL-008.md`.

**Impacto:**
- 596 directorios para ~596 archivos TASK = ratio 1:1 directorio-por-archivo
- Los directorios de `tasks/` adicionales elevan el total a ~1,045 directorios totales
- La profundidad de 7 niveles hace imposible la navegación manual sin herramientas

---

### 4. _archived/ (raíz de 10-requirements)

**Ruta:** `docs/10-requirements/_archived/`
**Total:** 18 archivos .md en 4 subdirectorios

**Contenido:**
```
_archived/
  04-fase-backlog/                    <- 2 archivos (FUNCIONALIDADES + README)
  features/                           <- 4 archivos (_INDEX + 3 análisis de P3)
  sistema-recompensas/                <- 10 archivos (arquitectura histórica gamificación)
  user-stories/_MOVED.md              <- 1 stub de redirect
```

**Análisis por subdirectorio:**
- `04-fase-backlog/`: Duplica lo que está en `epics/04-fase-backlog/` — mismo contenido en dos lugares
- `features/`: Análisis de "features estratégicas P3" y decisiones. Valor histórico, no referenciado activamente
- `sistema-recompensas/`: Documentación técnica pre-implementación del sistema de gamificación (arquitectura, flujos, endpoints, BD, tests, seeds). 10 archivos de valor histórico alto
- `user-stories/_MOVED.md`: Stub redirect — indica que los user stories fueron movidos

**Conclusion:** El `_archived/` raíz está bien organizado. Los 18 archivos son legitimamente archivo histórico. El único problema es la duplicación del directorio `04-fase-backlog/` que aparece tanto en `_archived/` como en `epics/`.

---

## Estructura Top-Level

```
docs/10-requirements/
  _archived/           <- 18 archivos, archivo histórico válido
  _INDEX.md            <- índice maestro
  _MAP.md              <- mapa de navegación
  epics/               <- 34 EPICs + 2 legacy + 1 wave-3 = 1,572 archivos
  features/            <- 4 archivos (análisis P3 activos)
  README.md
  testing-guides/      <- 1 archivo (redirect stub, contenido movido a docs/50-guides/)
  VISION-ALCANCE.md
```

**Dimensiones de epics/:**
- Wave 3 técnicas: 11 EPICs (todas completadas, en `_wave-3-technical/`)
- F1 funcionales: 7 EPICs (todas completadas)
- F2 funcionales: 3 EPICs (todas completadas)
- F3 funcionales: 12 EPICs (4 completadas, 1 en progreso, 7 planned)
- F4 validación: 1 EPIC (en progreso)
- Legacy bridge: `03-desarrollo/` + `04-fase-backlog/` (solo redirects)
- Total: **34 EPICs activas** + 2 legacy bridges

---

## Recomendaciones

### ARCHIVE (mover a _archived/ o eliminar)

1. **`docs/10-requirements/testing-guides/`** — Solo contiene un README de redirect. El contenido vive en `docs/50-guides/testing/`. El directorio puede eliminarse o reducirse a un stub más obvio.

2. **`docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-BACKEND/_archived/`** — Duplicación exacta de los user stories que ya están en la raíz de `EPIC-GAM-BACKEND/`. Los archivos `US-GAM-*.md` aparecen en ambas rutas. El `_archived/` interno es redundante.

3. **`docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-FRONTEND/_archived/`** — Mismo problema: user stories duplicados entre raíz y `_archived/`.

4. **`docs/10-requirements/_archived/04-fase-backlog/`** — Duplicado exacto de `docs/10-requirements/epics/04-fase-backlog/`. Un solo lugar es suficiente; el canónico debería ser `epics/04-fase-backlog/` (más cercano al contexto).

### FLATTEN (aplanar estructura)

5. **Patrón TASK-dir/TASK.md** — Los 596 directorios TASK que contienen un único archivo .md podrían aplanarse a `tasks/TASK-NAME.md` directo (sin subdirectorio). Esto reduciría el conteo de directorios de ~1,045 a ~450 y la profundidad máxima de 7 a 6 niveles. **Precaución:** requiere actualizar todas las referencias en _INDEX.md y TRACEABILITY_MATRIX.yml.

6. **`docs/10-requirements/epics/_wave-3-technical/`** — Si no se necesita navegación activa, puede moverse completamente a `docs/10-requirements/_archived/wave-3-technical/`. Reduce el ruido en `epics/` que mezcla histórico con activo. El `_INDEX.md` ya lo referencia como "COMPLETADAS".

### KEEP (mantener sin cambios)

7. **`docs/10-requirements/_archived/sistema-recompensas/`** — 10 archivos de arquitectura histórica del sistema de recompensas. Valor documental alto para entender decisiones de diseño.

8. **`docs/10-requirements/_archived/features/`** — Análisis de features P3 estratégicas. Útil como contexto para epics F3 planned.

9. **`docs/10-requirements/epics/03-desarrollo/`** y **`epics/04-fase-backlog/`** (los de `epics/`) — Los redirects legacy son necesarios mientras existan links externos o historia de git que los referencie. Son baratos (1-2 archivos cada uno).

10. **`docs/10-requirements/features/`** — 4 archivos activos de análisis estratégico P3, referenciados desde los epics F3 planned.

11. **`docs/10-requirements/epics/_wave-3-technical/`** (contenido EPIC.md principal) — Los EPIC.md de las 11 EPICs completadas son referencia histórica válida y son referenciados desde el `_INDEX.md` principal de epics.

---

## Impacto de la Explosión de Directorios

| Causa | Dirs generados | % del total |
|-------|----------------|-------------|
| TASK-*/TASK.md wrapping | ~596 | 57% |
| tasks/ intermedios | ~170 | 16% |
| user-stories/ intermedios | ~170 | 16% |
| EPIC dirs y resto | ~109 | 10% |
| **Total** | **~1,045** | **100%** |

La principal causa del volumen es el patrón TASK-dir/TASK.md, que representa 57% de todos los directorios. El aplanamiento de este patrón es la intervención de mayor impacto potencial.

---

*Generado por análisis READ-ONLY — sin modificaciones al codebase*
*Fecha: 2026-02-28 | Tarea: TASK-2026-02-28-DOC-AUDIT*
