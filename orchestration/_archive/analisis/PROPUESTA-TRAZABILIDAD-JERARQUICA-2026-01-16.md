# PROPUESTA: Trazabilidad Jerárquica Anidada
# ============================================================================

**Fecha:** 2026-01-16
**Autor:** Claude Opus 4.5
**Sistema:** SIMCO v4.0.0
**Proyecto:** GAMILIT

---

## RESUMEN EJECUTIVO

Propuesta para implementar trazabilidad de objetos directamente en la estructura de documentación Scrum, donde cada nivel de definición referencia los objetos que implementa, evitando duplicación y manteniendo una única fuente de verdad.

---

## MODELO ACTUAL vs PROPUESTO

### Modelo Actual (Centralizado)

```
EAI-003-gamificacion/
├── requerimientos/RF-GAM-001.md    # Tiene referencias a objetos (parcial)
├── historias-usuario/US-GAM-005.md # Sin referencias a objetos
├── tareas/                          # Sin referencias
└── implementacion/
    └── TRACEABILITY.yml            # 890 líneas - TODO centralizado
```

**Problemas:**
- TRACEABILITY.yml es muy grande (890 líneas)
- Duplica información que ya está en RF
- Difícil de mantener sincronizado
- Carga mucho contexto para agentes

### Modelo Propuesto (Jerárquico Anidado)

```
EAI-003-gamificacion/
├── _MAP.md                          # refs: {schemas: [gamification_system]}
├── requerimientos/
│   └── RF-GAM-001.md               # refs: {tablas: [...], funciones: [...]}
├── especificaciones/
│   └── ET-GAM-001.md               # refs: {services: [...], dtos: [...]}
├── historias-usuario/
│   └── US-GAM-005.md               # refs: {components: [...]}
└── tareas/
    └── TASK-XXX.md                 # refs: {files_modified: [...]}
```

**Beneficios:**
- Cada definición tiene sus objetos
- Sin archivo centralizado gigante
- Herencia jerárquica (US hereda de RF)
- Fácil de mantener

---

## NIVELES DE TRAZABILIDAD

### Nivel 1: Épica (_MAP.md)

```yaml
# En el frontmatter de _MAP.md
---
id: EAI-003
name: "Gamificación"
refs:
  schemas: ["gamification_system"]
  depends_on: ["EAI-001"]  # Épicas requeridas
  required_by: ["EAI-002", "EXT-004"]  # Épicas que dependen
---
```

**Responsabilidad:**
- Definir qué schema(s) de BD pertenece a esta épica
- Definir dependencias entre épicas (hacia arriba)

### Nivel 2: Requerimiento (RF-*.md)

```yaml
# En el frontmatter de RF-GAM-001.md
---
id: RF-GAM-001
title: "Sistema de Logros"
epic: EAI-003
refs:
  database:
    enums: ["achievement_type", "achievement_category"]
    tables: ["achievements", "user_achievements"]
    functions: ["check_and_unlock_achievement", "award_achievement_rewards"]
    triggers: ["trg_achievement_unlocked"]
  backend:
    module: "gamification"
    entities: ["achievement.entity.ts", "user-achievement.entity.ts"]
  # Frontend NO se define aquí - va en nivel más bajo (HU o ET)
---
```

**Responsabilidad:**
- Tablas, funciones, triggers de BD
- Entities de backend
- NO componentes frontend (nivel más bajo)

### Nivel 3: Especificación Técnica (ET-*.md)

```yaml
# En el frontmatter de ET-GAM-001.md
---
id: ET-GAM-001
title: "Implementación Achievements"
rf: RF-GAM-001  # Hereda objetos de RF
refs:
  backend:
    services: ["achievement.service.ts"]
    controllers: ["achievements.controller.ts"]
    dtos: ["unlock-achievement.dto.ts", "achievement-response.dto.ts"]
    listeners: ["achievement.listener.ts"]
---
```

**Responsabilidad:**
- Services, controllers, DTOs
- Lógica de implementación backend
- Hereda tablas/entities de RF padre

### Nivel 4: Historia de Usuario (US-*.md)

```yaml
# En el frontmatter de US-GAM-005.md
---
id: US-GAM-005
title: "Insignias básicas"
rf: RF-GAM-001  # Hereda objetos de RF
refs:
  frontend:
    components: ["AchievementGallery", "AchievementCard", "AchievementModal"]
    hooks: ["useAchievements"]
    stores: []  # Si usa store, lo referencia
  cross_refs:  # Referencias cruzadas a otras épicas
    - ref: "EAI-001/auth"
      reason: "Requiere usuario autenticado"
      objects: ["useAuth hook"]
---
```

