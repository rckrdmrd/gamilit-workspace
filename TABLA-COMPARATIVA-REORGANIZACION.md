# Tabla Comparativa: Estado Actual vs Propuesto

## Resumen por Schema

| Schema | Tables | Enums | Functions | Triggers | RLS | Indexes | Views | MViews | Problemas | Prioridad |
|--------|--------|-------|-----------|----------|-----|---------|-------|--------|-----------|-----------|
| **admin_dashboard** | - | - | - | - | - | - | 4 | - | Schema incompleto | P2 |
| **audit_logging** | 6 | - | 1 | 1 | 1 | - | - | - | ✅ OK | P0 |
| **auth** | 1 | 2 | 0* | - | - | - | - | - | Carpeta vacía | P3 |
| **auth_management** | 15 | - | 6 | 6 | 1 | 2 | - | - | 3 duplicados + saltos | P0 |
| **content_management** | 8 | - | - | 3 | 1 | 2 | - | - | Mezcla numeración | P1 |
| **educational_content** | 15 | 3 | 3 | 4 | 2 | - | - | - | Mezcla numeración | P1 |
| **gamification_system** | 15 | 4 | 23 | 9 | 8 | 4 | 4 | 4 | 7 problemas | P0 |
| **gamilit** | - | - | 13 | - | - | - | - | - | Solo functions + dups | P2 |
| **lti_integration** | 3 | - | 0* | 0* | - | - | - | - | Carpetas vacías | P3 |
| **progress_tracking** | 13 | 1 | 6 | 3 | 2 | 2 | 1 | - | Mezcla + deprecated | P1 |
| **public** | 0* | 5 | 7 | 8 | - | 64 | 3 | - | 6 problemas | P0 |
| **social_features** | 15 | - | 1 | 5 | 8 | - | - | - | 4 problemas | P1 |
| **storage** | - | 1 | - | - | - | - | - | - | Schema incompleto | P3 |
| **system_configuration** | 6 | - | - | 2 | 1 | - | - | - | Mezcla numeración | P1 |
| **TOTALES** | **97** | **16** | **60** | **41** | **24** | **74** | **12** | **4** | **25 problemas** | - |

\* Carpeta existe pero sin archivos SQL

---

## Problemas Detallados por Schema

### 🔴 CRÍTICO (P0) - Requiere acción inmediata

#### gamification_system (7 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Duplicados | tables/ | 08: notifications vs comodin_usage_log | Renumerar comodin a 14 |
| Duplicados | tables/ | 09: leaderboard vs comodin_tracking | Renumerar tracking a 15 |
| Duplicados | indexes/ | 01 duplicado | Renumerar |
| Duplicados | indexes/ | 02 duplicado | Renumerar |
| Duplicados | rls-policies/ | 02, 03 duplicados | Renumerar |
| Duplicados | triggers/ | 18 duplicado | Renumerar |
| Saltos | triggers/ | 01, 02, 15-20 (falta 03-14) | Renumerar desde 01 |

#### auth_management (3 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Duplicados | tables/ | 08: security_events vs parent_accounts | Renumerar parent a 10 |
| Duplicados | tables/ | 09: user_preferences vs parent_links | Renumerar links a 11 |
| Duplicados | tables/ | 10: user_roles vs parent_notifications | Renumerar notifications a 12 |

#### public (6 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Numeración absurda | indexes/ | Numerados 239-271 | Renumerar desde 01 o mover |
| Schema legacy | todo el schema | 87 objetos cuando debería estar vacío | Migrar a schemas apropiados |
| Mezcla numeración | indexes/ | 30 numerados, 34 sin numerar | Estandarizar |
| Saltos | triggers/ | Falta 06-08 | Renumerar |
| Archivo sospechoso | views/ | 03-for.sql usa palabra reservada | Renombrar o eliminar |
| Carpeta vacía | tables/ | Sin archivos | Eliminar carpeta |

---

### 🟡 ALTO (P1) - Siguiente sprint

#### content_management (2 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Mezcla numeración | tables/ | 5 numerados, 3 sin numerar | Numerar todos (04-06) |
| Triggers mal numerados | triggers/ | 08-10, deberían ser 01-03 | Renumerar desde 01 |

#### educational_content (2 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Mezcla numeración | tables/ | 4 numerados, 11 sin numerar | Numerar todos (05-15) |
| Triggers mal numerados | triggers/ | 11-14, deberían ser 01-04 | Renumerar desde 01 |

#### progress_tracking (3 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Mezcla numeración | tables/ | 5 numerados, 8 sin numerar | Numerar todos |
| Saltos | functions/ | Falta 02 | Renumerar secuencialmente |
| Triggers mal numerados | triggers/ | 21-23, deberían ser 01-03 | Renumerar desde 01 |

#### social_features (4 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Mezcla numeración | tables/ | 10 numerados, 5 sin numerar | Numerar todos |
| Duplicados | tables/ | 07: team_challenges vs peer_challenges | Renumerar peer a 10 |
| Duplicados | rls-policies/ | 02, 03 duplicados | Renumerar |
| Triggers mal numerados | triggers/ | 24-28, deberían ser 01-05 | Renumerar desde 01 |

#### system_configuration (2 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Mezcla numeración | tables/ | 3 numerados, 3 sin numerar | Numerar todos |
| Triggers mal numerados | triggers/ | 29-30, deberían ser 01-02 | Renumerar desde 01 |

---

### 🔵 MEDIO (P2) - Siguiente mes

