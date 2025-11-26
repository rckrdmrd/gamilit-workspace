# QUICK REFERENCE - Achievements Tab

## 🚀 Inicio Rápido

### Testing Local
```bash
# Terminal 1: Backend
cd apps/backend
npm run start:dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev

# Navegar a:
http://localhost:5173/admin/gamification
```

---

## 📂 Archivos Importantes

### API Client
```typescript
// /apps/frontend/src/services/api/admin/achievementsApi.ts

import { adminAchievementsApi } from '@/services/api/admin/achievementsApi';

// Uso:
const { data } = await adminAchievementsApi.listAchievements({
  category: 'progress',
  includeSecret: true,
});
```

### Types
```typescript
// /apps/frontend/src/types/admin/achievements.types.ts

import type { AdminAchievement } from '@/types/admin/achievements.types';

// Interfaz completa del achievement
const achievement: AdminAchievement = {
  id: 'uuid',
  name: 'Logro',
  category: 'progress',
  rewards: { xp: 100, ml_coins: 50 },
  is_active: true,
  // ... más campos
};
```

### Componente
```typescript
// /apps/frontend/src/apps/admin/components/gamification/AchievementsTab.tsx

import { AchievementsTab } from '@/apps/admin/components/gamification';

// Uso en página:
{activeTab === 'achievements' && <AchievementsTab />}
```

---

## 🔌 API Endpoints

### GET /api/v1/gamification/achievements
```bash
# cURL
curl http://localhost:3006/api/v1/gamification/achievements?includeSecret=true

# Response
[
  {
    "id": "uuid",
    "name": "Primeros Pasos",
    "category": "progress",
    "rewards": { "xp": 50, "ml_coins": 10 },
    "is_active": true
  }
]
```

### PATCH /api/v1/gamification/achievements/:id (PENDIENTE)
```bash
# NO IMPLEMENTADO aún en backend
# Workaround: Toggle simulado en frontend
```

---

## 🎨 Categorías

### Enum
```typescript
export enum AchievementCategoryEnum {
  PROGRESS = 'progress',        // Progreso
  STREAK = 'streak',            // Racha
  COMPLETION = 'completion',    // Completación
  SOCIAL = 'social',            // Social
  SPECIAL = 'special',          // Especial
  MASTERY = 'mastery',          // Maestría
  EXPLORATION = 'exploration',  // Exploración
}
```

### Labels
```typescript
const CATEGORY_LABELS = {
  progress: 'Progreso',
  streak: 'Racha',
  completion: 'Completación',
  social: 'Social',
  special: 'Especial',
  mastery: 'Maestría',
  exploration: 'Exploración',
};
```

---

## 🎯 Rareza

### Tipos
```typescript
type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
```

### Colores
```typescript
const RARITY_COLORS = {
  common: 'text-gray-400',      // Común
  rare: 'text-blue-400',        // Raro
  epic: 'text-purple-400',      // Épico
  legendary: 'text-yellow-400', // Legendario
};
```

---

## 🔧 React Query

### Query Key
```typescript
['admin', 'achievements', category, showInactive]
```

### Uso en Componente
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['admin', 'achievements', selectedCategory, showInactive],
  queryFn: async () => {
    return await adminAchievementsApi.listAchievements({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      includeSecret: true,
    });
  },
});
```

### Mutation
```typescript
const toggleMutation = useMutation({
  mutationFn: ({ id, isActive }) =>
    adminAchievementsApi.toggleActive(id, isActive),
  onSuccess: () => {
    queryClient.invalidateQueries(['admin', 'achievements']);
    toast.success('Estado actualizado');
  },
});
```

---

## 📊 Estructura de Datos

### Achievement Completo
```typescript
{
  id: string;
  name: string;
  description?: string;
  icon: string;                    // Emoji
  category: AchievementCategoryEnum;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  difficulty_level: DifficultyLevelEnum;
  conditions: {                     // JSON - read-only
    type: string;
    requirements: Record<string, any>;
  };
  rewards: {
    xp: number;
    ml_coins: number;
    badge?: string | null;
  };
  ml_coins_reward: number;          // Denormalizado
  is_secret: boolean;
  is_active: boolean;
  is_repeatable: boolean;
  order_index: number;
  points_value: number;
  unlock_message?: string;
  instructions?: string;
  tips?: string[];
  metadata: Record<string, any>;
  created_at: Date | string;
  updated_at: Date | string;
}
```

### Conditions (Ejemplos)
```json
// Progreso
{
  "type": "exercise_completion",
  "requirements": {
    "exercises_completed": 1
  }
}

