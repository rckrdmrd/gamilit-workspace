# Plan de Tests Prioritarios - Frontend GAMILIT

**Fecha:** 2025-11-23
**Agente:** Frontend-Developer
**Propósito:** Planificación de tests para mejorar coverage y calidad
**Versión:** 1.0

---

## 📊 ESTADO ACTUAL DE TESTS

### Resumen General

| Métrica | Valor Actual | Objetivo | Gap |
|---------|--------------|----------|-----|
| **Tests Totales** | 779 | N/A | N/A |
| **Tests Pasando** | 595 (76.4%) | 100% | 184 tests |
| **Tests Fallando** | 184 (23.6%) | 0% | 184 tests |
| **Coverage Estimado** | ~60% | >70% | +10% |
| **Archivos con Tests** | 30 | N/A | N/A |
| **Componentes sin Tests** | ~150+ | 0 | 150+ |

### Tests Fallando por Feature

| Feature | Tests Fallando | % Fallando |
|---------|----------------|------------|
| **ranksStore** | 8 | 16.7% |
| **economyStore** | 6 | 11.1% |
| **achievementsStore** | 0 | 0% ✅ |
| **missionsStore** | 0 | 0% ✅ |
| **Otros** | 170 | N/A |

---

## 🎯 PRIORIZACIÓN DE TESTS

### Nivel P0: Crítico (INMEDIATO)

**Objetivo:** Arreglar tests fallando que bloquean CI/CD

#### 1. Arreglar Tests de ranksStore

**Tests Fallando:** 8 de 48

**Fallos Identificados:**
1. `Initial State > should have initial user progress`
   - Expected: currentRank level = 1
   - Received: currentRank level = 5
   - **Causa:** Inicialización incorrecta

2. `Add XP > should add XP to user progress`
   - Expected: 50 XP added
   - Received: 300 XP (inicial + added?)
   - **Causa:** Estado inicial no se resetea entre tests

3. `Add XP > should check for level up`
   - Expected: checkLevelUp() === true
   - Received: false
   - **Causa:** Lógica de level up no funciona correctamente

4. `Add XP > should accumulate multiple XP gains`
   - Expected: 60 XP total
   - Received: 310 XP
   - **Causa:** Estado persistente entre tests

5. `Level Up > should add history entry for level up`
   - Expected: history.length > 0
   - Received: history.length === 0
   - **Causa:** History no se actualiza

6. `Level Up > should update xpToNextLevel after leveling up`
   - Expected: xpToNextLevel > 600
   - Received: xpToNextLevel === 600
   - **Causa:** Cálculo de xpToNextLevel incorrecto

7. `UI States > should reset progress to initial state`
   - Expected: level === 1
   - Received: level === 5
   - **Causa:** Reset no funciona

8. `Fetch User Progress (API) > should fetch and update user progress from API`
   - Expected: multiplier === 1
   - Received: multiplier === 1.25
   - **Causa:** updateMultipliers() se ejecuta automáticamente

**Estimación:** 1-2 días
**Prioridad:** P0 (Crítica)
**Asignado a:** Frontend-Developer

---

#### 2. Arreglar Tests de economyStore

**Tests Fallando:** 6 de 54

**Fallos Identificados:**
1. `Purchase Operations > should purchase single item from cart`
   - Expected: newBalance === 400
   - Received: newBalance === 500
   - **Causa:** spendCoins() no se ejecuta

2. `Purchase Operations > should purchase entire cart`
   - Expected: newBalance === 250
   - Received: newBalance === 500
   - **Causa:** purchaseCart() no deduce balance

3. `Fetch Balance (API) > should set loading state during fetch`
   - Expected: isLoading === true
   - Received: isLoading === false
   - **Causa:** setLoading(true) no se ejecuta antes de fetch

4. `Fetch Balance (API) > should fetch and update balance from API`
   - Expected: economyAPI.getBalance() called
   - Received: not called
   - **Causa:** API mock no funciona

