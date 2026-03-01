---
titulo: UUID Series Catalog
tipo: arquitectura
ultima_actualizacion: 2026-02-27
---

# UUID Series Catalog

**Version:** 1.0.0
**Fecha:** 2026-02-20
**Origen:** TASK-2026-02-20-UUID-AUDIT (Seccion A4)

---

## Convencion

Los seeds de GAMILIT usan UUIDs estructurados (prefijos legibles) para facilitar debugging y trazabilidad. Estos UUIDs NO son RFC 4122 v4 pero son validos en PostgreSQL.

**Patron general:** `PPPPPPPP-SSSS-0000-0000-00000000000N`
- `P` = Prefijo de dominio (identifica el tipo de entidad)
- `S` = Sub-serie (variante dentro del dominio)
- `N` = Secuencia incremental

---

## Series por Dominio

### Core Identity

| Prefijo | Dominio | Ejemplo | Archivo(s) Fuente |
|---------|---------|---------|-------------------|
| `aaaaaaaa-aaaa-*` | Admin user (admin@gamilit.com) | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | 01-demo-users.sql |
| `bbbbbbbb-bbbb-*` | Teacher user (teacher@gamilit.com) | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | 01-demo-users.sql |
| `cccccccc-cccc-*` | Student user (student@gamilit.com) | `cccccccc-cccc-cccc-cccc-cccccccccccc` | 01-demo-users.sql |
| `dddddddd-dddd-*` | Demo student 1 (estudiante1@demo) | `dddddddd-dddd-dddd-dddd-dddddddddddd` | 01b-demo-students.sql |
| `eeeeeeee-eeee-*` | Demo student 2 (estudiante2@demo) | `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee` | 01b-demo-students.sql |
| `ffffffff-ffff-*` | Demo student 3 (estudiante3@demo) | `ffffffff-ffff-ffff-ffff-ffffffffffff` | 01b-demo-students.sql |
| `11111111-2222-*` | Instructor demo | `11111111-2222-3333-4444-555555555555` | 01b-demo-students.sql |

**Nota:** `profiles.id = auth.users.id` para todos los usuarios (identidad unificada).

### Infrastructure

