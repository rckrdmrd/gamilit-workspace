# VALIDATION CHECKLIST - API GAMIFICACION

**Date:** 2025-11-23
**Purpose:** Verificar que la implementación funciona correctamente

---

## PRE-DEPLOYMENT CHECKLIST

### ✅ Backend Validation

- [ ] **Endpoint User Stats funciona**
  ```bash
  curl -X GET http://localhost:3006/api/v1/gamification/users/{userId}/stats \
    -H "Authorization: Bearer {token}"
  ```
  Expected: Status 200, objeto con user_id, level, total_xp, ml_coins, current_rank

- [ ] **PATCH con increment funciona**
  ```bash
  curl -X PATCH http://localhost:3006/api/v1/gamification/users/{userId}/stats \
    -H "Authorization: Bearer {token}" \
    -H "Content-Type: application/json" \
    -d '{"total_xp_increment": 50}'
  ```
  Expected: Status 200, total_xp aumentado, leveled_up flag si corresponde

- [ ] **PATCH con ml_coins_increment funciona**
  ```bash
  curl -X PATCH http://localhost:3006/api/v1/gamification/users/{userId}/stats \
    -H "Authorization: Bearer {token}" \
    -H "Content-Type: application/json" \
    -d '{"ml_coins_increment": 100}'
  ```
  Expected: Status 200, ml_coins aumentado

- [ ] **PATCH con ml_coins_decrement funciona**
  ```bash
  curl -X PATCH http://localhost:3006/api/v1/gamification/users/{userId}/stats \
    -H "Authorization: Bearer {token}" \
    -H "Content-Type: application/json" \
    -d '{"ml_coins_decrement": 30}'
  ```
  Expected: Status 200, ml_coins disminuido

- [ ] **Achievements endpoint funciona**
  ```bash
  curl -X GET http://localhost:3006/api/v1/gamification/users/{userId}/achievements \
    -H "Authorization: Bearer {token}"
  ```
  Expected: Status 200, array de achievements

- [ ] **Rank progress endpoint funciona**
  ```bash
  curl -X GET http://localhost:3006/api/v1/gamification/users/{userId}/rank-progress \
    -H "Authorization: Bearer {token}"
  ```
  Expected: Status 200, objeto con current_rank, next_rank, can_rank_up

---

### ✅ Frontend Validation

#### Code Quality
- [ ] **No TypeScript errors**
  ```bash
  cd apps/frontend
  npm run type-check
  ```
  Expected: 0 errors

- [ ] **No Lint errors**
  ```bash
  npm run lint
  ```
  Expected: 0 errors

- [ ] **Imports correctos**
  - [ ] `apiClient` importado en economyStore.ts
  - [ ] `apiClient` importado en ranksStore.ts
  - [ ] `useAuthStore` importado en stores

#### Hook useUserGamification
- [ ] **No usa mock data**
  - [ ] Archivo NO contiene `mockData`
  - [ ] Usa `apiClient.get()` para stats
  - [ ] Usa `apiClient.get()` para achievements

- [ ] **Transformación correcta**
  - [ ] snake_case → camelCase
  - [ ] achievements.map() para IDs
  - [ ] Fallback implementado

#### Economy Store
- [ ] **fetchBalance usa API**
  - [ ] Llama `/users/:userId/stats`
  - [ ] Transforma ml_coins → balance.current
  - [ ] Error handling implementado

- [ ] **addCoins usa API**
  - [ ] Llama PATCH con ml_coins_increment
  - [ ] Actualiza desde response
  - [ ] Crea transaction local

- [ ] **spendCoins usa API**
  - [ ] Llama PATCH con ml_coins_decrement
  - [ ] Valida balance antes de gastar
  - [ ] Actualiza desde response

#### Ranks Store
- [ ] **fetchUserProgress usa API**
  - [ ] Llama `/users/:userId/rank-progress`
  - [ ] Transforma response correctamente
  - [ ] updateMultipliers() después de fetch

- [ ] **addXP usa API**
  - [ ] Llama PATCH con total_xp_increment
  - [ ] Actualiza desde response
  - [ ] Maneja leveled_up flag
  - [ ] Maneja ranked_up flag

#### Components
- [ ] **GamificationErrorBoundary existe**
  - [ ] Archivo creado en ruta correcta
  - [ ] Implementa componentDidCatch
  - [ ] Muestra mensaje de error amigable

- [ ] **Skeleton existe y funciona**
  - [ ] Archivo existe
  - [ ] Componentes exportados
  - [ ] Estilos correctos

---

### ✅ Manual Testing

#### Login Flow
- [ ] **Login con usuario real**
  - [ ] Credenciales válidas aceptadas
  - [ ] Token JWT guardado
  - [ ] Redirect a dashboard

#### Dashboard
- [ ] **Stats reales se muestran**
  - [ ] Level correcto del usuario
  - [ ] XP correcto
  - [ ] ML Coins correcto
  - [ ] Rank correcto

- [ ] **Loading state funciona**
  - [ ] Skeleton loader visible inicialmente
  - [ ] Desaparece cuando carga completa
  - [ ] < 300ms en promedio

