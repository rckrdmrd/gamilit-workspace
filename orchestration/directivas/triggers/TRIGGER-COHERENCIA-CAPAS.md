# TRIGGER: COHERENCIA ENTRE CAPAS

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Sistema:** SIMCO v4.0.0
**Alias:** @TRIGGER_COHERENCIA

---

## RESUMEN EJECUTIVO

Este trigger OBLIGA a mantener coherencia entre las capas DDL, Backend y Frontend. Se activa automáticamente cuando se crea o modifica cualquier objeto en cualquier capa.

**PRINCIPIO:** "Ninguna capa puede tener objetos huérfanos. Todo DDL debe tener entity, todo entity que requiera persistencia debe tener DDL."

---

## CONDICIONES DE ACTIVACIÓN

```yaml
activar_cuando:
  DDL:
    - Se crea nueva tabla (CREATE TABLE)
    - Se modifica estructura de tabla (ALTER TABLE)
    - Se crea nuevo schema
    - Se elimina tabla o schema

  Backend:
    - Se crea nueva entity
    - Se modifica entity existente
    - Se crea nuevo módulo
    - Se elimina entity o módulo

  Frontend:
    - Se crea componente que consume endpoint nuevo
    - Se crea store/hook que requiere datos de API
```

---

## VERIFICACIONES OBLIGATORIAS

### 1. Al Crear Tabla DDL

```yaml
ANTES_de_completar_tarea:
  verificar:
    - "¿Existe entity correspondiente en backend?"
    - "¿Entity tiene mismos campos que tabla?"
    - "¿Tipos de datos son compatibles (PostgreSQL ↔ TypeScript)?"
    - "¿Está documentada en DATABASE_INVENTORY.yml?"
    - "¿Está documentada en ENTITIES-CATALOG.md?"

  si_no_existe_entity:
    accion: "BLOQUEAR hasta crear entity"
    excepcion: "Tablas de relación M:N pueden no tener entity si están documentadas como tal"

  si_no_documentada:
    accion: "BLOQUEAR hasta documentar en inventarios"
```

### 2. Al Crear Entity

```yaml
ANTES_de_completar_tarea:
  verificar:
    - "¿Existe tabla DDL correspondiente?"
    - "¿Campos coinciden con DDL?"
    - "¿Decoradores TypeORM son correctos?"
    - "¿Está documentada en BACKEND_INVENTORY.yml?"
    - "¿Está documentada en ENTITIES-CATALOG.md?"

  si_no_existe_tabla:
    accion: "BLOQUEAR hasta crear tabla DDL"
    excepcion: "Entities de solo lectura (views) deben estar documentadas"

  si_no_documentada:
    accion: "BLOQUEAR hasta documentar en inventarios"
```

### 3. Al Crear Módulo Backend

```yaml
ANTES_de_completar_tarea:
  verificar:
    - "¿Todas las entities del módulo tienen tabla DDL?"
    - "¿Módulo está documentado en MODULES-CATALOG.md?"
    - "¿Servicios están documentados en SERVICES-CATALOG.md?"
    - "¿Endpoints están documentados en QUICK-API.yml?"

  si_incompleto:
    accion: "BLOQUEAR hasta completar documentación"
```

### 4. Al Crear Schema DDL

```yaml
ANTES_de_completar_tarea:
  verificar:
    - "¿Schema tiene al menos un módulo backend correspondiente?"
    - "¿Schema está documentado en DATABASE-SCHEMA.md?"
    - "¿Schema está en DATABASE_INVENTORY.yml?"

  si_schema_vacio:
    accion: "ADVERTIR - Schema sin tablas debe tener plan de uso"

  si_no_documentado:
    accion: "BLOQUEAR hasta documentar"
```

---

## MATRIZ DE COHERENCIA

```
┌─────────────────────────────────────────────────────────────────┐
│                    MATRIZ DE COHERENCIA                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   DDL (Schema/Tabla)                                           │
│         │                                                       │
│         ▼                                                       │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│   │   Tabla     │────▶│   Entity    │────▶│  Service    │     │
│   │   DDL       │     │   TypeORM   │     │   NestJS    │     │
│   └─────────────┘     └─────────────┘     └─────────────┘     │
│         │                   │                   │               │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     │
│   │ DATABASE_   │     │ BACKEND_    │     │  QUICK-     │     │
│   │ INVENTORY   │     │ INVENTORY   │     │  API.yml    │     │
│   └─────────────┘     └─────────────┘     └─────────────┘     │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             ▼                                   │
│                    ┌─────────────────┐                         │
│                    │ ENTITIES-CATALOG│                         │
│                    │ MODULES-CATALOG │                         │
│                    │ SERVICES-CATALOG│                         │
│                    └─────────────────┘                         │
│                                                                 │
│   REGLA: Cada flecha representa una DEPENDENCIA OBLIGATORIA    │
│          No puede existir ningún nodo sin sus dependencias     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## EXCEPCIONES PERMITIDAS

```yaml
excepciones:
  tablas_sin_entity:
    - tipo: "Tablas de relación M:N gestionadas por TypeORM"
      requisito: "Documentar en ENTITIES-CATALOG.md sección 'Relaciones'"
      ejemplo: "user_roles, permission_roles"

    - tipo: "Tablas de auditoría automática"
      requisito: "Documentar en DATABASE-SCHEMA.md sección 'Audit'"
      ejemplo: "audit_logs, activity_logs"

    - tipo: "Tablas de sistema/migración"
      requisito: "Documentar en DATABASE-SCHEMA.md sección 'System'"
      ejemplo: "migrations, typeorm_metadata"

  entities_sin_tabla:
    - tipo: "View entities (solo lectura)"
      requisito: "Documentar como @ViewEntity con query"
      ejemplo: "UserStatsView, DashboardSummaryView"

    - tipo: "Entities embebidas"
      requisito: "Documentar como @Embeddable"
      ejemplo: "AddressEmbed, MetadataEmbed"

  schemas_sin_modulo:
    - tipo: "Schemas planificados (FUTURE)"
      requisito: "Documentar en DATABASE_INVENTORY con estado='PLANNED'"
      requisito_2: "Crear issue/ticket de implementación"
