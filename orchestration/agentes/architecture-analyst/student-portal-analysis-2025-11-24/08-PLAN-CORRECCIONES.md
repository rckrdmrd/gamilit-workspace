# PLAN DE CORRECCIONES E IMPLEMENTACIONES
# Portal Student - GAMILIT

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Tipo:** Plan de acción con especificaciones técnicas detalladas
**Estado:** Listo para orquestar/delegar

---

## 🎯 OBJETIVO

Proporcionar especificaciones técnicas completas y detalladas para resolver los 7 gaps identificados en el análisis del portal student, priorizadas por impacto y urgencia.

---

## 📋 RESUMEN DE GAPS Y PRIORIZACIÓN

| ID | Gap | Severidad | Prioridad | Estimación | Sprint |
|----|-----|-----------|-----------|------------|--------|
| GAP-001 | Misiones - Recompensas no se otorgan | 🔴 CRÍTICA | P0 | 1-2h | Actual |
| GAP-006 | Perfil - Estadísticas hardcodeadas | 🔴 CRÍTICA | P0 | 1-2h | Actual |
| GAP-007 | Settings - Guardar es mock | 🔴 CRÍTICA | P0 | 4-6h | Actual |
| GAP-003 | Ejercicios - Workaround FE-049 | ⚠️ MEDIA | P1 | 4-6h | Próximo |
| GAP-004 | Ejercicios - Fallback mock | ⚠️ BAJA | P2 | 30min | Próximo |
| GAP-002 | Actividades - Alcance | ℹ️ BAJA | P3 | 1h | Backlog |
| GAP-005 | Rangos - Multiplicador local | ℹ️ BAJA | P3 | 2-3h | Backlog |

---

## 🔴 SPRINT ACTUAL (P0 - CRÍTICO)

### GAP-001: Misiones - Implementar Otorgamiento de Recompensas

**ID:** STUDENT-GAP-001
**Severidad:** 🔴 CRÍTICA
**Prioridad:** P0
**Estimación:** 1-2 horas
**Agente Responsable:** Backend-Developer
**Método:** ✅ ORQUESTAR (Tool: Task)

---

#### ESPECIFICACIÓN TÉCNICA

**Objetivo:**
Implementar lógica completa de otorgamiento de recompensas en `MissionsService.claimRewards()` para que los students reciban XP y ML Coins al reclamar misiones completadas.

**Archivos a Modificar:**
- `apps/backend/src/modules/gamification/services/missions.service.ts` (línea 467)

**Contexto Actual:**
```typescript
// Línea 467 - TODO
async claimRewards(missionId: string, userId: string): Promise<Mission> {
  // Busca misión completada del usuario
  const mission = await this.findCompletedMission(missionId, userId);

  // Marca como claimed
  mission.status = 'claimed';
  mission.claimed_at = new Date();
  await this.missionsRepository.save(mission);

  // TODO: Integrar con MLCoinsService y UserStatsService para otorgar recompensas reales.

  return mission;
}
```

**Implementación Requerida:**

**1. Inyectar servicios necesarios:**
```typescript
constructor(
  @InjectRepository(Mission)
  private readonly missionsRepository: Repository<Mission>,
  private readonly mlCoinsService: MLCoinsService,  // ← AGREGAR
  private readonly userStatsService: UserStatsService,  // ← AGREGAR
  private readonly ranksService: RanksService,  // ← AGREGAR
) {}
```

