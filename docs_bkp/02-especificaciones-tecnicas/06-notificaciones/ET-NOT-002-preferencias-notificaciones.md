# ET-NOT-002: Preferencias de Notificaciones - Especificación Técnica

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-NOT-002 |
| **Módulo** | 06 - Notificaciones |
| **Título** | Preferencias de Notificaciones - Implementación |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha** | 2025-11-07 |

---

## 🔗 Referencias

📘 **Implementa:** [RF-NOT-002](../../01-requerimientos/06-notificaciones/RF-NOT-002-preferencias-notificaciones.md)

---

## 🗄️ Base de Datos

### Tabla: notification_preferences

```sql
CREATE TABLE public.notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Usuario
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type public.notification_type NOT NULL,

    -- Configuración principal
    enabled BOOLEAN NOT NULL DEFAULT TRUE,

    -- Canales (JSON para flexibilidad)
    channels JSONB NOT NULL DEFAULT '{"in_app": true, "email": true, "push": false, "sms": false}'::jsonb,

    -- Frecuencia de entrega por canal
    delivery_frequency JSONB NOT NULL DEFAULT '{
        "in_app": "immediate",
        "email": "immediate",
        "push": "immediate",
        "sms": "immediate"
    }'::jsonb,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraint: Solo una preferencia por usuario+tipo
    UNIQUE (user_id, notification_type)
);

CREATE INDEX idx_notif_prefs_user ON public.notification_preferences(user_id);
CREATE INDEX idx_notif_prefs_type ON public.notification_preferences(notification_type);

-- Trigger para updated_at
CREATE TRIGGER trg_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

---

### Tabla: notification_global_settings

```sql
CREATE TABLE public.notification_global_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Canales habilitados globalmente
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    -- Quiet hours
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start TIME,
    quiet_hours_end TIME,
    quiet_hours_timezone VARCHAR(50) DEFAULT 'America/Guatemala',
    quiet_hours_applies_to JSONB DEFAULT '["email", "push", "sms"]'::jsonb,

    -- Digest settings
    daily_digest_time TIME DEFAULT '09:00:00',
    weekly_digest_day INTEGER DEFAULT 1, -- 1 = Monday
    weekly_digest_time TIME DEFAULT '09:00:00',

    -- Preferencias especiales
    notify_own_actions BOOLEAN DEFAULT FALSE,
    allow_social_comparisons BOOLEAN DEFAULT TRUE,

    -- COPPA compliance (menores de 13)
    parent_authorization_email BOOLEAN DEFAULT FALSE,
    parent_authorization_push BOOLEAN DEFAULT FALSE,
    parent_authorization_date TIMESTAMPTZ,
    parent_authorizer_user_id UUID REFERENCES auth.users(id),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notif_global_user ON public.notification_global_settings(user_id);

