# US-AE-005: Parametrización Dinámica de Gamificación

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-005 |
| **Épica** | EXT-002 (Admin Extendido CORE) |
| **Módulo** | Admin - Configuración del Sistema |
| **Prioridad** | Alta (v2 CORE) |
| **Story Points** | 12 |
| **Presupuesto** | $4,800 MXN |
| **Sprint** | TBD |
| **Estado** | 🆕 Nueva |
| **Versión** | 1.0 |
| **Fecha creación** | 2025-11-08 |

## 🎯 Historia de Usuario

**Como** super administrador de la plataforma GAMILIT
**Quiero** configurar dinámicamente los parámetros del sistema de gamificación
**Para** ajustar la dificultad, recompensas y progresión sin necesidad de modificar el código

## 📝 Descripción

Actualmente (v1), todos los parámetros de gamificación están hardcoded en el código:
- XP otorgado por cada ejercicio
- Multiplicadores de XP por nivel/rango
- Thresholds de XP para subir de rango
- Criterios de desbloqueo de insignias
- Cantidad de ML Coins otorgadas por logros

Esta US permite al super admin configurar estos valores dinámicamente a través de una interfaz web, permitiendo:
- Ajustar la dificultad de progresión en tiempo real
- Experimentar con diferentes economías de gamificación (A/B testing)
- Personalizar la experiencia por institución educativa (multi-tenancy)

### Contexto de Alcance v2

Esta funcionalidad es parte del **Alcance v2 (Ampliación) - Portal de Admin CORE**:
- En v1: Valores hardcoded en código
- En v2: Valores configurables dinámicamente por super admin

## 🔗 Referencias

### Épica y Documentación
- **Épica:** EXT-002 (Admin Extendido)
- **Alcance:** 2.2.1.5 Administración y Escalabilidad (v2 - Parametrización)
- **RF relacionado:** RF-SYS-001 (Sistema de configuración global)
- **ET relacionado:** ET-SYS-001 (Implementación de system_settings)
- **Infraestructura base:** EAI-006 (Configuración del Sistema)

### Objetos de BD

**Tabla principal:** `system_configuration.system_settings`

```sql
CREATE TABLE system_configuration.system_settings (
  setting_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL, -- 'gamification', 'system', 'notifications'
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  value_type VARCHAR(20) NOT NULL, -- 'number', 'string', 'boolean', 'json'
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  min_value NUMERIC,
  max_value NUMERIC,
  default_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(category, key)
);
```

**Settings de gamificación:**

```typescript
// Categoría: gamification
{
  "xp_per_exercise_correct": 10,        // XP base por ejercicio correcto
  "xp_per_exercise_excellent": 20,      // XP por ejercicio con >90% accuracy
  "xp_multiplier_streak_3": 1.2,        // Multiplicador por racha de 3 días
  "xp_multiplier_streak_7": 1.5,        // Multiplicador por racha de 7 días
  "xp_multiplier_level_2": 1.1,         // Multiplicador por estar en nivel 2+
  "xp_multiplier_level_5": 1.3,         // Multiplicador por estar en nivel 5+
  "coins_per_module_complete": 50,      // ML Coins por completar módulo
  "coins_per_rank_promotion": 100,      // ML Coins por subir de rango
  "coins_per_achievement": 25,          // ML Coins por desbloquear insignia
  "rank_thresholds": {                  // XP requerido para cada rango
    "ix_chel_aprendiz": 0,
    "ah_puch_explorador": 500,
    "kukulkan_sabio": 1500,
    "itzamna_maestro": 3500
  },
  "achievement_criteria_first_module": 1,    // Completar 1 módulo
  "achievement_criteria_streak_master": 7,   // 7 días consecutivos
  "achievement_criteria_xp_milestone": 1000, // Alcanzar 1000 XP
  "help_cost_hint": 10,                 // Costo en ML Coins de pista
  "help_cost_skip": 25,                 // Costo de saltar pregunta
  "help_cost_extra_time": 15            // Costo de tiempo extra
}
```