```

---

## FLUJO DE VALIDACIÓN

```
┌─────────────────────────────────────────────────────────────────┐
│                   FLUJO DE VALIDACIÓN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Agente completa tarea                                     │
│         │                                                       │
│         ▼                                                       │
│   2. TRIGGER-COHERENCIA-CAPAS se activa                        │
│         │                                                       │
│         ▼                                                       │
│   3. Detectar tipo de cambio (DDL/BE/FE)                       │
│         │                                                       │
│         ▼                                                       │
│   4. Ejecutar verificaciones según tipo                        │
│         │                                                       │
│         ├──── SI PASA ────▶ 5a. Permitir completar tarea       │
│         │                                                       │
│         └──── SI FALLA ───▶ 5b. BLOQUEAR y reportar gaps       │
│                                    │                            │
│                                    ▼                            │
│                             6. Agente debe:                     │
│                                - Crear objetos faltantes        │
│                                - Documentar en inventarios      │
│                                - Re-ejecutar validación         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## CHECKLIST DE COHERENCIA

### Para Cambios DDL

```markdown
[ ] Tabla tiene entity correspondiente en backend
[ ] Campos de entity coinciden con columnas de tabla
[ ] Tipos de datos son compatibles
[ ] Tabla documentada en DATABASE_INVENTORY.yml
[ ] Schema documentado en DATABASE-SCHEMA.md
[ ] Entity documentada en ENTITIES-CATALOG.md
```

### Para Cambios Backend

```markdown
[ ] Entity tiene tabla DDL correspondiente
[ ] Campos coinciden con DDL
[ ] Módulo documentado en MODULES-CATALOG.md
[ ] Servicios documentados en SERVICES-CATALOG.md
[ ] Entity documentada en BACKEND_INVENTORY.yml
[ ] Endpoints documentados en QUICK-API.yml
```

### Para Nuevo Schema

```markdown
[ ] Schema tiene módulo backend planificado o existente
[ ] Schema documentado en DATABASE-SCHEMA.md
[ ] Schema en DATABASE_INVENTORY.yml
[ ] Si no tiene módulo: documentar como PLANNED con fecha estimada
```

---

## INTEGRACIÓN CON OTROS TRIGGERS

```yaml
secuencia_triggers:
  1: "TRIGGER-ANTI-DUPLICACION"      # Verificar no existe
  2: "TRIGGER-ANALISIS-DEPENDENCIAS" # Mapear impacto
  3: "TRIGGER-COHERENCIA-CAPAS"      # ← ESTE TRIGGER
  4: "TRIGGER-DOCUMENTACION-OBLIGATORIA" # Documentar

orden: "TRIGGER-COHERENCIA-CAPAS se ejecuta ANTES de TRIGGER-DOC"
razon: "No se puede documentar algo que no está coherente"
```

---

## MENSAJES DE ERROR

```yaml
errores:
  E-COH-001:
    mensaje: "Tabla DDL sin entity correspondiente"
    accion: "Crear entity antes de completar tarea"
    bloqueante: true

  E-COH-002:
    mensaje: "Entity sin tabla DDL"
    accion: "Crear tabla DDL o documentar como excepción"
    bloqueante: true

  E-COH-003:
    mensaje: "Schema sin módulo backend"
    accion: "Crear módulo o documentar como PLANNED"
    bloqueante: true

  E-COH-004:
    mensaje: "Objeto no documentado en inventario"
    accion: "Actualizar inventario correspondiente"
    bloqueante: true

  E-COH-005:
    mensaje: "Discrepancia de campos DDL ↔ Entity"
    accion: "Sincronizar campos entre DDL y Entity"
    bloqueante: true
```

---

## REFERENCIAS

| Alias | Descripción |
|-------|-------------|
| @TRIGGER_COHERENCIA | Este trigger |
| @DEF_CHK_POST | Checklist post-tarea |
| @TRIGGER-DOC | Documentación obligatoria |
| @SIMCO-VALIDAR | Directiva de validación |

---

**Versión:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Trigger Preventivo
