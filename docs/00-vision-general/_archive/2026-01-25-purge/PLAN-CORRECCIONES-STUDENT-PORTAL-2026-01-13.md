# PLAN DE CORRECCIONES - Student Portal Gamilit

**Fecha:** 2026-01-13
**Version:** 1.0.0
**Referencia:** ANALISIS-REGRESIONES-STUDENT-PORTAL-2026-01-13.md
**Estado:** Pendiente de Validacion

---

## RESUMEN DEL PLAN

Este documento detalla las correcciones necesarias para resolver las regresiones identificadas en el Student Portal de Gamilit.

| Correccion | Archivo | Linea | Prioridad | Impacto |
|------------|---------|-------|-----------|---------|
| CORR-001 | socialAPI.ts | 390-392 | ALTA | Leaderboard |
| CORR-002 | ModuleDetailPage.tsx | 183-191 | MEDIA | Module Detail |
| CORR-003 | Verificar BD | N/A | ALTA | Achievements |
| CORR-004 | gamification.api.ts | 75-93 | MEDIA | Achievements |

---

## CORRECCION 001: Leaderboard - Mock Data No Retornado

### Descripcion
La funcion `getLeaderboard` retorna un array vacio cuando `USE_MOCK_DATA=true` en lugar de retornar datos mock reales.

### Archivo
`/apps/frontend/src/features/gamification/social/api/socialAPI.ts`

### Lineas Afectadas
390-392

### Codigo Actual
```typescript
if (FEATURE_FLAGS.USE_MOCK_DATA) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [];  // PROBLEMA: Retorna array vacio
}
```

### Codigo Propuesto
```typescript
if (FEATURE_FLAGS.USE_MOCK_DATA) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  // Importar y usar datos mock reales
  const { getLeaderboardByType } = await import('../mockData/leaderboardsMockData');
  const leaderboardData = getLeaderboardByType(type);
  return leaderboardData.entries;
}
```

### Dependencias a Verificar
- `/apps/frontend/src/features/gamification/social/mockData/leaderboardsMockData.ts`
- Funcion `getLeaderboardByType(type)` debe existir y retornar `LeaderboardData`
- Tipo `LeaderboardData.entries` debe ser compatible con `LeaderboardEntry[]`

### Validacion
- [ ] Importacion dinamica funciona correctamente
- [ ] Tipos son compatibles
- [ ] Leaderboard muestra nombres reales (Ana Garcia, Carlos Rodriguez, etc.)
- [ ] Usuario actual ("Tu") aparece en la posicion correcta

---

## CORRECCION 002: Module Detail - Validacion de Parametros

### Descripcion
La pagina no valida si `moduleId` es undefined o invalido antes de usarlo.

### Archivo
`/apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx`

### Lineas Afectadas
182-191

### Codigo Actual
```typescript
export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Fetch module, exercises, and progress from API
  const { module, exercises, progress, loading, error } = useModuleDetail(moduleId || '', user?.id);
```

### Codigo Propuesto
```typescript
export default function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Validacion temprana de moduleId
  if (!moduleId || moduleId === 'undefined' || moduleId.trim() === '') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Modulo No Encontrado</h1>
          <p className="text-gray-600 mb-4">El ID del modulo no es valido o no fue proporcionado.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Fetch module, exercises, and progress from API
  const { module, exercises, progress, loading, error } = useModuleDetail(moduleId, user?.id);
```

### Dependencias a Verificar
- Importar `AlertCircle` de `lucide-react` (ya importado en el archivo)
- Ruta de navegacion `/dashboard` debe existir

### Validacion
- [ ] Navegar a `/modules/` sin ID muestra mensaje de error
- [ ] Navegar a `/modules/undefined` muestra mensaje de error
- [ ] Navegar a `/modules/abc123` (ID valido) funciona correctamente

---

## CORRECCION 003: Achievements - Verificar Datos en BD

### Descripcion
Verificar que existan achievements activos en la base de datos.

### Tipo
Verificacion/Seed de datos

### Queries de Verificacion
```sql
-- 1. Verificar achievements activos
SELECT COUNT(*) as total_achievements
FROM gamification_system.achievements
WHERE is_active = true;

-- 2. Verificar achievements secretos
SELECT COUNT(*) as secret_achievements
FROM gamification_system.achievements
WHERE is_active = true AND is_secret = true;

-- 3. Verificar user_achievements
SELECT COUNT(*) as user_achievements
FROM gamification_system.user_achievements;

-- 4. Ver todos los achievements
SELECT id, name, category, is_active, is_secret
FROM gamification_system.achievements
ORDER BY name;
```

