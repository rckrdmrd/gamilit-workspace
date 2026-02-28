---
title: Portal Student - Calidad, Testing y Referencias
status: activo
last_updated: "2026-02-28"
---

# Portal Student - Calidad, Testing y Referencias

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Anterior: [04-FEATURES.md](./04-FEATURES.md)

---

## 11. Buenas Prácticas

### 11.1 Frontend

#### 11.1.1 React Query

```typescript
// DO: Query keys descriptivas y jerárquicas
queryKey: ['dashboard', userId, 'coins']
queryKey: ['modules', moduleId, 'exercises']

// DO: Usar staleTime para reducir re-fetches
staleTime: 5 * 60 * 1000, // 5 min

// DO: Invalidar queries relacionadas después de mutations
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['gamification', 'coins'] });
}

// DON'T: Queries sin enabled cuando dependen de parámetros
enabled: !!userId, // SIEMPRE verificar
```

#### 11.1.2 State Management

```typescript
// DO: Zustand para global state, React Query para server state
// Global UI state → Zustand
// Server data → React Query

// DO: Hooks para lógica reutilizable
export function useDashboardData() { ... }

// DON'T: Props drilling más de 2 niveles
// Usar context o store
```

#### 11.1.3 Performance

```typescript
// DO: Lazy load de mecánicas
const DynamicMechanic = React.lazy(() =>
  import(`@/features/mechanics/${mechanicType}`)
);

// DO: Memoizar cálculos pesados
const expNeeded = useMemo(() =>
  calculateNextRankXP(currentRank),
  [currentRank]
);

// DO: Debounce en búsquedas
const debouncedSearch = useDebounce(searchQuery, 300);
```

### 11.2 Backend

#### 11.2.1 Controllers

```typescript
// DO: DTOs con validación completa
@Post('submit')
@ApiOperation({ summary: 'Submit exercise completion' })
@ApiOkResponse({ type: SubmissionResultDto })
async submitExercise(
  @CurrentUser() user: User,
  @Param('exerciseId') exerciseId: string,
  @Body() dto: SubmitExerciseDto,
): Promise<SubmissionResultDto> {
  return this.submissionService.submitExercise(user.id, exerciseId, dto);
}
```

#### 11.2.2 Services

```typescript
// DO: Transactions para operaciones atómicas
async submitExercise(userId: string, dto: SubmitExerciseDto) {
  return this.dataSource.transaction(async (manager) => {
    // 1. Crear submission
    const submission = await manager.save(ExerciseSubmission, {...});

    // 2. Actualizar progreso
    await manager.update(ModuleProgress, {...});

    // 3. Otorgar XP y ML Coins
    await this.grantRewards(userId, submission, manager);

    // 4. Check achievements
    await this.checkAchievements(userId, submission, manager);

    return submission;
  });
}
```

#### 11.2.3 Optimización

```typescript
// DO: Eager loading para evitar N+1 queries
const exercises = await this.exercisesRepo.find({
  where: { module_id: moduleId },
  relations: ['module', 'submissions'],
});

// DO: Cache para datos que cambian poco
@Cacheable('ranks', 3600) // 1 hora
async getRanks(): Promise<Rank[]> {
  return this.ranksRepo.find();
}
```

---

## 12. Testing

### 12.1 Tests Unitarios Frontend

```typescript
// useDashboardData.test.ts
describe('useDashboardData', () => {
  it('should fetch dashboard data successfully', async () => {
    const { result } = renderHook(() => useDashboardData(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rank).toBeDefined();
    expect(result.current.coins).toBeDefined();
  });
});
```

### 12.2 Tests de Integración

```typescript
// ExerciseSubmission.integration.test.ts
describe('Exercise Submission Flow', () => {
  it('should complete exercise and grant rewards', async () => {
    const user = await createTestUser();
    const exercise = await createTestExercise();

    const response = await request(app.getHttpServer())
      .post(`/progress/exercises/${exercise.id}/submit`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        answers: { q1: 'correct' },
        timeSpent: 120,
        hintsUsed: 0,
      })
      .expect(201);

    expect(response.body.xpEarned).toBeGreaterThan(0);
    expect(response.body.mlCoinsEarned).toBeGreaterThan(0);
  });
});
```

---

## 13. Checklist de Desarrollo

### 13.1 Nueva Funcionalidad