**2. Modificar método claimRewards():**
```typescript
async claimRewards(missionId: string, userId: string): Promise<MissionWithRewards> {
  // 1. Buscar misión completada
  const mission = await this.missionsRepository.findOne({
    where: {
      id: missionId,
      user_id: userId,
      status: 'completed',
    },
  });

  if (!mission) {
    throw new NotFoundException('Misión completada no encontrada');
  }

  if (mission.status === 'claimed') {
    throw new BadRequestException('Misión ya reclamada');
  }

  // 2. Extraer recompensas del JSONB
  const { xp_reward, ml_coins_reward } = mission.rewards as MissionRewards;

  // 3. Otorgar XP
  if (xp_reward && xp_reward > 0) {
    await this.userStatsService.incrementXP(userId, xp_reward, {
      source: 'mission_completion',
      mission_id: missionId,
      mission_type: mission.mission_type,
    });
  }

  // 4. Otorgar ML Coins
  if (ml_coins_reward && ml_coins_reward > 0) {
    await this.mlCoinsService.addCoins(userId, ml_coins_reward, {
      type: 'mission_reward',
      description: `Recompensa por misión: ${mission.title}`,
      metadata: {
        mission_id: missionId,
        mission_type: mission.mission_type,
      },
    });
  }

  // 5. Marcar misión como claimed
  mission.status = 'claimed';
  mission.claimed_at = new Date();
  await this.missionsRepository.save(mission);

  // 6. Verificar promoción de rango (por aumento de XP)
  const rankPromotion = await this.ranksService.checkPromotionEligibility(userId);
  if (rankPromotion.eligible) {
    await this.ranksService.promoteToNextRank(userId);
  }

  // 7. Retornar misión con detalles de recompensas otorgadas
  return {
    ...mission,
    rewards_granted: {
      xp_awarded: xp_reward,
      ml_coins_awarded: ml_coins_reward,
      rank_promotion: rankPromotion.eligible,
      new_rank: rankPromotion.eligible ? rankPromotion.next_rank : null,
    },
  };
}
```

**3. Tipos TypeScript:**
```typescript
interface MissionRewards {
  xp_reward: number;
  ml_coins_reward: number;
}

interface MissionWithRewards extends Mission {
  rewards_granted: {
    xp_awarded: number;
    ml_coins_awarded: number;
    rank_promotion: boolean;
    new_rank: string | null;
  };
}
```

**Criterios de Aceptación:**
- [ ] `claimRewards()` incrementa `user_stats.total_xp`
- [ ] `claimRewards()` incrementa `user_stats.ml_coins`
- [ ] Se crea registro en `ml_coins_transactions` con `type='mission_reward'`
- [ ] Se verifica automáticamente elegibilidad de promoción de rango
- [ ] Response incluye detalles de recompensas otorgadas
- [ ] Test e2e: Reclamar misión daily (50 XP, 20 ML Coins) incrementa stats correctamente

**Validación:**
```bash
# Test e2e
curl -X POST http://localhost:3000/api/v1/gamification/missions/{missionId}/claim \
  -H "Authorization: Bearer $TOKEN"

# Verificar incremento en user_stats
psql -d gamilit_platform -c "SELECT total_xp, ml_coins FROM gamification_system.user_stats WHERE user_id='...';"

# Verificar transacción
psql -d gamilit_platform -c "SELECT * FROM gamification_system.ml_coins_transactions WHERE user_id='...' ORDER BY created_at DESC LIMIT 1;"
```

**Prompt para Orquestar (Tool: Task):**
```markdown
Lee el archivo orchestration/prompts/PROMPT-BACKEND-AGENT.md y actúa como Backend-Agent.

TAREA: Implementar otorgamiento de recompensas en MissionsService.claimRewards()

CONTEXTO:
Gap STUDENT-GAP-001 identificado por Architecture-Analyst.
Archivo: apps/backend/src/modules/gamification/services/missions.service.ts línea 467
Método actual marca misión como 'claimed' pero NO otorga XP ni ML Coins.

ESPECIFICACIÓN:
Ver especificación completa en:
orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/08-PLAN-CORRECCIONES.md
Sección: GAP-001

PASOS:
1. Inyectar MLCoinsService, UserStatsService, RanksService en constructor
2. Modificar claimRewards() para otorgar recompensas reales
3. Extraer rewards del JSONB (xp_reward, ml_coins_reward)
4. Llamar userStatsService.incrementXP()
5. Llamar mlCoinsService.addCoins()
6. Verificar promoción de rango con ranksService.checkPromotionEligibility()
7. Retornar mission con rewards_granted

CRITERIOS DE ACEPTACIÓN:
- ✅ user_stats.total_xp incrementa al reclamar
- ✅ user_stats.ml_coins incrementa al reclamar
- ✅ Se crea transacción en ml_coins_transactions
- ✅ Se verifica promoción de rango automáticamente
- ✅ Response incluye rewards_granted

RESTRICCIONES:
- Usar transacciones para atomicidad
- Validar que misión está en status 'completed'
- Prevenir reclamación duplicada (status='claimed')

REFERENCIAS:
- orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/03-BACKEND-APIS.md
- apps/backend/src/modules/gamification/services/missions.service.ts
```