-- Trigger para updated_at
CREATE TRIGGER trg_notification_global_settings_updated_at
BEFORE UPDATE ON public.notification_global_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
```

---

### Función: should_send_notification

```sql
CREATE OR REPLACE FUNCTION public.should_send_notification(
    p_user_id UUID,
    p_notification_type public.notification_type,
    p_channel VARCHAR,
    p_priority public.notification_priority DEFAULT 'medium'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_global_enabled BOOLEAN;
    v_type_enabled BOOLEAN;
    v_channel_enabled BOOLEAN;
    v_in_quiet_hours BOOLEAN;
    v_quiet_hours_applies BOOLEAN;
BEGIN
    -- 1. Verificar configuración global
    SELECT
        CASE p_channel
            WHEN 'in_app' THEN gs.in_app_enabled
            WHEN 'email' THEN gs.email_enabled
            WHEN 'push' THEN gs.push_enabled
            WHEN 'sms' THEN gs.sms_enabled
            ELSE FALSE
        END
    INTO v_global_enabled
    FROM public.notification_global_settings gs
    WHERE gs.user_id = p_user_id;

    IF NOT v_global_enabled THEN
        RETURN FALSE;
    END IF;

    -- 2. Verificar preferencia por tipo de notificación
    SELECT
        np.enabled,
        (np.channels->>p_channel)::BOOLEAN
    INTO v_type_enabled, v_channel_enabled
    FROM public.notification_preferences np
    WHERE np.user_id = p_user_id
      AND np.notification_type = p_notification_type;

    IF NOT FOUND THEN
        -- Si no existe preferencia, usar defaults
        v_type_enabled := TRUE;
        v_channel_enabled := (p_channel IN ('in_app', 'email'));
    END IF;

    IF NOT v_type_enabled OR NOT v_channel_enabled THEN
        RETURN FALSE;
    END IF;

    -- 3. Verificar quiet hours (solo si prioridad NO es urgent)
    IF p_priority != 'urgent' THEN
        SELECT
            gs.quiet_hours_enabled
            AND gs.quiet_hours_applies_to::jsonb ? p_channel
            AND (
                CASE
                    WHEN gs.quiet_hours_start < gs.quiet_hours_end THEN
                        (CURRENT_TIME AT TIME ZONE gs.quiet_hours_timezone) >= gs.quiet_hours_start
                        AND (CURRENT_TIME AT TIME ZONE gs.quiet_hours_timezone) < gs.quiet_hours_end
                    ELSE
                        -- Quiet hours span midnight
                        (CURRENT_TIME AT TIME ZONE gs.quiet_hours_timezone) >= gs.quiet_hours_start
                        OR (CURRENT_TIME AT TIME ZONE gs.quiet_hours_timezone) < gs.quiet_hours_end
                END
            )
        INTO v_in_quiet_hours
        FROM public.notification_global_settings gs
        WHERE gs.user_id = p_user_id;

        IF v_in_quiet_hours THEN
            RETURN FALSE;
        END IF;
    END IF;

    -- 4. All checks passed
    RETURN TRUE;
END;
$$;
```

---

### Función: get_delivery_frequency

```sql
CREATE OR REPLACE FUNCTION public.get_delivery_frequency(
    p_user_id UUID,
    p_notification_type public.notification_type,
    p_channel VARCHAR
)
RETURNS VARCHAR
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_frequency VARCHAR;
BEGIN
    SELECT np.delivery_frequency->>p_channel
    INTO v_frequency
    FROM public.notification_preferences np
    WHERE np.user_id = p_user_id
      AND np.notification_type = p_notification_type;

    RETURN COALESCE(v_frequency, 'immediate');
END;
$$;
```

---

### Función: initialize_default_preferences

```sql
CREATE OR REPLACE FUNCTION public.initialize_default_preferences(
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_role auth_management.gamilit_role;
    v_user_age INTEGER;
BEGIN
    -- Get user role and age
    SELECT
        p.role,
        DATE_PART('year', AGE(p.date_of_birth))
    INTO v_user_role, v_user_age
    FROM auth_management.profiles p
    WHERE p.user_id = p_user_id;

    -- Insert global settings
    INSERT INTO public.notification_global_settings (
        user_id,
        in_app_enabled,
        email_enabled,
        push_enabled,
        quiet_hours_enabled,
        quiet_hours_start,
        quiet_hours_end,
        parent_authorization_email,
        parent_authorization_push
    ) VALUES (
        p_user_id,
        TRUE,
        TRUE,
        FALSE,
        TRUE,
        CASE v_user_role
            WHEN 'student' THEN '22:00:00'::TIME
            WHEN 'admin_teacher' THEN '20:00:00'::TIME
            WHEN 'super_admin' THEN NULL
        END,
        CASE v_user_role
            WHEN 'student' THEN '08:00:00'::TIME
            WHEN 'admin_teacher' THEN '07:00:00'::TIME
            WHEN 'super_admin' THEN NULL
        END,
        -- COPPA: Menores de 13 requieren autorización
        CASE WHEN v_user_age < 13 THEN FALSE ELSE TRUE END,
        CASE WHEN v_user_age < 13 THEN FALSE ELSE TRUE END
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert type-specific preferences (defaults based on role)
    IF v_user_role = 'student' THEN
        INSERT INTO public.notification_preferences (user_id, notification_type, enabled, channels)
        VALUES
            (p_user_id, 'achievement_unlocked', TRUE, '{"in_app": true, "email": true, "push": false}'::jsonb),
            (p_user_id, 'rank_up', TRUE, '{"in_app": true, "email": true, "push": false}'::jsonb),
            (p_user_id, 'module_completed', TRUE, '{"in_app": true, "email": true, "push": false}'::jsonb),
            (p_user_id, 'streak_reminder', TRUE, '{"in_app": true, "email": false, "push": false}'::jsonb)
        ON CONFLICT DO NOTHING;

    ELSIF v_user_role = 'admin_teacher' THEN
        INSERT INTO public.notification_preferences (user_id, notification_type, enabled, channels)
        VALUES
            (p_user_id, 'student_at_risk', TRUE, '{"in_app": true, "email": true, "push": true}'::jsonb),
            (p_user_id, 'assignment_submitted', TRUE, '{"in_app": true, "email": false, "push": false}'::jsonb)
        ON CONFLICT DO NOTHING;

    ELSIF v_user_role = 'super_admin' THEN
        INSERT INTO public.notification_preferences (user_id, notification_type, enabled, channels)
        VALUES
            (p_user_id, 'system_error', TRUE, '{"in_app": true, "email": true, "push": true, "sms": true}'::jsonb),
            (p_user_id, 'security_alert', TRUE, '{"in_app": true, "email": true, "push": true, "sms": true}'::jsonb)
        ON CONFLICT DO NOTHING;
    END IF;
END;
$$;
```

---

### Trigger: Auto-initialize preferences on user creation

```sql
CREATE OR REPLACE FUNCTION public.trg_initialize_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.initialize_default_preferences(NEW.id);
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_after_user_created_init_notif_prefs
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.trg_initialize_notification_preferences();
```

---

## 💻 Backend (NestJS)

### Service: NotificationPreferencesService

```typescript
@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreferences)
    private readonly prefsRepo: Repository<NotificationPreferences>,
    @InjectRepository(NotificationGlobalSettings)
    private readonly globalRepo: Repository<NotificationGlobalSettings>,
    private readonly dataSource: DataSource,
  ) {}

  async getGlobalSettings(userId: string): Promise<NotificationGlobalSettingsDto> {
    let settings = await this.globalRepo.findOne({ where: { user_id: userId } });

    if (!settings) {
      // Initialize defaults
      await this.dataSource.query(
        'SELECT public.initialize_default_preferences($1)',
        [userId],
      );
      settings = await this.globalRepo.findOne({ where: { user_id: userId } });
    }

    return settings;
  }

  async updateGlobalSettings(
    userId: string,
    dto: UpdateGlobalSettingsDto,
  ): Promise<NotificationGlobalSettingsDto> {
    await this.globalRepo.update(
      { user_id: userId },
      {
        ...dto,
        updated_at: new Date(),
      },
    );

    return this.getGlobalSettings(userId);
  }

  async getTypePreferences(userId: string): Promise<NotificationTypePreference[]> {
    const preferences = await this.prefsRepo.find({
      where: { user_id: userId },
      order: { notification_type: 'ASC' },
    });

    return preferences.map((p) => ({
      notificationType: p.notification_type,
      enabled: p.enabled,
      channels: p.channels,
      deliveryFrequency: p.delivery_frequency,
    }));
  }

  async updateTypePreference(
    userId: string,
    notificationType: string,
    dto: UpdateTypePreferenceDto,
  ): Promise<NotificationTypePreference> {
    await this.prefsRepo.upsert(
      {
        user_id: userId,
        notification_type: notificationType as any,
        enabled: dto.enabled,
        channels: dto.channels,
        delivery_frequency: dto.deliveryFrequency,
        updated_at: new Date(),
      },
      {
        conflictPaths: ['user_id', 'notification_type'],
      },
    );

    const updated = await this.prefsRepo.findOne({
      where: {
        user_id: userId,
        notification_type: notificationType as any,
      },
    });

    return {
      notificationType: updated.notification_type,
      enabled: updated.enabled,
      channels: updated.channels,
      deliveryFrequency: updated.delivery_frequency,
    };
  }

  async shouldSendNotification(
    userId: string,
    notificationType: string,
    channel: string,
    priority: string = 'medium',
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      'SELECT public.should_send_notification($1, $2, $3, $4) AS should_send',
      [userId, notificationType, channel, priority],
    );

    return result[0].should_send;
  }

  async requestParentalAuthorization(
    parentUserId: string,
    childUserId: string,
    channel: 'email' | 'push',
  ): Promise<void> {
    // Verify parental relationship
    const isParent = await this.dataSource.query(
      `SELECT EXISTS (
        SELECT 1 FROM auth_management.parental_controls
        WHERE parent_user_id = $1 AND child_user_id = $2 AND status = 'active'
      ) AS is_parent`,
      [parentUserId, childUserId],
    );

    if (!isParent[0].is_parent) {
      throw new ForbiddenException('Not authorized as parent');
    }

    // Update authorization
    const columnName =
      channel === 'email'
        ? 'parent_authorization_email'
        : 'parent_authorization_push';

    await this.globalRepo.update(
      { user_id: childUserId },
      {
        [columnName]: true,
        parent_authorization_date: new Date(),
        parent_authorizer_user_id: parentUserId,
      },
    );

    // Log audit event
    await this.dataSource.query(
      `INSERT INTO audit_logging.audit_logs (user_id, action, resource_type, resource_id, details)
       VALUES ($1, 'update', 'notification_preferences', $2, $3)`,
      [
        parentUserId,
        childUserId,
        JSON.stringify({
          authorization_granted: channel,
          child_user_id: childUserId,
        }),
      ],
    );
  }
}
```

---

### Controller: NotificationPreferencesController

```typescript
@Controller('notification-preferences')
@UseGuards(JwtAuthGuard)
export class NotificationPreferencesController {
  constructor(
    private readonly preferencesService: NotificationPreferencesService,
  ) {}

