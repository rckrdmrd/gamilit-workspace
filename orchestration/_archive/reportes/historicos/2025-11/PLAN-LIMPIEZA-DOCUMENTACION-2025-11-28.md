# PLAN DE LIMPIEZA Y CONSOLIDACIÓN DE DOCUMENTACIÓN

**Fecha:** 2025-11-28
**Basado en:** REPORTE-ANALISIS-DOCUMENTACION-2025-11-28.md
**Objetivo:** Sintetizar, actualizar y alinear toda la documentación
**Esfuerzo Total Estimado:** 84 horas

---

## ESTRATEGIA GENERAL

### Principios de Limpieza

1. **Fuente Única de Verdad** - Cada concepto documentado en UN solo lugar
2. **Actualización vs Eliminación** - Actualizar primero, eliminar solo si es redundante
3. **Consistencia de Versiones** - Todo debe reflejar estado actual (v2.3.0 gamificación, v6.5 diseño)
4. **Navegabilidad** - Cada carpeta con _MAP.md o README.md descriptivo
5. **Módulos 1-3 Primero** - Documentación alineada solo con lo implementado

### Fases de Ejecución

```
FASE A: Limpieza Crítica (P0)     → Semana 1    → 48h
FASE B: Consolidación (P1)        → Semana 2    → 24h
FASE C: Mejoras Menores (P2)      → Semana 3    → 12h
FASE D: Validación Final          → Día final   → 4h
```

---

## FASE A: LIMPIEZA CRÍTICA (P0) - 48 HORAS

### A.1: Actualizar Especificaciones Gamificación (4h)

**Objetivo:** Sincronizar ET-GAM-* con sistema v2.3.0

**Archivos a modificar:**
- `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-001-achievements.md`
- `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-002-comodines.md`
- `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-ranks.md`

**Cambios requeridos:**
1. Actualizar versión de v1.1 a v2.3.0
2. Sincronizar costos ML Coins con BD actual
3. Sincronizar umbrales XP con BD actual (K'uk'ulkan = 1,900 XP)
4. Referenciar docs/sistema-recompensas/ como fuente de evolución

**Agente:** Architecture-Analyst (yo directamente - documentación)

**Criterios de aceptación:**
- [ ] Versión dice v2.3.0
- [ ] Costos coinciden con DDL
- [ ] XP thresholds coinciden con seeds

---

### A.2: Mover Módulos 4-5 a Backlog (2h)

**Objetivo:** Separar contenido implementado vs pendiente

**Acciones:**
1. Crear `docs/04-fase-backlog/MODULO-4-LECTURA-DIGITAL.md`
   - Copiar secciones de DocumentoDeDiseño líneas 782-960
   - Agregar nota: "EN BACKLOG - Requiere IA/Visión Computacional"

2. Crear `docs/04-fase-backlog/MODULO-5-PRODUCCION.md`
   - Copiar secciones de DocumentoDeDiseño líneas 963-1110
   - Agregar nota: "EN BACKLOG - Requiere evaluación creativa"

3. Editar `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`
   - Líneas 782-1110: Reemplazar con referencia a backlog
   - Mantener solo Módulos 1-3 con descripción completa

4. Actualizar README.md de 04-fase-backlog para referenciar nuevos archivos

**Agente:** Architecture-Analyst (yo directamente - documentación)

**Criterios de aceptación:**
- [ ] Módulos 4-5 en carpeta backlog
- [ ] DocumentoDeDiseño solo tiene M1-M3 completos
- [ ] Referencias cruzadas funcionan

---

### A.3: Crear Guías de Desarrollo Backend (12h)

**Objetivo:** Completar 7 guías críticas faltantes

**Archivos a crear:**

| Archivo | Contenido | Prioridad |
|---------|-----------|-----------|
| `backend/ESTRUCTURA-MODULOS.md` | Descripción de 11 módulos, dependencias, propósito | Crítico |
| `backend/ESTRUCTURA-SHARED.md` | Utils, guards, decorators, interceptors compartidos | Alto |
| `backend/DATABASE-INTEGRATION.md` | TypeORM entities, repositories, migrations | Alto |
| `backend/API-CONVENTIONS.md` | Formato responses, errores, paginación | Medio |
| `backend/SETUP-DEVELOPMENT.md` | Instalación, configuración local, env vars | Medio |
| `backend/ERROR-HANDLING.md` | Manejo de errores, excepciones, logging | Medio |
| `backend/TESTING-GUIDE.md` | Jest, E2E tests, mocking | Medio |

