# Plan de Análisis de Requerimientos de Base de Datos

**Agente:** ATLAS-DATABASE
**Fecha:** 2025-11-03
**Versión:** 1.0
**Estado:** En ejecución

---

## 🎯 Objetivo

Analizar toda la documentación de planificación (12 épicas) para:
1. Extraer TODOS los requerimientos de base de datos
2. Comparar contra la BD actual (319 archivos SQL, 688 objetos)
3. Identificar gaps o funcionalidades faltantes
4. Generar recomendaciones de implementación

---

## 📊 Alcance del Análisis

### Épicas a Analizar (12 total)

**Fase 1: Alcance Inicial** ($110,000 MXN, 230 SP)
- EAI-001: Fundamentos (60 SP)
- EAI-002: Actividades Básicas (45 SP)
- EAI-003: Gamificación Básica (40 SP)
- EAI-004: Analytics Básico (35 SP)
- EAI-005: Plataforma Maestro Básica (50 SP)

**Fase 2: Migración y Robustecimiento** ($50,000 MXN, 80 SP)
- EMR-001: Migración BD (80 SP)

**Fase 3: Extensiones** ($155,000 MXN, 305 SP)
- EXT-001: Portal de Maestros Completo (60 SP)
- EXT-002: Admin Extendido (70 SP)
- EXT-003: Sistema de Notificaciones (45 SP)
- EXT-004: Perfiles Avanzados (35 SP)
- EXT-005: Reportes Avanzados (50 SP)
- EXT-006: Gestión de Contenido (45 SP)

**Total:** 615 SP, $315,000 MXN

---

## 🔀 Estrategia de Orquestación

### Fase 1: Inventario de Requerimientos (8 subagentes en paralelo)

Cada subagente analizará épicas específicas y extraerá:
- Tablas necesarias
- Columnas y tipos de datos
- Relaciones (Foreign Keys)
- Índices requeridos
- Funciones y procedimientos almacenados
- Triggers necesarios
- Políticas RLS (Row Level Security)
- Vistas y vistas materializadas
- Constraints y validaciones

#### Asignación de Subagentes:

**SA-ANALISIS-DB-001: EAI-001 Fundamentos**
- Tiempo estimado: 15-20 minutos
- Modelo: haiku (rápido para análisis)
- Output: JSON con requerimientos de BD

**SA-ANALISIS-DB-002: EAI-002 Actividades**
- Tiempo estimado: 15-20 minutos
- Modelo: haiku
- Output: JSON con requerimientos de BD

**SA-ANALISIS-DB-003: EAI-003 Gamificación**
- Tiempo estimado: 15-20 minutos
- Modelo: haiku
- Output: JSON con requerimientos de BD

**SA-ANALISIS-DB-004: EAI-004 Analytics**
- Tiempo estimado: 15-20 minutos
- Modelo: haiku
- Output: JSON con requerimientos de BD

**SA-ANALISIS-DB-005: EAI-005 Admin Base**
- Tiempo estimado: 15-20 minutos
- Modelo: haiku
- Output: JSON con requerimientos de BD

**SA-ANALISIS-DB-006: EMR-001 Migración BD**
- Tiempo estimado: 20-25 minutos
- Modelo: sonnet (análisis más profundo)
- Output: JSON con requerimientos técnicos de BD

**SA-ANALISIS-DB-007: EXT-001, EXT-002, EXT-003 (Extensiones Parte 1)**
- Tiempo estimado: 20-25 minutos
- Modelo: sonnet
- Output: JSON consolidado de 3 épicas

**SA-ANALISIS-DB-008: EXT-004, EXT-005, EXT-006 (Extensiones Parte 2)**
- Tiempo estimado: 20-25 minutos
- Modelo: sonnet
- Output: JSON consolidado de 3 épicas

**Duración total Fase 1:** ~25 minutos (en paralelo)

---

### Fase 2: Consolidación y Análisis de Gaps (1 subagente)

**SA-CONSOLIDACION-DB-001: Consolidar y Comparar**
- Tiempo estimado: 30-40 minutos
- Modelo: sonnet (análisis complejo)
- Inputs: 8 JSONs de Fase 1 + inventario BD actual
- Tareas:
  1. Consolidar todos los requerimientos
  2. Eliminar duplicados
  3. Normalizar nombres de objetos
  4. Comparar contra BD actual (319 archivos, 688 objetos)
  5. Identificar gaps (objetos faltantes)
  6. Clasificar por prioridad (P0-P3)
  7. Estimar esfuerzo de implementación
