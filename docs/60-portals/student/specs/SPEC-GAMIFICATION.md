# SPEC-GAMIFICATION - Student Portal Gamification System

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** COMPLETO

---

## 1. Vision General

El sistema de gamificación de GAMILIT implementa mecánicas de juego para motivar el aprendizaje:
- **Sistema de Rangos Maya** - 5 niveles con multiplicadores de XP
- **ML Coins** - Moneda virtual para tienda y power-ups
- **Misiones** - Daily, weekly, y especiales
- **Leaderboards** - Rankings por diferentes niveles
- **Tienda** - Compra de items y cosmetics

---

## 2. Páginas Relacionadas

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Gamification Hub | `pages/GamificationPage.tsx` | Dashboard central de gamificación |
| Leaderboard | `pages/LeaderboardPage.tsx` | Rankings multi-nivel |
| Missions | `pages/MissionsPage.tsx` | Hub de misiones |
| Shop | `pages/ShopPage.tsx` | Tienda de ML Coins |
| Inventory | `pages/InventoryPage.tsx` | Inventario de items |

---

## 3. Componentes

### 3.1 Componentes de Gamification Hub

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| GamificationHero | `components/gamification/GamificationHero.tsx` | Hero section |
| RanksSection | `components/gamification/RanksSection.tsx` | Visualización de rangos |
| MLCoinsSection | `components/gamification/MLCoinsSection.tsx` | Dashboard de monedas |
| StreaksMissionsSection | `components/gamification/StreaksMissionsSection.tsx` | Rachas y misiones |
| AchievementsPreview | `components/gamification/AchievementsPreview.tsx` | Preview de logros |
| LeaderboardPreview | `components/gamification/LeaderboardPreview.tsx` | Preview de rankings |

---

## 4. Hooks

| Hook | Archivo | Descripción |
|------|---------|-------------|
| useRanksStore | `features/gamification/ranks/store/ranksStore` | Zustand store de rangos |
| useEconomyStore | `features/gamification/economy/store/economyStore` | Store de ML Coins |
| useMissions | `features/gamification/missions/hooks/useMissions` | Hook de misiones |
| useLeaderboards | `features/gamification/leaderboards/hooks/useLeaderboards` | Hook de rankings |
| useGamificationData | `hooks/useGamificationData.ts` | **DEPRECATED** |

---

## 5. APIs Consumidas

### 5.1 Sistema de Rangos

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/ranks/user/{userId}` | GET | Rango actual del usuario |
| `/gamification/ranks/user/progress` | GET | Progreso hacia siguiente rango |

### 5.2 Sistema de Monedas

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/economy/balance` | GET | Balance de ML Coins |
| `/gamification/economy/transactions` | GET | Historial de transacciones |
| `/gamification/economy/purchase` | POST | Realizar compra |

### 5.3 Sistema de Misiones

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/missions/daily` | GET | Misiones diarias |
| `/gamification/missions/weekly` | GET | Misiones semanales |
| `/gamification/missions/special` | GET | Misiones especiales |
| `/gamification/missions/{id}/start` | POST | Iniciar misión |
| `/gamification/missions/{id}/claim` | POST | Reclamar recompensa |

### 5.4 Leaderboard

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/leaderboard/global` | GET | Ranking global |
| `/gamification/leaderboard/school` | GET | Ranking de escuela |
| `/gamification/leaderboard/classroom/{id}` | GET | Ranking de aula |
| `/gamification/leaderboard/friends` | GET | Ranking de amigos |

### 5.5 Tienda

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/shop/categories` | GET | Categorías de tienda |
| `/shop/items` | GET | Items disponibles |
| `/shop/purchase` | POST | Comprar item |
| `/shop/purchases/{userId}` | GET | Historial de compras |

### 5.6 Power-ups/Inventario

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/gamification/inventory/powerups/{userId}` | GET | Inventario de power-ups |
| `/gamification/powerups/active` | GET | Power-ups activos |
| `/gamification/powerups/{id}/activate` | POST | Activar power-up |

---

## 6. Sistema de Rangos Maya

### 6.1 Estructura de Rangos

