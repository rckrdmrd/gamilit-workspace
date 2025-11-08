# US-NOT-001c: Gestión de Preferencias de Notificaciones

**Épica:** EXT-003 - Sistema de Notificaciones
**Sprint:** Mes 3, Semana 3
**Story Points:** 4 SP
**Presupuesto:** $5,260 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-NOT-001 (dividida en a/b/c por PF-001)

---

## Descripción

**Como** estudiante de Gamilit
**Quiero** configurar mis preferencias de notificaciones (tipos, canales, sonidos, frecuencia)
**Para** controlar qué notificaciones recibo, cómo las recibo y evitar notification fatigue, personalizando mi experiencia

**Contexto:** Esta user story es parte del sistema completo de notificaciones (EXT-003), dividida para cumplir con PF-001. Esta parte implementa el **panel de configuración** donde usuarios personalizan sus preferencias.

**Alcance:**
- Panel de preferencias en Settings > Notifications
- Configuración por tipo de notificación (Logros, Amigos, Gremios, Misiones, Sistema)
- Configuración por canal (In-App, Email, Push)
- Configuración de sonidos y vibraciones
- Guardar y validar preferencias
- API REST para persistencia de preferencias

---

## Valor de Negocio

- **Reduce Notification Fatigue**: Usuarios controlan volumen de notificaciones
- **Aumenta Engagement**: Notificaciones relevantes = mayor CTR
- **Tasa de Opt-Out Total**: <5% (usuarios que desactivan todas)
- **Preferencias Personalizadas**: >60% usuarios modifican al menos 1 preferencia
- **Compliance**: GDPR/CCPA requieren opt-in para emails y push

---

## Criterios de Aceptación

### CA-01: Panel de Preferencias de Notificaciones
**Dado** que un usuario accede a configuración
**Cuando** navega a Settings > Notifications
**Entonces** debe ver panel con:

**1. Preferencias Generales (In-App)**:
- [ ] **Notificaciones en tiempo real** (toggle ON/OFF)
  - Default: ON
  - Efecto: Desactiva WebSocket y toasts si OFF

- [ ] **Mostrar toasts** (toggle ON/OFF)
  - Default: ON
  - Requiere: Notificaciones en tiempo real ON

- [ ] **Sonido de notificaciones** (toggle ON/OFF)
  - Default: ON
  - Requiere: Toasts ON

- [ ] **Vibración en móviles** (toggle ON/OFF)
  - Default: ON
  - Solo visible en mobile

**2. Preferencias por Tipo**:

Cada tipo tiene 3 opciones (radio buttons):
- **Todas**: Recibir todas las notificaciones de este tipo
- **Solo importantes**: Solo notificaciones de alta prioridad (P0/P1)
- **Ninguna**: No recibir notificaciones de este tipo

Tipos configurables:
- [ ] **Achievements (Logros)**: Todas / Solo raros y épicos / Ninguno
  - Default: Todas

- [ ] **Amigos**: Todas / Solo solicitudes / Ninguno
  - Default: Todas

- [ ] **Gremios**: Todas / Solo desafíos e invitaciones / Ninguno
  - Default: Todas

- [ ] **Misiones**: Todas / Solo completadas y por expirar / Ninguno
  - Default: Todas

- [ ] **Sistema**: Todas / Solo importantes / Ninguno
  - Default: Todas (no desactivable completamente)

**3. Email Notifications (Futuro - UI preparada)**:
- [ ] **Resumen diario** (toggle) - Default: OFF
- [ ] **Notificaciones importantes inmediatas** (toggle) - Default: OFF
- [ ] **Desactivar todos los emails** (toggle) - Default: ON

**4. Push Notifications (Futuro - Placeholder)**:
- [ ] **Habilitar push notifications** (toggle)
  - Estado: "Próximamente disponible" (disabled en v1)
  - Backend preparado, frontend no implementado

**Validación**:
- Panel carga preferencias actuales desde API
- Cambios se guardan automáticamente (auto-save cada 2 segundos)
- Mensaje de confirmación: "Preferencias guardadas" (toast verde)

### CA-02: Persistencia de Preferencias
**Dado** que un usuario modifica preferencias
**Cuando** cambia un toggle o selecciona opción
**Entonces** debe:

**Auto-Save**:
- Cambios guardados automáticamente cada 2 segundos (debounced)
- Indicador visual: "Guardando..." → "Guardado ✓"
- Request a API: `PUT /api/user/notification-preferences`
- Validación en backend antes de persistir