---

### GAP-006: Perfil - Conectar Estadísticas Reales

**ID:** STUDENT-GAP-006
**Severidad:** 🔴 CRÍTICA
**Prioridad:** P0
**Estimación:** 1-2 horas
**Agente Responsable:** Frontend-Developer
**Método:** ✅ ORQUESTAR (Tool: Task)

---

#### ESPECIFICACIÓN TÉCNICA

**Objetivo:**
Reemplazar estadísticas hardcodeadas en ProfilePage con datos reales del endpoint `/users/statistics`.

**Archivos a Modificar:**
- `apps/frontend/src/apps/student/pages/ProfilePage.tsx` (líneas 14-15)
- `apps/frontend/src/shared/hooks/useUserStatistics.ts` (crear o usar existente)

**Contexto Actual:**
```typescript
// ProfilePage.tsx - líneas 14-15
const stats = [
  { label: 'ML Coins', value: '350', icon: Coins },  // ← HARDCODED
  { label: 'Logros Desbloqueados', value: '12/50', icon: Trophy },  // ← HARDCODED
  { label: 'Ejercicios Completados', value: '28', icon: Target },  // ← HARDCODED
];
```

**Implementación Requerida:**

**1. Crear hook useUserStatistics.ts (si no existe):**
```typescript
// apps/frontend/src/shared/hooks/useUserStatistics.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';

interface UserStatistics {
  ml_coins: number;
  achievements_earned: number;
  total_achievements: number;
  exercises_completed: number;
  modules_completed: number;
  total_xp: number;
  current_rank: string;
  level: number;
}

export function useUserStatistics(userId: string | undefined) {
  return useQuery<UserStatistics>({
    queryKey: ['userStatistics', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const response = await apiClient.get(`/users/${userId}/statistics`);
      return response.data;
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });
}
```

**2. Modificar ProfilePage.tsx:**
```typescript
// ProfilePage.tsx
import { useUserStatistics } from '@/shared/hooks/useUserStatistics';

export default function ProfilePage() {
  const { user } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  // ✅ AGREGAR: Consumir estadísticas reales
  const { data: userStats, isLoading, error } = useUserStatistics(user?.id);

  // ✅ REEMPLAZAR: Stats con datos reales
  const stats = userStats ? [
    { label: 'ML Coins', value: userStats.ml_coins, icon: Coins },
    {
      label: 'Logros Desbloqueados',
      value: `${userStats.achievements_earned}/${userStats.total_achievements}`,
      icon: Trophy
    },
    { label: 'Ejercicios Completados', value: userStats.exercises_completed, icon: Target },
  ] : [];

  // ✅ AGREGAR: Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // ✅ AGREGAR: Error handling
  if (error) {
    return (
      <div className="text-center p-4 text-red-600">
        Error al cargar estadísticas: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resto del componente */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-lg shadow">
            <stat.icon className="w-6 h-6 text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Criterios de Aceptación:**
- [ ] ProfilePage consume endpoint `/users/:userId/statistics`
- [ ] Stats mostradas coinciden con datos de `gamification_system.user_stats`
- [ ] Loading state visible mientras carga datos
- [ ] Error handling correcto si API falla
- [ ] Stats se actualizan automáticamente (refetch on window focus)

**Validación:**
1. Login como student
2. Navegar a ProfilePage
3. Verificar que stats mostradas coinciden con DB
4. Completar un ejercicio
5. Refrescar página ProfilePage
6. Verificar que "Ejercicios Completados" incrementó

**Prompt para Orquestar (Tool: Task):**
```markdown
Lee el archivo orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Conectar ProfilePage a endpoint /users/statistics para mostrar datos reales