5. `Fetch Balance (API) > should handle API errors`
   - Expected: error === 'Network error'
   - Received: error === 'User not authenticated'
   - **Causa:** Error diferente al esperado

6. `Fetch Balance (API) > should set generic error for non-Error failures`
   - Expected: error === 'Failed to fetch balance'
   - Received: error === 'User not authenticated'
   - **Causa:** Error diferente al esperado

**Estimación:** 1-2 días
**Prioridad:** P0 (Crítica)
**Asignado a:** Frontend-Developer

---

### Nivel P1: Alta (ESTA SPRINT)

**Objetivo:** Agregar tests a componentes críticos sin coverage

#### 3. Tests para ExercisePage.tsx

**Componente:** `apps/frontend/src/apps/student/pages/ExercisePage.tsx`

**Estado Actual:** ❌ Sin tests

**Tests Requeridos:**
- **Setup:**
  - Mock de `getExercise` API
  - Mock de `submitExercise` API
  - Mock de useAuth hook
  - Mock de useUserGamification hook

- **Casos de Prueba:**
  1. ✅ Renderiza loading state inicialmente
  2. ✅ Carga ejercicio correctamente desde API
  3. ✅ Muestra error si ejercicio no existe
  4. ✅ Renderiza UnderConstructionExercise si status === 'backlog'
  5. ✅ Carga mecánica correcta según exercise.type
  6. ✅ Muestra timer si ejercicio es timed
  7. ✅ Muestra hint system si hints disponibles
  8. ✅ Maneja submit de respuesta correcta
  9. ✅ Maneja submit de respuesta incorrecta
  10. ✅ Actualiza progreso después de submit
  11. ✅ Muestra FeedbackModal después de submit
  12. ✅ Navega de vuelta al hacer clic en "Volver"

**Estimación:** 2 días
**Prioridad:** P1 (Alta)
**Coverage Esperado:** ~70%

---

#### 4. Tests para GamifiedHeader.tsx

**Componente:** `apps/frontend/src/shared/components/layout/GamifiedHeader.tsx`

**Estado Actual:** ❌ Sin tests

**Tests Requeridos:**
- **Setup:**
  - Mock de gamificationData
  - Mock de notifications
  - Mock de user

- **Casos de Prueba:**
  1. ✅ Renderiza header con datos de usuario
  2. ✅ Muestra XP y barra de progreso correctamente
  3. ✅ Muestra ML Coins correctamente
  4. ✅ Muestra rank badge correctamente
  5. ✅ Muestra contador de notificaciones no leídas
  6. ✅ Abre/cierra menú de usuario al hacer clic
  7. ✅ Abre/cierra menú de notificaciones al hacer clic
  8. ✅ Cierra menús al hacer clic fuera
  9. ✅ Llama a onLogout al hacer clic en logout
  10. ✅ Muestra fallback si gamificationData es null

**Estimación:** 1 día
**Prioridad:** P1 (Alta)
**Coverage Esperado:** ~80%

---

#### 5. Tests para ShopPage.tsx

**Componente:** `apps/frontend/src/apps/student/pages/ShopPage.tsx`

**Estado Actual:** ❌ Sin tests

**Tests Requeridos:**
- **Setup:**
  - Mock de useCoins hook
  - Mock de getPowerUps API
  - Mock de purchasePowerUp API
  - Mock de useUserGamification

- **Casos de Prueba:**
  1. ✅ Renderiza lista de items de shop
  2. ✅ Filtra items por categoría
  3. ✅ Busca items por nombre
  4. ✅ Muestra balance de ML Coins del usuario
  5. ✅ Abre modal de detalle al hacer clic en item
  6. ✅ Confirma compra en modal
  7. ✅ Deduce ML Coins después de compra
  8. ✅ Muestra error si balance insuficiente
  9. ✅ Actualiza lista después de compra exitosa
  10. ✅ Muestra loading state durante fetch