// Racha
{
  "type": "streak",
  "requirements": {
    "consecutive_days": 7
  }
}

// Maestría
{
  "type": "mastery",
  "requirements": {
    "perfect_scores": 10,
    "module_id": "uuid"
  }
}
```

---

## 🧪 Testing

### Test Manual
```bash
# 1. Navegar
http://localhost:5173/admin/gamification

# 2. Clic en tab "Logros"

# 3. Verificar carga de achievements

# 4. Probar filtros:
- Clic en "Progreso" → Ver solo progress
- Clic en "Todos" → Ver todos

# 5. Probar toggle:
- Clic en "Activo" → Cambia a "Inactivo"
- Toast debe aparecer

# 6. Verificar display:
- XP con ⭐
- ML Coins con 🪙
- Requirements como JSON
```

### Test de API
```bash
# Backend debe estar corriendo
curl http://localhost:3006/api/v1/gamification/achievements

# Debe retornar array de achievements
```

---

## ⚠️ Troubleshooting

### Error: No se cargan logros
```typescript
// Verificar:
1. Backend corriendo en :3006
2. Endpoint /api/v1/gamification/achievements accesible
3. Usuario autenticado (token válido)
4. Base de datos tiene achievements seeded

// Debug:
console.log('API URL:', API_BASE_URL);
console.log('Endpoint:', API_ENDPOINTS.gamification.achievements);
```

### Error: Toggle no persiste
```typescript
// ESPERADO - Toggle es simulado
// Backend no tiene PATCH endpoint aún
// Workaround en achievementsApi.ts línea 90+

// Solución: Implementar en backend:
// PATCH /api/v1/gamification/achievements/:id
```

### Error: Categorías vacías
```typescript
// Verificar:
1. Seed data cargado en BD
2. Filtro por categoría correcta
3. showInactive = true

// Query:
SELECT category, COUNT(*)
FROM gamification_system.achievements
GROUP BY category;
```

---

## 🔄 Flujo de Datos

```
┌──────────────────┐
│ AchievementsTab  │
│   (Component)    │
└────────┬─────────┘
         │
         │ React Query
         ▼
┌──────────────────┐
│ achievementsApi  │
│   (API Client)   │
└────────┬─────────┘
         │
         │ HTTP GET
         ▼
┌──────────────────┐
│ Backend API      │
│ /achievements    │
└────────┬─────────┘
         │
         │ TypeORM
         ▼
┌──────────────────┐
│ PostgreSQL DB    │
│ achievements     │
└──────────────────┘
```

---

## 📝 Notas Rápidas

### Dependencies
- React Query v5
- React Hot Toast
- Lucide React
- TailwindCSS

### No Dependencies Nuevas
Todo usa librerías ya instaladas

### Build Time
~12 segundos en máquina promedio

### Bundle Size
Sin impacto significativo (+550 líneas distribuidas en 3 archivos)

---

## 🎯 Checklist de Validación

- [ ] Backend corriendo
- [ ] Frontend corriendo
- [ ] Usuario admin logueado
- [ ] Tab "Logros" visible
- [ ] Achievements cargan de BD
- [ ] Filtros funcionan
- [ ] Toggle activo/inactivo funciona (visual)
- [ ] Rewards se muestran correctamente
- [ ] Requirements visible como JSON
- [ ] Toast notifications aparecen
- [ ] Estados loading/error funcionan

---

## 🚨 Limitaciones

1. **Toggle simulado** - No persiste (pendiente backend)
2. **Sin paginación** - Carga todos en memoria
3. **Sin búsqueda** - Solo filtros por categoría
4. **Requirements read-only** - No editable (by design)
5. **Sin creación** - Solo lectura (by design)

---

## 📞 Soporte

**Archivos de Referencia**:
- Reporte completo: `IMPLEMENTATION-REPORT-ACHIEVEMENTS-TAB-2025-11-24.md`
- Test plan: `test-achievements-tab.md`
- Resumen: `RESUMEN-ACHIEVEMENTS-TAB.md`

**Desarrollado por**: Frontend-Agent
**Fecha**: 2025-11-24
**Versión**: 1.0.0

---

**FIN DE QUICK REFERENCE**