### Backend
- **Endpoint GET:** `GET /api/v1/admin/gamification/settings`
- **Endpoint UPDATE:** `PUT /api/v1/admin/gamification/settings`
- **Service:** `GamificationConfigService`
- **Cache:** Redis con TTL de 5 minutos

### Frontend
- **Ruta:** `/admin/settings/gamification`
- **Componente:** `GamificationSettingsPanel.tsx`
- **Tabs:** XP & Niveles | ML Coins | Rangos | Insignias | Ayudas

## ✅ Criterios de Aceptación

### CA-1: Ver Configuración Actual

**Dado** que soy un super admin autenticado
**Cuando** accedo a "Configuración" → "Gamificación"
**Entonces:**
- ✅ Veo una interfaz organizada en 5 tabs:
  1. **XP & Niveles** (xp_per_exercise, multiplicadores)
  2. **ML Coins** (recompensas por logros)
  3. **Rangos Maya** (thresholds de XP)
  4. **Insignias** (criterios de desbloqueo)
  5. **Ayudas** (costos en ML Coins)
- ✅ Cada setting muestra:
  - Nombre descriptivo
  - Valor actual
  - Valor por defecto (badge "Default")
  - Descripción/tooltip explicativo
  - Input apropiado (number, slider, JSON editor)
- ✅ Los cambios NO se aplican inmediatamente (modo borrador)
- ✅ Hay un botón "Guardar cambios" (disabled si no hay cambios)
- ✅ Hay un botón "Restaurar defaults"

### CA-2: Modificar XP y Niveles

**Dado** que estoy en el tab "XP & Niveles"
**Cuando** modifico los valores de XP
**Entonces:**
- ✅ Puedo cambiar `xp_per_exercise_correct` (min: 1, max: 100)
- ✅ Puedo cambiar `xp_per_exercise_excellent` (min: xp_correct, max: 200)
- ✅ Puedo cambiar multiplicadores de racha (min: 1.0, max: 3.0)
- ✅ Puedo cambiar multiplicadores de nivel (min: 1.0, max: 5.0)
- ✅ Veo validaciones en tiempo real:
  - `xp_excellent` >= `xp_correct`
  - Multiplicadores entre 1.0 y 3.0
  - No valores negativos
- ✅ Veo un preview del impacto:
  - "Un alumno nivel 2 con racha de 3 días recibirá: X XP"
- ✅ Los cambios se marcan en amarillo (pending)
- ✅ El botón "Guardar cambios" se habilita

### CA-3: Modificar Thresholds de Rangos

**Dado** que estoy en el tab "Rangos Maya"
**Cuando** modifico los thresholds de XP
**Entonces:**
- ✅ Veo una tabla con los 4 rangos:
  | Rango | Nombre | XP Requerido |
  |-------|--------|-------------|
  | 1 | Ix Chel (Aprendiz) | 0 (fijo) |
  | 2 | Ah Puch (Explorador) | 500 ✏️ |
  | 3 | Kukulkan (Sabio) | 1500 ✏️ |
  | 4 | Itzamna (Maestro) | 3500 ✏️ |
- ✅ Puedo editar los valores inline (double-click)
- ✅ Validaciones:
  - Rango 2 XP > 0
  - Rango 3 XP > Rango 2 XP
  - Rango 4 XP > Rango 3 XP
  - Máximo 10,000 XP por rango
- ✅ Veo un preview:
  - "Con estos valores, un alumno promedio alcanzará Maestro en ~X semanas"
- ✅ Hay un botón "Previsualizar impacto" que muestra:
  - Distribución actual de alumnos por rango
  - Distribución proyectada con nuevos valores
  - Alumnos que subirían/bajarían de rango

### CA-4: Modificar Criterios de Insignias

**Dado** que estoy en el tab "Insignias"
**Cuando** modifico los criterios de desbloqueo
**Entonces:**
- ✅ Veo una lista de todas las insignias configurables:
  - "Primer Módulo" → Completar X módulos (default: 1)
  - "Maestro de Racha" → X días consecutivos (default: 7)
  - "Coleccionista de XP" → Alcanzar X XP (default: 1000)
  - (más insignias...)
