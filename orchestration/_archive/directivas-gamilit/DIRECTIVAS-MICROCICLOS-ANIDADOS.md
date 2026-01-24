# Directivas: Microciclos Anidados N Niveles

**Fecha creación:** 2025-11-02
**Versión:** 1.0
**Estado:** ✅ ACTIVO
**Propósito:** Definir cómo y cuándo usar microciclos anidados en múltiples niveles para garantizar granularidad, trazabilidad y validación apropiada.

---

## 🎯 Concepto: Microciclos Anidados

### Definición

Los **microciclos anidados** permiten descomponer una tarea compleja en niveles arbitrarios de profundidad, donde cada nivel representa un scope más específico y validable.

**Estructura:**

```
Ciclo N: [Tarea Grande]
├── Microciclo N-X: [Subtarea]
│   ├── Micro N-X-Y: [Sub-subtarea]
│   │   ├── Micro N-X-Y-Z: [Sub-sub-subtarea]
│   │   │   └── ... (niveles adicionales si es necesario)
│   │   └── Micro N-X-Y-Z+1: [Siguiente]
│   └── Micro N-X-Y+1: [Siguiente subtarea]
└── Microciclo N-X+1: [Siguiente subtarea principal]
```

**No hay límite de profundidad** - Se anida hasta el nivel necesario para:
- Validar apropiadamente cada unidad de trabajo
- Mantener trazabilidad completa
- Garantizar criterios de aceptación claros
- Permitir rollback granular si algo falla

---

## ⚖️ Cuándo Anidar Más Profundo

### Regla General

**Anidar un nivel más cuando:**

1. ✅ El microciclo actual involucra >5 archivos/objetos
2. ✅ Hay validaciones interdependientes entre objetos
3. ✅ Se requiere ejecutar en orden específico (dependencias)
4. ✅ Validación intermedia es crítica para detección temprana de errores
5. ✅ La tarea tomará >30 minutos en su nivel actual
6. ✅ Hay riesgo alto de error/discrepancia

### Regla de Granularidad por Tipo de Tarea

| Tipo de Tarea | Granularidad Mínima | Cuándo Anidar |
|---------------|---------------------|---------------|
| **Migrar DDL de esquema** | Por esquema | Si esquema tiene >5 tablas → anidar por tipo de objeto (tablas base, FKs, views, functions) |
| **Migrar seeds** | Por entorno (dev/staging/prod) | Si entorno tiene >10 seeds → anidar por módulo/esquema |
| **Crear scripts** | Por script individual | Si script >200L → anidar en funciones/secciones |
| **Implementar feature** | Por componente | Si componente >300L → anidar en subcomponentes |
| **Análisis de código** | Por módulo | Si módulo tiene >10 archivos → anidar por tipo de archivo |

---

## 📐 Nomenclatura de Microciclos Anidados

### Formato

```
Ciclo-Micro-Micro-Micro-...
```

**Ejemplos:**

- `Ciclo 2`: Database Migration (nivel raíz)
- `Microciclo 2-1`: Análisis previo
- `Microciclo 2-2`: Migrar esquemas
- `Micro 2-2-1`: Migrar esquema auth_management
- `Micro 2-2-1-1`: Análisis de dependencias auth_management
- `Micro 2-2-1-2`: Migrar tablas base
- `Micro 2-2-1-2-1`: Validar + Migrar roles.sql
- `Micro 2-2-1-2-2`: Validar + Migrar users.sql
- `Micro 2-2-1-3`: Migrar constraints y FKs
- `Micro 2-2-1-3-1`: Validar + Migrar FK user_role
- ...

**Reglas:**

1. Números incrementales en cada nivel
2. Separador: guión `-`
3. Sin ceros al inicio (2-1, no 2-01)
4. Legible sin ambigüedad

---

## 📋 Estructura de Plan de Microciclo Anidado

### Template Base

