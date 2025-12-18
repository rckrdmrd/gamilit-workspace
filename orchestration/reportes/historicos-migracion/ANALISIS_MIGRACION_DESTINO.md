# ANÁLISIS DE MIGRACIÓN - PROYECTO DESTINO

**Fecha:** 2025-11-02
**Proyecto Origen:** `/home/isem/workspace/workspace-gamilit/projects/gamilit-platform-web`
**Proyecto Destino:** `/home/isem/workspace/workspace-gamilit/projects/gamilit` (DEBE CREARSE)

---

## ESTADO ACTUAL

| Aspecto | Estado |
|--------|--------|
| Proyecto Destino | **NO EXISTE** |
| Ruta | `/home/isem/workspace/workspace-gamilit/projects/gamilit/` |
| Acción Requerida | **Crear proyecto desde cero** |

---

## COMPONENTES A MIGRAR

### OBLIGATORIOS (Críticos - Sin estos no funciona)

#### 1. Archivos Raíz del Proyecto
```
gamilit/
├── package.json               [COPIAR]
├── package-lock.json          [COPIAR]
├── vite.config.ts             [COPIAR]
├── vitest.config.ts           [COPIAR]
├── tsconfig.json              [COPIAR]
├── tsconfig.node.json         [COPIAR]
├── tailwind.config.js         [COPIAR]
├── postcss.config.js          [COPIAR]
├── .eslintrc.json             [COPIAR]
├── .prettierrc                [COPIAR]
├── .gitignore                 [COPIAR]
├── .nvmrc                     [COPIAR]
├── index.html                 [COPIAR]
├── Dockerfile                 [COPIAR]
├── nginx.conf                 [COPIAR]
├── README.md                  [COPIAR]
└── .env.example               [COPIAR]
```

#### 2. Código Fuente - Entrada
```
src/
├── main.tsx                   [COPIAR] - Punto de entrada
├── App.tsx                    [COPIAR] - Router principal
├── AppDemo.tsx                [COPIAR] - Demo version
├── vite-env.d.ts              [COPIAR] - Tipos Vite
└── test/setup.ts              [COPIAR] - Config tests
```

#### 3. Features CRÍTICAS
```
src/features/
├── auth/                      [COPIAR COMPLETO] - 30 archivos
│   ├── api/
│   ├── store/
│   ├── hooks/
│   ├── components/
│   ├── providers/
│   ├── schemas/
│   ├── types/
│   ├── mocks/
│   ├── examples/
│   └── __tests__/
│
├── mechanics/                 [COPIAR COMPLETO] - 33 ejercicios
│   ├── module1/ (7 ejercicios)
│   ├── module2/ (5 ejercicios)
│   ├── module3/ (5 ejercicios)
│   ├── module4/ (9 ejercicios)
│   ├── module5/ (3 ejercicios)
│   ├── auxiliar/ (4 ejercicios)
│   └── shared/
│
├── gamification/              [COPIAR COMPLETO] - 132 archivos
│   ├── economy/
│   ├── social/
│   ├── ranks/
│   ├── missions/
│   ├── leaderboard/
│   └── api/
│
├── notifications/             [COPIAR COMPLETO] - 5 archivos
│   ├── components/
│   ├── hooks/
│   ├── store/
│   └── index.ts
│
└── progress/                  [COPIAR COMPLETO] - 6 archivos
    ├── api/
    └── examples/
```

#### 4. Componentes Compartidos
```
src/shared/                    [COPIAR COMPLETO]
├── components/               - 150+ componentes
│   ├── base/
│   ├── layout/
│   ├── exercises/
│   ├── media/
│   ├── celebrations/
│   ├── timeline/
│   ├── common/
│   ├── mechanics/
│   └── specialized/
├── hooks/                    - Custom hooks
├── utils/                    - Utilidades
├── factories/                - Patrones factory
├── styles/                   - Estilos globales
└── types/                    - Tipos compartidos
```

#### 5. Servicios Centralizados
```
src/services/                 [COPIAR COMPLETO]
├── api/                      - Capa API
│   ├── apiClient.ts
│   ├── apiConfig.ts
│   ├── apiErrorHandler.ts
│   ├── apiInterceptors.ts
│   ├── educationalAPI.ts
│   ├── missionsAPI.ts
│   └── notificationsAPI.ts
└── NotificationService.ts
```

#### 6. Aplicaciones por Rol
```
src/apps/                     [COPIAR COMPLETO]
├── student/                  - 33+ páginas
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── __tests__/
│
├── teacher/                  - 13+ páginas
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   ├── layouts/
│   └── types/
│
└── admin/                    - Páginas admin
    ├── pages/
    ├── components/
    ├── hooks/
    ├── layouts/
    └── types/
```

#### 7. Carpeta Pública
```
public/                       [COPIAR CONTENIDO]
└── [Archivos estáticos]
```

---

## CHECKLIST DE MIGRACIÓN

### FASE 1: Preparación (ANTES de copiar)