**Agente a orquestar:** Task con PROMPT-BACKEND-AGENT.md
- Leer código actual en apps/backend/src/
- Generar documentación basada en implementación real
- Incluir ejemplos de código

**Criterios de aceptación:**
- [ ] 7 archivos creados
- [ ] Cada archivo mínimo 100 líneas
- [ ] Ejemplos de código incluidos
- [ ] Referencias a archivos reales

---

### A.4: Crear Guías de Desarrollo Frontend (12h)

**Objetivo:** Completar 7 guías críticas faltantes

**Archivos a crear:**

| Archivo | Contenido | Prioridad |
|---------|-----------|-----------|
| `frontend/ESTRUCTURA-FEATURES.md` | 15 features, componentes principales, navegación | Crítico |
| `frontend/ESTRUCTURA-SHARED.md` | Componentes compartidos, hooks, utils | Alto |
| `frontend/COMPONENTES-UI.md` | Design system, Tailwind, shadcn/ui | Alto |
| `frontend/STATE-MANAGEMENT.md` | Zustand stores, React Query | Medio |
| `frontend/API-INTEGRATION.md` | Axios clients, servicios API | Medio |
| `frontend/SETUP-DEVELOPMENT.md` | Instalación, configuración local | Medio |
| `frontend/TESTING-GUIDE.md` | Vitest, Testing Library | Medio |

**Agente a orquestar:** Task con PROMPT-FRONTEND-AGENT.md
- Leer código actual en apps/frontend/src/
- Generar documentación basada en implementación real
- Incluir ejemplos de código

**Criterios de aceptación:**
- [ ] 7 archivos creados
- [ ] Cada archivo mínimo 100 líneas
- [ ] Ejemplos de código incluidos
- [ ] Referencias a archivos reales

---

### A.5: Consolidar 90-transversal (8h)

**Objetivo:** Reducir densidad y mejorar navegabilidad

**Acciones:**

