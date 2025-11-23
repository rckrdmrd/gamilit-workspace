# 📋 DIRECTIVA DE DOCUMENTACIÓN OBLIGATORIA

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Versión:** 1.0.0
**Fecha:** 2025-11-17
**Aplicable a:** Todos los agentes (Database, Backend, Frontend, especializados)
**Autoridad:** Tech Lead / Project Owner
**Estado:** OBLIGATORIO - Política permanente del proyecto

---

## 🎯 OBJETIVO

**Mantener TODA la documentación actualizada en tiempo real con el avance real del proyecto.**

Esta directiva establece la **obligatoriedad** de actualizar documentación en **cada tarea ejecutada**, sin excepciones.

---

## 🚨 PRINCIPIO FUNDAMENTAL

> **"Si no está documentado, no existe"**

### Corolarios:

1. **Todo cambio genera documentación actualizada**
2. **No hay tarea completa sin documentación**
3. **La documentación refleja el 100% de la realidad**
4. **La documentación es parte del deliverable, no un extra**

---

## 📚 DIMENSIONES DE DOCUMENTACIÓN OBLIGATORIA

### 1. CÓDIGO Y TÉCNICA

**¿Qué documentar?**
- DDL con comentarios SQL (`COMMENT ON TABLE`, `COMMENT ON COLUMN`)
- Código Backend con JSDoc completo
- Código Frontend con TSDoc
- APIs documentadas con Swagger/OpenAPI
- Tipos TypeScript documentados

**¿Dónde?**
- `apps/database/ddl/**/*.sql` (comentarios SQL)
- `apps/backend/src/**/*.ts` (JSDoc)
- `apps/frontend/web/src/**/*.tsx` (TSDoc)
- `apps/frontend/mobile/src/**/*.tsx` (TSDoc)
- Swagger en controllers (`@ApiOperation`, `@ApiResponse`)

**¿Cuándo actualizar?**
- **SIEMPRE** al crear/modificar:
  - Tablas, columnas, funciones, triggers
  - Entities, DTOs, Services, Controllers
  - Componentes, Pages, Stores
- **ANTES de commit**

**Criterios de aceptación:**
- ✅ Toda tabla tiene `COMMENT ON TABLE`
- ✅ Columnas críticas tienen `COMMENT ON COLUMN`
- ✅ Toda entity tiene JSDoc con `@description`, `@see DDL`
- ✅ Todo DTO tiene `@ApiProperty` con descripción
- ✅ Todo componente complejo tiene TSDoc
- ✅ Toda página tiene descripción de propósito y ruta

**Ejemplo DDL:**
```sql
-- Comentar tabla
COMMENT ON TABLE educational_content.modules IS
    'Módulos educativos de la plataforma GAMILIT - Contiene los módulos de aprendizaje (rutas Maya, actividades gamificadas)';

-- Comentar columnas importantes
COMMENT ON COLUMN educational_content.modules.code IS
    'Código único del módulo (ej: MOD-MAYA-001). Usado para reportes y referencias externas';
COMMENT ON COLUMN educational_content.modules.difficulty_level IS
    'Nivel de dificultad: beginner=principiante, intermediate=intermedio, advanced=avanzado, expert=experto';
```

**Ejemplo Entity (JSDoc):**
```typescript
/**
 * Entity para Módulos Educativos de GAMILIT
 *
 * Representa los módulos de aprendizaje en la plataforma:
 * Módulos → Actividades → Desafíos → Recompensas
 *
 * Un módulo puede contener múltiples actividades gamificadas,
 * cada una con desafíos y recompensas para los estudiantes.
 *
 * @see apps/database/ddl/schemas/educational_content/tables/01-modules.sql
 * @see docs/01-requerimientos/R-002-modulos-educativos.md
 */
@Entity({ schema: 'educational_content', name: 'modules' })
export class ModuleEntity {
    /**
     * Código único del módulo educativo
     * @example "MOD-MAYA-001"
     */
    @Column({ type: 'varchar', length: 50, unique: true })
    @IsNotEmpty()
    @ApiProperty({ description: 'Código único del módulo', example: 'MOD-MAYA-001' })
    code: string;
}
```

---

### 2. PLANEACIÓN

**¿Qué documentar?**
- Planes de implementación
- Ciclos de ejecución desglosados
- Estimaciones de tiempo
- Dependencias identificadas
- Riesgos y mitigaciones

**¿Dónde?**
- `orchestration/agentes/{grupo}/{TAREA-ID}/02-PLAN.md`
- `orchestration/trazas/TRAZA-REQUERIMIENTOS.md`