- ✅ Puedo editar cada criterio numérico
- ✅ Validaciones:
  - Valores >= 1
  - No exceder límites razonables (ej: 365 días racha)
- ✅ Veo estadísticas:
  - "X% de alumnos actuales cumplen este criterio"
  - "Si lo subes a Y, solo Z% lo cumplirán"

### CA-5: Guardar Cambios

**Dado** que he modificado uno o más settings
**Cuando** hago clic en "Guardar cambios"
**Y** confirmo en el modal de confirmación
**Entonces:**
- ✅ Veo un modal de confirmación:
  - "¿Estás seguro de aplicar estos cambios?"
  - Lista de cambios a aplicar (antes → después)
  - "Estos cambios afectarán a todos los usuarios inmediatamente"
  - Checkboxes de confirmación
- ✅ Al confirmar:
  - Se guardan en `system_settings`
  - Se invalida cache de Redis
  - Se crea evento en auditoría
  - Veo toast "Configuración actualizada"
  - Los settings cambian de "pending" a "saved"
- ✅ Los cambios se aplican inmediatamente en la plataforma
- ✅ El backend recarga settings desde DB (cache invalidado)

### CA-6: Restaurar Defaults

**Dado** que estoy en cualquier tab
**Cuando** hago clic en "Restaurar defaults"
**Y** confirmo la acción
**Entonces:**
- ✅ Todos los settings del tab actual vuelven a valores por defecto
- ✅ Se marca como pending (no se guarda automáticamente)
- ✅ Debo hacer clic en "Guardar cambios" para aplicar

### CA-7: Validaciones y Restricciones

**Dado** que soy super admin
**Entonces:**
- ✅ Solo yo puedo acceder a esta configuración (role check)
- ✅ No puedo establecer valores que rompan el sistema:
  - XP negativo
  - Thresholds decrecientes
  - Costos de ayudas > balance máximo
- ✅ Veo warnings si:
  - Los cambios son muy drásticos (>50% diferencia)
  - Pueden afectar negativamente la experiencia
- ✅ Hay un changelog de cambios (auditoría)

### CA-8: Preview e Impacto

**Dado** que he modificado settings
**Cuando** hago clic en "Previsualizar impacto"
**Entonces:**
- ✅ Veo un modal con simulaciones:
  - Distribución de alumnos por rango (antes vs después)
  - XP promedio necesario para completar un módulo
  - Tiempo estimado para alcanzar cada rango
  - Economía de ML Coins (ganancia vs gasto promedio)
- ✅ Puedo simular diferentes escenarios
- ✅ Puedo exportar el análisis a PDF/CSV

## 🏗️ Diseño Técnico

### Backend (NestJS)

#### Service: GamificationConfigService

