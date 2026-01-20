# TRIGGER: TypeORM Cross-Datasource Relations

**ID:** TRIGGER-TYPEORM-CROSS-DATASOURCE
**Version:** 1.0.0
**Fecha:** 2026-01-19
**Origen:** TypeORMError en TASK-2026-01-19-013 (Classroom#tenant metadata not found)

---

## Activacion

Este trigger se activa cuando:

1. Se agrega `@ManyToOne`, `@OneToMany`, `@OneToOne`, o `@ManyToMany` a una entidad
2. Se crea una nueva entidad con relaciones
3. Se modifica `app.module.ts` para agregar entidades a un datasource
4. Se ve el error `TypeORMError: Entity metadata for X#Y was not found`

---

## Problema Raiz

TypeORM con **multiples datasources** requiere que **TODAS las entidades referenciadas**
en relaciones esten registradas en el **MISMO datasource**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ERROR COMUN                                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Datasource 'social':                                                   │
│    - Classroom (tiene @ManyToOne(() => Tenant))                        │
│    - School                                                            │
│                                                                         │
│  Datasource 'auth':                                                     │
│    - Tenant   <-- NO esta en 'social'!                                 │
│    - Profile  <-- NO esta en 'social'!                                 │
│                                                                         │
│  RESULTADO:                                                             │
│  TypeORMError: Entity metadata for Classroom#tenant was not found      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Validaciones Requeridas

### 1. Antes de Agregar @ManyToOne o Similar

```bash
# Identificar en que datasource esta la entidad actual
grep -n "nombre-entity.entity" apps/backend/src/app.module.ts

# Verificar que la entidad relacionada esta en el MISMO datasource
```

### 2. Verificar Cascada de Dependencias

Si `EntityA -> EntityB -> EntityC`:

```
EntityA tiene @ManyToOne(() => EntityB)
EntityB tiene @ManyToOne(() => EntityC)

ENTONCES: EntityA, EntityB, Y EntityC deben estar en el MISMO datasource
```

### 3. Checklist de Validacion

```
[ ] Identificar datasource de la entidad actual (ej: 'social')
[ ] Identificar TODAS las entidades referenciadas en @ManyToOne, etc.
[ ] Verificar que TODAS estan registradas en el MISMO datasource
[ ] Si faltan, agregarlas a app.module.ts en el datasource correcto
[ ] npm run build pasa sin TypeORMError
[ ] Backend inicia correctamente (npm run start:dev)
```

---

## Solucion

### Agregar Entidades Faltantes al Datasource

En `apps/backend/src/app.module.ts`:

```typescript
// Datasource 'social' ANTES (ERROR):
entities: [
  __dirname + '/modules/social/entities/**/*.entity{.ts,.js}',
],

// Datasource 'social' DESPUES (CORRECTO):
entities: [
  __dirname + '/modules/social/entities/**/*.entity{.ts,.js}',
  // FIX-BE-XXX: Required for @ManyToOne relations
  __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
  __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
],
```

---

## Patron de Documentacion

Siempre documentar el FIX con comentario:

```typescript
// FIX-BE-XXX-YYYY-MM-DD: Added [Entity] for [RelatedEntity] @ManyToOne relation
__dirname + '/modules/XXX/entities/entity-name.entity{.ts,.js}',
```

---

## Datasources Actuales y Sus Dependencias Conocidas

| Datasource | Entidades Base | Dependencias Agregadas |
|------------|----------------|------------------------|
| auth | User, Profile, Tenant, Role | - |
| educational | - | Assignment, TeacherContent |
| gamification | - | Notification |
| progress | Progress entities | Profile, Classroom, Tenant |
| social | Social entities | Profile, Tenant, Assignment |
| content | Content entities | - |
| audit | Audit entities | - |
| notifications | Multichannel entities | - |
| communication | Message entities | - |
| admin_dashboard | AdminReport | User, Role |

---

## Ejemplo Completo: FIX-BE-012-2026-01-19

**Error:**
```
TypeORMError: Entity metadata for Classroom#tenant was not found
TypeORMError: Entity metadata for Classroom#school was not found
```

**Causa:**
- `Classroom` tiene `@ManyToOne(() => Tenant)` y `@ManyToOne(() => Profile)`
- `Tenant` y `Profile` no estaban registradas en datasource 'social'

**Solucion:**
```typescript
// En app.module.ts, datasource 'social':
entities: [
  __dirname + '/modules/social/entities/**/*.entity{.ts,.js}',
  __dirname + '/modules/assignments/entities/**/*.entity{.ts,.js}',
  __dirname + '/modules/teacher/entities/teacher-report.entity{.ts,.js}',
  // FIX-BE-012: Required for Classroom, ClassroomMember, TeacherClassroom @ManyToOne relations
  __dirname + '/modules/auth/entities/profile.entity{.ts,.js}',
  __dirname + '/modules/auth/entities/tenant.entity{.ts,.js}',
],
```

---

## Acciones en Caso de Violacion

1. **DETENER** implementacion si ve TypeORMError de metadata
2. **IDENTIFICAR** que entidad relacionada falta
3. **AGREGAR** la entidad al datasource correspondiente
4. **VALIDAR** con `npm run build` y `npm run start:dev`
5. **DOCUMENTAR** el FIX con comentario explicativo

---

## Referencias

- `apps/backend/src/app.module.ts` - Configuracion de datasources
- `orchestration/tareas/TASK-2026-01-19-013/` - Tarea donde se documento este problema
- TypeORM Docs: https://typeorm.io/multiple-connections

---

**Creado por:** Claude Opus 4.5
**Fecha:** 2026-01-19
**Referencia:** TASK-2026-01-19-013