```markdown
# Plan: Micro X-Y-Z - [Nombre Descriptivo]

**Fecha:** YYYY-MM-DD
**Nivel de anidación:** Z (3 niveles)
**Duración estimada:** XX minutos
**Microciclo padre:** Micro X-Y

---

## 🎯 Objetivo de este Microciclo

[Descripción específica de qué se logra en ESTE nivel]

**Scope:**
- Input: [Qué necesita de microciclos previos]
- Output: [Qué produce para microciclos siguientes]
- Dependencias: [De qué depende]

---

## 📊 Descomposición en Sub-Microciclos

### ¿Requiere anidar más?

- [ ] Sí → Definir sub-microciclos X-Y-Z-W
- [x] No → Ejecutar directamente con subagente(s)

**Razón:** [Por qué sí/no requiere más anidación]

---

## 🤖 Estrategia de Ejecución

### Si NO requiere más anidación:

**Subagentes a lanzar:** N
**Ejecución:** Paralela/Secuencial
**Modelo:** sonnet/haiku/opus

[Detalle de subagentes...]

### Si SÍ requiere más anidación:

**Sub-microciclos:**

1. **Micro X-Y-Z-1:** [Nombre]
   - Duración: XX min
   - Objetivo: ...
   - Output: ...

2. **Micro X-Y-Z-2:** [Nombre]
   - Duración: XX min
   - Objetivo: ...
   - Output: ...

---

## ✅ Criterios de Completitud

**Este microciclo se considera COMPLETO cuando:**

- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Validaciones documentadas
- [ ] Output verificado
- [ ] Próximo microciclo puede iniciar

---

## 📝 Log y Documentación

- **Log:** `logs/YYYY-MM-DD-micro-X-Y-Z-[nombre].md`
- **Validaciones:** `VALIDACION-MICRO-X-Y-Z.md` (si aplica)
- **Decisiones:** Documentar en log

---
```

---

## 🔄 Flujo de Decisión de Anidación

### Algoritmo de Decisión

```
┌─────────────────────────────────┐
│ Inicio: Definir Microciclo N-X  │
└──────────────┬──────────────────┘
               ▼
    ┌──────────────────────────┐
    │ ¿Involucra >5 objetos?   │
    └────┬─────────────────┬───┘
         │ Sí              │ No
         ▼                 ▼
    ┌──────────┐      ┌──────────────┐
    │ Anidar   │      │ ¿Duración    │
    │ N-X-Y    │      │ >30 min?     │
    └──────────┘      └───┬──────┬───┘
                          │ Sí   │ No
                          ▼      ▼
                     ┌────────┐ ┌──────────────┐
                     │ Anidar │ │ ¿Validación  │
                     │ N-X-Y  │ │ intermedia   │
                     └────────┘ │ crítica?     │
                                └───┬──────┬───┘
                                    │ Sí   │ No
                                    ▼      ▼
                               ┌────────┐ ┌──────────────┐
                               │ Anidar │ │ Ejecutar con │
                               │ N-X-Y  │ │ subagente(s) │
                               └────────┘ └──────────────┘
```

**Para cada sub-microciclo creado → repetir algoritmo recursivamente**

---

## 📊 Ejemplo Completo: Ciclo 2 Database Migration

### Nivel 0: Ciclo

```
Ciclo 2: Database Migration
Objetivo: Migrar toda la base de datos PostgreSQL del proyecto GAMILIT
Duración: ~20 horas
```

### Nivel 1: Microciclos Principales

```
├── Microciclo 2-1: Análisis y Preparación (2h)
├── Microciclo 2-2: Migrar Esquemas DDL (8h)
├── Microciclo 2-3: Migrar Seeds (4h)
├── Microciclo 2-4: Scripts Operacionales (2h)
├── Microciclo 2-5: Validación Integral (2h)
└── Microciclo 2-6: Documentación Final (2h)
```

### Nivel 2: Descomposición de Micro 2-2

**Micro 2-2: Migrar Esquemas DDL**

Análisis:
- ✅ Involucra 12 esquemas con ~140 objetos → ANIDAR
- ✅ Duración >30 min → ANIDAR
- ✅ Validación intermedia crítica → ANIDAR

```
Microciclo 2-2: Migrar Esquemas DDL
├── Micro 2-2-0: Análisis de Dependencias (1h)
│   └── Output: MATRIZ-DEPENDENCIAS-DATABASE.md
│
├── Micro 2-2-1: Esquema auth_management (1h)
├── Micro 2-2-2: Esquema core_system (0.5h)
├── Micro 2-2-3: Esquema educational_content (2h)
├── Micro 2-2-4: Esquema gamification_system (1.5h)
├── Micro 2-2-5: Esquema social_interactions (1h)
├── Micro 2-2-6: Esquema teacher_tools (1h)
├── Micro 2-2-7: Esquema admin_management (0.5h)
├── Micro 2-2-8: Esquema notifications (0.5h)
├── Micro 2-2-9: Esquema analytics (1h)
├── Micro 2-2-10: Esquema integrations (0.5h)
├── Micro 2-2-11: Esquema audit_logs (0.5h)
└── Micro 2-2-12: Esquema monitoring (0.5h)
```