- [ ] Definir types en `student/types/` o `@shared/types`
- [ ] Crear/actualizar DTOs en backend
- [ ] Implementar service en backend
- [ ] Crear/modificar controller con guards
- [ ] Agregar validaciones (class-validator)
- [ ] Crear API service en frontend
- [ ] Implementar custom hook si necesario
- [ ] Crear componentes UI necesarios
- [ ] Integrar en página correspondiente
- [ ] Agregar tests unitarios
- [ ] Probar responsive (mobile, tablet, desktop)
- [ ] Documentar en Swagger (decoradores)
- [ ] Actualizar esta guía si aplica

### 13.2 Code Review

- [ ] Types alineados frontend/backend
- [ ] Guards aplicados correctamente (JwtAuth mínimo)
- [ ] Validación de DTOs completa
- [ ] Error handling implementado
- [ ] React Query keys descriptivas
- [ ] Invalidación de cache correcta después de mutations
- [ ] Loading y error states manejados
- [ ] Responsive design verificado
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Performance optimizado (memo, lazy load)

---

## 14. Troubleshooting

### 14.1 Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| 401 Unauthorized | Token JWT expirado/inválido | Renovar token con refresh endpoint |
| Data desactualizada | Cache no invalidado | `queryClient.invalidateQueries()` |
| Types mismatch | Desync FE/BE | Regenerar types desde DTOs backend |
| Exercise no se guarda | Auto-save disabled | Verificar `enabled` en `useExerciseAutoSave` |
| XP no se actualiza | Estado local no sincroniza | Llamar `refresh()` de `useDashboardData` |
| Achievements no se desbloquean | Condiciones no se cumplen | Verificar lógica en backend service |
| Power-up no aplica | Item no en inventory | Verificar inventario antes de usar |

### 14.2 Debugging

```typescript
// Habilitar logs de React Query en dev
if (import.meta.env.DEV) {
  import('@tanstack/react-query-devtools').then(({ ReactQueryDevtools }) => {
    // Montar devtools
  });
}

// Log de API calls
apiClient.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Log de state changes (Zustand)
devtools(storeImpl, { name: 'RanksStore' })
```

---

## 15. Performance y Optimización

### 15.1 Frontend Optimization

**Lazy Loading de Rutas:**

```typescript
const DashboardComplete = lazy(() => import('./pages/DashboardComplete'));
const ExercisePage = lazy(() => import('./pages/ExercisePage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));

<Suspense fallback={<PageLoader />}>
  <Routes>
    <Route path="/" element={<DashboardComplete />} />
    <Route path="/exercises/:id" element={<ExercisePage />} />
    <Route path="/gamification" element={<GamificationPage />} />
  </Routes>
</Suspense>
```

**Code Splitting:**

```typescript
// Dynamic imports for mechanics
const loadMechanic = (type: string) => {
  return import(`@/features/mechanics/${type}/${type}Exercise`);
};
```

**Image Optimization:**

- Usar WebP para imágenes modernas
- Lazy load de imágenes con `loading="lazy"`
- Sprites para iconos pequeños

### 15.2 Backend Optimization

**Database Indexing:**

```sql
-- Indices críticos
CREATE INDEX idx_exercise_submissions_user ON progress.exercise_submissions(user_id);
CREATE INDEX idx_user_stats_total_xp ON gamification_system.user_stats(total_xp DESC);
CREATE INDEX idx_achievements_trigger ON gamification_system.achievements(trigger);
```

**Query Optimization:**

```typescript
// Usar select específico en vez de SELECT *
const stats = await this.userStatsRepo.findOne({
  where: { user_id: userId },
  select: ['total_xp', 'total_ml_coins', 'current_streak'],
});
```

**Caching:**

- Redis para leaderboards (TTL 5 min)
- Cache de ranks/achievements (TTL 1 hora)
- Invalidación al actualizar datos

---

## 16. Seguridad

### 16.1 Autenticación y Autorización

**Guards:**

- **JwtAuthGuard:** TODOS los endpoints (excepto public)
- **RolesGuard:** Si endpoint específico para rol

**Validación de Ownership:**

```typescript
// Verificar que submission pertenece al usuario
const submission = await this.submissionRepo.findOne({
  where: {
    id: submissionId,
    user_id: userId // CRÍTICO
  }
});

if (!submission) {
  throw new ForbiddenException('Not your submission');
}
```

### 16.2 Validación de Datos

```typescript
// DTOs con class-validator
export class SubmitExerciseDto {
  @IsObject()
  @ValidateNested()
  answers!: Record<string, any>;

  @IsNumber()
  @Min(0)
  @Max(7200) // Max 2 horas
  timeSpent!: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  hintsUsed!: number;
}
```

