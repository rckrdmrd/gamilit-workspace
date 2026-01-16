# DEPRECATED-SEEDS.md

**Ultima actualizacion:** 2026-01-14
**Total seeds deprecados:** 19
**Ubicacion:** `seeds/prod/{schema}/_deprecated/`

---

## Resumen por Categoria

| Categoria | Cantidad | Descripcion |
|-----------|----------|-------------|
| Test/Demo | 8 | Datos de prueba no aptos para produccion |
| Sample Data | 6 | Datos de ejemplo ya incluidos en otros seeds |
| Obsolete | 3 | Funcionalidad removida o cambiada |
| Duplicate | 2 | Duplicados con seeds activos |

---

## audit_logging/_deprecated/ (3 archivos)

| Archivo | Razon | Fecha |
|---------|-------|-------|
| `01-activity_log_sample.sql` | **Sample Data** - Datos de ejemplo. La tabla activity_log se puebla automaticamente via triggers | 2026-01-14 |
| `01-audit-logs.sql` | **Sample Data** - Datos de ejemplo. audit_logs se puebla via funcion `log_audit_event()` | 2026-01-14 |
| `02-system-metrics.sql` | **Sample Data** - Metricas de ejemplo. Se generan automaticamente por el sistema | 2026-01-14 |

---

## auth/_deprecated/ (1 archivo)

| Archivo | Razon | Fecha |
|---------|-------|-------|
| `02-test-users.sql` | **Test Data** - Usuarios de prueba. No crear usuarios en seeds de produccion; usar proceso de registro normal | 2026-01-14 |

---

## auth_management/_deprecated/ (6 archivos)

| Archivo | Razon | Fecha |
|---------|-------|-------|
| `03-profiles.sql` | **Test Data** - Profiles de prueba. Los profiles se crean automaticamente via trigger al registrar usuario | 2026-01-14 |
| `04-user_roles.sql` | **Test Data** - Roles asignados manualmente. Los roles se asignan via funcion `assign_role_to_user()` | 2026-01-14 |
| `05-profiles-demo.sql` | **Test Data** - Profiles demo. Duplicado con 03-profiles.sql | 2026-01-14 |
| `05-user_preferences.sql` | **Test Data** - Preferencias de prueba. Se crean automaticamente con defaults | 2026-01-14 |
| `06-auth_attempts.sql` | **Sample Data** - Intentos de auth de ejemplo. Tabla poblada automaticamente por el sistema | 2026-01-14 |
| `07-security_events.sql` | **Sample Data** - Eventos de seguridad de ejemplo. Tabla poblada via triggers de auditoria | 2026-01-14 |

---

## content_management/_deprecated/ (2 archivos)

| Archivo | Razon | Fecha |
|---------|-------|-------|
| `01-marie-curie-bio.sql` | **Obsolete** - Contenido de Marie Curie movido a `educational_content/` donde pertenece tematicamente | 2026-01-14 |
| `02-media-files.sql` | **Test Data** - Archivos media de prueba. Media real se sube via Storage API | 2026-01-14 |

---

## educational_content/_deprecated/ (3 archivos)

| Archivo | Razon | Fecha |
|---------|-------|-------|
| `02-exercises-demo.sql` | **Duplicate** - Reemplazado por `04-exercises-m1.sql` a `08-exercises-m5.sql` con ejercicios completos por modulo | 2026-01-14 |
| `03-exercises-complete.sql` | **Duplicate** - Reemplazado por seeds individuales por modulo (04 a 08) | 2026-01-14 |
| `06-exercise-answers.sql` | **Obsolete** - Respuestas ahora incluidas en campo `config` JSONB de cada ejercicio | 2026-01-14 |

---

## progress_tracking/_deprecated/ (3 archivos)

| Archivo | Razon | Fecha |
|---------|-------|-------|
| `01-demo-progress.sql` | **Test Data** - Progreso de demo. Se genera automaticamente al completar ejercicios | 2026-01-14 |
| `02-exercise-attempts.sql` | **Test Data** - Intentos de prueba. Tabla poblada via gameplay real | 2026-01-14 |
| `03-manual-reviews.sql` | **Test Data** - Reviews de prueba. Se crean via trigger al insertar submission | 2026-01-14 |

---

## system_configuration/_deprecated/ (1 archivo)

| Archivo | Razon | Fecha |
|---------|-------|-------|
| `02-feature_flags.sql` | **Duplicate** - Flags ahora consolidados en `01-system_settings.sql` | 2026-01-14 |

---

## Politica de Deprecacion

### Cuando deprecar un seed:

1. **Datos de prueba/demo**: No deben existir en produccion
2. **Datos que se generan automaticamente**: Triggers/funciones los crean
3. **Duplicados**: Cuando otro seed tiene la misma funcionalidad
4. **Obsoletos**: Cuando la tabla/columna ya no existe

### Proceso de deprecacion:

1. Mover archivo a `_deprecated/` dentro del mismo schema
2. Documentar razon en este archivo
3. Verificar que `create-database.sh` NO lo referencia
4. NO eliminar el archivo (por referencia historica)

---

## Seeds Activos vs Deprecados

| Schema | Activos | Deprecados |
|--------|---------|------------|
| auth | 1 | 1 |
| auth_management | 2 | 6 |
| audit_logging | 0 | 3 |
| content_management | 0 | 2 |
| educational_content | 11 | 3 |
| gamification_system | 7 | 0 |
| notifications | 2 | 0 |
| progress_tracking | 0 | 3 |
| social_features | 5 | 0 |
| system_configuration | 1 | 1 |
| lti_integration | 1 | 0 |
| **Total** | **30** | **19** |

---

## Referencia

- `create-database.sh` - Solo carga seeds activos
- `DATABASE_INVENTORY.yml` - Inventario completo
- Seeds activos: `seeds/prod/{schema}/*.sql`
- Seeds deprecados: `seeds/prod/{schema}/_deprecated/*.sql`

---

**Mantenido por:** Database Team
**Version:** 1.0.0