```typescript
// apps/backend/src/modules/admin/services/gamification-config.service.ts

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/shared/services/database.service';
import { CacheService } from '@/shared/services/cache.service';
import { AuditService } from '@/modules/audit/audit.service';

const CACHE_KEY = 'gamification:config';
const CACHE_TTL = 300; // 5 minutos

@Injectable()
export class GamificationConfigService {
  constructor(
    private dbClient: DatabaseService,
    private cache: CacheService,
    private audit: AuditService,
  ) {}

  async getSettings(): Promise<GamificationSettings> {
    // 1. Intentar obtener de caché
    const cached = await this.cache.get<GamificationSettings>(CACHE_KEY);
    if (cached) return cached;

    // 2. Cargar desde DB
    const { data, error } = await this.dbClient
      .from('system_settings')
      .select('*')
      .eq('category', 'gamification');

    if (error) throw new InternalServerErrorException(error.message);

    // 3. Convertir a objeto estructurado
    const settings = this.transformToSettings(data);

    // 4. Guardar en caché
    await this.cache.set(CACHE_KEY, settings, CACHE_TTL);

    return settings;
  }

  async updateSettings(
    adminId: string,
    updates: Partial<GamificationSettings>,
  ): Promise<{ success: boolean }> {
    // 1. Validar cambios
    this.validateSettings(updates);

    // 2. Calcular preview de impacto
    const impact = await this.calculateImpact(updates);

    // 3. Guardar en DB
    const settingsArray = this.transformToArray(updates);

    for (const setting of settingsArray) {
      await this.dbClient
        .from('system_settings')
        .upsert({
          category: 'gamification',
          key: setting.key,
          value: setting.value,
          value_type: setting.type,
          updated_by: adminId,
          updated_at: new Date().toISOString(),
        });
    }

    // 4. Invalidar caché
    await this.cache.del(CACHE_KEY);

    // 5. Auditoría
    await this.audit.log({
      event_type: 'gamification_settings_updated',
      user_id: adminId,
      metadata: { changes: updates, impact },
    });

    // 6. Notificar a otros servidores (si hay múltiples instancias)
    await this.pubsub.publish('config:invalidate', { key: CACHE_KEY });

    return { success: true };
  }

  private validateSettings(settings: Partial<GamificationSettings>): void {
    const errors: string[] = [];

    // Validar XP
    if (settings.xp_per_exercise_correct !== undefined) {
      if (settings.xp_per_exercise_correct < 1 || settings.xp_per_exercise_correct > 100) {
        errors.push('xp_per_exercise_correct debe estar entre 1 y 100');
      }
    }

    if (settings.xp_per_exercise_excellent !== undefined && settings.xp_per_exercise_correct !== undefined) {
      if (settings.xp_per_exercise_excellent < settings.xp_per_exercise_correct) {
        errors.push('xp_excellent debe ser mayor o igual a xp_correct');
      }
    }

    // Validar thresholds de rangos
    if (settings.rank_thresholds) {
      const thresholds = Object.values(settings.rank_thresholds);
      for (let i = 1; i < thresholds.length; i++) {
        if (thresholds[i] <= thresholds[i - 1]) {
          errors.push('Los thresholds de rangos deben ser crecientes');
        }
      }
    }

    // Validar multiplicadores
    if (settings.xp_multiplier_streak_3 !== undefined) {
      if (settings.xp_multiplier_streak_3 < 1.0 || settings.xp_multiplier_streak_3 > 3.0) {
        errors.push('Multiplicadores deben estar entre 1.0 y 3.0');
      }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(', '));
    }
  }

  async calculateImpact(updates: Partial<GamificationSettings>) {
    // Consultar datos actuales de alumnos
    const { data: students } = await this.dbClient
      .from('profiles')
      .select('user_id, current_xp, current_rank')
      .eq('role', 'student');

    const currentSettings = await this.getSettings();
    const newSettings = { ...currentSettings, ...updates };

    // Simular redistribución de rangos
    const currentDistribution = this.calculateRankDistribution(students, currentSettings);
    const newDistribution = this.calculateRankDistribution(students, newSettings);

    return {
      current: currentDistribution,
      projected: newDistribution,
      changes: {
        promotions: newDistribution.promotions,
        demotions: newDistribution.demotions,
      },
    };
  }
}
```

#### Controller: AdminConfigController

```typescript
// apps/backend/src/modules/admin/controllers/admin-config.controller.ts

@Controller('admin/gamification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
export class AdminConfigController {
  constructor(private configService: GamificationConfigService) {}

  @Get('settings')
  async getSettings() {
    return this.configService.getSettings();
  }

  @Put('settings')
  async updateSettings(@Req() req, @Body() dto: UpdateGamificationSettingsDto) {
    return this.configService.updateSettings(req.user.id, dto);
  }

  @Post('settings/preview')
  async previewImpact(@Body() dto: UpdateGamificationSettingsDto) {
    return this.configService.calculateImpact(dto);
  }

  @Post('settings/restore-defaults')
  async restoreDefaults(@Req() req) {
    const defaults = this.configService.getDefaultSettings();
    return this.configService.updateSettings(req.user.id, defaults);
  }
}
```

### Frontend (React + TypeScript)

#### Componente: GamificationSettingsPanel