**Estimación:** 1.5 días
**Prioridad:** P1 (Alta)
**Coverage Esperado:** ~70%

---

#### 6. Tests para MissionsPage.tsx

**Componente:** `apps/frontend/src/apps/student/pages/MissionsPage.tsx`

**Estado Actual:** ❌ Sin tests

**Tests Requeridos:**
- **Setup:**
  - Mock de useMissions hook
  - Mock de useUserGamification
  - Mock de useSearchParams

- **Casos de Prueba:**
  1. ✅ Renderiza hero section con stats
  2. ✅ Renderiza tabs (Daily, Weekly, Special)
  3. ✅ Cambia tab al hacer clic
  4. ✅ Filtra misiones por tab seleccionado
  5. ✅ Muestra mission cards correctamente
  6. ✅ Muestra active mission tracker en sidebar
  7. ✅ Claim recompensa al completar misión
  8. ✅ Muestra confetti después de claim
  9. ✅ Actualiza progreso después de claim
  10. ✅ Actualiza URL params al cambiar tab

**Estimación:** 1.5 días
**Prioridad:** P1 (Alta)
**Coverage Esperado:** ~70%

---

#### 7. Tests para FeedbackModal.tsx

**Componente:** `apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`

**Estado Actual:** ❌ Sin tests

**Tests Requeridos:**
- **Casos de Prueba:**
  1. ✅ No renderiza si isOpen === false
  2. ✅ Renderiza modal si isOpen === true
  3. ✅ Muestra mensaje de éxito si isCorrect === true
  4. ✅ Muestra mensaje de error si isCorrect === false
  5. ✅ Muestra XP ganados
  6. ✅ Muestra ML Coins ganados
  7. ✅ Muestra respuesta correcta
  8. ✅ Muestra explicación si disponible
  9. ✅ Llama a onClose al hacer clic en botón
  10. ✅ Muestra confetti si isCorrect === true

**Estimación:** 1 día
**Prioridad:** P1 (Alta)
**Coverage Esperado:** ~85%

---

### Nivel P2: Media (PRÓXIMA SPRINT)

**Objetivo:** Agregar tests a páginas principales

#### 8. Tests para DashboardComplete.tsx

**Estimación:** 2 días
**Coverage Esperado:** ~65%

#### 9. Tests para ModuleDetailPage.tsx

**Estimación:** 1.5 días
**Coverage Esperado:** ~70%

#### 10. Tests para InventoryPage.tsx

**Estimación:** 1 día
**Coverage Esperado:** ~70%

#### 11. Tests para GuildsPage.tsx

**Estimación:** 1.5 días
**Coverage Esperado:** ~65%

#### 12. Tests para AchievementsPage.tsx

**Estimación:** 1.5 días
**Coverage Esperado:** ~70%

#### 13. Tests para EnhancedProfilePage.tsx

**Estimación:** 1 día
**Coverage Esperado:** ~70%

#### 14. Tests para GamificationPage.tsx

**Estimación:** 1 día
**Coverage Esperado:** ~65%

---

### Nivel P3: Baja (FUTURO)

**Objetivo:** Agregar tests a ejercicios de módulos 1-3

#### 15. Tests para Ejercicios de Módulo 1 (7 ejercicios)

**Estimación:** 3-4 días
**Coverage Esperado:** ~60% por ejercicio

#### 16. Tests para Ejercicios de Módulo 2 (6 ejercicios)

**Estimación:** 3 días
**Coverage Esperado:** ~60% por ejercicio

#### 17. Tests para Ejercicios de Módulo 3 (4 ejercicios)

**Estimación:** 2 días
**Coverage Esperado:** ~60% por ejercicio

#### 18. Tests para Teacher Portal (13 páginas)

**Estimación:** 5-6 días
**Coverage Esperado:** ~50% por página