**Responsabilidad:**
- Componentes frontend específicos de la HU
- Hooks, stores que implementa
- Referencias cruzadas a otras épicas

### Nivel 5: Tarea (TASK-*.md)

```yaml
# En el frontmatter de TASK-2026-01-16-001.md
---
id: TASK-2026-01-16-001
title: "Implementar AchievementGallery"
us: US-GAM-005  # Hereda contexto de HU
refs:
  files_created:
    - "apps/frontend/src/components/AchievementGallery.tsx"
    - "apps/frontend/src/components/AchievementGallery.test.tsx"
  files_modified:
    - "apps/frontend/src/pages/ProfilePage.tsx"
---
```

**Responsabilidad:**
- Archivos específicos creados/modificados
- Nivel más granular

---

## FLUJO DE HERENCIA

```
ÉPICA (EAI-003)
  └─ refs.schemas: [gamification_system]
      │
      ├─► REQUERIMIENTO (RF-GAM-001)
      │     └─ refs.database.tables: [achievements, user_achievements]
      │     └─ refs.backend.entities: [achievement.entity.ts]
      │         │
      │         ├─► ESPECIFICACIÓN (ET-GAM-001)
      │         │     └─ rf: RF-GAM-001 (hereda tablas/entities)
      │         │     └─ refs.backend.services: [achievement.service.ts]
      │         │
      │         └─► HISTORIA USUARIO (US-GAM-005)
      │               └─ rf: RF-GAM-001 (hereda tablas/entities)
      │               └─ refs.frontend.components: [AchievementGallery]
      │                   │
      │                   └─► TAREA (TASK-001)
      │                         └─ us: US-GAM-005 (hereda todo)
      │                         └─ refs.files_created: [AchievementGallery.tsx]
```

---

## REFERENCIAS CRUZADAS (Cross-Refs)

Cuando un objeto pertenece a otra épica:

```yaml
# En US-GAM-005.md (épica EAI-003)
refs:
  cross_refs:
    - source: "EAI-001/RF-AUTH-001"
      objects: ["profiles table", "authStore"]
      type: "depends_on"
      reason: "Achievements requieren usuario autenticado"

    - source: "EAI-004/RF-PROGRESS-001"
      objects: ["module_progress table"]
      type: "triggers"
      reason: "Completar módulo puede desbloquear achievement"
```

**Regla:** Las referencias cruzadas siempre apuntan HACIA ARRIBA (a otra épica o nivel superior).

---

## ARCHIVO DE REFERENCIA RÁPIDA (Opcional)

Para mantener acceso rápido sin cargar todos los archivos, se puede tener un índice generado:

```yaml
# orchestration/referencias/EPIC-OBJECTS-INDEX.yml
# Auto-generado desde frontmatters de documentación

EAI-003:
  schemas: ["gamification_system"]
  requirements:
    RF-GAM-001:
      tables: ["achievements", "user_achievements"]
      entities: ["achievement.entity.ts"]
    RF-GAM-002:
      tables: ["comodines_inventory", "comodin_usage_log"]
      entities: ["comodin.entity.ts"]
  # Consolidado para acceso rápido
```

**Nota:** Este archivo se genera automáticamente leyendo frontmatters. NO se edita manualmente.

---

## COMPARACIÓN: MODELO ACTUAL vs PROPUESTO

| Aspecto | Actual | Propuesto |
|---------|--------|-----------|
| Ubicación de trazabilidad | TRACEABILITY.yml (890 líneas) | Distribuida en cada archivo |
| Tamaño por archivo | 1 archivo grande | ~10-20 líneas extra por archivo |
| Mantenimiento | Difícil (sincronizar) | Fácil (junto a definición) |
| Duplicación | Alta (RF ya tiene refs) | Ninguna |
| Herencia | No hay | Jerárquica (US→RF→Épica) |
| Cross-refs | En archivo grande | En nivel más bajo |
| Generación índice | Manual | Auto-generado |
| Carga contexto agentes | Alto (890 líneas) | Bajo (~50 líneas/archivo) |

---

## IMPLEMENTACIÓN

### Fase 1: Definir Estructura de Frontmatter

