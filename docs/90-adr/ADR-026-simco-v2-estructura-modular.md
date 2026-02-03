# ADR-026: Estructura Modular SIMCO v2

**Fecha:** 2025-11-07
**Estado:** ✅ Aceptado e Implementado
**Decisor:** @tech-lead, @architect
**Contexto:** Migración de documentación a SIMCO v2

---

## Contexto y Problema

La documentación actual del proyecto GAMILIT está organizada en carpetas por tipo de documento (01-requerimientos/, 02-especificaciones-tecnicas/, 03-desarrollo/, etc.), lo que genera:

1. **Fragmentación:** Información relacionada está dispersa en múltiples carpetas
2. **Difícil trazabilidad:** Mapear REQ → ET → OBJ → TEST requiere navegar múltiples directorios
3. **Duplicación:** Contenido similar se repite en diferentes ubicaciones
4. **Inconsistencia de IDs:** Múltiples esquemas de nomenclatura (RF-*, ET-*, sin prefijo M-)
5. **Falta de ownership:** No hay responsables claros por módulo funcional
6. **Difícil navegación para IA:** Agentes AI no tienen contexto completo de un módulo en un solo lugar

## Decisión

Adoptar **SIMCO v2 (Sistema Indexado Modular por Contexto)** con estructura modular autocontenida basada en 11 módulos funcionales.

### Estructura Aprobada

```
docs/modules/<MOD>/
├── 00-overview.md                 # Visión general del módulo
├── maps/
│   ├── _MAP.md                    # Índice de todos los IDs del módulo
│   └── quick-links.md             # Enlaces rápidos
├── req/
│   ├── base/                      # Requerimientos alcance inicial
│   ├── migracion-robustecimiento/ # Requerimientos Q1 2026
│   ├── extensiones/               # Requerimientos Q2-Q4 2026
│   └── futuras/                   # Requerimientos post-2026
├── spec/                          # Especificaciones técnicas
├── dev/                           # Guías de desarrollo
├── plan/
│   ├── kanban.md                  # Board Scrum: épicas/historias/tareas
│   └── roadmap.md                 # Roadmap por trimestre
├── trace/
│   ├── trace.yml                  # SINGLE SOURCE OF TRUTH de trazabilidad
│   └── coverage.md                # Métricas de completitud (autogenerado)
└── references/
    └── code-map.md                # Mapeo completo de objetos de código
```

### Módulos Definidos

| ID | Nombre | DB Objects | BE Files | FE Comps | Docs |
|----|--------|------------|----------|----------|------|
| M-AUTH | Autenticación y Autorización | 30 | 48 | 13 | 6 |
| M-GAM | Gamificación | 65 | 60+ | 71 | 6 |
| M-EDU | Contenido Educativo | 12 | 18+ | 68 | 6 |
| M-PRG | Progreso y Seguimiento | 20 | 40+ | ~10 | 4 |
| M-SOC | Características Sociales | 21 | 37+ | 42 | 6 |
| M-NOT | Notificaciones | ~5 | 5+ | 2 | 4 |
| M-CNT | Gestión de Contenido y Media | 11 | 15+ | ~20 | 6 |
| M-AUD | Auditoría | 9 | 3+ | ~5 | 7 |
| M-CFG | Configuración del Sistema | 19 | ~5 | ~3 | 1 |
| M-TCH | Portal de Profesores | ~10 | 20+ | 0 | 5 |
| M-ADM | Portal de Administración | 4 | 30+ | 0 | 4 |

### Nomenclatura de IDs

**Requerimientos:**
- Formato: `M-<MOD>-REQ-###`
- Ejemplo: `M-AUTH-REQ-001`

**Especificaciones:**
- Formato: `M-<MOD>-ET-###`
- Ejemplo: `M-AUTH-ET-001`

**Objetos de Código:**
- Formato: `OBJ-<LAYER>-<MOD>-<TYPE>-<NAME>`
- Capas: DB, BE, FE, SHARED, QA
- Ejemplos:
  - `OBJ-DB-AUTH-USERS-TBL`
  - `OBJ-BE-AUTH-CTRL-LOGIN`
  - `OBJ-FE-AUTH-FEAT-LOGIN`

**Planeación:**
- Épicas: `M-<MOD>-EPIC-##`
- Historias: `M-<MOD>-ST-###`
- Tareas: `M-<MOD>-T-####`
- Subtareas: `M-<MOD>-STK-####`