**¿Cuándo actualizar?**
- **ANTES** de ejecutar cualquier tarea compleja (>3 pasos)
- Al identificar cambios en scope/dependencias

**Template:** [TEMPLATE-PLAN.md](../templates/TEMPLATE-PLAN.md)

**Criterios de aceptación:**
- ✅ Plan detallado con ciclos desglosados
- ✅ Estimaciones de duración
- ✅ Dependencias listadas
- ✅ Criterios de aceptación claros
- ✅ Riesgos identificados y mitigaciones

---

### 3. EJECUCIÓN Y VALIDACIÓN

**¿Qué documentar?**
- Log de ejecución por ciclo
- Decisiones tomadas durante implementación
- Problemas encontrados y soluciones
- Cambios de plan (si los hay)
- Validaciones realizadas con resultados

**¿Dónde?**
- `orchestration/agentes/{grupo}/{TAREA-ID}/03-EJECUCION.md`
- `orchestration/agentes/{grupo}/{TAREA-ID}/04-VALIDACION.md`

**¿Cuándo actualizar?**
- **DURANTE** la ejecución (por ciclo completado)
- **INMEDIATAMENTE** después de cada validación
- **ANTES** de marcar tarea como completada

**Criterios de aceptación:**
- ✅ Cada ciclo documentado (inicio, fin, duración real)
- ✅ Archivos creados/modificados listados
- ✅ Problemas encontrados documentados con soluciones
- ✅ Validaciones con resultados (PASS/FAIL)
- ✅ Comandos de validación ejecutados

**Ejemplo:**
```markdown
### Ciclo 2: Backend Entities ✅
**Inicio:** 2025-11-17 11:00
**Fin:** 2025-11-17 12:30
**Duración:** 1h 30min (estimado: 1h 30min) ✅

#### Tareas Completadas
- [x] Crear ModuleEntity
- [x] Crear ActivityEntity
- [x] Configurar relaciones OneToMany/ManyToOne
- [x] Validar TypeScript compilation

#### Archivos Creados
- apps/backend/src/modules/educational-content/entities/module.entity.ts
- apps/backend/src/modules/educational-content/entities/activity.entity.ts

#### Validación
```bash
$ cd apps/backend && npm run build
✅ Compilación exitosa sin errores
```

#### Problemas Encontrados
- Ninguno

#### Notas
- Relación projects → developments configurada con cascade: true para facilitar eliminación
```

---

### 4. INVENTARIOS

**¿Qué documentar?**
- Objetos de base de datos (schemas, tablas, funciones, triggers)
- Módulos y entities de backend
- Componentes y páginas de frontend
- **Relaciones entre capas** (DB → Backend → Frontend)
- Tests creados
- Dependencias entre módulos

**¿Dónde?**
- `orchestration/inventarios/MASTER_INVENTORY.yml` ⭐ (maestro unificado)
- `orchestration/inventarios/DATABASE_INVENTORY.yml`
- `orchestration/inventarios/BACKEND_INVENTORY.yml`
- `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- `orchestration/inventarios/DEPENDENCY_GRAPH.yml`

**¿Cuándo actualizar?**
- **INMEDIATAMENTE** después de crear/modificar objetos
- **ANTES** de marcar tarea como completada
- **AL FINAL** de cada día de trabajo (validar coherencia)

**Criterios de aceptación:**
- ✅ Inventario refleja 100% de realidad
- ✅ Relaciones DB-Backend-Frontend mapeadas
- ✅ Conteos actualizados (schemas, tablas, entities, etc.)
- ✅ Nuevos objetos listados con metadata completa
- ✅ Objetos eliminados removidos del inventario
- ✅ Dependencias identificadas

**Ejemplo MASTER_INVENTORY.yml:**
```yaml
modules:
  educational-content:
    status: ✅ Completo
    priority: P0
    phase: MVP
    completitud: 100%

    database:
      schema: educational_content
      tables:
        - name: modules
          file: apps/database/ddl/schemas/educational_content/tables/01-modules.sql
          columns: 15
          indexes: 4
          triggers: 1
          related_backend_entity: ModuleEntity
          related_frontend_pages: [ModulesPage, ModuleDetailPage]
          status: ✅ Completo

    backend:
      module_path: apps/backend/src/modules/educational-content
      entities:
        - name: ModuleEntity
          file: entities/module.entity.ts
          table: educational_content.modules
          relations: [activities, challenges]
          used_in_controllers: [ModuleController]
          used_in_services: [ModuleService]
          dto_count: 4
          status: ✅ Completo

    frontend:
      pages:
        - name: ModulesPage
          file: apps/frontend/web/src/apps/teacher/pages/ModulesPage.tsx
          routes: [/teacher/modules]
          components_used: [ModuleCard, ModuleList]
          stores_used: [moduleStore]
          api_endpoints: [GET /api/modules, POST /api/modules]
          status: ✅ Completo

    tests:
      coverage: 85%
      unit_tests: 8
      integration_tests: 3

    metrics:
      complexity: Media
      technical_debt: Bajo
