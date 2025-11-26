# TEACHER GAMIFICATION - REFERENCIA RÁPIDA

**Versión:** 2.0.0
**Fecha:** 2025-11-24
**Archivo:** `/apps/frontend/src/apps/teacher/pages/TeacherGamification.tsx`

---

## 🎯 FUNCIONALIDADES DISPONIBLES

| Funcionalidad | Hook Utilizado | Endpoint | Descripción |
|--------------|----------------|----------|-------------|
| **Economy Overview** | `useEconomyAnalytics()` | `GET /teacher/analytics/economy` | Circulación total, balance promedio, ML ganados/gastados |
| **Top Students** | `useStudentsEconomy()` | `GET /teacher/analytics/students-economy` | Leaderboard de estudiantes ordenados por ML Coins |
| **Achievements Stats** | `useAchievementsStats()` | `GET /teacher/analytics/achievements` | Logros disponibles y cantidad de desbloqueos |
| **Grant Bonus** | `useGrantBonus()` | `POST /teacher/bonus/:studentId/grant` | Otorgar bonus manual de ML Coins (1-1000) |

---

## 🔒 RESTRICCIONES DE ROL

| Funcionalidad | Teacher | Admin |
|--------------|---------|-------|
| Visualizar stats de economía | ✅ | ✅ |
| Ver leaderboard | ✅ | ✅ |
| Consultar achievements | ✅ | ✅ |
| Otorgar bonus ML Coins | ✅ | ✅ |
| Modificar tasas de recompensas | ❌ | ✅ |
| Crear/eliminar achievements | ❌ | ✅ |
| Configurar reglas de gamificación | ❌ | ✅ |

---

## 📊 ESTRUCTURA DE LA PÁGINA

```
TeacherGamification.tsx
│
├── Header + Refresh Button
│
├── Error Banners (Economy, Students, Achievements)
│
├── 📢 Banners Informativos (2 columnas)
│   ├── 🟢 Acciones Disponibles
│   └── 🟠 Solo Administradores
│
├── 💰 Economy Overview (4 cards)
│   ├── Circulación Total
│   ├── Balance Promedio
│   ├── Ganado Hoy
│   └── Gastado Hoy
│
├── 🎁 Give Bonus Section
│   ├── Selector de estudiante
│   ├── Input de cantidad
│   ├── Input de razón
│   └── Botón otorgar
│
├── 🏆 Top Students by ML Coins
│   └── Lista de estudiantes con stats
│
├── ⚙️ Economy Configuration (READ-ONLY)
│   ├── Tasas de ganancia
│   └── Costos de gasto
│
├── 🎖️ Achievements Overview
│   └── Lista de achievements con unlocks
│
├── 🔮 Próximamente (3 cards)
│   ├── Personalización de Recompensas
│   ├── Logros Personalizados
│   └── Reportes Avanzados
│
└── 📝 Modal de Otorgar Bonus
    ├── Info del estudiante
    ├── Input de cantidad (+/-)
    ├── Textarea de razón
    └── Botones (Cancelar/Otorgar)
```

---

## 🎨 COMPONENTES VISUALES

### Banners Informativos

```tsx
// Banner Verde: Acciones Disponibles
<div className="bg-green-50 border-l-4 border-green-400">
  ✅ Visualizar estadísticas de economía ML Coins
  ✅ Ver leaderboard de estudiantes
  ✅ Consultar logros y desbloqueos
  ✅ Otorgar bonus de ML Coins (1-1000 ML)
</div>

// Banner Amber: Solo Administradores
<div className="bg-amber-50 border-l-4 border-amber-400">
  ⚙️ Modificar tasas de recompensas
  ⚙️ Crear/eliminar achievements
  ⚙️ Configurar reglas de gamificación
  💡 Los rewards vienen predefinidos de la base de datos
</div>
```

### Sección Próximamente

```tsx
<DetectiveCard>
  <h2>Próximamente</h2>

  // Cards con borde punteado y opacidad 60%
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>Personalización de Recompensas</Card>
    <Card>Logros Personalizados</Card>
    <Card>Reportes Avanzados</Card>
  </div>

  <Banner>
    💡 Sugerencia: ¿Tienes ideas? Contacta al administrador
  </Banner>
</DetectiveCard>
```

---

## 🔄 FLUJO DE OTORGAR BONUS

```
1. Teacher selecciona estudiante del dropdown
   └─> Lista de estudiantes viene de useStudentsEconomy()

2. Teacher ajusta cantidad (1-1000 ML)
   └─> Botones +/- incrementan de 10 en 10

3. Teacher escribe razón (min 10 chars)
   └─> Textarea con validación

4. Teacher hace clic en "Otorgar Bonus"
   └─> Abre modal de confirmación

5. Modal muestra:
   - Nombre del estudiante
   - Balance actual
   - Input de cantidad (con +/- buttons)
   - Textarea de razón (min 10 chars)

6. Teacher confirma en modal
   └─> API call: POST /teacher/bonus/:studentId/grant
   └─> Body: { amount: number, reason: string }

7. Backend retorna:
   {
     "amountGranted": 100,
     "newBalance": 550,
     "previousBalance": 450,
     "reason": "Participación excepcional"
   }

8. Frontend actualiza:
   - Balance del estudiante en la lista
   - Toast de éxito
   - Cierra modal
```