- [ ] Crear directorio `/home/isem/workspace/workspace-gamilit/projects/gamilit/`
- [ ] Crear subdirectorio `gamilit/src/`
- [ ] Verificar espacio disco disponible (~500MB)
- [ ] Tener backup de proyecto origen

### FASE 2: Archivos de Configuración

- [ ] Copiar `package.json`
- [ ] Copiar `package-lock.json`
- [ ] Copiar `vite.config.ts`
- [ ] Copiar `tsconfig.json`
- [ ] Copiar `tailwind.config.js`
- [ ] Copiar `.eslintrc.json`
- [ ] Copiar `.env.example`
- [ ] Crear `.env` con variables propias

### FASE 3: Código Fuente Base

- [ ] Copiar `src/main.tsx`
- [ ] Copiar `src/App.tsx`
- [ ] Copiar `src/vite-env.d.ts`
- [ ] Copiar `index.html`

### FASE 4: Features Críticas

**Orden de Prioridad:**
1. [ ] `src/features/auth/` - SIN ESTO NO FUNCIONA
2. [ ] `src/features/mechanics/` - Núcleo educativo
3. [ ] `src/features/gamification/` - Sistema gamificación
4. [ ] `src/features/notifications/` - Real-time
5. [ ] `src/features/progress/` - Tracking

### FASE 5: Capas Compartidas

- [ ] `src/shared/components/` - Librería UI
- [ ] `src/shared/hooks/` - Custom hooks
- [ ] `src/shared/utils/` - Utilidades
- [ ] `src/shared/styles/` - Estilos globales
- [ ] `src/shared/types/` - Tipos compartidos
- [ ] `src/shared/factories/` - Patrones factory

### FASE 6: Servicios

- [ ] `src/services/api/` - Capa API
- [ ] `src/services/NotificationService.ts`

### FASE 7: Aplicaciones por Rol

- [ ] `src/apps/student/` - Interface estudiante
- [ ] `src/apps/teacher/` - Interface profesor
- [ ] `src/apps/admin/` - Interface admin

### FASE 8: Activos y Documentación

- [ ] `public/` - Archivos estáticos
- [ ] `README.md` - Documentación
- [ ] `Dockerfile` - Containerización

### FASE 9: Instalación y Testing

- [ ] `npm install` en nuevo proyecto
- [ ] `npm run type-check` - Validar tipos
- [ ] `npm run dev` - Verificar desarrollo
- [ ] `npm run build` - Verificar build

### FASE 10: Validación Final

- [ ] Todas las rutas funcionan
- [ ] Autenticación funcional
- [ ] Ejercicios cargan
- [ ] Gamificación activa
- [ ] WebSocket conecta
- [ ] No hay errores de tipos

---

## DISTRIBUCIÓN DE ARCHIVOS

### Por Tamaño Aproximado:

| Carpeta | Archivos | Tamaño Est. | Prioridad |
|---------|----------|-----------|-----------|
| `mechanics/` | 150+ | ~200MB | **Crítica** |
| `gamification/` | 120+ | ~150MB | **Crítica** |
| `shared/components/` | 100+ | ~100MB | **Alta** |
| `auth/` | 30 | ~40MB | **Crítica** |
| `apps/student/` | 50+ | ~60MB | **Alta** |
| `apps/teacher/` | 40+ | ~50MB | **Alta** |
| `services/api/` | 10 | ~15MB | **Crítica** |
| Otros features | 30 | ~40MB | **Media** |
| `public/` | 5-20 | ~5MB | **Baja** |
| **TOTAL** | **600+** | **~650MB** | |

---

## ARCHIVOS CRÍTICOS FALTANTES

### Máxima Prioridad - Sin estos NO FUNCIONA:

| Archivo | Ruta | Propósito | Consecuencia Si Falta |
|---------|------|----------|----------------------|
| `main.tsx` | `src/main.tsx` | Punto entrada React | App no inicia |
| `App.tsx` | `src/App.tsx` | Router principal | No hay rutas |
| `AuthProvider.tsx` | `src/features/auth/providers/` | Proveedor autenticación | No hay auth |
| `authStore.ts` | `src/features/auth/store/` | Estado autenticación | Estado perdido |
| `ProtectedRoute.tsx` | `src/shared/components/` | Protección rutas | Acceso no autorizado |
| `package.json` | Raíz | Dependencias | npm install falla |

### Alta Prioridad - Necesarios para funcionalidad:

| Archivo | Ruta | Propósito |
|---------|------|----------|
| Ejercicios (33) | `src/features/mechanics/` | Núcleo educativo |
| Gamification (132) | `src/features/gamification/` | Sistema puntos/logros |
| Componentes base (150+) | `src/shared/components/` | UI consistente |
| API client | `src/services/api/` | Comunicación backend |
| Páginas (50+) | `src/apps/*/pages/` | Interfaces usuario |

---

## SCRIPTS NECESARIOS DESPUÉS DE MIGRACIÓN

### Instalación de Dependencias:
```bash
npm install
```
**Tiempo estimado:** 3-5 minutos

### Validación de Tipos:
```bash
npm run type-check
```
**Tiempo estimado:** 1-2 minutos
**Resultado esperado:** 0 errores

