# Gamification Endpoints Gap Analysis

**Documento:** GAMIFICATION-ENDPOINTS-GAP.md
**Fase CAPVED:** 0 - Documentacion Estado Actual
**Task ID:** TASK-2026-01-17-002
**Fecha:** 2026-01-18

---

## 1. Proposito

Este documento identifica las discrepancias entre los endpoints que el frontend espera y los que el backend provee actualmente. Es el analisis de gaps para la alineacion de APIs.

---

## 2. Resumen Ejecutivo

| Categoria | Endpoints Backend | Endpoints Frontend Espera | Gap |
|-----------|------------------|---------------------------|-----|
| User Stats | 4 | 6 | -2 |
| Ranks | 8 | 11 | -3 |
| Economy | 5 | 7 | -2 |
| Shop | 4 | 4 | 0 |
| **TOTAL** | **21** | **28** | **-7** |

---

## 3. Endpoints de Ranks - Analisis Detallado

### 3.1 Endpoints Existentes en Backend

| Endpoint | Metodo | Descripcion | DTO Response |
|----------|--------|-------------|--------------|
| `/gamification/ranks` | GET | Lista todos los rangos | `RankMetadataDto[]` |
| `/gamification/ranks/current` | GET | Rango actual del usuario auth | `UserRank` |
| `/gamification/ranks/users/:userId/rank-progress` | GET | Progreso hacia siguiente rango | `RankProgressDto` |
| `/gamification/ranks/users/:userId/rank-history` | GET | Historial de rangos | `UserRank[]` |
| `/gamification/ranks/check-promotion/:userId` | GET | Verifica elegibilidad | `{ eligible }` |
| `/gamification/ranks/promote/:userId` | POST | Promociona usuario | `UserRank` |
| `/gamification/ranks/:id` | GET | Detalles de registro | `UserRank` |
| `/gamification/admin/ranks` | POST | Crear rango (admin) | `UserRank` |

### 3.2 Endpoints que Frontend Espera (ranksAPI.ts)

| Endpoint Esperado | Metodo | Usado Por | Estado Backend |
|-------------------|--------|-----------|----------------|
| `/gamification/users/:userId/progress` | GET | `fetchUserProgress()` | **NO EXISTE** - Usa `/rank-progress` |
| `/gamification/users/:userId/multipliers` | GET | `getMultipliers()` | **NO EXISTE** |
| `/gamification/users/:userId/add-xp` | POST | `addXP()` | **NO EXISTE** - Usar PATCH /stats |
| `/gamification/users/:userId/prestige` | POST | `prestige()` | **NO EXISTE** |

### 3.3 Analisis de Gap - Ranks

```
╔════════════════════════════════════════════════════════════════════════╗
║ GAP 1: fetchUserProgress()                                              ║
╠════════════════════════════════════════════════════════════════════════╣
║ Frontend llama: GET /gamification/users/:userId/progress               ║
║ Backend tiene:  GET /gamification/ranks/users/:userId/rank-progress    ║
║                                                                         ║
║ PROBLEMA: Ruta diferente + respuesta no incluye todos los campos       ║
║                                                                         ║
║ SOLUCION:                                                               ║
║ A) Agregar alias de ruta en backend                                    ║
║ B) Crear nuevo endpoint con DTO compuesto UserRankProgressResponseDto  ║
║ C) Actualizar frontend para usar ruta existente                        ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ GAP 2: getMultipliers()                                                 ║
╠════════════════════════════════════════════════════════════════════════╣
║ Frontend llama: GET /gamification/users/:userId/multipliers            ║
║ Backend tiene:  NADA                                                    ║
║                                                                         ║
║ PROBLEMA: No existe endpoint ni logica para calcular multiplicadores   ║
║                                                                         ║
║ SOLUCION:                                                               ║
║ Crear endpoint nuevo en RanksController o UserStatsController          ║
║ con logica para calcular multiplicador de rango + streak + eventos     ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ GAP 3: addXP()                                                          ║
╠════════════════════════════════════════════════════════════════════════╣
║ Frontend llama: POST /gamification/users/:userId/add-xp                ║
║                 Body: { amount, source, description }                  ║
║                 Espera: AddXPResponse                                   ║
║                                                                         ║
║ Backend tiene:  PATCH /gamification/users/:userId/stats                ║
║                 Body: { total_xp_increment }                           ║
║                 Retorna: UserStats + leveled_up, ranked_up             ║
║                                                                         ║
║ PROBLEMA: Estructura diferente, no registra source/description         ║
║                                                                         ║
║ SOLUCION:                                                               ║
║ A) Crear endpoint POST /add-xp que use PATCH internamente              ║
║ B) Registrar transaccion de XP para auditoria                          ║
║ C) Retornar AddXPResponse estructurado                                 ║
╚════════════════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════════════════╗
║ GAP 4: prestige()                                                       ║
╠════════════════════════════════════════════════════════════════════════╣
║ Frontend llama: POST /gamification/users/:userId/prestige              ║
║ Backend tiene:  NADA                                                    ║
║                                                                         ║
║ PROBLEMA: Sistema de prestige no implementado en backend               ║
║                                                                         ║
║ SOLUCION:                                                               ║
║ FASE FUTURA - Requiere:                                                 ║
║ 1. Tabla user_prestige o campo en user_stats                           ║
║ 2. Logica de reset de XP/nivel con bonus permanente                    ║
║ 3. Endpoint para ejecutar prestige                                     ║
╚════════════════════════════════════════════════════════════════════════╝
```