---

## 🧪 VALIDACIONES

### Grant Bonus

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| `studentId` | Requerido | "Por favor selecciona un estudiante" |
| `amount` | 1-1000 | "La cantidad debe estar entre 1 y 1000 ML Coins" |
| `reason` | Min 10 chars | "La razón debe tener al menos 10 caracteres" |

### Botón "Otorgar Bonus" deshabilitado si:
- ❌ No hay estudiante seleccionado
- ❌ `amount < 1 || amount > 1000`
- ❌ `reason.length < 10`
- ❌ `grantingBonus === true` (loading state)

---

## 🎨 ESTADOS VISUALES

### Loading States

```tsx
// Economy Overview
{economyLoading && (
  <Loader2 className="animate-spin" />
)}

// Top Students
{studentsLoading && (
  <div>
    <Loader2 className="animate-spin" />
    <span>Cargando estudiantes...</span>
  </div>
)}

// Achievements
{achievementsLoading && (
  <Loader2 className="animate-spin" />
)}
```

### Error States

```tsx
// Error banners en la parte superior
{economyError && (
  <div className="bg-red-50 border-l-4 border-red-400">
    <AlertCircle />
    <p>Error al cargar economía: {economyError.message}</p>
    <button onClick={refetchEconomy}>Reintentar</button>
  </div>
)}
```

### Empty States

```tsx
// No students
{!studentsLoading && students.length === 0 && (
  <div className="text-center">
    <Users className="w-12 h-12 opacity-50" />
    <p>No hay estudiantes para mostrar</p>
  </div>
)}

// No achievements
{!achievementsLoading && achievements.length === 0 && (
  <div className="text-center">
    <Trophy className="w-12 h-12 opacity-50" />
    <p>No hay logros disponibles</p>
  </div>
)}
```

---

## 📋 TIPOS TYPESCRIPT

### StudentEconomyData

```typescript
interface StudentEconomyData {
  id: string;
  name: string;
  balance: number;
  earned_this_week: number;
  spent_this_week: number;
  rank: string;
  level: number;
}
```

### ClassEconomyStats

```typescript
interface ClassEconomyStats {
  total_circulation: number;
  average_balance: number;
  total_earned_today: number;
  total_spent_today: number;
  inflation_rate: number;
  wealth_distribution: {
    top_10_percent: number;
    bottom_50_percent: number;
  };
}
```

### GrantBonusRequest

```typescript
interface GrantBonusRequest {
  amount: number;        // 1-1000
  reason: string;        // min 10 chars
}
```

### GrantBonusResponse

```typescript
interface GrantBonusResponse {
  amountGranted: number;
  newBalance: number;
  previousBalance: number;
  reason: string;
  grantedAt: string;
}
```

---

## 🔗 ENLACES RÁPIDOS

| Recurso | Ruta |
|---------|------|
| **Componente** | `/apps/frontend/src/apps/teacher/pages/TeacherGamification.tsx` |
| **Hook Grant Bonus** | `/apps/frontend/src/apps/teacher/hooks/useGrantBonus.ts` |
| **Hook Economy** | `/apps/frontend/src/apps/teacher/hooks/useEconomyAnalytics.ts` |
| **Hook Students** | `/apps/frontend/src/apps/teacher/hooks/useStudentsEconomy.ts` |
| **Hook Achievements** | `/apps/frontend/src/apps/teacher/hooks/useAchievementsStats.ts` |
| **API Teacher** | `/apps/frontend/src/services/api/teacher/` |

---

## 💡 TIPS DE USO

### Para Teachers:

1. **Actualizar datos**: Usa el botón de refresh en la esquina superior derecha
2. **Otorgar bonus rápido**: Haz clic en "Dar Bonus" junto a cada estudiante en el leaderboard
3. **Ver balance actualizado**: Después de otorgar bonus, el balance se actualiza automáticamente
4. **Razones comunes**: "Participación excepcional", "Ayuda a compañeros", "Mejora notable"

### Para Desarrolladores:

1. **Agregar filtro por classroom**: Pasar `classroomId` a los hooks
2. **Agregar paginación**: Modificar `useStudentsEconomy` para aceptar `page` y `limit`
3. **Agregar websockets**: Suscribirse a eventos de economía para actualización en tiempo real
4. **Exportar stats**: Agregar botón que llame a endpoint `/teacher/analytics/economy/export`

---

## 🚀 PRÓXIMAS FUNCIONALIDADES

1. **Personalización de Recompensas**
   - Permitir a teachers ajustar recompensas dentro de límites del admin
   - Endpoint: `/teacher/rewards/customize`

2. **Logros Personalizados**
   - Crear achievements específicos para el aula
   - Endpoint: `/teacher/achievements/custom`

3. **Reportes Avanzados**
   - Gráficas de tendencias
   - Exportación a PDF/CSV
   - Endpoint: `/teacher/analytics/advanced`

---

**Versión:** 2.0.0
**Última actualización:** 2025-11-24