```

---

### 5. TRAZAS (HISTORIAL)

**¿Qué documentar?**
- Cada tarea ejecutada (por grupo y por tipo)
- Fecha, estado, duración
- Archivos modificados/creados
- Impacto en otros módulos
- Próximos pasos

**¿Dónde?**
- `orchestration/trazas/TRAZA-TAREAS-DATABASE.md`
- `orchestration/trazas/TRAZA-TAREAS-BACKEND.md`
- `orchestration/trazas/TRAZA-TAREAS-FRONTEND.md`
- `orchestration/trazas/TRAZA-REQUERIMIENTOS.md`
- `orchestration/trazas/TRAZA-CORRECCIONES.md`
- `orchestration/trazas/TRAZA-BUGS.md`

**¿Cuándo actualizar?**
- **INMEDIATAMENTE** después de completar tarea
- **ANTES** de cerrar sesión de trabajo
- **NUNCA** dejar tareas sin documentar en TRAZA

**Criterios de aceptación:**
- ✅ Entrada en TRAZA para cada tarea completada
- ✅ Estado claro (✅ Completado, 🔄 En Progreso, ❌ Bloqueado)
- ✅ Archivos modificados listados con rutas completas
- ✅ Duración real vs estimada
- ✅ Próximos pasos identificados (si aplica)

**Ejemplo:**
```markdown
## [DB-005] Crear Módulo de Contenido Educativo

**Fecha:** 2025-11-17 09:00
**Estado:** ✅ Completado
**Duración:** 3h 45min (estimado: 4h)
**Agente responsable:** Database-Agent
**Relacionado con:** [REQ-002], [BE-008], [FE-010]

### Descripción
Creado schema educational_content completo con jerarquía
Módulo → Actividad → Desafío → Recompensa

### Archivos Creados
- apps/database/ddl/schemas/educational_content/00-schema.sql
- apps/database/ddl/schemas/educational_content/tables/01-modules.sql
- apps/database/ddl/schemas/educational_content/tables/02-activities.sql
- apps/database/ddl/schemas/educational_content/tables/03-challenges.sql
- apps/database/ddl/schemas/educational_content/tables/04-rewards.sql
- apps/database/ddl/schemas/educational_content/functions/01-calculate_progress.sql
- apps/database/seeds/dev/educational_content/01-modules.sql

### Objetos Creados
- **Schema:** educational_content
- **Tablas:** 4 (modules, activities, challenges, rewards)
- **Funciones:** 1 (calculate_progress)
- **Triggers:** 2 (updated_at en modules y activities)
- **Índices:** 12

### Validación
```bash
$ ./apps/database/create-database.sh
✅ Schema creado exitosamente
✅ 4 tablas creadas
✅ 12 índices creados
✅ Seeds cargados (5 módulos, 10 actividades)
```

### Impacto
- **Schemas afectados:** educational_content (nuevo)
- **Módulos Backend afectados:** Ninguno (aún no existen)
- **Próximos pasos:**
  1. Backend-Agent: Crear entities (ModuleEntity, ActivityEntity, etc.)
  2. Backend-Agent: Crear services y controllers
  3. Frontend-Agent: Crear páginas y componentes