- Output:
  - `requerimientos-consolidados.json`
  - `gaps-identificados.json`
  - `REPORTE-ANALISIS-GAPS.md`

**Duración total Fase 2:** ~35 minutos

---

### Fase 3: Recomendaciones (1 subagente)

**SA-RECOMENDACIONES-DB-001: Plan de Implementación**
- Tiempo estimado: 20-30 minutos
- Modelo: sonnet
- Input: gaps-identificados.json
- Tareas:
  1. Generar plan de implementación
  2. Priorizar por criticidad
  3. Estimar story points
  4. Definir microciclos
  5. Identificar dependencias
  6. Proponer scripts SQL
- Output:
  - `PLAN-IMPLEMENTACION-GAPS.md`
  - `RECOMENDACIONES-BD.md`

**Duración total Fase 3:** ~25 minutos

---

## ⏱️ Timeline Total

- **Fase 1 (paralelo):** ~25 minutos
- **Fase 2:** ~35 minutos
- **Fase 3:** ~25 minutos
- **TOTAL:** ~85 minutos (1h 25min)

---

## 📁 Estructura de Outputs

```
/orchestration/analisis-requerimientos-bd/
├── fase-1-inventarios/
│   ├── req-EAI-001-fundamentos.json
│   ├── req-EAI-002-actividades.json
│   ├── req-EAI-003-gamificacion.json
│   ├── req-EAI-004-analytics.json
│   ├── req-EAI-005-admin-base.json
│   ├── req-EMR-001-migracion-bd.json
│   ├── req-EXT-001-002-003.json
│   └── req-EXT-004-005-006.json
├── fase-2-consolidacion/
│   ├── requerimientos-consolidados.json
│   ├── gaps-identificados.json
│   └── REPORTE-ANALISIS-GAPS.md
├── fase-3-recomendaciones/
│   ├── PLAN-IMPLEMENTACION-GAPS.md
│   └── RECOMENDACIONES-BD.md
├── PLAN-ANALISIS-REQUERIMIENTOS-BD.md (este archivo)
└── REPORTE-FINAL-ANALISIS-BD.md (generado al final)
```

---

## 📋 Template de Requerimientos (JSON)

```json
{
  "epica": "EAI-001",
  "nombre": "Fundamentos",
  "fecha_analisis": "2025-11-03",
  "requerimientos_bd": {
    "schemas": ["auth_management", "system_configuration"],
    "tablas": [
      {
        "nombre": "users",
        "schema": "auth_management",
        "descripcion": "Usuarios del sistema",
        "columnas": [
          {"nombre": "id", "tipo": "UUID", "pk": true},
          {"nombre": "email", "tipo": "VARCHAR(255)", "unique": true, "nullable": false}
        ],
        "relaciones": [],
        "indices": [
          {"nombre": "idx_users_email", "columnas": ["email"], "tipo": "B-tree", "unique": true}
        ],
        "constraints": [],
        "prioridad": "P0"
      }
    ],
    "funciones": [],
    "triggers": [],
    "vistas": [],
    "vistas_materializadas": [],
    "politicas_rls": [],
    "seeds_requeridos": []
  },
  "estadisticas": {
    "total_tablas": 5,
    "total_funciones": 2,
    "total_triggers": 1,
    "total_vistas": 0,
    "total_indices": 8,
    "total_rls": 3
  }
}
```

---

## ✅ Criterios de Éxito

1. **Completitud:** Analizar 100% de las 12 épicas
2. **Detalle:** Extraer TODOS los objetos de BD mencionados
3. **Precisión:** Identificar correctamente gaps vs BD actual
4. **Accionable:** Plan de implementación listo para ejecutar
5. **Trazabilidad:** Cada requerimiento vinculado a épica origen

---

## 🚀 Inicio de Ejecución

**Próximo paso:** Lanzar 8 subagentes de Fase 1 en paralelo

**Comando:**
```
Task tool con 8 invocaciones paralelas (SA-ANALISIS-DB-001 a SA-ANALISIS-DB-008)
```

---

**Creado:** 2025-11-03
**Autor:** ATLAS-DATABASE
**Estado:** ✅ Plan aprobado - Listo para ejecución