- [ ] **Error handling funciona**
  - [ ] Si API falla, muestra fallback
  - [ ] Mensaje de error claro
  - [ ] Botón retry funciona

#### Ganar XP
- [ ] **Completar ejercicio gana XP**
  - [ ] XP aumenta en UI
  - [ ] XP persiste en backend
  - [ ] Refresh muestra XP correcto

- [ ] **Level up automático**
  - [ ] Al alcanzar XP necesario, sube nivel
  - [ ] Modal/notificación de level up
  - [ ] Nuevo nivel persiste

#### Ganar ML Coins
- [ ] **Achievement desbloquea monedas**
  - [ ] ML Coins aumentan en UI
  - [ ] Balance persiste en backend
  - [ ] Refresh muestra balance correcto

#### Gastar ML Coins
- [ ] **Comprar comodín gasta monedas**
  - [ ] ML Coins disminuyen en UI
  - [ ] Gasto persiste en backend
  - [ ] No permite gastar más de lo que tiene

#### Navigation
- [ ] **33 páginas funcionan**
  - [ ] Student pages (11) sin errores
  - [ ] Teacher pages (11) sin errores
  - [ ] Admin pages (7) sin errores
  - [ ] Shared components (4) sin errores

- [ ] **No errores de consola**
  - [ ] No "useUserGamification mock"
  - [ ] No TypeScript errors
  - [ ] No React warnings

---

### ✅ Performance Testing

- [ ] **API Response Times**
  - [ ] GET stats < 200ms
  - [ ] PATCH stats < 300ms
  - [ ] GET achievements < 200ms

- [ ] **Frontend Rendering**
  - [ ] First Contentful Paint < 1s
  - [ ] Time to Interactive < 2s
  - [ ] No layout shifts

- [ ] **Network**
  - [ ] Parallel requests cuando corresponde
  - [ ] No requests duplicados
  - [ ] Caching apropiado

---

### ✅ Security Validation

- [ ] **Authentication**
  - [ ] JWT required para todos los endpoints
  - [ ] Token validation funciona
  - [ ] Expired tokens manejados

- [ ] **Authorization**
  - [ ] User solo puede ver sus propios stats
  - [ ] Admin puede ver stats de otros
  - [ ] CORS configurado correctamente

- [ ] **Data Validation**
  - [ ] Backend valida inputs
  - [ ] Frontend valida antes de enviar
  - [ ] SQL injection prevention
  - [ ] XSS prevention

---

### ✅ Error Scenarios

- [ ] **Backend offline**
  - [ ] Frontend muestra error boundary
  - [ ] Fallback data cargado
  - [ ] Retry button funciona

- [ ] **Slow network**
  - [ ] Loading states visibles
  - [ ] No timeout errors
  - [ ] User experience aceptable

- [ ] **Invalid data**
  - [ ] Backend rechaza datos inválidos
  - [ ] Frontend valida antes de enviar
  - [ ] Mensajes de error claros

- [ ] **User not authenticated**
  - [ ] Redirect a login
  - [ ] Token refresh automático
  - [ ] Estado preservado después de login

---

### ✅ Data Consistency

- [ ] **XP consistency**
  - [ ] Total XP matches achievements
  - [ ] Level calculation correcto
  - [ ] XP to next level correcto

- [ ] **ML Coins consistency**
  - [ ] Balance = earned - spent
  - [ ] Transactions match balance
  - [ ] No negative balances

- [ ] **Rank consistency**
  - [ ] Rank matches level
  - [ ] Progression logic correcta
  - [ ] Can rank up flag correcto

---

## POST-DEPLOYMENT VALIDATION

### ✅ Production Monitoring

- [ ] **Error Rate**
  - [ ] < 1% error rate
  - [ ] Errores logeados correctamente
  - [ ] Alerts configurados

- [ ] **Performance**
  - [ ] API response times < 300ms p95
  - [ ] Frontend load time < 2s
  - [ ] No performance degradation

- [ ] **User Feedback**
  - [ ] Users reportan datos correctos
  - [ ] No complaints sobre lentitud
  - [ ] Feature funcionando como esperado

---

## ROLLBACK CRITERIA

⚠️ **Rollback si:**
- Error rate > 5%
- API response time > 1s p95
- Critical bugs afectando funcionalidad core
- Data corruption detectada
- Performance degradation > 50%

---

## SIGN-OFF

### Backend Team
- [ ] Endpoints validados
- [ ] Performance aceptable
- [ ] Security review pasado
- [ ] Signed by: _________________ Date: _________

### Frontend Team
- [ ] Código sin errores
- [ ] UI/UX funcional
- [ ] Tests pasando
- [ ] Signed by: _________________ Date: _________

### QA Team
- [ ] Manual testing completo
- [ ] Automated tests pasando
- [ ] Edge cases validados
- [ ] Signed by: _________________ Date: _________

### Product Owner
- [ ] Funcionalidad aprobada
- [ ] User experience aceptable
- [ ] Ready for production
- [ ] Signed by: _________________ Date: _________

---

**Status:** ⏳ Pending Validation
**Next Step:** Execute validation checklist
**Target:** Deploy to production