### Si No Hay Datos - Seed Script Propuesto
```sql
-- Insertar achievements basicos de ejemplo
INSERT INTO gamification_system.achievements
(id, name, description, category, icon, is_active, is_secret, rarity, xp_reward, ml_coins_reward, order_index)
VALUES
-- Achievements de progreso
(gen_random_uuid(), 'Primer Paso', 'Completa tu primer ejercicio', 'progress', 'footprints', true, false, 'common', 50, 10, 1),
(gen_random_uuid(), 'Estudiante Dedicado', 'Completa 10 ejercicios', 'progress', 'book-open', true, false, 'uncommon', 100, 25, 2),
(gen_random_uuid(), 'Maestro del Conocimiento', 'Completa 50 ejercicios', 'progress', 'graduation-cap', true, false, 'rare', 250, 50, 3),

-- Achievements de racha
(gen_random_uuid(), 'Constancia', 'Mantiene una racha de 3 dias', 'streak', 'flame', true, false, 'common', 75, 15, 4),
(gen_random_uuid(), 'Imparable', 'Mantiene una racha de 7 dias', 'streak', 'fire', true, false, 'rare', 200, 40, 5),
(gen_random_uuid(), 'Leyenda', 'Mantiene una racha de 30 dias', 'streak', 'crown', true, false, 'legendary', 500, 100, 6),

-- Achievements de perfeccion
(gen_random_uuid(), 'Perfeccionista', 'Obtiene 100% en un ejercicio', 'perfection', 'star', true, false, 'uncommon', 100, 20, 7),
(gen_random_uuid(), 'Sin Errores', 'Completa 5 ejercicios perfectos seguidos', 'perfection', 'target', true, false, 'rare', 250, 50, 8),

-- Achievement secreto
(gen_random_uuid(), 'Explorador Nocturno', 'Completa un ejercicio despues de las 10pm', 'hidden', 'moon', true, true, 'epic', 150, 30, 99);
```

### Validacion
- [ ] Query de verificacion retorna al menos 5 achievements activos
- [ ] Al menos 1 achievement no es secreto (is_secret = false)
- [ ] Los achievements tienen name, description, category poblados

---

## CORRECCION 004: Achievements - Mejora de Manejo de Errores

### Descripcion
Agregar validaciones y logs para diagnosticar problemas en la carga de achievements.

### Archivo
`/apps/frontend/src/lib/api/gamification.api.ts`

### Mejoras Propuestas

#### 4.1 Validacion en getAllAchievements
Buscar la funcion `getAllAchievements` y agregar validaciones:

```typescript
getAllAchievements: async (): Promise<Achievement[]> => {
  try {
    console.log('[gamificationApi.getAllAchievements] Starting request...');
    const { data } = await apiClient.get<ApiAchievementResponse[]>('/gamification/achievements');

    console.log('[gamificationApi.getAllAchievements] Raw response:', {
      type: typeof data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : 'N/A',
      sample: Array.isArray(data) && data.length > 0 ? data[0] : null
    });

    if (!data) {
      console.warn('[gamificationApi.getAllAchievements] Response is null/undefined');
      return [];
    }

    if (!Array.isArray(data)) {
      console.warn('[gamificationApi.getAllAchievements] Response is not array:', data);
      // Intentar extraer de wrapper comun
      const possibleArray = (data as any).achievements || (data as any).data?.achievements || (data as any).data;
      if (Array.isArray(possibleArray)) {
        console.log('[gamificationApi.getAllAchievements] Extracted array from wrapper');
        return transformAchievements(possibleArray);
      }
      return [];
    }

    return transformAchievements(data);
  } catch (error) {
    console.error('[gamificationApi.getAllAchievements] Error:', error);
    throw error;
  }
},
```

### Dependencias
- Funcion `transformAchievements` debe existir en el archivo
- Tipo `ApiAchievementResponse` debe estar definido

### Validacion
- [ ] Console del navegador muestra logs de debug
- [ ] Errores se muestran claramente en consola
- [ ] Si no hay datos, se muestra mensaje amigable al usuario

---

## ORDEN DE EJECUCION

### Prioridad 1: Verificaciones (No requiere codigo)
1. **CORR-003**: Verificar datos en BD con queries SQL
2. Si BD esta vacia, ejecutar seed script

### Prioridad 2: Correcciones de Codigo (Menor riesgo)
3. **CORR-002**: Validacion de moduleId en ModuleDetailPage
4. **CORR-004**: Mejora de logs en gamification.api.ts

### Prioridad 3: Correcciones de Logica (Mayor impacto)
5. **CORR-001**: Corregir retorno de mock data en socialAPI.ts

---

## VALIDACIONES POST-IMPLEMENTACION

### Checklist Frontend
- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run typecheck` pasa sin errores

### Checklist Funcional
- [ ] Leaderboard muestra usuarios con nombres reales
- [ ] Achievements muestra al menos algunos logros
- [ ] Module Detail no marca error al acceder
- [ ] Module Detail muestra mensaje amigable si ID invalido

### Checklist Browser DevTools
- [ ] No hay errores en console
- [ ] Network tab muestra respuestas 200 OK de APIs
- [ ] No hay warnings de tipos en console

---

## ARCHIVOS A MODIFICAR (RESUMEN)

| Archivo | Tipo de Cambio | Lineas |
|---------|----------------|--------|
| `socialAPI.ts` | Modificar logica mock | 390-392 |
| `ModuleDetailPage.tsx` | Agregar validacion | 182-191 |
| `gamification.api.ts` | Agregar logs/validaciones | Varias |
| Base de datos | Seed data | N/A |

---

## ROLLBACK

Si las correcciones causan problemas adicionales:

### CORR-001 Rollback
```typescript
// Revertir a:
if (FEATURE_FLAGS.USE_MOCK_DATA) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return [];
}
```

### CORR-002 Rollback
Eliminar el bloque de validacion y volver al codigo original.

---

**Generado por:** Sistema SIMCO + CAPVED
**Fase:** PLANEACION (P)
**Siguiente Fase:** VALIDACION (V) - Verificar plan contra analisis