### Nivel 3: Descomposición de Micro 2-2-1

**Micro 2-2-1: Esquema auth_management**

Análisis:
- ✅ Tiene 8 tablas + views + functions → ANIDAR
- ✅ Dependencias complejas entre tablas → ANIDAR
- ✅ Validación por tipo de objeto es crítica → ANIDAR

```
Micro 2-2-1: Esquema auth_management
├── Micro 2-2-1-0: Análisis de auth_management (15min)
│   └── Output: MATRIZ-DEPENDENCIAS-auth_management.md
│
├── Micro 2-2-1-1: Crear Schema y Types (5min)
│   ├── Validar contra TYPES-AUTH.md
│   └── Crear schema + custom types
│
├── Micro 2-2-1-2: Migrar Tablas Base (20min)
│   ├── Micro 2-2-1-2-1: roles.sql
│   ├── Micro 2-2-1-2-2: auth_providers.sql
│   └── Micro 2-2-1-2-3: users.sql
│
├── Micro 2-2-1-3: Migrar Tablas Dependientes (15min)
│   ├── Micro 2-2-1-3-1: user_sessions.sql
│   ├── Micro 2-2-1-3-2: user_profiles.sql
│   └── Micro 2-2-1-3-3: user_permissions.sql
│
├── Micro 2-2-1-4: Migrar Views (5min)
│   └── v_user_full_profile.sql
│
├── Micro 2-2-1-5: Migrar Functions (10min)
│   ├── fn_authenticate_user.sql
│   └── fn_check_permission.sql
│
└── Micro 2-2-1-6: Validar Esquema Completo (10min)
    ├── Test de integridad referencial
    ├── Test de constraints
    └── Generar _MAP.md
```

### Nivel 4: Descomposición de Micro 2-2-1-2

**Micro 2-2-1-2: Migrar Tablas Base**

Análisis:
- ✅ 3 tablas con interdependencias → ANIDAR para validar c/u
- ✅ Validación crítica por tabla → ANIDAR
- ✅ Cada tabla necesita validación independiente → ANIDAR

```
Micro 2-2-1-2: Migrar Tablas Base
├── Micro 2-2-1-2-1: Tabla roles
│   ├── Leer TYPES-AUTH.md (Role type)
│   ├── Validar contra especificación
│   ├── Ejecutar checklist DDL
│   ├── Generar VALIDACION-roles.md
│   ├── Migrar 01-roles.sql
│   └── Actualizar matriz dependencias
│
├── Micro 2-2-1-2-2: Tabla auth_providers
│   └── [mismo proceso]
│
└── Micro 2-2-1-2-3: Tabla users
    └── [mismo proceso]
```

### Nivel 5: ¿Anidar Micro 2-2-1-2-1?

**Micro 2-2-1-2-1: Tabla roles**

Análisis:
- ❌ 1 archivo SQL simple (~50 líneas)
- ❌ No tiene sub-objetos
- ❌ Validación directa posible
- ❌ Duración <15 min

**Decisión: NO anidar más → Ejecutar con 1 subagente**

---

## 🎯 Criterios de Completitud por Nivel

### Completitud de un Microciclo Anidado

**Un microciclo de nivel N se considera COMPLETO cuando:**

1. ✅ **Todos sus sub-microciclos (N+1) están completos** (si los tiene)
2. ✅ **Sus criterios de aceptación propios están cumplidos**
3. ✅ **Output esperado está generado y validado**
4. ✅ **Log del microciclo está completo**
5. ✅ **Validaciones documentadas** (si aplica)
6. ✅ **El próximo microciclo del mismo nivel puede iniciar**

### Propagación de Completitud

```
Micro 2-2-1-2-1: ✅ COMPLETO (nivel 5)
Micro 2-2-1-2-2: ✅ COMPLETO (nivel 5)
Micro 2-2-1-2-3: ✅ COMPLETO (nivel 5)
    ↓
Micro 2-2-1-2: ✅ COMPLETO (nivel 4) [porque todos los N+1 están completos]
    ↓
... [otros micros de nivel 4]
    ↓
Micro 2-2-1: ✅ COMPLETO (nivel 3) [cuando todos sus N+1 están completos]
    ↓
... [otros micros de nivel 3]
    ↓
Micro 2-2: ✅ COMPLETO (nivel 2)
    ↓
... [otros micros de nivel 2]
    ↓
Ciclo 2: ✅ COMPLETO (nivel 1)
```