1. **Crear carpeta archive/**
   - Mover análisis temporales con fechas (34 archivos de 2025-11-24)
   - Mantener README explicando propósito de archive

2. **Consolidar archivos de inicialización usuarios:**
   - DIAGRAMA-DEPENDENCIAS-INITIALIZE-USER-STATS.md
   - FLUJO-INICIALIZACION-USUARIO.md
   - ANALISIS-INICIALIZACION-USUARIOS-2025-11-24.md
   → Crear: `INICIALIZACION-USUARIOS-CONSOLIDADO.md`

3. **Actualizar _MAP.md:**
   - Distinguir claramente secciones: Inventarios | Sprints | Features | Archive
   - Agregar descripción de propósito de cada subcarpeta

4. **Crear INDICE-MAESTRO.md:**
   - Lista de archivos críticos vs temporales
   - Links directos a inventarios
   - Guía de navegación

**Agente:** Architecture-Analyst (yo directamente - documentación)

**Criterios de aceptación:**
- [ ] Carpeta archive/ creada con 30+ archivos movidos
- [ ] 3 archivos de inicialización consolidados en 1
- [ ] _MAP.md actualizado con navegación clara
- [ ] Tamaño de 90-transversal reducido 30%

---

### A.6: Resolver 98-standards (2h)

**Objetivo:** Eliminar confusión sobre ubicación de standards

**Acciones:**

1. Verificar si `orchestration/knowledge/standards/` existe
2. Si existe:
   - Mover `NAMING-CONVENTIONS-API.md` a esa ubicación
   - Eliminar carpeta `docs/98-standards/`
   - Actualizar referencias en otros docs
3. Si no existe:
   - Mover contenido a `docs/97-adr/` como ADR-018
   - O mover a `docs/95-guias-desarrollo/standards/`
   - Eliminar carpeta vacía

**Agente:** Architecture-Analyst (yo directamente)

**Criterios de aceptación:**
- [ ] Una sola ubicación para standards
- [ ] Sin referencias rotas

---

### A.7: Actualizar VISION.md (1h)

**Objetivo:** Reflejar estado real del proyecto

**Cambios:**
- Línea 17: "33 mecánicas" → "23 tipos de ejercicios implementados (Módulos 1-3)"
- Agregar sección: "Módulos 4-5 en Backlog"
- Actualizar porcentaje de completitud
- Agregar nota sobre K'uk'ulkan alcanzable con M1-M3

**Agente:** Architecture-Analyst (yo directamente)

---

### A.8: Crear Archivos Faltantes Fase 2 (4h)

**Objetivo:** Completar documentación de migración BD

**Archivos a crear:**

1. `docs/02-fase-robustecimiento/TIMELINE.yml`
   - Sprints de migración
   - Hitos completados
   - Métricas finales

2. `docs/02-fase-robustecimiento/tareas/01-migraciones/MIGRACIONES-HISTORICO.md`
   - Scripts ejecutados
   - Cambios de schema
   - Rollback procedures

**Agente a orquestar:** Task con PROMPT-DATABASE-AGENT.md
- Leer DDL actual en apps/database/
- Documentar evolución del schema

---

## FASE B: CONSOLIDACIÓN (P1) - 24 HORAS

### B.1: Expandir EAI-004 Documentación (3h)

**Objetivo:** Documentar épica de analytics adecuadamente

**Acciones:**
1. Expandir `_MAP.md` de 14 a 100+ líneas
2. Crear `README.md` descriptivo
3. Documentar RF y ET si no existen
4. Listar dashboards y métricas implementadas

---

### B.2: Crear Especificaciones EAI-006 (4h)

**Objetivo:** Completar documentación retroactiva

**Archivos a crear:**
- `ET-SYS-001-feature-flags.md`
- `ET-SYS-002-system-settings.md`
- `ET-SYS-003-configuration-api.md`

---

### B.3: Generar Inventarios EAI-001 (3h)

**Objetivo:** Completar trazabilidad de implementación

**Archivos a crear:**
- `docs/01-fase-alcance-inicial/EAI-001-fundamentos/implementacion/DATABASE.yml`
- `docs/01-fase-alcance-inicial/EAI-001-fundamentos/implementacion/BACKEND.yml`
- `docs/01-fase-alcance-inicial/EAI-001-fundamentos/implementacion/FRONTEND.yml`

---

### B.4: Corregir Referencias Relativas (2h)

**Objetivo:** Arreglar links rotos en EAI-001 a EAI-006

**Acciones:**
1. Buscar todas las referencias con patrón `../../02-especificaciones-tecnicas/`
2. Reemplazar con rutas correctas `../especificaciones/`
3. Validar que todos los links funcionen

---

### B.5: Crear ADR Multiplicador ML Coins (1h)

**Objetivo:** Documentar decisión de diferir implementación

**Archivo:** `docs/97-adr/ADR-018-ml-coins-multiplier-deferred.md`

**Contenido:**
- Contexto: Multiplicador documentado pero no implementado
- Decisión: Diferir a fase futura
- Consecuencias: Simplifica MVP, feature futura clara

---

### B.6: Consolidar Guías Pruebas M3 (1h)

**Objetivo:** Eliminar duplicado

**Acciones:**
1. Comparar contenido de ambos archivos
2. Mantener versión más completa
3. Eliminar duplicado
4. Actualizar referencias

---

### B.7: Crear Cheatsheets Faltantes (10h)

**Objetivo:** Completar quick-reference

**Archivos a crear:**
- `GIT-CHEATSHEET.md` (2h) - Comandos comunes, branching, PR workflow
- `TESTING-CHEATSHEET.md` (3h) - Jest, Vitest, comandos de test
- `DOCKER-CHEATSHEET.md` (2h) - Comandos Docker, compose
- `DEPLOYMENT-CHEATSHEET.md` (3h) - Deploy procedures, rollback

---

## FASE C: MEJORAS MENORES (P2) - 12 HORAS

### C.1: Renumerar ADR-012 (1h)

**Acciones:**
- ADR-012-automatic-user-initialization-trigger.md → mantener como ADR-012
- ADR-012-removal-migrations-folders.md → renombrar a ADR-019
- ADR-012-runtime-validation-zod.md → renombrar a ADR-020
- ADR-012-validacion-ejercicio.md → renombrar a ADR-021

---

### C.2: Consolidar Carpetas BD (1h)

**Acciones:**
1. En `docs/95-guias-desarrollo/`:
   - Eliminar `base-de-datos/` si está vacía
   - Mantener `database/` con contenido
   - O viceversa, mantener la que tenga contenido

---

### C.3: Mover api-architecture.md (30min)

**Acciones:**
- De: `docs/frontend/api-architecture.md`
- A: `docs/95-guias-desarrollo/frontend/ARQUITECTURA-API-CLIENTS.md`
- Eliminar carpeta `docs/frontend/` si queda vacía

---

### C.4: Resolver docs/database/ (30min)

**Acciones:**
- Mover README educativo a `docs/90-transversal/` como referencia
- Eliminar carpeta vacía `docs/database/`

---

### C.5: Consolidar Archivos con Fechas (6h)

**Objetivo:** Reducir 60 archivos versionados a versiones finales

**Proceso:**
1. Identificar archivos con patrón `*-2025-11-*.md`
2. Para cada grupo de archivos del mismo tipo:
   - Mantener versión más reciente
   - Archivar anteriores en `archive/`
3. Actualizar referencias

**Grupos principales:**
- REPORTE-VALIDACION-* (6+ versiones)
- ANALISIS-* (10+ versiones)
- CORRECCION-* (8+ versiones)

---

### C.6: Revisar Carpetas Vacías (3h)

**Objetivo:** Llenar o eliminar 32 carpetas vacías

**Proceso:**
1. Listar todas las carpetas vacías
2. Para cada una:
   - Si tiene propósito definido: crear placeholder README.md
   - Si no tiene propósito: eliminar
3. Actualizar _MAP.md correspondientes

---

## FASE D: VALIDACIÓN FINAL - 4 HORAS

### D.1: Verificar Referencias Cruzadas (2h)

**Acciones:**
1. Script para buscar links rotos en .md
2. Verificar que todas las referencias a otros docs funcionen
3. Corregir cualquier link roto encontrado

---

### D.2: Validar Consistencia de Versiones (1h)

**Acciones:**
1. Verificar que todos los ET-GAM-* digan v2.3.0
2. Verificar que DocumentoDeDiseño solo tenga M1-M3
3. Verificar que VISION.md diga "23 tipos"
4. Verificar que backlog tenga M4-M5

---

### D.3: Generar Reporte Final (1h)

**Entregables:**
- `REPORTE-LIMPIEZA-COMPLETADA-2025-11-XX.md`
- Métricas antes/después
- Lista de cambios realizados
- Validación de criterios de éxito

---

## MATRIZ DE AGENTES A ORQUESTAR

| Tarea | Agente | Tipo | Dependencias |
|-------|--------|------|--------------|
| A.1 | Architecture-Analyst | Directo | Ninguna |
| A.2 | Architecture-Analyst | Directo | Ninguna |
| A.3 | Backend-Agent | Task Tool | Ninguna |
| A.4 | Frontend-Agent | Task Tool | Ninguna |
| A.5 | Architecture-Analyst | Directo | Ninguna |
| A.6 | Architecture-Analyst | Directo | Ninguna |
| A.7 | Architecture-Analyst | Directo | A.2 |
| A.8 | Database-Agent | Task Tool | Ninguna |
| B.1-B.7 | Architecture-Analyst | Directo | Fase A |
| C.1-C.6 | Architecture-Analyst | Directo | Fase B |
| D.1-D.3 | Architecture-Analyst | Directo | Fase C |

---

## ORDEN DE EJECUCIÓN

### Paralelo (Grupo 1) - Sin dependencias
- A.1: Actualizar ET-GAM-*
- A.2: Mover Módulos 4-5
- A.3: Crear guías backend
- A.4: Crear guías frontend
- A.5: Consolidar 90-transversal

### Secuencial (Grupo 2) - Depende de Grupo 1
- A.6: Resolver 98-standards
- A.7: Actualizar VISION.md (después de A.2)
- A.8: Crear archivos Fase 2

### Secuencial (Grupo 3) - Depende de Grupo 2
- B.1-B.7: Consolidación

### Secuencial (Grupo 4) - Depende de Grupo 3
- C.1-C.6: Mejoras menores

### Final (Grupo 5) - Depende de todo
- D.1-D.3: Validación

---

## CRITERIOS DE ÉXITO GLOBALES

| Métrica | Antes | Después (Objetivo) |
|---------|-------|-------------------|
| Archivos totales | 410 | ~300 |
| Carpetas vacías | 32 | 0 |
| Archivos con fechas | 60 | 10 (solo activos) |
| Guías desarrollo | 43% | 100% |
| Especificaciones actualizadas | 0% | 100% |
| Módulos documentados (implementados) | M1-M5 mezclados | M1-M3 claros |
| Navegabilidad | Difícil | Fácil |
| Tiempo búsqueda info | >5min | <1min |

---

**Plan creado por:** Architecture-Analyst
**Fecha:** 2025-11-28
**Estado:** Pendiente aprobación para ejecución