| Nivel | Nombre | Icon | XP Requerido | Multiplicador |
|-------|--------|------|--------------|---------------|
| 1 | Nacom | 🔍 | 0 | 1.0x |
| 2 | Ajaw | 🏹 | 500 | 1.5x |
| 3 | Ah K'in | 🗡️ | 1,500 | 2.0x |
| 4 | Halach Uinic | ⚔️ | 3,500 | 2.5x |
| 5 | K'uk'ulkan | 👑 | 7,500 | 3.0x |

### 6.2 Colores por Rango

```typescript
const rankColors: Record<string, string> = {
  'Nacom': 'gray',
  'Ajaw': 'blue',
  'Ah K\'in': 'purple',
  'Halach Uinic': 'orange',
  'K\'uk\'ulkan': 'yellow'
};
```

---

## 7. Sistema de ML Coins

### 7.1 Fuentes de Ganancia

| Fuente | ML Coins | Descripción |
|--------|----------|-------------|
| Ejercicio completado | ~50 | Base por ejercicio |
| Logro desbloqueado | ~100 | Por achievement |
| Módulo completado | ~200 | Por módulo |
| Racha mantenida | ~10/día | Por día consecutivo |
| Misión completada | 25-100 | Según tipo |
| Rank-up bonus | 100-500 | Por subir de rango |

### 7.2 Usos

- **Tienda:** Cosmetics, power-ups, premium content
- **Power-ups:** Pistas, tiempo extra, segunda oportunidad
- **Cosmetics:** Avatares, bordes, efectos

---

## 8. Sistema de Misiones

### 8.1 Tipos de Misiones

| Tipo | Frecuencia | Reset | Ejemplo |
|------|-----------|-------|---------|
| Daily | 24 horas | Medianoche | Completar 3 ejercicios |
| Weekly | 7 días | Lunes | Ganar 500 ML |
| Special | Variable | Evento | Evento aniversario |

### 8.2 Estados de Misión

```
pending → started → completed → claimed
```

### 8.3 Estructura

```typescript
interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  required: number;
  reward: {
    coins: number;
    xp: number;
  };
  expiresAt: string;
  completed: boolean;
  claimed: boolean;
}
```

---

## 9. Sistema de Leaderboard

### 9.1 Tipos de Ranking

| Tipo | Descripción | Filtros |
|------|-------------|---------|
| Global | Todos los usuarios | Período |
| School | Usuarios de la escuela | Período |
| Grade | Usuarios del grado | Período |
| Classroom | Usuarios del aula | Período |
| Friends | Amigos del usuario | Período |

### 9.2 Períodos

- Daily (Diario)
- Weekly (Semanal)
- Monthly (Mensual)
- All-time (Histórico)

### 9.3 Categorías de Puntos

| Categoría | Puntos | Descripción |
|-----------|--------|-------------|
| Ejercicios | 50 XP | Por ejercicio |
| Logros | 100 XP | Por achievement |
| Módulos | 200 XP | Por módulo |
| Rachas | 10 XP/día | Por día en racha |

---

## 10. Tienda

### 10.1 Categorías

- Cosmetics
- Profile
- Guild
- Social
- Consumable
- Premium

### 10.2 Rarezas

| Rareza | Color | Descripción |
|--------|-------|-------------|
| Common | Gray | 75% de items |
| Rare | Blue | 15-20% |
| Epic | Purple | 5-10% |
| Legendary | Yellow | <5% |

---

## 11. Gaps Conocidos

| ID | Descripción | Severidad | Estado |
|----|-------------|-----------|--------|
| GAP-P1-005 | Cart en ShopPage sin funcionalidad | Alta | Pendiente |
| GAP-P1-006 | Claim Reward disabled en dashboard | Media | Pendiente |
| GAP-P1-007 | useGamificationData es código muerto | Baja | Pendiente |
| GAP-P2-005 | CategoryStats calculado localmente | Media | Pendiente |
| GAP-P2-006 | Cosmetics "Próximamente" | Media | Pendiente |
| GAP-P2-007 | Polling 30s sin jitter/backoff | Baja | Pendiente |

---

## 12. Referencias

- **Rangos Maya:** `docs/01-fase-alcance-inicial/EAI-003-gamificacion/especificaciones/ET-GAM-003-rangos-maya.md`
- **Hooks:** `STUDENT-HOOKS-SPEC.md`
- **Gaps:** `orchestration/analisis/GAPS-STUDENT-PORTAL.yml`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.0.0*