---

## 📝 Documentación por Nivel

### Archivos Generados por Microciclo

**Cada microciclo (sin importar nivel) debe generar:**

1. **Plan (si no es hoja):**
   - `PLAN-MICRO-X-Y-Z.md` (si tiene sub-microciclos)
   - Documenta estrategia de descomposición

2. **Log (todos):**
   - `logs/YYYY-MM-DD-micro-X-Y-Z-[nombre].md`
   - Documenta ejecución real, decisiones, problemas

3. **Validaciones (si aplica):**
   - `VALIDACION-MICRO-X-Y-Z.md`
   - Si el microciclo migra/crea archivos

4. **Output específico:**
   - Matriz de dependencias
   - _MAP.md
   - Código/SQL migrado
   - Tests generados

---

## 🔍 Monitoreo de Progreso

### Tracking de Microciclos Anidados

**En TRAZA-TAREAS.md:**

```markdown
## Estado Actual: Ciclo 2 - Microciclo 2-2-1-2-1

**Ruta completa:**
Ciclo 2 → Micro 2-2 → Micro 2-2-1 → Micro 2-2-1-2 → Micro 2-2-1-2-1

**Progreso por nivel:**

### Nivel 1: Ciclo 2
- Estado: 🔄 EN PROGRESO
- Completitud: 15% (micro 2-1 completo, 2-2 en progreso)

### Nivel 2: Micro 2-2
- Estado: 🔄 EN PROGRESO
- Completitud: 5% (micro 2-2-0 completo, 2-2-1 iniciado)

### Nivel 3: Micro 2-2-1
- Estado: 🔄 EN PROGRESO
- Completitud: 20% (2-2-1-0 y 2-2-1-1 completos, 2-2-1-2 en progreso)

### Nivel 4: Micro 2-2-1-2
- Estado: 🔄 EN PROGRESO
- Completitud: 0% (iniciando 2-2-1-2-1)

### Nivel 5: Micro 2-2-1-2-1
- Estado: ▶️ EJECUTANDO
- Subagente: SA-AUTH-ROLES-01
```

---

## 🚨 Gestión de Errores en Niveles

### Estrategia de Rollback

**Si un microciclo de nivel N falla:**

1. **Marcar como FALLIDO:**
   - Micro X-Y-Z: ❌ FALLIDO

2. **Analizar causa raíz:**
   - ¿Error en validación?
   - ¿Dependencia no satisfecha?
   - ¿Subagente falló?

3. **Decidir acción:**
   - **Reintentar mismo micro** (si es error transitorio)
   - **Rehacer micros previos** (si dependencia era incorrecta)
   - **Rehacer nivel padre** (si toda la estrategia falló)

4. **Propagar impacto:**
   - Marcar todos los micros N+1 dependientes como PENDIENTES
   - Invalidar outputs generados

5. **Documentar:**
   - Crear `ANALISIS-ERROR-MICRO-X-Y-Z.md`
   - Actualizar plan si es necesario

---

## 🎓 Ejemplos de Decisiones de Anidación

### Ejemplo 1: Migrar 140 archivos SQL

**❌ Enfoque INCORRECTO (Ciclo 2 original):**

```
Microciclo 2-2: Migrar 140 SQL con 10 subagentes
├── SA-DDL-01: Migrar archivos 1-14
├── SA-DDL-02: Migrar archivos 15-28
...
└── SA-DDL-10: Migrar archivos 127-140
```

**Problemas:**
- No hay validación intermedia
- No respeta dependencias
- No hay trazabilidad por archivo
- Imposible de rollback granular

**✅ Enfoque CORRECTO:**

```
Microciclo 2-2: Migrar Esquemas DDL
├── Micro 2-2-0: Análisis global de dependencias
├── Micro 2-2-1: Esquema auth_management
│   ├── Micro 2-2-1-0: Análisis de dependencias auth
│   ├── Micro 2-2-1-1: Schema y types
│   ├── Micro 2-2-1-2: Tablas base
│   │   ├── Micro 2-2-1-2-1: Validar + Migrar roles
│   │   ├── Micro 2-2-1-2-2: Validar + Migrar providers
│   │   └── Micro 2-2-1-2-3: Validar + Migrar users
│   ├── Micro 2-2-1-3: Tablas dependientes
│   │   └── [anidación similar]
│   └── Micro 2-2-1-6: Validar esquema completo
├── Micro 2-2-2: Esquema core_system
│   └── [anidación similar]
...
```

