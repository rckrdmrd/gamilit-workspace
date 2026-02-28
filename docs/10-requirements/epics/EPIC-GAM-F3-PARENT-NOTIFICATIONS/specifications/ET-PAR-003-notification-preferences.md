---
titulo: "ET-PAR-003: Notification Preferences"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-PAR-003: Notification Preferences

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PAR-003 |
| **Modulo** | Parent Notifications |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 80% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-PAR-003: Parent Notification Preferences

### User Stories
- [US-NOT-001c: Preferences Management](../../EXT-003-notificaciones/user-stories/US-NOT-001c-preferences-management.md)

---

## Descripcion Funcional

Sistema de preferencias de notificacion para padres:
- Frecuencia de reportes (realtime, daily, weekly)
- Tipos de alerta habilitados
- Canales preferidos (email, push, in-app)
- Umbrales personalizados
- Horarios de no molestar

---

## Implementacion Existente

### Database - ParentAccount Preferences

**Ubicacion:** `apps/backend/src/modules/auth/entities/parent-account.entity.ts`

**Estado:** COMPLETO (100%)

```typescript
@Entity({ schema: DB_SCHEMAS.AUTH, name: 'parent_accounts' })
export class ParentAccount {
  // ... identificacion

  // =====================================================
  // NOTIFICATION PREFERENCES
  // =====================================================

  /**
   * Frecuencia de notificaciones
   */
  @Column('text', { default: 'weekly' })
  notification_frequency!: string; // 'realtime' | 'daily' | 'weekly' | 'monthly' | 'on_demand'

  /**
   * Alerta por bajo rendimiento
   */
  @Column('boolean', { default: true })
  alert_on_low_performance!: boolean;

  /**
   * Dias de inactividad para alerta
   */
  @Column('int', { default: 7 })
  alert_on_inactivity_days!: number;

  /**
   * Alerta por logros desbloqueados
   */
  @Column('boolean', { default: true })
  alert_on_achievement_unlocked!: boolean;

  /**
   * Alerta por promocion de rango
   */
  @Column('boolean', { default: true })
  alert_on_rank_promotion!: boolean;

  /**
   * Formato preferido de reportes
   */
  @Column('text', { default: 'both' })
  preferred_report_format!: string; // 'email' | 'in_app' | 'both'

  /**
   * Idioma preferido
   */
  @Column('text', { default: 'es-MX' })
  preferred_language!: string;

  /**
   * Widgets del dashboard
   */
  @Column({ type: 'jsonb', default: '["progress", "achievements", "activity"]' })
  dashboard_widgets!: string[];
}
```

### Backend - ParentPreferencesService

**Ubicacion:** `apps/backend/src/modules/auth/services/parent-preferences.service.ts`

**Estado:** PARCIAL (70%)

```typescript
@Injectable()
export class ParentPreferencesService {
  /**
   * Obtiene preferencias del padre
   */
  async getPreferences(parentAccountId: string): Promise<ParentPreferences>;

  /**
   * Actualiza preferencias
   */
  async updatePreferences(
    parentAccountId: string,
    updates: UpdatePreferencesDto
  ): Promise<ParentPreferences>;

  /**
   * Verifica si debe enviar notificacion segun preferencias
   */
  async shouldNotify(
    parentAccountId: string,
    notificationType: ParentNotificationType
  ): Promise<{ shouldSend: boolean; channels: string[] }> {
    const prefs = await this.getPreferences(parentAccountId);

    // Verificar si el tipo esta habilitado
    const typeEnabled = this.isTypeEnabled(prefs, notificationType);
    if (!typeEnabled) {
      return { shouldSend: false, channels: [] };
    }

    // Verificar frecuencia
    if (!this.checkFrequency(prefs, notificationType)) {
      return { shouldSend: false, channels: [] };
    }

    // Determinar canales
    const channels = this.getEnabledChannels(prefs);

    return { shouldSend: true, channels };
  }

  /**
   * Verifica si tipo de notificacion esta habilitado
   */
  private isTypeEnabled(
    prefs: ParentPreferences,
    type: ParentNotificationType
  ): boolean {
    switch (type) {
      case ParentNotificationType.LOW_PERFORMANCE:
        return prefs.alert_on_low_performance;
      case ParentNotificationType.INACTIVITY_ALERT:
        return prefs.alert_on_inactivity_days > 0;
      case ParentNotificationType.ACHIEVEMENT_UNLOCKED:
        return prefs.alert_on_achievement_unlocked;
      case ParentNotificationType.RANK_PROMOTION:
        return prefs.alert_on_rank_promotion;
      default:
        return true;
    }
  }

  /**
   * Obtiene canales habilitados
   */
  private getEnabledChannels(prefs: ParentPreferences): string[] {
    switch (prefs.preferred_report_format) {
      case 'email':
        return ['email'];
      case 'in_app':
        return ['in_app'];
      case 'both':
        return ['email', 'in_app'];
      default:
        return ['in_app'];
    }
  }
}
```

---

## Lo que Falta para Completar (20%)

### 1. Do Not Disturb (10%)