---

## 4. Endpoints de Economy - Analisis Detallado

### 4.1 Endpoints Existentes (UserStatsController + MlCoinsController)

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/gamification/users/:userId/stats` | GET | Stats completas |
| `/gamification/users/:userId/stats` | PATCH | Actualizar stats |
| `/gamification/users/:userId/summary` | GET | Resumen gamification |
| `/gamification/users/:userId/rank` | GET | Rango actual |
| `/gamification/ml-coins/*` | CRUD | Transacciones |

### 4.2 Endpoints que Frontend Espera (economyAPI.ts / economyStore.ts)

| Endpoint Esperado | Estado |
|-------------------|--------|
| `/gamification/users/:userId/stats` | **OK** |
| `/gamification/users/:userId/stats` (PATCH) | **OK** (soporta increments) |
| `/gamification/ml-coins/transactions` | **OK** |
| `/gamification/shop/items` | **OK** |
| `/gamification/shop/purchase` | **OK** |

### 4.3 Analisis de Gap - Economy

**Gaps menores:**
- Response mapping (snake_case → camelCase)
- Campos adicionales en ShopItem no provistos

**PATCH /stats soporta:**
- `total_xp_increment` → Incrementa total_xp
- `ml_coins_increment` → Incrementa ml_coins + earned_total
- `ml_coins_decrement` → Decrementa ml_coins + suma a spent_total
- Retorna flags: `leveled_up`, `ranked_up`

---

## 5. Mapeo de Respuestas - Discrepancias de Nomenclatura

### 5.1 Transaction Response

| Campo Backend | Campo Frontend | Transformacion |
|---------------|----------------|----------------|
| `reference_type` | `source` | Renombrar |
| `created_at` | `timestamp` | Renombrar |
| `balance_after` | `balanceAfter` | camelCase |
| `transaction_type` | `type` | Renombrar |

### 5.2 ShopItem Response

| Campo Backend | Campo Frontend | Transformacion |
|---------------|----------------|----------------|
| `image_url` | `image` | Renombrar |
| `is_available` | `available` | Renombrar |
| `is_consumable` | (no usado) | N/A |

### 5.3 UserStats Response

| Campo Backend | Campo Frontend | Transformacion |
|---------------|----------------|----------------|
| `current_rank` | `currentRank` | camelCase |
| `total_xp` | `totalXP` | camelCase |
| `ml_coins` | `mlCoins` | camelCase |
| Todos | Todos | snake_case → camelCase |

---

## 6. Solucion Propuesta

### Opcion A: Transformacion en Backend (Recomendada)

Usar interceptor global o decoradores `@Transform()` para:
1. Convertir snake_case a camelCase en responses
2. Mapear campos con nombres diferentes

**Ventajas:**
- Frontend no necesita cambios
- Consistencia garantizada
- Un solo punto de transformacion

### Opcion B: Transformacion en Frontend

Crear mappers en cada API:

```typescript
// economyAPI.ts
const mapTransaction = (dto: TransactionResponseDto): Transaction => ({
  id: dto.id,
  type: dto.transaction_type,
  amount: dto.amount,
  source: dto.reference_type || 'unknown',
  timestamp: new Date(dto.created_at),
  balanceAfter: dto.balance_after,
  // ...
});
```

**Desventajas:**
- Duplicacion de logica
- Mas propenso a errores
- Dificil mantener sincronizado

### Opcion C: Hibrida

- Backend provee ambos formatos (snake_case y camelCase)
- Frontend migra gradualmente

---

## 7. Plan de Accion por Prioridad

### P0 - Critico (Bloquea tests)

| Accion | Endpoint | Responsable |
|--------|----------|-------------|
| Crear DTO UserRankProgressResponse | `/users/:userId/progress` | Backend |
| Implementar endpoint progress | `/users/:userId/progress` | Backend |

### P1 - Alto (Funcionalidad incompleta)

| Accion | Endpoint | Responsable |
|--------|----------|-------------|
| Implementar endpoint multipliers | `/users/:userId/multipliers` | Backend |
| Agregar campos a ShopItemDto | `/shop/items` | Backend |

### P2 - Medio (Mejora de experiencia)

| Accion | Endpoint | Responsable |
|--------|----------|-------------|
| Crear endpoint add-xp estructurado | `/users/:userId/add-xp` | Backend |
| Estandarizar nomenclatura | Todos | Backend |

### P3 - Bajo (Feature futura)

| Accion | Endpoint | Responsable |
|--------|----------|-------------|
| Sistema de prestige | `/users/:userId/prestige` | Backend + Frontend |

---

## 8. Matriz de Compatibilidad

| Endpoint | Backend | Frontend | Tests | Estado |
|----------|---------|----------|-------|--------|
| GET /stats | ✅ | ✅ | 🔴 (mock) | Requiere mapeo |
| PATCH /stats | ✅ | ✅ | 🔴 (mock) | Requiere mapeo |
| GET /progress | ❌ | ✅ | 🔴 | **CREAR** |
| GET /multipliers | ❌ | ✅ | 🔴 | **CREAR** |
| POST /add-xp | ❌ | ✅ | 🔴 | Usar PATCH |
| POST /prestige | ❌ | ✅ | 🔴 | FASE FUTURA |
| GET /shop/items | ✅ | ✅ | 🔴 (mock) | Requiere campos |
| POST /shop/purchase | ✅ | ✅ | ✅ | OK |

---

*Generado: 2026-01-18 - FASE 0 CAPVED*
