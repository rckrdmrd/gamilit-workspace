---
titulo: "ET-PAR-002: Alert Templates"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-PAR-002: Alert Templates

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PAR-002 |
| **Modulo** | Parent Notifications |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 45% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-PAR-002: Parent Alert Templates

### User Stories
- [US-PARENT-002: Low Performance Alert](../user-stories/US-PARENT-002/US-PARENT-002-low-performance-alert.md)
- [US-PARENT-003: Achievement Notification](../user-stories/US-PARENT-003/US-PARENT-003-achievement-notification.md)

---

## Descripcion Funcional

Sistema de templates de alertas para padres:
- Templates predefinidos por tipo de alerta
- Variables dinamicas (nombre, progreso, etc.)
- Personalizacion por tenant (branding)
- Soporte multicanal (email, push, in-app)
- Localizacion (es-MX, en-US)

---

## Arquitectura

### Flujo de Alertas

```
Evento trigger (bajo rendimiento, logro, etc.)
        |
        v
AlertTriggerService detecta condicion
        |
        v
ParentNotificationsService.createAlert()
  - Selecciona template segun tipo
  - Renderiza con variables
        |
        v
NotificationService.send()
  - Respeta preferencias del padre
  - Email y/o push segun config
        |
        v
Guardar en parent_notifications
```

---

## Implementacion Existente

### Database - ParentNotification Entity

**Ubicacion:** `apps/backend/src/modules/auth/entities/parent-notification.entity.ts`

**Estado:** COMPLETO (100%)

```typescript
@Entity({ schema: DB_SCHEMAS.AUTH, name: 'parent_notifications' })
export class ParentNotification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  parent_account_id!: string;

  @Column('uuid')
  student_id!: string;

  @Column({ type: 'enum', enum: ParentNotificationType })
  notification_type!: ParentNotificationType;

  @Column('text')
  title!: string;

  @Column('text')
  message!: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, unknown>;

  @Column('text', { default: 'normal' })
  priority!: string;

  @Column('text', { default: 'pending' })
  status!: string;

  @Column('boolean', { default: false })
  sent_via_email!: boolean;

  @Column('boolean', { default: false })
  sent_via_push!: boolean;

  @Column('boolean', { default: false })
  is_read!: boolean;

  @CreateDateColumn()
  created_at!: Date;
}

export enum ParentNotificationType {
  DAILY_SUMMARY = 'daily_summary',
  WEEKLY_REPORT = 'weekly_report',
  MONTHLY_REPORT = 'monthly_report',
  LOW_PERFORMANCE = 'low_performance',
  INACTIVITY_ALERT = 'inactivity_alert',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_PROMOTION = 'rank_promotion',
  ASSIGNMENT_DUE = 'assignment_due',
  ASSIGNMENT_SUBMITTED = 'assignment_submitted',
  RECOMMENDATION = 'recommendation',
  CUSTOM = 'custom',
}
```

### Database - ParentAccount Preferences

**Ubicacion:** `apps/backend/src/modules/auth/entities/parent-account.entity.ts`

**Estado:** COMPLETO (100%)

```typescript
// Campos relevantes para alertas
@Column('boolean', { default: true })
alert_on_low_performance!: boolean;

@Column('int', { default: 7 })
alert_on_inactivity_days!: number;

@Column('boolean', { default: true })
alert_on_achievement_unlocked!: boolean;

@Column('boolean', { default: true })
alert_on_rank_promotion!: boolean;

@Column('text', { default: 'both' })
preferred_report_format!: string; // 'email' | 'in_app' | 'both'
```

---

## Lo que Falta para Completar (55%)

### 1. Alert Templates Database (15%)

```sql
-- tables/parent_alert_templates.sql (NUEVO)
CREATE TABLE auth_management.parent_alert_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- matches ParentNotificationType
  locale TEXT NOT NULL DEFAULT 'es-MX',
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  email_subject TEXT,
  email_body_template TEXT,
  push_title TEXT,
  push_body TEXT,
  variables JSONB NOT NULL DEFAULT '[]', -- Lista de variables requeridas
  priority TEXT NOT NULL DEFAULT 'normal',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(alert_type, locale)
);

-- Seeds de templates
INSERT INTO auth_management.parent_alert_templates VALUES
(
  'low_performance',
  'es-MX',
  'Alerta de rendimiento: {{student_name}}',
  '{{student_name}} ha tenido un promedio de {{score_average}}% esta semana, por debajo del objetivo del 70%.',
  '[Gamilit] Alerta de rendimiento - {{student_name}}',
  '...',
  'Rendimiento bajo',
  '{{student_name}}: {{score_average}}% esta semana',
  '["student_name", "score_average", "week_start", "week_end"]',
  'high',
  true
),
(
  'inactivity_alert',
  'es-MX',
  '{{student_name}} no ha usado Gamilit',
  '{{student_name}} no ha iniciado sesion en {{days_inactive}} dias.',
  '[Gamilit] Recordatorio de actividad',
  '...',
  'Inactividad',
  '{{student_name}} no ha entrado en {{days_inactive}} dias',
  '["student_name", "days_inactive", "last_active_date"]',
  'normal',
  true
),
(
  'achievement_unlocked',
  'es-MX',
  '{{student_name}} desbloqueo un logro',
  '{{student_name}} obtuvo el logro "{{achievement_name}}": {{achievement_description}}',
  '[Gamilit] Nuevo logro de {{student_name}}',
  '...',
  'Nuevo logro',
  '{{student_name}}: {{achievement_name}}',
  '["student_name", "achievement_name", "achievement_description", "achievement_icon"]',
  'low',
  true
);
```