  @Get('global')
  async getMyGlobalSettings(@CurrentUser() user: User) {
    return this.preferencesService.getGlobalSettings(user.id);
  }

  @Patch('global')
  async updateMyGlobalSettings(
    @CurrentUser() user: User,
    @Body() dto: UpdateGlobalSettingsDto,
  ) {
    return this.preferencesService.updateGlobalSettings(user.id, dto);
  }

  @Get('types')
  async getMyTypePreferences(@CurrentUser() user: User) {
    return this.preferencesService.getTypePreferences(user.id);
  }

  @Patch('types/:notificationType')
  async updateMyTypePreference(
    @CurrentUser() user: User,
    @Param('notificationType') notificationType: string,
    @Body() dto: UpdateTypePreferenceDto,
  ) {
    return this.preferencesService.updateTypePreference(
      user.id,
      notificationType,
      dto,
    );
  }

  @Post('parental-authorization/:childId/:channel')
  async authorizeNotifications(
    @CurrentUser() parent: User,
    @Param('childId') childId: string,
    @Param('channel') channel: 'email' | 'push',
  ) {
    await this.preferencesService.requestParentalAuthorization(
      parent.id,
      childId,
      channel,
    );

    return { success: true, message: 'Authorization granted' };
  }
}
```

---

## 🎨 Frontend (React)

### Component: NotificationPreferencesPage

```tsx
export const NotificationPreferencesPage: React.FC = () => {
  const { data: globalSettings, refetch: refetchGlobal } = useQuery({
    queryKey: ['notification-preferences', 'global'],
    queryFn: () => notificationPrefsApi.getGlobalSettings(),
  });

  const { data: typePreferences } = useQuery({
    queryKey: ['notification-preferences', 'types'],
    queryFn: () => notificationPrefsApi.getTypePreferences(),
  });

  const updateGlobalMutation = useMutation({
    mutationFn: (dto: UpdateGlobalSettingsDto) =>
      notificationPrefsApi.updateGlobalSettings(dto),
    onSuccess: () => refetchGlobal(),
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({
      type,
      dto,
    }: {
      type: string;
      dto: UpdateTypePreferenceDto;
    }) => notificationPrefsApi.updateTypePreference(type, dto),
  });

  if (!globalSettings || !typePreferences) {
    return <Spinner />;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">⚙️ Configuración de Notificaciones</h1>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias Globales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            label="Notificaciones In-App"
            checked={globalSettings.inAppEnabled}
            onChange={(checked) =>
              updateGlobalMutation.mutate({ inAppEnabled: checked })
            }
          />
          <SwitchField
            label="Notificaciones por Email"
            checked={globalSettings.emailEnabled}
            onChange={(checked) =>
              updateGlobalMutation.mutate({ emailEnabled: checked })
            }
          />
          <SwitchField
            label="Notificaciones Push"
            checked={globalSettings.pushEnabled}
            onChange={(checked) =>
              updateGlobalMutation.mutate({ pushEnabled: checked })
            }
            disabled={!('Notification' in window)}
            helperText={
              !('Notification' in window)
                ? 'Tu navegador no soporta notificaciones push'
                : undefined
            }
          />
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Horarios de No Molestar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SwitchField
            label="Habilitar Horarios de No Molestar"
            checked={globalSettings.quietHoursEnabled}
            onChange={(checked) =>
              updateGlobalMutation.mutate({ quietHoursEnabled: checked })
            }
          />
          {globalSettings.quietHoursEnabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <TimeField
                  label="Desde"
                  value={globalSettings.quietHoursStart}
                  onChange={(time) =>
                    updateGlobalMutation.mutate({ quietHoursStart: time })
                  }
                />
                <TimeField
                  label="Hasta"
                  value={globalSettings.quietHoursEnd}
                  onChange={(time) =>
                    updateGlobalMutation.mutate({ quietHoursEnd: time })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Aplicar a:
                </label>
                <div className="flex gap-4">
                  <CheckboxField
                    label="Email"
                    checked={globalSettings.quietHoursAppliesTo.includes(
                      'email',
                    )}
                  />
                  <CheckboxField
                    label="Push"
                    checked={globalSettings.quietHoursAppliesTo.includes(
                      'push',
                    )}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Type Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferencias Detalladas</CardTitle>
          <CardDescription>
            Configura qué notificaciones recibir y por qué canales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple">
            {NOTIFICATION_CATEGORIES.map((category) => (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger>{category.label}</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {typePreferences
                      .filter((p) =>
                        category.types.includes(p.notificationType),
                      )
                      .map((pref) => (
                        <NotificationTypeConfig
                          key={pref.notificationType}
                          preference={pref}
                          onUpdate={(dto) =>
                            updateTypeMutation.mutate({
                              type: pref.notificationType,
                              dto,
                            })
                          }
                        />
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

### Component: NotificationTypeConfig

```tsx
interface NotificationTypeConfigProps {
  preference: NotificationTypePreference;
  onUpdate: (dto: UpdateTypePreferenceDto) => void;
}

export const NotificationTypeConfig: React.FC<NotificationTypeConfigProps> = ({
  preference,
  onUpdate,
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{NOTIFICATION_LABELS[preference.notificationType]}</h4>
        <Switch
          checked={preference.enabled}
          onCheckedChange={(checked) =>
            onUpdate({ ...preference, enabled: checked })
          }
        />
      </div>

      {preference.enabled && (
        <div className="space-y-2">
          <label className="text-sm text-gray-600">Canales:</label>
          <div className="flex gap-4">
            <CheckboxField
              label="In-App"
              checked={preference.channels.in_app}
              onChange={(checked) =>
                onUpdate({
                  ...preference,
                  channels: { ...preference.channels, in_app: checked },
                })
              }
            />
            <CheckboxField
              label="Email"
              checked={preference.channels.email}
              onChange={(checked) =>
                onUpdate({
                  ...preference,
                  channels: { ...preference.channels, email: checked },
                })
              }
            />
            <CheckboxField
              label="Push"
              checked={preference.channels.push}
              onChange={(checked) =>
                onUpdate({
                  ...preference,
                  channels: { ...preference.channels, push: checked },
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## 🧪 Tests

```typescript
describe('NotificationPreferencesService', () => {
  it('should initialize default preferences for new user', async () => {
    // Arrange
    const user = await createUser({ role: 'student' });

    // Act
    const globalSettings = await service.getGlobalSettings(user.id);

    // Assert
    expect(globalSettings.inAppEnabled).toBe(true);
    expect(globalSettings.emailEnabled).toBe(true);
    expect(globalSettings.pushEnabled).toBe(false);
    expect(globalSettings.quietHoursEnabled).toBe(true);
    expect(globalSettings.quietHoursStart).toBe('22:00:00');
  });

  it('should respect quiet hours when checking if notification should be sent', async () => {
    // Arrange
    const user = await createUser();
    await service.updateGlobalSettings(user.id, {
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    });

    // Mock current time to be within quiet hours (e.g., 23:00)
    jest.useFakeTimers().setSystemTime(new Date('2025-11-07T23:00:00'));

    // Act
    const shouldSend = await service.shouldSendNotification(
      user.id,
      'achievement_unlocked',
      'email',
      'medium',
    );

    // Assert
    expect(shouldSend).toBe(false);
  });

  it('should send urgent notifications even during quiet hours', async () => {
    // Arrange
    const user = await createUser();
    await service.updateGlobalSettings(user.id, {
      quietHoursEnabled: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    });

    jest.useFakeTimers().setSystemTime(new Date('2025-11-07T23:00:00'));

    // Act
    const shouldSend = await service.shouldSendNotification(
      user.id,
      'system_error',
      'email',
      'urgent',
    );

    // Assert
    expect(shouldSend).toBe(true);
  });
});
```

---

## 📅 Historial

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-07 | Creación inicial |

---

**Documento:** `docs/02-especificaciones-tecnicas/06-notificaciones/ET-NOT-002-preferencias-notificaciones.md`