```

---

### 6. README Y GUÍAS

**¿Qué documentar?**
- README.md de cada stack (Database, Backend, Frontend)
- Guías de instalación y configuración
- Guías de desarrollo
- Convenciones de código
- CHANGELOG

**¿Dónde?**
- `apps/database/README.md`
- `apps/backend/README.md`
- `apps/frontend/web/README.md`
- `apps/frontend/mobile/README.md`
- `docs/03-desarrollo/*.md`

**¿Cuándo actualizar?**
- **CUANDO** cambia estructura de proyecto
- **CUANDO** se agregan nuevos scripts/comandos
- **CUANDO** cambian dependencias o configuración
- **AL MENOS** cada 2 semanas (validar vigencia)

**Criterios de aceptación:**
- ✅ README refleja estructura actual
- ✅ Comandos documentados funcionan
- ✅ Guías de instalación actualizadas
- ✅ Versión actualizada en package.json

---

## 🔄 FLUJO DE ACTUALIZACIÓN OBLIGATORIA

### Por Cada Tarea Ejecutada

```
┌─────────────────────────────────────────┐
│ 1. ANTES DE EJECUTAR                    │
│    ✅ Crear plan (02-PLAN.md)           │
│    ✅ Consultar inventarios             │
│    ✅ Validar anti-duplicación          │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. DURANTE EJECUCIÓN                    │
│    ✅ Documentar por ciclo              │
│    ✅ Agregar comentarios en código     │
│    ✅ Actualizar _MAP.md si aplica      │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. DESPUÉS DE EJECUTAR                  │
│    ✅ Documentar ejecución completa     │
│    ✅ Validar cambios                   │
│    ✅ Generar resumen (05-DOC.md)       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. ACTUALIZAR INVENTARIOS Y TRAZAS      │
│    ✅ MASTER_INVENTORY.yml              │
│    ✅ TRAZA-TAREAS-{GRUPO}.md           │
│    ✅ TRAZA-{TIPO}.md (si aplica)       │
│    ✅ README si cambió                  │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 5. VALIDAR COHERENCIA                   │
│    ✅ Inventario vs realidad (100%)     │
│    ✅ TRAZA completa                    │
│    ✅ Sin documentación pendiente       │
└─────────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE DOCUMENTACIÓN OBLIGATORIA

### Antes de Marcar Tarea como Completada

**Código:**
- [ ] Comentarios SQL en DDL (`COMMENT ON TABLE/COLUMN`)
- [ ] JSDoc en entities/services/controllers
- [ ] TSDoc en componentes/páginas
- [ ] Swagger decorators en controllers
- [ ] Comentarios inline en lógica compleja

**Documentación de Tarea:**
- [ ] 01-ANALISIS.md (si tarea compleja >3 pasos)
- [ ] 02-PLAN.md creado
- [ ] 03-EJECUCION.md documentado por ciclo
- [ ] 04-VALIDACION.md con resultados
- [ ] 05-DOCUMENTACION.md

**Inventarios:**
- [ ] MASTER_INVENTORY.yml actualizado
- [ ] {TIPO}_INVENTORY.yml actualizado (si aplica)
- [ ] Relaciones DB-Backend-Frontend mapeadas
- [ ] Conteos correctos

**Trazas:**
- [ ] Entrada en TRAZA-TAREAS-{GRUPO}.md
- [ ] Entrada en TRAZA-{TIPO}.md (si aplica: REQ, BUG, FEATURE)
- [ ] Estado actualizado
- [ ] Archivos modificados listados
- [ ] Próximos pasos identificados

**README y Guías:**
- [ ] README.md actualizado (si cambió estructura)
- [ ] Guías actualizadas (si cambió instalación/deploy)

**Validación Final:**
- [ ] Documentación refleja 100% la realidad
- [ ] No hay discrepancias entre docs e implementación
- [ ] No hay TODOs pendientes en documentación

---

## 🚨 CONSECUENCIAS DE NO DOCUMENTAR

### Advertencias

1. **Primera omisión:** Recordatorio y corrección inmediata
2. **Segunda omisión:** Revisión completa de documentación generada
3. **Tercera omisión:** Tarea marcada como INCOMPLETA hasta documentar

### Impacto de No Documentar

- ❌ Pérdida de contexto para futuros agentes
- ❌ Imposibilidad de validar coherencia
- ❌ Duplicación de objetos/código
- ❌ Decisiones tomadas sin contexto completo
- ❌ Imposibilidad de onboarding de nuevos desarrolladores
- ❌ Pérdida de trazabilidad
- ❌ **Proyecto técnicamente incompleto**

---

## 📊 MÉTRICAS DE CALIDAD DE DOCUMENTACIÓN

### Objetivos de Calidad

| Métrica | Objetivo | Crítico |
|---------|----------|---------|
| Inventario vs Realidad | 100% | 95% |
| TRAZA completa (todas las tareas) | 100% | 98% |
| Comentarios SQL en tablas | 100% | 90% |
| JSDoc en entities/services | 100% | 95% |
| TSDoc en componentes principales | 90% | 80% |
| Swagger completo en APIs | 100% | 100% |
| README actualizado | 100% | 95% |

### Validación Periódica

**Semanal:**
- Validar que inventarios reflejan realidad
- Verificar que TRAZA tiene todas las tareas de la semana
- Code-Reviewer: Auditar documentación de código

**Por Sprint (2 semanas):**
- Validar coherencia docs/ ↔ código
- Actualizar README si cambió estructura
- Generar reporte de cobertura de documentación

**Mensual:**
- Auditoría completa de documentación (Policy-Auditor)
- Identificar gaps y corregir
- Actualizar guías desactualizadas

---

## 🎯 RESPONSABILIDADES POR ROL

### Database-Agent

**OBLIGATORIO actualizar:**
- ✅ MASTER_INVENTORY.yml (módulos con objetos DB)
- ✅ DATABASE_INVENTORY.yml (cada cambio en DDL)
- ✅ TRAZA-TAREAS-DATABASE.md (cada tarea)
- ✅ Comentarios SQL (`COMMENT ON`)
- ✅ apps/database/README.md (cambios estructura)

### Backend-Agent

**OBLIGATORIO actualizar:**
- ✅ MASTER_INVENTORY.yml (módulos con backend)
- ✅ BACKEND_INVENTORY.yml (cada módulo/entity/service)
- ✅ TRAZA-TAREAS-BACKEND.md (cada tarea)
- ✅ JSDoc en entities/DTOs/services
- ✅ Swagger decorators en controllers
- ✅ apps/backend/README.md (cambios estructura)

### Frontend-Agent

**OBLIGATORIO actualizar:**
- ✅ MASTER_INVENTORY.yml (módulos con frontend)
- ✅ FRONTEND_INVENTORY.yml (cada componente/página)
- ✅ TRAZA-TAREAS-FRONTEND.md (cada tarea)
- ✅ TSDoc en componentes complejos
- ✅ apps/frontend/web/README.md y mobile/README.md (cambios estructura)

### Todos los Agentes

**OBLIGATORIO:**
- ✅ Documentación de tarea (01-05.md en orchestration/agentes/)
- ✅ Actualizar inventarios correspondientes
- ✅ Actualizar TRAZA correspondiente
- ✅ Validar coherencia docs vs código

---

## 📚 REFERENCIAS

### Documentos Relacionados

- [PROMPT-AGENTES-PRINCIPALES.md](../prompts/PROMPT-AGENTES-PRINCIPALES.md) - Prompt maestro
- [POLITICAS-USO-AGENTES.md](./POLITICAS-USO-AGENTES.md) - Políticas de uso
- [orchestration/README.md](../README.md) - Índice de orchestration

### Herramientas de Validación

**Validar Inventario vs Realidad:**
```bash
# Database: Contar tablas reales
find apps/database/ddl -name "*.sql" -path "*/tables/*" | wc -l

# Backend: Contar entities reales
find apps/backend/src -name "*.entity.ts" | wc -l

# Frontend: Contar páginas reales
find apps/frontend -name "*Page.tsx" | wc -l

# Comparar con inventarios
grep "status: ✅" orchestration/inventarios/MASTER_INVENTORY.yml | wc -l
```

**Validar TRAZA completa:**
```bash
# Ver últimas tareas
tail -100 orchestration/trazas/TRAZA-TAREAS-DATABASE.md | grep "^## \["

# Verificar que no hay gaps en IDs
grep "^## \[DB-" orchestration/trazas/TRAZA-TAREAS-DATABASE.md
```

**Validar comentarios SQL:**
```bash
# Buscar tablas sin comentarios
grep -L "COMMENT ON TABLE" apps/database/ddl/schemas/*/tables/*.sql
```

---

## 🔄 PROCESO DE MEJORA CONTINUA

### Retroalimentación

Si detectas que:
- Documentación está desactualizada
- Inventarios no reflejan realidad
- Hay gaps en TRAZA
- README está obsoleto

**ACCIÓN INMEDIATA:**
1. Detener tarea actual
2. Corregir documentación
3. Validar coherencia
4. Documentar la corrección en TRAZA-CORRECCIONES.md
5. Continuar con tarea

### Mejoras a Esta Directiva

Esta directiva es un **documento vivo**. Si identificas:
- Nuevas dimensiones de documentación
- Mejores prácticas
- Herramientas de automatización

**ACCIÓN:**
1. Proponer cambio
2. Documentar en ADR (si es cambio significativo)
3. Actualizar esta directiva
4. Comunicar a todos los agentes

---

## ✅ ACEPTACIÓN DE DIRECTIVA

**Esta directiva es OBLIGATORIA y PERMANENTE.**

**Fecha efectiva:** 2025-11-17
**Revisión:** Mensual
**Próxima revisión:** 2025-12-17

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-17
**Creada por:** Claude Code
**Aprobada por:** Tech Lead / Project Owner
**Estado:** ✅ ACTIVA Y OBLIGATORIA