**Sincronización**:
- Preferencias aplicadas inmediatamente en WebSocket
- Notificaciones filtradas según preferencias antes de enviar
- Cache invalidada al guardar (React Query)

**Validación**:
- Usuario cambia "Achievements" de "Todas" a "Solo raros" → guardado automáticamente
- Cambios persisten al recargar página
- Error 400 si intenta guardar valor inválido

### CA-03: Aplicación de Preferencias en Tiempo Real
**Dado** que un usuario tiene preferencias configuradas
**Cuando** se generan notificaciones
**Entonces** sistema debe respetar preferencias:

**Filtrado**:
- Backend consulta preferencias antes de enviar notificación
- Si tipo desactivado (none) → no enviar
- Si "solo importantes" → enviar solo P0/P1
- Si toasts desactivados → no mostrar toast (solo centro)
- Si sonido desactivado → toast sin sonido

**Ejemplos**:
- Usuario tiene "Achievements" en "Solo raros" → Logro común NO se envía, logro raro SÍ
- Usuario tiene "Sonido" en OFF → Toast se muestra sin sonido
- Usuario tiene "Toasts" en OFF → Notificación en centro silenciosamente

**Validación**:
- Usuario con "Amigos: Solo solicitudes" NO recibe "friend:online"
- Usuario con "Amigos: Solo solicitudes" SÍ recibe "friend:request"

### CA-04: API REST para Preferencias
**Dado** que se necesita persistir preferencias
**Cuando** frontend realiza requests
**Entonces** backend debe proveer endpoints:

**Endpoints**:

```typescript
// Get user's notification preferences
GET /api/user/notification-preferences
Response: {
  inAppEnabled: boolean,
  toastEnabled: boolean,
  soundEnabled: boolean,
  vibrationEnabled: boolean,
  emailEnabled: boolean,
  pushEnabled: boolean,
  preferencesByType: {
    achievements: 'all' | 'important' | 'none',
    friends: 'all' | 'important' | 'none',
    guilds: 'all' | 'important' | 'none',
    missions: 'all' | 'important' | 'none',
    system: 'all' | 'important' // System no puede ser 'none'
  }
}

// Update preferences
PUT /api/user/notification-preferences
Request Body: NotificationPreferencesDTO
Response: { success: true, preferences: NotificationPreferences }

// Reset to default
POST /api/user/notification-preferences/reset
Response: { success: true, preferences: NotificationPreferences }
```

**Validación**:
- GET retorna preferencias actuales del usuario
- PUT guarda y retorna preferencias actualizadas
- Request inválido retorna 400

---

## Especificaciones Técnicas

### Backend - API Endpoints

**Tecnologías**: NestJS, PostgreSQL, class-validator

**PreferencesController**:

```typescript
import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('user/notification-preferences')
@UseGuards(JwtAuthGuard)
export class NotificationPreferencesController {
  constructor(private readonly preferencesService: NotificationPreferencesService) {}

  @Get()
  async getPreferences(@CurrentUser() user) {
    return this.preferencesService.getPreferences(user.id);
  }

  @Put()
  async updatePreferences(@CurrentUser() user, @Body() dto: UpdatePreferencesDto) {
    const preferences = await this.preferencesService.updatePreferences(user.id, dto);
    return { success: true, preferences };
  }

  @Post('reset')
  async resetPreferences(@CurrentUser() user) {
    const preferences = await this.preferencesService.resetToDefaults(user.id);
    return { success: true, preferences };
  }
}
```

**UpdatePreferencesDto**:

```typescript
import { IsBoolean, IsEnum, ValidateNested } from 'class-validator';

enum PreferenceLevel { ALL = 'all', IMPORTANT = 'important', NONE = 'none' }

class PreferencesByTypeDto {
  @IsEnum(PreferenceLevel) achievements: PreferenceLevel;
  @IsEnum(PreferenceLevel) friends: PreferenceLevel;
  @IsEnum(PreferenceLevel) guilds: PreferenceLevel;
  @IsEnum(PreferenceLevel) missions: PreferenceLevel;
  @IsEnum(['all', 'important']) system: 'all' | 'important'; // No 'none'
}

export class UpdatePreferencesDto {
  @IsBoolean() inAppEnabled: boolean;
  @IsBoolean() toastEnabled: boolean;
  @IsBoolean() soundEnabled: boolean;
  @IsBoolean() vibrationEnabled: boolean;
  @IsBoolean() emailEnabled: boolean;
  @IsBoolean() pushEnabled: boolean;
  @ValidateNested() preferencesByType: PreferencesByTypeDto;
}
```