CONTEXTO:
Gap STUDENT-GAP-006 identificado por Architecture-Analyst.
Archivo: apps/frontend/src/apps/student/pages/ProfilePage.tsx líneas 14-15
Stats actuales son hardcoded (350 coins, 12/50 logros, 28 ejercicios)

ESPECIFICACIÓN:
Ver especificación completa en:
orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/08-PLAN-CORRECCIONES.md
Sección: GAP-006

PASOS:
1. Crear/usar hook useUserStatistics(userId) con React Query
2. Hook llama GET /users/${userId}/statistics
3. Modificar ProfilePage para usar datos del hook
4. Reemplazar stats hardcoded con datos reales
5. Añadir loading state (Loader2)
6. Añadir error handling con mensaje user-friendly

CRITERIOS DE ACEPTACIÓN:
- ✅ ProfilePage consume endpoint real
- ✅ Stats coinciden con gamification_system.user_stats
- ✅ Loading state visible
- ✅ Error handling correcto

REFERENCIAS:
- orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/02-FRONTEND-IMPLEMENTATION.md
- apps/frontend/src/apps/student/pages/ProfilePage.tsx
```

---

### GAP-007: Settings - Implementar Persistencia Real

**ID:** STUDENT-GAP-007
**Severidad:** 🔴 CRÍTICA
**Prioridad:** P0
**Estimación:** 4-6 horas
**Agente Responsable:** Frontend-Developer
**Método:** ✅ ORQUESTAR (Tool: Task)

---

#### ESPECIFICACIÓN TÉCNICA

**Objetivo:**
Reemplazar guardado mock en SettingsPage con llamadas reales a endpoints backend de perfil y preferencias.

**Archivos a Crear/Modificar:**
- `apps/frontend/src/services/api/profileAPI.ts` (crear)
- `apps/frontend/src/apps/student/pages/SettingsPage.tsx` (modificar líneas 94-102)

**Contexto Actual:**
```typescript
// SettingsPage.tsx - líneas 94-102
const handleSave = async () => {
  setSaveStatus('saving');

  // ⚠️ Simulate API call - NO HAY LLAMADA REAL
  await new Promise(resolve => setTimeout(resolve, 1000));

  setSaveStatus('saved');
  setTimeout(() => setSaveStatus('idle'), 2000);
};
```

**Implementación Requerida:**

**1. Crear profileAPI.ts:**
```typescript
// apps/frontend/src/services/api/profileAPI.ts
import { apiClient } from './apiClient';

export interface UpdateProfileDto {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  grade_level?: string;
}

export interface UpdatePreferencesDto {
  theme?: string;
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    in_app?: boolean;
  };
}

export interface UpdatePasswordDto {
  current_password: string;
  new_password: string;
}