### 16.3 Rate Limiting

```typescript
// Exercise submission: max 100/día por usuario
@ThrottlerGuard({ limit: 100, ttl: 86400 })
@Post('submit')
async submitExercise(...) { ... }
```

---

## 17. Referencias

### Documentos Complementarios del Portal Student

| Documento | Descripción |
|-----------|-------------|
| [SPEC-EXERCISES.md](./specs/SPEC-EXERCISES.md) | Referencia de ejercicios y mecánicas implementadas |
| [SPEC-GAMIFICATION.md](./specs/SPEC-GAMIFICATION.md) | Sistema de gamificación en profundidad |
| [SPEC-API-CONTRACTS.md](./specs/SPEC-API-CONTRACTS.md) | Referencia de contratos API del portal |
| [../../30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md](../../30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md) | Flujo end-to-end de ejercicio auto-grade |
| [../../30-ux-ui/flujos/student/FLUJO-EJERCICIO-M3-M5.md](../../30-ux-ui/flujos/student/FLUJO-EJERCICIO-M3-M5.md) | Flujo de ejercicio con revision manual |
| [../../30-ux-ui/flujos/student/FLUJO-TIENDA-COMPRA.md](../../30-ux-ui/flujos/student/FLUJO-TIENDA-COMPRA.md) | Flujo de compra y asignacion en tienda |
| [../../30-ux-ui/flujos/student/FLUJO-LOGROS-MISIONES-CLAIM.md](../../30-ux-ui/flujos/student/FLUJO-LOGROS-MISIONES-CLAIM.md) | Flujo de reclamo de recompensas |

### Guías Generales

- [COMPONENT-PATTERNS.md](../../50-guides/frontend/impl/COMPONENT-PATTERNS.md) - Patrones de componentes
- [HOOK-PATTERNS.md](../../50-guides/frontend/impl/HOOK-PATTERNS.md) - Patrones de hooks
- [ADR-013-react-query-adoption.md](../../90-adr/ADR-013-react-query-adoption.md) - Uso de React Query
- [README frontend impl](../../50-guides/frontend/impl/README.md) - Convenciones generales frontend
- [TYPES-CONVENTIONS.md](../../50-guides/frontend/impl/TYPES-CONVENTIONS.md) - Convenciones de types
- [DTO-CONVENTIONS.md](../../50-guides/backend/impl/DTO-CONVENTIONS.md) - Convenciones de DTOs
- [ESTRUCTURA-MODULOS.md](../../50-guides/backend/impl/ESTRUCTURA-MODULOS.md) - Estructura de módulos
- [40-api/README.md](../../40-api/README.md) - Rutas y contratos API

### Documentación de Arquitectura

- [ADR-001: Gamificacion Maya](../../90-adr/ADR-001-gamificacion-maya.md)
- [ADR-021: Estandarizacion Recompensas XP](../../90-adr/ADR-021-estandarizacion-recompensas-xp-ejercicios.md)
- [ADR-008: Sistema Dual Exercise Mechanics](../../90-adr/ADR-008-sistema-dual-exercise-mechanics.md)

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.2.0 | 2026-02-21 | M3-M5 evaluados exclusivamente por maestro: sin auto-scoring, sin IA. Debate Digital = ensayo estructurado, Quiz TikTok = justificaciones escritas, flujo de ejercicio diferenciado M1-M2 (auto-grade) vs M3-M5 (teacher-grade). Removed stale M4 mechanic listings (email_formal, chat_literario, ensayo_argumentativo, resena_critica) |
| 2.1.0 | 2026-02-21 | Mejoras sistema de misiones: exercise_id (FK a ejercicios), auto-start daily/weekly, MissionDetailModal, click-to-detail en MissionCard |
| 1.0.0 | 2025-11-29 | Creación inicial - Documentación completa del Portal Student |
| 2.0.0 | 2026-02-18 | Actualizado post Student Portal Refactoring Fases 0-4: nuevas carpetas de componentes (shop, inventory, module, profile, leaderboard, friends, guilds, learning), hooks actualizados (useProfileData, useAvatarUpdate), estructura de carpetas refleja extractiones Phase 2-4 |

---

**Mantenido por:** Tech Lead - GAMILIT Project
**Última revisión:** 2026-02-21

[<-- Volver al Hub](../PORTAL-STUDENT-GUIDE.md) | Anterior: [04-FEATURES.md](./04-FEATURES.md)