#### 19. Tests para Admin Portal (11 páginas)

**Estimación:** 4-5 días
**Coverage Esperado:** ~50% por página

---

## 📅 CRONOGRAMA DE IMPLEMENTACIÓN

### Sprint 1 (Esta Sprint) - 7 días

| Día | Tarea | Responsable | Estado |
|-----|-------|-------------|--------|
| 1 | Arreglar tests de ranksStore (P0) | Frontend-Developer | ⏳ Pendiente |
| 2 | Arreglar tests de economyStore (P0) | Frontend-Developer | ⏳ Pendiente |
| 3-4 | Tests para ExercisePage.tsx (P1) | Frontend-Developer | ⏳ Pendiente |
| 5 | Tests para GamifiedHeader.tsx (P1) | Frontend-Developer | ⏳ Pendiente |
| 6 | Tests para ShopPage.tsx (P1) | Frontend-Developer | ⏳ Pendiente |
| 7 | Tests para MissionsPage.tsx (P1) | Frontend-Developer | ⏳ Pendiente |

**Objetivo Sprint 1:** ✅ 100% tests pasando + Coverage de componentes críticos

---

### Sprint 2 (Próxima Sprint) - 10 días

| Día | Tarea | Responsable | Estado |
|-----|-------|-------------|--------|
| 1 | Tests para FeedbackModal.tsx (P1) | Frontend-Developer | ⏳ Pendiente |
| 2-3 | Tests para DashboardComplete.tsx (P2) | Frontend-Developer | ⏳ Pendiente |
| 4-5 | Tests para ModuleDetailPage.tsx (P2) | Frontend-Developer | ⏳ Pendiente |
| 6 | Tests para InventoryPage.tsx (P2) | Frontend-Developer | ⏳ Pendiente |
| 7-8 | Tests para GuildsPage.tsx (P2) | Frontend-Developer | ⏳ Pendiente |
| 9-10 | Tests para AchievementsPage.tsx (P2) | Frontend-Developer | ⏳ Pendiente |

**Objetivo Sprint 2:** Coverage de páginas principales >70%

---

### Sprint 3 (Futuro) - 15 días

| Fase | Tarea | Estimación |
|------|-------|------------|
| 1 | Tests para ejercicios de módulo 1 | 4 días |
| 2 | Tests para ejercicios de módulo 2 | 3 días |
| 3 | Tests para ejercicios de módulo 3 | 2 días |
| 4 | Tests para Teacher Portal (páginas críticas) | 3 días |
| 5 | Tests para Admin Portal (páginas críticas) | 3 días |

**Objetivo Sprint 3:** Coverage global >70%

---

## 🎯 MÉTRICAS DE ÉXITO

### Objetivos por Sprint

| Sprint | Tests Pasando | Coverage | Archivos con Tests |
|--------|---------------|----------|---------------------|
| **Actual** | 76.4% | ~60% | 30 |
| **Sprint 1** | **100%** ✅ | ~65% | 37 (+7) |
| **Sprint 2** | 100% | **~70%** ✅ | 44 (+7) |
| **Sprint 3** | 100% | **~75%** ✅ | 61 (+17) |

### KPIs de Calidad

1. **Test Pass Rate:** 100% (actualmente 76.4%)
2. **Coverage:** >70% (actualmente ~60%)
3. **Critical Components Tested:** 100% (actualmente ~30%)
4. **Pages Tested:** >50% (actualmente ~11%)
5. **Exercises Tested:** >50% (actualmente 0%)

---

## 🛠️ ESTRATEGIA DE TESTING

### Herramientas

- **Framework:** Vitest
- **React Testing:** @testing-library/react
- **Coverage:** @vitest/coverage-v8
- **Mocking:** vi (Vitest mocks)
- **E2E:** Playwright (ya configurado)

### Patrones de Testing

#### 1. Testing de Componentes

