# ET-ADM-008: Pagina de Configuracion Avanzada

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-ADM-008 |
| **Modulo** | Admin Extendido |
| **Titulo** | Implementacion de Configuracion Avanzada |
| **Prioridad** | Baja |
| **Estado** | Parcialmente Implementado |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-25 |
| **Ultima Actualizacion** | 2026-01-25 |
| **Autor** | Architecture Analyst |

---

## Referencias

### User Stories
- US-AE-015: Feature Flags y A/B Testing

---

## Arquitectura

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - AdminAdvancedPage                                      |
|  - FeatureFlagsPanel                                      |
|  - ABTestingDashboard                                     |
+-----------------------------+----------------------------+
                              | REST API
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - AdminAdvancedController                               |
|  - FeatureFlagsService                                   |
|  - ABTestingService (futuro)                             |
+-----------------------------+----------------------------+
                              | SQL Queries
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - admin_dashboard.feature_flags                         |
|  - admin_dashboard.ab_experiments (futuro)               |
+----------------------------------------------------------+
```

---

## Estado de Implementacion

| Seccion | Estado | Notas |
|---------|--------|-------|
| Feature Flags | Implementado | CRUD completo |
| A/B Testing | Mock | Datos de prueba |
| Tenant Management | Under Construction | Pendiente |
| Economic Tools | Coming Soon | Backlog |

---

## Implementacion Backend

### Feature Flags Controller

**Ubicacion:** `apps/backend/src/admin/controllers/admin-advanced.controller.ts`

```typescript
@Controller('admin/advanced/feature-flags')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AdminAdvancedController {
  @Get()
  async getFlags() {
    return this.featureFlagsService.findAll();
  }

  @Post()
  async createFlag(@Body() dto: CreateFeatureFlagDto) {
    return this.featureFlagsService.create(dto);
  }

  @Patch(':key')
  async updateFlag(@Param('key') key: string, @Body() dto: UpdateFeatureFlagDto) {
    return this.featureFlagsService.update(key, dto);
  }

  @Delete(':key')
  async deleteFlag(@Param('key') key: string) {
    return this.featureFlagsService.delete(key);
  }

  @Patch(':key/toggle')
  async toggleFlag(@Param('key') key: string) {
    return this.featureFlagsService.toggle(key);
  }
}
```

### Feature Flag Entity

```typescript
@Entity({ schema: 'admin_dashboard', name: 'feature_flags' })
export class FeatureFlag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  enabled: boolean;

  @Column({ name: 'rollout_percentage', default: 100 })
  rolloutPercentage: number;

  @Column({ name: 'target_roles', type: 'simple-array', nullable: true })
  targetRoles: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

## Implementacion Frontend

### Pagina Principal

**Ubicacion:** `apps/frontend/src/apps/admin/pages/AdminAdvancedPage.tsx`

### Estructura de UI

```
AdminLayout
  └── Container
      ├── Header
      │   └── Title: "Configuracion Avanzada"
      │
      ├── Feature Flags Panel
      │   ├── Header con contador
      │   ├── Filtros (enabled/disabled/all)
      │   ├── Buscador
      │   └── Lista de flags con toggle
      │
      ├── A/B Testing Dashboard (Beta Badge)
      │   ├── Lista de experimentos
      │   ├── Variantes y traffic split
      │   └── Resultados con confidence
      │
      ├── Tenant Management (Under Construction)
      │
      └── Economic Tools (Coming Soon)
```

### Custom Hook: useFeatureFlags

**Ubicacion:** `apps/frontend/src/apps/admin/hooks/useFeatureFlags.ts`

```typescript
interface UseFeatureFlagsReturn {
  flags: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
  fetchFlags: () => Promise<void>;
  createFlag: (flag: CreateFeatureFlagDto) => Promise<void>;
  updateFlag: (key: string, updates: UpdateFeatureFlagDto) => Promise<void>;
  deleteFlag: (key: string) => Promise<void>;
  toggleFlag: (key: string) => Promise<void>;
}
```

### Componentes

| Componente | Estado | Descripcion |
|------------|--------|-------------|
| FeatureFlagsPanel | Implementado | CRUD de feature flags |
| ABTestingDashboard | Mock | Dashboard A/B (datos mock) |
| UnderConstruction | UI | Placeholder para secciones pendientes |
| FeatureBadge | UI | Badges: beta, under-construction, coming-soon |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| GET | `/api/admin/advanced/feature-flags` | Listar flags | SUPER_ADMIN |
| POST | `/api/admin/advanced/feature-flags` | Crear flag | SUPER_ADMIN |
| PATCH | `/api/admin/advanced/feature-flags/:key` | Actualizar flag | SUPER_ADMIN |
| DELETE | `/api/admin/advanced/feature-flags/:key` | Eliminar flag | SUPER_ADMIN |
| PATCH | `/api/admin/advanced/feature-flags/:key/toggle` | Toggle flag | SUPER_ADMIN |

---

## Tipos TypeScript

### FeatureFlag

```typescript
interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetRoles?: string[];
  createdAt: string;
  updatedAt: string;
}
```

### ABExperiment (Futuro)

```typescript
interface ABExperiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  variants: Array<{
    id: string;
    name: string;
    trafficPercentage: number;
  }>;
  metrics: {
    conversionRate: number;
    engagement: number;
  };
  winner?: string;
  confidence?: number;
}
```

---

## Funcionalidades

### Feature Flags (Implementado)

1. **CRUD Completo:**
   - Crear flags con key, nombre, descripcion
   - Actualizar configuracion
   - Eliminar flags
   - Toggle rapido enable/disable

2. **Filtrado:**
   - Por estado (enabled/disabled/all)
   - Por busqueda (nombre, key, descripcion)

3. **Rollout Gradual:**
   - Porcentaje de rollout (0-100%)
   - Target por roles

### A/B Testing (Mock)

1. **Dashboard:**
   - Lista de experimentos
   - Variantes con traffic split
   - Metricas de conversion y engagement

2. **Estados:**
   - draft, running, paused, completed
   - Winner detection con confidence level

---

## Secciones Pendientes

### Tenant Management
- Gestion multi-tenant
- Configuracion por institucion
- Estado: Under Construction

### Economic Tools
- Configuracion de economia virtual
- ML-Coins settings
- Estado: Coming Soon

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-25 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-ADM-008-advanced.md*
*Generado: 2026-01-25*