export const profileAPI = {
  /**
   * Actualizar información de perfil
   */
  updateProfile: async (userId: string, data: UpdateProfileDto) => {
    const response = await apiClient.put(`/users/${userId}/profile`, data);
    return response.data;
  },

  /**
   * Actualizar preferencias de usuario
   */
  updatePreferences: async (userId: string, preferences: UpdatePreferencesDto) => {
    const response = await apiClient.put(`/users/${userId}/preferences`, { preferences });
    return response.data;
  },

  /**
   * Subir avatar de usuario
   */
  uploadAvatar: async (userId: string, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.post(`/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Cambiar contraseña
   */
  updatePassword: async (userId: string, passwords: UpdatePasswordDto) => {
    const response = await apiClient.put(`/users/${userId}/password`, passwords);
    return response.data;
  },

  /**
   * Obtener preferencias actuales
   */
  getPreferences: async (userId: string) => {
    const response = await apiClient.get(`/users/${userId}/preferences`);
    return response.data;
  },
};
```

**2. Modificar SettingsPage.tsx:**
```typescript
// SettingsPage.tsx
import { profileAPI } from '@/services/api/profileAPI';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    display_name: user?.display_name || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    bio: user?.bio || '',
    grade_level: user?.grade_level || '',
  });

  const [preferences, setPreferences] = useState({
    theme: 'detective',
    language: 'es',
    notifications: {
      email: true,
      push: true,
      in_app: true,
    },
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // ✅ REEMPLAZAR handleSave con implementación real
  const handleSave = async () => {
    setSaveStatus('saving');

    try {
      // 1. Guardar perfil
      await profileAPI.updateProfile(user!.id, profile);

      // 2. Guardar preferencias
      await profileAPI.updatePreferences(user!.id, preferences);

      setSaveStatus('saved');
      toast.success('Configuración guardada correctamente');

      // Reset a idle después de 2 segundos
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      toast.error(error.response?.data?.message || 'Error al guardar configuración');

      // Reset a idle después de 3 segundos
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // ✅ AGREGAR: Manejo de avatar
  const handleAvatarChange = async (file: File) => {
    try {
      const result = await profileAPI.uploadAvatar(user!.id, file);
      toast.success('Avatar actualizado correctamente');
      // Actualizar preview de avatar
      setProfile({ ...profile, avatar_url: result.avatar_url });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al subir avatar');
    }
  };

  // ✅ AGREGAR: Cambio de contraseña
  const handlePasswordChange = async (passwords: { current: string; new: string }) => {
    try {
      await profileAPI.updatePassword(user!.id, {
        current_password: passwords.current,
        new_password: passwords.new,
      });
      toast.success('Contraseña actualizada correctamente');
      // Limpiar formulario
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={profile.display_name}
            onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            placeholder="Nombre a mostrar"
          />
          {/* Resto de campos */}
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Preferencias</h3>
        {/* Controles de preferencias */}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saveStatus === 'saving'}
        className={`px-6 py-2 rounded-lg ${
          saveStatus === 'saving' ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        {saveStatus === 'saving' ? 'Guardando...' : 'Guardar Configuración'}
      </button>
    </div>
  );
}
```

**Criterios de Aceptación:**
- [ ] Guardar configuraciones persiste en `auth_management.profiles`
- [ ] Recargar página muestra configuraciones guardadas
- [ ] Upload de avatar actualiza `avatar_url` en profiles
- [ ] Cambio de contraseña funciona correctamente
- [ ] Error handling correcto con toasts
- [ ] Loading states en botones
- [ ] Validación de campos antes de enviar

**Validación:**
1. Login como student
2. Editar nombre, bio, preferencias
3. Click "Guardar Configuración"
4. Verificar toast de éxito
5. Recargar página
6. Verificar que cambios persisten
7. Verificar en DB: `SELECT * FROM auth_management.profiles WHERE user_id='...'`

**Prompt para Orquestar (Tool: Task):**
```markdown
Lee el archivo orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Implementar persistencia real en SettingsPage (reemplazar mock)

CONTEXTO:
Gap STUDENT-GAP-007 identificado por Architecture-Analyst.
Archivo: apps/frontend/src/apps/student/pages/SettingsPage.tsx líneas 94-102
handleSave() actual simula guardado con setTimeout, NO persiste cambios

ESPECIFICACIÓN:
Ver especificación completa en:
orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/08-PLAN-CORRECCIONES.md
Sección: GAP-007

PASOS:
1. Crear profileAPI.ts con métodos:
   - updateProfile(userId, data)
   - updatePreferences(userId, preferences)
   - uploadAvatar(userId, file)
   - updatePassword(userId, passwords)
2. Modificar SettingsPage handleSave() para llamar APIs reales
3. Añadir error handling con toasts
4. Añadir loading states en botones
5. Implementar handleAvatarChange()
6. Implementar handlePasswordChange()

CRITERIOS DE ACEPTACIÓN:
- ✅ Guardar configuraciones persiste en DB
- ✅ Recargar página muestra cambios guardados
- ✅ Upload avatar actualiza avatar_url
- ✅ Cambio contraseña funciona
- ✅ Toasts de éxito/error
- ✅ Loading states correctos

REFERENCIAS:
- orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/02-FRONTEND-IMPLEMENTATION.md
- apps/frontend/src/apps/student/pages/SettingsPage.tsx
- apps/backend/src/modules/auth/controllers/users.controller.ts (endpoints existen)
```

---

## ⚠️ PRÓXIMO SPRINT (P1 - IMPORTANTE)

### GAP-003: Ejercicios - Remover Workaround FE-049

**ID:** STUDENT-GAP-003
**Severidad:** ⚠️ MEDIA
**Prioridad:** P1
**Estimación:** 4-6 horas
**Agentes Responsables:** Frontend-Developer + Backend-Developer
**Método:** ✅ ORQUESTAR (2 Tasks en paralelo)

---

#### ESPECIFICACIÓN TÉCNICA

**Objetivo:**
Remover workaround temporal que acepta 2 formatos de request en endpoint de envío de ejercicios. Estandarizar en formato único.

**Archivos a Modificar:**
- Frontend: `apps/frontend/src/apps/student/pages/ExercisePage.tsx` (líneas 329-412)
- Backend: `apps/backend/src/modules/educational/controllers/exercises.controller.ts` (líneas 787-824)

**Pasos:**

**PARTE 1 - Backend (Backend-Developer):**

1. **Remover soporte para formato antiguo:**
```typescript
// exercises.controller.ts - líneas 787-824
@Post(':id/submit')
async submitExercise(
  @Param('id') exerciseId: string,
  @Body() submitDto: SubmitExerciseDto,  // ← ÚNICO FORMATO
) {
  // Remover lógica de compatibilidad con formato antiguo
  // Solo aceptar formato nuevo:
  // { answers, startedAt, hintsUsed, powerupsUsed }

  return this.exerciseSubmissionService.submitExercise({
    exerciseId,
    userId: req.user.id,
    answers: submitDto.answers,
    startedAt: submitDto.startedAt,
    hintsUsed: submitDto.hintsUsed || 0,
    powerupsUsed: submitDto.powerupsUsed || [],
  });
}
```

**PARTE 2 - Frontend (Frontend-Developer):**

2. **Validar que todo usa formato nuevo:**
```typescript
// ExercisePage.tsx - verificar líneas 329-412
const handleSubmit = async () => {
  // ✅ Asegurar que SIEMPRE usa formato nuevo
  const result = await submitExercise(exerciseId, {
    answers: userAnswers,          // ✅ Formato nuevo
    startedAt: startTime.getTime(),  // ✅ Formato nuevo
    hintsUsed: progress.hintsUsed || 0,  // ✅ Formato nuevo
    powerupsUsed: progress.powerupsUsed || [],  // ✅ Formato nuevo
  });
};
```

**3. Actualizar tests e2e:**
```typescript
// tests/e2e/exercises.e2e-spec.ts
describe('POST /exercises/:id/submit', () => {
  it('should accept new format only', async () => {
    const response = await request(app.getHttpServer())
      .post(`/api/v1/educational/exercises/${exerciseId}/submit`)
      .send({
        answers: { /* ... */ },
        startedAt: Date.now(),
        hintsUsed: 2,
        powerupsUsed: ['pistas'],
      })
      .expect(200);

    expect(response.body).toHaveProperty('score');
  });

  it('should reject old format', async () => {
    await request(app.getHttpServer())
      .post(`/api/v1/educational/exercises/${exerciseId}/submit`)
      .send({
        userId: '...',  // ← Formato antiguo
        submitted_answers: { /* ... */ },
      })
      .expect(400);  // Bad Request
  });
});
```

**Criterios de Aceptación:**
- [ ] Backend solo acepta formato nuevo
- [ ] Frontend usa formato nuevo en todos los componentes
- [ ] Tests e2e pasan con formato nuevo
- [ ] Tests e2e fallan con formato antiguo (400 Bad Request)
- [ ] No hay errores en producción post-deploy

**Validación:**
1. Ejecutar tests e2e
2. Deploy coordinado frontend + backend (staging primero)
3. Smoke test en staging: completar ejercicio end-to-end
4. Verificar logs de errores (no debe haber 400/500)
5. Deploy a producción

**Prompts para Orquestar (2 Tasks en paralelo):**

**Task 1 - Backend:**
```markdown
Lee el archivo orchestration/prompts/PROMPT-BACKEND-AGENT.md y actúa como Backend-Agent.

TAREA: Remover workaround FE-049 en ExercisesController

CONTEXTO:
Gap STUDENT-GAP-003 - Deuda técnica
Archivo: apps/backend/src/modules/educational/controllers/exercises.controller.ts líneas 787-824

PASOS:
1. Remover soporte para formato antiguo { userId, submitted_answers }
2. Solo aceptar formato nuevo { answers, startedAt, hintsUsed, powerupsUsed }
3. Simplificar lógica de submitExercise()
4. Actualizar tests e2e

REFERENCIAS:
orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/08-PLAN-CORRECCIONES.md
Sección: GAP-003
```

**Task 2 - Frontend:**
```markdown
Lee el archivo orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Validar que todo usa formato nuevo de envío

CONTEXTO:
Gap STUDENT-GAP-003 - Coordinado con backend
Archivo: apps/frontend/src/apps/student/pages/ExercisePage.tsx líneas 329-412

PASOS:
1. Grep buscar usos de submitExercise()
2. Validar que TODOS usan formato { answers, startedAt, hintsUsed, powerupsUsed }
3. Remover cualquier código legacy
4. Verificar tests pasan

REFERENCIAS:
orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/08-PLAN-CORRECCIONES.md
Sección: GAP-003
```

---

### GAP-004: Ejercicios - Deshabilitar Fallback en Producción

**ID:** STUDENT-GAP-004
**Severidad:** ⚠️ BAJA
**Prioridad:** P2
**Estimación:** 30 minutos
**Agente Responsable:** Frontend-Developer
**Método:** ✅ ORQUESTAR (Tool: Task)

---

#### ESPECIFICACIÓN TÉCNICA

**Objetivo:**
Deshabilitar fallback a mock data en ExercisePage cuando NODE_ENV='production'.

**Archivo a Modificar:**
- `apps/frontend/src/apps/student/pages/ExercisePage.tsx` (líneas 233-256)

**Implementación Requerida:**
```typescript
// ExercisePage.tsx - líneas 233-256
const fetchExercise = async () => {
  try {
    setLoading(true);

    // ✅ Fetch exercise from API
    const exerciseData = await getExercise(exerciseId!);
    // ... mapeo de datos

    setExercise(mappedExercise);

  } catch (error) {
    console.error('Error loading exercise:', error);

    // ✅ MODIFICAR: Solo fallback en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ DEV MODE: Falling back to mock data');
      // ... fallback a mock data
    } else {
      // ✅ PRODUCCIÓN: Mostrar error sin fallback
      setError('No se pudo cargar el ejercicio. Por favor, intenta nuevamente.');
      toast.error('Error al cargar ejercicio');
    }
  } finally {
    setLoading(false);
  }
};
```

**Criterios de Aceptación:**
- [ ] En development: fallback a mock funciona
- [ ] En production: NO hay fallback, muestra error claro
- [ ] Toast de error se muestra en producción
- [ ] Logging adecuado del error para debugging

**Prompt para Orquestar:**
```markdown
Lee el archivo orchestration/prompts/PROMPT-FRONTEND-AGENT.md y actúa como Frontend-Agent.

TAREA: Deshabilitar fallback a mock en producción

CONTEXTO:
Gap STUDENT-GAP-004
Archivo: apps/frontend/src/apps/student/pages/ExercisePage.tsx líneas 233-256

PASOS:
1. Añadir check: if (process.env.NODE_ENV === 'development') { fallback }
2. En producción: mostrar error sin fallback
3. Añadir toast de error en producción
4. Logging adecuado

ESTIMACIÓN: 30 minutos

REFERENCIAS:
orchestration/agentes/architecture-analyst/student-portal-analysis-2025-11-24/08-PLAN-CORRECCIONES.md
Sección: GAP-004
```

---

## ℹ️ BACKLOG (P3 - MEJORAS OPCIONALES)

### GAP-002: Actividades - Definir Alcance Conceptual

**ID:** STUDENT-GAP-002
**Severidad:** ℹ️ BAJA
**Prioridad:** P3
**Estimación:** 1 hora (decisión) + implementación si aplica
**Responsable:** Product Owner + Architecture-Analyst
**Método:** ❌ DELEGAR (requiere decisión stakeholders)

---

**Acción Requerida:**
1. Reunión con stakeholders para definir alcance de "Activities"
2. **Opción A:** Activities = Exercises (actualizar documentación)
3. **Opción B:** Activities = Feature separada (implementar en 3 capas)

**Documentación a Actualizar (si Opción A):**
- `docs/architecture/domain-model.md`
- `README.md`
- Glossario de términos

**No requiere orquestación inmediata** - Pendiente de decisión

---

### GAP-005: Rangos - Centralizar Multiplicador en Backend

**ID:** STUDENT-GAP-005
**Severidad:** ℹ️ BAJA
**Prioridad:** P3
**Estimación:** 2-3 horas
**Agente Responsable:** Backend-Developer
**Método:** ✅ ORQUESTAR (opcional, cuando haya tiempo)

---

**Objetivo OPCIONAL:**
Mover cálculo de multiplicador de rango de frontend a backend para centralizar lógica de negocio.

**Implementación (si se decide hacer):**
1. Backend calcular multiplier en RanksService.getUserRankProgress()
2. Incluir multiplier en response
3. Frontend usar multiplier de API en lugar de calcular localmente

**No es bloqueante** - Puede quedarse en backlog indefinidamente

---

## 📊 RESUMEN Y PLAN DE EJECUCIÓN

### Prioridades y Secuencia

**SPRINT ACTUAL (Semana 1):**
| Orden | Gap | Agente | Método | Horas |
|-------|-----|--------|--------|-------|
| 1 | GAP-001 | Backend-Developer | ORQUESTAR | 1-2h |
| 2 | GAP-006 | Frontend-Developer | ORQUESTAR | 1-2h |
| 3 | GAP-007 | Frontend-Developer | ORQUESTAR | 4-6h |
| **TOTAL** | - | - | - | **6-10h** |

**PRÓXIMO SPRINT (Semana 2):**
| Orden | Gap | Agente | Método | Horas |
|-------|-----|--------|--------|-------|
| 4 | GAP-003 | Frontend + Backend | ORQUESTAR (2 paralelo) | 4-6h |
| 5 | GAP-004 | Frontend-Developer | ORQUESTAR | 0.5h |
| **TOTAL** | - | - | - | **4.5-6.5h** |

**BACKLOG:**
| Orden | Gap | Responsable | Método | Horas |
|-------|-----|-------------|--------|-------|
| 6 | GAP-002 | PO + Architecture-Analyst | DELEGAR | 1h decisión |
| 7 | GAP-005 | Backend-Developer | ORQUESTAR (opcional) | 2-3h |

**TOTAL CORRECCIONES:** 10.5-16.5 horas

---

## ✅ ESTADO POST-CORRECCIONES

Después de resolver gaps P0 y P1:

| Feature | Frontend | Backend | Database | Estado |
|---------|----------|---------|----------|--------|
| Ejercicios | ✅ 100% | ✅ 100% | ✅ 100% | ✅ EXCELENTE |
| Progreso & Rangos | ✅ 100% | ✅ 100% | ✅ 100% | ✅ EXCELENTE |
| Achievements | ✅ 100% | ✅ 100% | ✅ 100% | ✅ EXCELENTE |
| Misiones | ✅ 100% | ✅ 100% | ✅ 100% | ✅ EXCELENTE |
| Perfil & Settings | ✅ 100% | ✅ 100% | ✅ 100% | ✅ EXCELENTE |

**Calidad de Integración:** 95% → **EXCELENTE**
**Estado de Producción:** 🟢 **PRODUCTION-READY**

---

**Plan creado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Estado:** Listo para orquestar/delegar
**Próxima Acción:** Orquestar gaps P0 (GAP-001, GAP-006, GAP-007)