```typescript
// apps/frontend/src/features/admin/components/GamificationSettingsPanel.tsx

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useGamificationSettings } from '../hooks/useGamificationSettings';
import { XpSettings } from './XpSettings';
import { CoinsSettings } from './CoinsSettings';
import { RankSettings } from './RankSettings';
import { AchievementSettings } from './AchievementSettings';
import { HelpSettings } from './HelpSettings';
import { PreviewModal } from './PreviewModal';
import { useState } from 'react';

export function GamificationSettingsPanel() {
  const {
    settings,
    updateSettings,
    restoreDefaults,
    previewImpact,
    hasChanges,
    pendingChanges,
    isLoading,
  } = useGamificationSettings();

  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración de Gamificación</h1>
          <p className="text-gray-600">
            Ajusta los parámetros del sistema de puntos, niveles y recompensas
          </p>
        </div>

        <div className="flex gap-3">
          {hasChanges && (
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
            >
              Previsualizar impacto
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => restoreDefaults()}
            disabled={!hasChanges}
          >
            Restaurar defaults
          </Button>
          <Button
            onClick={() => updateSettings(pendingChanges)}
            disabled={!hasChanges}
            isLoading={isLoading}
          >
            Guardar cambios
          </Button>
        </div>
      </div>

      <Tabs defaultValue="xp">
        <TabsList>
          <TabsTrigger value="xp">XP & Niveles</TabsTrigger>
          <TabsTrigger value="coins">ML Coins</TabsTrigger>
          <TabsTrigger value="ranks">Rangos Maya</TabsTrigger>
          <TabsTrigger value="achievements">Insignias</TabsTrigger>
          <TabsTrigger value="help">Ayudas</TabsTrigger>
        </TabsList>

        <TabsContent value="xp">
          <XpSettings settings={settings} />
        </TabsContent>

        <TabsContent value="coins">
          <CoinsSettings settings={settings} />
        </TabsContent>

        <TabsContent value="ranks">
          <RankSettings settings={settings} />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementSettings settings={settings} />
        </TabsContent>

        <TabsContent value="help">
          <HelpSettings settings={settings} />
        </TabsContent>
      </Tabs>

      <PreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        changes={pendingChanges}
      />
    </div>
  );
}
```

#### Hook: useGamificationSettings

```typescript
// apps/frontend/src/features/admin/hooks/useGamificationSettings.ts

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { toast } from 'sonner';

export function useGamificationSettings() {
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['gamification-settings'],
    queryFn: () => adminApi.getGamificationSettings(),
  });

  const updateMutation = useMutation({
    mutationFn: (changes) => adminApi.updateGamificationSettings(changes),
    onSuccess: () => {
      queryClient.invalidateQueries(['gamification-settings']);
      setPendingChanges({});
      toast.success('Configuración actualizada exitosamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al guardar configuración');
    },
  });

  const previewMutation = useMutation({
    mutationFn: (changes) => adminApi.previewGamificationImpact(changes),
  });

  const restoreDefaultsMutation = useMutation({
    mutationFn: () => adminApi.restoreGamificationDefaults(),
    onSuccess: () => {
      queryClient.invalidateQueries(['gamification-settings']);
      setPendingChanges({});
      toast.success('Valores por defecto restaurados');
    },
  });

  const updateSettings = (changes) => {
    updateMutation.mutate(changes);
  };

  const restoreDefaults = () => {
    if (confirm('¿Restaurar todos los valores por defecto?')) {
      restoreDefaultsMutation.mutate();
    }
  };

  const previewImpact = async (changes) => {
    return previewMutation.mutateAsync(changes);
  };

  const changeSetting = (key, value) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return {
    settings: { ...settings, ...pendingChanges },
    updateSettings,
    restoreDefaults,
    previewImpact,
    changeSetting,
    hasChanges,
    pendingChanges,
    isLoading: isLoading || updateMutation.isPending,
  };
}
```

## 🧪 Testing

### Test Cases

**TC-1: Validación de thresholds crecientes**
```typescript
it('should reject decreasing rank thresholds', async () => {
  await expect(
    configService.updateSettings(adminId, {
      rank_thresholds: {
        ix_chel_aprendiz: 0,
        ah_puch_explorador: 500,
        kukulkan_sabio: 400, // ERROR: menor que anterior
        itzamna_maestro: 3500,
      },
    })
  ).rejects.toThrow('Los thresholds de rangos deben ser crecientes');
});
```

