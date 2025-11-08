# Integración con Database

**Código que mapea:** `apps/backend/src/` (integración con PostgreSQL)
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Documenta cómo el backend se integra con PostgreSQL.

---

## 🗄️ Stack de Database

- **Database:** PostgreSQL 16+
- **Cliente:** `pg` (node-postgres)
- **ORM:** TypeORM (planeado) / Queries SQL directos (actual)
- **Schemas:** 9 schemas
- **Tablas:** 44 tablas principales

---

## 📐 Estructura de Schemas

| Schema | Propósito | Tablas |
|--------|-----------|--------|
| `auth_management` | Autenticación | 12 |
| `educational_content` | Contenido educativo | 8 |
| `gamification_system` | Gamificación | 10 |
| `progress_tracking` | Progreso | 6 |
| `social_features` | Social | 8 |
| `content_management` | Media | 5 |
| `audit_logging` | Auditoría | 3 |
| `system_configuration` | Config | 2 |
| `public` | Público | 2 |

**Total:** 9 schemas, 44+ tablas

---

## 🔌 Conexión

**Configuración:** `apps/backend/src/config/database.config.ts`

```typescript
export const databaseConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
};
```

**Pool de conexiones:** `apps/backend/src/database/pool.ts`

---

## 🛡️ Row Level Security (RLS)

**Políticas RLS:** 159 planeadas, 41 activas (26%)

**Ejemplo de query con RLS:**
```typescript
// RLS se aplica automáticamente
const result = await pool.query(
  'SELECT * FROM auth_management.profiles WHERE id = $1',
  [userId]
);
// RLS valida que el usuario solo acceda a su propio perfil
```

**Documentación:** [docs/02-especificaciones-tecnicas/seguridad/ROW-LEVEL-SECURITY.md](../../02-especificaciones-tecnicas/seguridad/ROW-LEVEL-SECURITY.md)

---

## 📝 Queries SQL

### Usando Constants SSOT

```typescript
import { DB_SCHEMAS, DB_TABLES } from '@shared/constants';

// ✅ CORRECTO
const query = `
  SELECT * FROM ${DB_SCHEMAS.AUTH}.${DB_TABLES.AUTH.PROFILES}
  WHERE id = $1
`;

// ❌ INCORRECTO (hardcoding)
const query = 'SELECT * FROM auth_management.profiles WHERE id = $1';
```

---

## 🔗 Referencias a DDL

**DDL completo:** `apps/database/ddl/`

**Por schema:**
- `apps/database/ddl/schemas/auth_management/`
- `apps/database/ddl/schemas/educational_content/`
- etc.

**Documentación:** [docs/03-desarrollo/base-de-datos/](../base-de-datos/)

---

**Última actualización:** 2025-11-07
