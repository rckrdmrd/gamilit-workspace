---
titulo: Error INT-005 Dual AuthProvider System con Comportamiento Inconsistente
tipo: guia
dominio: integracion
ultima_actualizacion: 2026-02-27
---

# ERR-INT-005: Dual AuthProvider System con Comportamiento Inconsistente

## Descripcion
El frontend tiene dos sistemas de autenticacion coexistiendo: un `AuthContext` completo (con gestion de tokens, refresh, roles, permisos) y un `AuthProvider` lightweight de feature (con estado minimo). Componentes diferentes usan diferentes providers, causando estados de autenticacion desincronizados y comportamiento inconsistente entre portales.

## Sintomas
- Login funciona en un portal (ej: estudiante) pero falla o muestra estado incorrecto en otro (ej: maestro)
- El token se refresca en un provider pero el otro sigue usando el token expirado
- `useAuth()` retorna `isAuthenticated: true` en un componente pero `false` en otro del mismo usuario
- Logout cierra sesion parcialmente: un provider limpia estado pero el otro mantiene el token
- Redireccion a login loop: un provider detecta sesion activa pero el otro no
- Roles y permisos disponibles en un contexto pero no en el otro

## Causa Raiz
1. Se creo `AuthContext` como sistema completo de autenticacion al inicio del proyecto
2. Posteriormente se agrego un `AuthProvider` lightweight para una feature especifica (ej: auth flow simplificado)
3. Ambos providers mantienen su propio estado interno independiente (tokens, user info, roles)
4. No se consolidaron porque diferentes componentes ya dependian de cada uno
5. No hay sincronizacion bidireccional entre los dos estados de autenticacion

## Solucion

### 1. Identificar ambos providers y sus consumidores
```bash
cd apps/frontend

# Encontrar definiciones de providers
grep -rn "createContext\|AuthContext\|AuthProvider" src/ --include="*.tsx" --include="*.ts" | \
  grep -v "node_modules\|\.test\.\|\.spec\."

# Contar consumidores de cada uno
echo "=== AuthContext consumers ==="
grep -rl "useAuth\b" src/ --include="*.tsx" --include="*.ts" | wc -l

echo "=== Feature AuthProvider consumers ==="
grep -rl "useAuthProvider\|useFeatureAuth" src/ --include="*.tsx" --include="*.ts" | wc -l
```

### 2. Mapear que funcionalidades ofrece cada uno
```typescript
// AuthContext (completo) - Tipicamente en src/contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  roles: string[];
  permissions: string[];
  tenantId: string | null;
}

// Feature AuthProvider (lightweight) - Tipicamente en src/providers/AuthProvider.tsx
interface FeatureAuthType {
  isLoggedIn: boolean;
  currentUser: User | null;
  signIn: (data: SignInData) => void;
  signOut: () => void;
}
```

### 3. Estrategia de consolidacion (recomendada)
```typescript
// OPCION A: El feature AuthProvider delega al AuthContext
// (Minimo cambio, maximo compatibilidad)

// src/providers/AuthProvider.tsx
export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  // En vez de mantener estado propio, usar AuthContext
  const authContext = useContext(AuthContext);

  // Adaptar la interfaz para consumidores existentes
  const value = useMemo(() => ({
    isLoggedIn: authContext.isAuthenticated,
    currentUser: authContext.user,
    signIn: authContext.login,
    signOut: authContext.logout,
  }), [authContext]);

  return (
    <FeatureAuthContext.Provider value={value}>
      {children}
    </FeatureAuthContext.Provider>
  );
};
```

### 4. Migracion gradual de consumidores
```typescript
// Paso 1: Deprecar el provider lightweight
/** @deprecated Use useAuth() from AuthContext instead */
export function useFeatureAuth() {
  console.warn('useFeatureAuth is deprecated. Use useAuth() from AuthContext.');
  return useContext(FeatureAuthContext);
}

// Paso 2: Migrar componentes uno por uno
// ANTES
import { useFeatureAuth } from '@/providers/AuthProvider';
const { isLoggedIn, currentUser } = useFeatureAuth();

// DESPUES
import { useAuth } from '@/contexts/AuthContext';
const { isAuthenticated, user } = useAuth();

// Paso 3: Eliminar el provider lightweight cuando no tenga consumidores
```

### 5. Verificar sincronizacion post-consolidacion
```typescript
// Test de integracion: verificar que ambos hooks retornan el mismo estado
describe('Auth State Consistency', () => {
  it('should have consistent auth state across providers', () => {
    // Login via AuthContext
    const { result: authResult } = renderHook(() => useAuth());
    act(() => authResult.current.login(credentials));

    // Verify feature auth also reflects login
    const { result: featureResult } = renderHook(() => useFeatureAuth());
    expect(featureResult.current.isLoggedIn).toBe(true);
    expect(featureResult.current.currentUser).toEqual(authResult.current.user);
  });
});
```

## Prevencion

1. **Single source of truth**: Mantener UN solo AuthContext como fuente autoritativa de estado de autenticacion
2. **Adapters over duplicates**: Si un componente necesita interfaz diferente, crear adapter hook que delegue al AuthContext
3. **Auth state in Zustand**: Considerar mover estado de auth a un store Zustand para acceso global sin context nesting
4. **Documentar decision**: Registrar en ADR la decision de cual provider es canonico

### Checklist de auth state:
- [ ] Solo UN AuthContext define y mantiene tokens, user, roles
- [ ] Todo hook de auth (`useAuth`, `usePermissions`, etc.) lee del mismo contexto
- [ ] Login/Logout actualizan UN solo estado central
- [ ] Token refresh ocurre en UN solo lugar
- [ ] Todos los portales (estudiante, maestro, admin, padres) usan el mismo provider
- [ ] No hay estado de auth duplicado en Zustand stores

### Verificacion automatica
```bash
cd apps/frontend

# Verificar que no haya multiples AuthContext definitions
contexts=$(grep -rl "createContext.*Auth\|AuthContext" src/ --include="*.tsx" --include="*.ts" | \
  grep -v "node_modules\|test\|spec\|mock")
count=$(echo "$contexts" | wc -l)
if [ "$count" -gt 1 ]; then
  echo "ALERTA: $count definiciones de AuthContext encontradas:"
  echo "$contexts"
fi
```

## Ocurrencias

| Fecha | Provider | Problema | Portal Afectado | Estado |
|-------|----------|----------|-----------------|--------|
| 2026-02-13 | Dual (AuthContext + AuthProvider) | Estado desincronizado entre portales | Todos | Documentado |
| 2026-01-30 | Feature AuthProvider | Token expirado no detectado | Maestro | Resuelto (workaround) |
| 2026-01-20 | AuthContext | Logout no limpia feature provider | Estudiante | Resuelto (workaround) |

## Referencias

- **AuthContext:** `apps/frontend/src/contexts/AuthContext.tsx`
- **Feature AuthProvider:** `apps/frontend/src/providers/AuthProvider.tsx` (verificar ubicacion exacta)
- **Inventario Frontend:** `orchestration/inventarios/FRONTEND_INVENTORY.yml`
- **MEMORY.md:** "Dual AuthProvider system: AuthContext (full) + feature AuthProvider (lightweight)"
- **ADR de referencia:** `docs/90-adr/` (pendiente crear ADR para decision de consolidacion)

---

**Severidad:** Alta
**Frecuencia:** Conocido (issue persistente)
**Tiempo de resolucion:** 2-4 horas (consolidacion completa)
**Ultimo update:** 2026-02-13
