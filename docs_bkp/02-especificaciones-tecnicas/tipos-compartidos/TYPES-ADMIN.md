# Tipos Compartidos - Admin Portal

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Admin Module (User Management, Organizations, System Metrics)
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene tipos para el portal de administración:
- **UserAdmin**: Vista administrativa de usuarios
- **Organization**: Organizaciones del sistema
- **SystemMetrics**: Métricas del sistema

---

### 6.7 Admin Types

#### 6.7.1 UserAdmin

**Description**: Extended user information for admin

**TypeScript Definition**:
```typescript
type UserStatus = 'active' | 'suspended' | 'banned' | 'deleted';

interface UserAdmin {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  role: UserRole;
  status: UserStatus;
  tenant_id?: string;
  tenant_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  student_id?: string;
  grade_level?: string;
  is_active: boolean;
  last_sign_in_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;

  // Gamification stats
  total_xp?: number;
  current_level?: number;
  current_rank?: MayaRank;
  ml_coins?: number;
  total_exercises_completed?: number;

  // Suspension info
  suspension_reason?: string;
  suspension_until?: Date;
  suspended_by?: string;
  suspended_at?: Date;
}
```

**Zod Schema**:
```typescript
const userStatusSchema = z.enum(['active', 'suspended', 'banned', 'deleted']);

const userAdminSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().optional(),
  full_name: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  display_name: z.string().optional(),
  role: userRoleSchema,
  status: userStatusSchema,
  tenant_id: z.string().uuid().optional(),
  tenant_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  student_id: z.string().optional(),
  grade_level: z.string().optional(),
  is_active: z.boolean(),
  last_sign_in_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  deleted_at: z.date().optional(),
  total_xp: z.number().int().min(0).optional(),
  current_level: z.number().int().min(1).optional(),
  current_rank: mayaRankSchema.optional(),
  ml_coins: z.number().int().min(0).optional(),
  total_exercises_completed: z.number().int().min(0).optional(),
  suspension_reason: z.string().optional(),
  suspension_until: z.date().optional(),
  suspended_by: z.string().uuid().optional(),
  suspended_at: z.date().optional()
});
```

---

#### 6.7.2 Organization

**Description**: Organization/tenant entity

**TypeScript Definition**:
```typescript
type OrganizationType = 'school' | 'university' | 'company' | 'other';

interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  country: string;
  state?: string;
  city?: string;
  address?: string;
  postal_code?: string;
  admin_id?: string;
  admin_email?: string;
  admin_name?: string;
  student_count: number;
  teacher_count: number;
  is_active: boolean;
  subscription_tier?: string;
  subscription_expires_at?: Date;
  max_students?: number;
  max_teachers?: number;
  metadata?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const organizationTypeSchema = z.enum(['school', 'university', 'company', 'other']);

const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  type: organizationTypeSchema,
  country: z.string(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postal_code: z.string().optional(),
  admin_id: z.string().uuid().optional(),
  admin_email: z.string().email().optional(),
  admin_name: z.string().optional(),
  student_count: z.number().int().min(0),
  teacher_count: z.number().int().min(0),
  is_active: z.boolean(),
  subscription_tier: z.string().optional(),
  subscription_expires_at: z.date().optional(),
  max_students: z.number().int().positive().optional(),
  max_teachers: z.number().int().positive().optional(),
  metadata: z.record(z.any()).optional(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.7.3 SystemMetrics

**Description**: System health and performance metrics

**TypeScript Definition**:
```typescript
interface SystemMetrics {
  api_response_time: {
    p50: number;
    p95: number;
    p99: number;
  };
  database_queries_per_sec: number;
  database_connections_active: number;
  database_connections_idle: number;
  database_query_time_avg: number;
  active_users_count: number;
  active_users_5min: number;
  active_users_1hour: number;
  total_users_count: number;
  requests_per_min: number;
  requests_per_hour: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
  memory_used_mb: number;
  memory_total_mb: number;
  uptime_seconds: number;
  websocket_connections: number;
  timestamp: Date;
}
```

**Zod Schema**:
```typescript
const systemMetricsSchema = z.object({
  api_response_time: z.object({
    p50: z.number().min(0),
    p95: z.number().min(0),
    p99: z.number().min(0)
  }),
  database_queries_per_sec: z.number().min(0),
  database_connections_active: z.number().int().min(0),
  database_connections_idle: z.number().int().min(0),
  database_query_time_avg: z.number().min(0),
  active_users_count: z.number().int().min(0),
  active_users_5min: z.number().int().min(0),
  active_users_1hour: z.number().int().min(0),
  total_users_count: z.number().int().min(0),
  requests_per_min: z.number().min(0),
  requests_per_hour: z.number().min(0),
  error_rate: z.number().min(0).max(100),
  cpu_usage: z.number().min(0).max(100),
  memory_usage: z.number().min(0).max(100),
  memory_used_mb: z.number().min(0),
  memory_total_mb: z.number().positive(),
  uptime_seconds: z.number().int().min(0),
  websocket_connections: z.number().int().min(0),
  timestamp: z.date()
});
```

---