### Tests:
```bash
npm test
```
**Tiempo estimado:** 2-3 minutos

### Build:
```bash
npm run build
```
**Tiempo estimado:** 2-3 minutos
**Resultado esperado:** ✅ Build exitoso

### Desarrollo:
```bash
npm run dev
```
**Tiempo estimado:** 30 segundos
**Resultado esperado:** http://localhost:5173

---

## DECISIONES DE ARQUITECTURA

### Patrones Mantenidos:
1. ✅ Feature-Sliced Design
2. ✅ Custom Hooks para lógica reutilizable
3. ✅ Zustand para state management
4. ✅ Zod para validación schemas
5. ✅ Protected Routes por rol
6. ✅ Lazy loading con Suspense
7. ✅ API layer centralizada

### Convenciones de Código:
- ✅ Nombres componentes en PascalCase
- ✅ Nombres funciones en camelCase
- ✅ Tipos sufijo `Types.ts`
- ✅ Schemas sufijo `Schemas.ts`
- ✅ Mock data sufijo `MockData.ts`
- ✅ APIs sufijo `API.ts`
- ✅ Hooks prefijo `use`

---

## VARIABLES DE AMBIENTE NECESARIAS

### `.env.example` (requiere completar):
```
VITE_API_BASE_URL=http://localhost:3000
VITE_API_TIMEOUT=30000
VITE_ENABLE_WEBSOCKET=true
VITE_WEBSOCKET_URL=ws://localhost:3000
VITE_LOG_LEVEL=debug
VITE_ENABLE_MOCK_DATA=false
VITE_APP_NAME=GAMILIT
VITE_APP_VERSION=1.0.0
```

### Valores por Ambiente:
**Development:** `VITE_ENABLE_MOCK_DATA=true`
**Production:** `VITE_ENABLE_MOCK_DATA=false`

---

## DEPENDENCIAS PRINCIPALES

### Críticas (No remover):
- `react` 19.2.0 - Framework
- `react-router-dom` 7.9.4 - Routing
- `zustand` 5.0.8 - State
- `zod` 4.1.12 - Validación
- `axios` 1.12.2 - HTTP
- `tailwindcss` 4.1.14 - Estilos

### Importantes (Para gamificación):
- `react-confetti` 6.4.0 - Celebraciones
- `socket.io-client` 4.8.1 - Real-time
- `recharts` 3.3.0 - Gráficos
- `framer-motion` 12.23.24 - Animaciones

### Seguridad:
- `dompurify` 3.3.0 - Sanitización HTML

---

## VERIFICACIÓN POST-MIGRACIÓN

### Checklist Funcionalidad:

#### Login/Registro
- [ ] Página login carga
- [ ] Validación de formulario
- [ ] API login responde
- [ ] Token guardado en store
- [ ] Redirección a dashboard

#### Dashboard Estudiante
- [ ] Dashboard carga
- [ ] Módulos visibles
- [ ] Widgets gamificación cargan
- [ ] Notificaciones conectan (WebSocket)

#### Ejercicios
- [ ] Módulos cargan
- [ ] Ejercicios accesibles
- [ ] Ejercicio se renderiza
- [ ] Feedback funciona
- [ ] Puntos se graban

#### Gamificación
- [ ] Shop carga
- [ ] Wallet muestra saldo
- [ ] Inventory funciona
- [ ] Leaderboard actualiza
- [ ] Achievements se otorgan

#### Admin/Teacher
- [ ] Pages cargan
- [ ] Datos mostrados
- [ ] Acciones disponibles

#### Real-time
- [ ] WebSocket conecta al login
- [ ] Notificaciones recibidas
- [ ] Desconexión limpia

---

## CONSIDERACIONES ESPECIALES

### Configuración Backend:
- Requiere API corriendo en `VITE_API_BASE_URL`
- Endpoints esperados en `src/features/*/api/`
- WebSocket en `VITE_WEBSOCKET_URL`

### Performance:
- 606 archivos TypeScript = ~10-15MB
- Build time esperado: 2-3 minutos
- Dev server startup: ~30 segundos
- Bundle size (gzipped): ~300KB

### Seguridad:
- Token JWT almacenado en sessionStorage (AuthStore)
- HTML sanitizado con DOMPurify
- CORS configurado en backend

---

## PRÓXIMOS PASOS

1. **Copiar estructura** del origen al destino
2. **Instalar dependencias** con `npm install`
3. **Validar tipos** con `npm run type-check`
4. **Ejecutar dev** con `npm run dev`
5. **Verificar rutas** principales funcionan
6. **Probar autenticación** end-to-end
7. **Verificar WebSocket** conecta
8. **Build para producción** y probar

---

## RESUMEN

**Proyecto Origen:** 606 archivos TypeScript, Feature-Sliced Design, completamente funcional
**Proyecto Destino:** A crear desde cero
**Tiempo Estimado:** 20-30 minutos (copia) + 10 minutos (npm install) + 5 minutos (validación) = ~45 minutos total
**Riesgo:** Bajo (migración directa, sin cambios de código)
**Complejidad:** Media (múltiples features interdependientes)
