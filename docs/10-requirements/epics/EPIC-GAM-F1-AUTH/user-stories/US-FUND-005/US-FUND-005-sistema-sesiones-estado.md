---
id: "US-FUND-005"
title: "Sistema de sesiones y estado"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-001"
story_points: 6
budget: "$2,200 MXN"
sprint: "Sprint-1"
labels: ["auth", "sessions", "refresh-tokens", "zustand", "state"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
completed_date: "2025-08-10"
---

# US-FUND-005: Sistema de sesiones y estado

**Épica:** EAI-001 - Fundamentos
**Sprint:** Mes 1, Semana 1-2
**Story Points:** 6 SP
**Presupuesto:** $2,200 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done

---

## Descripción

Como **usuario de la plataforma**, quiero **que mi sesión persista automáticamente** para **no tener que iniciar sesión cada vez que recargo la página o vuelvo a la aplicación**.

**Contexto del Alcance Inicial:**
El MVP implementa un sistema robusto de manejo de sesiones con refresh tokens, persistencia en localStorage, y estado global sincronizado con Zustand. Esto mejora significativamente la experiencia del usuario al mantener la sesión activa de manera segura.

---

## Criterios de Aceptación

- [ ] **CA-01:** El token JWT se almacena en localStorage al iniciar sesión
- [ ] **CA-02:** Al recargar la página, la sesión se restaura automáticamente si el token es válido
- [ ] **CA-03:** Se implementan refresh tokens para renovar la sesión sin re-login
- [ ] **CA-04:** Los refresh tokens tienen validez de 7 días
- [ ] **CA-05:** Los access tokens se renuevan automáticamente antes de expirar
- [ ] **CA-06:** Al cerrar sesión, se eliminan todos los tokens de localStorage
- [ ] **CA-07:** El estado global (Zustand) se sincroniza con el estado de autenticación
- [ ] **CA-08:** Se maneja la expiración de refresh tokens (redirige a login)
- [ ] **CA-09:** Las peticiones fallidas por token expirado se reintentan automáticamente tras renovar
- [ ] **CA-10:** El sistema detecta múltiples pestañas y sincroniza el estado de sesión

---

## Especificaciones Técnicas

### Backend (NestJS)

**Nuevos Endpoints:**
```
POST /api/auth/refresh
- Body: { refreshToken: string }
- Response: { accessToken: string, refreshToken: string }

POST /api/auth/logout
- Headers: Authorization: Bearer {token}
- Body: { refreshToken: string }
- Response: { message: "Logged out successfully" }
```

**Entidades Actualizadas:**
```typescript
@Entity('refresh_tokens')
class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column()
  userId: string

  @Column({ unique: true })
  token: string

  @Column()
  expiresAt: Date

  @Column({ default: false })
  revoked: boolean

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
```

**Servicios Actualizados:**
```typescript
// auth.service.ts
class AuthService {
  async login(email, password): Promise<LoginResponse> {
    // ... validación de credenciales
    const accessToken = this.generateAccessToken(user)
    const refreshToken = await this.generateRefreshToken(user)
    return { accessToken, refreshToken, user }
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const tokenRecord = await this.validateRefreshToken(refreshToken)
    if (!tokenRecord) throw new UnauthorizedException()

    await this.revokeRefreshToken(tokenRecord.id)

    const newAccessToken = this.generateAccessToken(tokenRecord.user)
    const newRefreshToken = await this.generateRefreshToken(tokenRecord.user)

    return { accessToken: newAccessToken, refreshToken: newRefreshToken }
  }

  private generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: '15m' } // Access token corto
    )
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const token = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 días

    await this.refreshTokensRepository.save({
      userId: user.id,
      token,
      expiresAt
    })

    return token
  }
}
```

### Frontend (React + Vite)

**Auth Store Mejorado (Zustand):**
```typescript
// store/auth.store.ts
interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  restoreSession: () => Promise<void>

  // Internal setters
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
}

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        const response = await authService.login(email, password)
        set({
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true
        })
      },

      logout: async () => {
        const { refreshToken } = get()
        if (refreshToken) {
          await authService.logout(refreshToken)
        }
        get().clearAuth()
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) throw new Error('No refresh token')

        const response = await authService.refreshTokens(refreshToken)
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken
        })
      },

      restoreSession: async () => {
        set({ isLoading: true })
        const { accessToken, refreshToken } = get()

        if (!accessToken || !refreshToken) {
          set({ isLoading: false })
          return
        }

        try {
          // Intentar obtener usuario actual
          const user = await authService.getCurrentUser()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (error) {
          // Token expirado, intentar refresh
          try {
            await get().refreshAccessToken()
            const user = await authService.getCurrentUser()
            set({ user, isAuthenticated: true, isLoading: false })
          } catch {
            get().clearAuth()
            set({ isLoading: false })
          }
        }
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },

      setUser: (user) => {
        set({ user })
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false
        })
      }
    }),
    {
      name: 'gamilit-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user
      })
    }
  )
)
```

**Axios Interceptor con Auto-Refresh:**
```typescript
// services/api.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// Request interceptor: agregar token
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

// Response interceptor: manejar 401 y refrescar token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        await useAuthStore.getState().refreshAccessToken()

        const { accessToken } = useAuthStore.getState()
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)
```

**App Initialization:**
```typescript
// App.tsx
function App() {
  const restoreSession = useAuthStore(state => state.restoreSession)
  const isLoading = useAuthStore(state => state.isLoading)

  useEffect(() => {
    restoreSession()
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <Router>
      {/* ... routes */}
    </Router>
  )
}
```

**Sincronización entre Pestañas:**
```typescript
// hooks/useCrossTabSync.ts
export function useCrossTabSync() {
  const clearAuth = useAuthStore(state => state.clearAuth)

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gamilit-auth' && e.newValue === null) {
        // Sesión cerrada en otra pestaña
        clearAuth()
        window.location.href = '/login'
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [clearAuth])
}
```

---

## Dependencias

**Antes:**
- US-FUND-001 (Autenticación básica)
- US-FUND-004 (Infraestructura)

**Después:**
- Mejora la UX de todas las historias que requieren autenticación

---

## Definición de Hecho (DoD)

- [x] Refresh tokens implementados en backend
- [x] Tabla de refresh_tokens creada (migración)
- [x] Endpoints de refresh y logout funcionando
- [x] Zustand store con persistencia configurado
- [x] Axios interceptors para auto-refresh
- [x] Restauración de sesión al cargar app
- [x] Sincronización entre pestañas
- [x] Tests unitarios (>80% coverage)
- [x] Tests E2E para flujos de sesión
- [x] Manejo de tokens expirados
- [x] Documentación actualizada

---

## Notas del Alcance Inicial

- ✅ Refresh tokens con validez de 7 días
- ✅ Access tokens cortos (15 minutos)
- ✅ Auto-refresh transparente al usuario
- ✅ Sincronización básica entre pestañas
- ✅ Sin "Remember me" (siempre se recuerda por 7 días)
- ⚠️ **Extensión futura:** EXT-010-Security (dispositivos confiables, logout remoto)
- ⚠️ **Extensión futura:** EXT-011-Sessions (gestión de sesiones activas)

---

## Testing

### Tests Unitarios
```typescript
describe('AuthService - Refresh Tokens', () => {
  it('should generate refresh token on login')
  it('should refresh access token with valid refresh token')
  it('should revoke old refresh token on refresh')
  it('should reject expired refresh token')
  it('should revoke refresh token on logout')
})

describe('AuthStore', () => {
  it('should persist tokens to localStorage')
  it('should restore session on app load')
  it('should clear auth on logout')
  it('should refresh token automatically')
})
```

### Tests E2E
```typescript
describe('Session Management', () => {
  it('should maintain session after page reload')
  it('should auto-refresh expired access token')
  it('should logout when refresh token expires')
  it('should sync logout across tabs')
  it('should handle concurrent refresh requests')
})
```

---

## Estimación

**Desglose de Esfuerzo (6 SP = ~2 días):**
- Backend: refresh token logic: 0.75 días
- Frontend: Zustand persistence: 0.5 días
- Axios interceptors: 0.25 días
- Restauración de sesión: 0.25 días
- Testing: 0.5 días
- Cross-tab sync: 0.25 días

**Riesgos:**
- Race conditions en refresh concurrentes
- Edge cases en sincronización de pestañas

---

**Creado:** 2025-11-02
**Actualizado:** 2025-11-02
**Responsable:** Equipo Fullstack
