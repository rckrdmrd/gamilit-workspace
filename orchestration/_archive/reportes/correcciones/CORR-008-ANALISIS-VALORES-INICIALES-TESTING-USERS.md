---
id: "CORR-008-ANALISIS"
title: "Analisis - Valores Iniciales Usuarios de Testing"
type: "Analisis"
status: "Done"
priority: "P1"
assignee: "@Orquestador"
related_task: "CORR-008"
affected_modules: ["database", "seeds", "gamification_system", "auth"]
affected_files:
  - "apps/database/seeds/prod/gamification_system/05-user_stats.sql"
  - "apps/database/seeds/prod/gamification_system/06-user_ranks.sql"
  - "apps/database/seeds/prod/gamification_system/08-user_achievements.sql"
  - "apps/database/seeds/prod/gamification_system/09-comodines_inventory.sql"
  - "apps/database/seeds/dev/gamification_system/05-user_stats.sql"
  - "apps/database/seeds/dev/gamification_system/06-user_ranks.sql"
  - "apps/database/seeds/dev/gamification_system/08-user_achievements.sql"
  - "apps/database/seeds/dev/gamification_system/09-comodines_inventory.sql"
  - "apps/database/seeds/dev/auth/02-test-users.sql"
labels: ["correccion", "database", "seeds", "gamification", "testing-users", "analisis"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# ANALISIS PRE-EJECUCION: CORR-008 - Valores Iniciales Usuarios de Testing

**Agente:** Orquestador (Tech Lead)
**Tipo de tarea:** Correccion de Seeds de Base de Datos
**Prioridad:** P1
**Fecha analisis:** 2026-01-07
**Relacionado con:** Database, Gamification System, Auth Management

---

## CONTEXTO DE LA TAREA

### Solicitud Original

El usuario `student@gamilit.com` iniciaba sesion con 3200 XP, nivel 3, y logros asignados sin haber completado ningun ejercicio. Se requeria analizar y corregir los seeds de la base de datos para que los usuarios de testing (admin@, teacher@, student@gamilit.com) iniciaran con valores identicos a los de un usuario recien registrado.

### Objetivo Final

Que los usuarios de testing (admin@gamilit.com, teacher@gamilit.com, student@gamilit.com) inicien con los mismos valores que cualquier usuario nuevo registrado via el trigger `initialize_user_stats()`:

| Campo | Valor Inicial |
|-------|---------------|
| level | 1 |
| total_xp | 0 |
| ml_coins | 100 |
| current_rank | 'Ajaw' |
| exercises_completed | 0 |
| achievements_earned | 0 |

### Modulo Relacionado

**Modulo MVP:** Gamification System - Seeds de Datos Iniciales
**Seccion en MVP-APP.md:** Base de Datos > Seeds > gamification_system

### Justificacion

- **Consistencia:** Los usuarios de testing deben comportarse exactamente como usuarios nuevos para pruebas validas
- **Reproducibilidad:** Las pruebas de QA requieren un estado inicial conocido y predecible
- **Integridad:** Los leaderboards no deben mostrar usuarios de testing con datos artificiales elevados

---

## INVENTARIO ACTUAL

### Consultas Realizadas

**Inventarios revisados:**
- [x] Seeds de gamification_system (PROD y DEV)
- [x] Seeds de auth (usuarios y profiles)
- [x] Trigger initialize_user_stats() en gamilit schema
- [x] Valores por defecto en tablas de gamification

**Comandos ejecutados:**
```bash
# Verificacion de valores actuales pre-correccion
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit_platform -c "
SELECT p.email, us.level, us.total_xp, us.ml_coins, ur.current_rank,
       us.exercises_completed, us.achievements_earned
FROM auth_management.profiles p
LEFT JOIN gamification_system.user_stats us ON p.id = us.user_id
LEFT JOIN gamification_system.user_ranks ur ON p.id = ur.user_id AND ur.is_current = true
WHERE p.email LIKE '%@gamilit.com'
ORDER BY p.email;"

# Resultado PRE-correccion:
# admin@gamilit.com   | 5 | 50000 | 5000 | K'uk'ulkan | 0 | 3
# student@gamilit.com | 3 | 3200  | 580  | Nacom      | 0 | 5
# teacher@gamilit.com | 4 | 15000 | 1500 | Halach Uinic | 0 | 2
```

### Objetos Existentes Relacionados

**Seeds PROD:**
- `05-user_stats.sql`: Contenia FASE 3 que actualizaba usuarios @gamilit.com con XP elevado
- `06-user_ranks.sql`: Actualizaba rangos de usuarios @gamilit.com dinamicamente
- `08-user_achievements.sql`: Insertaba achievements para UUIDs de testing
- `09-comodines_inventory.sql`: (Solo en DEV) asignaba comodines a usuarios @gamilit.com

**Seeds DEV:**
- Mismos archivos que PROD con mismas problematicas
- `02-test-users.sql`: Archivo redundante que intentaba crear usuarios duplicados

**Trigger:**
- `gamilit.initialize_user_stats()`: Crea valores iniciales correctos para usuarios nuevos

### Objetos a Crear/Modificar

**Objetos a modificar (PROD):**
- [x] `05-user_stats.sql` - Comentar FASE 3 completa
- [x] `06-user_ranks.sql` - Agregar exclusion de usuarios @gamilit.com
- [x] `08-user_achievements.sql` - Remover INSERTs para UUIDs de testing

**Objetos a modificar (DEV):**
- [x] `05-user_stats.sql` - Comentar FASE 3 completa
- [x] `06-user_ranks.sql` - Agregar exclusion de usuarios @gamilit.com
- [x] `08-user_achievements.sql` - Remover INSERTs para UUIDs de testing
- [x] `09-comodines_inventory.sql` - Agregar exclusion de usuarios @gamilit.com

**Objetos a eliminar:**
- [x] `02-test-users.sql` (DEV) - Archivo redundante

---

## ANALISIS DE CAUSA RAIZ

### Problema Identificado

Los seeds de gamification_system contenian logica que ACTUALIZABA los valores de los usuarios de testing (@gamilit.com) despues de que el trigger `initialize_user_stats()` ya habia creado los valores iniciales correctos.

### Flujo del Problema

```
1. create-database.sh ejecuta seeds
2. 01-demo-users.sql crea usuarios con UUIDs aaaa.../bbbb.../cccc...
3. 04-profiles-complete.sql crea profiles → dispara trigger initialize_user_stats()
4. Trigger crea user_stats con level=1, xp=0, ml_coins=100, rank='Ajaw'
5. 05-user_stats.sql FASE 3 ACTUALIZA student@gamilit.com con level=3, xp=3200
6. 06-user_ranks.sql ACTUALIZA rank de student@gamilit.com a 'Nacom'
7. 08-user_achievements.sql INSERTA achievements para UUID cccc... (student)
```

### UUIDs de Usuarios de Testing

| Usuario | UUID (auth.users) | UUID (profiles) |
|---------|-------------------|-----------------|
| admin@gamilit.com | aaaa...-aaaa | aaaa...-aaaa |
| teacher@gamilit.com | bbbb...-bbbb | bbbb...-bbbb |
| student@gamilit.com | cccc...-cccc | cccc...-cccc |

### Archivo Redundante

`02-test-users.sql` intentaba crear los mismos usuarios con UUIDs diferentes (dddd.../eeee.../ffff...) pero ON CONFLICT mantenia los UUIDs originales, haciendo el archivo inutil.

---

## ANALISIS DE RIESGOS

### Riesgo de Duplicacion

**Verificacion:**
- [x] NO hay duplicacion - solo modificacion de seeds existentes
- [x] NO se crean nuevos objetos de base de datos
- [x] NO se modifican DDL

**Decision:**
- [x] Modificar seeds existentes
- [x] Eliminar archivo redundante

### Otros Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Seeds PROD y DEV desincronizados | Alta | Alto | Aplicar mismos cambios a ambos |
| create-database.sh falla | Baja | Alto | Ejecutar recreacion completa para validar |
| Usuarios demo sin datos de ejemplo | Media | Bajo | Solo afecta testing users, demo users mantienen datos |

---

## ANALISIS DE IMPACTO

### Archivos Afectados

**PROD (4 archivos modificados):**
1. `apps/database/seeds/prod/gamification_system/05-user_stats.sql`
2. `apps/database/seeds/prod/gamification_system/06-user_ranks.sql`
3. `apps/database/seeds/prod/gamification_system/08-user_achievements.sql`
4. (09-comodines_inventory.sql no existe en PROD)

**DEV (5 archivos: 4 modificados, 1 eliminado):**
1. `apps/database/seeds/dev/gamification_system/05-user_stats.sql`
2. `apps/database/seeds/dev/gamification_system/06-user_ranks.sql`
3. `apps/database/seeds/dev/gamification_system/08-user_achievements.sql`
4. `apps/database/seeds/dev/gamification_system/09-comodines_inventory.sql`
5. `apps/database/seeds/dev/auth/02-test-users.sql` (ELIMINADO)

**Total archivos:**
- Modificar: 7
- Eliminar: 1

### Dependencias

**Esta tarea depende de:**
- Trigger `gamilit.initialize_user_stats()` funcionando correctamente (verificado)

**Bloqueadores actuales:**
- Ninguno

**Esta tarea bloquea:**
- Ninguna tarea

### Modulos Afectados

**Impacto directo:**
- Seeds de gamification_system
- Seeds de auth (DEV)

**Impacto indirecto:**
- Leaderboards (mostraran valores reales)
- Achievements page (usuarios testing sin achievements)

---

## DECISION DE APPROACH

### Approach Seleccionado

1. Comentar FASE 3 completa en `05-user_stats.sql` (PROD y DEV)
2. Agregar exclusion `AND p.email NOT IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')` en `06-user_ranks.sql`
3. Remover INSERTs con UUIDs de testing en `08-user_achievements.sql`
4. Agregar exclusion en `09-comodines_inventory.sql` (solo DEV)
5. Eliminar archivo redundante `02-test-users.sql`

**Razones:**
1. Minimo cambio necesario
2. Usuarios demo (no @gamilit.com) mantienen datos de ejemplo
3. create-database.sh no requiere modificaciones

### Alternativas Consideradas

**Alternativa 1:** Crear seeds separados para testing vs demo
- **Pros:** Mayor claridad en separacion
- **Contras:** Requiere restructurar todo el sistema de seeds
- **Razon de descarte:** Scope excesivo

**Alternativa 2:** Modificar trigger para detectar @gamilit.com
- **Pros:** Solucion en un solo lugar
- **Contras:** Mezcla logica de negocio con logica de testing
- **Razon de descarte:** Anti-patron

---

## NECESIDAD DE SUBAGENTES

### Analisis de Complejidad

**Criterios:**
- Numero de pasos: 5 → Medio
- Modulos afectados: 2 (seeds PROD, seeds DEV) → Simple
- Archivos a modificar: 8 → Medio
- Coordinacion entre capas: No

**Decision:**
- [x] **NO usar subagentes** - Tarea de modificacion directa de seeds

---

## ESTIMACION PRELIMINAR

### Recursos Necesarios

**Agentes:**
- Agente principal: Orquestador

**Herramientas:**
- Edit tool para modificar seeds
- Bash para recrear base de datos
- Bash para validar datos

**Informacion adicional requerida:**
- Ninguna

---

## REFERENCIAS CONSULTADAS

### Documentacion del Proyecto

- [x] `apps/database/create-database.sh` - Orden de carga de seeds
- [x] `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql` - Trigger de inicializacion

### Codigo Existente

**Archivos de referencia:**
- Trigger `initialize_user_stats()`: Define valores iniciales correctos
- Seeds existentes: Patron de exclusion en otros seeds

---

## CONCLUSION DEL ANALISIS

### Resumen

Los usuarios de testing (@gamilit.com) iniciaban con valores elevados (XP, nivel, achievements) porque los seeds de gamification_system actualizaban estos valores despues de que el trigger los creaba correctamente. La solucion requiere comentar/excluir la logica que afecta a usuarios de testing en 7 archivos y eliminar 1 archivo redundante.

### Decisiones Clave

1. **Approach:** Comentar FASE 3 y agregar exclusiones WHERE
2. **Subagentes:** No usar
3. **Objetos a modificar:** 7 seeds SQL
4. **Objetos a eliminar:** 1 seed SQL redundante
5. **Riesgo:** Bajo

### Recomendaciones

1. Ejecutar recreacion completa de base de datos despues de cambios
2. Verificar valores de los 3 usuarios de testing post-recreacion
3. Documentar exclusion de testing users para futuros seeds

### Aprobacion para Proceder

- [x] Analisis completo y documentado
- [x] Sin bloqueadores identificados
- [x] Recursos disponibles
- [x] Estimaciones validadas
- [x] **APROBADO PARA EJECUCION**

---

## PROXIMO PASO

**Accion:** Ejecutar plan de modificacion de seeds

**Documentos relacionados:**
- [CORR-008-PLAN-EJECUCION.md](./CORR-008-PLAN-EJECUCION.md)
- [CORR-008-REPORTE-EJECUCION.md](./CORR-008-REPORTE-EJECUCION.md)

---

**Analizado por:** Orquestador (Tech Lead)
**Fecha:** 2026-01-07
**Version:** 1.0
**Estado:** COMPLETADO
