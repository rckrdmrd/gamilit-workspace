# US-GAM-007: Leaderboard simple

**Épica:** EAI-003 - Gamificación Básica
**Sprint:** Mes 1, Semana 4
**Story Points:** 8 SP
**Presupuesto:** $2,900 MXN
**Prioridad:** Media (Alcance Inicial)
**Estado:** ✅ Completada (Mes 1)

---

## Descripción

Como **estudiante**, quiero **ver una tabla de clasificación** para **compararme con otros estudiantes y sentirme motivado a mejorar**.

**Contexto del Alcance Inicial:**
Leaderboard básico global por XP. Top 10 estudiantes. SIN filtros avanzados (por escuela, amigos, tiempo). SIN comparativas personalizadas.

---

## Criterios de Aceptación

- [ ] **CA-01:** Muestra top 10 estudiantes por XP total
- [ ] **CA-02:** Se actualiza en tiempo real (o cada 5 minutos)
- [ ] **CA-03:** Muestra: posición, nombre, XP, rango
- [ ] **CA-04:** Resalta posición del usuario actual
- [ ] **CA-05:** Si el usuario no está en top 10, muestra su posición debajo
- [ ] **CA-06:** Accesible desde navbar
- [ ] **CA-07:** Responsive design

---

## Especificaciones Técnicas

### Backend

```typescript
class LeaderboardService {
  async getGlobalLeaderboard(limit = 10) {
    const topUsers = await this.usersRepository.find({
      select: ['id', 'firstName', 'lastName', 'totalXP', 'currentRank', 'photoUrl'],
      order: { totalXP: 'DESC' },
      take: limit
    })

    return topUsers.map((user, index) => ({
      position: index + 1,
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      xp: user.totalXP,
      rank: user.currentRank,
      photoUrl: user.photoUrl
    }))
  }

  async getUserPosition(userId: string) {
    // Query para obtener posición exacta
    const result = await this.usersRepository
      .createQueryBuilder('user')
      .select('COUNT(*) + 1', 'position')
      .where('user.totalXP > (SELECT totalXP FROM users WHERE id = :userId)', { userId })
      .getRawOne()

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'firstName', 'lastName', 'totalXP', 'currentRank', 'photoUrl']
    })

    return {
      position: parseInt(result.position),
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      xp: user.totalXP,
      rank: user.currentRank,
      photoUrl: user.photoUrl
    }
  }

  async getLeaderboardWithUser(userId: string, limit = 10) {
    const topUsers = await this.getGlobalLeaderboard(limit)
    const userInTop = topUsers.find(u => u.userId === userId)

    if (userInTop) {
      return {
        topUsers,
        currentUser: userInTop
      }
    }

    // Si no está en top, obtener su posición
    const userPosition = await this.getUserPosition(userId)

    return {
      topUsers,
      currentUser: userPosition
    }
  }
}
```

**Endpoints:**
```
GET /api/leaderboard
- Response: {
    topUsers: [
      { position, userId, name, xp, rank, photoUrl }
    ],
    currentUser: { position, userId, name, xp, rank }
  }

GET /api/leaderboard/position/:userId
- Response: { position, xp, totalUsers }
```

**Caching (opcional para performance):**
```typescript
// Cachear leaderboard por 5 minutos
@CacheKey('leaderboard:global')
@CacheTTL(300)
async getGlobalLeaderboard() { ... }
```

### Frontend

```typescript
// pages/LeaderboardPage.tsx
export function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState(null)
  const userId = useAuthStore(state => state.user?.id)

  useEffect(() => {
    loadLeaderboard()
    // Refrescar cada 30 segundos
    const interval = setInterval(loadLeaderboard, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadLeaderboard = async () => {
    const data = await leaderboardService.getLeaderboard()
    setLeaderboard(data)
  }

  if (!leaderboard) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🏆 Tabla de Clasificación
      </h1>

      <Card>
        <div className="space-y-2">
          {leaderboard.topUsers.map((user, index) => (
            <LeaderboardRow
              key={user.userId}
              {...user}
              isCurrentUser={user.userId === userId}
              medal={index < 3 ? ['🥇', '🥈', '🥉'][index] : null}
            />
          ))}
        </div>

        {/* Usuario actual si no está en top 10 */}
        {leaderboard.currentUser.position > 10 && (
          <>
            <div className="my-4 border-t border-gray-300 relative">
              <span className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 bg-white px-2 text-sm text-gray-500">
                Tu posición
              </span>
            </div>

            <LeaderboardRow
              {...leaderboard.currentUser}
              isCurrentUser={true}
            />
          </>
        )}
      </Card>

      <p className="text-center text-sm text-gray-500 mt-4">
        Actualizado hace {getTimeSinceUpdate()}
      </p>
    </div>
  )
}

// components/leaderboard/LeaderboardRow.tsx
interface LeaderboardRowProps {
  position: number
  name: string
  xp: number
  rank: string
  photoUrl?: string
  medal?: string
  isCurrentUser: boolean
}

export function LeaderboardRow({
  position,
  name,
  xp,
  rank,
  photoUrl,
  medal,
  isCurrentUser
}: LeaderboardRowProps) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
      isCurrentUser
        ? 'bg-maya-green-50 border-2 border-maya-green-300 shadow-md'
        : 'bg-white hover:bg-gray-50'
    }`}>
      {/* Posición */}
      <div className="w-12 text-center">
        {medal ? (
          <span className="text-3xl">{medal}</span>
        ) : (
          <span className="text-xl font-bold text-gray-500">#{position}</span>
        )}
      </div>

      {/* Avatar */}
      <img
        src={photoUrl || '/default-avatar.png'}
        alt={name}
        className="w-12 h-12 rounded-full border-2 border-gray-300"
      />

      {/* Info */}
      <div className="flex-1">
        <p className={`font-semibold ${isCurrentUser ? 'text-maya-green-700' : 'text-gray-900'}`}>
          {name} {isCurrentUser && '(Tú)'}
        </p>
        <p className="text-sm text-gray-600 capitalize">
          {rank}
        </p>
      </div>

      {/* XP */}
      <div className="text-right">
        <p className="text-xl font-bold text-yellow-600">
          {xp.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500">XP</p>
      </div>
    </div>
  )
}
```

---

## Dependencias

**Antes:**
- US-GAM-002 (Sistema XP)
- US-GAM-001 (Rangos)

---

## Definición de Hecho (DoD)

- [x] Top 10 por XP funcional
- [x] Posición del usuario mostrada
- [x] Auto-refresh cada 30s
- [x] Responsive design
- [x] Medallas para top 3
- [x] Tests

---

## Notas del Alcance Inicial

- ✅ Leaderboard global simple
- ✅ Solo por XP
- ✅ Sin filtros (escuela, amigos, tiempo)
- ✅ Sin paginación (solo top 10)
- ✅ Sin comparativas avanzadas
- ⚠️ **Extensión futura:** EXT-028-AdvancedLeaderboards (filtros, múltiples categorías, ligas)

---

## Testing

```typescript
describe('LeaderboardService', () => {
  it('should return top 10 users by XP')
  it('should return user position if not in top 10')
  it('should handle ties in XP')
  it('should return correct position for user')
})
```

---

## Estimación

**Desglose de Esfuerzo (8 SP = ~3 días):**
- Backend: query optimizado: 1 día
- Frontend: componentes: 1.5 días
- Auto-refresh: 0.25 días
- Testing: 0.25 días

**Riesgos:**
- Queries pueden ser lentos con muchos usuarios (optimizar con índices)

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Fullstack