**TC-2: Cache invalidation**
```typescript
it('should invalidate cache after update', async () => {
  await configService.updateSettings(adminId, { xp_per_exercise_correct: 15 });

  const cached = await cache.get(CACHE_KEY);
  expect(cached).toBeNull();

  const fresh = await configService.getSettings();
  expect(fresh.xp_per_exercise_correct).toBe(15);
});
```

**TC-3: Preview accuracy**
```typescript
it('should calculate impact correctly', async () => {
  const impact = await configService.calculateImpact({
    rank_thresholds: {
      ix_chel_aprendiz: 0,
      ah_puch_explorador: 1000, // Aumentado de 500
      kukulkan_sabio: 1500,
      itzamna_maestro: 3500,
    },
  });

  expect(impact.changes.demotions).toBeGreaterThan(0);
});
```

### Coverage Objetivo
- Backend: 95%+ (lógica de validación crítica)
- Frontend: 80%+ (UI components)

## 📊 Métricas

| Métrica | Valor Objetivo |
|---------|----------------|
| **Load time settings** | < 300ms |
| **Save changes** | < 1s |
| **Preview calculation** | < 3s (con 10k alumnos) |
| **Cache hit rate** | > 95% |

## 🔐 Seguridad

### Validaciones
- ✅ Solo `super_admin` puede acceder (RolesGuard)
- ✅ Validación de rangos (min/max)
- ✅ Validación de coherencia (thresholds crecientes)
- ✅ Audit trail completo
- ✅ Preview antes de aplicar cambios drásticos

### Rate Limiting
- Máximo 10 cambios por hora por admin (prevenir experimentos excesivos)

## 🚀 Deployment

### Migraciones
- No requiere nuevas tablas (usa `system_settings` de EAI-006)
- Requiere seed de valores por defecto

### Seed de Defaults
```sql
INSERT INTO system_configuration.system_settings (category, key, value, value_type, description) VALUES
('gamification', 'xp_per_exercise_correct', '10', 'number', 'XP otorgado por ejercicio correcto'),
('gamification', 'xp_per_exercise_excellent', '20', 'number', 'XP otorgado por ejercicio excelente (>90%)'),
('gamification', 'xp_multiplier_streak_3', '1.2', 'number', 'Multiplicador por racha de 3 días'),
-- ... más settings
```

## 📚 Documentación para Usuario

### Manual de Admin

**Título:** Configuración del Sistema de Gamificación

**¿Qué puedes configurar?**
- Puntos de experiencia (XP) por actividad
- Monedas lectoras (ML Coins) otorgadas
- Umbrales de XP para cada rango Maya
- Criterios de desbloqueo de insignias
- Costos de ayudas

**Recomendaciones:**
- Haz cambios pequeños e iterativos
- Usa "Previsualizar impacto" antes de guardar
- Monitorea métricas de engagement después de cambios

## 🔗 Dependencias

### Épicas/US Relacionadas
- **EAI-006:** Infraestructura de `system_settings`
- **EAI-003:** Sistema de gamificación base
- **RF-SYS-001:** Sistema de configuración global

### Bloqueantes
- ✅ Tabla `system_settings` debe existir
- ✅ Cache service operativo
- ✅ Audit service operativo

## 📅 Estimación

| Actividad | Esfuerzo |
|-----------|----------|
| Backend (service, validations, cache) | 3.5 SP |
| Backend (preview/impact calculations) | 2 SP |
| Frontend (5 tabs + modales) | 4.5 SP |
| Testing (unit + integration) | 1.5 SP |
| Seed data + documentation | 0.5 SP |
| **TOTAL** | **12 SP** |

**Presupuesto:** $4,800 MXN (12 SP × $400/SP)

---

**Generado:** 2025-11-08
**Autor:** Product Owner + Tech Lead
**Revisión:** Pendiente
**Aprobación:** Pendiente