**Ventajas:**
- Validación en cada nivel
- Respeta dependencias por diseño
- Trazabilidad completa
- Rollback granular

---

### Ejemplo 2: Crear 4 scripts bash

**❌ Enfoque INCORRECTO (Microciclo 2-4 original):**

```
Microciclo 2-4: Scripts Backup/Restore
├── SA-04-01: Generar backup-gamilit.sh
├── SA-04-02: Generar restore-gamilit.sh
├── SA-04-03: Generar test-restore.sh
└── SA-04-04: Generar setup-cron.sh + _MAP.md
```

**Problema:**
- Copy-paste sin validar contra estructura real
- No valida que backup/restore son compatibles
- No valida que test-restore usa scripts correctos

**✅ Enfoque CORRECTO:**

```
Microciclo 2-4: Scripts Backup/Restore
├── Micro 2-4-0: Análisis de requerimientos (15min)
│   ├── Leer plan P0-DB-002
│   ├── Analizar estructura /apps/database/
│   └── Definir variables de entorno necesarias
│
├── Micro 2-4-1: Script backup-gamilit.sh (30min)
│   ├── Validar contra estructura real
│   ├── Generar con subagente
│   ├── Validar sintaxis (bash -n)
│   └── Test dry-run
│
├── Micro 2-4-2: Script restore-gamilit.sh (30min)
│   ├── Validar contra backup-gamilit.sh (compatibilidad)
│   ├── Generar con subagente
│   ├── Validar sintaxis
│   └── Test dry-run
│
├── Micro 2-4-3: Script test-restore.sh (25min)
│   ├── Validar contra backup + restore
│   ├── Validar contra esquemas migrados (sabe qué validar)
│   ├── Generar con subagente
│   └── Test dry-run
│
├── Micro 2-4-4: Script setup-cron.sh (20min)
│   ├── Validar paths de scripts 2-4-1, 2-4-2, 2-4-3
│   ├── Generar con subagente
│   └── Test dry-run
│
└── Micro 2-4-5: Documentación y validación final (15min)
    ├── Generar _MAP.md
    ├── Test de integración (todos los scripts)
    └── Generar VALIDACION-MICRO-2-4.md
```

**Ventajas:**
- Análisis previo garantiza alineación
- Validación de compatibilidad entre scripts
- Cada script validado independientemente
- Validación final integrada

---

## 📏 Métricas de Anidación

**Medir por ciclo:**

- **Profundidad máxima alcanzada:** Max niveles de anidación usados
- **Promedio de sub-microciclos por micro:** Métrica de descomposición
- **% de micros hoja vs. micros contenedor:** Balance granularidad
- **Duración promedio de micros hoja:** Optimización de granularidad

**Objetivos:**

- Profundidad: 3-5 niveles típicamente
- Sub-microciclos: 3-7 por micro (no más de 10)
- Micros hoja: 60-80% del total
- Duración micro hoja: 10-30 minutos

---

## 🔗 Relación con Otros Documentos

- **GUIA-ORQUESTACION.md:** Define cuándo usar subagentes (complementario a esto)
- **PROCESO-VALIDACION-POR-BLOQUE.md:** Se ejecuta en micros hoja
- **TEMPLATES-SUBAGENTES.md:** Prompts para micros hoja
- **TRAZA-TAREAS.md:** Tracking de progreso multinivel

---

## ✅ Checklist de Decisión de Anidación

**Al planificar un microciclo, preguntarse:**

- [ ] ¿Involucra >5 archivos u objetos?
- [ ] ¿Tiene interdependencias complejas?
- [ ] ¿Requiere validación intermedia para detección temprana?
- [ ] ¿Durará >30 minutos?
- [ ] ¿Tiene riesgo alto de error?
- [ ] ¿Requiere orden específico de ejecución?
- [ ] ¿Rollback granular es importante?

**Si ≥2 respuestas son SÍ → Anidar un nivel más**

---

**Creado:** 2025-11-02
**Autor:** ATLAS
**Versión:** 1.0
**Estado:** ✅ ACTIVO - Uso obligatorio en planificación de ciclos