### Database Schema

```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN DEFAULT true,
  toast_enabled BOOLEAN DEFAULT true,
  sound_enabled BOOLEAN DEFAULT true,
  vibration_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  preferences_by_type JSONB DEFAULT '{
    "achievements": "all", "friends": "all", "guilds": "all",
    "missions": "all", "system": "all"
  }',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-crear preferencias al crear usuario
CREATE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_notification_preferences
AFTER INSERT ON users FOR EACH ROW
EXECUTE FUNCTION create_default_notification_preferences();
```

### Frontend - React Components

**Tecnologías**: React 18, React Hook Form, Zod, TailwindCSS

**NotificationPreferencesPage**:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

const preferencesSchema = z.object({
  inAppEnabled: z.boolean(),
  toastEnabled: z.boolean(),
  soundEnabled: z.boolean(),
  vibrationEnabled: z.boolean(),
  preferencesByType: z.object({
    achievements: z.enum(['all', 'important', 'none']),
    friends: z.enum(['all', 'important', 'none']),
    guilds: z.enum(['all', 'important', 'none']),
    missions: z.enum(['all', 'important', 'none']),
    system: z.enum(['all', 'important'])
  })
});

export function NotificationPreferencesPage() {
  const { preferences, updatePreferences } = useNotificationPreferences();
  const { register, watch } = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: preferences
  });

  // Auto-save on change (debounced)
  useEffect(() => {
    const subscription = watch((value) => {
      const timeoutId = setTimeout(() => updatePreferences(value), 2000);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Preferencias de Notificaciones</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Notificaciones In-App</h2>
        <Toggle label="Notificaciones en tiempo real" {...register('inAppEnabled')} />
        <Toggle label="Mostrar toasts" disabled={!watch('inAppEnabled')} {...register('toastEnabled')} />
        <Toggle label="Sonido" disabled={!watch('toastEnabled')} {...register('soundEnabled')} />
        <Toggle label="Vibración" {...register('vibrationEnabled')} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Preferencias por Tipo</h2>
        <RadioGroup
          label="Achievements"
          options={[
            { value: 'all', label: 'Todas' },
            { value: 'important', label: 'Solo raros y épicos' },
            { value: 'none', label: 'Ninguno' }
          ]}
          {...register('preferencesByType.achievements')}
        />
        {/* ... más tipos ... */}
      </section>
    </div>
  );
}
```

---

## Dependencias

**Requiere:**
- **US-NOT-001a**: Infraestructura WebSocket - aplica preferencias al enviar
- Sistema de autenticación (AUTH-001)

**Relacionada:**
- **US-NOT-001b**: Centro de Notificaciones - usa preferencias

---

## Definición de Hecho (DoD)

### Desarrollo
- [x] Panel de preferencias UI implementado
- [x] Toggles y radio buttons funcionales
- [x] Auto-save con debounce implementado
- [x] API endpoints REST implementados (GET, PUT, POST)
- [x] Validación de DTOs en backend
- [x] Schema de base de datos creado
- [x] Trigger de auto-creación de preferencias

### Testing
- [x] Tests unitarios: PreferencesController, PreferencesService
- [x] Tests de integración: API endpoints
- [x] Tests E2E: Usuario cambia preferencias → se aplican
- [x] Tests de validación: DTOs rechazan valores inválidos

### UX/UI
- [x] Auto-save con indicador visual
- [x] Tooltips explicativos
- [x] Responsive (mobile, desktop)

---

## Estimación

- **Backend - API & Service:** 8 horas
- **Backend - Validación & DB:** 4 horas
- **Frontend - UI Components:** 12 horas
- **Frontend - Form Logic & Auto-save:** 4 horas
- **Testing:** 4 horas

**Total:** 32 horas (**4 SP** @ 8h/SP)

---

## Notas

- ✅ Archivo modularizado desde US-NOT-001-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- ✅ Implementar después de US-NOT-001a y US-NOT-001b
- 📝 Email y Push son placeholders para Fase 4
- 🎨 Auto-save cada 2 segundos mejora UX
- ⚠️ Sistema (`system`) no puede desactivarse completamente

---

## Stack Tecnológico

**Frontend:** React 18, React Hook Form, Zod, TailwindCSS
**Backend:** NestJS, class-validator, PostgreSQL
**Testing:** Jest, Supertest, Cypress

---

**Tags:** #preferences #settings #ui #backend #api #ext-003 #fase3