### 2. AlertTemplateService (20%)

```typescript
// services/alert-template.service.ts (NUEVO)
@Injectable()
export class AlertTemplateService {
  /**
   * Obtiene template por tipo y locale
   */
  async getTemplate(
    alertType: ParentNotificationType,
    locale: string = 'es-MX'
  ): Promise<AlertTemplate>;

  /**
   * Renderiza template con variables
   */
  async render(
    template: AlertTemplate,
    variables: Record<string, string>
  ): Promise<RenderedAlert> {
    const handlebars = Handlebars.compile(template.message_template);
    const message = handlebars(variables);

    const titleCompiled = Handlebars.compile(template.title_template);
    const title = titleCompiled(variables);

    return {
      title,
      message,
      emailSubject: template.email_subject ? Handlebars.compile(template.email_subject)(variables) : undefined,
      emailBody: template.email_body_template ? Handlebars.compile(template.email_body_template)(variables) : undefined,
      pushTitle: template.push_title ? Handlebars.compile(template.push_title)(variables) : undefined,
      pushBody: template.push_body ? Handlebars.compile(template.push_body)(variables) : undefined,
      priority: template.priority,
    };
  }

  /**
   * Valida que todas las variables requeridas esten presentes
   */
  validateVariables(
    template: AlertTemplate,
    variables: Record<string, string>
  ): boolean {
    const required = template.variables as string[];
    return required.every((v) => v in variables);
  }

  /**
   * Lista templates por tipo
   */
  async findByType(alertType: ParentNotificationType): Promise<AlertTemplate[]>;

  /**
   * Crea/actualiza template
   */
  async upsert(data: CreateAlertTemplateDto): Promise<AlertTemplate>;
}

interface RenderedAlert {
  title: string;
  message: string;
  emailSubject?: string;
  emailBody?: string;
  pushTitle?: string;
  pushBody?: string;
  priority: string;
}
```

### 3. AlertTriggerService (15%)

```typescript
// services/alert-trigger.service.ts (NUEVO)
@Injectable()
export class AlertTriggerService {
  /**
   * Verifica condiciones de alerta para todos los estudiantes
   * Ejecutado por cron diario
   */
  @Cron('0 20 * * *') // 8:00 PM
  async checkAlertConditions(): Promise<void>;

  /**
   * Verifica bajo rendimiento
   */
  async checkLowPerformance(studentId: string): Promise<boolean> {
    const stats = await this.getWeeklyStats(studentId);
    return stats.averageScore < 70;
  }

  /**
   * Verifica inactividad
   */
  async checkInactivity(
    studentId: string,
    thresholdDays: number
  ): Promise<boolean> {
    const lastActive = await this.getLastActiveDate(studentId);
    const daysSince = differenceInDays(new Date(), lastActive);
    return daysSince >= thresholdDays;
  }

  /**
   * Dispara alerta si cumple condiciones
   */
  async triggerAlert(
    parentAccountId: string,
    studentId: string,
    alertType: ParentNotificationType,
    variables: Record<string, string>
  ): Promise<ParentNotification>;
}
```

### 4. Tenant Branding Integration (5%)

```typescript
// En template rendering
interface BrandingContext {
  platformName: string;
  logoUrl: string;
  primaryColor: string;
  supportEmail: string;
}

async renderWithBranding(
  template: AlertTemplate,
  variables: Record<string, string>,
  tenantId: string
): Promise<RenderedAlert> {
  const branding = await this.brandingService.getTenantBranding(tenantId);
  return this.render(template, { ...variables, ...branding });
}
```

---

## Templates por Tipo de Alerta

| Tipo | Prioridad | Email | Push | Trigger |
|------|-----------|-------|------|---------|
| low_performance | High | Si | Si | Score < 70% semanal |
| inactivity_alert | Normal | Si | Si | N dias sin login |
| achievement_unlocked | Low | Opcional | Si | Logro desbloqueado |
| rank_promotion | Normal | Si | Si | Promocion de rango |
| assignment_due | Normal | Si | Si | 24h antes de vencer |
| weekly_report | Low | Si | No | Domingo 8:00 AM |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion | Roles |
|--------|------|-------------|-------|
| GET | `/parent/alert-templates` | Listar templates | ADMIN |
| GET | `/parent/alert-templates/:type` | Template por tipo | ADMIN |
| PUT | `/parent/alert-templates/:type` | Actualizar template | ADMIN |
| POST | `/parent/alert-templates/preview` | Preview con variables | ADMIN |

---

## Criterios de Aceptacion

### Funcionales
- [x] Tipos de notificacion definidos
- [x] Preferencias de padre guardadas
- [ ] Templates por tipo de alerta
- [ ] Renderizado con variables
- [ ] Soporte multi-locale
- [ ] Integracion con branding de tenant

### No Funcionales
- [ ] Templates cacheados
- [ ] Fallback a locale default

---

## Dependencias

### Bloqueado Por
- ParentNotification Entity (COMPLETO)
- ParentAccount Entity (COMPLETO)
- Notification Service (COMPLETO)

### Bloquea
- Automated Alert Triggers
- Custom Alert Rules
- Alert Analytics

---

## Estimacion de Esfuerzo

| Componente | Horas Estimadas |
|------------|-----------------|
| Database Schema + Seeds | 4h |
| AlertTemplateService | 6h |
| AlertTriggerService | 8h |
| Branding Integration | 2h |
| Tests | 3h |
| **Total** | **23h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PAR-002-alert-templates.md*
*Generado: 2026-01-27*