```typescript
describe('ComponentName', () => {
  it('renders correctly with props', () => {
    // Arrange
    const props = { ... };

    // Act
    render(<ComponentName {...props} />);

    // Assert
    expect(screen.getByText('...')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    // Arrange
    const mockFn = vi.fn();
    render(<ComponentName onAction={mockFn} />);

    // Act
    await userEvent.click(screen.getByRole('button'));

    // Assert
    expect(mockFn).toHaveBeenCalled();
  });
});
```

#### 2. Testing de Hooks

```typescript
describe('useCustomHook', () => {
  it('returns correct initial state', () => {
    const { result } = renderHook(() => useCustomHook());
    expect(result.current.data).toBeNull();
  });

  it('updates state on action', async () => {
    const { result } = renderHook(() => useCustomHook());

    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.data).toBeDefined();
  });
});
```

#### 3. Testing de Stores (Zustand)

```typescript
describe('useStore', () => {
  beforeEach(() => {
    useStore.setState(initialState);
  });

  it('updates state on action', () => {
    const { addItem } = useStore.getState();
    addItem({ id: 1, name: 'Test' });

    const state = useStore.getState();
    expect(state.items).toHaveLength(1);
  });
});
```

#### 4. Testing de Pages con Routing

```typescript
describe('PageName', () => {
  it('renders page content', () => {
    render(
      <MemoryRouter initialEntries={['/path']}>
        <PageName />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading')).toHaveTextContent('Page Title');
  });
});
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Para Cada Test Suite

- [ ] Crear archivo `ComponentName.test.tsx`
- [ ] Importar dependencias necesarias
- [ ] Mockear APIs y dependencias externas
- [ ] Escribir casos de prueba (mínimo 5 por componente)
- [ ] Ejecutar tests localmente
- [ ] Verificar coverage >70%
- [ ] Integrar en CI/CD
- [ ] Documentar casos especiales

### Validación de Calidad

- [ ] Todos los tests pasan localmente
- [ ] Coverage aumentó según objetivo
- [ ] No hay warnings en consola
- [ ] Tests son rápidos (<100ms por test)
- [ ] Mocks son realistas
- [ ] Casos edge están cubiertos

---

## 🚀 BENEFICIOS ESPERADOS

### Técnicos

1. ✅ **Detección temprana de bugs:** Tests atrapan errores antes de producción
2. ✅ **Refactoring seguro:** Cambios de código no rompen funcionalidad
3. ✅ **Documentación viva:** Tests sirven como documentación de comportamiento
4. ✅ **CI/CD robusto:** Pipeline de despliegue más confiable
5. ✅ **Menos regresiones:** Tests previenen que bugs viejos regresen

### De Negocio

1. ✅ **Mayor calidad del producto:** Menos bugs en producción
2. ✅ **Menor costo de mantenimiento:** Detección temprana es más barata
3. ✅ **Mayor confianza del equipo:** Desarrollo más rápido y seguro
4. ✅ **Mejor experiencia de usuario:** Producto más estable y confiable
5. ✅ **Cumplimiento de estándares:** Coverage >70% es estándar industrial

---

## 📊 TRACKING DE PROGRESO

### Dashboard de Métricas

```
Tests Totales: 779
Tests Pasando: 595 (76.4%) → Objetivo: 100%
Tests Fallando: 184 (23.6%) → Objetivo: 0
Coverage: ~60% → Objetivo: >70%
```

### Próximos Milestones

- **Milestone 1 (1 semana):** ✅ 100% tests pasando
- **Milestone 2 (3 semanas):** ✅ 70% coverage
- **Milestone 3 (6 semanas):** ✅ 75% coverage

---

**Última actualización:** 2025-11-23
**Versión:** 1.0
**Generado por:** Frontend-Developer
**Revisado por:** Architecture-Analyst (pendiente)

---

**FIN DEL PLAN DE TESTS PRIORITARIOS - FRONTEND**