**Tests:**
- Formato: `M-<MOD>-TEST-###`
- Ejemplo: `M-AUTH-TEST-LOGIN-001`

### Single Source of Truth: trace.yml

Cada módulo tiene un archivo `trace/trace.yml` que contiene:

```yaml
module: M-AUTH
req:
  - id: M-AUTH-REQ-001
    links:
      spec: [M-AUTH-ET-001]
      plan: [M-AUTH-PLAN-2025Q4]
      tests: [M-AUTH-TEST-LOGIN-001]
      objs:
        - OBJ-DB-AUTH-USERS-TBL
        - OBJ-BE-AUTH-CTRL-LOGIN
        - OBJ-FE-AUTH-FEAT-LOGIN
```

## Consecuencias

### Positivas

1. ✅ **Autocontención:** Todo lo relacionado a un módulo en un solo lugar
2. ✅ **Trazabilidad completa:** trace.yml conecta REQ → ET → DEV → OBJ → TEST
3. ✅ **Ownership claro:** Cada módulo tiene owners definidos
4. ✅ **Navegación eficiente:** Agentes IA pueden cargar contexto completo de módulo
5. ✅ **Métricas automáticas:** coverage.md se genera desde trace.yml
6. ✅ **Escalabilidad:** Fácil agregar nuevos módulos sin reorganizar todo
7. ✅ **IDs únicos y consistentes:** M-<MOD> como prefijo previene colisiones
8. ✅ **Integración Scrum:** plan/kanban.md conecta planeación con desarrollo
9. ✅ **Código como ciudadano de primera clase:** code-map.md mapea todos los objetos
10. ✅ **Límites de tamaño:** Archivos ≤ 300 líneas; si superan, se divide la carpeta

### Negativas

1. ⚠️ **Trabajo de migración:** ~55 documentos RF/ET deben moverse y renombrarse
2. ⚠️ **Curva de aprendizaje:** Equipo debe adaptarse a nueva estructura
3. ⚠️ **Mantenimiento de trace.yml:** Debe actualizarse con cada cambio
4. ⚠️ **Mirrors legacy:** Equipos externos pueden requerir mirrors autogenerados

### Mitigaciones

- **Migración:** Script automatizado de migración con tabla de mapeo antes→después
- **Aprendizaje:** Documentación completa en docs/modules/README.md
- **Mantenimiento:** Hooks de pre-commit validan trace.yml
- **Mirrors:** Generación automática desde trace.yml a legacy folders (opcional)

## Alternativas Consideradas

### 1. Mantener estructura actual (docs/01-requerimientos/, docs/02-especificaciones-tecnicas/)
- ❌ No resuelve fragmentación
- ❌ Dificulta trazabilidad
- ❌ No escala bien

### 2. Estructura flat con prefijos (docs/M-AUTH-REQ-001.md, docs/M-AUTH-ET-001.md)
- ✅ Fácil de migrar
- ❌ Difícil de navegar con muchos archivos
- ❌ No permite agrupación por fase (base/migracion/extensiones)

### 3. Estructura mixta (docs/<MOD>/ + docs/01-requerimientos/)
- ⚠️ Confusión sobre dónde crear nuevos documentos
- ❌ Duplicación implícita

## Referencias

- [MODULOS-SIMCO-V2-DEFINICION.md](../../MODULOS-SIMCO-V2-DEFINICION.md)
- [RFC-0001: Sistema de Mapeo SIMCO](../standards/RFC-0001-sistema-mapeo-simco.md) (si existe)
- [trace.yml spec](../templates/trace-yml-template.md) (pendiente)

## Implementación

- **Fecha de decisión:** 2025-11-07
- **Fecha de implementación:** 2025-11-07
- **Implementado por:** @architect (agente AI)
- **Rollback:** Mantener docs/01-requerimientos/ y docs/02-especificaciones-tecnicas/ como read-only durante 1 sprint

## Seguimiento

- [ ] Migrar 55 documentos RF/ET a nueva estructura
- [ ] Poblar trace.yml con datos reales de inventarios
- [ ] Generar code-map.md con OBJ IDs
- [ ] Crear kanban.md con épicas/historias existentes
- [ ] Validar IDs únicos globalmente
- [ ] Generar coverage.md por módulo
- [ ] Documentar en docs/modules/README.md
- [ ] Comunicar cambios al equipo
