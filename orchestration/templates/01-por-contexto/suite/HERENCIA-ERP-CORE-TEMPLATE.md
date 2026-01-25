# Herencia de ERP-Core

**Proyecto:** {NOMBRE_PROYECTO}
**Nivel:** {STANDALONE | VERTICAL}
**Fecha:** {FECHA}
**Version ERP-Core:** 1.2.0

---

## Cadena de Herencia

```
workspace-v1/orchestration/           <- BASE PRINCIPAL
    |
projects/erp-core/                    <- ERP-CORE (base de datos y modulos)
    |
projects/{NOMBRE_PROYECTO}/           <- ESTE PROYECTO
```

---

## Que Heredamos de ERP-Core

### Schemas de Base de Datos (12 schemas, 144 tablas)

| Schema | Tablas | Uso | Heredado |
|--------|--------|-----|----------|
| `auth_management` | 26 | Autenticacion, MFA, OAuth, roles, permisos | SI |
| `core_management` | 12 | Partners, catalogos, UoM, monedas, secuencias | SI |
| `financial_management` | 15 | Contabilidad, facturas, pagos, asientos | SI |
| `inventory_management` | 20 | Productos, stock, valoracion FIFO/AVCO, lotes | SI |
| `purchasing_management` | 8 | Ordenes de compra, proveedores | SI |
| `sales_management` | 10 | Ventas, cotizaciones, equipos | SI |
| `projects_management` | 10 | Proyectos, tareas, dependencias | SI |
| `analytics_management` | 7 | Contabilidad analitica, centros de costo | SI |
| `system_management` | 13 | Mensajes, notificaciones, logs, auditoria | SI |
| `billing_management` | 11 | SaaS/Suscripciones | OPCIONAL |
| `crm_management` | 6 | Leads, oportunidades | OPCIONAL |
| `hr_management` | 6 | Empleados, contratos, ausencias | SI |

### Variable RLS (OBLIGATORIA)

```sql
current_setting('app.current_tenant_id', true)::UUID
```

**IMPORTANTE:** Toda query debe filtrar por esta variable.

### Modulos Backend Heredados

```typescript
// Imports desde erp-core
import { AuthModule } from '@erp-core/auth';
import { UsersModule } from '@erp-core/users';
import { RolesModule } from '@erp-core/roles';
import { TenantsModule } from '@erp-core/tenants';
import { PartnersModule } from '@erp-core/partners';
// ... otros modulos
```

### Componentes Frontend Heredados

```typescript
// Imports desde erp-core
import { AuthProvider } from '@erp-core/components/auth';
import { LayoutBase } from '@erp-core/components/layout';
import { PermissionGuard } from '@erp-core/guards';
```

---

## Que Extendemos en Este Proyecto

### Schemas Propios

| Schema | Tablas | Descripcion |
|--------|--------|-------------|
| `{schema_1}` | N | {descripcion} |
| `{schema_2}` | N | {descripcion} |

### Modulos Backend Propios

- `{modulo_1}/` - {descripcion}
- `{modulo_2}/` - {descripcion}

### Componentes Frontend Propios

- `{componente_1}/` - {descripcion}
- `{componente_2}/` - {descripcion}

---

## Reglas de Extension

1. **NO modificar** tablas heredadas de erp-core
2. **Extender** mediante:
   - Nuevas tablas con FK a tablas de core
   - Nuevos schemas propios del vertical
3. **Mantener** la variable RLS `app.current_tenant_id`
4. **Seguir** convencion de nomenclatura de core

---

## Referencias

- DDL de erp-core: `projects/erp-core/apps/database/ddl/`
- Documentacion: `projects/erp-core/docs/`
- Guia de alineacion: `GUIA-ALINEACION-ERP-CORE.md`

---

## Validaciones Requeridas

- [ ] Variable RLS correcta en DDL
- [ ] FKs a auth.tenants (no core.*)
- [ ] Schemas propios documentados
- [ ] Imports de erp-core funcionando
- [ ] Tests pasando
