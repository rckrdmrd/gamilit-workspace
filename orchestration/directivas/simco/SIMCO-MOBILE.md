# SIMCO: OPERACIONES MOBILE (React Native/TypeScript)

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** Todo agente que trabaje con código móvil React Native
**Prioridad:** OBLIGATORIA para operaciones mobile

---

## RESUMEN EJECUTIVO

> **Types alineados + Store configurado + Componentes optimizados + Navegación funcional = Mobile completo.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║  MOBILE-FIRST PERFORMANCE                                            ║
║                                                                       ║
║  • Componentes optimizados (memoización)                             ║
║  • Listas virtualizadas (FlatList)                                   ║
║  • Imágenes optimizadas                                              ║
║  • Offline-first cuando aplique                                      ║
║  • Navegación fluida (<16ms por frame)                               ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## ESTRUCTURA DE PROYECTO

```
mobile/
├── src/
│   ├── app/                          # Entry point y configuración
│   │   ├── App.tsx                   # Root component
│   │   ├── providers/
│   │   │   ├── index.tsx             # Provider composer
│   │   │   ├── QueryProvider.tsx     # TanStack Query
│   │   │   └── ThemeProvider.tsx
│   │   └── linking.ts                # Deep linking config
│   ├── screens/                      # Pantallas
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   └── {module}/
│   │       ├── {Module}Screen.tsx
│   │       └── {Module}DetailScreen.tsx
│   ├── components/                   # Componentes
│   │   ├── common/                   # Compartidos
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   ├── forms/
│   │   │   └── FormField.tsx
│   │   └── {module}/
│   │       └── {Component}.tsx
│   ├── navigation/                   # Navegación
│   │   ├── RootNavigator.tsx         # Navigator principal
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts                  # Navigation types
│   ├── hooks/                        # Hooks personalizados
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── use{Module}.ts
│   ├── services/                     # API services
│   │   ├── api.ts                    # Axios instance
│   │   ├── auth.service.ts
│   │   └── {module}.service.ts
│   ├── stores/                       # State management
│   │   ├── auth.store.ts
│   │   └── {module}.store.ts
│   ├── types/                        # TypeScript types
│   │   ├── index.ts
│   │   ├── api.types.ts
│   │   └── {module}.types.ts
│   ├── utils/                        # Utilidades
│   │   ├── storage.ts                # AsyncStorage helpers
│   │   ├── validation.ts
│   │   └── formatting.ts
│   ├── constants/                    # Constantes
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── config.ts
│   └── theme/                        # Tema global
│       ├── index.ts
│       ├── colors.ts
│       └── typography.ts
├── android/                          # Proyecto Android nativo
├── ios/                              # Proyecto iOS nativo
├── __tests__/
├── app.json
├── metro.config.js
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## CONVENCIONES DE NOMENCLATURA

### Archivos
```typescript
// Screens: PascalCase + Screen suffix
HomeScreen.tsx
ProductDetailScreen.tsx
UserProfileScreen.tsx

// Components: PascalCase
Button.tsx
ProductCard.tsx
UserAvatar.tsx

// Hooks: camelCase con prefijo use
useAuth.ts
useProducts.ts
useNavigation.ts

// Services: camelCase + .service suffix
auth.service.ts
products.service.ts

// Stores: camelCase + .store suffix
auth.store.ts
cart.store.ts

// Types: camelCase + .types suffix
user.types.ts
product.types.ts
```

### Clases y Tipos
```typescript
// Interfaces: PascalCase con prefijo I (opcional)
interface User {}
interface IAuthState {}

// Types: PascalCase
type NavigationProps = {}
type ThemeColors = {}

// Enums: PascalCase
enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}
```

### Funciones y Variables
```typescript
// Componentes: PascalCase
const ProductCard: React.FC<Props> = () => {}

// Funciones: camelCase con verbo
const fetchProducts = async () => {}
const handleSubmit = () => {}
const formatPrice = (price: number) => {}

// Variables: camelCase
const isLoading = true
const productList = []
const currentUser = null

// Constantes: UPPER_SNAKE_CASE
const API_URL = ''
const MAX_ITEMS = 50
```

---

## TEMPLATES

### Screen Component

```typescript
// screens/{module}/{Module}Screen.tsx
import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '@/navigation/types';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard, Loading, EmptyState } from '@/components';
import { Product } from '@/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Products'>;

/**
 * ProductsScreen - Lista de productos
 *
 * Muestra productos con pull-to-refresh y navegación a detalle.
 */
export const ProductsScreen: React.FC<Props> = ({ navigation }) => {
  const { products, isLoading, isRefreshing, refresh } = useProducts();

  const handleProductPress = useCallback((product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
    />
  ), [handleProductPress]);

  const keyExtractor = useCallback((item: Product) => item.id, []);

  const ListEmptyComponent = useMemo(() => (
    <EmptyState
      title="No hay productos"
      message="Intenta de nuevo más tarde"
    />
  ), []);

  if (isLoading && !products.length) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
          />
        }
        // Optimizaciones de rendimiento
        removeClippedSubviews
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={10}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const ITEM_HEIGHT = 120;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
    gap: 12,
  },
});
```

### Component (Reusable)

```typescript
// components/common/Button.tsx
import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Button - Botón reutilizable
 *
 * @example
 * <Button
 *   title="Submit"
 *   onPress={handleSubmit}
 *   variant="primary"
 *   loading={isSubmitting}
 * />
 */
