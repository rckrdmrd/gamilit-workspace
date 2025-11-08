# Sistema de Estados - Frontend GAMILIT Platform v2

**Proyecto:** GAMILIT Platform v2
**Fecha:** 2025-10-27
**State Management:** Zustand v4.4.7
**Total de Stores:** 11

---

## Índice de Stores por Dominio

### [Stores de Autenticación](./Estados-Auth.md) (3 stores)

**Dominio:** Gestión de usuarios y sesiones

1. **authStore** (PERSISTENTE) - Autenticación y sesiones de usuario
2. **userStore** - Perfil y configuración de usuario
3. **sessionStore** - Gestión de sesiones y timeouts

### [Stores de Gamificación](./Estados-Gamificacion.md) (6 stores)

**Dominio:** Sistema completo de gamificación

1. **economyStore** (PERSISTENTE) - ML Coins, transacciones, inventario
2. **ranksStore** - Rangos Maya, XP, multiplicadores
3. **achievementsStore** - Logros y badges
4. **missionsStore** - Misiones diarias/semanales
5. **leaderboardsStore** - Rankings y posiciones
6. **powerUpsStore** - PowerUps y cooldowns

### [Stores de Contenido Educativo](./Estados-Educational.md) (3 stores)

**Dominio:** Módulos, ejercicios y progreso académico

1. **moduleStore** - Módulos educativos
2. **exerciseStore** - Ejercicios y mecánicas
3. **progressStore** - Progreso de aprendizaje

### [Stores de UI y Notificaciones](./Estados-UI.md) (2 stores)

**Dominio:** Interfaz de usuario y comunicaciones

1. **notificationsStore** - Notificaciones en tiempo real
2. **uiStore** - Estado de UI global

---

## Arquitectura General

```
┌────────────────────────────────────────────────────────────────┐
│                    ZUSTAND STATE ECOSYSTEM                      │
└────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  authStore (PERSISTENT)                                          │
│  - user, token, isAuthenticated, sessionExpiresAt               │
│  - Persisted in localStorage                                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ userId
                      │
        ┌─────────────┼─────────────────────┬──────────────┐
        │             │                     │              │
        ▼             ▼                     ▼              ▼
┌───────────┐  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│economyStore│  │ ranksStore  │  │missionsStore │  │achievements  │
│(PERSISTENT)│  │             │  │              │  │Store         │
└───────────┘  └─────────────┘  └──────────────┘  └──────────────┘
        │
        │ coins, inventory
        │
        ▼
┌──────────────────────────────────────────────────┐
│            SOCIAL LAYER                           │
├──────────────────────────────────────────────────┤
│  guildsStore | friendsStore | leaderboardsStore  │
│  powerUpsStore                                   │
└──────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────┐
│            COMMUNICATION LAYER                    │
├──────────────────────────────────────────────────┤
│  notificationsStore                              │
└──────────────────────────────────────────────────┘
```

---

## Características del Sistema

- **Zustand**: Lightweight y performante
- **TypeScript**: Type-safe al 100%
- **Persistencia Selectiva**: Solo datos críticos
- **Modular**: Stores por dominio
- **DevTools Ready**: Compatible con Redux DevTools
- **Middleware**: persist, devtools

---

## Stores Persistentes vs Volátiles

| Store | Persistencia | Razón |
|-------|--------------|-------|
| **authStore** | ✅ Sí | Mantener sesión activa |
| **economyStore** | ✅ Sí | Caché de balance e inventario |
| **ranksStore** | ❌ No | Datos volátiles, se recalculan |
| **achievementsStore** | ❌ No | Datos del servidor |
| **missionsStore** | ❌ No | Cambian diariamente |
| **guildsStore** | ❌ No | Datos colaborativos |
| **friendsStore** | ❌ No | Datos sociales |
| **leaderboardsStore** | ❌ No | Rankings en tiempo real |
| **powerUpsStore** | ❌ No | Cooldowns del servidor |
| **notificationsStore** | ❌ No | Notificaciones efímeras |

---

## Patrones de Uso

### Selección Granular

```typescript
// ❌ MAL: Selecciona todo el estado
const state = useAuthStore();

// ✅ BIEN: Selecciona solo lo necesario
const user = useAuthStore((state) => state.user);
const login = useAuthStore((state) => state.login);
```

### Acciones Asíncronas

```typescript
// Pattern para acciones asíncronas
someAction: async (param) => {
  set({ isLoading: true, error: null });

  try {
    const result = await api.someCall(param);
    set({ data: result, isLoading: false });
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
},
```

### Comunicación entre Stores

```typescript
// Store A llama a Store B
purchaseItem: async (itemId) => {
  const item = await shopAPI.purchase(itemId);

  // Actualizar economyStore
  useEconomyStore.getState().spendCoins(item.price, item.name);

  // Actualizar inventory
  set((state) => ({
    inventory: [...state.inventory, item],
  }));
},
```

---

## Mejores Prácticas

1. **State Shape clara**: Definir interface antes de implementación
2. **Acciones agrupadas**: Organizar por dominio
3. **Error handling**: Siempre manejar errores en acciones async
4. **Loading states**: Indicar estados de carga
5. **TypeScript**: Tipar todo explícitamente

---

## Navegación Rápida

- **Autenticación y sesiones:** Ver [Estados-Auth.md](./Estados-Auth.md)
- **Sistema de economía y rangos:** Ver [Estados-Gamificacion.md](./Estados-Gamificacion.md)
- **Módulos y progreso educativo:** Ver [Estados-Educational.md](./Estados-Educational.md)
- **Notificaciones y UI:** Ver [Estados-UI.md](./Estados-UI.md)

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
**Mantenedor:** Equipo GAMILIT