```typescript
// Agregar a ParentAccount entity
@Column({ type: 'jsonb', nullable: true })
do_not_disturb?: {
  enabled: boolean;
  start_time: string; // "22:00"
  end_time: string;   // "08:00"
  timezone: string;   // "America/Mexico_City"
};

// En ParentPreferencesService
async shouldNotify(...): Promise<...> {
  // ... existing checks

  // Check DND
  if (prefs.do_not_disturb?.enabled) {
    const now = moment().tz(prefs.do_not_disturb.timezone);
    const start = moment(prefs.do_not_disturb.start_time, 'HH:mm');
    const end = moment(prefs.do_not_disturb.end_time, 'HH:mm');

    if (now.isBetween(start, end)) {
      // Queue for later instead of sending now
      return { shouldSend: false, channels: [], queueUntil: end };
    }
  }

  return { shouldSend: true, channels };
}
```

### 2. Per-Child Preferences (10%)

```sql
-- tables/parent_student_preferences.sql (NUEVO)
CREATE TABLE auth_management.parent_student_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_account_id UUID NOT NULL REFERENCES auth_management.parent_accounts(id),
  student_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  override_low_performance BOOLEAN,
  override_inactivity_days INT,
  override_achievements BOOLEAN,
  override_rank_promotion BOOLEAN,
  custom_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_account_id, student_id)
);
```

---

## Esquema de Preferencias

### Frecuencias de Notificacion

| Frecuencia | Descripcion | Uso |
|------------|-------------|-----|
| realtime | Inmediata | Alertas criticas |
| daily | Resumen diario | Actividad moderada |
| weekly | Resumen semanal | Default |
| monthly | Resumen mensual | Minima interrupcion |
| on_demand | Solo cuando solicita | Sin automaticos |

### Tipos de Alerta

| Tipo | Default | Personalizable |
|------|---------|----------------|
| low_performance | ON | Si (toggle) |
| inactivity | 7 dias | Si (0-30 dias) |
| achievement | ON | Si (toggle) |
| rank_promotion | ON | Si (toggle) |
| weekly_report | ON | Si (toggle) |

### Canales

| Canal | Disponible | Default |
|-------|------------|---------|
| Email | Si | ON |
| In-App | Si | ON |
| Push | Si | OFF |
| SMS | Futuro | N/A |

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/parent/preferences` | Obtener preferencias |
| PATCH | `/parent/preferences` | Actualizar preferencias |
| GET | `/parent/preferences/children/:id` | Preferencias por hijo |
| PATCH | `/parent/preferences/children/:id` | Override por hijo |

---

## Frontend - Preferences UI

```typescript
// components/PreferencesForm.tsx
interface PreferencesFormProps {
  preferences: ParentPreferences;
  onSave: (prefs: UpdatePreferencesDto) => Promise<void>;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  onSave,
}) => {
  return (
    <form>
      <Section title="Frecuencia de Notificaciones">
        <Select
          value={preferences.notification_frequency}
          options={[
            { value: 'realtime', label: 'Inmediatas' },
            { value: 'daily', label: 'Resumen diario' },
            { value: 'weekly', label: 'Resumen semanal' },
            { value: 'monthly', label: 'Resumen mensual' },
          ]}
        />
      </Section>

      <Section title="Tipos de Alertas">
        <Toggle
          label="Bajo rendimiento"
          checked={preferences.alert_on_low_performance}
        />
        <NumberInput
          label="Dias de inactividad para alertar"
          value={preferences.alert_on_inactivity_days}
          min={0}
          max={30}
        />
        <Toggle
          label="Logros desbloqueados"
          checked={preferences.alert_on_achievement_unlocked}
        />
        <Toggle
          label="Promocion de rango"
          checked={preferences.alert_on_rank_promotion}
        />
      </Section>

      <Section title="Formato Preferido">
        <RadioGroup
          value={preferences.preferred_report_format}
          options={[
            { value: 'email', label: 'Solo email' },
            { value: 'in_app', label: 'Solo en la app' },
            { value: 'both', label: 'Ambos' },
          ]}
        />
      </Section>

      <Section title="Horario de No Molestar">
        <Toggle label="Activar" />
        <TimeRangePicker />
      </Section>

      <Button type="submit">Guardar Preferencias</Button>
    </form>
  );
};
```

---

## Criterios de Aceptacion

### Funcionales
- [x] Frecuencia de notificaciones configurable
- [x] Tipos de alerta toggleables
- [x] Canal preferido (email/in-app/both)
- [x] Umbral de inactividad personalizable
- [ ] Do Not Disturb
- [ ] Preferencias por hijo

### No Funcionales
- [x] Preferencias persisten en BD
- [x] Cambios aplican inmediatamente
- [ ] UI de preferencias responsive

---

## Dependencias

### Bloqueado Por
- ParentAccount Entity (COMPLETO)
- ParentStudentLink Entity (COMPLETO)

### Bloquea
- Notification Delivery Optimization
- Smart Notification Scheduling

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| Do Not Disturb | 4h |
| Per-Child Preferences | 5h |
| Frontend UI | 4h |
| Tests | 2h |
| **Total** | **15h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PAR-003-notification-preferences.md*
*Generado: 2026-01-27*