#### gamilit (2 problemas)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Saltos | functions/ | 1-5, 8-14 (falta 6-7) | Renumerar secuencialmente |
| Duplicados | functions/ | 09 duplicado | Renumerar |

#### admin_dashboard (1 problema)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Schema incompleto | - | Solo tiene views, sin tables | Evaluar si necesita más objetos |

---

### ⚪ BAJO (P3) - Backlog

#### auth (1 problema)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Carpeta vacía | functions/ | Sin archivos SQL | Eliminar carpeta |

#### lti_integration (1 problema)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Carpetas vacías | functions/, triggers/ | Sin archivos SQL | Eliminar carpetas |

#### storage (1 problema)

| Problema | Ubicación | Detalle | Acción |
|----------|-----------|---------|--------|
| Schema incompleto | - | Solo 1 enum | Evaluar si necesita más objetos |

---

## Estado Propuesto (Post-Reorganización)

### Convenciones Aplicadas

| Tipo | Numeración | Patrón | Ejemplo |
|------|------------|--------|---------|
| **tables** | ✅ OBLIGATORIA | `NN-nombre_tabla.sql` | `01-users.sql` |
| **triggers** | ✅ OBLIGATORIA | `NN-trg_evento_tabla.sql` | `01-trg_users_updated_at.sql` |
| **rls-policies** | ✅ OBLIGATORIA | `NN-descripcion_policies.sql` | `01-enable-rls.sql` |
| **enums** | ❌ SIN NUMERAR | `nombre_enum.sql` | `maya_rank.sql` |
| **functions** | ❌ SIN NUMERAR* | `nombre_funcion.sql` | `award_ml_coins.sql` |
| **views** | ❌ SIN NUMERAR* | `nombre_view.sql` | `user_stats_summary.sql` |
| **indexes** | ⚠️ OPCIONAL | `idx_tabla_columna.sql` | `idx_users_email_unique.sql` |
| **materialized-views** | ✅ RECOMENDADA | `NN-mv_nombre.sql` | `01-mv_global_leaderboard.sql` |

\* Excepto si hay dependencias funcionales explícitas

---

## Impacto de la Reorganización

### Por Tipo de Cambio

| Tipo de Cambio | Cantidad | Schemas Afectados | Riesgo |
|----------------|----------|-------------------|--------|
| **Renombrar** (duplicados resueltos) | 25 archivos | 4 schemas | Bajo (git mv) |
| **Renumerar** (triggers desde 01) | 18 archivos | 5 schemas | Bajo (git mv) |
| **Numerar** (tables sin numerar) | ~50 archivos | 6 schemas | Medio (cambio estructura) |
| **Mover** (desde public/) | 87 archivos | 1→9 schemas | Medio (cambio ubicación) |
| **Eliminar** (deprecated) | 15 archivos | 2 schemas | Bajo (backup) |
| **Crear** (documentación) | 20 archivos | 14 schemas | Bajo (nuevos) |
| **TOTAL** | **~215 archivos** | **14 schemas** | **Medio** |

### Métricas de Mejora

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Archivos con numeración duplicada | 25 | 0 | ✅ 100% |
| Schemas con mezcla numeración | 7 | 0 | ✅ 100% |
| Objetos en public/ | 87 | ~10 | ✅ 88% |
| Triggers mal numerados | 18 | 0 | ✅ 100% |
| Carpetas vacías | 4 | 0 | ✅ 100% |
| Schemas sin documentación | 14 | 0 | ✅ 100% |
| Saltos de numeración | 30 | 0 | ✅ 100% |
| **Problemas totales** | **25** | **0** | ✅ **100%** |

---

## Timeline de Ejecución

```
Semana 1:
  ├─ Lunes:     Fase 0 (Preparación) + Fase 1 (Limpieza P0)
  ├─ Martes:    Fase 2 (Estandarización numeración)
  ├─ Miércoles: Fase 3 (Migración public/)
  ├─ Jueves:    Fase 4 (Estructura) + Fase 5 (Documentación)
  └─ Viernes:   Fase 6 (Validación) + Code Review

Semana 2:
  ├─ Lunes:     Ajustes post-review
  ├─ Martes:    Testing exhaustivo
  ├─ Miércoles: Merge a main
  └─ Jueves+:   Monitoreo y ajustes
```

---

## Checklist de Validación Post-Reorganización

### Estructura

- [ ] Todos los schemas tienen _MAP.md
- [ ] No hay carpetas vacías
- [ ] No hay numeración duplicada
- [ ] Triggers numerados desde 01 en cada schema
- [ ] Tables numeradas completamente
- [ ] Enums sin numerar
- [ ] Functions sin numerar (excepto dependencias)

### Funcionalidad

- [ ] init-database.sh ejecuta sin errores
- [ ] Todos los objetos se crean en orden correcto
- [ ] RLS policies se aplican correctamente
- [ ] Triggers se activan en orden esperado
- [ ] No hay referencias rotas

### Documentación

- [ ] README.md principal creado
- [ ] Cada _MAP.md lista todos los objetos del schema
- [ ] Comentarios SQL actualizados
- [ ] Git history preservado (git mv)

### Migración

- [ ] Public schema contiene solo objetos globales justificados
- [ ] Enums migrados a schemas apropiados
- [ ] Functions migradas a schemas apropiados
- [ ] Indexes migrados a schemas de sus tablas
- [ ] Deprecated archivos respaldados

---

**Generado**: 2025-11-09  
**Schemas**: 14  
**Archivos analizados**: ~350  
**Problemas encontrados**: 25  
**Problemas post-reorganización**: 0