export const Button = memo<ButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary : colors.white}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
```

### Navigation Setup

```typescript
// navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuthStore } from '@/stores/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { RootStackParamList } from './types';
import { linking } from '@/app/linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// navigation/types.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ProductDetail: { productId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

### Store (Zustand)

```typescript
// stores/auth.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/services/auth.service';
import { User, LoginDto, RegisterDto } from '@/types';

interface AuthState {
  // State
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            token: response.token,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(data);
          set({
            token: response.token,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      refreshUser: async () => {
        const { token } = get();
        if (!token) return;

        try {
          const user = await authService.getProfile();
          set({ user });
        } catch {
          // Token might be expired
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### API Service

```typescript
// services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { API_URL } from '@/constants/config';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;

// services/products.service.ts
import api from './api';
import { Product, CreateProductDto } from '@/types';

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get('/products');
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  create: async (dto: CreateProductDto): Promise<Product> => {
    const { data } = await api.post('/products', dto);
    return data;
  },

  update: async (id: string, dto: Partial<CreateProductDto>): Promise<Product> => {
    const { data } = await api.put(`/products/${id}`, dto);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
```

### Custom Hook

```typescript
// hooks/useProducts.ts
import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import { Product, CreateProductDto } from '@/types';

export const useProducts = () => {
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['products'],
    queryFn: productsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateProductDto> }) =>
      productsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    products,
    isLoading,
    isRefreshing: isRefetching,
    refresh,
    createProduct: createMutation.mutateAsync,
    updateProduct: updateMutation.mutateAsync,
    deleteProduct: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsService.getById(id),
    enabled: !!id,
  });
};
```

---

## VALIDACIONES OBLIGATORIAS

```bash
# 1. TypeScript (OBLIGATORIO)
npx tsc --noEmit
# ✅ Sin errores de tipos

# 2. Lint (OBLIGATORIO)
npm run lint
# ✅ Sin errores

# 3. Tests
npm run test
# ✅ Deben pasar

# 4. iOS (Mac required)
cd ios && pod install && cd ..
npx react-native run-ios
# ✅ Debe compilar e iniciar

# 5. Android
npx react-native run-android
# ✅ Debe compilar e iniciar

# 6. Verificar en dispositivo/emulador
# ✅ Sin errores en consola
# ✅ Navegación funcional
# ✅ API responde
# ✅ Sin memory leaks
```

---

## OPTIMIZACIONES DE RENDIMIENTO

### FlatList Optimizada

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  // Optimizaciones críticas
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Memoización

```typescript
// Componentes con memo
export const ProductCard = memo<ProductCardProps>(({ product, onPress }) => {
  // ...
});

// useCallback para handlers
const handlePress = useCallback(() => {
  onPress(item);
}, [onPress, item]);

// useMemo para cálculos costosos
const sortedProducts = useMemo(() => {
  return [...products].sort((a, b) => a.price - b.price);
}, [products]);
```

### Imágenes Optimizadas

```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl, priority: FastImage.priority.normal }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>
```

---

## CHECKLIST MOBILE

```
SCREEN
├── [ ] SafeAreaView para notches
├── [ ] Manejo de loading state
├── [ ] Manejo de error state
├── [ ] Manejo de empty state
├── [ ] Pull-to-refresh si aplica
├── [ ] Keyboard avoiding si tiene inputs
└── [ ] TypeScript types correctos

COMPONENTE
├── [ ] memo() si recibe props estables
├── [ ] useCallback para handlers
├── [ ] StyleSheet fuera del componente
├── [ ] Props tipadas con interface
└── [ ] displayName para debugging

NAVEGACIÓN
├── [ ] Types para params definidos
├── [ ] Deep linking configurado si aplica
├── [ ] Back button handling
└── [ ] Transiciones fluidas

STORE
├── [ ] Persist configurado si necesario
├── [ ] Actions tipadas
├── [ ] Selectors optimizados
└── [ ] Reset on logout

API
├── [ ] Interceptors de auth
├── [ ] Manejo de 401
├── [ ] Timeout configurado
└── [ ] Error handling

VALIDACIÓN
├── [ ] TypeScript sin errores
├── [ ] Lint sin errores
├── [ ] iOS compila
├── [ ] Android compila
└── [ ] Tests pasan
```

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Re-renders excesivos | Callbacks inline | useCallback, memo |
| Lista lenta | FlatList sin optimizar | getItemLayout, windowSize |
| Memory leak | Subscriptions no limpias | Cleanup en useEffect |
| Keyboard cubre input | No KeyboardAvoidingView | Agregar wrapper |
| Flash en navigation | Estado inicial incorrecto | Hydration correcta |

---

## REFERENCIAS

- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Validar:** @VALIDAR (SIMCO-VALIDAR.md)
- **Backend:** @BACKEND (SIMCO-BACKEND.md)
- **Perfil Mobile:** @PERFILES/PERFIL-MOBILE-AGENT.md

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