```yaml
# Template estándar para cada nivel
---
id: "ID-ÚNICO"
title: "Título"
type: "Epic|Requirement|Specification|UserStory|Task"
parent: "ID-PADRE"  # Para herencia
status: "Draft|InProgress|Done"
refs:
  database: {}    # Solo en RF
  backend: {}     # En RF y ET
  frontend: {}    # En US
  cross_refs: []  # Cuando cruza épicas
---
```

### Fase 2: Migrar Desde TRACEABILITY.yml

1. Leer TRACEABILITY.yml existente
2. Distribuir referencias a cada archivo según nivel
3. Agregar frontmatter estructurado
4. Validar que toda información migró

### Fase 3: Crear Generador de Índice

Script que:
1. Lee todos los archivos con frontmatter
2. Extrae refs de cada uno
3. Genera EPIC-OBJECTS-INDEX.yml consolidado
4. Ejecuta en CI/CD o pre-commit

### Fase 4: Deprecar TRACEABILITY.yml

1. Marcar como deprecated
2. Mover a `/implementacion/_archived/`
3. Actualizar referencias

---

## EJEMPLO COMPLETO

### _MAP.md (Nivel Épica)

```markdown
---
id: EAI-003
name: "Gamificación"
phase: 1
refs:
  schemas: ["gamification_system"]
  depends_on: ["EAI-001"]
  required_by: ["EAI-002", "EXT-004"]
---

# EAI-003: Gamificación

## Schemas
- `gamification_system` - Schema principal

## Requerimientos
- [RF-GAM-001](./requerimientos/RF-GAM-001.md) - Achievements
- [RF-GAM-002](./requerimientos/RF-GAM-002.md) - Comodines
...
```

### RF-GAM-001.md (Nivel Requerimiento)

```markdown
---
id: RF-GAM-001
title: "Sistema de Logros"
epic: EAI-003
refs:
  database:
    enums: ["achievement_type", "achievement_category"]
    tables: ["achievements", "user_achievements"]
    functions: ["check_and_unlock_achievement"]
    triggers: ["trg_achievement_unlocked"]
  backend:
    module: "gamification"
    entities: ["achievement.entity.ts", "user-achievement.entity.ts"]
---

# RF-GAM-001: Sistema de Logros

## Objetos Implementados

### Database (Schema: gamification_system)
- **Tablas:** achievements, user_achievements
- **Funciones:** check_and_unlock_achievement
- **Triggers:** trg_achievement_unlocked

### Backend (Módulo: gamification)
- **Entities:** achievement.entity.ts, user-achievement.entity.ts
...
```

### US-GAM-005.md (Nivel Historia Usuario)

```markdown
---
id: US-GAM-005
title: "Insignias básicas"
epic: EAI-003
rf: RF-GAM-001
refs:
  frontend:
    components: ["AchievementGallery", "AchievementCard", "AchievementModal"]
    hooks: ["useAchievements"]
  cross_refs:
    - source: "EAI-001/authStore"
      reason: "Usuario autenticado"
---

# US-GAM-005: Insignias básicas

**Hereda de:** RF-GAM-001 (tables, entities)

## Componentes Implementados
- AchievementGallery.tsx
- AchievementCard.tsx
...
```

---

## BENEFICIOS

1. **Sin Duplicación:** Cada objeto se define una vez en el nivel apropiado
2. **Herencia Clara:** US hereda de RF, RF hereda de Épica
3. **Cross-refs Explícitas:** Relaciones entre épicas documentadas
4. **Contexto Eficiente:** Agentes cargan solo el archivo que necesitan
5. **Mantenible:** Cambios en un lugar, no sincronizar archivos
6. **Generación Automática:** Índice consolidado se auto-genera

---

## PRÓXIMOS PASOS

| Paso | Descripción | Prioridad |
|------|-------------|-----------|
| 1 | Definir schema YAML para frontmatter | P0 |
| 2 | Crear script de migración desde TRACEABILITY.yml | P1 |
| 3 | Implementar en 1 épica piloto (EAI-003) | P1 |
| 4 | Crear generador de índice | P2 |
| 5 | Migrar resto de épicas | P2 |
| 6 | Deprecar TRACEABILITY.yml | P3 |

---

*Propuesta creada por Claude Opus 4.5*
*Sistema SIMCO v4.0.0 - Modo @ANALYSIS*
*Fecha: 2026-01-16*