| Prefijo | Dominio | Ejemplo | Archivo(s) Fuente |
|---------|---------|---------|-------------------|
| `a0eebc99-*` | Primary tenant (RFC v4) | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` | 01-tenants.sql |
| `99999999-*` | System school | `99999999-9999-9999-9999-999999999999` | 00-schools-default.sql |
| `00000000-*` | Nil/testing tenants | `00000000-0000-0000-0000-000000000001` | Fallbacks |

### Gamification

| Prefijo | Dominio | Cantidad | Ejemplo | Archivo(s) Fuente |
|---------|---------|----------|---------|-------------------|
| `9000000x-0000-*` | Achievements (PKs) | ~40 | `90000001-0000-0000-0000-000000000001` | 04-achievements, 14-achievements-m3-m5, 20-achievements-collection |
| `8000000x-0001-*` | Shop items + rubrics | ~40 | `80000001-0001-0000-0000-000000000001` | 13-shop_items |
| `80000006-*` | Shop items expanded (dev) | 11 | `80000006-0001-0000-0000-000000000001` | 16-shop_items_expanded |
| `2000000x-*` | Mission templates | 13 | `20000001-0000-0000-0000-000000000001` | 10-mission_templates |
| `81111111-aaaa-*` | Comodin usage tracking | 10 | `81111111-aaaa-1111-1111-111111111001` | 15-comodin_usage_tracking |
| `81111111-bbbb-*` | Comodin fallback IDs | 3 | `81111111-bbbb-1111-1111-111111111001` | 15-comodin_usage_tracking |

### Transactions & Economy

| Prefijo | Dominio | Cantidad | Ejemplo | Archivo(s) Fuente |
|---------|---------|----------|---------|-------------------|
| `d000000x-*` | ML Coins transactions | ~60 | `d0000001-0001-0000-0000-000000000001` | 07-ml_coins_transactions |
| `e000000x-*` | User achievements (asignaciones) | ~20 | `e0000001-0001-0000-0000-000000000001` | 08-user_achievements |
| `18100000-*` | User purchases | 2 | `18100000-0000-0000-0000-000000000001` | 18-user_purchases |
| `19100000-*` | User equipped items | 2 | `19100000-0000-0000-0000-000000000001` | 19-user_equipped_items |

### Social Features

| Prefijo | Dominio | Cantidad | Ejemplo | Archivo(s) Fuente |
|---------|---------|----------|---------|-------------------|
| `61111111-*` | Peer challenges | 10 | `61111111-1111-1111-1111-111111111001` | 08-peer_challenges |
| `71111111-*` | Team challenges / teacher reports | 10 | `71111111-1111-1111-1111-111111111001` | 10-team_challenges, 05-teacher-reports |

### Educational Content

| Prefijo | Dominio | Cantidad | Ejemplo | Archivo(s) Fuente |
|---------|---------|----------|---------|-------------------|
| `30000001-*` | Module dependencies | 6 | `30000001-0000-0000-0000-000000000001` | 04-module_dependencies |
| `40000001-*` | Taxonomies | 4 | `40000001-0000-0000-0000-000000000001` | 03-taxonomy |
| `50000001-*` | Marie Curie content | 6 | `50000001-0000-0000-0000-000000000001` | 02-marie_curie_content |
| `a5500001-*` | Assignments | 9 | `a5500001-0000-0000-0000-000000000001` | 05-assignments |
| `a1b2c3d4-*` | Content templates | 3 | `a1b2c3d4-0001-0000-0000-000000000001` | 01-default-templates |

### Roles & Auth

| Prefijo | Dominio | Cantidad | Ejemplo | Archivo(s) Fuente |
|---------|---------|----------|---------|-------------------|
| `1000000x-*` | Role assignments | 8 | `10000001-0000-0000-0000-000000000001` | 07-user_roles |
| `a0000001-*` | Auth attempts | 8 | `a0000001-0000-0000-0000-000000000001` | 06-auth_attempts |

### LTI Integration

| Prefijo | Dominio | Cantidad | Ejemplo | Archivo(s) Fuente |
|---------|---------|----------|---------|-------------------|
| `10000000-*` / `20000000-*` / `30000000-*` | LTI consumers | 3 | `10000000-0000-0000-0000-000000000001` | 01-lti_consumers |
| `21111111-*` | LTI sessions | 5 | `21111111-1111-1111-1111-111111111001` | 02-lti_sessions |
| `31111111-*` | LTI grade passback | 6 | `31111111-1111-1111-1111-111111111001` | 03-lti_grade_passback |

### Notifications & Communication

| Prefijo | Dominio | Cantidad | Ejemplo | Archivo(s) Fuente |
|---------|---------|----------|---------|-------------------|
| `91111111-*` | Notification logs | 13 | `91111111-1111-1111-1111-111111111001` | 04-notification_logs |
| `a1111111-*` | Notification queue | 8 | `a1111111-1111-1111-1111-111111111001` | 05-notification_queue |
| `c000000x-*` | Communication messages | ~29 | `c0000001-0000-0000-0001-000000000001` | 01-system-messages |

### Admin Operations

| Prefijo | Dominio | Cantidad | Ejemplo | Archivo(s) Fuente |
|---------|---------|----------|---------|-------------------|
| `a0000000-*` / `b0000000-*` | Bulk operations | 10 | `a0000000-0000-0000-0000-000000000001` | 01-bulk_operations |
| `e0000000-*` | Admin reports | 4 | `e0000000-0000-0000-0000-000000000001` | 02-admin_reports |

---

## Notas Importantes

1. **`reference_id` en ml_coins_transactions:** Los UUIDs en el campo `reference_id` (formato `9000000X-000Y-...`) son identificadores informativos que sugieren la entidad relacionada pero NO necesariamente coinciden con los PKs de achievements (`9000000X-0000-...`). No hay FK constraint en este campo — es intencional para flexibilidad.

2. **UUIDs de produccion:** Los 50 usuarios de produccion usan UUIDs RFC 4122 v4 genuinos (generados por PostgreSQL). Solo los seeds de testing/demo usan prefijos estructurados.

3. **`gen_random_uuid()` en seeds:** Evitar en PKs o campos de unique constraints. Usar UUIDs deterministicos para garantizar idempotencia. Ver TASK-2026-02-20-UUID-AUDIT para el analisis completo.

---

## Metricas

| Metrica | Valor |
|---------|-------|
| UUIDs unicos en seeds | ~210 |
| Series/prefijos identificados | 30+ |
| UUIDs malformados | 0 |
| Archivos con UUIDs | 111 de 173 |
